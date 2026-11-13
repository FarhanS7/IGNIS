"""Models for M1 SAME/SAME-R detector response vs particle size.

Implements:
1. GlobalMeanBaseline: global training set mean
2. MaterialMeanBaseline: per-material mean with fallback
3. IsotonicResponseModel: monotonic non-decreasing regression on particle diameter
4. LogPolynomialResponseModel: smooth 2nd-degree polynomial in log10(diameter)
5. RidgeResponseModel: regularized linear model on diameter, flow, and aging
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import Ridge


class BaseResponseModel:
    """Abstract base class for M1 detector response models."""

    def fit(self, X: np.ndarray, y: np.ndarray, materials: Optional[List[str]] = None) -> "BaseResponseModel":
        raise NotImplementedError

    def predict(self, X: np.ndarray, materials: Optional[List[str]] = None) -> np.ndarray:
        raise NotImplementedError

    def is_extrapolated(self, diameters: np.ndarray) -> np.ndarray:
        """Return boolean mask indicating which diameter queries lie outside training bounds."""
        d_min = getattr(self, 'min_diameter_', 0.0)
        d_max = getattr(self, 'max_diameter_', float('inf'))
        return (diameters < d_min) | (diameters > d_max)


class GlobalMeanBaseline(BaseResponseModel):
    """Predicts global training mean sensitivity for all queries."""

    def __init__(self):
        self.mean_: float = 1.0
        self.min_diameter_: float = 0.0
        self.max_diameter_: float = float('inf')

    def fit(self, X: np.ndarray, y: np.ndarray, materials: Optional[List[str]] = None) -> "GlobalMeanBaseline":
        self.mean_ = float(np.mean(y)) if len(y) > 0 else 1.0
        d = X[:, 0]
        self.min_diameter_ = float(np.min(d)) if len(d) > 0 else 0.0
        self.max_diameter_ = float(np.max(d)) if len(d) > 0 else float('inf')
        return self

    def predict(self, X: np.ndarray, materials: Optional[List[str]] = None) -> np.ndarray:
        return np.full(len(X), self.mean_, dtype=float)


class MaterialMeanBaseline(BaseResponseModel):
    """Predicts per-material mean if material seen, else global mean."""

    def __init__(self):
        self.mat_means_: Dict[str, float] = {}
        self.global_mean_: float = 1.0
        self.min_diameter_: float = 0.0
        self.max_diameter_: float = float('inf')

    def fit(self, X: np.ndarray, y: np.ndarray, materials: Optional[List[str]] = None) -> "MaterialMeanBaseline":
        self.global_mean_ = float(np.mean(y)) if len(y) > 0 else 1.0
        d = X[:, 0]
        self.min_diameter_ = float(np.min(d)) if len(d) > 0 else 0.0
        self.max_diameter_ = float(np.max(d)) if len(d) > 0 else float('inf')

        if materials is not None:
            mat_arr = np.array(materials)
            for m in np.unique(mat_arr):
                mask = (mat_arr == m)
                self.mat_means_[m] = float(np.mean(y[mask]))
        return self

    def predict(self, X: np.ndarray, materials: Optional[List[str]] = None) -> np.ndarray:
        preds = np.full(len(X), self.global_mean_, dtype=float)
        if materials is not None:
            for i, m in enumerate(materials):
                if m in self.mat_means_:
                    preds[i] = self.mat_means_[m]
        return preds


class IsotonicResponseModel(BaseResponseModel):
    """Monotonic non-decreasing step response curve on diameter."""

    def __init__(self):
        self.iso_ = IsotonicRegression(increasing=True, out_of_bounds='clip')
        self.min_diameter_: float = 0.0
        self.max_diameter_: float = float('inf')

    def fit(self, X: np.ndarray, y: np.ndarray, materials: Optional[List[str]] = None) -> "IsotonicResponseModel":
        d = X[:, 0]
        self.min_diameter_ = float(np.min(d))
        self.max_diameter_ = float(np.max(d))
        self.iso_.fit(d, y)
        return self

    def predict(self, X: np.ndarray, materials: Optional[List[str]] = None) -> np.ndarray:
        d = X[:, 0]
        preds = self.iso_.predict(d)
        return np.maximum(0.0, preds)


class LogPolynomialResponseModel(BaseResponseModel):
    """Smooth degree-2 polynomial in log10(diameter)."""

    def __init__(self, degree: int = 2):
        self.degree = degree
        self.coeffs_: List[float] = []
        self.min_diameter_: float = 0.0
        self.max_diameter_: float = float('inf')

    def fit(self, X: np.ndarray, y: np.ndarray, materials: Optional[List[str]] = None) -> "LogPolynomialResponseModel":
        d = X[:, 0]
        self.min_diameter_ = float(np.min(d))
        self.max_diameter_ = float(np.max(d))
        log_d = np.log10(np.maximum(1e-4, d))
        # Fit polynomial: y = c2 * x^2 + c1 * x + c0
        poly_coeffs = np.polyfit(log_d, y, self.degree)
        self.coeffs_ = [float(c) for c in poly_coeffs]
        return self

    def predict(self, X: np.ndarray, materials: Optional[List[str]] = None) -> np.ndarray:
        d = X[:, 0]
        log_d = np.log10(np.maximum(1e-4, d))
        poly = np.poly1d(self.coeffs_)
        preds = poly(log_d)
        return np.maximum(0.0, preds)


class RidgeResponseModel(BaseResponseModel):
    """Ridge regression on [log10(d), flow, aging]."""

    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
        self.ridge_ = Ridge(alpha=alpha)
        self.min_diameter_: float = 0.0
        self.max_diameter_: float = float('inf')

    def _transform(self, X: np.ndarray) -> np.ndarray:
        d = X[:, 0]
        log_d = np.log10(np.maximum(1e-4, d))
        # If flow and aging are available
        if X.shape[1] >= 3:
            flow = X[:, 1]
            aging = X[:, 2]
            return np.column_stack([log_d, flow, aging])
        return log_d.reshape(-1, 1)

    def fit(self, X: np.ndarray, y: np.ndarray, materials: Optional[List[str]] = None) -> "RidgeResponseModel":
        d = X[:, 0]
        self.min_diameter_ = float(np.min(d))
        self.max_diameter_ = float(np.max(d))
        feats = self._transform(X)
        self.ridge_.fit(feats, y)
        return self

    def predict(self, X: np.ndarray, materials: Optional[List[str]] = None) -> np.ndarray:
        feats = self._transform(X)
        preds = self.ridge_.predict(feats)
        return np.maximum(0.0, preds)

