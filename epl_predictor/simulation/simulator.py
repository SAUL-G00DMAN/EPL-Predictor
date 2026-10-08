"""
Monte Carlo simulation executors for single and batch season trajectories.
Extracted from PL_WINNER_Final.ipynb (Parts 5, 6, 7).
"""

import copy
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd

from ..constants import FEATURE_COLS_SIMULATION
from .engine import build_simulation_features, predict_match_outcome, update_simulation_state


def build_league_table(
    match_results: pd.DataFrame,
    current_20_teams: List[str],
) -> pd.DataFrame:
    """
    Computes a sorted Premier League table from a set of matches (actual + simulated).
    Sorted by Points (descending), Goal Difference (descending), Goals For (descending).
    """
    table = {
        team: {"Points": 0, "GF": 0, "GA": 0, "Played": 0, "W": 0, "D": 0, "L": 0}
        for team in current_20_teams
    }

    for _, row in match_results.iterrows():
        home, away = row["HomeTeam"], row["AwayTeam"]
        if home not in table or away not in table:
            continue
        hg = row["HomeGoals"] if "HomeGoals" in row else row["FTHG"]
        ag = row["AwayGoals"] if "AwayGoals" in row else row["FTAG"]

        table[home]["GF"] += hg
        table[home]["GA"] += ag
        table[home]["Played"] += 1
        table[away]["GF"] += ag
        table[away]["GA"] += hg
        table[away]["Played"] += 1

        if hg > ag:
            table[home]["Points"] += 3
            table[home]["W"] += 1
            table[away]["L"] += 1
        elif hg < ag:
            table[away]["Points"] += 3
            table[away]["W"] += 1
            table[home]["L"] += 1
        else:
            table[home]["Points"] += 1
            table[away]["Points"] += 1
            table[home]["D"] += 1
            table[away]["D"] += 1

    df_table = pd.DataFrame(table).T
    df_table["GD"] = df_table["GF"] - df_table["GA"]
    df_table = df_table.sort_values(["Points", "GD", "GF"], ascending=False).reset_index()
    df_table.columns = ["Team", "Points", "GF", "GA", "Played", "W", "D", "L", "GD"]
    df_table.index = df_table.index + 1
    return df_table[["Team", "Played", "W", "D", "L", "GF", "GA", "GD", "Points"]]


def run_single_simulation(
    fixtures: pd.DataFrame,
    base_state: Dict[str, Any],
    simulation_model: Any,
    feature_cols: Optional[List[str]] = None,
    attack_dict: Optional[Dict[str, float]] = None,
    defence_dict: Optional[Dict[str, float]] = None,
    dc_model_params: Optional[Dict[str, Any]] = None,
    current_managers: Optional[Dict[str, Optional[str]]] = None,
    external_manager_experience: Optional[Dict[str, Any]] = None,
    seed: Optional[int] = None,
) -> pd.DataFrame:
    """
    Simulates a single completion of all remaining fixtures.
    """
    if seed is not None:
        np.random.seed(seed)

    cols = feature_cols or FEATURE_COLS_SIMULATION
    params = dc_model_params or {}
    home_adv = params.get("home_advantage", 0.2)
    atk = attack_dict or {}
    dfc = defence_dict or {}
    mgrs = current_managers or {}

    sim_state = {k: copy.deepcopy(base_state[k]) for k in base_state}
    results = []

    for _, fixture in fixtures.iterrows():
        home, away, match_date = fixture["HomeTeam"], fixture["AwayTeam"], fixture["Date"]
        matchweek_number = fixture["Round"]

        features = build_simulation_features(
            home=home,
            away=away,
            match_date=match_date,
            sim_state=sim_state,
            current_managers=mgrs,
            attack_dict=atk,
            defence_dict=dfc,
        )

        h_attack_raw = atk.get(home, 0.0)
        h_defence_raw = dfc.get(home, 0.0)
        a_attack_raw = atk.get(away, 0.0)
        a_defence_raw = dfc.get(away, 0.0)

        outcome, home_goals, away_goals = predict_match_outcome(
            features=features,
            home_attack_raw=h_attack_raw,
            away_defence_raw=a_defence_raw,
            away_attack_raw=a_attack_raw,
            home_defence_raw=h_defence_raw,
            home_advantage=home_adv,
            simulation_model=simulation_model,
            feature_cols=cols,
        )

        update_simulation_state(
            home=home,
            away=away,
            match_date=match_date,
            home_goals=home_goals,
            away_goals=away_goals,
            sim_state=sim_state,
            matchweek_number=matchweek_number,
            current_managers=mgrs,
            external_manager_experience=external_manager_experience,
        )

        results.append({
            "Date": match_date,
            "HomeTeam": home,
            "AwayTeam": away,
            "HomeGoals": home_goals,
            "AwayGoals": away_goals,
            "Outcome": outcome,
        })

    return pd.DataFrame(results)


