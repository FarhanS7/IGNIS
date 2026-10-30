"""Weight Sensitivity Analysis for Real Solid Matching Engine.

Perturbs active factor weights by +/-50% over 200 random draws for representative
exploration scenarios (ISS, Gateway, Exploration Atmosphere, Quench boundary).
Reports how often the Top-5 and Top-1 ranked matches change, calculating:
- Exact Top-5 set preservation rate (%)
- Mean Jaccard similarity of Top-5
- Mean overlap count (out of 5)
- Top-1 match stability (%)
"""

from __future__ import annotations

import json
import random
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.api.app.matching.real_solid import (
    DEFAULT_WEIGHTS_WITHOUT_GEOMETRY,
    RealSolidMatcher,
    SolidScenarioInput,
)

CANONICAL_SCENARIOS = [
    {
        "id": "iss_pmma_std",
        "name": "ISS Standard Atmosphere (PMMA Rod/Sheet)",
        "scenario": SolidScenarioInput(
            material="PMMA",
            oxygen_pct=21.0,
            flow_cm_s=20.0,
            gravity_g=0.0,
        ),
    },
    {
        "id": "iss_sibal_lowflow",
        "name": "ISS Cabin Low-Flow Quench Risk (SIBAL Fabric)",
        "scenario": SolidScenarioInput(
            material="SIBAL",
            oxygen_pct=21.0,
            flow_cm_s=5.0,
            gravity_g=0.0,
        ),
    },
    {
        "id": "exploration_atm_pmma",
        "name": "Exploration Atmosphere 34% O2 (EVA Prep / Orion)",
        "scenario": SolidScenarioInput(
            material="PMMA",
            oxygen_pct=34.0,
            flow_cm_s=10.0,
            gravity_g=0.0,
        ),
    },
    {
        "id": "gateway_nomex",
        "name": "Lunar Gateway Hab (Nomex Material)",
        "scenario": SolidScenarioInput(
            material="Nomex",
            oxygen_pct=21.0,
            flow_cm_s=15.0,
            gravity_g=0.16,
        ),
    },
    {
        "id": "hypoxic_quench_pmma",
        "name": "Hypoxic Flammability Boundary (PMMA 14.5% O2)",
        "scenario": SolidScenarioInput(
            material="PMMA",
            oxygen_pct=14.5,
            flow_cm_s=10.0,
            gravity_g=0.0,
        ),
    },
]


