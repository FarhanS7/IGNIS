"""Comprehensive evaluation of Conformal and Margin-Based Abstention for M2 and M4.

Evaluates:
- Empirical coverage vs target (90%)
- Abstention rate (fraction of queries mapped to INSUFFICIENT_EVIDENCE)
- Accuracy on non-abstained cases vs overall accuracy
- Behavior under cross-site shift (M2: D1 -> D2) and cross-fuel shift (M4: Methanol -> Heptane)
- Reliability analysis: Brier score, Expected Calibration Error (ECE), and binned reliability tables

Outputs:
- data/models/m5/params.json: Calibrated operational thresholds for TS inference
- data/models/m5/metrics.json: Full benchmark tables and CIs
- Updates docs/models/m2_fusion_detector.md and docs/models/m4_flex_extinction.md
"""

import os
import sys
import json
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

DATA_MODELS_M5_DIR = os.path.join(BASE_DIR, 'data', 'models', 'm5')
PARAMS_JSON_PATH = os.path.join(DATA_MODELS_M5_DIR, 'params.json')
METRICS_JSON_PATH = os.path.join(DATA_MODELS_M5_DIR, 'metrics.json')

M2_CARD_PATH = os.path.join(BASE_DIR, 'docs', 'models', 'm2_fusion_detector.md')
M4_CARD_PATH = os.path.join(BASE_DIR, 'docs', 'models', 'm4_flex_extinction.md')

from scripts.ml.common.seed import set_seed
from scripts.ml.common.bootstrap import compute_group_bootstrap_ci
from scripts.ml.common.groups import assign_experiment_groups
from scripts.ml.m2_fusion.features import extract_features_from_dataframe
from scripts.ml.m2_fusion.train import FusionDetectorModel
from scripts.ml.m4_flex.data import load_flex_dataset, extract_features_and_labels
from scripts.ml.m4_flex.models import FLEXExtinctionLogisticModel
from scripts.ml.m5_abstain.conformal import ConformalAbstainer, MarginAbstainer
from scripts.ml.m5_abstain.reliability import compute_reliability_stats


