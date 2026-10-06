"""Eligibility Integration Tests against canonical fixture data (Task B1.7 | PRD v1.1 §29 AT-02, AT-03)."""

import pytest

from services.api.app.db.repository import get_repository
from services.api.app.eligibility import ScenarioInput, evaluate_eligibility
from services.api.app.models.enums import (
    DataQuality,
    EligibilityStatus,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)
from services.api.app.models.experiment import ExperimentRunBase


class TestEligibilityIntegration:
    @pytest.fixture(autouse=True)
    def setup_repo(self):
        self.repo = get_repository()
        self.experiments = self.repo.list_experiments(limit=100)
        assert len(self.experiments) > 0

    def test_at_02_numerically_similar_incompatible_fuel_ineligible(self):
        """AT-02: Target scenario with cotton fabric tested against droplet fuel (FLEX) experiment.
        Even if environmental parameters (oxygen 21%, pressure 101.3 kPa) align numerically,
        incompatible fuel phase must trigger INELIGIBLE status.
        """
        # Find FLEX experiment
        flex_exp = next((e for e in self.experiments if "FLEX" in e.experiment_family), None)
        assert flex_exp is not None, "FLEX experiment fixture not found"

        flex_runs = self.repo.list_experiment_runs(flex_exp.id)
        assert len(flex_runs) > 0
        flex_run = flex_runs[0]

        # Scenario targeting fabric cotton flame spread
        scenario = ScenarioInput(
            material=MaterialFamily.FABRIC_COTTON,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
            oxygen_pct=flex_run.oxygen_pct or 21.0,
            pressure_kpa=flex_run.pressure_kpa or 101.3,
        )

        result = evaluate_eligibility(scenario, flex_exp, flex_run)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert len(result.excluded_because) > 0
        assert any("Incompatible" in reason for reason in result.excluded_because)

    def test_at_03_moon_scenario_microgravity_warning(self):
        """AT-03: Lunar habitat scenario tested against microgravity PMMA experiment (BASS-II).
        Material and objective match, but gravitational disparity produces
        ELIGIBLE_WITH_WARNING with the canonical gravity mismatch warning.
        """
        # Find BASS experiment that includes flame_spread
        bass_exp = next(
            (e for e in self.experiments if "BASS" in e.experiment_family and ScientificObjective.FLAME_SPREAD in e.objectives),
            None,
        )
        assert bass_exp is not None, "BASS flame_spread experiment fixture not found"

        bass_runs = self.repo.list_experiment_runs(bass_exp.id)
        assert len(bass_runs) > 0
        pmma_run = next((r for r in bass_runs if r.material == MaterialFamily.PMMA), bass_runs[0])

        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.PARTIAL_GRAVITY_LUNAR,
            oxygen_pct=pmma_run.oxygen_pct or 21.0,
            pressure_kpa=pmma_run.pressure_kpa or 101.3,
        )

        result = evaluate_eligibility(scenario, bass_exp, pmma_run)
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert len(result.excluded_because) == 0
        assert any("Gravity environment differs from the source experiment; transferability is uncertain." in w for w in result.warnings)

    def test_exact_match_scenario_eligible(self):
        """Exact match scenario in microgravity matching BASS-II flame spread run -> ELIGIBLE."""
        bass_exp = next(
            (e for e in self.experiments if "BASS" in e.experiment_family and ScientificObjective.FLAME_SPREAD in e.objectives),
            None,
        )
        assert bass_exp is not None

        bass_runs = self.repo.list_experiment_runs(bass_exp.id)
        pmma_run = next((r for r in bass_runs if r.material == MaterialFamily.PMMA), bass_runs[0])

        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
            oxygen_pct=pmma_run.oxygen_pct,
            pressure_kpa=pmma_run.pressure_kpa,
        )

        result = evaluate_eligibility(scenario, bass_exp, pmma_run)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert len(result.reasons) >= 3
        assert len(result.warnings) == 0
        assert len(result.excluded_because) == 0

    def test_empty_experiment_run_ineligible(self):
        """Run with no recorded physical or environmental parameters -> INELIGIBLE."""
        bass_exp = self.experiments[0]
        empty_run = ExperimentRunBase(
            experiment_id=bass_exp.id,
            run_label="Blank run",
        )

        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
        )

        result = evaluate_eligibility(scenario, bass_exp, empty_run)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert any("zero comparable environmental factors" in exc for exc in result.excluded_because)

    def test_low_quality_data_warning(self):
        """Run with low quality data rating -> ELIGIBLE_WITH_WARNING."""
        bass_exp = next(
            (e for e in self.experiments if "BASS" in e.experiment_family and ScientificObjective.FLAME_SPREAD in e.objectives),
            None,
        )
        assert bass_exp is not None

        low_qual_run = ExperimentRunBase(
            experiment_id=bass_exp.id,
            material=MaterialFamily.PMMA,
            oxygen_pct=21.0,
            data_quality=DataQuality.LOW,
        )

        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
        )

        result = evaluate_eligibility(scenario, bass_exp, low_qual_run)
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert any("Low data quality" in w for w in result.warnings)
