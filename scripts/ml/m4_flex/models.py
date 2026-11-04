"""Models for M4 NASA FLEX Droplet Flame Extinction Thresholds.

Implements:
1. MajorityClassBaseline: Always predicts Extinction (1)
2. CO2ThresholdBaseline: In-fold calibrated CO2 concentration threshold
3. FLEXExtinctionLogisticModel: Interpretable L2 logistic regression with conservative operating threshold
"""

from typing import Dict, Any, List, Optional, Tuple
import os
import json
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
PARAMS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm4', 'params.json')


class BaseExtinctionModel:
    """Base interface for droplet flame extinction models."""

    def fit(self, X: np.ndarray, y: np.ndarray) -> "BaseExtinctionModel":
        raise NotImplementedError

    def predict(self, X: np.ndarray) -> np.ndarray:
        raise NotImplementedError


class MajorityClassBaseline(BaseExtinctionModel):
    """Predicts majority class (Extinction = 1)."""

    def __init__(self):
        self.majority_class_: int = 1

    def fit(self, X: np.ndarray, y: np.ndarray) -> "MajorityClassBaseline":
        self.majority_class_ = int(np.round(np.mean(y))) if len(y) > 0 else 1
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return np.full(len(X), self.majority_class_, dtype=int)


class CO2ThresholdBaseline(BaseExtinctionModel):
    """In-fold threshold on CO2 mole fraction (index 1 in feature matrix)."""

    def __init__(self):
        self.threshold_co2_: float = 0.50

    def fit(self, X: np.ndarray, y: np.ndarray) -> "CO2ThresholdBaseline":
        co2_vals = X[:, 1]
        sustained_mask = (y == 0)
        if np.any(sustained_mask):
            # Select max CO2 observed among sustained flames in train fold
            self.threshold_co2_ = float(np.max(co2_vals[sustained_mask]))
        else:
            self.threshold_co2_ = 0.50
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        co2_vals = X[:, 1]
        return (co2_vals > self.threshold_co2_).astype(int)


class FLEXExtinctionLogisticModel(BaseExtinctionModel):
    """Interpretable L2-regularized logistic regression for droplet flame extinction limits."""

    def __init__(
        self,
        C: float = 1.0,
        decision_threshold: float = 0.55,
        random_state: int = 42
    ):
        self.C = C
        self.decision_threshold = decision_threshold
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.clf = LogisticRegression(
            C=C,
            solver='lbfgs',
            max_iter=1000,
            random_state=random_state
        )
        self.is_fitted: bool = False
        self.feature_names_: List[str] = []

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        feature_names: Optional[List[str]] = None
    ) -> "FLEXExtinctionLogisticModel":
        if feature_names is not None:
            self.feature_names_ = list(feature_names)
        X_scaled = self.scaler.fit_transform(X)
        self.clf.fit(X_scaled, y)
        self.is_fitted = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        assert self.is_fitted, "Model is not fitted"
        X_scaled = self.scaler.transform(X)
        return self.clf.predict_proba(X_scaled)[:, 1]

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)
        return (probs >= self.decision_threshold).astype(int)

    def predict_category(self, X: np.ndarray) -> List[str]:
        """Categorize into EXTINCTION_REGION / SUSTAINED_REGION / INSUFFICIENT_EVIDENCE."""
        probs = self.predict_proba(X)
        categories = []
        for p in probs:
            if p >= 0.65:
                categories.append("EXTINCTION_REGION")
            elif p <= 0.40:
                categories.append("SUSTAINED_REGION")
            else:
                categories.append("INSUFFICIENT_EVIDENCE")
        return categories

    def to_dict(self) -> Dict[str, Any]:
        assert self.is_fitted, "Model is not fitted"
        return {
            'model_type': 'L2_LogisticRegression_Droplet_Extinction',
            'feature_names': self.feature_names_,
            'coefficients': [float(w) for w in self.clf.coef_[0]],
            'intercept': float(self.clf.intercept_[0]),
            'scaler_mean': [float(m) for m in self.scaler.mean_],
            'scaler_scale': [float(s) for s in self.scaler.scale_],
            'decision_threshold': float(self.decision_threshold),
            'extinction_region_threshold': 0.65,
            'sustained_region_threshold': 0.40,
            'regularization_C': float(self.C),
            'random_state': int(self.random_state),
            'caveats': [
                "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.",
                "Not validated for partial gravity.",
                "Model indicates isolated spherical droplet combustion limits only."
            ]
        }

    def save_json(self, path: Optional[str] = None):
        target_path = path or PARAMS_JSON_PATH
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2)
        print(f"Saved M4 model parameters to {os.path.relpath(target_path, BASE_DIR)}")
