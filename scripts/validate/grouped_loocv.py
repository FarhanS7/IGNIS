"""Grouped Cross-Validation (Leave-One-Group-Out) for Microgravity Solid Combustion.

Evaluates Full IGNIS Matcher vs 3 Baselines:
1. Naive Majority Baseline (predicts most frequent class in training fold)
2. Single-Feature O2-Threshold Rule (fitted dynamically within each training fold)
3. Material + O2 Only Model (weights: material=0.55, oxygen=0.45, flow=0.0, geometry=0.0)

Grouping Strategy:
Grouped strictly by physical sample hardware / test series to prevent data leakage from repeated burns
on the same specimen (e.g. Sample # in BASS-II, unique fuel samples in Saffire-I/II).

Evaluates:
- Overall accuracy, balanced accuracy, per-class recall (frames_recorded, extinguished, no_ignition)
- Paired bootstrap 95% CIs and McNemar test vs Majority Baseline
- Paired bootstrap 95% CIs for DIFFERENCE (Accuracy, Balanced Accuracy, Extinction Recall)
  between Full Matcher (k=5) and O2-Threshold Rule.
"""

from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any

import numpy as np

from services.api.app.matching.real_solid import RealSolidMatcher, SolidScenarioInput

ROOT = Path(__file__).resolve().parents[2]


def extract_group_id(run: dict[str, Any]) -> str:
    """Extracts physical hardware sample / test series group ID to prevent data leakage."""
    inv = run.get("investigation_id", "")
    mat = run.get("material") or "unknown"
    meta = run.get("metadata", {})

    if inv == "PSI-25":  # BASS-II
        sample_no = meta.get("sample_no", "").strip()
        if sample_no:
            return f"PSI-25-SAMPLE-{sample_no}"
        test_id = meta.get("test_id", "")
        m = re.match(r"^([A-Za-z]+)(\d+)", test_id)
        if m:
            return f"PSI-25-SERIES-{m.group(1)}{m.group(2)}"
        return f"PSI-25-TEST-{test_id}"

    elif inv in ["PSI-98", "PSI-99", "PSI-100"]:  # Saffire
        m = re.search(r"sample\s*(\d+)", mat, re.IGNORECASE)
        if m:
            return f"{inv}-SAMPLE-{m.group(1)}"
        test_id = meta.get("test_id", "")
        if test_id:
            return f"{inv}-TEST-{test_id}"
        return f"{inv}-{mat[:20]}"

    return f"{inv}-{mat[:20]}"


def wilson_score_interval(successes: int, total: int, confidence: float = 0.95) -> tuple[float, float]:
    """Calculates Wilson score interval for binomial proportion."""
    if total == 0:
        return (0.0, 0.0)
    z = 1.959963984540054  # 95% CI
    p = successes / total
    denom = 1.0 + (z**2 / total)
    centre = (p + (z**2 / (2 * total))) / denom
    spread = (z * math.sqrt((p * (1.0 - p) / total) + (z**2 / (4 * total**2)))) / denom
    return (max(0.0, round(centre - spread, 4)), min(1.0, round(centre + spread, 4)))


def paired_bootstrap_ci(
    y_true: list[str],
    preds_a: list[str],
    preds_b: list[str],
    n_bootstraps: int = 2000,
    seed: int = 42,
) -> tuple[float, float, float]:
    """Computes paired bootstrap 95% confidence interval for accuracy difference: Acc(A) - Acc(B)."""
    rng = np.random.default_rng(seed)
    n = len(y_true)
    y_true_arr = np.array(y_true)
    a_corr = (np.array(preds_a) == y_true_arr).astype(float)
    b_corr = (np.array(preds_b) == y_true_arr).astype(float)

    diffs = np.zeros(n_bootstraps)
    for i in range(n_bootstraps):
        idx = rng.integers(0, n, size=n)
        diffs[i] = np.mean(a_corr[idx]) - np.mean(b_corr[idx])

    obs_diff = float(np.mean(a_corr) - np.mean(b_corr))
    lower = float(np.percentile(diffs, 2.5))
    upper = float(np.percentile(diffs, 97.5))
    return round(obs_diff, 4), round(lower, 4), round(upper, 4)


