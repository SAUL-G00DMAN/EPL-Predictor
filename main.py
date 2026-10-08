"""
Premier League Winner Predictor — FastAPI Backend Application.
Entrypoint providing match outcome predictions and season simulation probabilities.
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import math
import os
from typing import Optional

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd

from epl_predictor import EPLPredictor
from schemas import (
    ErrorResponse,
    ExpectedGoals,
    HealthResponse,
    LeagueTableResponse,
    MatchPredictionResponse,
    MatchProbabilities,
    ReloadModelResponse,
    SimulationJobResponse,
    TeamProjection,
    TeamsResponse,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("epl_api")

# Load environment variables from .env file if present
from dotenv import load_dotenv
load_dotenv()

# Shared admin secret token (configurable via environment variable)
ADMIN_SECRET_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "epl-admin-secret-dev")

OUTCOME_DESCRIPTIONS = {
    "H": "Home Win",
    "D": "Draw",
    "A": "Away Win",
}


CURRENT_MW5_STANDINGS = {
    "Man City": 1,
    "Arsenal": 2,
    "Brighton": 3,
    "Brentford": 4,
    "Leeds United": 5,
    "Liverpool": 6,
    "Everton": 7,
    "Hull City": 8,
    "Newcastle": 9,
    "Chelsea": 10,
    "Ipswich Town": 11,
    "Man United": 12,
    "Nott'm Forest": 13,
    "Sunderland": 14,
    "Crystal Palace": 15,
    "Aston Villa": 16,
    "Bournemouth": 17,
    "Coventry City": 18,
    "Fulham": 19,
    "Tottenham": 20,
}


def compute_current_standings(actual_played: pd.DataFrame, teams: list[str]) -> dict[str, int]:
    """Computes exact current league standings from played matches (Matchweek 5)."""
    records = {t: {"pts": 0, "gd": 0, "gf": 0} for t in teams}
    for _, row in actual_played.iterrows():
        h = str(row["HomeTeam"])
        a = str(row["AwayTeam"])
        try:
            hg = int(row["HomeGoals"])
            ag = int(row["AwayGoals"])
        except (ValueError, TypeError):
            continue
        if h in records and a in records:
            records[h]["gf"] += hg
            records[h]["gd"] += (hg - ag)
            records[a]["gf"] += ag
            records[a]["gd"] += (ag - hg)
            if hg > ag:
                records[h]["pts"] += 3
            elif ag > hg:
                records[a]["pts"] += 3
            else:
                records[h]["pts"] += 1
                records[a]["pts"] += 1
    sorted_teams = sorted(
        teams,
        key=lambda t: (records[t]["pts"], records[t]["gd"], records[t]["gf"]),
        reverse=True,
    )
    return {team: rank for rank, team in enumerate(sorted_teams, 1)}


# --- Lifespan Event ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Loads the EPLPredictor model ONCE during application startup and stores it in app.state.
    Ensures that module import is non-blocking and the ~86MB pickle is deserialized only once.
    """
    logger.info("Initializing EPLPredictor from pickle...")
    try:
        predictor = EPLPredictor()
        app.state.predictor = predictor
        try:
            app.state.current_standings = compute_current_standings(
                predictor.actual_played, predictor.get_team_list()
            )
        except Exception as e:
            logger.warning("Could not compute dynamic standings; using static MW5 map: %s", e)
            app.state.current_standings = CURRENT_MW5_STANDINGS
        logger.info(
            "EPLPredictor initialized successfully with %d teams and %d remaining fixtures.",
            len(predictor.get_team_list()),
            len(predictor.remaining_fixtures),
        )
    except Exception as exc:
        logger.critical("Failed to load EPLPredictor at startup: %s", exc, exc_info=True)
        app.state.predictor = None
        app.state.current_standings = CURRENT_MW5_STANDINGS

    yield

    logger.info("Shutting down EPL Predictor API.")


# --- FastAPI App Initialization ---

