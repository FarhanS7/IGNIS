"""Unit tests for M4 NASA FLEX Droplet Flame Extinction Model.

Validates:
1. False Extinction Rate (FER) calculation on a hand-made ground-truth confusion matrix.
2. Group disjointness: zero mixture group leakage in GroupKFold cross-validation.
3. Model determinism: identical predictions with fixed random seed.
4. Output contract: returns categorical states (EXTINCTION_REGION / SUSTAINED_REGION / INSUFFICIENT_EVIDENCE).
5. Plain JSON parameter and metric schema integrity.
"""

import os
import json
import numpy as np
import pytest
from sklearn.model_selection import GroupKFold

from scripts.ml.m4_flex.data import load_flex_dataset, extract_features_and_labels
from scripts.ml.m4_flex.models import (
    MajorityClassBaseline,
    CO2ThresholdBaseline,
    FLEXExtinctionLogisticModel
)
from scripts.ml.m4_flex.evaluate import compute_extinction_metrics

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
PARAMS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm4', 'params.json')
METRICS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm4', 'metrics.json')


def test_false_extinction_rate_handmade_confusion():
    """Verify safety-critical False Extinction Rate calculation on an exact hand-crafted confusion scenario.

    Scenario:
    - 6 Actual Extinguished (y = 1): 4 predicted 1 (TP), 2 predicted 0 (FN)
    - 8 Actual Sustained (y = 0): 3 predicted 1 (FP = False Extinction), 5 predicted 0 (TN)
    Expected:
    - False Extinction Count = 3
    - Actual Sustained Count = 8
    - False Extinction Rate = 3 / 8 = 0.375 (37.5%)
    - Accuracy = (4 + 5) / 14 = 9 / 14 = 0.642857
    - Extinction Recall = 4 / 6 = 0.666667
    """
    y_true = np.array([1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
    y_pred = np.array([1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0])

    metrics = compute_extinction_metrics(y_true, y_pred)

    assert metrics['false_extinction_count'] == 3
    assert metrics['actual_sustained_count'] == 8
    assert metrics['false_extinction_rate'] == pytest.approx(3.0 / 8.0, abs=1e-6)
    assert metrics['true_extinction_count'] == 4
    assert metrics['actual_extinction_count'] == 6
    assert metrics['extinction_recall'] == pytest.approx(4.0 / 6.0, abs=1e-6)
    assert metrics['accuracy'] == pytest.approx(9.0 / 14.0, abs=1e-6)
    assert metrics['sustained_recall'] == pytest.approx(5.0 / 8.0, abs=1e-6)


def test_group_disjointness_no_mixture_leakage():
    """Verify zero overlap between training and testing mixture groups in GroupKFold."""
    df = load_flex_dataset()
    X, y, groups, _ = extract_features_and_labels(df)

    gkf = GroupKFold(n_splits=5)
    for fold_idx, (tr_idx, te_idx) in enumerate(gkf.split(X, y, groups)):
        tr_groups = set(np.array(groups)[tr_idx])
        te_groups = set(np.array(groups)[te_idx])

        overlap = tr_groups.intersection(te_groups)
        assert len(overlap) == 0, f"Mixture group leakage detected in fold {fold_idx}: {overlap}"
        assert len(te_groups) > 0, f"Test fold {fold_idx} has no groups"


def test_model_determinism():
    """Verify that model fitting and probability estimation are bit-for-bit deterministic."""
    df = load_flex_dataset()
    X, y, _, feat_names = extract_features_and_labels(df)

    m1 = FLEXExtinctionLogisticModel(random_state=42).fit(X, y, feat_names)
    m2 = FLEXExtinctionLogisticModel(random_state=42).fit(X, y, feat_names)

    probs1 = m1.predict_proba(X)
    probs2 = m2.predict_proba(X)

    assert np.array_equal(probs1, probs2), "Model probabilities must be strictly deterministic"
    assert np.array_equal(m1.predict(X), m2.predict(X)), "Predictions must be strictly deterministic"


def test_category_output_contract():
    """Verify predict_category returns valid discrete categories and zero raw numbers or percentages."""
    valid_categories = {'EXTINCTION_REGION', 'SUSTAINED_REGION', 'INSUFFICIENT_EVIDENCE'}
    df = load_flex_dataset()
    X, y, _, feat_names = extract_features_and_labels(df)

    model = FLEXExtinctionLogisticModel(random_state=42).fit(X, y, feat_names)
    categories = model.predict_category(X)

    assert len(categories) == len(X)
    for cat in categories:
        assert cat in valid_categories, f"Invalid category string: {cat}"
        assert not ('%' in cat or '.' in cat), f"Category string must not contain numbers or percentages: {cat}"


def test_json_artifacts_schema_and_mandatory_lines():
    """Verify JSON parameter and metric schemas contain mandatory microgravity and solid-fuel caveats."""
    assert os.path.exists(PARAMS_JSON_PATH), f"Missing params JSON: {PARAMS_JSON_PATH}"
    assert os.path.exists(METRICS_JSON_PATH), f"Missing metrics JSON: {METRICS_JSON_PATH}"

    with open(PARAMS_JSON_PATH, 'r', encoding='utf-8') as f:
        params = json.load(f)

    assert params['model_type'] == 'L2_LogisticRegression_Droplet_Extinction'
    assert 'coefficients' in params
    assert len(params['coefficients']) == 7
    assert 'scaler_mean' in params
    assert 'scaler_scale' in params

    caveat_text = " ".join(params.get('caveats', []))
    assert "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels." in caveat_text
    assert "Not validated for partial gravity." in caveat_text

    with open(METRICS_JSON_PATH, 'r', encoding='utf-8') as f:
        metrics = json.load(f)

    assert 'evaluations' in metrics
    assert 'Grouped_5Fold_CV' in metrics['evaluations']
    assert 'Leave_One_Fuel_Out' in metrics['evaluations']

