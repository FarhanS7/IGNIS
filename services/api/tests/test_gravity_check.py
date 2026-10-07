"""Unit tests for Gravity Environment Compatibility Check (Task B1.3)."""

from services.api.app.eligibility.gravity_check import (
    GRAVITY_MISMATCH_WARNING,
    check_gravity_compatibility,
)
from services.api.app.models.enums import (
    EligibilityStatus,
    GravityEnvironment,
    ScientificObjective,
)


class TestGravityCompatibility:
    def test_microgravity_exact_match_eligible(self):
        result = check_gravity_compatibility(
            GravityEnvironment.MICROGRAVITY,
            GravityEnvironment.MICROGRAVITY,
        )
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Exact gravity environment match" in result.reason

    def test_lunar_scenario_microgravity_experiment_warning(self):
        result = check_gravity_compatibility(
            GravityEnvironment.PARTIAL_GRAVITY_LUNAR,
            GravityEnvironment.MICROGRAVITY,
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert result.warning == GRAVITY_MISMATCH_WARNING

    def test_mars_scenario_microgravity_experiment_warning(self):
        result = check_gravity_compatibility(
            GravityEnvironment.PARTIAL_GRAVITY_MARS,
            GravityEnvironment.MICROGRAVITY,
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert result.warning == GRAVITY_MISMATCH_WARNING

    def test_earth_experiment_without_baseline_objective_ineligible(self):
        result = check_gravity_compatibility(
            GravityEnvironment.MICROGRAVITY,
            GravityEnvironment.EARTH_GRAVITY,
            objectives=[ScientificObjective.IGNITION],
        )
        assert result.status == EligibilityStatus.INELIGIBLE
        assert "Terrestrial 1g normal gravity data cannot be directly compared" in result.exclusion_reason

    def test_earth_experiment_with_flammability_limits_warning(self):
        result = check_gravity_compatibility(
            GravityEnvironment.MICROGRAVITY,
            GravityEnvironment.EARTH_GRAVITY,
            objectives=[ScientificObjective.FLAMMABILITY_LIMITS],
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "Terrestrial (1g) baseline" in result.warning

    def test_variable_gravity_warning(self):
        result = check_gravity_compatibility(
            GravityEnvironment.MICROGRAVITY,
            GravityEnvironment.VARIABLE,
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "variable gravity" in result.warning

    def test_missing_gravity_warning(self):
        result = check_gravity_compatibility(
            GravityEnvironment.MICROGRAVITY,
            None,
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "unrecorded" in result.warning
