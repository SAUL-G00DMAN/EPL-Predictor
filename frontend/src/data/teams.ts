export interface TeamMetadata {
  name: string;
  shortName: string;
  crestUrl: string;
  primaryColor: string;
  secondaryColor: string;
  manager: string;
  elo: number;
  attackRating: number;
  defenceRating: number;
  recentFormPoints: number;
  managerElo: number;
  stadium: string;
  form: ("W" | "D" | "L")[];
}

export const PREMIER_LEAGUE_LOGO = "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg";

export const TEAMS_DATA: Record<string, TeamMetadata> = {
  Arsenal: {
    name: "Arsenal",
    shortName: "ARS",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t3.png",
    primaryColor: "#EF0107",
    secondaryColor: "#063672",
    manager: "Mikel Arteta",
    elo: 1740,
    attackRating: 1.45,
    defenceRating: -1.36,
    recentFormPoints: 12,
    managerElo: 1724,
    stadium: "Emirates Stadium",
    form: ["W", "W", "W", "L", "W"],
  },
  "Aston Villa": {
    name: "Aston Villa",
    shortName: "AVL",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t7.png",
    primaryColor: "#95BFE5",
    secondaryColor: "#670E36",
    manager: "Unai Emery",
    elo: 1574,
    attackRating: 1.23,
    defenceRating: -0.95,
    recentFormPoints: 5,
    managerElo: 1562,
    stadium: "Villa Park",
    form: ["L", "D", "L", "W", "D"],
  },
  Bournemouth: {
    name: "Bournemouth",
    shortName: "BOU",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t91.png",
    primaryColor: "#DA291C",
    secondaryColor: "#000000",
    manager: "Marco Rose",
    elo: 1555,
    attackRating: 1.17,
    defenceRating: -0.86,
    recentFormPoints: 3,
    managerElo: 1511,
    stadium: "Vitality Stadium",
    form: ["D", "D", "D", "L", "L"],
  },
  Brentford: {
    name: "Brentford",
    shortName: "BRE",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t94.png",
    primaryColor: "#E30613",
    secondaryColor: "#FBB800",
    manager: "Keith Andrews",
    elo: 1561,
    attackRating: 1.26,
    defenceRating: -0.94,
    recentFormPoints: 7,
    managerElo: 1539,
    stadium: "Gtech Community Stadium",
    form: ["D", "D", "D", "W", "D"],
  },
  Brighton: {
    name: "Brighton",
    shortName: "BHA",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t36.png",
    primaryColor: "#0057B8",
    secondaryColor: "#FFCD00",
    manager: "Fabian Hurzeler",
    elo: 1591,
    attackRating: 1.25,
    defenceRating: -0.97,
    recentFormPoints: 10,
    managerElo: 1584,
    stadium: "Amex Stadium",
    form: ["L", "D", "W", "W", "W"],
  },
  Chelsea: {
    name: "Chelsea",
    shortName: "CHE",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t8.png",
    primaryColor: "#034694",
    secondaryColor: "#EE242C",
    manager: "Xabi Alonso",
    elo: 1563,
    attackRating: 1.34,
    defenceRating: -0.99,
    recentFormPoints: 7,
    managerElo: 1566,
    stadium: "Stamford Bridge",
    form: ["W", "L", "D", "L", "W"],
  },
  "Coventry City": {
    name: "Coventry City",
    shortName: "COV",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t9.png",
    primaryColor: "#00AEEF",
    secondaryColor: "#1D1D1B",
    manager: "Frank Lampard",
    elo: 1345,
    attackRating: 0.82,
    defenceRating: -0.82,
    recentFormPoints: 6,
    managerElo: 1443,
    stadium: "Coventry Building Society Arena",
    form: ["L", "L", "L", "W", "W"],
  },
  "Crystal Palace": {
    name: "Crystal Palace",
    shortName: "CRY",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t31.png",
    primaryColor: "#1B458F",
    secondaryColor: "#C4122E",
    manager: "Pierre Sage",
    elo: 1511,
    attackRating: 1.04,
    defenceRating: -0.93,
    recentFormPoints: 7,
    managerElo: 1515,
    stadium: "Selhurst Park",
    form: ["L", "W", "L", "D", "W"],
  },
  Everton: {
    name: "Everton",
    shortName: "EVE",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t11.png",
    primaryColor: "#003399",
    secondaryColor: "#FFFFFF",
    manager: "David Moyes",
    elo: 1520,
    attackRating: 0.96,
    defenceRating: -1.02,
    recentFormPoints: 7,
    managerElo: 1512,
    stadium: "Goodison Park",
    form: ["D", "D", "D", "W", "D"],
  },
  Fulham: {
    name: "Fulham",
    shortName: "FUL",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t54.png",
    primaryColor: "#CC0000",
    secondaryColor: "#000000",
    manager: "Alvaro Arbeloa",
    elo: 1504,
    attackRating: 1.07,
    defenceRating: -0.92,
    recentFormPoints: 2,
    managerElo: 1556,
    stadium: "Craven Cottage",
    form: ["L", "L", "D", "D", "L"],
  },
  "Hull City": {
    name: "Hull City",
    shortName: "HUL",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t88.png",
    primaryColor: "#F5971E",
    secondaryColor: "#000000",
    manager: "Sergej Jakirovic",
    elo: 1421,
    attackRating: 1.08,
    defenceRating: -1.08,
    recentFormPoints: 6,
    managerElo: 1506,
    stadium: "MKM Stadium",
    form: ["W", "D", "D", "L", "D"],
  },
  "Ipswich Town": {
    name: "Ipswich Town",
    shortName: "IPS",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t40.png",
    primaryColor: "#004494",
    secondaryColor: "#FFFFFF",
    manager: "Gary O'Neil",
    elo: 1358,
    attackRating: 0.92,
    defenceRating: -0.53,
    recentFormPoints: 6,
    managerElo: 1418,
    stadium: "Portman Road",
    form: ["L", "L", "W", "L", "W"],
  },
  "Leeds United": {
    name: "Leeds United",
    shortName: "LEE",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t2.png",
    primaryColor: "#FFCD00",
    secondaryColor: "#1D428A",
    manager: "Daniel Farke",
    elo: 1496,
    attackRating: 1.11,
    defenceRating: -0.84,
    recentFormPoints: 6,
    managerElo: 1528,
    stadium: "Elland Road",
    form: ["D", "D", "W", "D", "L"],
  },
  Liverpool: {
    name: "Liverpool",
    shortName: "LIV",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t14.png",
    primaryColor: "#C8102E",
    secondaryColor: "#00B2A9",
    manager: "Andoni Iraola",
    elo: 1629,
    attackRating: 1.49,
    defenceRating: -1.12,
    recentFormPoints: 8,
    managerElo: 1568,
    stadium: "Anfield",
    form: ["D", "W", "D", "W", "L"],
  },
  "Man City": {
    name: "Man City",
    shortName: "MCI",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t43.png",
    primaryColor: "#6CABDD",
    secondaryColor: "#1C2C5B",
    manager: "Enzo Maresca",
    elo: 1757,
    attackRating: 1.61,
    defenceRating: -1.33,
    recentFormPoints: 15,
    managerElo: 1618,
    stadium: "Etihad Stadium",
    form: ["W", "W", "W", "W", "W"],
  },
  "Man United": {
    name: "Man United",
    shortName: "MUN",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t1.png",
    primaryColor: "#DA291C",
    secondaryColor: "#FBE122",
    manager: "Ruben Amorim",
    elo: 1595,
    attackRating: 1.26,
    defenceRating: -0.99,
    recentFormPoints: 6,
    managerElo: 1578,
    stadium: "Old Trafford",
    form: ["W", "D", "L", "D", "D"],
  },
  Newcastle: {
    name: "Newcastle",
    shortName: "NEW",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t4.png",
    primaryColor: "#241F20",
    secondaryColor: "#41B6E6",
    manager: "Matthias Jaissle",
    elo: 1530,
    attackRating: 1.30,
    defenceRating: -0.91,
    recentFormPoints: 7,
    managerElo: 1542,
    stadium: "St. James' Park",
    form: ["W", "D", "L", "W", "L"],
  },
  "Nott'm Forest": {
    name: "Nott'm Forest",
    shortName: "NFO",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t17.png",
    primaryColor: "#DD0000",
    secondaryColor: "#FFFFFF",
    manager: "Oliver Glasner",
    elo: 1521,
    attackRating: 1.08,
    defenceRating: -0.93,
    recentFormPoints: 5,
    managerElo: 1500,
    stadium: "The City Ground",
    form: ["D", "D", "W", "L", "L"],
  },
  Sunderland: {
    name: "Sunderland",
    shortName: "SUN",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t56.png",
    primaryColor: "#EB172B",
    secondaryColor: "#000000",
    manager: "Regis Le Bris",
    elo: 1455,
    attackRating: 0.94,
    defenceRating: -0.96,
    recentFormPoints: 4,
    managerElo: 1488,
    stadium: "Stadium of Light",
    form: ["W", "D", "L", "L", "L"],
  },
  Tottenham: {
    name: "Tottenham",
    shortName: "TOT",
    crestUrl: "https://resources.premierleague.com/premierleague/badges/100/t6.png",
    primaryColor: "#132257",
    secondaryColor: "#FFFFFF",
    manager: "Thomas Frank",
    elo: 1467,
    attackRating: 1.26,
    defenceRating: -0.87,
    recentFormPoints: 3,
    managerElo: 1461,
    stadium: "Tottenham Hotspur Stadium",
    form: ["L", "D", "D", "L", "D"],
  },
};

