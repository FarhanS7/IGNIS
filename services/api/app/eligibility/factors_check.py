"""Minimum Comparable Factors Check (Task B1.4 | PRD v1.1 §14.2).

Ensures an experiment run has at least one comparable environmental or physical
parameter (oxygen, pressure, airflow, material, fuel type) before similarity scoring.
"""

from ..models.enums import EligibilityStatus
from ..models.experiment import ExperimentRunBase
from .models import EligibilityCheckResult


def check_minimum_factors(run: ExperimentRunBase | None) -> EligibilityCheckResult:
    """Checks that the experiment run contains at least one non-null comparable environmental factor."""
    if run is None:
        return EligibilityCheckResult(
            status=EligibilityStatus.INELIGIBLE,
            exclusion_reason="Experiment run record is missing; cannot evaluate comparable factors.",
        )

    factors_map = {
        "oxygen": run.oxygen_pct,
        "pressure": run.pressure_kpa,
        "airflow": run.airflow_cm_s,
        "material": run.material,
        "fuel_type": run.fuel_type,
    }

    present = [name for name, val in factors_map.items() if val is not None]

    if len(present) >= 1:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE,
            reason=f"Run contains {len(present)} comparable factor(s): {', '.join(present)}.",
        )

    return EligibilityCheckResult(
        status=EligibilityStatus.INELIGIBLE,
        exclusion_reason=(
            "Experiment run contains zero comparable environmental factors "
            "(oxygen, pressure, airflow, material, or fuel type). Nothing to compare."
        ),
    )
