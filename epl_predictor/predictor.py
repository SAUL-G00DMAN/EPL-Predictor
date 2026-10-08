"""
Main EPLPredictor class providing the high-level API for Premier League predictions.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd

from .constants import (
    FIXTURE_NAME_FIX,
    INV_TARGET_MAP,
    MASTER_NAME_MAP,
)
from .data.loader import load_pickle_data
from .models.dixon_coles import DixonColesModel
from .models.xgboost_model import XGBoostMatchModel
from .simulation.engine import build_simulation_features
from .simulation.simulator import (
    calculate_simulation_summary,
    run_batch_simulations,
)


class EPLPredictor:
    """
    Main entry point for EPL match and season predictions.

    Loads and holds in memory all models, simulation state, and precomputed
    simulation results from FINAL_project_with_simulation.pkl.
    """

    def __init__(self, pickle_path: Optional[Union[str, Path]] = None):
        """
        Initializes the predictor by loading the project state pickle once.

        Args:
            pickle_path: Path to FINAL_project_with_simulation.pkl. If None,
                         auto-locates the file in current or parent directory.
        """
        self._raw_data: Dict[str, Any] = load_pickle_data(pickle_path)

        # Core models
        self.simulation_model = self._raw_data["simulation_model"]
        self.feature_cols_simulation: List[str] = self._raw_data["feature_cols_simulation"]
        self.model_wrapper = XGBoostMatchModel(
            self.simulation_model, self.feature_cols_simulation
        )

        # Dixon-Coles parameters & wrapper
        self.attack_dict: Dict[str, float] = self._raw_data["attack_dict"]
        self.defence_dict: Dict[str, float] = self._raw_data["defence_dict"]
        self.dc_model_params: Dict[str, Any] = self._raw_data["dc_model_params"]
        self.XI: float = float(self._raw_data.get("XI", 0.001))
        self.dixon_coles = DixonColesModel(
            attack_dict=self.attack_dict,
            defence_dict=self.defence_dict,
            params=self.dc_model_params,
            xi=self.XI,
        )

        # Simulation state & metadata
        self.base_state: Dict[str, Any] = self._raw_data["base_state"]
        self.current_managers: Dict[str, Optional[str]] = self._raw_data["current_managers"]
        self.external_manager_experience: Dict[str, Any] = self._raw_data.get(
            "external_manager_experience", {}
        )
        self.current_20_teams_list: List[str] = sorted(
            self._raw_data["current_20_teams_list"]
        )
        self.master_name_map: Dict[str, str] = {
            **MASTER_NAME_MAP,
            **self._raw_data.get("master_name_map", {}),
        }
        self.name_fix_map: Dict[str, str] = {**FIXTURE_NAME_FIX, **self.master_name_map}

        # Match fixtures & played history
        self.remaining_fixtures: pd.DataFrame = self._raw_data["remaining_fixtures"].copy()
        self.actual_played: pd.DataFrame = self._raw_data["actual_played"].copy()
        self.df: Optional[pd.DataFrame] = self._raw_data.get("df")
        self.fixtures_df: Optional[pd.DataFrame] = self._raw_data.get("fixtures_df")

        # Stored 10,000-simulation precomputed results
        self.final_probabilities: pd.DataFrame = self._raw_data["final_probabilities"].copy()
        self.confidence_bands: pd.DataFrame = self._raw_data["confidence_bands"].copy()
        self.points_totals: Dict[str, List[int]] = self._raw_data.get("points_totals", {})
        self.position_totals: Dict[str, List[int]] = self._raw_data.get("position_totals", {})
        self.all_sim_results: Optional[List[pd.DataFrame]] = self._raw_data.get("all_sim_results")
        self.n_simulations: int = int(self._raw_data.get("N_SIMULATIONS", 10000))
        self.accuracy_gate_result: Dict[str, Any] = self._raw_data.get(
            "accuracy_gate_result", {}
        )

    def normalize_team_name(self, team: str) -> str:
        """
        Normalizes aliases to standard Premier League team names
        (e.g., 'Man Utd' -> 'Man United', 'Spurs' -> 'Tottenham').
        """
        cleaned = team.strip()
        return self.name_fix_map.get(cleaned, cleaned)

    def get_team_list(self) -> List[str]:
        """Returns the list of 20 current Premier League teams."""
        return list(self.current_20_teams_list)

    def get_current_probabilities(self, include_confidence_bands: bool = True) -> pd.DataFrame:
        """
        Returns the full 20-team table from the precomputed 10,000-simulation run.

        Includes:
            - Champion_%: Probability of finishing 1st
            - Top4_%: Probability of Champions League qualification (1st - 4th)
            - Relegation_%: Probability of relegation (18th - 20th)
            - Avg_Points: Mean points across all simulations
            - Avg_Position: Mean table position across all simulations
            - Confidence Bands (if include_confidence_bands=True):
                Points_P10, Points_P50, Points_P90, Position_P10, Position_P50, Position_P90

        Args:
            include_confidence_bands: Whether to merge P10/P50/P90 confidence intervals.
                                      Default is True.

        Returns:
            pd.DataFrame: 20-team probability and projection table.
        """
        if include_confidence_bands and self.confidence_bands is not None:
            merged = self.final_probabilities.merge(self.confidence_bands, on="Team", how="left")
            merged.index = self.final_probabilities.index
            merged.columns = merged.columns.astype(self.final_probabilities.columns.dtype)
            return merged
        return self.final_probabilities.copy()

    def predict_match(
        self,
        home_team: str,
        away_team: str,
        match_date: Optional[Union[str, pd.Timestamp]] = None,
    ) -> Dict[str, Any]:
        """
        Predicts match outcome probabilities (Home / Draw / Away) using the trained XGBoost model.

        Args:
            home_team: Name of the home team (supports common aliases like 'Spurs', 'Man Utd').
            away_team: Name of the away team.
            match_date: Optional date of the fixture. If None, looks up scheduled date in
                        remaining_fixtures, or defaults to 7 days after the team's last match.

        Returns:
            dict containing:
                - 'home_team': Normalized home team name
                - 'away_team': Normalized away team name
                - 'match_date': Date used for calculating rest days
                - 'H': Home win probability (0.0 to 1.0)
                - 'D': Draw probability (0.0 to 1.0)
                - 'A': Away win probability (0.0 to 1.0)
                - 'probabilities': {'H': float, 'D': float, 'A': float}
                - 'expected_goals': {'home': float, 'away': float}
                - 'predicted_outcome': Most probable outcome ('H', 'D', or 'A')

        Raises:
            ValueError: If either team is not in the 20-team Premier League roster,
                        or if home_team and away_team are the same.
        """
        home = self.normalize_team_name(home_team)
        away = self.normalize_team_name(away_team)

        if home not in self.current_20_teams_list:
            raise ValueError(
                f"Unknown home team '{home_team}' (normalized: '{home}'). "
                f"Must be one of: {self.current_20_teams_list}"
            )
        if away not in self.current_20_teams_list:
            raise ValueError(
                f"Unknown away team '{away_team}' (normalized: '{away}'). "
                f"Must be one of: {self.current_20_teams_list}"
            )
        if home == away:
            raise ValueError(f"Home team and away team cannot be identical ('{home}').")

        # Resolve match date
        if match_date is not None:
            resolved_date = pd.to_datetime(match_date)
        else:
            # Check remaining fixtures
            fixture_match = self.remaining_fixtures[
                (self.remaining_fixtures["HomeTeam"] == home)
                & (self.remaining_fixtures["AwayTeam"] == away)
            ]
            if not fixture_match.empty:
                resolved_date = pd.to_datetime(fixture_match.iloc[0]["Date"])
            else:
                last_dt = self.base_state["last_date"].get(home, pd.Timestamp.now())
                resolved_date = pd.to_datetime(last_dt) + pd.Timedelta(days=7)

        # Build feature vector
        features = build_simulation_features(
            home=home,
            away=away,
            match_date=resolved_date,
            sim_state=self.base_state,
            current_managers=self.current_managers,
            attack_dict=self.attack_dict,
            defence_dict=self.defence_dict,
        )

        # Model inference
        proba = self.model_wrapper.predict_proba([features])[0]
        prob_h = float(proba[0])
        prob_d = float(proba[1])
        prob_a = float(proba[2])

        # Dixon-Coles Poisson expected goals
        lambda_h, lambda_a = self.dixon_coles.calculate_lambdas(home, away)

        pred_idx = int(np.argmax(proba))
        predicted_outcome = INV_TARGET_MAP[pred_idx]

        return {
            "home_team": home,
            "away_team": away,
            "match_date": str(resolved_date.date()) if hasattr(resolved_date, "date") else str(resolved_date),
            "H": prob_h,
            "D": prob_d,
            "A": prob_a,
            "probabilities": {
                "H": round(prob_h, 4),
                "D": round(prob_d, 4),
                "A": round(prob_a, 4),
            },
            "expected_goals": {
                "home": round(lambda_h, 2),
                "away": round(lambda_a, 2),
            },
            "predicted_outcome": predicted_outcome,
        }

    def run_fresh_simulation(
        self,
        n: int = 10000,
        seed: int = 42,
        update_state: bool = False,
    ) -> Dict[str, Any]:
        """
        Re-runs the Monte Carlo simulation from the current state across all remaining fixtures.

        ========================================================================================
        CRITICAL PERFORMANCE NOTICE:
        This operation is computationally intensive. Simulating 330 remaining fixtures across
        N=10,000 iterations requires evaluating over 3.3 million fixture states, running XGBoost
        inference batches and Dixon-Coles Poisson sampling. It typically takes several minutes.

        DO NOT CALL THIS METHOD SYNCHRONOUSLY / INLINE WITHIN A FASTAPI REQUEST HANDLER.
        Use only in offline cron jobs, background worker queues (e.g. Celery / ARQ / BackgroundTasks),
        or dedicated batch processing scripts.
        ========================================================================================

        Args:
            n: Number of full-season Monte Carlo trajectories to simulate (default: 10,000).
            seed: Random seed for reproducibility (default: 42).
            update_state: If True, updates internal self.final_probabilities and
                          self.confidence_bands with the freshly computed tables. Default: False.

        Returns:
            dict containing:
                - 'final_probabilities': pd.DataFrame with champion %, top 4 %, relegation %
                - 'confidence_bands': pd.DataFrame with P10/P50/P90 points & positions
                - 'points_totals': dict mapping team -> list of final points across trajectories
                - 'position_totals': dict mapping team -> list of positions across trajectories
                - 'n_simulations': Number of simulated trajectories
                - 'all_sim_results': List of pd.DataFrames for each trajectory (if needed)
        """
        sim_results = run_batch_simulations(
            fixtures=self.remaining_fixtures,
            base_state=self.base_state,
            n_simulations=n,
            simulation_model=self.simulation_model,
            feature_cols=self.feature_cols_simulation,
            attack_dict=self.attack_dict,
            defence_dict=self.defence_dict,
            dc_model_params=self.dc_model_params,
            current_managers=self.current_managers,
            external_manager_experience=self.external_manager_experience,
            seed_start=seed,
        )

        fresh_probs, fresh_bands, pts_tot, pos_tot = calculate_simulation_summary(
            all_sim_results=sim_results,
            actual_played=self.actual_played,
            current_20_teams_list=self.current_20_teams_list,
            n_simulations=n,
        )

        if update_state:
            self.final_probabilities = fresh_probs
            self.confidence_bands = fresh_bands
            self.points_totals = pts_tot
            self.position_totals = pos_tot
            self.all_sim_results = sim_results
            self.n_simulations = n

        return {
            "final_probabilities": fresh_probs,
            "confidence_bands": fresh_bands,
            "points_totals": pts_tot,
            "position_totals": pos_tot,
            "n_simulations": n,
            "all_sim_results": sim_results,
        }