export function getTeamMetadata(name: string): TeamMetadata {
  return (
    TEAMS_DATA[name] || {
      name,
      shortName: name.substring(0, 3).toUpperCase(),
      crestUrl: `https://resources.premierleague.com/premierleague/badges/100/t${name.length}.png`,
      primaryColor: "#3D195B",
      secondaryColor: "#E90052",
      manager: "Unknown",
      elo: 1500,
      attackRating: 1.0,
      defenceRating: -1.0,
      recentFormPoints: 5,
      managerElo: 1500,
      stadium: "Premier League Stadium",
      form: ["W", "D", "L", "W", "D"],
    }
  );
}

export function getTeamForm(name: string): ("W" | "D" | "L")[] {
  const meta = getTeamMetadata(name);
  return meta.form || ["W", "D", "L", "W", "D"];
}

export interface TeamMomentum {
  type: "positive" | "negative" | "steady";
  label: string;
  delta: number;
  recentFormPoints: number;
  wins: number;
  draws: number;
  losses: number;
  formHistory: ("W" | "D" | "L")[];
  title: string;
  description: string;
  badgeStyle: string;
}

/**
 * Calculates momentum trend based on simulated rank trajectory and recent form:
 * - Positive Momentum: delta > 0 (climbing trajectory) or recentFormPoints >= 10 (hot winning form)
 * - Negative Momentum: recentFormPoints <= 4 (cold/struggling form) or delta < 0 (slipping trajectory)
 * - Neutral / Steady: delta === 0 (consistent standing)
 */