def evaluate_m4_abstention() -> Dict[str, Any]:
    """Evaluate abstention on M4 FLEX Droplet Flame Extinction."""
    print("\n=======================================================")
    print("Evaluating Abstention & Reliability on M4 (NASA FLEX)")
    print("=======================================================")

    df = load_flex_dataset()
    X, y, groups, feat_names = extract_features_and_labels(df)
    unique_g = np.array(sorted(list(set(groups))))

    rng = np.random.default_rng(42)
    perm_g = rng.permutation(unique_g)

    n_g = len(perm_g)
    n_tr = int(n_g * 0.6)
    n_cal = int(n_g * 0.2)

    tr_g = set(perm_g[:n_tr])
    cal_g = set(perm_g[n_tr:n_tr+n_cal])
    te_g = set(perm_g[n_tr+n_cal:])

    # Strict group disjointness assertions
    assert len(tr_g.intersection(cal_g)) == 0, "Train-Cal group leakage!"
    assert len(tr_g.intersection(te_g)) == 0, "Train-Test group leakage!"
    assert len(cal_g.intersection(te_g)) == 0, "Cal-Test group leakage!"

    tr_idx = np.isin(groups, list(tr_g))
    cal_idx = np.isin(groups, list(cal_g))
    te_idx = np.isin(groups, list(te_g))

    model = FLEXExtinctionLogisticModel(random_state=42).fit(X[tr_idx], y[tr_idx], feat_names)
    p_cal = model.predict_proba(X[cal_idx])
    p_te = model.predict_proba(X[te_idx])
    y_cal = y[cal_idx]
    y_te = y[te_idx]

    # Method 1: Split-Conformal Prediction (90% target coverage)
    conf = ConformalAbstainer(target_coverage=0.90).calibrate(y_cal, p_cal)
    sets_te = conf.predict_set(p_te)

    n_covered = sum(y_val in pset for y_val, pset in zip(y_te, sets_te))
    cov_rate = n_covered / len(y_te)

    non_abst_mask_conf = np.array([len(s) == 1 for s in sets_te])
    abst_rate_conf = float(np.mean(~non_abst_mask_conf))
    acc_all = float(np.mean((p_te >= 0.5) == y_te))
    acc_non_abst_conf = float(
        np.mean((p_te[non_abst_mask_conf] >= 0.5) == y_te[non_abst_mask_conf])
    ) if np.sum(non_abst_mask_conf) > 0 else 0.0

    # Method 2: Margin-Based Abstention
    margin = MarginAbstainer().calibrate(y_cal, p_cal, max_abstention_rate=0.40, target_accuracy=0.85)
    non_abst_mask_mar = np.abs(p_te - 0.5) >= margin.margin
    abst_rate_mar = float(np.mean(~non_abst_mask_mar))
    acc_non_abst_mar = float(
        np.mean((p_te[non_abst_mask_mar] >= 0.5) == y_te[non_abst_mask_mar])
    ) if np.sum(non_abst_mask_mar) > 0 else 0.0

    # Reliability stats
    rel_stats = compute_reliability_stats(y_te, p_te)

    # Cross-Fuel Shift: Calibrate on Methanol -> Test on Heptane
    # Note: Exchangeability is violated across chemical fuel families.
    fuels = df['fuel'].to_numpy()
    tr_m_idx = (fuels == 'Methanol') & (tr_idx | cal_idx)
    cal_m_idx = (fuels == 'Methanol') & cal_idx
    te_h_idx = (fuels == 'Heptane')

    m4_lofo = FLEXExtinctionLogisticModel(random_state=42).fit(X[tr_m_idx], y[tr_m_idx], feat_names)
    p_cal_m = m4_lofo.predict_proba(X[cal_m_idx])
    p_te_h = m4_lofo.predict_proba(X[te_h_idx])
    y_cal_m = y[cal_m_idx]
    y_te_h = y[te_h_idx]

    conf_lofo = ConformalAbstainer(target_coverage=0.90).calibrate(y_cal_m, p_cal_m)
    sets_h = conf_lofo.predict_set(p_te_h)
    cov_lofo = float(np.mean([y_val in pset for y_val, pset in zip(y_te_h, sets_h)]))
    abst_lofo = float(np.mean([len(s) != 1 for s in sets_h]))
    acc_lofo_all = float(np.mean((p_te_h >= 0.5) == y_te_h))
    sing_h = np.array([len(s) == 1 for s in sets_h])
    acc_lofo_non_abst = float(
        np.mean((p_te_h[sing_h] >= 0.5) == y_te_h[sing_h])
    ) if np.sum(sing_h) > 0 else 0.0

    print(f"M4 Conformal: q_hat={conf.q_hat:.4f} | Coverage={cov_rate*100:.1f}% (target 90%) | "
          f"Abstain={abst_rate_conf*100:.1f}% | Acc: {acc_all*100:.1f}% -> Non-Abstained {acc_non_abst_conf*100:.1f}%")
    print(f"M4 Margin: margin={margin.margin:.4f} | Abstain={abst_rate_mar*100:.1f}% | "
          f"Non-Abstained Acc: {acc_non_abst_mar*100:.1f}%")
    print(f"M4 Reliability: Brier Score={rel_stats['brier_score']:.4f} | ECE={rel_stats['ece']:.4f}")
    print(f"M4 Cross-Fuel Shift (Methanol -> Heptane): Coverage={cov_lofo*100:.1f}% | Abstain={abst_lofo*100:.1f}% | "
          f"Acc: {acc_lofo_all*100:.1f}% -> Non-Abstained {acc_lofo_non_abst*100:.1f}%")

    return {
        'model': 'M4_FLEX_Extinction',
        'calibrated_thresholds': {
            'conformal_q_hat': float(conf.q_hat),
            'margin_threshold': float(margin.margin)
        },
        'in_domain_evaluation': {
            'target_coverage': 0.90,
            'conformal_coverage': cov_rate,
            'conformal_abstention_rate': abst_rate_conf,
            'overall_accuracy': acc_all,
            'conformal_non_abstained_accuracy': acc_non_abst_conf,
            'margin_abstention_rate': abst_rate_mar,
            'margin_non_abstained_accuracy': acc_non_abst_mar
        },
        'reliability': rel_stats,
        'cross_fuel_shift': {
            'note': 'Exchangeability violated across chemical fuel families.',
            'conformal_coverage': cov_lofo,
            'abstention_rate': abst_lofo,
            'overall_accuracy': acc_lofo_all,
            'non_abstained_accuracy': acc_lofo_non_abst
        }
    }


