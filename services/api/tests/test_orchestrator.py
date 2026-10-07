"""Unit tests for Eligibility Orchestrator (Task B1.6)."""

import uuid
from services.api.app.eligibility.orchestrator import evaluate_eligibility
from services.api.app.eligibility.models import ScenarioInput
from services.api.app.models.enums import (
    DataQuality,
    EligibilityStatus,
    FuelType,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)
from services.api.app.models.experiment import ExperimentBase, ExperimentRunBase


class TestEligibilityOrchestrator:
    def test_fully_eligible(self):
        source_id = uuid.uuid4()
        exp_id = uuid.uuid4()

        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
        )

        experiment = ExperimentBase(
            id=exp_id,
            source_id=source_id,
            experiment_family="BASS",
            title="Burning and Suppression of Solids",
            gravity_environment=GravityEnvironment.MICROGRAVITY,
            objectives=[ScientificObjective.FLAME_SPREAD],
        )

        run = ExperimentRunBase(
            experiment_id=exp_id,
            material=MaterialFamily.PMMA,
            fuel_type=FuelType.POLYMER,
            oxygen_pct=21.0,
            pressure_kpa=101.3,
            data_quality=DataQuality.HIGH,
        )

        result = evaluate_eligibility(scenario, experiment, run)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert len(result.reasons) >= 3
        assert len(result.warnings) == 0
        assert len(result.excluded_because) == 0

    def test_lunar_scenario_warning(self):
        source_id = uuid.uuid4()
        exp_id = uuid.uuid4()

        scenario = ScenarioInput(
            material=MaterialFamily.PMMA,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.PARTIAL_GRAVITY_LUNAR,
        )

        experiment = ExperimentBase(
            id=exp_id,
            source_id=source_id,
            experiment_family="BASS",
            title="Burning and Suppression of Solids",
            gravity_environment=GravityEnvironment.MICROGRAVITY,
            objectives=[ScientificObjective.FLAME_SPREAD],
        )

        run = ExperimentRunBase(
            experiment_id=exp_id,
            material=MaterialFamily.PMMA,
            oxygen_pct=21.0,
            data_quality=DataQuality.HIGH,
        )

        result = evaluate_eligibility(scenario, experiment, run)
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert any("Gravity environment differs" in w for w in result.warnings)
        assert len(result.excluded_because) == 0

    def test_incompatible_material_ineligible(self):
        source_id = uuid.uuid4()
        exp_id = uuid.uuid4()

        scenario = ScenarioInput(
            material=MaterialFamily.FABRIC_COTTON,
            objective=ScientificObjective.FLAME_SPREAD,
            gravity_environment=GravityEnvironment.MICROGRAVITY,
        )

        experiment = ExperimentBase(
            id=exp_id,
            source_id=source_id,
            experiment_family="FLEX",
            title="Flame Extinction Experiment",
            gravity_environment=GravityEnvironment.MICROGRAVITY,
            objectives=[ScientificObjective.FLAME_SPREAD],
        )

        run = ExperimentRunBase(
            experiment_id=exp_id,
            material=MaterialFamily.DROPLET_FUEL,
            fuel_type=FuelType.LIQUID,
            oxygen_pct=21.0,
            data_quality=DataQuality.HIGH,
        )

        result = evaluate_eligibility(scenario, experiment, run)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert any("Incompatible material family" in e for e in result.excluded_because)