export function getTeamMomentum(
  teamName: string,
  simulatedRank: number,
  currentRank?: number
): TeamMomentum {
  const meta = getTeamMetadata(teamName);
  const curRank = currentRank ?? simulatedRank;
  const delta = curRank - simulatedRank;
  const formPts = meta.recentFormPoints ?? 0;
  const form = meta.form || [];
  const wins = form.filter((f) => f === "W").length;
  const draws = form.filter((f) => f === "D").length;
  const losses = form.filter((f) => f === "L").length;

  // 1. Struggling Form (form <= 4 pts) -> Negative Momentum
  // Matches prompt: Teams on a downward trend / struggling form (e.g. Tottenham, Fulham, Bournemouth)
  if (formPts <= 4) {
    return {
      type: "negative",
      label: delta < 0 ? `${delta}` : "Cold",
      delta,
      recentFormPoints: formPts,
      wins,
      draws,
      losses,
      formHistory: form,
      title: "Negative Momentum",
      description: `Cold form: ${wins}W ${draws}D ${losses}L (${formPts} pts in last 5). GW6 #${curRank} → Proj #${simulatedRank}.`,
      badgeStyle: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
    };
  }

  // 2. High Winning Form (form >= 10 pts) -> Positive Momentum
  // Matches prompt: Teams on an upward trajectory / recent winning form (e.g. Man City, Brighton)
  if (formPts >= 10) {
    return {
      type: "positive",
      label: delta > 0 ? `+${delta}` : "Hot",
      delta,
      recentFormPoints: formPts,
      wins,
      draws,
      losses,
      formHistory: form,
      title: "Positive Momentum",
      description: `Winning streak: ${wins}W ${draws > 0 ? `${draws}D ` : ""}${losses > 0 ? `${losses}L ` : ""}(${formPts} pts in last 5). GW6 #${curRank} → Proj #${simulatedRank}.`,
      badgeStyle: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    };
  }

  // 3. Upward Trajectory (delta > 0) -> Positive Momentum
  // Matches prompt: Teams on an upward trajectory (e.g. Liverpool, Chelsea)
  if (delta > 0) {
    return {
      type: "positive",
      label: `+${delta}`,
      delta,
      recentFormPoints: formPts,
      wins,
      draws,
      losses,
      formHistory: form,
      title: `Trending Up: +${delta} spots`,
      description: `Ascending trajectory: GW6 #${curRank} → Proj #${simulatedRank} (${formPts} pts in last 5).`,
      badgeStyle: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    };
  }

  // 4. Downward Trajectory (delta < 0) -> Negative Momentum
  if (delta < 0) {
    return {
      type: "negative",
      label: `${delta}`,
      delta,
      recentFormPoints: formPts,
      wins,
      draws,
      losses,
      formHistory: form,
      title: `Trending Down: ${delta} spots`,
      description: `Projected slip: GW6 #${curRank} → Proj #${simulatedRank} (${formPts} pts in last 5).`,
      badgeStyle: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
    };
  }

  // 5. Neutral / Steady (delta === 0)
  return {
    type: "steady",
    label: "—",
    delta: 0,
    recentFormPoints: formPts,
    wins,
    draws,
    losses,
    formHistory: form,
    title: "Steady Trajectory",
    description: `Consistent performance: Holding rank #${simulatedRank} with ${formPts} pts in last 5 matches.`,
    badgeStyle: "text-slate-400 bg-slate-800/40 border border-white/10",
  };
}