def paired_bootstrap_multi_metric(
    y_true: list[str],
    preds_a: list[str],
    preds_b: list[str],
    n_bootstraps: int = 2000,
    seed: int = 42,
) -> dict[str, tuple[float, float, float]]:
    """Computes paired bootstrap 95% CI for Accuracy, Balanced Accuracy, and Extinction Recall differences."""
    rng = np.random.default_rng(seed)
    n = len(y_true)
    classes = sorted(list(set(y_true)))

    diff_acc = np.zeros(n_bootstraps)
    diff_bal = np.zeros(n_bootstraps)
    diff_ext = np.zeros(n_bootstraps)

    y_arr = np.array(y_true)
    pa_arr = np.array(preds_a)
    pb_arr = np.array(preds_b)

    # Observed metrics
    def calc_metrics(yt, yp):
        acc = np.mean(yp == yt)
        recalls = []
        for c in classes:
            mask = (yt == c)
            rec = np.mean(yp[mask] == c) if np.sum(mask) > 0 else 0.0
            recalls.append(rec)
        bacc = np.mean(recalls)
        ext_mask = (yt == "extinguished")
        ext_rec = np.mean(yp[ext_mask] == "extinguished") if np.sum(ext_mask) > 0 else 0.0
        return acc, bacc, ext_rec

    obs_acc_a, obs_bal_a, obs_ext_a = calc_metrics(y_arr, pa_arr)
    obs_acc_b, obs_bal_b, obs_ext_b = calc_metrics(y_arr, pb_arr)

    obs_diffs = {
        "accuracy": obs_acc_a - obs_acc_b,
        "balanced_accuracy": obs_bal_a - obs_bal_b,
        "extinction_recall": obs_ext_a - obs_ext_b,
    }

    for b in range(n_bootstraps):
        idx = rng.integers(0, n, size=n)
        b_yt = y_arr[idx]
        b_pa = pa_arr[idx]
        b_pb = pb_arr[idx]

        acc_a, bal_a, ext_a = calc_metrics(b_yt, b_pa)
        acc_b, bal_b, ext_b = calc_metrics(b_yt, b_pb)

        diff_acc[b] = acc_a - acc_b
        diff_bal[b] = bal_a - bal_b
        diff_ext[b] = ext_a - ext_b

    return {
        "accuracy": (
            round(obs_diffs["accuracy"], 4),
            round(float(np.percentile(diff_acc, 2.5)), 4),
            round(float(np.percentile(diff_acc, 97.5)), 4),
        ),
        "balanced_accuracy": (
            round(obs_diffs["balanced_accuracy"], 4),
            round(float(np.percentile(diff_bal, 2.5)), 4),
            round(float(np.percentile(diff_bal, 97.5)), 4),
        ),
        "extinction_recall": (
            round(obs_diffs["extinction_recall"], 4),
            round(float(np.percentile(diff_ext, 2.5)), 4),
            round(float(np.percentile(diff_ext, 97.5)), 4),
        ),
    }


def mcnemar_test(y_true: list[str], preds_a: list[str], preds_b: list[str]) -> dict[str, Any]:
    """Calculates McNemar exact binomial test comparing correctness of two models."""
    n = len(y_true)
    b = 0  # Model A correct, Model B incorrect
    c = 0  # Model A incorrect, Model B correct

    for i in range(n):
        corr_a = (preds_a[i] == y_true[i])
        corr_b = (preds_b[i] == y_true[i])
        if corr_a and not corr_b:
            b += 1
        elif not corr_a and corr_b:
            c += 1

    total_discordant = b + c
    if total_discordant == 0:
        p_val = 1.0
    else:
        k = min(b, c)
        p_val = 2.0 * sum(math.comb(total_discordant, i) * (0.5**total_discordant) for i in range(k + 1))
        p_val = min(1.0, p_val)

    return {
        "b_model_a_only": b,
        "c_model_b_only": c,
        "total_discordant": total_discordant,
        "p_value": round(p_val, 4),
        "significant_05": p_val < 0.05,
    }


