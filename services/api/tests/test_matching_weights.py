"""Unit tests for Weight Renormalization Function (Task B2.4)."""

import pytest
from services.api.app.matching.weights import compute_weighted_similarity, DEFAULT_WEIGHTS


class TestMatchingWeights:
    def test_all_factors_perfect_score(self):
        scores = {
            "material_or_fuel": 1.0,
            "oxygen": 1.0,
            "airflow": 1.0,
            "pressure": 1.0,
            "objective": 1.0,
            "geometry": 1.0,
        }
        overall, weights = compute_weighted_similarity(scores)
        assert overall == 1.0
        assert pytest.approx(sum(weights.values()), 0.0001) == 1.0

    def test_missing_factors_renormalized(self):
        # Only oxygen (weight 0.20) and pressure (weight 0.15) present
        # total = 0.35
        # oxygen weight = 0.20 / 0.35 = 4/7
        # pressure weight = 0.15 / 0.35 = 3/7
        scores = {
            "material_or_fuel": None,
            "oxygen": 1.0,
            "airflow": None,
            "pressure": 0.5,
            "objective": None,
            "geometry": None,
        }
        overall, weights = compute_weighted_similarity(scores)
        assert pytest.approx(sum(weights.values()), 0.0001) == 1.0
        assert pytest.approx(weights["oxygen"], 0.0001) == 0.20 / 0.35
        assert pytest.approx(weights["pressure"], 0.0001) == 0.15 / 0.35

        expected_score = (1.0 * (0.20 / 0.35)) + (0.5 * (0.15 / 0.35))
        assert pytest.approx(overall, 0.0001) == expected_score

    def test_single_available_factor(self):
        scores = {
            "material_or_fuel": 0.70,
            "oxygen": None,
            "airflow": None,
        }
        overall, weights = compute_weighted_similarity(scores)
        assert overall == 0.70
        assert weights["material_or_fuel"] == 1.0

    def test_all_none_returns_none(self):
        scores = {
            "material_or_fuel": None,
            "oxygen": None,
            "airflow": None,
        }
        overall, weights = compute_weighted_similarity(scores)
        assert overall is None
        assert weights == {}

    def test_custom_weights(self):
        custom = {"a": 0.5, "b": 0.5}
        scores = {"a": 1.0, "b": 0.0}
        overall, weights = compute_weighted_similarity(scores, base_weights=custom)
        assert overall == 0.5
        assert weights["a"] == 0.5
        assert weights["b"] == 0.5
