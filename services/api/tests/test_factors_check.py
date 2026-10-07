"""Unit tests for Minimum Comparable Factors Check (Task B1.4)."""

import uuid
from services.api.app.eligibility.factors_check import check_minimum_factors
from services.api.app.models.enums import EligibilityStatus, FuelType, MaterialFamily
from services.api.app.models.experiment import ExperimentRunBase


class TestFactorsCheck:
    def test_run_with_multiple_factors_eligible(self):
        run = ExperimentRunBase(
            experiment_id=uuid.uuid4(),
            oxygen_pct=21.0,
            pressure_kpa=101.3,
            material=MaterialFamily.PMMA,
            fuel_type=FuelType.POLYMER,
        )
        result = check_minimum_factors(run)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Run contains 4 comparable factor(s)" in result.reason

    def test_run_with_single_factor_eligible(self):
        run = ExperimentRunBase(
            experiment_id=uuid.uuid4(),
            oxygen_pct=18.0,
        )
        result = check_minimum_factors(run)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Run contains 1 comparable factor(s): oxygen" in result.reason

    def test_run_with_no_factors_ineligible(self):
        run = ExperimentRunBase(
            experiment_id=uuid.uuid4(),
            run_label="Empty Run",
        )
        result = check_minimum_factors(run)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert "zero comparable environmental factors" in result.exclusion_reason

    def test_none_run_ineligible(self):
        result = check_minimum_factors(None)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert "missing" in result.exclusion_reason
