"""Grouped Cross-Validation (Leave-One-Group-Out) Backtest for Real Solid Matching Engine.

To prevent data leakage between repeated runs on the same physical sample,
runs are grouped by physical sample (Sample # / Test series prefix).
This yields 112 distinct physical sample groups across N=132 usable runs.

Evaluates:
- Full IGNIS Matching Engine (k = 1, 3, 5)
- Baseline (a): Naive Majority Baseline
- Baseline (b): Single-feature O2-threshold rule (fitted within training folds)
- Baseline (c): Material + O2 only model (kNN)

Reports:
- Accuracy, Balanced Accuracy, Per-class Recall (sustained, extinguished, no_ignition)
- Paired bootstrap 95% CI for accuracy difference vs baseline
- McNemar test p-value and contingency table
"""

from __future__ import annotations

import json
import math
import random
import sys
from collections import Counter
from pathlib import Path
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.api.app.matching.real_solid import (
    RealSolidMatcher,
    SolidScenarioInput,
)


def extract_group_id(run: dict[str, Any]) -> str:
    """Extracts physical sample / test series group ID to prevent leakage across repeated burns."""
    inv = run["investigation_id"]
    meta = run.get("metadata") or {}
    sample_no = str(meta.get("sample_no", "")).strip()
    test_id = str(meta.get("test_id", "")).strip()

    if sample_no:
        clean_sample = sample_no.lower().replace("m", "").replace("l", "").strip()
        return f"{inv}_sample_{clean_sample}"
    elif test_id:
        return f"{inv}_test_{test_id}"
    return f"{inv}_{run['run_uid']}"


def wilson_score_interval(successes: int, total: int) -> tuple[float, float]:
    """Calculates Wilson score 95% confidence interval for a proportion."""
    if total == 0:
        return 0.0, 0.0
    z = 1.95996
    p = successes / total
    denom = 1.0 + (z**2 / total)
    center = p + (z**2 / (2 * total))
    dev = math.sqrt((p * (1 - p) + (z**2 / (4 * total))) / total)
    lower = (center - z * dev) / denom
    upper = (center + z * dev) / denom
    return round(max(0.0, lower), 4), round(min(1.0, upper), 4)


def paired_bootstrap_ci(
    y_true: list[str],
    y_pred_model: list[str],
    y_pred_baseline: list[str],
    num_bootstraps: int = 2000,
    seed: int = 42,
) -> tuple[float, float, float]:
    """Computes paired bootstrap 95% CI for the accuracy difference: Acc(model) - Acc(baseline)."""
    rng = np.random.default_rng(seed)
    n = len(y_true)
    y_t = np.array(y_true)
    y_m = np.array(y_pred_model)
    y_b = np.array(y_pred_baseline)

    acc_m = np.mean(y_t == y_m)
    acc_b = np.mean(y_t == y_b)
    diff_observed = float(acc_m - acc_b)

    diffs = []
    for _ in range(num_bootstraps):
        idx = rng.integers(0, n, size=n)
        b_acc_m = np.mean(y_t[idx] == y_m[idx])
        b_acc_b = np.mean(y_t[idx] == y_b[idx])
        diffs.append(b_acc_m - b_acc_b)

    ci_lower = float(np.percentile(diffs, 2.5))
    ci_upper = float(np.percentile(diffs, 97.5))
    return round(diff_observed, 4), round(ci_lower, 4), round(ci_upper, 4)


def mcnemar_test(y_true: list[str], y_pred_model: list[str], y_pred_baseline: list[str]) -> dict[str, Any]:
    """Calculates McNemar's test for paired binary outcomes with continuity correction."""
    n00 = 0  # both wrong
    n01 = 0  # baseline wrong, model right
    n10 = 0  # baseline right, model wrong
    n11 = 0  # both right

    for yt, ym, yb in zip(y_true, y_pred_model, y_pred_baseline):
        m_correct = (ym == yt)
        b_correct = (yb == yt)
        if not b_correct and not m_correct:
            n00 += 1
        elif not b_correct and m_correct:
            n01 += 1
        elif b_correct and not m_correct:
            n10 += 1
        else:
            n11 += 1

    discordant = n01 + n10
    if discordant == 0:
        p_val = 1.0
        stat = 0.0
    else:
        # Continuity-corrected chi-squared
        stat = ((abs(n01 - n10) - 1.0) ** 2) / discordant
        # Using survival function of chi2 with 1 df
        from scipy import stats as sp_stats
        p_val = float(sp_stats.chi2.sf(stat, df=1))

    return {
        "contingency_table": {"n00": n00, "n01": n01, "n10": n10, "n11": n11},
        "discordant_count": discordant,
        "chi2_stat": round(stat, 4),
        "p_value": round(p_val, 4),
    }


