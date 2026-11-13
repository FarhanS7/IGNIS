"""Reliability calibration analysis and metrics for fire detection models.

Computes:
1. Brier Score: Mean squared error of probabilistic predictions
2. Expected Calibration Error (ECE): Uniformly partitioned confidence error
3. Reliability Table: Binned predicted confidence vs observed empirical frequency
"""

from typing import Dict, List, Any
import numpy as np


def compute_reliability_stats(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10
) -> Dict[str, Any]:
    """Compute calibration metrics and reliability table over probability bins."""
    assert len(y_true) == len(y_prob), "Arrays must have identical length"
    n_total = len(y_true)
    if n_total == 0:
        return {'brier_score': 0.0, 'ece': 0.0, 'reliability_table': []}

    brier = float(np.mean((y_prob - y_true) ** 2))
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    table: List[Dict[str, Any]] = []
    ece = 0.0

    for lo, hi in zip(bins[:-1], bins[1:]):
        if hi == 1.0:
            mask = (y_prob >= lo) & (y_prob <= hi)
        else:
            mask = (y_prob >= lo) & (y_prob < hi)

        count = int(np.sum(mask))
        if count > 0:
            mean_conf = float(np.mean(y_prob[mask]))
            emp_freq = float(np.mean(y_true[mask]))
            gap = abs(mean_conf - emp_freq)
            ece += (count / n_total) * gap
        else:
            mean_conf = float((lo + hi) / 2.0)
            emp_freq = 0.0
            gap = 0.0

        table.append({
            'bin_range': f"[{lo:.2f}, {hi:.2f}]" if hi == 1.0 else f"[{lo:.2f}, {hi:.2f})",
            'sample_count': count,
            'mean_confidence': float(np.round(mean_conf, 4)),
            'empirical_frequency': float(np.round(emp_freq, 4)),
            'calibration_gap': float(np.round(gap, 4))
        })

    return {
        'brier_score': float(np.round(brier, 4)),
        'ece': float(np.round(ece, 4)),
        'reliability_table': table
    }