app = FastAPI(
    title="Premier League Prediction API",
    description=(
        "High-performance API for Premier League match outcome forecasting, "
        "Dixon-Coles Poisson expected goals, and Monte Carlo season simulation projections."
    ),
    version="1.0.0",
    lifespan=lifespan,
    responses={
        404: {"model": ErrorResponse, "description": "Resource or team not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)

# Enable CORS for local dev & frontend consumption
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Dependency Helpers ---

def get_predictor(request: Request) -> EPLPredictor:
    """Dependency retrieving the loaded EPLPredictor instance from app.state."""
    predictor: Optional[EPLPredictor] = getattr(request.app.state, "predictor", None)
    if predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="EPLPredictor model is not currently loaded into memory.",
        )
    return predictor


def verify_admin_token(x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token")) -> str:
    """Simple shared-secret header validation to protect admin maintenance routes."""
    if not x_admin_token or x_admin_token != ADMIN_SECRET_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing admin token. Provide a valid 'X-Admin-Token' header.",
        )
    return x_admin_token


# --- Core Endpoints ---

@app.get(
    "/",
    response_model=HealthResponse,
    summary="Health Check & Model Metadata",
    tags=["System"],
)
def health_check(request: Request):
    """Returns basic system health, operational status, and active model metadata."""
    predictor: Optional[EPLPredictor] = getattr(request.app.state, "predictor", None)
    is_loaded = predictor is not None

    return HealthResponse(
        status="ok",
        app_name="Premier League Prediction API",
        model_loaded=is_loaded,
        teams_count=len(predictor.get_team_list()) if is_loaded else 0,
        remaining_fixtures=len(predictor.remaining_fixtures) if is_loaded else 0,
        accuracy_gate=predictor.accuracy_gate_result if is_loaded else None,
    )


@app.get(
    "/teams",
    response_model=TeamsResponse,
    summary="Get Active Premier League Teams",
    tags=["Teams"],
)
def get_teams(predictor: EPLPredictor = Depends(get_predictor)):
    """Returns the list of all 20 active Premier League teams in the model."""
    team_list = predictor.get_team_list()
    return TeamsResponse(teams=team_list, count=len(team_list))


@app.get(
    "/predictions/table",
    response_model=LeagueTableResponse,
    summary="Get League Table Projections",
    tags=["Predictions"],
)
def get_league_table(
    request: Request,
    include_bands: bool = Query(
        default=True,
        description="Whether to include P10/P50/P90 percentile confidence intervals for points and position",
    ),
    predictor: EPLPredictor = Depends(get_predictor),
):
    """
    Returns the complete 20-team Premier League projection table.
    Includes title (Champion_%), Champions League qualification (Top4_%), and Relegation_%
    probabilities alongside expected points and positions from 10,000 simulations.
    Strictly sorted by projected points (Avg_Points) descending to ensure monotonic rankings.
    """
    df = predictor.get_current_probabilities(include_confidence_bands=include_bands)

    # Strictly sort by projected points descending
    if "Avg_Points" in df.columns:
        df = df.sort_values(by="Avg_Points", ascending=False).reset_index(drop=True)

    current_standings = getattr(request.app.state, "current_standings", None)
    if not current_standings:
        try:
            current_standings = compute_current_standings(
                predictor.actual_played, predictor.get_team_list()
            )
        except Exception:
            current_standings = CURRENT_MW5_STANDINGS

    records = df.to_dict(orient="records")
    table: list[TeamProjection] = []
    for rank, row in enumerate(records, start=1):
        team_name = str(row["Team"])
        projection = TeamProjection(
            rank=rank,
            team=team_name,
            champion_pct=float(row["Champion_%"]),
            top4_pct=float(row["Top4_%"]),
            relegation_pct=float(row["Relegation_%"]),
            avg_points=float(row["Avg_Points"]),
            avg_position=float(row["Avg_Position"]),
            current_rank=current_standings.get(team_name),
            points_p10=float(row["Points_P10"]) if "Points_P10" in row and pd.notna(row["Points_P10"]) else None,
            points_p50=float(row["Points_P50"]) if "Points_P50" in row and pd.notna(row["Points_P50"]) else None,
            points_p90=float(row["Points_P90"]) if "Points_P90" in row and pd.notna(row["Points_P90"]) else None,
            position_p10=float(row["Position_P10"]) if "Position_P10" in row and pd.notna(row["Position_P10"]) else None,
            position_p50=float(row["Position_P50"]) if "Position_P50" in row and pd.notna(row["Position_P50"]) else None,
            position_p90=float(row["Position_P90"]) if "Position_P90" in row and pd.notna(row["Position_P90"]) else None,
        )
        table.append(projection)

    return LeagueTableResponse(
        season="2026-27",
        simulations_count=predictor.n_simulations,
        include_confidence_bands=include_bands,
        table=table,
    )


@app.get(
    "/predictions/match",
    response_model=MatchPredictionResponse,
    summary="Predict Individual Match Outcome",
    tags=["Predictions"],
)
def predict_match(
    home_team: str = Query(..., description="Home team name (e.g. 'Arsenal', 'Spurs', 'Man Utd')"),
    away_team: str = Query(..., description="Away team name (e.g. 'Chelsea', 'Liverpool')"),
    match_date: Optional[str] = Query(
        default=None,
        description="Match date in YYYY-MM-DD format (defaults to today if omitted)",
    ),
    predictor: EPLPredictor = Depends(get_predictor),
):
    """
    Computes 3-way match probabilities (Home Win / Draw / Away Win) using the trained XGBoost
    classifier alongside Dixon-Coles expected goal rates (lambdas).
    
    If either team name is unrecognized (even after alias normalization), returns HTTP 404
    with the complete list of valid Premier League teams.
    """
    valid_teams = predictor.get_team_list()

    norm_home = predictor.normalize_team_name(home_team)
    norm_away = predictor.normalize_team_name(away_team)

    # Validate home and away team names
    unrecognized = []
    if norm_home not in valid_teams:
        unrecognized.append(f"home_team '{home_team}' (normalized: '{norm_home}')")
    if norm_away not in valid_teams:
        unrecognized.append(f"away_team '{away_team}' (normalized: '{norm_away}')")

    if unrecognized:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unrecognized team name(s): {', '.join(unrecognized)}. Valid teams: {valid_teams}",
        )

    if norm_home == norm_away:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Home team and away team cannot be identical ('{norm_home}').",
        )

    # Fallback date to today if omitted
    effective_date = match_date if match_date else datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        raw_result = predictor.predict_match(
            home_team=norm_home,
            away_team=norm_away,
            match_date=effective_date,
        )
    except Exception as exc:
        logger.error("Match prediction failed for %s vs %s: %s", norm_home, norm_away, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error during match prediction: {str(exc)}",
        )

    # Genuinely probabilistic match simulation:
    # 1. Sample an outcome category H/D/A from the XGBoost probabilities
    prob_h = float(raw_result["H"])
    prob_d = float(raw_result["D"])
    prob_a = float(raw_result["A"])
    probs = [prob_h, prob_d, prob_a]
    prob_sum = sum(probs)
    probs_norm = [p / prob_sum for p in probs] if prob_sum > 0 else [0.333, 0.333, 0.334]
    sampled_outcome = str(np.random.choice(["H", "D", "A"], p=probs_norm))
    outcome_meaning = OUTCOME_DESCRIPTIONS.get(sampled_outcome, "Unknown")

    # 2. Rejection sampling for Poisson scoreline consistent with sampled outcome category (matching engine.py)
    lambda_h = float(raw_result["expected_goals"]["home"])
    lambda_a = float(raw_result["expected_goals"]["away"])

    home_goals, away_goals = None, None
    for _ in range(30):
        h_g = int(np.random.poisson(lambda_h))
        a_g = int(np.random.poisson(lambda_a))
        if sampled_outcome == "H" and h_g > a_g:
            home_goals, away_goals = h_g, a_g
            break
        if sampled_outcome == "D" and h_g == a_g:
            home_goals, away_goals = h_g, a_g
            break
        if sampled_outcome == "A" and h_g < a_g:
            home_goals, away_goals = h_g, a_g
            break

    if home_goals is None:
        if sampled_outcome == "H":
            home_goals, away_goals = 1, 0
        elif sampled_outcome == "A":
            home_goals, away_goals = 0, 1
        else:
            home_goals, away_goals = 1, 1

    predicted_score = f"{home_goals}-{away_goals}"

    # 3. Deterministic "most likely" scoreline:
    # Single-most-probable (home_goals, away_goals) combination from the two Poisson lambdas,
    # conditioned on the predicted outcome category from XGBoost (raw_result["predicted_outcome"]).
    pred_category = raw_result.get("predicted_outcome") or (
        "H" if prob_h >= prob_d and prob_h >= prob_a else ("D" if prob_d >= prob_a else "A")
    )
    best_p = -1.0
    best_h, best_a = (1, 0) if pred_category == "H" else ((0, 1) if pred_category == "A" else (1, 1))

    for h in range(10):
        for a in range(10):
            if pred_category == "H" and h <= a:
                continue
            if pred_category == "D" and h != a:
                continue
            if pred_category == "A" and h >= a:
                continue

            # Joint independent Poisson probability
            p = (
                ((lambda_h ** h) * math.exp(-lambda_h) / math.factorial(h))
                * ((lambda_a ** a) * math.exp(-lambda_a) / math.factorial(a))
            )
            if p > best_p:
                best_p = p
                best_h, best_a = h, a

    most_likely_score = f"{best_h}-{best_a}"

    return MatchPredictionResponse(
        home_team=raw_result["home_team"],
        away_team=raw_result["away_team"],
        match_date=str(raw_result["match_date"]),
        probabilities=MatchProbabilities(
            H=round(raw_result["H"], 4),
            D=round(raw_result["D"], 4),
            A=round(raw_result["A"], 4),
        ),
        expected_goals=ExpectedGoals(
            home=round(raw_result["expected_goals"]["home"], 2),
            away=round(raw_result["expected_goals"]["away"], 2),
        ),
        predicted_outcome=sampled_outcome,
        outcome_meaning=outcome_meaning,
        predicted_score=predicted_score,
        most_likely_score=most_likely_score,
    )


