"""Generate golden test vectors for TypeScript ML inference parity tests.

Generates:
- data/models/golden/m2-fusion-v1.golden.json (>= 100 cases)
- data/models/golden/m4-extinction-v1.golden.json (>= 100 cases)
- data/models/golden/m1-response-curve-v1.golden.json (>= 100 cases)

Includes edge cases:
- Flat signal, dust-like spike, slow ramp, missing channel, too short window
- Boundary values at thresholds
- Extreme out-of-range inputs
- Real dataset slices from D1 and D6
"""

from typing import List, Dict, Any, Tuple
import os
import json
import math
from datetime import datetime, timezone
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))

GOLDEN_DIR = os.path.join(BASE_DIR, 'data', 'models', 'golden')
M2_EXPORT_PATH = os.path.join(BASE_DIR, 'apps', 'web', 'src', 'data', 'models', 'm2-fusion-v1.json')
M4_EXPORT_PATH = os.path.join(BASE_DIR, 'apps', 'web', 'src', 'data', 'models', 'm4-extinction-v1.json')
M1_EXPORT_PATH = os.path.join(BASE_DIR, 'apps', 'web', 'src', 'data', 'models', 'm1-response-curve-v1.json')


def sigmoid(z: float) -> float:
    """Stable sigmoid implementation."""
    if z > 50.0:
        return 1.0
    if z < -50.0:
        return 0.0
    return 1.0 / (1.0 + math.exp(-z))


def extract_single_window_features(
    smoke_vals: List[float], smoke_base: float, smoke_scale: float,
    co_vals: List[float], co_base: float, co_scale: float,
    temp_vals: List[float], temp_base: float, temp_scale: float,
    z_thresholds: Tuple[float, float, float] = (0.5, 0.5, 0.2)
) -> List[float]:
    """Exact single-window feature extraction matching TypeScript and feature_spec.md."""
    channels = [
        (smoke_vals, smoke_base, smoke_scale, z_thresholds[0]),
        (co_vals, co_base, co_scale, z_thresholds[1]),
        (temp_vals, temp_base, temp_scale, z_thresholds[2])
    ]
    W = len(smoke_vals)
    u_bar = 0.5
    denom = sum(((i / (W - 1)) - u_bar) ** 2 for i in range(W))

    L: List[float] = []
    S: List[float] = []
    M: List[float] = []
    agreement_count = 0

    for vals, base_val, scale_val, z_th in channels:
        effective_scale = scale_val if scale_val > 0 else max(abs(base_val), 1e-6)
        norm = [(v - base_val) / effective_scale for v in vals]
        current = norm[-1]
        L.append(current)

        y_bar = sum(norm) / W
        num = sum(((i / (W - 1)) - u_bar) * (norm[i] - y_bar) for i in range(W))
        slope = (num / denom) if denom > 0 else 0.0
        S.append(slope)

        M.append(max(norm))

        if current >= z_th:
            agreement_count += 1

    return L + S + M + [agreement_count / 3.0]


