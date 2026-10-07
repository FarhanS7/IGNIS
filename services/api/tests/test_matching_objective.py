"""Unit tests for Objective Overlap Scoring (Task B2.3)."""

from services.api.app.matching.objective import objective_overlap
from services.api.app.models.enums import ScientificObjective


class TestObjectiveOverlap:
    def test_single_objective_exact_presence(self):
        score = objective_overlap(
            ScientificObjective.FLAME_SPREAD,
            [ScientificObjective.FLAME_SPREAD, ScientificObjective.EXTINCTION],
        )
        assert score == 1.0

    def test_list_objectives_full_overlap(self):
        score = objective_overlap(
            [ScientificObjective.FLAME_SPREAD, ScientificObjective.EXTINCTION],
            [ScientificObjective.FLAME_SPREAD, ScientificObjective.EXTINCTION, ScientificObjective.IGNITION],
        )
        assert score == 1.0

    def test_partial_overlap(self):
        score = objective_overlap(
            [ScientificObjective.FLAME_SPREAD, ScientificObjective.IGNITION],
            [ScientificObjective.FLAME_SPREAD, ScientificObjective.EXTINCTION],
        )
        assert score == 0.5

    def test_no_overlap(self):
        score = objective_overlap(
            [ScientificObjective.FLAME_SPREAD],
            [ScientificObjective.EXTINCTION, ScientificObjective.IGNITION],
        )
        assert score == 0.0

    def test_none_or_empty_returns_none(self):
        assert objective_overlap(None, [ScientificObjective.FLAME_SPREAD]) is None
        assert objective_overlap([ScientificObjective.FLAME_SPREAD], None) is None
        assert objective_overlap([], [ScientificObjective.FLAME_SPREAD]) is None
        assert objective_overlap([ScientificObjective.FLAME_SPREAD], []) is None
