"""Objective Overlap Scoring (Task B2.3 | PRD v1.1 §15.3).

Computes proportional overlap score between target scenario objectives
and experimental investigation objectives.
"""

from ..models.enums import ScientificObjective


def objective_overlap(
    scenario_objectives: list[ScientificObjective] | ScientificObjective | None,
    experiment_objectives: list[ScientificObjective] | None,
) -> float | None:
    """Computes overlap score between target scenario objectives and experiment objectives.

    Returns:
        float in [0.0, 1.0] representing the fraction of scenario objectives covered by the experiment.
        None if either side is empty or None.
    """
    if not scenario_objectives or not experiment_objectives:
        return None

    if isinstance(scenario_objectives, ScientificObjective):
        s_set = {scenario_objectives}
    else:
        s_set = set(scenario_objectives)

    e_set = set(experiment_objectives)

    if not s_set or not e_set:
        return None

    intersection = s_set & e_set
    if not intersection:
        return 0.0

    return len(intersection) / len(s_set)
