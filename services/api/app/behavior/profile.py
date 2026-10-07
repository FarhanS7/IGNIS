"""Fire Behavior Profile Aggregation (Task B2.6 | PRD v1.1 §10.4, §16.5).

Aggregates eligible experimental evidence across multiple physical combustion dimensions
(flame spread, sustained burning, extinction) into an evidence-oriented profile.
Adheres strictly to FR-FBP-001 (no generic danger/safety score) and FR-FBP-005.
"""

from pydantic import BaseModel, ConfigDict
from ..models.enums import BehaviorLevel, ConfidenceLevel, CoverageLevel
from ..models.experiment import ExperimentRunRead, ExperimentRunBase


class BehaviorDimension(BaseModel):
    """Evidence summary for a single behavioral dimension."""
    model_config = ConfigDict(from_attributes=True)

    level: BehaviorLevel
    description: str
    supporting_runs_count: int
    positive_observations: int
    negative_observations: int


class BehaviorProfile(BaseModel):
    """Composite Fire Behavior Profile derived from eligible flight experiments."""
    model_config = ConfigDict(from_attributes=True)

    flame_spread: BehaviorDimension
    sustained_burning: BehaviorDimension
    extinction: BehaviorDimension
    comparable_experiments_count: int
    coverage: CoverageLevel
    confidence: ConfidenceLevel
    summary: str


def _aggregate_dimension(
    dimension_name: str,
    positive_count: int,
    negative_count: int,
) -> BehaviorDimension:
    """Classifies observations into an evidence-oriented BehaviorDimension."""
    total = positive_count + negative_count
    if total == 0:
        return BehaviorDimension(
            level=BehaviorLevel.INSUFFICIENT,
            description=f"Insufficient eligible flight data to evaluate {dimension_name}.",
            supporting_runs_count=0,
            positive_observations=0,
            negative_observations=0,
        )

    ratio = positive_count / total

    if total == 1:
        level = BehaviorLevel.LIMITED if positive_count > 0 else BehaviorLevel.INSUFFICIENT
    elif ratio >= 0.70 and positive_count >= 2:
        level = BehaviorLevel.ELEVATED
    elif ratio <= 0.30:
        level = BehaviorLevel.LIMITED
    else:
        level = BehaviorLevel.MIXED

    descriptions = {
        BehaviorLevel.ELEVATED: f"Elevated evidence of {dimension_name} observed across {positive_count}/{total} eligible runs.",
        BehaviorLevel.MIXED: f"Mixed observations of {dimension_name} ({positive_count} positive vs {negative_count} negative).",
        BehaviorLevel.LIMITED: f"Limited evidence of {dimension_name} ({positive_count}/{total} positive runs).",
        BehaviorLevel.INSUFFICIENT: f"Insufficient telemetry recorded for {dimension_name}.",
    }

    return BehaviorDimension(
        level=level,
        description=descriptions[level],
        supporting_runs_count=total,
        positive_observations=positive_count,
        negative_observations=negative_count,
    )


def build_behavior_profile(
    runs: list[ExperimentRunRead | ExperimentRunBase],
    unique_experiments_count: int,
    coverage: CoverageLevel = CoverageLevel.MEDIUM,
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM,
) -> BehaviorProfile:
    """Builds a Fire Behavior Profile from a collection of eligible experimental runs."""
    # 1. Flame Spread: positive if flame_spread_observed is True
    flame_pos = 0
    flame_neg = 0
    for r in runs:
        if r.flame_spread_observed is not None:
            if r.flame_spread_observed:
                flame_pos += 1
            else:
                flame_neg += 1

    flame_dim = _aggregate_dimension("flame spread", flame_pos, flame_neg)

    # 2. Sustained Burning: positive if ignition observed and not immediately extinguished
    sust_pos = 0
    sust_neg = 0
    for r in runs:
        if r.ignition_observed is not None:
            if r.ignition_observed and r.extinction_observed is False:
                sust_pos += 1
            elif r.ignition_observed is False:
                sust_neg += 1

    sust_dim = _aggregate_dimension("sustained burning", sust_pos, sust_neg)

    # 3. Extinction: positive if extinction was observed
    ext_pos = 0
    ext_neg = 0
    for r in runs:
        if r.extinction_observed is not None:
            if r.extinction_observed:
                ext_pos += 1
            else:
                ext_neg += 1

    ext_dim = _aggregate_dimension("flame extinction", ext_pos, ext_neg)

    summary = (
        f"Profile synthesized from {len(runs)} eligible runs across {unique_experiments_count} "
        f"experiments ({coverage.value} coverage, {confidence.value} confidence)."
    )

    return BehaviorProfile(
        flame_spread=flame_dim,
        sustained_burning=sust_dim,
        extinction=ext_dim,
        comparable_experiments_count=unique_experiments_count,
        coverage=coverage,
        confidence=confidence,
        summary=summary,
    )
