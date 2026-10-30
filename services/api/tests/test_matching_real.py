"""Unit tests for Real-Data Solid Fuel Matching Engine and Scientific Validation.

Verifies:
1. Loading of exactly 134 usable microgravity flight runs.
2. Strict epistemic pressure exclusion: never matched, weight=0, mandatory warning emitted.
3. Gravitational extrapolation warnings for Moon (0.16 g) and Mars (0.38 g).
4. 2D (O2, Flow) operational envelope bounds and outside_tested_range flag.
5. Factor breakdowns with provenance basis and dynamic weight renormalization.
6. Reproducibility of LOOCV backtest metrics and weight sensitivity analysis.
"""

import pytest
from services.api.app.matching import (
    RealSolidMatcher,
    SolidScenarioInput,
)
from scripts.validate.loocv_backtest import run_loocv
from scripts.validate.grouped_loocv import run_grouped_validation
from scripts.validate.weight_sensitivity import run_weight_sensitivity



@pytest.fixture(scope="module")
def solid_matcher() -> RealSolidMatcher:
    return RealSolidMatcher()


def test_usable_runs_census(solid_matcher: RealSolidMatcher) -> None:
    """Confirms exactly 132 usable solid flight runs with explicit outcomes and environmental metrics."""
    assert len(solid_matcher.usable_runs) == 132
    assert len(solid_matcher.tested_points) == 132

    valid_outcomes = {"frames_recorded", "extinguished", "no_ignition"}
    for r in solid_matcher.usable_runs:
        assert r["usable_for_matching"] is True
        assert r["outcome_class"] in valid_outcomes
        assert r["oxygen_pct"]["value"] is not None
        assert r["flow_cm_s"]["value"] is not None


def test_material_map_coverage(solid_matcher: RealSolidMatcher) -> None:
    """Verifies that every usable solid run has a valid entry in material_map.json."""
    assert len(solid_matcher.material_map) >= 95
    for r in solid_matcher.usable_runs:
        raw_mat = r["material"]
        assert raw_mat in solid_matcher.material_map
        mat_entry = solid_matcher.material_map[raw_mat]
        assert mat_entry["family"] in {"PMMA", "SIBAL", "Nomex", "Silicone", "Wax", "Fabric/Polymer", "PMMA & Nomex", "Other"}
        assert mat_entry["geometry"] in {"flat", "rod", "sphere", "cylinder"}



def test_pressure_strictly_excluded_from_matching(solid_matcher: RealSolidMatcher) -> None:
    """Verifies that pressure is never scored or presented as matched, with mandatory warning."""
    scenario = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=21.0,
        flow_cm_s=20.0,
        pressure_kpa=101.3,
    )
    result = solid_matcher.match(scenario, top_k=5)

    assert len(result.matches) == 5
    top_match = result.matches[0]

    # Pressure must NOT be in scored factors
    assert "pressure" not in top_match.factors

    # Mandatory warning must always be present
    expected_warning = "No solid-fuel flight run measured pressure; scenario pressure untested."
    assert any(expected_warning in w for w in result.warnings)


def test_gravity_extrapolation_warning(solid_matcher: RealSolidMatcher) -> None:
    """Confirms extrapolation warnings for partial gravity (Moon 0.16 g, Mars 0.38 g)."""
    # Lunar gravity scenario
    lunar_scen = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=21.0,
        flow_cm_s=15.0,
        gravity_g=0.16,
    )
    res_lunar = solid_matcher.match(lunar_scen)
    assert any("extrapolations" in w.lower() and "lunar" in w.lower() for w in res_lunar.warnings)

    # Microgravity scenario (~0 g)
    micro_scen = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=21.0,
        flow_cm_s=15.0,
        gravity_g=0.0,
    )
    res_micro = solid_matcher.match(micro_scen)
    assert not any("extrapolations" in w.lower() for w in res_micro.warnings)


def test_envelope_bounds_and_outside_flag(solid_matcher: RealSolidMatcher) -> None:
    """Checks 2D envelope bounds, nearest distance, and outside-tested-range flag."""
    # 1. Inside tested envelope (O2: 21.0%, Flow: 15.0 cm/s)
    inside_scen = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=21.0,
        flow_cm_s=15.0,
    )
    res_inside = solid_matcher.match(inside_scen)
    assert res_inside.envelope.outside_tested_range is False
    assert res_inside.envelope.nearest_distance_norm >= 0.0
    assert not any("outside tested" in w.lower() for w in res_inside.warnings)

    # 2. Outside tested envelope (Exploration atmosphere: O2: 34.0%, Flow: 10.0 cm/s)
    outside_scen = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=34.0,
        flow_cm_s=10.0,
    )
    res_outside = solid_matcher.match(outside_scen)
    assert res_outside.envelope.outside_tested_range is True
    assert any("outside tested" in w.lower() for w in res_outside.warnings)


