"""Unit tests for Coverage and Confidence Calculation with Gravity Caps (Task B2.5)."""

import pytest
from services.api.app.matching.coverage import compute_coverage, compute_confidence
from services.api.app.models.enums import ConfidenceLevel, CoverageLevel


class TestMatchingCoverage:
    def test_high_coverage(self):
        factors = ["material_or_fuel", "oxygen", "airflow", "pressure"]
        # 0.30 + 0.20 + 0.20 + 0.15 = 0.85
        score, level = compute_coverage(factors)
        assert pytest.approx(score, 0.001) == 0.85
        assert level == CoverageLevel.HIGH

    def test_medium_coverage(self):
        factors = ["material_or_fuel", "oxygen", "pressure"]
        # 0.30 + 0.20 + 0.15 = 0.65
        score, level = compute_coverage(factors)
        assert pytest.approx(score, 0.001) == 0.65
        assert level == CoverageLevel.MEDIUM

    def test_low_coverage(self):
        factors = ["material_or_fuel", "pressure"]
        # 0.30 + 0.15 = 0.45
        score, level = compute_coverage(factors)
        assert pytest.approx(score, 0.001) == 0.45
        assert level == CoverageLevel.LOW

    def test_confidence_high_no_warnings(self):
        conf = compute_confidence(0.90, has_gravity_mismatch=False, has_major_warning=False)
        assert conf == ConfidenceLevel.HIGH

    def test_confidence_capped_by_gravity_mismatch(self):
        # Even with 100% coverage, gravity mismatch caps at MEDIUM
        conf = compute_confidence(1.00, has_gravity_mismatch=True)
        assert conf == ConfidenceLevel.MEDIUM

    def test_confidence_capped_by_major_warning(self):
        conf = compute_confidence(0.95, has_major_warning=True)
        assert conf == ConfidenceLevel.MEDIUM

    def test_confidence_low_coverage(self):
        conf = compute_confidence(0.40, has_gravity_mismatch=False)
        assert conf == ConfidenceLevel.LOW

    def test_confidence_low_coverage_with_gravity_mismatch_remains_low(self):
        conf = compute_confidence(0.40, has_gravity_mismatch=True)
        assert conf == ConfidenceLevel.LOW
