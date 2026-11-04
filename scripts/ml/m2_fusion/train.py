"""Train interpretable L2-regularized logistic regression fusion detector for M2.

Saves trained parameters as plain JSON in data/models/m2/params.json.
NO pickle or joblib serialization is permitted.
"""

from typing import Dict, Any, Tuple, Optional
import os
import json
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
PARAMS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'models', 'm2', 'params.json')


class FusionDetectorModel:
    """Interpretable L2-regularized linear fusion model with pre-registered zero-false-alarm threshold."""

    def __init__(self, C: float = 1.0, random_state: int = 42):
        self.C = C
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.clf = LogisticRegression(
            C=C,
            solver='lbfgs',
            max_iter=1000,
            random_state=random_state,
            class_weight='balanced'
        )
        self.decision_threshold: float = 0.5
        self.is_fitted: bool = False
        self.feature_names: list = []

    def fit(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        feature_names: Optional[list] = None
    ) -> "FusionDetectorModel":
        """Fit scaler and logistic regression on training fold only, and select operating threshold."""
        if feature_names is not None:
            self.feature_names = list(feature_names)

        X_scaled = self.scaler.fit_transform(X_train)
        self.clf.fit(X_scaled, y_train)

        # Predict probability of Fire on training fold
        probs_train = self.clf.predict_proba(X_scaled)[:, 1]

        # Operating Point Rule: Most sensitive threshold yielding ZERO false alarms on training fold negatives
        neg_mask = (y_train == 0)
        if np.any(neg_mask):
            max_neg_prob = float(np.max(probs_train[neg_mask]))
            self.decision_threshold = min(0.9999, max_neg_prob + 1e-4)
        else:
            self.decision_threshold = 0.5

        self.is_fitted = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict continuous probability of fire alarm."""
        assert self.is_fitted, "Model is not fitted"
        X_scaled = self.scaler.transform(X)
        return self.clf.predict_proba(X_scaled)[:, 1]

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict binary fire alarm decision based on fitted operating point."""
        probs = self.predict_proba(X)
        return (probs >= self.decision_threshold).astype(int)

    def to_dict(self) -> Dict[str, Any]:
        """Export parameters as JSON-serializable dictionary."""
        assert self.is_fitted, "Model is not fitted"
        return {
            'model_type': 'L2_LogisticRegression_Fusion',
            'feature_names': self.feature_names,
            'coefficients': [float(w) for w in self.clf.coef_[0]],
            'intercept': float(self.clf.intercept_[0]),
            'scaler_mean': [float(m) for m in self.scaler.mean_],
            'scaler_scale': [float(s) for s in self.scaler.scale_],
            'operating_decision_threshold': float(self.decision_threshold),
            'regularization_C': float(self.C),
            'random_state': int(self.random_state),
            'notes': 'Unit-free 10-feature fusion model fitted on ground test room dataset with zero-false-alarm operating rule.'
        }

    def save_json(self, path: Optional[str] = None):
        """Save plain JSON parameters."""
        target_path = path or PARAMS_JSON_PATH
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2)
        print(f"Saved M2 model parameters to {os.path.relpath(target_path, BASE_DIR)}")
