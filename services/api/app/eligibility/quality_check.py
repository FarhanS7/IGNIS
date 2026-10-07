"""Data Quality and Provenance Check (Task B1.5 | PRD v1.1 §14.2).

Validates that experimental data meets baseline quality thresholds and
proper provenance attribution to NASA source registries.
"""

from uuid import UUID
from ..models.enums import DataQuality, EligibilityStatus
from .models import EligibilityCheckResult


def check_data_quality(
    data_quality: DataQuality | None,
    source_id: UUID | None = None,
) -> EligibilityCheckResult:
    """Checks data quality rating and source provenance registration."""
    # Source provenance check
    if source_id is None:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Experiment lacks registered NASA data source provenance record.",
        )

    # Data quality rating check
    if data_quality is None:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Data quality rating is unrecorded; transferability requires review.",
        )

    if data_quality in {DataQuality.HIGH, DataQuality.MEDIUM}:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE,
            reason=f"Data quality meets scientific threshold: {data_quality.value}.",
        )

    if data_quality == DataQuality.LOW:
        return EligibilityCheckResult(
            status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
            warning="Low data quality rating; findings should be verified against primary publications.",
        )

    # UNREVIEWED
    return EligibilityCheckResult(
        status=EligibilityStatus.ELIGIBLE_WITH_WARNING,
        warning="Unreviewed data quality rating; findings are provisional.",
    )
