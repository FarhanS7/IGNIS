"""Objective Compatibility Check (Task B1.2 | PRD v1.1 §14.2).

Validates whether the scientific phenomenon studied in an experiment matches or
relates to the target investigation objective of the scenario.
"""

from ..models.enums import EligibilityStatus, ScientificObjective
from .models import EligibilityCheckResult

OBJECTIVE_RELATEDNESS: dict[ScientificObjective, set[ScientificObjective]] = {
    ScientificObjective.IGNITION: {
        ScientificObjective.FLAMMABILITY_LIMITS,
        ScientificObjective.MATERIAL_RESPONSE,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.FLAME_SPREAD: {
        ScientificObjective.SUSTAINED_BURNING,
        ScientificObjective.MATERIAL_RESPONSE,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.EXTINCTION: {
        ScientificObjective.SUPPRESSION,
        ScientificObjective.FLAMMABILITY_LIMITS,
        ScientificObjective.SUSTAINED_BURNING,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.SUSTAINED_BURNING: {
        ScientificObjective.FLAME_SPREAD,
        ScientificObjective.EXTINCTION,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.FLAMMABILITY_LIMITS: {
        ScientificObjective.IGNITION,
        ScientificObjective.EXTINCTION,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.SMOKE_DETECTION: {
        ScientificObjective.MATERIAL_RESPONSE,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.MATERIAL_RESPONSE: {
        ScientificObjective.IGNITION,
        ScientificObjective.FLAME_SPREAD,
        ScientificObjective.SMOKE_DETECTION,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.SUPPRESSION: {
        ScientificObjective.EXTINCTION,
        ScientificObjective.GENERAL_COMBUSTION,
    },
    ScientificObjective.GENERAL_COMBUSTION: {
        ScientificObjective.IGNITION,
        ScientificObjective.FLAME_SPREAD,
        ScientificObjective.EXTINCTION,
        ScientificObjective.SUSTAINED_BURNING,
        ScientificObjective.FLAMMABILITY_LIMITS,
        ScientificObjective.SMOKE_DETECTION,
        ScientificObjective.MATERIAL_RESPONSE,
        ScientificObjective.SUPPRESSION,
    },
}


def check_objective_compatibility(
    scenario_objective: ScientificObjective,
    experiment_objectives: list[ScientificObjective] | None,
) -> EligibilityCheckResult:
    """Checks whether the experiment's studied phenomena match or relate to the scenario objective."""
    if not experiment_objectives:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Experiment has unrecorded scientific objectives; comparison requires manual review.",
        )

    # 1. Exact match
    if scenario_objective in experiment_objectives:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE,
            reason=f"Exact scientific objective match: {scenario_objective.value}.",
        )

    # 2. Related objective
    related_to_scenario = OBJECTIVE_RELATEDNESS.get(scenario_objective, set())
    matching_related = [obj for obj in experiment_objectives if obj in related_to_scenario]
    if matching_related:
        related_names = ", ".join(o.value for o in matching_related)
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning=(
                f"Related scientific objective: experiment focuses on [{related_names}], "
                f"which is related to target '{scenario_objective.value}'; indirect comparability."
            ),
        )

    # 3. Incompatible
    exp_names = ", ".join(o.value for o in experiment_objectives)
    return EligibilityCheckResult(
        status=EligibilityStatus.INELIGIBLE,
        exclusion_reason=(
            f"Incompatible scientific objective: experiment focuses on [{exp_names}], "
            f"which cannot be compared with target objective '{scenario_objective.value}'."
        ),
    )
