"""Fuel and Material Family Compatibility Check (Task B1.1 | PRD v1.1 §14.2).

Ensures experiments are scientifically comparable by validating material/fuel phase and family.
Prevents comparing e.g. gaseous droplet experiments to solid fabrics.
"""

from ..models.enums import EligibilityStatus, MaterialFamily, MATERIAL_FAMILY_COMPATIBILITY
from .models import EligibilityCheckResult


def check_fuel_compatibility(
    scenario_material: MaterialFamily,
    run_material: MaterialFamily | None,
) -> EligibilityCheckResult:
    """Checks whether a test run's material family is compatible with the scenario material."""
    if run_material is None or run_material == MaterialFamily.UNKNOWN:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Experiment material is unknown or unrecorded; transferability requires review.",
        )

    if scenario_material == run_material:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE,
            reason=f"Exact material family match: {scenario_material.value}.",
        )

    compatible_set = MATERIAL_FAMILY_COMPATIBILITY.get(scenario_material, set())
    if run_material in compatible_set:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE,
            reason=f"Compatible material family: {run_material.value} is comparable with {scenario_material.value}.",
        )

    return EligibilityCheckResult(
        status=EligibilityStatus.INELIGIBLE,
        exclusion_reason=(
            f"Incompatible material family: '{run_material.value}' cannot be scientifically compared "
            f"with target '{scenario_material.value}'."
        ),
    )
