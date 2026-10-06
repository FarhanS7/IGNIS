"""Comparable-Evidence Filter Package (Module B1 | PRD v1.1 §14)."""

from .models import EligibilityCheckResult, EligibilityResult
from .fuel_check import check_fuel_compatibility

__all__ = [
    "EligibilityCheckResult",
    "EligibilityResult",
    "check_fuel_compatibility",
]