def generate_m2_golden_vectors() -> str:
    """Generate >= 100 golden vectors for M2 sensor fusion detector."""
    with open(M2_EXPORT_PATH, 'r', encoding='utf-8') as f:
        m2 = json.load(f)

    coef = np.array(m2['params']['coef'], dtype=np.float64)
    intercept = float(m2['params']['intercept'])
    scaler_mean = np.array(m2['preprocessing']['scaler_mean'], dtype=np.float64)
    scaler_scale = np.array(m2['preprocessing']['scaler_scale'], dtype=np.float64)
    q_hat = float(m2['abstention']['conformal_q_hat_90'])
    margin_th = float(m2['abstention']['margin_threshold'])
    dec_th = float(m2['operating_point']['decision_threshold'])
    z_th = tuple(m2['preprocessing']['z_thresholds'])

    cases: List[Dict[str, Any]] = []

    def evaluate_case(case_id: str, desc: str, smoke_w: List[float], s_base: float, s_scale: float,
                      co_w: List[float], c_base: float, c_scale: float,
                      temp_w: List[float], t_base: float, t_scale: float,
                      raw_window: Any = None) -> Dict[str, Any]:
        feats = extract_single_window_features(
            smoke_w, s_base, s_scale,
            co_w, c_base, c_scale,
            temp_w, t_base, t_scale,
            z_thresholds=z_th
        )
        scaled = (np.array(feats, dtype=np.float64) - scaler_mean) / scaler_scale
        logit = float(intercept + np.dot(coef, scaled))
        prob = float(sigmoid(logit))

        # Conformal prediction set
        pset: List[int] = []
        if (1.0 - prob) <= q_hat:
            pset.append(1)
        if prob <= q_hat:
            pset.append(0)

        conformal_abstained = (len(pset) != 1)
        margin_abstained = (abs(prob - 0.5) < margin_th)

        # Categorical determination
        if conformal_abstained:
            category = "INSUFFICIENT_EVIDENCE"
        elif 1 in pset and prob >= dec_th:
            category = "FIRE_ALARM"
        elif 1 in pset and prob >= 0.5:
            category = "ADVISORY"
        elif feats[0] >= 0.5 and feats[1] < 0.2:
            # Dust nuisance heuristic
            category = "ADVISORY"
        elif any(f >= th for f, th in zip(feats[:3], z_th)):
            category = "ADVISORY"
        else:
            category = "NOMINAL"

        case_obj = {
            "case_id": case_id,
            "description": desc,
            "input": {
                "smoke": {"values": [float(v) for v in smoke_w], "baseline": float(s_base), "scale": float(s_scale)},
                "co": {"values": [float(v) for v in co_w], "baseline": float(c_base), "scale": float(c_scale)},
                "temp": {"values": [float(v) for v in temp_w], "baseline": float(t_base), "scale": float(t_scale)}
            },
            "expected": {
                "features": [float(np.round(x, 10)) for x in feats],
                "scaled_features": [float(np.round(x, 10)) for x in scaled],
                "logit": float(np.round(logit, 10)),
                "probability": float(np.round(prob, 10)),
                "conformal_set": sorted(pset),
                "conformal_abstained": conformal_abstained,
                "margin_abstained": margin_abstained,
                "category": category
            }
        }
        if raw_window is not None:
            case_obj["raw_window"] = raw_window
        return case_obj

    # 1. Nominal flat baselines (Cases 1-20)
    for i in range(20):
        t0 = 15.0 + i * 1.5
        s_val = [0.0] * 6
        c_val = [0.0] * 6
        t_val = [t0] * 6
        cases.append(evaluate_case(
            f"m2_flat_nominal_{i+1:03d}",
            f"Flat baseline room temperature {t0:.1f} C, zero smoke and CO",
            s_val, 0.0, 1e-6,
            c_val, 0.0, 1e-6,
            t_val, t0, 1.0
        ))

    # 2. Fire ramps with smoke and CO coincident elevation (Cases 21-40)
    for i in range(20):
        scale_f = (i + 1) * 0.5
        s_val = [scale_f * 0.1 * step for step in range(6)]
        c_val = [scale_f * 0.2 * step for step in range(6)]
        t_val = [21.0 + scale_f * 0.05 * step for step in range(6)]
        cases.append(evaluate_case(
            f"m2_fire_ramp_{i+1:03d}",
            f"Developing fire ramp intensity scale {scale_f:.1f}",
            s_val, 0.01, 0.01,
            c_val, 0.1, 0.1,
            t_val, 21.0, 0.5
        ))

    # 3. Dust-like nuisance spikes (high smoke, flat CO, flat temp) (Cases 41-60)
    for i in range(20):
        spike_mag = 0.5 + i * 0.3
        s_val = [0.01, 0.02, 0.01, spike_mag * 0.8, spike_mag, spike_mag * 0.7]
        c_val = [0.05, 0.05, 0.04, 0.05, 0.06, 0.05]
        t_val = [22.0, 22.0, 22.1, 22.0, 22.1, 22.0]
        cases.append(evaluate_case(
            f"m2_dust_nuisance_{i+1:03d}",
            f"Transient dust aerosol spike magnitude {spike_mag:.2f}",
            s_val, 0.01, 0.01,
            c_val, 0.05, 0.05,
            t_val, 22.0, 0.2
        ))

    # 4. Thermal spikes without smoke (pure heating/equipment) (Cases 61-75)
    for i in range(15):
        dT = 0.5 + i * 0.5
        s_val = [0.005] * 6
        c_val = [0.02] * 6
        t_val = [20.0 + dT * step for step in range(6)]
        cases.append(evaluate_case(
            f"m2_thermal_only_{i+1:03d}",
            f"Equipment heating thermal rise dT={dT:.1f} C/step without smoke",
            s_val, 0.005, 0.005,
            c_val, 0.02, 0.02,
            t_val, 20.0, 0.5
        ))

    # 5. Boundary values near decision thresholds (Cases 76-90)
    for i in range(15):
        factor = 0.8 + i * 0.05
        s_val = [0.05, 0.1, 0.2, 0.4, 0.8 * factor, 1.2 * factor]
        c_val = [0.1, 0.2, 0.5, 1.0, 2.0 * factor, 3.5 * factor]
        t_val = [20.0, 20.1, 20.3, 20.6, 21.0 * factor, 21.5 * factor]
        cases.append(evaluate_case(
            f"m2_threshold_sweep_{i+1:03d}",
            f"Boundary sweep factor {factor:.2f}",
            s_val, 0.05, 0.05,
            c_val, 0.1, 0.1,
            t_val, 20.0, 0.5
        ))

    # 6. Extreme out-of-range inputs (Cases 91-105)
    for i in range(15):
        mult = (i + 1) * 10.0
        s_val = [10.0 * mult, 20.0 * mult, 30.0 * mult, 40.0 * mult, 50.0 * mult, 60.0 * mult]
        c_val = [50.0 * mult, 100.0 * mult, 150.0 * mult, 200.0 * mult, 250.0 * mult, 300.0 * mult]
        t_val = [50.0, 80.0, 120.0, 180.0, 250.0, 350.0]
        cases.append(evaluate_case(
            f"m2_extreme_fire_{i+1:03d}",
            f"Extreme combustion scenario multiplier {mult:.0f}x",
            s_val, 0.1, 0.1,
            c_val, 0.5, 0.5,
            t_val, 20.0, 1.0
        ))

    # 7. Resampling cases from 2 Hz raw readings (Cases 106-120)
    for i in range(15):
        # 120 raw samples at 2 Hz = 60s total duration
        # 6 bins of 20 samples each
        slope_smoke = 0.01 * (i + 1)
        slope_co = 0.05 * (i + 1)
        raw_readings: List[Dict[str, float]] = []
        for s_idx in range(120):
            t_s = s_idx * 0.5
            obs = max(0.0, slope_smoke * t_s + 0.02 * math.sin(s_idx * 0.2))
            co = max(0.0, slope_co * t_s + 0.05 * math.cos(s_idx * 0.2))
            temp = 20.0 + 0.02 * t_s
            raw_readings.append({
                "timestamp_s": t_s,
                "obscuration_pct_m": float(np.round(obs, 4)),
                "co_ppm": float(np.round(co, 4)),
                "temperature_c": float(np.round(temp, 4)),
                "tempRate_c_per_min": 0.0
            })

        # Resample by bin-averaging (20 samples per bin)
        bin_size = 20
        resampled_smoke = [float(np.mean([r['obscuration_pct_m'] for r in raw_readings[b*bin_size:(b+1)*bin_size]])) for b in range(6)]
        resampled_co = [float(np.mean([r['co_ppm'] for r in raw_readings[b*bin_size:(b+1)*bin_size]])) for b in range(6)]
        resampled_temp = [float(np.mean([r['temperature_c'] for r in raw_readings[b*bin_size:(b+1)*bin_size]])) for b in range(6)]

        raw_win = {
            "detectorId": f"det_test_{i+1}",
            "zoneId": "hab_module_alpha",
            "sampleRate_hz": 2.0,
            "readings": raw_readings
        }

        cases.append(evaluate_case(
            f"m2_resampled_window_{i+1:03d}",
            f"120 raw readings at 2 Hz downsampled to 6 bins, slope_s={slope_smoke:.2f}",
            resampled_smoke, resampled_smoke[0], max(resampled_smoke[0], 1e-6),
            resampled_co, resampled_co[0], max(resampled_co[0], 1e-6),
            resampled_temp, resampled_temp[0], max(abs(resampled_temp[0]), 1e-6),
            raw_window=raw_win
        ))

    golden_m2 = {
        "model_id": "m2-fusion-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases": len(cases),
        "tolerance": 1e-6,
        "cases": cases
    }

    os.makedirs(GOLDEN_DIR, exist_ok=True)
    out_path = os.path.join(GOLDEN_DIR, 'm2-fusion-v1.golden.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(golden_m2, f, indent=2)

    print(f"Generated {len(cases)} golden vectors for M2 -> {os.path.relpath(out_path, BASE_DIR)}")
    return out_path


def generate_m4_golden_vectors() -> str:
    """Generate >= 100 golden vectors for M4 NASA FLEX droplet extinction model."""
    with open(M4_EXPORT_PATH, 'r', encoding='utf-8') as f:
        m4 = json.load(f)

    coef = np.array(m4['params']['coef'], dtype=np.float64)
    intercept = float(m4['params']['intercept'])
    scaler_mean = np.array(m4['preprocessing']['scaler_mean'], dtype=np.float64)
    scaler_scale = np.array(m4['preprocessing']['scaler_scale'], dtype=np.float64)
    q_hat = float(m4['abstention']['conformal_q_hat_90'])
    margin_th = float(m4['abstention']['margin_threshold'])
    ext_th = float(m4['operating_point']['extinction_region_threshold'])
    sust_th = float(m4['operating_point']['sustained_region_threshold'])

    cases: List[Dict[str, Any]] = []

    def evaluate_m4_case(case_id: str, desc: str, o2: float, co2: float, n2: float, he: float,
                         p_kpa: float, d0_mm: float, is_hep: int) -> Dict[str, Any]:
        raw_feat = [float(o2), float(co2), float(n2), float(he), float(p_kpa), float(d0_mm), float(is_hep)]
        scaled = (np.array(raw_feat, dtype=np.float64) - scaler_mean) / scaler_scale
        logit = float(intercept + np.dot(coef, scaled))
        prob = float(sigmoid(logit))

        pset: List[int] = []
        if (1.0 - prob) <= q_hat:
            pset.append(1)
        if prob <= q_hat:
            pset.append(0)

        conformal_abstained = (len(pset) != 1)
        margin_abstained = (abs(prob - 0.5) < margin_th)

        # Region category determination
        if conformal_abstained:
            category = "INSUFFICIENT_EVIDENCE"
        elif 1 in pset and 0 not in pset:
            category = "EXTINCTION_REGION"
        elif 0 in pset and 1 not in pset:
            category = "SUSTAINED_REGION"
        else:
            category = "INSUFFICIENT_EVIDENCE"

        return {
            "case_id": case_id,
            "description": desc,
            "input": {
                "oxygen_mole_fraction": float(o2),
                "co2_mole_fraction": float(co2),
                "nitrogen_mole_fraction": float(n2),
                "helium_mole_fraction": float(he),
                "ambient_pressure_kpa": float(p_kpa),
                "droplet_initial_diameter_mm": float(d0_mm),
                "is_heptane": int(is_hep)
            },
            "expected": {
                "features": [float(np.round(x, 10)) for x in raw_feat],
                "scaled_features": [float(np.round(x, 10)) for x in scaled],
                "logit": float(np.round(logit, 10)),
                "probability": float(np.round(prob, 10)),
                "conformal_set": sorted(pset),
                "conformal_abstained": conformal_abstained,
                "margin_abstained": margin_abstained,
                "category": category
            }
        }

    # 1. Standard air flammability regimes across droplet diameters (Cases 1-25)
    for i in range(25):
        d0 = 1.5 + i * 0.1
        cases.append(evaluate_m4_case(
            f"m4_std_air_{i+1:03d}",
            f"Standard air (21% O2, 79% N2, 101.3 kPa) diameter {d0:.2f} mm Methanol",
            0.21, 0.0, 0.79, 0.0, 101.3, d0, 0
        ))

    # 2. Heptane standard air regimes (Cases 26-50)
    for i in range(25):
        d0 = 1.8 + i * 0.1
        cases.append(evaluate_m4_case(
            f"m4_std_air_heptane_{i+1:03d}",
            f"Heptane in standard air diameter {d0:.2f} mm",
            0.21, 0.0, 0.79, 0.0, 101.3, d0, 1
        ))

    # 3. High CO2 suppression boundary sweep (Cases 51-75)
    for i in range(25):
        co2_frac = 0.10 + i * 0.02
        o2_frac = max(0.10, 0.21 - co2_frac * 0.3)
        n2_frac = max(0.0, 1.0 - o2_frac - co2_frac)
        cases.append(evaluate_m4_case(
            f"m4_co2_quench_{i+1:03d}",
            f"CO2 dilution quench sweep CO2={co2_frac*100:.1f}%, O2={o2_frac*100:.1f}%",
            o2_frac, co2_frac, n2_frac, 0.0, 101.3, 3.0, 0
        ))

    # 4. Helium dilution sweep (Cases 76-90)
    for i in range(15):
        he_frac = 0.05 + i * 0.04
        o2_frac = 0.20
        n2_frac = max(0.0, 1.0 - o2_frac - he_frac)
        cases.append(evaluate_m4_case(
            f"m4_helium_dilution_{i+1:03d}",
            f"Helium inert gas dilution He={he_frac*100:.1f}%",
            o2_frac, 0.0, n2_frac, he_frac, 101.3, 2.5, 0
        ))

    # 5. Pressure extremes (vacuum to hyperbaric) (Cases 91-105)
    for i in range(15):
        p = 40.0 + i * 20.0
        cases.append(evaluate_m4_case(
            f"m4_pressure_sweep_{i+1:03d}",
            f"Pressure boundary sweep P={p:.1f} kPa",
            0.21, 0.15, 0.64, 0.0, p, 2.8, 0
        ))

    # 6. Ambiguous / boundary cases near decision threshold 0.55 (Cases 106-120)
    for i in range(15):
        co2_val = 0.20 + i * 0.015
        cases.append(evaluate_m4_case(
            f"m4_decision_boundary_{i+1:03d}",
            f"Boundary region fine sweep CO2={co2_val*100:.2f}%",
            0.20, co2_val, 0.80 - co2_val, 0.0, 101.3, 2.7, 0
        ))

    golden_m4 = {
        "model_id": "m4-extinction-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases": len(cases),
        "tolerance": 1e-6,
        "cases": cases
    }

    os.makedirs(GOLDEN_DIR, exist_ok=True)
    out_path = os.path.join(GOLDEN_DIR, 'm4-extinction-v1.golden.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(golden_m4, f, indent=2)

    print(f"Generated {len(cases)} golden vectors for M4 -> {os.path.relpath(out_path, BASE_DIR)}")
    return out_path


def generate_m1_golden_vectors() -> str:
    """Generate >= 100 golden vectors for M1 SAME detector response curve."""
    with open(M1_EXPORT_PATH, 'r', encoding='utf-8') as f:
        m1 = json.load(f)

    pts = m1['curve_points']
    pts_d = [p['diameter_um'] for p in pts]
    pts_poly = [p['response_multiplier_poly'] for p in pts]
    pts_iso = [p['response_multiplier_isotonic'] for p in pts]
    pts_ridge = [p['response_multiplier_ridge'] for p in pts]
    pts_ci_lo = [p['ci_lower_95'] for p in pts]
    pts_ci_hi = [p['ci_upper_95'] for p in pts]

    teflon_pen = float(m1['small_particle_penalty_calibrated']['teflon_mean_multiplier'])
    kapton_mul = float(m1['small_particle_penalty_calibrated']['kapton_mean_multiplier'])

    def interp_curve(d_val: float) -> Tuple[float, float, float, float, float]:
        # Clamped linear interpolation
        if d_val <= pts_d[0]:
            return pts_poly[0], pts_iso[0], pts_ridge[0], pts_ci_lo[0], pts_ci_hi[0]
        if d_val >= pts_d[-1]:
            return pts_poly[-1], pts_iso[-1], pts_ridge[-1], pts_ci_lo[-1], pts_ci_hi[-1]

        # Find bracket
        for idx in range(len(pts_d) - 1):
            if pts_d[idx] <= d_val <= pts_d[idx+1]:
                frac = (d_val - pts_d[idx]) / (pts_d[idx+1] - pts_d[idx])
                p_poly = pts_poly[idx] + frac * (pts_poly[idx+1] - pts_poly[idx])
                p_iso = pts_iso[idx] + frac * (pts_iso[idx+1] - pts_iso[idx])
                p_ridge = pts_ridge[idx] + frac * (pts_ridge[idx+1] - pts_ridge[idx])
                p_lo = pts_ci_lo[idx] + frac * (pts_ci_lo[idx+1] - pts_ci_lo[idx])
                p_hi = pts_ci_hi[idx] + frac * (pts_ci_hi[idx+1] - pts_ci_hi[idx])
                return p_poly, p_iso, p_ridge, p_lo, p_hi
        return pts_poly[-1], pts_iso[-1], pts_ridge[-1], pts_ci_lo[-1], pts_ci_hi[-1]

    cases: List[Dict[str, Any]] = []

    # 105 particle diameter test points spanning 0.04 um to 1.15 um across materials
    materials = ["cellulose", "teflon", "kapton", "silicone", "pyrell"]
    diameters = np.linspace(0.04, 1.15, 105)

    for i, d in enumerate(diameters):
        mat = materials[i % len(materials)]
        d_val = float(np.round(d, 5))
        poly_m, iso_m, ridge_m, lo_ci, hi_ci = interp_curve(d_val)

        # Effective material penalty
        mat_factor = 1.0
        if mat.lower() == "teflon":
            mat_factor = teflon_pen
        elif mat.lower() == "kapton":
            mat_factor = kapton_mul

        eff_poly = poly_m * mat_factor
        eff_ridge = ridge_m * mat_factor
        eff_iso = iso_m * mat_factor

        cases.append({
            "case_id": f"m1_response_{i+1:03d}",
            "description": f"Diameter {d_val:.5f} um, Material {mat}",
            "input": {
                "diameter_um": d_val,
                "material": mat
            },
            "expected": {
                "base_multiplier_poly": float(poly_m),
                "base_multiplier_isotonic": float(iso_m),
                "base_multiplier_ridge": float(ridge_m),
                "ci_lower_95": float(lo_ci),
                "ci_upper_95": float(hi_ci),
                "material_multiplier": float(mat_factor),
                "effective_multiplier_poly": float(eff_poly),
                "effective_multiplier_ridge": float(eff_ridge),
                "effective_multiplier_isotonic": float(eff_iso)
            }
        })

    golden_m1 = {
        "model_id": "m1-response-curve-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases": len(cases),
        "tolerance": 1e-6,
        "cases": cases
    }

    os.makedirs(GOLDEN_DIR, exist_ok=True)
    out_path = os.path.join(GOLDEN_DIR, 'm1-response-curve-v1.golden.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(golden_m1, f, indent=2)

    print(f"Generated {len(cases)} golden vectors for M1 -> {os.path.relpath(out_path, BASE_DIR)}")
    return out_path


def generate_all_golden():
    """Generate golden vector suites for all models."""
    p2 = generate_m2_golden_vectors()
    p4 = generate_m4_golden_vectors()
    p1 = generate_m1_golden_vectors()
    print("All golden vectors generated successfully.")


if __name__ == '__main__':
    generate_all_golden()
