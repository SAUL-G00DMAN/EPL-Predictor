"""
XGBoost match outcome prediction model wrapper.
Wraps the scikit-learn Pipeline (SimpleImputer + XGBClassifier) trained in PL_WINNER_Final.ipynb.
"""

from typing import Dict, List, Optional, Union, Any
import numpy as np
import pandas as pd

from ..constants import FEATURE_COLS_SIMULATION, INV_TARGET_MAP, TARGET_MAP


class XGBoostMatchModel:
    """
    Wrapper for the 3-way match outcome classifier (Home / Draw / Away).
    """

    def __init__(
        self,
        pipeline: Any,
        feature_cols: Optional[List[str]] = None,
    ):
        """
        Args:
            pipeline: Fitted scikit-learn Pipeline (SimpleImputer + XGBClassifier).
            feature_cols: Ordered list of feature names expected by the model.
        """
        self.pipeline = pipeline
        self.feature_cols = feature_cols or FEATURE_COLS_SIMULATION

    def _prepare_dataframe(self, X: Union[pd.DataFrame, dict, List[dict]]) -> pd.DataFrame:
        """Ensures input features are in a DataFrame with matching column ordering."""
        if isinstance(X, dict):
            df = pd.DataFrame([X])
        elif isinstance(X, list):
            df = pd.DataFrame(X)
        elif isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            raise TypeError(f"Unsupported features type: {type(X)}")

        return df[self.feature_cols]

    def predict_proba(self, X: Union[pd.DataFrame, dict, List[dict]]) -> np.ndarray:
        """
        Predicts 3-way outcome probabilities [P(Home), P(Draw), P(Away)].

        Returns:
            np.ndarray: Array of shape (N, 3).
        """
        X_df = self._prepare_dataframe(X)
        return self.pipeline.predict_proba(X_df)

    def predict(self, X: Union[pd.DataFrame, dict, List[dict]]) -> List[str]:
        """
        Predicts most likely outcome ('H', 'D', 'A') for each row.
        """
        probas = self.predict_proba(X)
        pred_indices = np.argmax(probas, axis=1)
        return [INV_TARGET_MAP[idx] for idx in pred_indices]

    def predict_match_probabilities(self, features: dict) -> Dict[str, float]:
        """
        Convenience method for a single match feature dictionary.

        Returns:
            dict: {'H': prob_home, 'D': prob_draw, 'A': prob_away}
        """
        proba = self.predict_proba([features])[0]
        return {
            "H": float(proba[0]),
            "D": float(proba[1]),
            "A": float(proba[2]),
        }