# --- Admin Maintenance Endpoints ---

@app.post(
    "/admin/reload-model",
    response_model=ReloadModelResponse,
    summary="Hot-Reload Model from Disk",
    tags=["Admin"],
)
def reload_model(
    request: Request,
    _: str = Depends(verify_admin_token),
):
    """
    Re-instantiates EPLPredictor from the disk pickle file and swaps it into app.state atomically.
    If the reload fails (e.g. invalid or corrupt file), the existing model continues serving traffic
    uninterrupted, and an HTTP 500 error is returned with details.
    
    Protected by X-Admin-Token header.
    """
    logger.info("Received model hot-reload request.")
    try:
        # Instantiate new model instance first
        new_predictor = EPLPredictor()

        # Atomic in-memory swap
        request.app.state.predictor = new_predictor

        now_iso = datetime.now(timezone.utc).isoformat()
        logger.info("Model reloaded successfully at %s.", now_iso)
        return ReloadModelResponse(
            status="success",
            message="Model successfully reloaded from disk and swapped atomically.",
            teams_count=len(new_predictor.get_team_list()),
            remaining_fixtures=len(new_predictor.remaining_fixtures),
            reloaded_at=now_iso,
        )
    except Exception as exc:
        logger.error("Hot-reload failed: %s. Keeping previous model active.", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model reload failed: {str(exc)}. The active model was retained and remains operational.",
        )


