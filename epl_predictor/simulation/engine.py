"""
Simulation engine core: feature building, match prediction, and live state updates.
Extracted from PL_WINNER_Final.ipynb (Part 4b).
"""

from collections import deque
from typing import Dict, Optional, Tuple, Any, List
import numpy as np
import pandas as pd

from ..constants import (
    DEFAULT_ELO,
    FEATURE_COLS_SIMULATION,
    FORM_WINDOW,
    HOME_ADVANTAGE,
    MANAGER_DEFAULT_ELO,
)
from .elo import get_adaptive_k_factor, init_manager_elo, update_elo_ratings


def build_simulation_features(
    home: str,
    away: str,
    match_date: pd.Timestamp,
    sim_state: Dict[str, Any],
    current_managers: Dict[str, Optional[str]],
    attack_dict: Dict[str, float],
    defence_dict: Dict[str, float],
) -> Dict[str, Any]:
    """
    Constructs the exact 23-feature vector used by the XGBoost simulation model for a fixture.
    """
    home_mgr = current_managers.get(home)
    away_mgr = current_managers.get(away)

    h_elo = sim_state["elo"].get(home, DEFAULT_ELO)
    a_elo = sim_state["elo"].get(away, DEFAULT_ELO)

    h_last = sim_state["last_date"].get(home, match_date - pd.Timedelta(days=7))
    a_last = sim_state["last_date"].get(away, match_date - pd.Timedelta(days=7))
    h_days_rest = (match_date - h_last).days
    a_days_rest = (match_date - a_last).days
    h_days_rest = min(h_days_rest, 45) if h_days_rest >= 0 else 7
    a_days_rest = min(a_days_rest, 45) if a_days_rest >= 0 else 7

    def form_stats(hist_dict, team):
        hist = hist_dict.get(team, deque(maxlen=FORM_WINDOW))
        return list(hist) if len(hist) > 0 else None

    h_pts = form_stats(sim_state["points_hist"], home)
    a_pts = form_stats(sim_state["points_hist"], away)
    h_gs = form_stats(sim_state["gs_hist"], home)
    h_gc = form_stats(sim_state["gc_hist"], home)
    a_gs = form_stats(sim_state["gs_hist"], away)
    a_gc = form_stats(sim_state["gc_hist"], away)

    h_mgr_elo = (
        sim_state["manager_elo"].get(home_mgr, MANAGER_DEFAULT_ELO)
        if home_mgr
        else MANAGER_DEFAULT_ELO
    )
    a_mgr_elo = (
        sim_state["manager_elo"].get(away_mgr, MANAGER_DEFAULT_ELO)
        if away_mgr
        else MANAGER_DEFAULT_ELO
    )

    h_attack = attack_dict.get(home, np.nan)
    h_defence = defence_dict.get(home, np.nan)
    a_attack = attack_dict.get(away, np.nan)
    a_defence = defence_dict.get(away, np.nan)

    attack_closeness = (
        -abs(h_attack - a_attack)
        if not (np.isnan(h_attack) or np.isnan(a_attack))
        else np.nan
    )

    return {
        "HomeElo": h_elo,
        "AwayElo": a_elo,
        "EloDiff": h_elo - a_elo,
        "HomeFormPoints": sum(h_pts) if h_pts else np.nan,
        "HomeFormGoalsScored": np.mean(h_gs) if h_gs else np.nan,
        "HomeFormGoalsConceded": np.mean(h_gc) if h_gc else np.nan,
        "AwayFormPoints": sum(a_pts) if a_pts else np.nan,
        "AwayFormGoalsScored": np.mean(a_gs) if a_gs else np.nan,
        "AwayFormGoalsConceded": np.mean(a_gc) if a_gc else np.nan,
        "HomeManagerElo": h_mgr_elo,
        "AwayManagerElo": a_mgr_elo,
        "HomeManagerKnown": int(home_mgr is not None),
        "AwayManagerKnown": int(away_mgr is not None),
        "HomeDaysRest": h_days_rest,
        "AwayDaysRest": a_days_rest,
        "HomeShortRest": int(h_days_rest <= 4),
        "AwayShortRest": int(a_days_rest <= 4),
        "HomeAttack": h_attack,
        "HomeDefence": h_defence,
        "AwayAttack": a_attack,
        "AwayDefence": a_defence,
        "EloCloseness": -abs(h_elo - a_elo),
        "AttackCloseness": attack_closeness,
    }


