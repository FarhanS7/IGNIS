"""Unit tests for Fire Behavior Profile Aggregation (Task B2.6)."""

import uuid
from services.api.app.behavior.profile import build_behavior_profile
from services.api.app.models.enums import (
    BehaviorLevel,
    ConfidenceLevel,
    CoverageLevel,
    MaterialFamily,
)
from services.api.app.models.experiment import ExperimentRunBase


class TestBehaviorProfile:
    def test_elevated_flame_spread(self):
        exp_id = uuid.uuid4()
        runs = [
            ExperimentRunBase(experiment_id=exp_id, flame_spread_observed=True, ignition_observed=True, extinction_observed=False),
            ExperimentRunBase(experiment_id=exp_id, flame_spread_observed=True, ignition_observed=True, extinction_observed=False),
            ExperimentRunBase(experiment_id=exp_id, flame_spread_observed=True, ignition_observed=True, extinction_observed=True),
        ]
        profile = build_behavior_profile(runs, unique_experiments_count=1)
        assert profile.flame_spread.level == BehaviorLevel.ELEVATED
        assert profile.flame_spread.positive_observations == 3
        assert profile.sustained_burning.level == BehaviorLevel.ELEVATED
        assert profile.extinction.level == BehaviorLevel.MIXED

    def test_mixed_observations(self):
        exp_id = uuid.uuid4()
        runs = [
            ExperimentRunBase(experiment_id=exp_id, flame_spread_observed=True),
            ExperimentRunBase(experiment_id=exp_id, flame_spread_observed=False),
        ]
        profile = build_behavior_profile(runs, unique_experiments_count=1)
        assert profile.flame_spread.level == BehaviorLevel.MIXED
        assert profile.flame_spread.positive_observations == 1
        assert profile.flame_spread.negative_observations == 1

    def test_insufficient_observations(self):
        exp_id = uuid.uuid4()
        # Run with only oxygen, pressure, material but no spread or duration data
        runs = [
            ExperimentRunBase(experiment_id=exp_id, oxygen_pct=21.0, material=MaterialFamily.PMMA),
        ]
        profile = build_behavior_profile(runs, unique_experiments_count=1)
        assert profile.flame_spread.level == BehaviorLevel.INSUFFICIENT
        assert profile.sustained_burning.level == BehaviorLevel.INSUFFICIENT
        assert profile.extinction.level == BehaviorLevel.INSUFFICIENT

    def test_profile_metadata_and_summary(self):
        exp_id = uuid.uuid4()
        runs = [
            ExperimentRunBase(experiment_id=exp_id, flame_spread_observed=True),
        ]
        profile = build_behavior_profile(
            runs,
            unique_experiments_count=2,
            coverage=CoverageLevel.HIGH,
            confidence=ConfidenceLevel.MEDIUM,
        )
        assert profile.comparable_experiments_count == 2
        assert profile.coverage == CoverageLevel.HIGH
        assert profile.confidence == ConfidenceLevel.MEDIUM
        assert "high coverage" in profile.summary
