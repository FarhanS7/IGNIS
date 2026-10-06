"""Eligibility Orchestrator (Task B1.6 | PRD v1.1 §14.4).

Composes all 5 eligibility checks into a single evaluation pipeline,
yielding an overall decision (eligible, eligible_with_warning, ineligible)
with aggregated scientific reasons, warnings, and exclusion rationales.
"""

from ..models.enums import EligibilityStatus
from ..models.experiment import ExperimentBase, ExperimentRunBase
from .factors_check import check_minimum_factors
from .fuel_check import check_fuel_compatibility
from .gravity_check import check_gravity_compatibility
from .models import EligibilityCheckResult, EligibilityResult, ScenarioInput
from .objective_check import check_objective_compatibility
from .quality_check import check_data_quality


def evaluate_eligibility(
    scenario: ScenarioInput,
    experiment: ExperimentBase,
    run: ExperimentRunBase,
) -> EligibilityResult:
    """Evaluates scientific comparability between a target scenario and an experimental test run."""
    # 1. Fuel and material compatibility
    fuel_res = check_fuel_compatibility(scenario.material, run.material)

    # 2. Objective compatibility
    obj_res = check_objective_compatibility(scenario.objective, experiment.objectives)

    # 3. Gravity environment compatibility
    exp_gravity = run.gravity_environment or experiment.gravity_environment
    grav_res = check_gravity_compatibility(
        scenario.gravity_environment,
        exp_gravity,
        experiment.objectives,
    )

    # 4. Minimum comparable environmental factors
    factors_res = check_minimum_factors(run)

    # 5. Data quality and provenance
    qual_res = check_data_quality(run.data_quality, experiment.source_id)

    all_checks: list[EligibilityCheckResult] = [
        fuel_res,
        obj_res,
        grav_res,
        factors_res,
        qual_res,
    ]

    # Collect outputs
    reasons: list[str] = [c.reason for c in all_checks if c.reason]
    warnings: list[str] = [c.warning for c in all_checks if c.warning]
    excluded_because: list[str] = [c.exclusion_reason for c in all_checks if c.exclusion_reason]

    # Determine overall status
    if any(c.status == EligibilityStatus.INELIGIBLE for c in all_checks):
        overall_status = EligibilityStatus.INELIGIBLE
    elif any(c.status == EligibilityStatus.ELIGIBLE_WITH_WARNING for c in all_checks):
        overall_status = EligibilityStatus.ELIGIBLE_WITH_WARNING
    else:
        overall_status = EligibilityStatus.ELIGIBLE

    return EligibilityResult(
        status=overall_status,
        reasons=reasons,
        warnings=warnings,
        excluded_because=excluded_because,
    )
