"""Comparable-Evidence Filter Package (Module B1 | PRD v1.1 §14)."""

from .models import EligibilityCheckResult, EligibilityResult, ScenarioInput
from .fuel_check import check_fuel_compatibility
from .objective_check import check_objective_compatibility
from .gravity_check import check_gravity_compatibility, GRAVITY_MISMATCH_WARNING
from .factors_check import check_minimum_factors
from .quality_check import check_data_quality
from .orchestrator import evaluate_eligibility

__all__ = [
    "EligibilityCheckResult",
    "EligibilityResult",
    "ScenarioInput",
    "check_fuel_compatibility",
    "check_objective_compatibility",
    "check_gravity_compatibility",
    "GRAVITY_MISMATCH_WARNING",
    "check_minimum_factors",
    "check_data_quality",
    "evaluate_eligibility",
]