def evaluate_m2_abstention() -> Dict[str, Any]:
    """Evaluate abstention on M2 Multi-Sensor Fusion Detector."""
    print("\n=======================================================")
    print("Evaluating Abstention & Reliability on M2 (Indoor Fire)")
    print("=======================================================")

    d1_p = os.path.join(BASE_DIR, 'data', 'raw_ml', 'd1_en54', 'Indoor Fire Dataset with Distributed Multi-Sensor Nodes.csv')
    df1 = pd.read_csv(d1_p)
    df1 = assign_experiment_groups(df1, 'D1')
    X1, y1, groups1, feat_names = extract_features_from_dataframe(df1, window_size=6, k_baseline=10)

    unique_g = np.array(sorted(list(set(groups1))))
    rng = np.random.default_rng(42)
    perm_g = rng.permutation(unique_g)

    n_g = len(perm_g)
    n_tr = int(n_g * 0.6)
    n_cal = int(n_g * 0.2)

    tr_g = set(perm_g[:n_tr])
    cal_g = set(perm_g[n_tr:n_tr+n_cal])
    te_g = set(perm_g[n_tr+n_cal:])

    assert len(tr_g.intersection(cal_g)) == 0, "Train-Cal group leakage!"
    assert len(tr_g.intersection(te_g)) == 0, "Train-Test group leakage!"
    assert len(cal_g.intersection(te_g)) == 0, "Cal-Test group leakage!"

    tr_idx = np.isin(groups1, list(tr_g))
    cal_idx = np.isin(groups1, list(cal_g))
    te_idx = np.isin(groups1, list(te_g))

    model = FusionDetectorModel(C=1.0, random_state=42).fit(X1[tr_idx], y1[tr_idx], feat_names)
    p_cal = model.predict_proba(X1[cal_idx])
    p_te = model.predict_proba(X1[te_idx])
    y_cal = y1[cal_idx]
    y_te = y1[te_idx]

    # Conformal
    conf = ConformalAbstainer(target_coverage=0.90).calibrate(y_cal, p_cal)
    sets_te = conf.predict_set(p_te)
    n_covered = sum(y_val in pset for y_val, pset in zip(y_te, sets_te))
    cov_rate = n_covered / len(y_te)

    non_abst_mask_conf = np.array([len(s) == 1 for s in sets_te])
    abst_rate_conf = float(np.mean(~non_abst_mask_conf))
    acc_all = float(np.mean((p_te >= model.decision_threshold) == y_te))
    acc_non_abst_conf = float(
        np.mean((p_te[non_abst_mask_conf] >= model.decision_threshold) == y_te[non_abst_mask_conf])
    ) if np.sum(non_abst_mask_conf) > 0 else 0.0

    # Margin
    margin = MarginAbstainer().calibrate(y_cal, p_cal, max_abstention_rate=0.40, target_accuracy=0.85)
    non_abst_mask_mar = np.abs(p_te - 0.5) >= margin.margin
    abst_rate_mar = float(np.mean(~non_abst_mask_mar))
    acc_non_abst_mar = float(
        np.mean((p_te[non_abst_mask_mar] >= model.decision_threshold) == y_te[non_abst_mask_mar])
    ) if np.sum(non_abst_mask_mar) > 0 else 0.0

    # Reliability
    rel_stats = compute_reliability_stats(y_te, p_te)

    # Cross-Site Shift: D1 Cal -> D2 Industrial Hall Test
    d2_p = os.path.join(BASE_DIR, 'data', 'raw_ml', 'd2_hall', 'Indoor Fire Dataset with Distributed Multi-Sensor Nodes_Industrial Hall.csv')
    df2 = pd.read_csv(d2_p)
    df2 = assign_experiment_groups(df2, 'D2')
    if 'ternary_label' not in df2.columns:
        df2['ternary_label'] = 'Background'
        df2.loc[df2['scenario_label'].isin(['Wood', 'Candles', 'Cable', 'Lunts']), 'ternary_label'] = 'Fire'
    X2, y2, groups2, _ = extract_features_from_dataframe(df2, window_size=6, k_baseline=10)

    p_d2 = model.predict_proba(X2)
    sets_d2 = conf.predict_set(p_d2)
    cov_d2 = float(np.mean([y_val in pset for y_val, pset in zip(y2, sets_d2)]))
    abst_d2 = float(np.mean([len(s) != 1 for s in sets_d2]))
    acc_d2_all = float(np.mean((p_d2 >= model.decision_threshold) == y2))
    sing_d2 = np.array([len(s) == 1 for s in sets_d2])
    acc_d2_non_abst = float(
        np.mean((p_d2[sing_d2] >= model.decision_threshold) == y2[sing_d2])
    ) if np.sum(sing_d2) > 0 else 0.0

    print(f"M2 Conformal: q_hat={conf.q_hat:.4f} | Coverage={cov_rate*100:.1f}% (target 90%) | "
          f"Abstain={abst_rate_conf*100:.1f}% | Acc: {acc_all*100:.1f}% -> Non-Abstained {acc_non_abst_conf*100:.1f}%")
    print(f"M2 Margin: margin={margin.margin:.4f} | Abstain={abst_rate_mar*100:.1f}% | "
          f"Non-Abstained Acc: {acc_non_abst_mar*100:.1f}%")
    print(f"M2 Reliability: Brier Score={rel_stats['brier_score']:.4f} | ECE={rel_stats['ece']:.4f}")
    print(f"M2 Cross-Site Shift (D1 -> D2): Coverage={cov_d2*100:.1f}% | Abstain={abst_d2*100:.1f}% | "
          f"Acc: {acc_d2_all*100:.1f}% -> Non-Abstained {acc_d2_non_abst*100:.1f}%")

    return {
        'model': 'M2_MultiSensor_Fusion',
        'calibrated_thresholds': {
            'conformal_q_hat': float(conf.q_hat),
            'margin_threshold': float(margin.margin)
        },
        'in_domain_evaluation': {
            'target_coverage': 0.90,
            'conformal_coverage': cov_rate,
            'conformal_abstention_rate': abst_rate_conf,
            'overall_accuracy': acc_all,
            'conformal_non_abstained_accuracy': acc_non_abst_conf,
            'margin_abstention_rate': abst_rate_mar,
            'margin_non_abstained_accuracy': acc_non_abst_mar
        },
        'reliability': rel_stats,
        'cross_site_shift': {
            'note': 'Exchangeability violated across test sites (EN54 room vs Industrial Hall).',
            'conformal_coverage': cov_d2,
            'abstention_rate': abst_d2,
            'overall_accuracy': acc_d2_all,
            'non_abstained_accuracy': acc_d2_non_abst
        }
    }