def _background_simulation_worker(predictor: EPLPredictor, n: int):
    """
    Background worker that runs the Monte Carlo simulation for admin/testing inspection.
    Results are NEVER written back to the live predictor state — they are logged only.
    The only way to update the public /predictions/table is via /admin/reload-model.
    """
    logger.info("Background simulation worker started for N=%d iterations...", n)
    try:
        results = predictor.run_fresh_simulation(n=n, update_state=False)
        top3 = results["final_probabilities"].head(3)[["Team", "Champion_%"]].to_dict(orient="records")
        logger.info(
            "Background simulation finished (N=%d). Results are for inspection only — "
            "live public table was NOT modified. Top 3: %s",
            n,
            top3,
        )
    except Exception as exc:
        logger.error("Background simulation failed: %s", exc, exc_info=True)


@app.post(
    "/admin/run-simulation",
    response_model=SimulationJobResponse,
    summary="Trigger Offline Monte Carlo Simulation (read-only, never updates public table)",
    tags=["Admin"],
)
def trigger_simulation(
    background_tasks: BackgroundTasks,
    n_simulations: int = Query(
        default=1000,
        ge=10,
        le=10000,
        description="Number of season trajectories to simulate (Monte Carlo iterations)",
    ),
    predictor: EPLPredictor = Depends(get_predictor),
    _: str = Depends(verify_admin_token),
):
    """
    Dispatches a Monte Carlo simulation as a FastAPI BackgroundTask for admin/inspection purposes.
    Returns immediately with an acknowledgment — the heavy computation runs in the background.

    **ISOLATION GUARANTEE:**
    This endpoint is 100% read-only with respect to the live serving state.
    Simulation results are computed and logged but are NEVER written back to
    `predictor.final_probabilities` or any other attribute that `GET /predictions/table` reads from.

    The ONLY way to update what the public `/predictions/table` endpoint returns is:
      1. Regenerate the pickle from Colab (the authoritative 10,000-run).
      2. Replace `FINAL_project_with_simulation.pkl` on disk.
      3. Call `POST /admin/reload-model` to atomically swap the new model into memory.
    """
    background_tasks.add_task(
        _background_simulation_worker,
        predictor=predictor,
        n=n_simulations,
    )

    return SimulationJobResponse(
        status="started",
        message=f"Simulation job queued for N={n_simulations} iterations (background, inspection-only).",
        n_simulations=n_simulations,
        persistence_notice=(
            "ISOLATION GUARANTEED: This simulation NEVER modifies the live in-memory state "
            "that GET /predictions/table reads from. Results are logged for inspection only. "
            "To update the public table, replace the pickle on disk and call POST /admin/reload-model."
        ),
    )
