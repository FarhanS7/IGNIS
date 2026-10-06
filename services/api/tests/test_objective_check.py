"""Unit tests for Objective Compatibility Check (Task B1.2)."""

from services.api.app.eligibility.objective_check import check_objective_compatibility
from services.api.app.models.enums import EligibilityStatus, ScientificObjective


class TestObjectiveCompatibility:
    def test_exact_match_eligible(self):
        result = check_objective_compatibility(
            ScientificObjective.FLAME_SPREAD,
            [ScientificObjective.FLAME_SPREAD, ScientificObjective.EXTINCTION],
        )
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Exact scientific objective match" in result.reason

    def test_related_objective_warning(self):
        # Sustained burning is related to flame spread
        result = check_objective_compatibility(
            ScientificObjective.FLAME_SPREAD,
            [ScientificObjective.SUSTAINED_BURNING],
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "Related scientific objective" in result.warning

    def test_general_combustion_related_warning(self):
        result = check_objective_compatibility(
            ScientificObjective.IGNITION,
            [ScientificObjective.GENERAL_COMBUSTION],
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert result.warning is not None

    def test_incompatible_objective_ineligible(self):
        # Smoke detection and flammability limits have no direct overlap
        result = check_objective_compatibility(
            ScientificObjective.SMOKE_DETECTION,
            [ScientificObjective.FLAMMABILITY_LIMITS],
        )
        assert result.status == EligibilityStatus.INELIGIBLE
        assert "Incompatible scientific objective" in result.exclusion_reason

    def test_empty_objectives_warning(self):
        result = check_objective_compatibility(
            ScientificObjective.FLAME_SPREAD,
            [],
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "unrecorded" in result.warning

    def test_none_objectives_warning(self):
        result = check_objective_compatibility(
            ScientificObjective.FLAME_SPREAD,
            None,
        )
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "unrecorded" in result.warning
