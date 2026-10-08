"""
Verification script for EPLPredictor refactored package.
Validates imports, single initialization, table correctness against pickle,
match prediction, and simulation execution.
"""

import pickle
import sys
import pandas as pd
import numpy as np

def run_tests():
    print("=" * 60)
    print("STEP 1: Testing Imports")
    print("=" * 60)
    
    from epl_predictor import EPLPredictor
    from predictor import EPLPredictor as RootEPLPredictor
    from epl_predictor.data import load_pickle_data
    from epl_predictor.models import DixonColesModel, XGBoostMatchModel
    from epl_predictor.simulation import (
        build_simulation_features,
        predict_match_outcome,
        update_simulation_state,
        run_batch_simulations,
        run_single_simulation,
        build_league_table,
    )
    print(" [PASSED] All submodules and classes imported successfully.")

    print("\n" + "=" * 60)
    print("STEP 2: Initializing EPLPredictor (Single Load)")
    print("=" * 60)
    
    predictor = EPLPredictor()
    print(" [PASSED] EPLPredictor initialized.")
    print(f"  Teams count: {len(predictor.get_team_list())}")
    print(f"  Remaining fixtures count: {len(predictor.remaining_fixtures)}")
    print(f"  Actual played matches: {len(predictor.actual_played)}")

    print("\n" + "=" * 60)
    print("STEP 3: Correctness Check - get_current_probabilities()")
    print("=" * 60)
    
    # Load raw pickle for exact comparison
    with open("FINAL_project_with_simulation.pkl", "rb") as f:
        raw_pickle = pickle.load(f)
    expected_fp = raw_pickle["final_probabilities"]
    expected_cb = raw_pickle["confidence_bands"]

    # 1. Check final_probabilities alone
    curr_probs_raw = predictor.get_current_probabilities(include_confidence_bands=False)
    pd.testing.assert_frame_equal(curr_probs_raw, expected_fp)
    print(" [PASSED] Raw final_probabilities reproduces pickle exactly.")

    # 2. Check merged table
    merged_table = predictor.get_current_probabilities(include_confidence_bands=True)
    pd.testing.assert_frame_equal(merged_table[expected_fp.columns], expected_fp)
    print(" [PASSED] Merged table probability columns match pickle exactly.")
    
    # Check confidence bands columns in merged table
    pd.testing.assert_frame_equal(
        merged_table[expected_cb.columns].sort_values("Team").reset_index(drop=True),
        expected_cb.sort_values("Team").reset_index(drop=True)
    )
    print(" [PASSED] Merged confidence band columns match pickle exactly.")

    print("\n" + "=" * 60)
    print("STEP 4: Testing predict_match()")
    print("=" * 60)
    
    match_res = predictor.predict_match("Arsenal", "Chelsea")
    print(f"  Prediction (Arsenal vs Chelsea):")
    print(f"    Home Win (H): {match_res['H']:.4f}")
    print(f"    Draw     (D): {match_res['D']:.4f}")
    print(f"    Away Win (A): {match_res['A']:.4f}")
    print(f"    Expected Goals: {match_res['expected_goals']}")
    print(f"    Predicted Outcome: {match_res['predicted_outcome']}")
    assert abs(match_res['H'] + match_res['D'] + match_res['A'] - 1.0) < 1e-4
    print(" [PASSED] Match probabilities sum to 1.0.")

    # Test alias resolution
    alias_res = predictor.predict_match("Man Utd", "Spurs")
    assert alias_res["home_team"] == "Man United"
    assert alias_res["away_team"] == "Tottenham"
    print(" [PASSED] Aliases 'Man Utd' and 'Spurs' normalized correctly.")

    print("\n" + "=" * 60)
    print("STEP 5: Testing run_fresh_simulation (n=2 smoke test)")
    print("=" * 60)
    
    sim_res = predictor.run_fresh_simulation(n=2, seed=42)
    assert "final_probabilities" in sim_res
    assert "confidence_bands" in sim_res
    assert len(sim_res["final_probabilities"]) == 20
    assert len(sim_res["confidence_bands"]) == 20
    print(" [PASSED] Fresh Monte Carlo simulation runs and aggregates cleanly.")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
