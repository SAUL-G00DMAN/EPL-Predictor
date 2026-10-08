"""
Constants and configurations for EPL Prediction and Simulation.
Extracted directly from PL_WINNER_Final.ipynb.
"""

# --- Elo Constants ---
DEFAULT_ELO = 1500
K_FACTOR = 20
HOME_ADVANTAGE = 100
FORM_WINDOW = 5
MANAGER_DEFAULT_ELO = 1500
MANAGER_XG_ALPHA = 0.15

# --- Dixon-Coles Defaults ---
DEFAULT_XI = 0.001
DEFAULT_HOME_ADVANTAGE = 0.2

# --- Team Name Mapping ---
# Master name map to unify team names across Football-Data, Understat, and Fixtures
MASTER_NAME_MAP = {
    'Hull': 'Hull City',
    'Ipswich': 'Ipswich Town',
    'Leeds': 'Leeds United',
    'Coventry': 'Coventry City',
}

FIXTURE_NAME_FIX = {
    **MASTER_NAME_MAP,
    'Man Utd': 'Man United',
    'Spurs': 'Tottenham',
    'Manchester City': 'Man City',
    'Manchester United': 'Man United',
    'Newcastle United': 'Newcastle',
    "Nottingham Forest": "Nott'm Forest",
    'Wolverhampton Wanderers': 'Wolves',
}

# --- Feature Columns used in XGBoost Simulation Model ---
FEATURE_COLS_SIMULATION = [
    'HomeElo',
    'AwayElo',
    'EloDiff',
    'HomeFormPoints',
    'HomeFormGoalsScored',
    'HomeFormGoalsConceded',
    'AwayFormPoints',
    'AwayFormGoalsScored',
    'AwayFormGoalsConceded',
    'HomeManagerElo',
    'AwayManagerElo',
    'HomeManagerKnown',
    'AwayManagerKnown',
    'HomeDaysRest',
    'AwayDaysRest',
    'HomeShortRest',
    'AwayShortRest',
    'HomeAttack',
    'HomeDefence',
    'AwayAttack',
    'AwayDefence',
    'EloCloseness',
    'AttackCloseness',
]

# --- Target Mappings ---
TARGET_MAP = {'H': 0, 'D': 1, 'A': 2}
INV_TARGET_MAP = {0: 'H', 1: 'D', 2: 'A'}
