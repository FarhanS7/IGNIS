"""Leave-One-Out Cross-Validation (LOOCV) Backtest for Real Solid Matching Engine.

Hides each usable solid flight run (N=134) one at a time and predicts its
outcome_class ('sustained', 'extinguished', 'no_ignition') from the k-nearest
neighbors among the remaining 133 runs.

Evaluates:
- Overall accuracy across k in {1, 3, 5}
- Per-class recall (sustained, extinguished, no_ignition)
- Naive majority-class baseline comparison
- 95% Wilson score confidence intervals
- Small-sample caveats and limitations
"""

from __future__ import annotations

import json
import math
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.api.app.matching.real_solid import (

    RealSolidMatcher,
    SolidScenarioInput,
)


def wilson_score_interval(successes: int, total: int, confidence: float = 0.95) -> tuple[float, float]:
    """Calculates Wilson score interval for binomial proportions."""
    if total == 0:
        return 0.0, 0.0
    z = 1.95996  # 95% confidence
    p = successes / total
    denominator = 1.0 + (z**2 / total)
    centre_adjusted_probability = p + (z**2 / (2 * total))
    adjusted_standard_deviation = math.sqrt((p * (1 - p) + (z**2 / (4 * total))) / total)
    lower_bound = (centre_adjusted_probability - z * adjusted_standard_deviation) / denominator
    upper_bound = (centre_adjusted_probability + z * adjusted_standard_deviation) / denominator
    return round(max(0.0, lower_bound), 4), round(min(1.0, upper_bound), 4)


def run_loocv(
    runs_path: str | Path | None = None,
    k_values: list[int] | None = None,
) -> dict[str, Any]:
    """Executes Leave-One-Out Cross-Validation on all usable solid flight runs."""
    if k_values is None:
        k_values = [1, 3, 5]

    matcher = RealSolidMatcher(runs_path=runs_path)
    usable_runs = matcher.processed_runs
    n_total = len(usable_runs)

    # Class distribution
    actual_counts = Counter(r["outcome_class"] for r in usable_runs)
    majority_class, majority_count = actual_counts.most_common(1)[0]
    majority_baseline_acc = majority_count / n_total

    results: dict[str, Any] = {
        "n_samples": n_total,
        "class_distribution": dict(actual_counts),
        "majority_class": majority_class,
        "majority_baseline_accuracy": round(majority_baseline_acc, 4),
        "majority_baseline_ci": wilson_score_interval(majority_count, n_total),
        "k_evaluations": {},
    }

    for k in k_values:
        predictions: list[dict[str, Any]] = []
        correct_count = 0
        per_class_correct = Counter()

        for i, target in enumerate(usable_runs):
            # Create sub-matcher with run i hidden
            remaining = [r["raw"] for j, r in enumerate(usable_runs) if j != i]
            sub_matcher = RealSolidMatcher(runs=remaining)

            # Build scenario from target run
            target_raw = target["raw"]
            scenario = SolidScenarioInput(
                material=target["material"],
                oxygen_pct=target["o2"],
                flow_cm_s=target["flow"],
                geometry=target["shape"],
                thickness_mm=target["thickness_mm"],
            )

            # Match against remaining runs
            match_res = sub_matcher.match(scenario, top_k=k)
            top_k_matches = match_res.matches[:k]

            # Weighted majority vote by similarity
            votes: dict[str, float] = {}
            for m in top_k_matches:
                votes[m.outcome_class] = votes.get(m.outcome_class, 0.0) + m.similarity

            # Deterministic tie-breaking
            pred_class = max(votes.items(), key=lambda item: (item[1], item[0]))[0]
            actual_class = target["outcome_class"]

            is_correct = pred_class == actual_class
            if is_correct:
                correct_count += 1
                per_class_correct[actual_class] += 1

            predictions.append({
                "run_uid": target["run_uid"],
                "actual": actual_class,
                "predicted": pred_class,
                "is_correct": is_correct,
                "top_similarity": top_k_matches[0].similarity if top_k_matches else 0.0,
            })

        acc = correct_count / n_total
        acc_ci = wilson_score_interval(correct_count, n_total)

        per_class_recall: dict[str, dict[str, Any]] = {}
        for c, count in actual_counts.items():
            c_correct = per_class_correct[c]
            rec = c_correct / count if count > 0 else 0.0
            rec_ci = wilson_score_interval(c_correct, count)
            per_class_recall[c] = {
                "correct": c_correct,
                "total": count,
                "recall": round(rec, 4),
                "ci_95": rec_ci,
            }

        results["k_evaluations"][f"k={k}"] = {
            "accuracy": round(acc, 4),
            "accuracy_ci_95": acc_ci,
            "correct_count": correct_count,
            "per_class_recall": per_class_recall,
            "predictions": predictions,
        }

    return results


def print_loocv_summary(results: dict[str, Any]) -> None:
    """Prints a clean human-readable summary of the LOOCV backtest."""
    print("=" * 70)
    print("LEAVE-ONE-OUT CROSS-VALIDATION (LOOCV) BACKTEST REPORT")
    print("=" * 70)
    n = results["n_samples"]
    print(f"Total Usable Solid Flight Runs Evaluated: {n}")
    print("Actual Class Distribution:")
    for cls_name, cnt in results["class_distribution"].items():
        pct = (cnt / n) * 100
        print(f"  - {cls_name:<15}: {cnt:>3} runs ({pct:>5.1f}%)")

    maj_acc = results["majority_baseline_accuracy"] * 100
    maj_ci = [x * 100 for x in results["majority_baseline_ci"]]
    print(f"\nNaive Majority Baseline ('{results['majority_class']}'): {maj_acc:.2f}% (95% CI: [{maj_ci[0]:.1f}%, {maj_ci[1]:.1f}%])")
    print("-" * 70)

    for k_key, eval_data in results["k_evaluations"].items():
        k_acc = eval_data["accuracy"] * 100
        k_ci = [x * 100 for x in eval_data["accuracy_ci_95"]]
        diff = k_acc - maj_acc
        sign = "+" if diff >= 0 else ""
        print(f"{k_key:<6} | Overall Accuracy: {k_acc:.2f}% (95% CI: [{k_ci[0]:.1f}%, {k_ci[1]:.1f}%]) | vs Baseline: {sign}{diff:.2f}%")
        print("       Per-Class Recall:")
        for cls_name, rec_data in eval_data["per_class_recall"].items():
            r_pct = rec_data["recall"] * 100
            r_ci = [x * 100 for x in rec_data["ci_95"]]
            print(f"         * {cls_name:<14}: {r_pct:>5.1f}% ({rec_data['correct']:>2}/{rec_data['total']:>2}) [95% CI: {r_ci[0]:.1f}% - {r_ci[1]:.1f}%]")
        print("-" * 70)



if __name__ == "__main__":
    res = run_loocv()
    print_loocv_summary(res)
