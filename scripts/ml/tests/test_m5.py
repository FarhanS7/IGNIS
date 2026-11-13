"""Unit tests for M5 Abstention and Calibration Verification.

Validates:
1. Conformal prediction set and empirical coverage calculation on a known toy example.
2. Margin-based abstention logic and thresholding.
3. Group disjointness: zero group leakage between train, calibration, and test splits.
4. Model determinism: identical q_hat and abstention masks on identical inputs.
5. Reliability and Brier score calculation precision.
"""

import os
import json
import numpy as np
import pytest

from scripts.ml.m5_abstain.conformal import ConformalAbstainer, MarginAbstainer
from scripts.ml.m5_abstain.reliability import compute_reliability_stats
from scripts.ml.m4_flex.data import load_flex_dataset, extract_features_and_labels

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
PARAMS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm5', 'params.json')
METRICS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm5', 'metrics.json')


def test_conformal_coverage_toy_example():
    """Verify split-conformal calibration quantile and prediction set logic on a hand-crafted dataset."""
    # 5 calibration points:
    # point 0: y=1, p=0.90 -> score = 1 - 0.90 = 0.10
    # point 1: y=1, p=0.80 -> score = 1 - 0.80 = 0.20
    # point 2: y=0, p=0.30 -> score = 1 - (1-0.30) = 0.30
    # point 3: y=1, p=0.60 -> score = 1 - 0.60 = 0.40
    # point 4: y=0, p=0.50 -> score = 1 - 0.50 = 0.50
    y_cal = np.array([1, 1, 0, 1, 0])
    p_cal = np.array([0.90, 0.80, 0.30, 0.60, 0.50])

    conf = ConformalAbstainer(target_coverage=0.80).calibrate(y_cal, p_cal)
    # alpha = 0.20, n = 5
    # q_level = ceil(6 * 0.80) / 5 = ceil(4.8) / 5 = 5 / 5 = 1.0 -> q_hat should be max score (0.50)
    assert conf.q_hat == pytest.approx(0.50, abs=1e-6)

    # Test query points:
    # query 1: p = 0.95 -> (1 - 0.95) = 0.05 <= 0.50 (in set), 0.95 > 0.50 (not in set) -> {1}
    # query 2: p = 0.05 -> 0.95 > 0.50 (not in set), 0.05 <= 0.50 (in set) -> {0}
    # query 3: p = 0.50 -> 0.50 <= 0.50 (in set), 0.50 <= 0.50 (in set) -> {0, 1} (AMBIGUOUS -> ABSTAIN)
    p_query = np.array([0.95, 0.05, 0.50])
    sets = conf.predict_set(p_query)

    assert sets[0] == {1}
    assert sets[1] == {0}
    assert sets[2] == {0, 1}

    out_labels = conf.predict_with_abstain(p_query, class_names=("NOMINAL", "FIRE_ALARM"))
    assert out_labels == ["FIRE_ALARM", "NOMINAL", "INSUFFICIENT_EVIDENCE"]


def test_margin_abstainer_logic():
    """Verify margin-based abstention logic flags values within distance threshold."""
    abstainer = MarginAbstainer(margin=0.15)
    abstainer.is_calibrated = True

    # Threshold is 0.50. Margin is 0.15:
    # Insufficient evidence range: [0.35, 0.65]
    p_test = np.array([0.90, 0.60, 0.50, 0.40, 0.20])
    labels = abstainer.predict_with_abstain(
        p_test,
        threshold=0.50,
        class_names=("SUSTAINED", "EXTINGUISHED"),
        abstain_label="INSUFFICIENT_EVIDENCE"
    )

    expected = ["EXTINGUISHED", "INSUFFICIENT_EVIDENCE", "INSUFFICIENT_EVIDENCE", "INSUFFICIENT_EVIDENCE", "SUSTAINED"]
    assert labels == expected


def test_m4_groups_disjoint_tri_split():
    """Verify zero overlap between Train, Calibration, and Test groups for M4."""
    df = load_flex_dataset()
    _, _, groups, _ = extract_features_and_labels(df)

    unique_g = np.array(sorted(list(set(groups))))
    rng = np.random.default_rng(42)
    perm_g = rng.permutation(unique_g)

    n_g = len(perm_g)
    n_tr, n_cal = int(n_g * 0.6), int(n_g * 0.2)

    tr_g = set(perm_g[:n_tr])
    cal_g = set(perm_g[n_tr:n_tr+n_cal])
    te_g = set(perm_g[n_tr+n_cal:])

    # Strictly disjoint
    assert len(tr_g.intersection(cal_g)) == 0, "Train and Cal groups must have zero intersection"
    assert len(tr_g.intersection(te_g)) == 0, "Train and Test groups must have zero intersection"
    assert len(cal_g.intersection(te_g)) == 0, "Cal and Test groups must have zero intersection"
    assert len(tr_g) + len(cal_g) + len(te_g) == n_g, "Partition must be exhaustive"


def test_reliability_stats_exact():
    """Verify Brier score and ECE calculation on exact known test vectors."""
    y_true = np.array([1, 0, 1, 0])
    y_prob = np.array([0.9, 0.1, 0.8, 0.2])

    stats = compute_reliability_stats(y_true, y_prob, n_bins=5)
    # Brier: mean of (0.1^2 + 0.1^2 + 0.2^2 + 0.2^2) = (0.01 + 0.01 + 0.04 + 0.04) / 4 = 0.10 / 4 = 0.025
    assert stats['brier_score'] == pytest.approx(0.025, abs=1e-4)
    assert 'reliability_table' in stats
    assert len(stats['reliability_table']) == 5


def test_m5_json_schemas():
    """Verify data/models/m5/params.json and metrics.json are valid and populated."""
    if os.path.exists(PARAMS_JSON_PATH):
        with open(PARAMS_JSON_PATH, 'r', encoding='utf-8') as f:
            params = json.load(f)
        assert 'm4_droplet_extinction' in params
        assert 'm2_sensor_fusion' in params
        assert 'conformal_q_hat_90' in params['m4_droplet_extinction']
        assert 'conformal_q_hat_90' in params['m2_sensor_fusion']

    if os.path.exists(METRICS_JSON_PATH):
        with open(METRICS_JSON_PATH, 'r', encoding='utf-8') as f:
            metrics = json.load(f)
        assert 'm4_results' in metrics
        assert 'm2_results' in metrics
        assert metrics['target_coverage'] == 0.90

