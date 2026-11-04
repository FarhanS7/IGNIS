"""Unit tests for M2 Multi-Sensor Fusion Detector and evaluation pipeline.

Validates:
1. Feature determinism and finiteness on synthetic in-memory frames.
2. Group split disjointness (zero train-test group leakage).
3. Bootstrap confidence interval reproducibility (fixed seed -> identical CI).
4. Threshold rule leakage prevention (threshold is fitted strictly on train data).
"""

import numpy as np
import pandas as pd
import pytest
from typing import List, Dict, Any

from scripts.ml.common.seed import set_seed
from scripts.ml.common.bootstrap import compute_group_bootstrap_ci
from scripts.ml.common.groups import assign_experiment_groups
from scripts.ml.m2_fusion.features import extract_features_from_dataframe, compute_baseline_stats
from scripts.ml.m2_fusion.baselines import ThresholdBaselineDetector
from scripts.ml.m2_fusion.train import FusionDetectorModel
from scripts.ml.m2_fusion.splits import (
    get_s1_leave_one_scenario_splits,
    get_s3_leave_repetition_out_splits,
    FIRE_SCENARIOS,
    NUISANCE_SCENARIOS
)


def create_synthetic_multinode_dataframe(n_samples_per_node: int = 30) -> pd.DataFrame:
    """Generate a clean synthetic DataFrame with multiple sensors, fire, and nuisance periods."""
    rows = []
    sensors = ['Sensor_A', 'Sensor_B']

    for s in sensors:
        for i in range(n_samples_per_node):
            # 0..9: Background, 10..19: Wood fire, 20..29: Background
            if i < 10:
                scen = 'Background'
                pm = 5.0 + 0.5 * np.sin(i)
                co = 1.0 + 0.1 * np.cos(i)
                temp = 20.0 + 0.2 * np.sin(i * 0.5)
            elif i < 20:
                scen = 'Wood'
                pm = 5.0 + 10.0 * (i - 9)
                co = 1.0 + 2.0 * (i - 9)
                temp = 20.0 + 1.5 * (i - 9)
            else:
                scen = 'Background'
                pm = 8.0 + 0.3 * np.sin(i)
                co = 1.5 + 0.1 * np.cos(i)
                temp = 22.0 + 0.1 * np.sin(i)

            rows.append({
                'Date': f'2026-01-01T12:{i:02d}:00.000Z',
                'Sensor_ID': s,
                'PM25_Room': float(pm),
                'CO_Room': float(co),
                'Temperature_Room': float(temp),
                'scenario_label': scen,
                'ternary_label': 'Fire' if scen == 'Wood' else 'Background'
            })

    df = pd.DataFrame(rows)
    return df


def test_feature_determinism_and_finiteness():
    """Verify feature extraction is deterministic and produces finite unit-free features."""
    df = create_synthetic_multinode_dataframe(30)
    df = assign_experiment_groups(df, dataset_name="SYN")

    X1, y1, groups1, feat_names1 = extract_features_from_dataframe(df, window_size=6, k_baseline=5)
    X2, y2, groups2, feat_names2 = extract_features_from_dataframe(df, window_size=6, k_baseline=5)

    assert feat_names1 == feat_names2
    assert len(feat_names1) == 10
    assert X1.shape[1] == 10
    assert np.array_equal(X1, X2), "Feature extraction must be perfectly deterministic"
    assert np.array_equal(y1, y2), "Target labels must be identical"
    assert np.array_equal(groups1, groups2), "Group ids must be identical"

    assert np.all(np.isfinite(X1)), "All extracted features must be finite numbers"
    assert np.all((X1[:, 9] >= 0.0) & (X1[:, 9] <= 1.0)), "Agreement fraction must be within [0, 1]"