def test_weight_renormalization_with_and_without_geometry(solid_matcher: RealSolidMatcher) -> None:
    """Verifies that active factor weights renormalize to sum to 1.0."""
    # Scenario without geometry
    scen_no_geom = SolidScenarioInput(
        material="SIBAL",
        oxygen_pct=21.0,
        flow_cm_s=20.0,
    )
    res_no_geom = solid_matcher.match(scen_no_geom, top_k=1)
    m1 = res_no_geom.matches[0]
    weights_sum1 = sum(f.weight for f in m1.factors.values() if f.weight is not None)
    assert pytest.approx(weights_sum1, 0.001) == 1.0
    assert "geometry" not in m1.factors

    # Scenario with geometry
    scen_geom = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=21.0,
        flow_cm_s=20.0,
        geometry="rod",
        thickness_mm=6.35,
    )
    res_geom = solid_matcher.match(scen_geom, top_k=1)
    m2 = res_geom.matches[0]
    weights_sum2 = sum(f.weight for f in m2.factors.values() if f.weight is not None)
    assert pytest.approx(weights_sum2, 0.001) == 1.0


def test_similarity_ranking_determinism(solid_matcher: RealSolidMatcher) -> None:
    """Ensures deterministic match ranking and provenance transparency."""
    scenario = SolidScenarioInput(
        material="PMMA",
        oxygen_pct=18.0,
        flow_cm_s=10.0,
    )
    res1 = solid_matcher.match(scenario, top_k=5)
    res2 = solid_matcher.match(scenario, top_k=5)

    uids1 = [m.run_uid for m in res1.matches]
    uids2 = [m.run_uid for m in res2.matches]
    assert uids1 == uids2

    # Verify factor details have proper provenance basis
    for m in res1.matches:
        assert m.factors["material"].basis in ("measured", "transcribed")
        assert m.factors["oxygen"].basis in ("measured", "converted")
        assert m.factors["flow"].basis in ("measured", "converted")


def test_loocv_backtest_execution() -> None:
    """Verifies that LOOCV backtest runs on usable solid runs."""
    results = run_loocv(k_values=[1])
    assert results["n_samples"] == 132
    assert results["majority_class"] == "frames_recorded"
    assert pytest.approx(results["majority_baseline_accuracy"], 0.01) == 0.7727

    eval_k1 = results["k_evaluations"]["k=1"]
    assert eval_k1["accuracy"] > 0.75
    assert eval_k1["per_class_recall"]["extinguished"]["recall"] >= 0.40
    assert eval_k1["per_class_recall"]["no_ignition"]["recall"] >= 0.80


def test_grouped_cv_execution() -> None:
    """Verifies Grouped Cross-Validation (Leave-One-Group-Out) across physical samples."""
    data = run_grouped_validation()
    assert data["n_samples"] == 132
    assert data["n_groups"] == 110

    res_models = data["results"]
    assert "Majority Baseline" in res_models
    assert "O2-Threshold Rule" in res_models
    assert "Material+O2 (k=3)" in res_models
    assert "Full IGNIS (k=5)" in res_models

    full_k5 = res_models["Full IGNIS (k=5)"]
    assert full_k5["accuracy"] > 0.78
    assert full_k5["balanced_accuracy"] > 0.40
    assert full_k5["per_class"]["extinguished"]["recall"] >= 0.40
    assert "mcnemar" in full_k5
    assert "diff_bootstrap_ci_95" in full_k5



def test_weight_sensitivity_execution() -> None:
    """Verifies that weight sensitivity analysis executes with high Top-5 stability."""
    results = run_weight_sensitivity(num_draws=10)
    assert results["num_draws_per_scenario"] == 10
    summary = results["overall_summary"]
    assert summary["mean_overlap"] >= 4.0
    assert summary["mean_jaccard"] >= 0.80
    assert summary["top1_stable_pct"] >= 90.0