def run_batch_simulations(
    fixtures: pd.DataFrame,
    base_state: Dict[str, Any],
    n_simulations: int,
    simulation_model: Any,
    feature_cols: Optional[List[str]] = None,
    attack_dict: Optional[Dict[str, float]] = None,
    defence_dict: Optional[Dict[str, float]] = None,
    dc_model_params: Optional[Dict[str, Any]] = None,
    current_managers: Optional[Dict[str, Optional[str]]] = None,
    external_manager_experience: Optional[Dict[str, Any]] = None,
    seed_start: int = 0,
) -> List[pd.DataFrame]:
    """
    Vectorized batch Monte Carlo simulator across n_simulations trajectories.
    Matches Cell 15 from PL_WINNER_Final.ipynb.
    """
    cols = feature_cols or FEATURE_COLS_SIMULATION
    params = dc_model_params or {}
    home_adv = params.get("home_advantage", 0.2)
    atk = attack_dict or {}
    dfc = defence_dict or {}
    mgrs = current_managers or {}

    all_states = [{k: copy.deepcopy(base_state[k]) for k in base_state} for _ in range(n_simulations)]
    all_results: List[List[dict]] = [[] for _ in range(n_simulations)]
    np.random.seed(seed_start)

    for _, fixture in fixtures.iterrows():
        home, away, match_date = fixture["HomeTeam"], fixture["AwayTeam"], fixture["Date"]
        matchweek_number = fixture["Round"]

        batch_features = [
            build_simulation_features(
                home=home,
                away=away,
                match_date=match_date,
                sim_state=all_states[i],
                current_managers=mgrs,
                attack_dict=atk,
                defence_dict=dfc,
            )
            for i in range(n_simulations)
        ]

        X_batch = pd.DataFrame(batch_features)[cols]
        proba_batch = simulation_model.predict_proba(X_batch)

        h_attack_raw = atk.get(home, 0.0)
        a_defence_raw = dfc.get(away, 0.0)
        a_attack_raw = atk.get(away, 0.0)
        h_defence_raw = dfc.get(home, 0.0)

        home_adv_log = np.log(1.0 + home_adv)
        lambda_home = np.clip(np.exp(h_attack_raw + a_defence_raw + home_adv_log), 0.1, 5.0)
        lambda_away = np.clip(np.exp(a_attack_raw + h_defence_raw), 0.1, 5.0)

        for i in range(n_simulations):
            outcome = np.random.choice(["H", "D", "A"], p=proba_batch[i])
            home_goals, away_goals = None, None
            for _ in range(30):
                h_g = np.random.poisson(lambda_home)
                a_g = np.random.poisson(lambda_away)
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
                home_goals, away_goals = (
                    (1, 0) if outcome == "H" else (0, 1) if outcome == "A" else (1, 1)
                )

            update_simulation_state(
                home=home,
                away=away,
                match_date=match_date,
                home_goals=home_goals,
                away_goals=away_goals,
                sim_state=all_states[i],
                matchweek_number=matchweek_number,
                current_managers=mgrs,
                external_manager_experience=external_manager_experience,
            )

            all_results[i].append({
                "HomeTeam": home,
                "AwayTeam": away,
                "HomeGoals": home_goals,
                "AwayGoals": away_goals,
            })

    return [pd.DataFrame(r) for r in all_results]


def calculate_simulation_summary(
    all_sim_results: List[pd.DataFrame],
    actual_played: pd.DataFrame,
    current_20_teams_list: List[str],
    n_simulations: int,
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, List[int]], Dict[str, List[int]]]:
    """
    Aggregates simulation results across all trajectories to compute championship %,
    Top 4 %, relegation %, expected points, and P10/P50/P90 confidence bands.
    """
    champion_counts = {t: 0 for t in current_20_teams_list}
    top4_counts = {t: 0 for t in current_20_teams_list}
    relegation_counts = {t: 0 for t in current_20_teams_list}
    points_totals: Dict[str, List[int]] = {t: [] for t in current_20_teams_list}
    position_totals: Dict[str, List[int]] = {t: [] for t in current_20_teams_list}

    for sim_result in all_sim_results:
        full_season = pd.concat([actual_played, sim_result], ignore_index=True)
        table = build_league_table(full_season, current_20_teams_list)
        for position, row in enumerate(table.itertuples(), 1):
            if position == 1:
                champion_counts[row.Team] += 1
            if position <= 4:
                top4_counts[row.Team] += 1
            if position >= 18:
                relegation_counts[row.Team] += 1
            points_totals[row.Team].append(row.Points)
            position_totals[row.Team].append(position)

    final_probabilities = pd.DataFrame({
        "Team": current_20_teams_list,
        "Champion_%": [champion_counts[t] / n_simulations * 100.0 for t in current_20_teams_list],
        "Top4_%": [top4_counts[t] / n_simulations * 100.0 for t in current_20_teams_list],
        "Relegation_%": [relegation_counts[t] / n_simulations * 100.0 for t in current_20_teams_list],
        "Avg_Points": [float(np.mean(points_totals[t])) for t in current_20_teams_list],
        "Avg_Position": [float(np.mean(position_totals[t])) for t in current_20_teams_list],
    }).sort_values("Champion_%", ascending=False).reset_index(drop=True)
    final_probabilities.index += 1

    confidence_bands = pd.DataFrame({
        "Team": current_20_teams_list,
        "Points_P10": [float(np.percentile(points_totals[t], 10)) for t in current_20_teams_list],
        "Points_P50": [float(np.percentile(points_totals[t], 50)) for t in current_20_teams_list],
        "Points_P90": [float(np.percentile(points_totals[t], 90)) for t in current_20_teams_list],
        "Position_P10": [float(np.percentile(position_totals[t], 10)) for t in current_20_teams_list],
        "Position_P50": [float(np.percentile(position_totals[t], 50)) for t in current_20_teams_list],
        "Position_P90": [float(np.percentile(position_totals[t], 90)) for t in current_20_teams_list],
    })

    return final_probabilities, confidence_bands, points_totals, position_totals
