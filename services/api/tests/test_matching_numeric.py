"""Unit tests for Numeric Similarity Function (Task B2.1)."""

import pytest
from services.api.app.matching.numeric import numeric_similarity, DEFAULT_TOLERANCES


class TestNumericSimilarity:
    def test_exact_match(self):
        score = numeric_similarity(21.0, 21.0, DEFAULT_TOLERANCES["oxygen_pct"])
        assert score == 1.0

    def test_partial_match(self):
        # diff is 5.0, tolerance is 10.0 -> 1 - 5/10 = 0.5
        score = numeric_similarity(21.0, 26.0, 10.0)
        assert pytest.approx(score, 0.001) == 0.5

    def test_diff_equals_tolerance(self):
        # diff is 10.0, tolerance is 10.0 -> 1 - 10/10 = 0.0
        score = numeric_similarity(21.0, 31.0, 10.0)
        assert score == 0.0

    def test_diff_exceeds_tolerance(self):
        # diff is 20.0, tolerance is 10.0 -> clamped at 0.0
        score = numeric_similarity(21.0, 41.0, 10.0)
        assert score == 0.0

    def test_either_none_returns_none(self):
        assert numeric_similarity(None, 21.0, 10.0) is None
        assert numeric_similarity(21.0, None, 10.0) is None
        assert numeric_similarity(None, None, 10.0) is None

    def test_negative_tolerance_raises_error(self):
        with pytest.raises(ValueError, match="Tolerance must be strictly positive"):
            numeric_similarity(21.0, 21.0, -5.0)

    def test_zero_tolerance_raises_error(self):
        with pytest.raises(ValueError, match="Tolerance must be strictly positive"):
            numeric_similarity(21.0, 21.0, 0.0)
