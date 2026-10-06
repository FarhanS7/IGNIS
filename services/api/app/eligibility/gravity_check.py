"""Gravity Environment Compatibility Check (Task B1.3 | PRD v1.1 §14.3).

Ensures extraterrestrial and microgravity scenarios flag gravity mismatches,
preventing false high-confidence transfers from orbital data to Moon or Mars.
"""

from ..models.enums import EligibilityStatus, GravityEnvironment, ScientificObjective
from .models import EligibilityCheckResult

GRAVITY_MISMATCH_WARNING = "Gravity environment differs from the source experiment; transferability is uncertain."


def check_gravity_compatibility(
    scenario_gravity: GravityEnvironment,
    experiment_gravity: GravityEnvironment | None,
    objectives: list[ScientificObjective] | None = None,
) -> EligibilityCheckResult:
    """Checks gravity environment compatibility and issues scientific mismatch warnings."""
    if experiment_gravity is None or experiment_gravity == GravityEnvironment.UNKNOWN:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Experiment gravity environment is unrecorded; transferability requires review.",
        )

    # 1. Exact match
    if scenario_gravity == experiment_gravity:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE,
            reason=f"Exact gravity environment match: {scenario_gravity.value}.",
        )

    # 2. Lunar or Mars scenario against Microgravity experiment (Crucial P0 Check)
    if (
        scenario_gravity in {GravityEnvironment.PARTIAL_GRAVITY_LUNAR, GravityEnvironment.PARTIAL_GRAVITY_MARS}
        and experiment_gravity == GravityEnvironment.MICROGRAVITY
    ):
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning=GRAVITY_MISMATCH_WARNING,
        )

    # 3. Variable gravity (parabolic aircraft)
    if experiment_gravity == GravityEnvironment.VARIABLE:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Source experiment conducted in variable gravity; transient g-jitter effects may impact steady flame behavior.",
        )

    # 4. Earth 1g normal gravity experiment compared against non-Earth scenario
    if experiment_gravity == GravityEnvironment.EARTH_GRAVITY:
        terrestrial_baseline_objectives = {
            ScientificObjective.FLAMMABILITY_LIMITS,
            ScientificObjective.MATERIAL_RESPONSE,
            ScientificObjective.GENERAL_COMBUSTION,
        }
        if objectives and any(obj in terrestrial_baseline_objectives for obj in objectives):
            return EligibilityCheckResult(
                status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
                warning="Terrestrial (1g) baseline experiment used; buoyancy convection alters flame dynamics compared to reduced gravity.",
            )
        return EligibilityCheckResult(
            status=EligibilityStatus.INELIGIBLE,
            exclusion_reason=(
                "Terrestrial 1g normal gravity data cannot be directly compared to reduced/microgravity "
                "environments without an explicit baseline investigation objective."
            ),
        )

    # 5. General mismatch (e.g., lunar vs martian)
    return EligibilityCheckResult(
        status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
        warning=GRAVITY_MISMATCH_WARNING,
    )
