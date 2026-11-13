"""Tests for model exports and golden vector suites (Step 08).

Validates:
1. Exported model JSON files exist in apps/web/src/data/models/.
2. File sizes are strictly < 300 KB.
3. Schemas conform to specification, including dataset DOIs, git commit, and mandatory disclaimers.
4. Golden test vector files exist in data/models/golden/ with >= 100 cases each.
5. Freshness check: re-exporting to a temporary directory matches the committed model exports.
"""

import os
import json
import tempfile
import pytest

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))

MODELS_EXPORT_DIR = os.path.join(BASE_DIR, 'apps', 'web', 'src', 'data', 'models')
GOLDEN_DIR = os.path.join(BASE_DIR, 'data', 'models', 'golden')

from scripts.ml.export.export_models import export_all, build_m2_export, build_m4_export, build_m1_export, load_manifest_lookup, get_git_commit


def test_exported_model_files_exist_and_size():
    """Verify all 3 model files exist and are strictly < 300 KB."""
    expected_files = [
        'm2-fusion-v1.json',
        'm4-extinction-v1.json',
        'm1-response-curve-v1.json'
    ]

    for fname in expected_files:
        p = os.path.join(MODELS_EXPORT_DIR, fname)
        assert os.path.exists(p), f"Exported model missing: {p}"
        size_bytes = os.path.getsize(p)
        assert size_bytes < 300 * 1024, f"{fname} exceeds 300 KB limit ({size_bytes} bytes)"
        assert size_bytes > 500, f"{fname} is suspiciously small ({size_bytes} bytes)"


def test_m2_model_export_schema():
    """Verify M2 export schema, provenance, and mandatory limitations."""
    p = os.path.join(MODELS_EXPORT_DIR, 'm2-fusion-v1.json')
    with open(p, 'r', encoding='utf-8') as f:
        m2 = json.load(f)

    assert m2['model_id'] == 'm2-fusion-v1'
    assert m2['type'] == 'logistic'
    assert len(m2['feature_names']) == 10
    assert len(m2['params']['coef']) == 10
    assert len(m2['preprocessing']['scaler_mean']) == 10
    assert len(m2['preprocessing']['scaler_scale']) == 10
    assert isinstance(m2['params']['intercept'], (int, float))
    assert 'conformal_q_hat_90' in m2['abstention']
    assert 'decision_threshold' in m2['operating_point']
    assert m2['source_tag'] == 'trained:m2-fusion-v1'

    # Datasets provenance
    assert len(m2['training']['datasets']) >= 1
    d1 = m2['training']['datasets'][0]
    assert d1['id'] == 'D1'
    assert d1['doi'].strip()
    assert len(d1['sha256']) == 64

    # Git commit
    assert len(m2['training']['git_commit']) >= 7

    # Mandatory honest disclaimers
    limitations = " ".join(m2['limitations'])
    assert "Simulated sensor data. Not flight software." in limitations
    assert "Not validated in microgravity." in limitations


def test_m4_model_export_schema():
    """Verify M4 export schema, provenance, and mandatory caveats."""
    p = os.path.join(MODELS_EXPORT_DIR, 'm4-extinction-v1.json')
    with open(p, 'r', encoding='utf-8') as f:
        m4 = json.load(f)

    assert m4['model_id'] == 'm4-extinction-v1'
    assert m4['type'] == 'logistic'
    assert len(m4['feature_names']) == 7
    assert len(m4['params']['coef']) == 7
    assert len(m4['preprocessing']['scaler_mean']) == 7
    assert len(m4['preprocessing']['scaler_scale']) == 7
    assert 'conformal_q_hat_90' in m4['abstention']
    assert m4['operating_point']['decision_threshold'] == 0.55
    assert m4['source_tag'] == 'calibrated:flex-extinction-v1'

    # Datasets provenance
    assert len(m4['training']['datasets']) >= 1
    d6 = m4['training']['datasets'][0]
    assert d6['id'] == 'D6'
    assert d6['doi'].strip()
    assert len(d6['sha256']) == 64

    # Limitations
    limitations = " ".join(m4['limitations'])
    assert "Simulated sensor data. Not flight software." in limitations
    assert "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels." in limitations


def test_m1_model_export_schema():
    """Verify M1 calibrated response curve schema and small particle penalty."""
    p = os.path.join(MODELS_EXPORT_DIR, 'm1-response-curve-v1.json')
    with open(p, 'r', encoding='utf-8') as f:
        m1 = json.load(f)

    assert m1['model_id'] == 'm1-response-curve-v1'
    assert m1['type'] == 'calibrated_curve'
    assert len(m1['curve_points']) >= 20
    assert 'small_particle_penalty_calibrated' in m1
    teflon_pen = m1['small_particle_penalty_calibrated']['teflon_mean_multiplier']
    assert 0.1 <= teflon_pen <= 0.5, f"Unexpected Teflon penalty: {teflon_pen}"

    limitations = " ".join(m1['limitations'])
    assert "Simulated sensor data. Not flight software." in limitations


def test_golden_vectors_exist_and_case_count():
    """Verify all 3 golden test suites exist with >= 100 cases."""
    golden_files = [
        ('m2-fusion-v1.golden.json', 100),
        ('m4-extinction-v1.golden.json', 100),
        ('m1-response-curve-v1.golden.json', 100),
    ]

    for fname, min_cases in golden_files:
        p = os.path.join(GOLDEN_DIR, fname)
        assert os.path.exists(p), f"Missing golden vector file: {p}"
        with open(p, 'r', encoding='utf-8') as f:
            data = json.load(f)
        assert 'cases' in data, f"{fname} missing 'cases' key"
        assert len(data['cases']) >= min_cases, f"{fname} has only {len(data['cases'])} cases, expected >= {min_cases}"


def test_exported_models_freshness():
    """Re-export all models to a temporary directory and verify byte/value equality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        out_paths = export_all(temp_dir)

        for fname, temp_path in out_paths.items():
            committed_path = os.path.join(MODELS_EXPORT_DIR, fname)
            assert os.path.exists(committed_path), f"Committed file {fname} not found"

            with open(temp_path, 'r', encoding='utf-8') as f_temp:
                data_temp = json.load(f_temp)
            with open(committed_path, 'r', encoding='utf-8') as f_comm:
                data_comm = json.load(f_comm)

            # Compare model parameters and contents
            assert data_temp['model_id'] == data_comm['model_id']
            assert data_temp['version'] == data_comm['version']
            assert data_temp['type'] == data_comm['type']

            if 'params' in data_temp:
                assert data_temp['params'] == data_comm['params']
                assert data_temp['preprocessing'] == data_comm['preprocessing']
                assert data_temp['abstention'] == data_comm['abstention']
                assert data_temp['operating_point'] == data_comm['operating_point']
            elif 'curve_points' in data_temp:
                assert data_temp['curve_points'] == data_comm['curve_points']
                assert data_temp['small_particle_penalty_calibrated'] == data_comm['small_particle_penalty_calibrated']
                assert data_temp['applicable_range_um'] == data_comm['applicable_range_um']