def run_weight_sensitivity(
    num_draws: int = 200,
    perturbation_pct: float = 0.50,
    seed: int = 42,
    runs_path: str | Path | None = None,
) -> dict[str, Any]:
    """Executes weight sensitivity Monte Carlo analysis across canonical scenarios."""
    rng = random.Random(seed)
    matcher = RealSolidMatcher(runs_path=runs_path)
    base_weights = dict(DEFAULT_WEIGHTS_WITHOUT_GEOMETRY)

    scenario_results: list[dict[str, Any]] = []
    all_jaccards: list[float] = []
    all_overlaps: list[int] = []
    all_top1_preserved: list[bool] = []
    all_top5_exact: list[bool] = []

    for item in CANONICAL_SCENARIOS:
        scen_id = item["id"]
        scen_name = item["name"]
        scenario = item["scenario"]

        # 1. Baseline Top-5 and Top-1
        base_res = matcher.match(scenario, weights=base_weights, top_k=5)
        base_top5_uids = [m.run_uid for m in base_res.matches]
        base_top5_set = set(base_top5_uids)
        base_top1_uid = base_top5_uids[0] if base_top5_uids else None

        draw_jaccards: list[float] = []
        draw_overlaps: list[int] = []
        draw_top1_preserved = 0
        draw_top5_exact = 0

        # 2. Monte Carlo draws with +/- 50% perturbation
        for _ in range(num_draws):
            perturbed_weights: dict[str, float] = {}
            for k, w in base_weights.items():
                delta = rng.uniform(-perturbation_pct, perturbation_pct)
                perturbed_weights[k] = max(0.01, w * (1.0 + delta))

            # Renormalize
            sum_w = sum(perturbed_weights.values())
            for k in perturbed_weights:
                perturbed_weights[k] /= sum_w

            pert_res = matcher.match(scenario, weights=perturbed_weights, top_k=5)
            pert_top5_uids = [m.run_uid for m in pert_res.matches]
            pert_top5_set = set(pert_top5_uids)
            pert_top1_uid = pert_top5_uids[0] if pert_top5_uids else None

            # Overlap and Jaccard
            intersection = len(base_top5_set & pert_top5_set)
            union = len(base_top5_set | pert_top5_set)
            jaccard = intersection / union if union > 0 else 1.0

            draw_jaccards.append(jaccard)
            draw_overlaps.append(intersection)
            all_jaccards.append(jaccard)
            all_overlaps.append(intersection)

            is_top1_same = pert_top1_uid == base_top1_uid
            is_top5_same = pert_top5_set == base_top5_set

            if is_top1_same:
                draw_top1_preserved += 1
            all_top1_preserved.append(is_top1_same)

            if is_top5_same:
                draw_top5_exact += 1
            all_top5_exact.append(is_top5_same)

        mean_jaccard = sum(draw_jaccards) / len(draw_jaccards)
        mean_overlap = sum(draw_overlaps) / len(draw_overlaps)
        top5_exact_pct = (draw_top5_exact / num_draws) * 100
        top1_stable_pct = (draw_top1_preserved / num_draws) * 100

        scenario_results.append({
            "scenario_id": scen_id,
            "scenario_name": scen_name,
            "baseline_top5": base_top5_uids,
            "mean_jaccard": round(mean_jaccard, 4),
            "mean_overlap": round(mean_overlap, 2),
            "top5_exact_pct": round(top5_exact_pct, 2),
            "top1_stable_pct": round(top1_stable_pct, 2),
        })

    total_draws = len(all_jaccards)
    overall_mean_jaccard = sum(all_jaccards) / total_draws
    overall_mean_overlap = sum(all_overlaps) / total_draws
    overall_top5_exact_pct = (sum(all_top5_exact) / total_draws) * 100
    overall_top1_stable_pct = (sum(all_top1_preserved) / total_draws) * 100

    return {
        "num_draws_per_scenario": num_draws,
        "perturbation_range": f"+/-{int(perturbation_pct * 100)}%",
        "random_seed": seed,
        "base_weights": base_weights,
        "overall_summary": {
            "mean_jaccard": round(overall_mean_jaccard, 4),
            "mean_overlap": round(overall_mean_overlap, 2),
            "top5_exact_pct": round(overall_top5_exact_pct, 2),
            "top5_changed_pct": round(100.0 - overall_top5_exact_pct, 2),
            "top1_stable_pct": round(overall_top1_stable_pct, 2),
        },
        "scenarios": scenario_results,
    }


def print_weight_sensitivity_summary(results: dict[str, Any]) -> None:
    """Prints a clean human-readable summary of the weight sensitivity analysis."""
    print("=" * 75)
    print(f"WEIGHT SENSITIVITY ANALYSIS REPORT ({results['perturbation_range']} over {results['num_draws_per_scenario']} draws/scenario)")
    print("=" * 75)
    base_w = results["base_weights"]
    print(f"Base Weights: Material={base_w['material']}, Oxygen={base_w['oxygen']}, Flow={base_w['flow']}")
    print("-" * 75)
    print(f"{'Scenario':<42} | {'Top-5 Exact':<11} | {'Mean Overlap':<12} | {'Top-1 Match'}")
    print("-" * 75)
    for sc in results["scenarios"]:
        name = sc["scenario_name"][:40]
        t5 = f"{sc['top5_exact_pct']:.1f}%"
        ov = f"{sc['mean_overlap']:.2f} / 5"
        t1 = f"{sc['top1_stable_pct']:.1f}%"
        print(f"{name:<42} | {t5:<11} | {ov:<12} | {t1}")
    print("-" * 75)
    ov_all = results["overall_summary"]
    print(f"OVERALL SUMMARY across {len(results['scenarios']) * results['num_draws_per_scenario']} evaluations:")
    print(f"  * Top-5 Matches Exact Set Retention : {ov_all['top5_exact_pct']:.1f}% (changed: {ov_all['top5_changed_pct']:.1f}%)")
    print(f"  * Average Top-5 Runs Preserved      : {ov_all['mean_overlap']:.2f} of 5 (Mean Jaccard: {ov_all['mean_jaccard']:.3f})")
    print(f"  * Top-1 Ranked Match Stability      : {ov_all['top1_stable_pct']:.1f}%")
    print("=" * 75)


if __name__ == "__main__":
    res = run_weight_sensitivity()
    print_weight_sensitivity_summary(res)
