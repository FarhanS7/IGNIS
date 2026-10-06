"""Comparable-Evidence Filter Package (Module B1 | PRD v1.1 §14)."""

from .models import EligibilityCheckResult, EligibilityResult
from .fuel_check import check_fuel_compatibility
from .objective_check import check_objective_compatibility
from .gravity_check import check_gravity_compatibility, GRAVITY_MISMATCH_WARNING

__all__ = [
    "EligibilityCheckResult",
    "EligibilityResult",
    "check_fuel_compatibility",
    "check_objective_compatibility",
    "check_gravity_compatibility",
    "GRAVITY_MISMATCH_WARNING",
]
