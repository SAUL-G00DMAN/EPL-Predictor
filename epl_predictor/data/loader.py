"""
Data loading module for EPL Predictor.
Handles loading, validation, and cross-version compatibility for FINAL_project_with_simulation.pkl.
"""

import os
import pickle
from pathlib import Path
from typing import Any, Dict, Optional, Union

REQUIRED_KEYS = [
    'simulation_model',
    'feature_cols_simulation',
    'base_state',
    'current_managers',
    'attack_dict',
    'defence_dict',
    'dc_model_params',
    'current_20_teams_list',
    'remaining_fixtures',
    'actual_played',
    'final_probabilities',
    'confidence_bands',
]


def find_default_pickle_path() -> Path:
    """Finds the default FINAL_project_with_simulation.pkl file location."""
    # Check current directory
    local = Path("FINAL_project_with_simulation.pkl")
    if local.is_file():
        return local.resolve()

    # Check parent directory (if running from subpackage)
    parent = Path(__file__).resolve().parent.parent.parent / "FINAL_project_with_simulation.pkl"
    if parent.is_file():
        return parent

    # Fallback to absolute workspace path if available
    workspace_default = Path(r"c:\Users\Mostafa Ahmed\Documents\antigravity\sharp-heisenberg\FINAL_project_with_simulation.pkl")
    if workspace_default.is_file():
        return workspace_default

    return local.resolve()


def load_pickle_data(pickle_path: Optional[Union[str, Path]] = None) -> Dict[str, Any]:
    """
    Loads all project state and artifacts from FINAL_project_with_simulation.pkl.

    Args:
        pickle_path: Path to the pickle file. If None, auto-locates the file.

    Returns:
        dict: The complete dictionary of 31 stored project components.

    Raises:
        FileNotFoundError: If the pickle file does not exist.
        ValueError: If required keys are missing from the pickle file.
    """
    if pickle_path is None:
        target_path = find_default_pickle_path()
    else:
        target_path = Path(pickle_path).resolve()

    if not target_path.is_file():
        raise FileNotFoundError(
            f"EPL Predictor pickle file not found at: {target_path}. "
            "Please provide a valid path to FINAL_project_with_simulation.pkl."
        )

    with open(target_path, "rb") as f:
        data = pickle.load(f)

    # Check for required keys
    missing_keys = [k for k in REQUIRED_KEYS if k not in data]
    if missing_keys:
        raise ValueError(
            f"Pickle file at {target_path} is missing expected keys: {missing_keys}"
        )

    # Scikit-learn compatibility patch:
    # Handles SimpleImputer deserialization differences between scikit-learn 1.6.x and 1.9.x+
    simulation_model = data.get("simulation_model")
    if simulation_model is not None and hasattr(simulation_model, "named_steps"):
        imputer = simulation_model.named_steps.get("imputer")
        if imputer is not None:
            if hasattr(imputer, "_fit_dtype") and not hasattr(imputer, "_fill_dtype"):
                imputer._fill_dtype = imputer._fit_dtype

    return data
