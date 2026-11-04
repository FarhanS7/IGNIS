"""Unit tests for M1 SAME Detector Response Model and calibration curves.

Validates:
1. Monotonic non-decreasing response where declared (Isotonic Regression).
2. Extrapolation guard: strict out-of-bounds flagging beyond empirical domain.
3. Leave-one-material-out split disjointness (zero material leakage).
4. Schema, finiteness, and bounds of data/models/m1/response_curve.json.
"""

import os
import json
import numpy as np
import pytest

from scripts.ml.m1_same.data import load_same_flight_dataset, SOLID_MATERIALS
from scripts.ml.m1_same.models import (
    GlobalMeanBaseline,
    MaterialMeanBaseline,
    IsotonicResponseModel,
    LogPolynomialResponseModel,
    RidgeResponseModel
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
RESPONSE_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm1', 'response_curve.json')


def test_isotonic_monotonicity():
    """Verify that Isotonic regression yields strictly monotonic non-decreasing response."""
    # Synthetic diameter sequence with noise
    rng = np.random.default_rng(42)
    d_train = np.sort(rng.uniform(0.05, 1.0, 50))
    y_train = 0.5 * d_train + rng.normal(0, 0.1, 50)

    X_tr = d_train.reshape(-1, 1)
    iso = IsotonicResponseModel().fit(X_tr, y_train)

    # Dense test grid
    d_test = np.linspace(0.05, 1.0, 100).reshape(-1, 1)
    preds = iso.predict(d_test)

    # Assert monotonic non-decreasing
    diffs = np.diff(preds)
    assert np.all(diffs >= -1e-9), "Isotonic model predictions must be monotonically non-decreasing"
    assert np.all(preds >= 0.0), "Response multipliers must be non-negative"


def test_extrapolation_guard():
    """Verify that queries outside empirical diameter bounds are correctly flagged."""
    X_tr = np.array([[0.1], [0.3], [0.6], [0.9]])
    y_tr = np.array([0.2, 0.5, 0.8, 1.1])

    model = IsotonicResponseModel().fit(X_tr, y_tr)
    assert model.min_diameter_ == pytest.approx(0.1)
    assert model.max_diameter_ == pytest.approx(0.9)

    queries = np.array([0.02, 0.09, 0.10, 0.50, 0.90, 0.95, 2.0])
    is_oob = model.is_extrapolated(queries)

    # 0.02, 0.09 are < 0.1 -> True
    # 0.10, 0.50, 0.90 are inside -> False
    # 0.95, 2.0 are > 0.9 -> True
    expected = np.array([True, True, False, False, False, True, True])
    assert np.array_equal(is_oob, expected), "Extrapolation guard must strictly identify out-of-bounds queries"


def test_lomo_split_disjointness():
    """Verify zero material leakage across all Leave-One-Material-Out folds."""
    df = load_same_flight_dataset()
    unique_mats = sorted(df['material'].unique())
    assert set(unique_mats) == set(SOLID_MATERIALS), f"Unexpected materials: {unique_mats}"

    for held_mat in unique_mats:
        test_mask = (df['material'] == held_mat).to_numpy()
        train_mask = ~test_mask

        tr_mats = set(df.loc[train_mask, 'material'].unique())
        te_mats = set(df.loc[test_mask, 'material'].unique())

        assert te_mats == {held_mat}
        assert held_mat not in tr_mats, f"Material leakage: {held_mat} found in training fold!"
        assert len(tr_mats.intersection(te_mats)) == 0, "Material sets must be completely disjoint"


def test_response_curve_json_integrity():
    """Verify schema, completeness, and finite bounds of data/models/m1/response_curve.json."""
    assert os.path.exists(RESPONSE_JSON_PATH), f"Missing curve JSON: {RESPONSE_JSON_PATH}"
    with open(RESPONSE_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    assert data['model_name'] == 'M1_SAME_R_Detector_Response'
    assert 'applicable_range_um' in data
    assert data['applicable_range_um']['min'] > 0.0
    assert data['applicable_range_um']['max'] > data['applicable_range_um']['min']

    curve = data.get('curve_points', [])
    assert len(curve) >= 20, f"Expected at least 20 curve points, found {len(curve)}"

    for pt in curve:
        assert 'diameter_um' in pt and isinstance(pt['diameter_um'], (int, float))
        assert 'response_multiplier_isotonic' in pt
        assert 'ci_lower_95' in pt
        assert 'ci_upper_95' in pt
        assert np.isfinite(pt['response_multiplier_isotonic'])
        assert np.isfinite(pt['ci_lower_95'])
        assert np.isfinite(pt['ci_upper_95'])
        assert pt['ci_lower_95'] <= pt['ci_upper_95'] + 1e-6
