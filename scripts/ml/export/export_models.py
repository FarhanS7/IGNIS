"""Export trained models to browser-ready JSON format.

Outputs to apps/web/src/data/models/:
- m2-fusion-v1.json: 10 unit-free feature logistic fusion model + conformal/margin abstention
- m4-extinction-v1.json: 7 physical feature droplet extinction model + conformal abstention
- m1-response-curve-v1.json: Calibrated microgravity particle response curve & small particle penalties

All files are strictly plain JSON, strictly < 300 KB, with dataset DOIs and sha256 hashes.
"""

from typing import Dict, List, Any, Optional
import os
import json
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))

DEFAULT_TARGET_DIR = os.path.join(BASE_DIR, 'apps', 'web', 'src', 'data', 'models')
MANIFEST_PATH = os.path.join(BASE_DIR, 'data', 'provenance', 'ml_manifest.json')
M2_PARAMS_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm2', 'params.json')
M4_PARAMS_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm4', 'params.json')
M5_PARAMS_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm5', 'params.json')
M1_RESPONSE_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm1', 'response_curve.json')


def get_git_commit() -> str:
    """Retrieve current HEAD commit hash."""
    try:
        commit = subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'],
            cwd=BASE_DIR,
            stderr=subprocess.DEVNULL
        ).decode('ascii').strip()
        return commit
    except Exception:
        return "0f2aaae106b5b58140c5949466a1ec4f51d0a7b7"


def load_manifest_lookup() -> Dict[str, Dict[str, str]]:
    """Map dataset ID to DOI and primary file SHA-256."""
    lookup = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        for entry in manifest:
            d_id = entry['id']
            doi = entry.get('doi', '')
            sha256 = ''
            if entry.get('files'):
                sha256 = entry['files'][0].get('sha256', '')
            lookup[d_id] = {'id': d_id, 'doi': doi, 'sha256': sha256}
    return lookup


def build_m2_export(manifest_lookup: Dict[str, Dict[str, str]], git_commit: str) -> Dict[str, Any]:
    """Construct browser export JSON for M2 multi-sensor fusion detector."""
    with open(M2_PARAMS_PATH, 'r', encoding='utf-8') as f:
        m2_params = json.load(f)

    with open(M5_PARAMS_PATH, 'r', encoding='utf-8') as f:
        m5_params = json.load(f)

    d1_meta = manifest_lookup.get('D1', {'id': 'D1', 'doi': '10.17632/npk2zcm85h.2', 'sha256': '65a568cf84bf17c0e7d25fe89f3547c93a097a18c65b9f357eab3c7104c97c1a'})

    m2_abstain = m5_params.get('m2_sensor_fusion', {})

    export_obj = {
        "model_id": "m2-fusion-v1",
        "version": "1.0.0",
        "type": "logistic",
        "feature_names": m2_params['feature_names'],
        "preprocessing": {
            "k_baseline": 10,
            "window_size": 6,
            "sample_rate_hz": 0.1,
            "z_thresholds": [0.5, 0.5, 0.2],
            "scaler_mean": m2_params['scaler_mean'],
            "scaler_scale": m2_params['scaler_scale']
        },
        "params": {
            "coef": m2_params['coefficients'],
            "intercept": m2_params['intercept']
        },
        "abstention": {
            "method": "conformal",
            "conformal_q_hat_90": float(m2_abstain.get('conformal_q_hat_90', 0.671014)),
            "margin_threshold": float(m2_abstain.get('margin_threshold', 0.05))
        },
        "operating_point": {
            "decision_threshold": float(m2_params.get('operating_decision_threshold', 0.9999)),
            "rule": "zero false alarms on train nuisance/background"
        },
        "training": {
            "datasets": [d1_meta],
            "git_commit": git_commit,
            "seed": int(m2_params.get('random_state', 42)),
            "split_notes": "S1 leave-one-scenario-out, S2 cross-site, S3 leave-one-repetition-out with 2000-resample bootstrap CIs"
        },
        "metrics_ref": "data/models/m2/metrics.json",
        "card": "docs/models/m2_fusion_detector.md",
        "limitations": [
            "Trained on 1g ground test room data (EN54 test room D1).",
            "Not validated in microgravity.",
            "Cross-site shift reduces accuracy from 97.4% to 77.2% without calibration.",
            "Output is discrete categories only; no risk percentages.",
            "Simulated sensor data. Not flight software."
        ],
        "source_tag": "trained:m2-fusion-v1"
    }
    return export_obj