def fit_o2_threshold_rule(train_runs: list[dict[str, Any]]) -> float:
    """Finds optimal O2 extinction threshold strictly on the training fold by grid search."""
    best_thresh = 14.5
    best_bacc = -1.0

    for cand in np.linspace(13.0, 20.0, 71):
        actuals = []
        preds = []
        for r in train_runs:
            o2 = r["oxygen_pct"]["value"]
            actual = r["outcome_class"]
            pred = "extinguished" if o2 <= cand else "frames_recorded"
            actuals.append(actual)
            preds.append(pred)

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

    run_groups = [extract_group_id(r) for r in usable_runs]
    unique_groups = sorted(list(set(run_groups)))
    n_groups = len(unique_groups)

    actual_classes = [r["outcome_class"] for r in usable_runs]
    class_counts = Counter(actual_classes)

    group_to_indices: dict[str, list[int]] = {}
    for idx, gid in enumerate(run_groups):
        group_to_indices.setdefault(gid, []).append(idx)

    preds_maj: list[str] = [""] * n_total
    preds_o2_rule: list[str] = [""] * n_total
    preds_mat_o2_k1: list[str] = [""] * n_total
    preds_mat_o2_k3: list[str] = [""] * n_total
    preds_full_k1: list[str] = [""] * n_total
    preds_full_k3: list[str] = [""] * n_total
    preds_full_k5: list[str] = [""] * n_total

    mat_o2_weights = {"material": 0.55, "oxygen": 0.45, "flow": 0.0, "geometry": 0.0}

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
            preds_o2_rule[ti] = "extinguished" if o2_val <= best_o2_thresh else "frames_recorded"

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

            res_mat_o2 = sub_matcher.match(scen, weights=mat_o2_weights, top_k=5)
            preds_mat_o2_k1[ti] = res_mat_o2.matches[0].outcome_class if res_mat_o2.matches else maj_class
            
            votes_mo3: dict[str, float] = {}
            for m in res_mat_o2.matches[:3]:
                votes_mo3[m.outcome_class] = votes_mo3.get(m.outcome_class, 0.0) + m.similarity
            preds_mat_o2_k3[ti] = max(votes_mo3.items(), key=lambda it: (it[1], it[0]))[0]

            res_full = sub_matcher.match(scen, top_k=5)
            preds_full_k1[ti] = res_full.matches[0].outcome_class if res_full.matches else maj_class

            votes_f3: dict[str, float] = {}
            for m in res_full.matches[:3]:
                votes_f3[m.outcome_class] = votes_f3.get(m.outcome_class, 0.0) + m.similarity
            preds_full_k3[ti] = max(votes_f3.items(), key=lambda it: (it[1], it[0]))[0]

            votes_f5: dict[str, float] = {}
            for m in res_full.matches[:5]:
                votes_f5[m.outcome_class] = votes_f5.get(m.outcome_class, 0.0) + m.similarity
            preds_full_k5[ti] = max(votes_f5.items(), key=lambda it: (it[1], it[0]))[0]

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

        bacc = sum(v["recall"] for v in per_class.values()) / len(per_class)

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

    # Paired comparisons specifically between Full IGNIS (k=5) and O2-Threshold Rule
    diff_vs_o2_rule = paired_bootstrap_multi_metric(actual_classes, preds_full_k5, preds_o2_rule)
    mcnemar_vs_o2 = mcnemar_test(actual_classes, preds_full_k5, preds_o2_rule)

    return {
        "n_samples": n_total,
        "n_groups": n_groups,
        "class_distribution": dict(class_counts),
        "results": eval_results,
        "k5_vs_o2_threshold_rule": {
            "metrics": diff_vs_o2_rule,
            "mcnemar": mcnemar_vs_o2,
        },
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
        frames = pc.get("frames_recorded", {}).get("recall", 0.0) * 100
        ext = pc.get("extinguished", {}).get("recall", 0.0) * 100
        noign = pc.get("no_ignition", {}).get("recall", 0.0) * 100
        print(f"  * {name:<20}: FramesRecorded={frames:>5.1f}%, Extinguished={ext:>5.1f}%, No-Ignition={noign:>5.1f}%")
    
    print("-" * 80)
    print("HEAD-TO-HEAD: FULL IGNIS (k=5) vs O2-THRESHOLD RULE:")
    comp = data["k5_vs_o2_threshold_rule"]
    m = comp["metrics"]
    acc_d, acc_l, acc_u = m["accuracy"]
    bal_d, bal_l, bal_u = m["balanced_accuracy"]
    ext_d, ext_l, ext_u = m["extinction_recall"]
    mcn = comp["mcnemar"]
    print(f"  * Accuracy Difference:          {acc_d*100:+.2f}% (95% CI: [{acc_l*100:+.2f}%, {acc_u*100:+.2f}%])")
    print(f"  * Balanced Accuracy Difference: {bal_d*100:+.2f}% (95% CI: [{bal_l*100:+.2f}%, {bal_u*100:+.2f}%])")
    print(f"  * Extinction Recall Difference: {ext_d*100:+.2f}% (95% CI: [{ext_l*100:+.2f}%, {ext_u*100:+.2f}%])")
    print(f"  * McNemar Test:                 Discordant={mcn['total_discordant']} (k5_only={mcn['b_model_a_only']}, o2_only={mcn['c_model_b_only']}), p = {mcn['p_value']:.4f}")
    print("=" * 80)


if __name__ == "__main__":
    out = run_grouped_validation()
    print_grouped_cv_report(out)
