"""
EPL Predictor Package.
A clean, modular package for Premier League outcome prediction and Monte Carlo season simulation.
"""

from .predictor import EPLPredictor
from .constants import (
    DEFAULT_ELO,
    FEATURE_COLS_SIMULATION,
    HOME_ADVANTAGE,
    K_FACTOR,
    MASTER_NAME_MAP,
)

__all__ = [
    "EPLPredictor",
    "DEFAULT_ELO",
    "HOME_ADVANTAGE",
    "K_FACTOR",
    "MASTER_NAME_MAP",
    "FEATURE_COLS_SIMULATION",
]