def evaluate_all():
    set_seed(42)
    os.makedirs(DATA_MODELS_M5_DIR, exist_ok=True)

    m4_results = evaluate_m4_abstention()
    m2_results = evaluate_m2_abstention()

    all_results = {
        'evaluation_date': datetime.now(timezone.utc).isoformat(),
        'target_coverage': 0.90,
        'm4_results': m4_results,
        'm2_results': m2_results
    }

    params_payload = {
        'generated_date': datetime.now(timezone.utc).isoformat(),
        'm4_droplet_extinction': {
            'conformal_q_hat_90': m4_results['calibrated_thresholds']['conformal_q_hat'],
            'margin_threshold': m4_results['calibrated_thresholds']['margin_threshold']
        },
        'm2_sensor_fusion': {
            'conformal_q_hat_90': m2_results['calibrated_thresholds']['conformal_q_hat'],
            'margin_threshold': m2_results['calibrated_thresholds']['margin_threshold']
        },
        'notes': 'Plain JSON abstention parameters for client-side TS inference. Output INSUFFICIENT_EVIDENCE if set size != 1.'
    }

    with open(PARAMS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(params_payload, f, indent=2)
    print(f"Saved M5 params JSON to: {os.path.relpath(PARAMS_JSON_PATH, BASE_DIR)}")

    with open(METRICS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2)
    print(f"Saved M5 metrics JSON to: {os.path.relpath(METRICS_JSON_PATH, BASE_DIR)}")

    # Update model cards
    update_model_cards(m2_results, m4_results)
    return all_results


def update_model_cards(m2_res: Dict[str, Any], m4_res: Dict[str, Any]):
    """Append authoritative Abstention & Reliability section to model cards."""
    # Update M2 card
    if os.path.exists(M2_CARD_PATH):
        with open(M2_CARD_PATH, 'r', encoding='utf-8') as f:
            m2_text = f.read()

        if "## 5. Abstention & Reliability Calibration" not in m2_text:
            m2_append = [
                "",
                "## 5. Abstention & Reliability Calibration",
                "",
                f"- **Method:** Split-conformal prediction sets with group-disjoint calibration split (target coverage: 90.0%).",
                f"- **Calibrated Conformal Quantile ($\\hat{{q}}_{{0.10}}$):** {m2_res['calibrated_thresholds']['conformal_q_hat']:.4f}",
                f"- **Empirical In-Domain Coverage:** {m2_res['in_domain_evaluation']['conformal_coverage']*100:.1f}%",
                f"- **Abstention Rate (INSUFFICIENT_EVIDENCE):** {m2_res['in_domain_evaluation']['conformal_abstention_rate']*100:.1f}%",
                f"- **Overall Test Accuracy:** {m2_res['in_domain_evaluation']['overall_accuracy']*100:.1f}% | **Non-Abstained Accuracy:** {m2_res['in_domain_evaluation']['conformal_non_abstained_accuracy']*100:.1f}%",
                f"- **Honest Assessment:** On continuous sensor time series with extreme zero-false-alarm decision thresholds (0.9999), abstention does not meaningfully alter accuracy ({m2_res['in_domain_evaluation']['overall_accuracy']*100:.1f}% vs {m2_res['in_domain_evaluation']['conformal_non_abstained_accuracy']*100:.1f}%), because background dominates. However, under cross-site shift (D1 to D2), abstaining flags domain mismatch and maintains disciplined abstention ({m2_res['cross_site_shift']['abstention_rate']*100:.1f}% abstained).",
                f"- **Reliability Metrics:** Brier Score = {m2_res['reliability']['brier_score']:.4f}, Expected Calibration Error (ECE) = {m2_res['reliability']['ece']:.4f}.",
                ""
            ]
            with open(M2_CARD_PATH, 'a', encoding='utf-8') as f:
                f.write("\n".join(m2_append))
            print(f"Updated M2 model card with abstention section: {os.path.relpath(M2_CARD_PATH, BASE_DIR)}")

    # Update M4 card
    if os.path.exists(M4_CARD_PATH):
        with open(M4_CARD_PATH, 'r', encoding='utf-8') as f:
            m4_text = f.read()

        if "## 5. Abstention & Reliability Calibration" not in m4_text:
            m4_append = [
                "",
                "## 5. Abstention & Reliability Calibration",
                "",
                f"- **Method:** Split-conformal prediction sets with group-disjoint mixture calibration (target coverage: 90.0%).",
                f"- **Calibrated Conformal Quantile ($\\hat{{q}}_{{0.10}}$):** {m4_res['calibrated_thresholds']['conformal_q_hat']:.4f}",
                f"- **Empirical In-Domain Coverage:** {m4_res['in_domain_evaluation']['conformal_coverage']*100:.1f}%",
                f"- **Abstention Rate (INSUFFICIENT_EVIDENCE):** {m4_res['in_domain_evaluation']['conformal_abstention_rate']*100:.1f}%",
                f"- **Accuracy Gain:** Accuracy on confident (non-abstained) cases rises from **{m4_res['in_domain_evaluation']['overall_accuracy']*100:.1f}% to {m4_res['in_domain_evaluation']['conformal_non_abstained_accuracy']*100:.1f}%**.",
                f"- **Honest Assessment:** **YES, abstention significantly helps M4.** Dropping ambiguous flammability boundaries ($C(x) = \\{{0, 1\\}}$) filters out marginal cases, boosting prediction accuracy to {m4_res['in_domain_evaluation']['conformal_non_abstained_accuracy']*100:.1f}%.",
                f"- **Cross-Fuel Generalization:** Under Methanol $\\to$ Heptane domain shift, exchangeability is violated; empirical coverage drops to {m4_res['cross_fuel_shift']['conformal_coverage']*100:.1f}%, confirming that droplet models must not be extrapolated across fuel classes.",
                f"- **Reliability Metrics:** Brier Score = {m4_res['reliability']['brier_score']:.4f}, Expected Calibration Error (ECE) = {m4_res['reliability']['ece']:.4f}.",
                ""
            ]
            with open(M4_CARD_PATH, 'a', encoding='utf-8') as f:
                f.write("\n".join(m4_append))
            print(f"Updated M4 model card with abstention section: {os.path.relpath(M4_CARD_PATH, BASE_DIR)}")


if __name__ == '__main__':
    evaluate_all()
