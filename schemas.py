"""
Pydantic schemas and response models for the EPL Predictor FastAPI service.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# --- Health & Metadata ---

class HealthResponse(BaseModel):
    status: str = Field(..., description="API operational status")
    app_name: str = Field(..., description="Application name")
    model_loaded: bool = Field(..., description="Whether the EPLPredictor model is loaded into memory")
    teams_count: int = Field(..., description="Number of teams in the active league model")
    remaining_fixtures: int = Field(..., description="Number of unplayed fixtures remaining in the season")
    accuracy_gate: Optional[Dict[str, Any]] = Field(
        None, description="Accuracy and log-loss evaluation from model training"
    )


class TeamsResponse(BaseModel):
    teams: List[str] = Field(..., description="List of all 20 active Premier League team names")
    count: int = Field(..., description="Total count of teams")


# --- League Table Projections ---

class TeamProjection(BaseModel):
    rank: int = Field(..., description="Projected rank based on title probability / points")
    team: str = Field(..., description="Team name")
    champion_pct: float = Field(..., description="Probability of winning the Premier League title (%)")
    top4_pct: float = Field(..., description="Probability of finishing in the top 4 (Champions League) (%)")
    relegation_pct: float = Field(..., description="Probability of relegation (18th - 20th) (%)")
    avg_points: float = Field(..., description="Projected mean points tally across 10,000 simulations")
    avg_position: float = Field(..., description="Projected mean table position")

    # Current Standing (Matchweek 5)
    current_rank: Optional[int] = Field(None, description="Current real standing in Matchweek 5")

    # Confidence Bands (Optional)
    points_p10: Optional[float] = Field(None, description="10th percentile projected points (downside scenario)")
    points_p50: Optional[float] = Field(None, description="50th percentile (median) projected points")
    points_p90: Optional[float] = Field(None, description="90th percentile projected points (upside scenario)")
    position_p10: Optional[float] = Field(None, description="10th percentile best position finish")
    position_p50: Optional[float] = Field(None, description="50th percentile (median) position finish")
    position_p90: Optional[float] = Field(None, description="90th percentile worst position finish")


class LeagueTableResponse(BaseModel):
    season: str = Field("2026-27", description="Premier League season")
    simulations_count: int = Field(..., description="Number of Monte Carlo simulations backing these probabilities")
    include_confidence_bands: bool = Field(..., description="Whether P10/P50/P90 confidence intervals are included")
    table: List[TeamProjection] = Field(..., description="20-team league table sorted by championship probability")


# --- Match Predictions ---

class MatchProbabilities(BaseModel):
    H: float = Field(..., description="Probability of Home team win (0.0 - 1.0)")
    D: float = Field(..., description="Probability of Draw (0.0 - 1.0)")
    A: float = Field(..., description="Probability of Away team win (0.0 - 1.0)")


class ExpectedGoals(BaseModel):
    home: float = Field(..., description="Dixon-Coles Poisson expected goals for the Home team")
    away: float = Field(..., description="Dixon-Coles Poisson expected goals for the Away team")


class MatchPredictionResponse(BaseModel):
    home_team: str = Field(..., description="Canonical name of the home team")
    away_team: str = Field(..., description="Canonical name of the away team")
    match_date: str = Field(..., description="Match date used for rest-day and schedule calculations")
    probabilities: MatchProbabilities = Field(..., description="3-way outcome probabilities")
    expected_goals: ExpectedGoals = Field(..., description="Poisson expected goals lambda rates")
    predicted_outcome: str = Field(..., description="Most probable outcome code ('H', 'D', 'A')")
    outcome_meaning: str = Field(..., description="Human-readable outcome description")
    predicted_score: str = Field(..., description="Probabilistic simulated scoreline consistent with sampled outcome")
    most_likely_score: str = Field(..., description="Deterministic single-most-probable (home_goals, away_goals) combination from Poisson lambdas conditioned on predicted outcome category")


# --- Admin Endpoints ---

class ReloadModelResponse(BaseModel):
    status: str = Field(..., description="Operation status ('success' or 'error')")
    message: str = Field(..., description="Status message detailing the reload action")
    teams_count: int = Field(..., description="Number of teams in newly loaded model")
    remaining_fixtures: int = Field(..., description="Number of remaining fixtures in newly loaded model")
    reloaded_at: str = Field(..., description="UTC ISO-8601 timestamp of reload")


class SimulationJobResponse(BaseModel):
    status: str = Field(..., description="Job queue status ('started')")
    message: str = Field(..., description="Confirmation that the task was dispatched to background")
    n_simulations: int = Field(..., description="Number of simulations being computed")
    persistence_notice: str = Field(..., description="Information on memory vs disk persistence")


# --- Error Response ---

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error explanation")
    valid_teams: Optional[List[str]] = Field(None, description="List of recognized team names if applicable")