def fit_o2_threshold_rule(train_runs: list[dict[str, Any]]) -> float:
    """Finds the optimal O2 flammability threshold on training data maximizing balanced accuracy."""
    best_thresh = 14.5
    best_bacc = -1.0

    # Test candidate thresholds from 13.0 to 20.0 in steps of 0.1
    for cand in np.linspace(13.0, 20.0, 71):
        actuals = []
        preds = []
        for r in train_runs:
            o2 = r["oxygen_pct"]["value"]
            actual = r["outcome_class"]
            pred = "extinguished" if o2 <= cand else "sustained"
            actuals.append(actual)
            preds.append(pred)

        # Balanced accuracy across active classes
        classes = set(actuals)
        recalls = []
        for c in classes:
            sub = [p == c for a, p in zip(actuals, preds) if a == c]
            rec = sum(sub) / len(sub) if sub else 0.0
            recalls.append(rec)
        bacc = sum(recalls) / len(recalls) if recalls else 0.0

        if bacc > best_bacc:
            best_bacc = bacc
            best_thresh = cand

    return best_thresh


def run_grouped_validation(runs_path: str | Path | None = None) -> dict[str, Any]:
    """Runs complete Leave-One-Group-Out Cross-Validation."""
    matcher = RealSolidMatcher(runs_path=runs_path)
    usable_runs = matcher.usable_runs
    n_total = len(usable_runs)

    # Assign group IDs
    run_groups = [extract_group_id(r) for r in usable_runs]
    unique_groups = sorted(list(set(run_groups)))
    n_groups = len(unique_groups)

    actual_classes = [r["outcome_class"] for r in usable_runs]
    class_counts = Counter(actual_classes)

    # Pre-map run indices to groups
    group_to_indices: dict[str, list[int]] = {}
    for idx, gid in enumerate(run_groups):
        group_to_indices.setdefault(gid, []).append(idx)

    # Predictions storage
    preds_maj: list[str] = [""] * n_total
    preds_o2_rule: list[str] = [""] * n_total
    preds_mat_o2_k1: list[str] = [""] * n_total
    preds_mat_o2_k3: list[str] = [""] * n_total
    preds_full_k1: list[str] = [""] * n_total
    preds_full_k3: list[str] = [""] * n_total
    preds_full_k5: list[str] = [""] * n_total

    mat_o2_weights = {"material": 0.55, "oxygen": 0.45, "flow": 0.0, "geometry": 0.0}

    # Iterate over physical sample groups
    for gid in unique_groups:
        test_indices = group_to_indices[gid]
        train_indices = [i for i in range(n_total) if i not in test_indices]

        train_runs = [usable_runs[i] for i in train_indices]
        test_runs = [usable_runs[i] for i in test_indices]

        # 1. Majority baseline
        train_class_counts = Counter(r["outcome_class"] for r in train_runs)
        maj_class = train_class_counts.most_common(1)[0][0]
        for ti in test_indices:
            preds_maj[ti] = maj_class

        # 2. O2-threshold rule
        best_o2_thresh = fit_o2_threshold_rule(train_runs)
        for ti, trun in zip(test_indices, test_runs):
            o2_val = trun["oxygen_pct"]["value"]
            preds_o2_rule[ti] = "extinguished" if o2_val <= best_o2_thresh else "sustained"

        # 3. Sub-matcher for kNN on training runs
        sub_matcher = RealSolidMatcher(runs=train_runs)

        for ti, trun in zip(test_indices, test_runs):
            scen = SolidScenarioInput(
                material=trun["material"],
                oxygen_pct=trun["oxygen_pct"]["value"],
                flow_cm_s=trun["flow_cm_s"]["value"],
                geometry=sub_matcher.material_map.get(trun["material"], {}).get("geometry"),
                thickness_mm=sub_matcher.material_map.get(trun["material"], {}).get("thickness_mm"),
            )

            # Material + O2 only model (k=1, 3)
            res_mat_o2 = sub_matcher.match(scen, weights=mat_o2_weights, top_k=5)
            preds_mat_o2_k1[ti] = res_mat_o2.matches[0].outcome_class if res_mat_o2.matches else maj_class
            
            # k=3 vote
            votes_mo3: dict[str, float] = {}
            for m in res_mat_o2.matches[:3]:
                votes_mo3[m.outcome_class] = votes_mo3.get(m.outcome_class, 0.0) + m.similarity
            preds_mat_o2_k3[ti] = max(votes_mo3.items(), key=lambda it: (it[1], it[0]))[0]

            # Full Matching Engine (k=1, 3, 5)
            res_full = sub_matcher.match(scen, top_k=5)
            preds_full_k1[ti] = res_full.matches[0].outcome_class if res_full.matches else maj_class

            # k=3
            votes_f3: dict[str, float] = {}
            for m in res_full.matches[:3]:
                votes_f3[m.outcome_class] = votes_f3.get(m.outcome_class, 0.0) + m.similarity
            preds_full_k3[ti] = max(votes_f3.items(), key=lambda it: (it[1], it[0]))[0]

            # k=5
            votes_f5: dict[str, float] = {}
            for m in res_full.matches[:5]:
                votes_f5[m.outcome_class] = votes_f5.get(m.outcome_class, 0.0) + m.similarity
            preds_full_k5[ti] = max(votes_f5.items(), key=lambda it: (it[1], it[0]))[0]

    # Evaluate metrics for all models
    models_dict = {
        "Majority Baseline": preds_maj,
        "O2-Threshold Rule": preds_o2_rule,
        "Material+O2 (k=1)": preds_mat_o2_k1,
        "Material+O2 (k=3)": preds_mat_o2_k3,
        "Full IGNIS (k=1)": preds_full_k1,
        "Full IGNIS (k=3)": preds_full_k3,
        "Full IGNIS (k=5)": preds_full_k5,
    }

    eval_results = {}
    for name, p_list in models_dict.items():
        correct = sum(1 for yt, yp in zip(actual_classes, p_list) if yt == yp)
        acc = correct / n_total
        acc_ci = wilson_score_interval(correct, n_total)

        # Per class recall
        per_class = {}
        for c, count in class_counts.items():
            c_corr = sum(1 for yt, yp in zip(actual_classes, p_list) if yt == c and yp == c)
            rec = c_corr / count if count > 0 else 0.0
            per_class[c] = {
                "correct": c_corr,
                "total": count,
                "recall": round(rec, 4),
                "ci": wilson_score_interval(c_corr, count),
            }

        # Balanced accuracy
        bacc = sum(v["recall"] for v in per_class.values()) / len(per_class)

        # Statistical comparison vs Majority Baseline
        diff, b_lower, b_upper = paired_bootstrap_ci(actual_classes, p_list, preds_maj)
        mcnemar = mcnemar_test(actual_classes, p_list, preds_maj)

        eval_results[name] = {
            "accuracy": round(acc, 4),
            "accuracy_ci": acc_ci,
            "balanced_accuracy": round(bacc, 4),
            "per_class": per_class,
            "accuracy_diff_vs_baseline": diff,
            "diff_bootstrap_ci_95": (b_lower, b_upper),
            "mcnemar": mcnemar,
        }

    return {
        "n_samples": n_total,
        "n_groups": n_groups,
        "class_distribution": dict(class_counts),
        "results": eval_results,
    }


