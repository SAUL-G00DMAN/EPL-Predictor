"""
Dixon-Coles model wrapper and goal distribution utilities.
Extracted from PL_WINNER_Final.ipynb.
"""

from typing import Dict, Optional, Tuple, Any
import numpy as np


class DixonColesModel:
    """
    Wrapper for Dixon-Coles Poisson goal rates and outcome-conditioned scoreline sampling.
    """

    def __init__(
        self,
        attack_dict: Dict[str, float],
        defence_dict: Dict[str, float],
        params: Optional[Dict[str, Any]] = None,
        xi: float = 0.001,
        home_advantage: Optional[float] = None,
    ):
        """
        Args:
            attack_dict: Mapping of team name to Dixon-Coles attack strength.
            defence_dict: Mapping of team name to Dixon-Coles defence strength.
            params: Dictionary of fitted Dixon-Coles parameters (from penaltyblog or pickle).
            xi: Time decay factor (default 0.001).
            home_advantage: Home advantage factor (defaults to params.get('home_advantage', 0.2)).
        """
        self.attack_dict = attack_dict
        self.defence_dict = defence_dict
        self.params = params or {}
        self.xi = xi

        if home_advantage is not None:
            self.home_advantage = home_advantage
        else:
            self.home_advantage = float(self.params.get("home_advantage", 0.2))

        self.rho = float(self.params.get("rho", 0.0))

    def get_attack(self, team: str, default: float = 0.0) -> float:
        """Returns the attack rating for a team."""
        return self.attack_dict.get(team, default)

    def get_defence(self, team: str, default: float = 0.0) -> float:
        """Returns the defence rating for a team."""
        return self.defence_dict.get(team, default)

    def calculate_lambdas(self, home: str, away: str) -> Tuple[float, float]:
        """
        Calculates expected goals (lambda_home, lambda_away) using the log-linear formulation:
            log(lambda_home) = attack_home + defence_away + log(1 + home_advantage)
            log(lambda_away) = attack_away + defence_home
        Clipped to [0.1, 5.0] as in the original notebook.
        """
        h_attack_raw = self.attack_dict.get(home, 0.0)
        a_defence_raw = self.defence_dict.get(away, 0.0)
        a_attack_raw = self.attack_dict.get(away, 0.0)
        h_defence_raw = self.defence_dict.get(home, 0.0)

        home_adv_log = np.log(1.0 + self.home_advantage)
        lambda_home = float(np.clip(np.exp(h_attack_raw + a_defence_raw + home_adv_log), 0.1, 5.0))
        lambda_away = float(np.clip(np.exp(a_attack_raw + h_defence_raw), 0.1, 5.0))

        return lambda_home, lambda_away

    def sample_goals(
        self,
        outcome: str,
        lambda_home: float,
        lambda_away: float,
        max_tries: int = 30,
    ) -> Tuple[int, int]:
        """
        Samples integer scorelines (home_goals, away_goals) from Poisson distributions
        conditioned on the match outcome ('H', 'D', 'A').
        Falls back to canonical minimal scores (1-0, 0-1, 1-1) if max_tries is reached.
        """
        for _ in range(max_tries):
            h_g = int(np.random.poisson(lambda_home))
            a_g = int(np.random.poisson(lambda_away))
            if outcome == "H" and h_g > a_g:
                return h_g, a_g
            if outcome == "D" and h_g == a_g:
                return h_g, a_g
            if outcome == "A" and h_g < a_g:
                return h_g, a_g

        # Fallback if sampling doesn't produce matching outcome
        if outcome == "H":
            return 1, 0
        elif outcome == "A":
            return 0, 1
        else:
            return 1, 1