def predict_match_outcome(
    features: Dict[str, Any],
    home_attack_raw: float,
    away_defence_raw: float,
    away_attack_raw: float,
    home_defence_raw: float,
    home_advantage: float,
    simulation_model: Any,
    feature_cols: Optional[List[str]] = None,
) -> Tuple[str, int, int]:
    """
    Predicts match outcome ('H', 'D', 'A') with XGBoost, then generates realistic scorelines
    using Dixon-Coles Poisson distributions conditioned on the outcome.
    """
    cols = feature_cols or FEATURE_COLS_SIMULATION
    X_pred = pd.DataFrame([features])[cols]
    proba = simulation_model.predict_proba(X_pred)[0]
    outcome = str(np.random.choice(["H", "D", "A"], p=proba))

    home_adv_log = np.log(1.0 + home_advantage)
    lambda_home = np.clip(np.exp(home_attack_raw + away_defence_raw + home_adv_log), 0.1, 5.0)
    lambda_away = np.clip(np.exp(away_attack_raw + home_defence_raw), 0.1, 5.0)

    home_goals, away_goals = None, None
    for _ in range(30):
        h_g = int(np.random.poisson(lambda_home))
        a_g = int(np.random.poisson(lambda_away))
        if outcome == "H" and h_g > a_g:
            home_goals, away_goals = h_g, a_g
            break
        if outcome == "D" and h_g == a_g:
            home_goals, away_goals = h_g, a_g
            break
        if outcome == "A" and h_g < a_g:
            home_goals, away_goals = h_g, a_g
            break

    if home_goals is None:
        if outcome == "H":
            home_goals, away_goals = 1, 0
        elif outcome == "A":
            home_goals, away_goals = 0, 1
        else:
            home_goals, away_goals = 1, 1

    return outcome, home_goals, away_goals


def update_simulation_state(
    home: str,
    away: str,
    match_date: pd.Timestamp,
    home_goals: int,
    away_goals: int,
    sim_state: Dict[str, Any],
    matchweek_number: int,
    current_managers: Dict[str, Optional[str]],
    external_manager_experience: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Updates live simulation state (Elo ratings, form queues, days rest) after a simulated match.
    Modifies sim_state in-place.
    """
    adaptive_k = get_adaptive_k_factor(matchweek_number)

    if home not in sim_state["elo"]:
        sim_state["elo"][home] = DEFAULT_ELO
    if away not in sim_state["elo"]:
        sim_state["elo"][away] = DEFAULT_ELO

    new_h, new_a = update_elo_ratings(
        sim_state["elo"][home],
        sim_state["elo"][away],
        home_goals,
        away_goals,
        k_factor=adaptive_k,
        home_advantage=HOME_ADVANTAGE,
    )
    sim_state["elo"][home], sim_state["elo"][away] = new_h, new_a

    home_mgr = current_managers.get(home)
    away_mgr = current_managers.get(away)
    if home_mgr and away_mgr:
        if home_mgr not in sim_state["manager_elo"]:
            sim_state["manager_elo"][home_mgr] = init_manager_elo(
                home_mgr, external_manager_experience
            )
        if away_mgr not in sim_state["manager_elo"]:
            sim_state["manager_elo"][away_mgr] = init_manager_elo(
                away_mgr, external_manager_experience
            )
        new_hm, new_am = update_elo_ratings(
            sim_state["manager_elo"][home_mgr],
            sim_state["manager_elo"][away_mgr],
            home_goals,
            away_goals,
            k_factor=adaptive_k,
            home_advantage=HOME_ADVANTAGE,
        )
        sim_state["manager_elo"][home_mgr], sim_state["manager_elo"][away_mgr] = new_hm, new_am

    if home_goals > away_goals:
        h_pts, a_pts = 3, 0
    elif home_goals < away_goals:
        h_pts, a_pts = 0, 3
    else:
        h_pts, a_pts = 1, 1

    for team_name, pts, gs, gc in [
        (home, h_pts, home_goals, away_goals),
        (away, a_pts, away_goals, home_goals),
    ]:
        for d_key in ["points_hist", "gs_hist", "gc_hist"]:
            if team_name not in sim_state[d_key]:
                sim_state[d_key][team_name] = deque(maxlen=FORM_WINDOW)

        sim_state["points_hist"][team_name].append(pts)
        sim_state["gs_hist"][team_name].append(gs)
        sim_state["gc_hist"][team_name].append(gc)

    sim_state["last_date"][home] = match_date
    sim_state["last_date"][away] = match_date