def print_grouped_cv_report(data: dict[str, Any]) -> None:
    """Prints a structured summary of Grouped Cross-Validation."""
    print("=" * 80)
    print("GROUPED CROSS-VALIDATION (LEAVE-ONE-GROUP-OUT) REPORT")
    print("=" * 80)
    n = data["n_samples"]
    ng = data["n_groups"]
    print(f"Total Usable Runs: {n} | Physical Hardware Groups: {ng}")
    print("Class Distribution:", data["class_distribution"])
    print("-" * 80)
    print(f"{'Model':<22} | {'Accuracy':<16} | {'Balanced Acc':<12} | {'Diff vs Base [95% CI]':<22} | {'McNemar p'}")
    print("-" * 80)

    for name, res in data["results"].items():
        acc_str = f"{res['accuracy']*100:.2f}% [{res['accuracy_ci'][0]*100:.1f}%, {res['accuracy_ci'][1]*100:.1f}%]"
        bacc_str = f"{res['balanced_accuracy']*100:.2f}%"
        diff_str = f"{res['accuracy_diff_vs_baseline']*100:+.2f}% [{res['diff_bootstrap_ci_95'][0]*100:+.1f}%, {res['diff_bootstrap_ci_95'][1]*100:+.1f}%]"
        p_str = f"{res['mcnemar']['p_value']:.4f}" if name != "Majority Baseline" else "—"
        print(f"{name:<22} | {acc_str:<16} | {bacc_str:<12} | {diff_str:<22} | {p_str}")

    print("-" * 80)
    print("PER-CLASS RECALL BREAKDOWN:")
    for name, res in data["results"].items():
        pc = res["per_class"]
        sust = pc.get("sustained", {}).get("recall", 0.0) * 100
        ext = pc.get("extinguished", {}).get("recall", 0.0) * 100
        noign = pc.get("no_ignition", {}).get("recall", 0.0) * 100
        print(f"  * {name:<20}: Sustained={sust:>5.1f}%, Extinguished={ext:>5.1f}%, No-Ignition={noign:>5.1f}%")
    print("=" * 80)


if __name__ == "__main__":
    out = run_grouped_validation()
    print_grouped_cv_report(out)