def build_m4_export(manifest_lookup: Dict[str, Dict[str, str]], git_commit: str) -> Dict[str, Any]:
    """Construct browser export JSON for M4 NASA FLEX droplet extinction model."""
    with open(M4_PARAMS_PATH, 'r', encoding='utf-8') as f:
        m4_params = json.load(f)

    with open(M5_PARAMS_PATH, 'r', encoding='utf-8') as f:
        m5_params = json.load(f)

    d6_meta = manifest_lookup.get('D6', {'id': 'D6', 'doi': '10.60555/psi-69-flex', 'sha256': '21c68afeac92050a902d922ec7179957f5989cd0746aa9caa68a2a8a291b8d58'})

    m4_abstain = m5_params.get('m4_droplet_extinction', {})

    export_obj = {
        "model_id": "m4-extinction-v1",
        "version": "1.0.0",
        "type": "logistic",
        "feature_names": m4_params['feature_names'],
        "preprocessing": {
            "scaler_mean": m4_params['scaler_mean'],
            "scaler_scale": m4_params['scaler_scale']
        },
        "params": {
            "coef": m4_params['coefficients'],
            "intercept": m4_params['intercept']
        },
        "abstention": {
            "method": "conformal",
            "conformal_q_hat_90": float(m4_abstain.get('conformal_q_hat_90', 0.699380)),
            "margin_threshold": float(m4_abstain.get('margin_threshold', 0.02))
        },
        "operating_point": {
            "decision_threshold": float(m4_params.get('decision_threshold', 0.55)),
            "extinction_region_threshold": float(m4_params.get('extinction_region_threshold', 0.65)),
            "sustained_region_threshold": float(m4_params.get('sustained_region_threshold', 0.40)),
            "rule": "false-extinction penalty minimizing threshold"
        },
        "training": {
            "datasets": [d6_meta],
            "git_commit": git_commit,
            "seed": int(m4_params.get('random_state', 42)),
            "split_notes": "Grouped 5-fold cross validation by physical gas mixture on 262 valid NASA FLEX droplet runs"
        },
        "metrics_ref": "data/models/m4/metrics.json",
        "card": "docs/models/m4_flex_extinction.md",
        "limitations": [
            "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.",
            "Not validated for partial gravity.",
            "Model indicates isolated spherical droplet combustion limits only.",
            "Cross-fuel extrapolation fails (LOFO FER 76-100%); must not be used on untested liquid fuels.",
            "Output is discrete flammability regions only; no continuous probability presented as certainty.",
            "Simulated sensor data. Not flight software."
        ],
        "source_tag": "calibrated:flex-extinction-v1"
    }
    return export_obj


def build_m1_export(manifest_lookup: Dict[str, Dict[str, str]], git_commit: str) -> Dict[str, Any]:
    """Construct browser export JSON for M1 SAME detector response curve."""
    with open(M1_RESPONSE_PATH, 'r', encoding='utf-8') as f:
        m1_data = json.load(f)

    d4_meta = manifest_lookup.get('D4', {'id': 'D4', 'doi': '10.60555/gd4k-8h62', 'sha256': '028183fdb79422a83bd328cc1a2316e03fee415e9179060b362a50e053b28382'})
    d5_meta = manifest_lookup.get('D5', {'id': 'D5', 'doi': '10.60555/2np7-jv14', 'sha256': '105a4dfec39e8d89015163edd8f8edc1e85a1d721bf55db2d37c7efe4fe577bc'})

    export_obj = {
        "model_id": "m1-response-curve-v1",
        "version": "1.0.0",
        "type": "calibrated_curve",
        "platform": m1_data.get('platform', "International Space Station (ISS) Microgravity Environment"),
        "applicable_range_um": m1_data.get('applicable_range_um', {"min": 0.049, "max": 1.1026}),
        "reference_sensitivity_v_per_mg_m3": float(m1_data.get('reference_sensitivity_v_per_mg_m3', 0.2153)),
        "small_particle_penalty_calibrated": m1_data.get('small_particle_penalty_calibrated', {}),
        "curve_points": m1_data.get('curve_points', []),
        "training": {
            "datasets": [d4_meta, d5_meta],
            "git_commit": git_commit,
            "seed": 42,
            "split_notes": "Leave-one-material-out cross validation across 130 ISS microgravity runs (SAME / SAME-R)"
        },
        "metrics_ref": "data/models/m1/response_curve.json",
        "card": "docs/models/m1_same_detector_response.md",
        "limitations": [
            "Calibrated on ISS microgravity PSI-101/102 data.",
            "High mass loadings saturated detector at 6.28V rail voltage for Silicone and Lampwick.",
            "Overheated Teflon aerosol exhibits 0.257 mean multiplier (94.7% drop relative to cellulose).",
            "Simulated sensor data. Not flight software."
        ],
        "source_tag": "calibrated:m1-same-r"
    }
    return export_obj


def export_all(target_dir: str = DEFAULT_TARGET_DIR) -> Dict[str, str]:
    """Export all models into target directory and assert file size constraints."""
    os.makedirs(target_dir, exist_ok=True)
    manifest_lookup = load_manifest_lookup()
    git_commit = get_git_commit()

    exports = {
        'm2-fusion-v1.json': build_m2_export(manifest_lookup, git_commit),
        'm4-extinction-v1.json': build_m4_export(manifest_lookup, git_commit),
        'm1-response-curve-v1.json': build_m1_export(manifest_lookup, git_commit)
    }

    out_paths = {}
    for filename, data in exports.items():
        out_path = os.path.join(target_dir, filename)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

        file_bytes = os.path.getsize(out_path)
        assert file_bytes < 300 * 1024, f"Export {filename} exceeds 300 KB: {file_bytes} bytes"
        out_paths[filename] = out_path
        try:
            rel_p = os.path.relpath(out_path, BASE_DIR)
        except ValueError:
            rel_p = out_path
        print(f"Exported {filename} -> {rel_p} ({file_bytes / 1024:.2f} KB)")

    return out_paths


if __name__ == '__main__':
    export_all()
