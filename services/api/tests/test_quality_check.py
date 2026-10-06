"""Unit tests for Data Quality and Provenance Check (Task B1.5)."""

import uuid
from services.api.app.eligibility.quality_check import check_data_quality
from services.api.app.models.enums import DataQuality, EligibilityStatus


class TestQualityCheck:
    def test_high_quality_eligible(self):
        result = check_data_quality(DataQuality.HIGH, source_id=uuid.uuid4())
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Data quality meets scientific threshold: high" in result.reason

    def test_medium_quality_eligible(self):
        result = check_data_quality(DataQuality.MEDIUM, source_id=uuid.uuid4())
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Data quality meets scientific threshold: medium" in result.reason

    def test_low_quality_warning(self):
        result = check_data_quality(DataQuality.LOW, source_id=uuid.uuid4())
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "Low data quality" in result.warning

    def test_unreviewed_quality_warning(self):
        result = check_data_quality(DataQuality.UNREVIEWED, source_id=uuid.uuid4())
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "Unreviewed" in result.warning

    def test_missing_data_quality_warning(self):
        result = check_data_quality(None, source_id=uuid.uuid4())
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "unrecorded" in result.warning

    def test_missing_source_provenance_warning(self):
        result = check_data_quality(DataQuality.HIGH, source_id=None)
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert "lacks registered NASA data source" in result.warning
