"""
Elo rating and adaptive K-factor utilities for teams and managers.
Extracted from PL_WINNER_Final.ipynb (Parts 0b, 2a, 2b).
"""

from typing import Dict, Optional, Tuple, Any
import numpy as np
import pandas as pd

from ..constants import (
    DEFAULT_ELO,
    HOME_ADVANTAGE,
    K_FACTOR,
    MANAGER_DEFAULT_ELO,
)


def update_elo_ratings(
    home_rating: float,
    away_rating: float,
    home_goals: int,
    away_goals: int,
    k_factor: float = K_FACTOR,
    home_advantage: float = HOME_ADVANTAGE,
) -> Tuple[float, float]:
    """
    Updates Elo ratings for two teams or managers based on match result and goal difference.
    
    Uses standard logistic expected outcome with goal difference multiplier:
        multiplier = ln(goal_diff + 1) * (2.2 / (rating_diff * 0.001 + 2.2))
    """
    adjusted_home_rating = home_rating + home_advantage
    expected_home = 1.0 / (1.0 + 10.0 ** ((away_rating - adjusted_home_rating) / 400.0))
    expected_away = 1.0 - expected_home

    if home_goals > away_goals:
        actual_home, actual_away = 1.0, 0.0
        winner_rating, loser_rating = adjusted_home_rating, away_rating
    elif home_goals < away_goals:
        actual_home, actual_away = 0.0, 1.0
        winner_rating, loser_rating = away_rating, adjusted_home_rating
    else:
        actual_home, actual_away = 0.5, 0.5
        winner_rating, loser_rating = adjusted_home_rating, away_rating

    goal_diff = abs(home_goals - away_goals)
    if goal_diff == 0:
        multiplier = 1.0
    else:
        rating_diff = winner_rating - loser_rating
        multiplier = np.log(goal_diff + 1.0) * (2.2 / (rating_diff * 0.001 + 2.2))

    new_home_rating = home_rating + k_factor * multiplier * (actual_home - expected_home)
    new_away_rating = away_rating + k_factor * multiplier * (actual_away - expected_away)

    return float(new_home_rating), float(new_away_rating)


def get_adaptive_k_factor(
    matchweek_number: int,
    base_k: float = 20.0,
    early_season_games: int = 6,
    min_k_ratio: float = 0.5,
) -> float:
    """
    Computes adaptive K-factor for current season matchweeks.
    Suppresses rating volatility in early matchweeks.
    """
    if matchweek_number > early_season_games:
        return base_k
    ratio = min_k_ratio + (1.0 - min_k_ratio) * (matchweek_number - 1.0) / (early_season_games - 1.0)
    return float(base_k * ratio)


def init_manager_elo(
    manager_name: str,
    external_manager_experience: Optional[Dict[str, Dict[str, Any]]] = None,
    default_elo: float = MANAGER_DEFAULT_ELO,
) -> float:
    """
    Initializes Elo for a new manager based on external experience prior win rates.
    """
    if external_manager_experience and manager_name in external_manager_experience:
        exp = external_manager_experience[manager_name]
        offset = (exp.get("prior_win_rate", 0.5) - 0.5) * 100.0 * 4.0
        return float(default_elo + offset)
    return float(default_elo)


def get_manager_for_team_at_date(
    team: str,
    match_date: pd.Timestamp,
    managers_df: pd.DataFrame,
) -> Optional[str]:
    """
    Returns manager in charge of team on match_date, or None if unknown.
    """
    team_managers = managers_df[managers_df["Team"] == team]
    valid = team_managers[team_managers["StartDate"] <= match_date]
    if len(valid) == 0:
        return None
    return valid.sort_values("StartDate").iloc[-1]["Manager"]
