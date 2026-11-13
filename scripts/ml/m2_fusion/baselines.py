"""Baseline detectors for fire detection benchmark comparison.

B1: Particulate matter threshold detector (smoke proxy)
B2: Carbon monoxide threshold detector (CO)
B3: Rule fusion detector (Particulate AND Carbon Monoxide)

Operating point: Selected on the TRAIN fold as the most sensitive threshold
yielding ZERO false alarms on that fold's nuisance + background data.
"""

from typing import Dict, Any, Optional
import numpy as np


class ThresholdBaselineDetector:
    """Base single-channel or dual-channel threshold detector."""

    def __init__(self, mode: str = "B1"):
        assert mode in ["B1", "B2", "B3"], f"Unknown mode: {mode}"
        self.mode = mode
        self.threshold_smoke: float = float('inf')
        self.threshold_co: float = float('inf')

    def fit(self, X: np.ndarray, y: np.ndarray) -> "ThresholdBaselineDetector":
        """Fit thresholds on training data only.

        Operating point rule: Minimum threshold above all non-fire samples (y == 0),
        yielding ZERO false alarms on training nuisance and background data.
        """
        # Feature indices: L_smoke = 0, L_co = 1
        non_fire_mask = (y == 0)

        if not np.any(non_fire_mask):
            self.threshold_smoke = 1.0
            self.threshold_co = 1.0
            return self

        smoke_levels_neg = X[non_fire_mask, 0]
        co_levels_neg = X[non_fire_mask, 1]

        # Zero false alarm threshold on training negatives (+ tiny safety margin)
        max_smoke_neg = float(np.max(smoke_levels_neg)) if len(smoke_levels_neg) > 0 else 0.0
        max_co_neg = float(np.max(co_levels_neg)) if len(co_levels_neg) > 0 else 0.0

        if self.mode == "B1":
            self.threshold_smoke = max_smoke_neg + 1e-4
            self.threshold_co = float('-inf')
        elif self.mode == "B2":
            self.threshold_smoke = float('-inf')
            self.threshold_co = max_co_neg + 1e-4
        elif self.mode == "B3":
            # For AND rule: threshold can be looser if both must exceed,
            # or individual max negatives
            self.threshold_smoke = float(np.percentile(smoke_levels_neg, 95)) + 1e-4
            self.threshold_co = float(np.percentile(co_levels_neg, 95)) + 1e-4

            # Enforce zero false alarms on training negatives
            while True:
                alarm = (smoke_levels_neg >= self.threshold_smoke) & (co_levels_neg >= self.threshold_co)
                if not np.any(alarm):
                    break
                # Increase thresholds slightly until zero false alarms
                self.threshold_smoke *= 1.05
                self.threshold_co *= 1.05

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict binary fire alarm (1 = Fire Alarm, 0 = Nominal/No Alarm)."""
        smoke_vals = X[:, 0]
        co_vals = X[:, 1]

        if self.mode == "B1":
            return (smoke_vals >= self.threshold_smoke).astype(int)
        elif self.mode == "B2":
            return (co_vals >= self.threshold_co).astype(int)
        elif self.mode == "B3":
            return ((smoke_vals >= self.threshold_smoke) & (co_vals >= self.threshold_co)).astype(int)
        return np.zeros(len(X), dtype=int)