def test_split_disjointness_no_group_leakage():
    """Verify zero overlap between train and test groups across all splits."""
    # Build synthetic multi-scenario multi-repetition dataset
    rows = []
    sensors = ['Sensor_1', 'Sensor_2']
    scenarios = ['Background', 'Wood', 'Background', 'Wood', 'Background', 'Candles', 'Background', 'Ethanol', 'Background']

    timestamp = 0
    for scen in scenarios:
        n_pts = 15
        for _ in range(n_pts):
            timestamp += 10
            for s in sensors:
                rows.append({
                    'Date': f'2026-01-01T{timestamp // 3600:02d}:{(timestamp % 3600) // 60:02d}:{timestamp % 60:02d}.000Z',
                    'Sensor_ID': s,
                    'scenario_label': scen,
                    'PM25_Room': 10.0,
                    'CO_Room': 2.0,
                    'Temperature_Room': 21.0,
                    'ternary_label': 'Fire' if scen in ['Wood', 'Candles'] else ('Nuisance' if scen == 'Ethanol' else 'Background')
                })

    df = pd.DataFrame(rows)
    df = assign_experiment_groups(df, dataset_name="TEST")

    # S1 check
    s1_splits = get_s1_leave_one_scenario_splits(df)
    assert len(s1_splits) > 0, "Should generate S1 splits"
    for scen_name, tr_mask, te_mask in s1_splits:
        tr_g = set(df.loc[tr_mask, 'experiment_id'].unique())
        te_g = set(df.loc[te_mask, 'experiment_id'].unique())
        assert len(tr_g.intersection(te_g)) == 0, f"S1 leakage detected for scenario {scen_name}!"
        assert len(te_g) > 0, f"Test fold for {scen_name} cannot be empty"

    # S3 check
    s3_splits = get_s3_leave_repetition_out_splits(df)
    assert len(s3_splits) > 0, "Should generate S3 splits"
    for rep_name, tr_mask, te_mask in s3_splits:
        tr_g = set(df.loc[tr_mask, 'experiment_id'].unique())
        te_g = set(df.loc[te_mask, 'experiment_id'].unique())
        assert len(tr_g.intersection(te_g)) == 0, f"S3 leakage detected for repetition {rep_name}!"
        assert len(te_g) > 0, f"Test fold for {rep_name} cannot be empty"


def test_bootstrap_reproducibility():
    """Verify bootstrap confidence intervals are bit-for-bit reproducible with fixed seed."""
    groups = [f'grp_{i}' for i in range(25)]
    val_map = {f'grp_{i}': float(i % 3 == 0) for i in range(25)}

    def metric_fn(resampled: List[str]) -> float:
        return float(np.mean([val_map[g] for g in resampled]))

    ci1 = compute_group_bootstrap_ci(groups, metric_fn, n_resamples=500, seed=42)
    ci2 = compute_group_bootstrap_ci(groups, metric_fn, n_resamples=500, seed=42)

    assert ci1['ci_lower'] == pytest.approx(ci2['ci_lower'], abs=1e-9)
    assert ci1['ci_upper'] == pytest.approx(ci2['ci_upper'], abs=1e-9)
    assert ci1['point'] == pytest.approx(ci2['point'], abs=1e-9)


def test_threshold_rule_leakage():
    """Verify operating threshold is calibrated strictly on training data without test leakage."""
    set_seed(42)
    n_train = 50
    X_tr = np.zeros((n_train, 10))
    y_tr = np.zeros(n_train, dtype=int)
    # 35 negative samples, 15 positive samples
    X_tr[:35, 0] = np.linspace(0.1, 2.0, 35)  # Negatives max out at 2.0
    X_tr[35:, 0] = np.linspace(3.0, 10.0, 15) # Positives start at 3.0
    y_tr[35:] = 1

    b1 = ThresholdBaselineDetector(mode="B1").fit(X_tr, y_tr)
    # Threshold should be above the training negative max (2.0)
    assert b1.threshold_smoke > 2.0

    # If test negatives exceed training negatives, baseline MUST produce false alarms
    # (proving the threshold did NOT leak or adapt to the test data)
    X_te = np.zeros((10, 10))
    y_te = np.zeros(10, dtype=int)
    X_te[:, 0] = np.linspace(2.5, 4.0, 10) # Test negatives exceed training negative max
    preds_te = b1.predict(X_te)
    assert np.any(preds_te == 1), "Baseline threshold must not adapt to test distribution"

    # M2 learned fusion model leakage check
    m2 = FusionDetectorModel(C=1.0, random_state=42).fit(X_tr, y_tr)
    thresh = m2.decision_threshold
    assert 0.0 < thresh <= 1.0
    # Predict on test data does not alter decision threshold
    _ = m2.predict(X_te)
    assert m2.decision_threshold == thresh
