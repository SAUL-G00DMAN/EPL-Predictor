"""
Root-level simulation package re-exporting from epl_predictor.simulation.
"""

from epl_predictor.simulation.elo import (
    get_adaptive_k_factor,
    get_manager_for_team_at_date,
    init_manager_elo,
    update_elo_ratings,
)
from epl_predictor.simulation.engine import (
    build_simulation_features,
    predict_match_outcome,
    update_simulation_state,
)
from epl_predictor.simulation.simulator import (
    build_league_table,
    calculate_simulation_summary,
    run_batch_simulations,
    run_single_simulation,
)

__all__ = [
    "update_elo_ratings",
    "get_adaptive_k_factor",
    "init_manager_elo",
    "get_manager_for_team_at_date",
    "build_simulation_features",
    "predict_match_outcome",
    "update_simulation_state",
    "build_league_table",
    "run_single_simulation",
    "run_batch_simulations",
    "calculate_simulation_summary",
]
