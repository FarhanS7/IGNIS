"""Unit tests for Match Orchestrator (Task B2.7)."""

from services.api.app.db.repository import get_repository
from services.api.app.eligibility.models import ScenarioInput
from services.api.app.matching.orchestrator import run_scenario_analysis
from services.api.app.models.enums import (
    ConfidenceLevel,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)


class TestMatchOrchestrator:
    def test_run_scenario_analysis_microgravity_pmma(self):
        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
            oxygen_pct=21.0,
            pressure_kpa=101.3,
            airflow_cm_s=5.0,
        )

        result = run_scenario_analysis(scenario)
        assert result.total_evaluated > 0
        assert result.eligible_count > 0
        assert result.excluded_count > 0  # Incompatible fuels excluded
        assert len(result.matches) == result.eligible_count

        # Check ranking is strictly descending
        scores = [m.similarity_score for m in result.matches]
        assert scores == sorted(scores, reverse=True)

        # Top match should have PMMA or thick solid
        top_match = result.matches[0]
        assert top_match.similarity_score > 0.5
        assert len(top_match.factor_explanations) > 0

    def test_run_scenario_analysis_lunar_gravity_capped(self):
        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.PARTIAL_GRAVITY_LUNAR,
            oxygen_pct=32.0,
            pressure_kpa=56.0,
        )

        result = run_scenario_analysis(scenario)
        assert result.eligible_count > 0
        # Since source data is microgravity and scenario is lunar, confidence must be capped at MEDIUM or LOW
        for match in result.matches:
            if match.experiment.gravity_environment == GravityEnvironment.MICROGRAVITY:
                assert match.confidence_level in {ConfidenceLevel.MEDIUM, ConfidenceLevel.LOW}

    def test_analysis_is_deterministic(self):
        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
        )

        res1 = run_scenario_analysis(scenario)
        res2 = run_scenario_analysis(scenario)

        assert res1.eligible_count == res2.eligible_count
        assert res1.excluded_count == res2.excluded_count
        run_ids_1 = [str(m.run.id) for m in res1.matches]
        run_ids_2 = [str(m.run.id) for m in res2.matches]
        assert run_ids_1 == run_ids_2
