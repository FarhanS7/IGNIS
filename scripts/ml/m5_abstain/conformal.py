"""Conformal and margin-based abstention methods for spacecraft fire response.

Implements:
1. ConformalAbstainer: Split-conformal prediction sets with guaranteed finite-sample coverage
   under exchangeability, returning INSUFFICIENT_EVIDENCE for ambiguous sets (set size != 1).
2. MarginAbstainer: Confidence margin thresholding (|p - 0.5| < margin_threshold),
   calibrated on an independent group-disjoint split.
"""

from typing import List, Dict, Tuple, Optional, Set
import numpy as np


class ConformalAbstainer:
    """Split-conformal prediction set classifier for binary detection."""

    def __init__(self, target_coverage: float = 0.90):
        self.target_coverage = target_coverage
        self.alpha = 1.0 - target_coverage
        self.q_hat: float = 1.0
        self.is_calibrated: bool = False

    def calibrate(self, y_cal: np.ndarray, p_cal: np.ndarray) -> "ConformalAbstainer":
        """Compute non-conformity quantile q_hat on independent calibration split."""
        assert len(y_cal) == len(p_cal), "Length mismatch"
        n_c = len(y_cal)
        if n_c == 0:
            self.q_hat = 1.0
            self.is_calibrated = True
            return self

        # Non-conformity score: 1 - P(Y = y_true | x)
        p_true_class = np.where(y_cal == 1, p_cal, 1.0 - p_cal)
        scores = 1.0 - p_true_class

        # Conformal finite-sample quantile level: ceil((n + 1) * (1 - alpha)) / n
        q_level = min(1.0, np.ceil((n_c + 1) * (1.0 - self.alpha)) / n_c)
        self.q_hat = float(np.quantile(scores, q_level, method='higher'))
        self.is_calibrated = True
        return self

    def predict_set(self, p: np.ndarray) -> List[Set[int]]:
        """Return conformal prediction sets C(x) for probabilities."""
        assert self.is_calibrated, "Abstainer must be calibrated first"
        sets = []
        for prob in p:
            s = set()
            # Candidate y=1: non-conformity is 1 - prob
            if (1.0 - prob) <= self.q_hat:
                s.add(1)
            # Candidate y=0: non-conformity is 1 - (1 - prob) = prob
            if prob <= self.q_hat:
                s.add(0)
            sets.append(s)
        return sets

    def predict_with_abstain(
        self,
        p: np.ndarray,
        class_names: Tuple[str, str] = ("NOMINAL", "FIRE_ALARM"),
        abstain_label: str = "INSUFFICIENT_EVIDENCE"
    ) -> List[str]:
        """Classify each query; output abstain_label if prediction set is empty or multi-label."""
        prediction_sets = self.predict_set(p)
        results = []
        for s in prediction_sets:
            if len(s) == 1:
                val = next(iter(s))
                results.append(class_names[val])
            else:
                # Ambiguous ({0, 1}) or outlier empty set (set())
                results.append(abstain_label)
        return results


class MarginAbstainer:
    """Margin-based abstention: abstain if distance to decision boundary |p - 0.5| < margin."""

    def __init__(self, margin: float = 0.10):
        self.margin = margin
        self.is_calibrated: bool = False

    def calibrate(
        self,
        y_cal: np.ndarray,
        p_cal: np.ndarray,
        max_abstention_rate: float = 0.40,
        target_accuracy: float = 0.85
    ) -> "MarginAbstainer":
        """Sweep margins on calibration data to satisfy target accuracy constraint."""
        candidate_margins = np.linspace(0.01, 0.45, 45)
        best_m = 0.05

        for m in candidate_margins:
            non_abst_mask = np.abs(p_cal - 0.5) >= m
            abst_rate = np.mean(~non_abst_mask)
            if abst_rate <= max_abstention_rate and np.sum(non_abst_mask) > 0:
                acc = np.mean((p_cal[non_abst_mask] >= 0.5) == y_cal[non_abst_mask])
                if acc >= target_accuracy:
                    best_m = float(m)
                    break
                best_m = float(m)

        self.margin = best_m
        self.is_calibrated = True
        return self

    def predict_with_abstain(
        self,
        p: np.ndarray,
        threshold: float = 0.5,
        class_names: Tuple[str, str] = ("NOMINAL", "FIRE_ALARM"),
        abstain_label: str = "INSUFFICIENT_EVIDENCE"
    ) -> List[str]:
        """Classify each query with margin-based abstention."""
        results = []
        for prob in p:
            dist = abs(prob - threshold)
            if dist < self.margin:
                results.append(abstain_label)
            elif prob >= threshold:
                results.append(class_names[1])
            else:
                results.append(class_names[0])
        return results

