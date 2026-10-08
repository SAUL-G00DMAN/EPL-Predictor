"""
Models package for EPL Predictor (Dixon-Coles + XGBoost).
"""

from .dixon_coles import DixonColesModel
from .xgboost_model import XGBoostMatchModel

__all__ = ["DixonColesModel", "XGBoostMatchModel"]
