export interface TeamProjection {
  rank: number;
  team: string;
  champion_pct: number;
  top4_pct: number;
  relegation_pct: number;
  avg_points: number;
  avg_position: number;
  current_rank?: number;
  // Official Gameweek 6 Actual Standings Fields
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  gf?: number;
  ga?: number;
  gd?: number;
  points?: number;
  points_p10?: number;
  points_p50?: number;
  points_p90?: number;
  position_p10?: number;
  position_p50?: number;
  position_p90?: number;
}

export interface ActualStanding {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

/**
 * Official Gameweek 6 Standings (60 matches completed out of 380).
 * Extracted directly from actual_played in FINAL_project_with_simulation.pkl.
 */
export const GW6_ACTUAL_STANDINGS: Record<string, ActualStanding> = {
  "Man City": { rank: 1, team: "Man City", played: 6, wins: 6, draws: 0, losses: 0, gf: 16, ga: 5, gd: 11, points: 18 },
  "Arsenal": { rank: 2, team: "Arsenal", played: 6, wins: 5, draws: 0, losses: 1, gf: 10, ga: 5, gd: 5, points: 15 },
  "Brighton": { rank: 3, team: "Brighton", played: 6, wins: 4, draws: 1, losses: 1, gf: 18, ga: 5, gd: 13, points: 13 },
  "Brentford": { rank: 4, team: "Brentford", played: 6, wins: 2, draws: 4, losses: 0, gf: 12, ga: 6, gd: 6, points: 10 },
  "Everton": { rank: 5, team: "Everton", played: 6, wins: 2, draws: 4, losses: 0, gf: 8, ga: 5, gd: 3, points: 10 },
  "Chelsea": { rank: 6, team: "Chelsea", played: 6, wins: 3, draws: 1, losses: 2, gf: 15, ga: 13, gd: 2, points: 10 },
  "Leeds United": { rank: 7, team: "Leeds United", played: 6, wins: 2, draws: 3, losses: 1, gf: 8, ga: 5, gd: 3, points: 9 },
  "Hull City": { rank: 8, team: "Hull City", played: 6, wins: 2, draws: 3, losses: 1, gf: 8, ga: 6, gd: 2, points: 9 },
  "Liverpool": { rank: 9, team: "Liverpool", played: 6, wins: 2, draws: 3, losses: 1, gf: 7, ga: 7, gd: 0, points: 9 },
  "Ipswich Town": { rank: 10, team: "Ipswich Town", played: 6, wins: 3, draws: 0, losses: 3, gf: 9, ga: 12, gd: -3, points: 9 },
  "Newcastle": { rank: 11, team: "Newcastle", played: 6, wins: 2, draws: 2, losses: 2, gf: 10, ga: 13, gd: -3, points: 8 },
  "Crystal Palace": { rank: 12, team: "Crystal Palace", played: 6, wins: 2, draws: 1, losses: 3, gf: 9, ga: 12, gd: -3, points: 7 },
  "Man United": { rank: 13, team: "Man United", played: 6, wins: 1, draws: 3, losses: 2, gf: 9, ga: 9, gd: 0, points: 6 },
  "Coventry City": { rank: 14, team: "Coventry City", played: 6, wins: 2, draws: 0, losses: 4, gf: 5, ga: 11, gd: -6, points: 6 },
  "Nott'm Forest": { rank: 15, team: "Nott'm Forest", played: 6, wins: 1, draws: 2, losses: 3, gf: 5, ga: 8, gd: -3, points: 5 },
  "Aston Villa": { rank: 16, team: "Aston Villa", played: 6, wins: 1, draws: 2, losses: 3, gf: 6, ga: 11, gd: -5, points: 5 },
  "Sunderland": { rank: 17, team: "Sunderland", played: 6, wins: 1, draws: 1, losses: 4, gf: 6, ga: 12, gd: -6, points: 4 },
  "Bournemouth": { rank: 18, team: "Bournemouth", played: 6, wins: 0, draws: 3, losses: 3, gf: 7, ga: 13, gd: -6, points: 3 },
  "Tottenham": { rank: 19, team: "Tottenham", played: 6, wins: 0, draws: 3, losses: 3, gf: 3, ga: 9, gd: -6, points: 3 },
  "Fulham": { rank: 20, team: "Fulham", played: 6, wins: 0, draws: 2, losses: 4, gf: 6, ga: 10, gd: -4, points: 2 },
};

/**
 * Verified fallback season projection table from Gameweek 6 model simulation.
 * Ensures instant 0ms rendering and offline resiliency across Vercel and local environments.
 */
export const FALLBACK_TABLE_DATA: TeamProjection[] = [
  {
    rank: 1,
    team: "Man City",
    champion_pct: 78.21,
    top4_pct: 99.83,
    relegation_pct: 0.0,
    avg_points: 89.87,
    avg_position: 1.26,
    current_rank: 1,
    played: 6,
    wins: 6,
    draws: 0,
    losses: 0,
    gf: 16,
    ga: 5,
    gd: 11,
    points: 18,
    points_p10: 80.0,
    points_p50: 90.0,
    points_p90: 99.0,
    position_p10: 1.0,
    position_p50: 1.0,
    position_p90: 2.0,
  },
  {
    rank: 2,
    team: "Arsenal",
    champion_pct: 19.51,
    top4_pct: 97.22,
    relegation_pct: 0.0,
    avg_points: 80.84,
    avg_position: 2.13,
    current_rank: 2,
    played: 6,
    wins: 5,
    draws: 0,
    losses: 1,
    gf: 10,
    ga: 5,
    gd: 5,
    points: 15,
    points_p10: 70.0,
    points_p50: 81.0,
    points_p90: 91.0,
    position_p10: 1.0,
    position_p50: 2.0,
    position_p90: 3.0,
  },
  {
    rank: 3,
    team: "Liverpool",
    champion_pct: 1.6,
    top4_pct: 64.77,
    relegation_pct: 0.09,
    avg_points: 67.22,
    avg_position: 4.43,
    current_rank: 9,
    played: 6,
    wins: 2,
    draws: 3,
    losses: 1,
    gf: 7,
    ga: 7,
    gd: 0,
    points: 9,
    points_p10: 55.0,
    points_p50: 67.0,
    points_p90: 79.0,
    position_p10: 2.0,
    position_p50: 4.0,
    position_p90: 8.0,
  },
  {
    rank: 4,
    team: "Chelsea",
    champion_pct: 0.29,
    top4_pct: 36.47,
    relegation_pct: 0.58,
    avg_points: 60.81,
    avg_position: 6.23,
    current_rank: 6,
    played: 6,
    wins: 3,
    draws: 1,
    losses: 2,
    gf: 15,
    ga: 13,
    gd: 2,
    points: 10,
    points_p10: 49.0,
    points_p50: 61.0,
    points_p90: 72.0,
    position_p10: 3.0,
    position_p50: 5.0,
    position_p90: 11.0,
  },
  {
    rank: 5,
    team: "Brighton",
    champion_pct: 0.27,
    top4_pct: 34.62,
    relegation_pct: 0.51,
    avg_points: 60.26,
    avg_position: 6.27,
    current_rank: 3,
    played: 6,
    wins: 4,
    draws: 1,
    losses: 1,
    gf: 18,
    ga: 5,
    gd: 13,
    points: 13,
    points_p10: 49.0,
    points_p50: 61.0,
    points_p90: 71.0,
    position_p10: 3.0,
    position_p50: 5.0,
    position_p90: 11.0,
  },
  {
    rank: 6,
    team: "Man United",
    champion_pct: 0.06,
    top4_pct: 17.69,
    relegation_pct: 1.51,
    avg_points: 56.25,
    avg_position: 7.78,
    current_rank: 13,
    played: 6,
    wins: 1,
    draws: 3,
    losses: 2,
    gf: 9,
    ga: 9,
    gd: 0,
    points: 6,
    points_p10: 45.0,
    points_p50: 57.0,
    points_p90: 67.0,
    position_p10: 4.0,
    position_p50: 7.0,
    position_p90: 13.0,
  },
  {
    rank: 7,
    team: "Brentford",
    champion_pct: 0.02,
    top4_pct: 17.45,
    relegation_pct: 2.11,
    avg_points: 55.44,
    avg_position: 8.16,
    current_rank: 4,
    played: 6,
    wins: 2,
    draws: 4,
    losses: 0,
    gf: 12,
    ga: 6,
    gd: 6,
    points: 10,
    points_p10: 43.0,
    points_p50: 56.0,
    points_p90: 67.0,
    position_p10: 4.0,
    position_p50: 7.0,
    position_p90: 14.0,
  },
  {
    rank: 8,
    team: "Newcastle",
    champion_pct: 0.03,
    top4_pct: 9.54,
    relegation_pct: 5.76,
    avg_points: 51.79,
    avg_position: 9.85,
    current_rank: 11,
    played: 6,
    wins: 2,
    draws: 2,
    losses: 2,
    gf: 10,
    ga: 13,
    gd: -3,
    points: 8,
    points_p10: 40.0,
    points_p50: 52.0,
    points_p90: 64.0,
    position_p10: 5.0,
    position_p50: 9.0,
    position_p90: 16.0,
  },
  {
    rank: 9,
    team: "Aston Villa",
    champion_pct: 0.0,
    top4_pct: 5.8,
    relegation_pct: 8.23,
    avg_points: 49.74,
    avg_position: 10.71,
    current_rank: 16,
    played: 6,
    wins: 1,
    draws: 2,
    losses: 3,
    gf: 6,
    ga: 11,
    gd: -5,
    points: 5,
    points_p10: 38.0,
    points_p50: 50.0,
    points_p90: 61.0,
    position_p10: 5.0,
    position_p50: 10.0,
    position_p90: 17.0,
  },
  {
    rank: 10,
    team: "Everton",
    champion_pct: 0.01,
    top4_pct: 5.65,
    relegation_pct: 6.36,
    avg_points: 49.73,
    avg_position: 10.76,
    current_rank: 5,
    played: 6,
    wins: 2,
    draws: 4,
    losses: 0,
    gf: 8,
    ga: 5,
    gd: 3,
    points: 10,
    points_p10: 39.0,
    points_p50: 49.0,
    points_p90: 61.0,
    position_p10: 5.0,
    position_p50: 11.0,
    position_p90: 16.0,
  },
  {
    rank: 11,
    team: "Bournemouth",
    champion_pct: 0.0,
    top4_pct: 2.2,
    relegation_pct: 13.43,
    avg_points: 46.64,
    avg_position: 12.2,
    current_rank: 18,
    played: 6,
    wins: 0,
    draws: 3,
    losses: 3,
    gf: 7,
    ga: 13,
    gd: -6,
    points: 3,
    points_p10: 35.0,
    points_p50: 46.0,
    points_p90: 58.0,
    position_p10: 6.0,
    position_p50: 12.0,
    position_p90: 18.0,
  },
  {
    rank: 12,
    team: "Leeds United",
    champion_pct: 0.0,
    top4_pct: 2.28,
    relegation_pct: 11.32,
    avg_points: 46.28,
    avg_position: 12.38,
    current_rank: 7,
    played: 6,
    wins: 2,
    draws: 3,
    losses: 1,
    gf: 8,
    ga: 5,
    gd: 3,
    points: 9,
    points_p10: 36.0,
    points_p50: 46.0,
    points_p90: 57.0,
    position_p10: 7.0,
    position_p50: 12.0,
    position_p90: 18.0,
  },
  {
    rank: 13,
    team: "Hull City",
    champion_pct: 0.0,
    top4_pct: 1.02,
    relegation_pct: 13.14,
    avg_points: 45.02,
    avg_position: 12.94,
    current_rank: 8,
    played: 6,
    wins: 2,
    draws: 3,
    losses: 1,
    gf: 8,
    ga: 6,
    gd: 2,
    points: 9,
    points_p10: 36.0,
    points_p50: 45.0,
    points_p90: 55.0,
    position_p10: 8.0,
    position_p50: 13.0,
    position_p90: 18.0,
  },
  {
    rank: 14,
    team: "Crystal Palace",
    champion_pct: 0.0,
    top4_pct: 1.93,
    relegation_pct: 18.43,
    avg_points: 44.54,
    avg_position: 13.28,
    current_rank: 12,
    played: 6,
    wins: 2,
    draws: 1,
    losses: 3,
    gf: 9,
    ga: 12,
    gd: -3,
    points: 7,
    points_p10: 34.0,
    points_p50: 44.0,
    points_p90: 56.0,
    position_p10: 7.0,
    position_p50: 14.0,
    position_p90: 19.0,
  },
  {
    rank: 15,
    team: "Nott'm Forest",
    champion_pct: 0.0,
    top4_pct: 1.68,
    relegation_pct: 22.25,
    avg_points: 43.68,
    avg_position: 13.57,
    current_rank: 15,
    played: 6,
    wins: 1,
    draws: 2,
    losses: 3,
    gf: 5,
    ga: 8,
    gd: -3,
    points: 5,
    points_p10: 33.0,
    points_p50: 43.0,
    points_p90: 55.0,
    position_p10: 7.0,
    position_p50: 14.0,
    position_p90: 19.0,
  },
  {
    rank: 16,
    team: "Tottenham",
    champion_pct: 0.0,
    top4_pct: 0.91,
    relegation_pct: 28.03,
    avg_points: 42.2,
    avg_position: 14.26,
    current_rank: 19,
    played: 6,
    wins: 0,
    draws: 3,
    losses: 3,
    gf: 3,
    ga: 9,
    gd: -6,
    points: 3,
    points_p10: 31.0,
    points_p50: 42.0,
    points_p90: 53.0,
    position_p10: 8.0,
    position_p50: 15.0,
    position_p90: 19.0,
  },
  {
    rank: 17,
    team: "Ipswich Town",
    champion_pct: 0.0,
    top4_pct: 0.17,
    relegation_pct: 36.48,
    avg_points: 39.78,
    avg_position: 15.73,
    current_rank: 10,
    played: 6,
    wins: 3,
    draws: 0,
    losses: 3,
    gf: 9,
    ga: 12,
    gd: -3,
    points: 9,
    points_p10: 31.0,
    points_p50: 39.0,
    points_p90: 49.0,
    position_p10: 11.0,
    position_p50: 16.0,
    position_p90: 20.0,
  },
  {
    rank: 18,
    team: "Sunderland",
    champion_pct: 0.0,
    top4_pct: 0.3,
    relegation_pct: 37.81,
    avg_points: 39.45,
    avg_position: 15.63,
    current_rank: 17,
    played: 6,
    wins: 1,
    draws: 1,
    losses: 4,
    gf: 6,
    ga: 12,
    gd: -6,
    points: 4,
    points_p10: 30.0,
    points_p50: 39.0,
    points_p90: 49.0,
    position_p10: 10.0,
    position_p50: 16.0,
    position_p90: 20.0,
  },
  {
    rank: 19,
    team: "Fulham",
    champion_pct: 0.0,
    top4_pct: 0.38,
    relegation_pct: 41.26,
    avg_points: 39.05,
    avg_position: 15.63,
    current_rank: 20,
    played: 6,
    wins: 0,
    draws: 2,
    losses: 4,
    gf: 6,
    ga: 10,
    gd: -4,
    points: 2,
    points_p10: 29.0,
    points_p50: 38.0,
    points_p90: 51.0,
    position_p10: 10.0,
    position_p50: 17.0,
    position_p90: 20.0,
  },
  {
    rank: 20,
    team: "Coventry City",
    champion_pct: 0.0,
    top4_pct: 0.09,
    relegation_pct: 52.7,
    avg_points: 37.12,
    avg_position: 16.78,
    current_rank: 14,
    played: 6,
    wins: 2,
    draws: 0,
    losses: 4,
    gf: 5,
    ga: 11,
    gd: -6,
    points: 6,
    points_p10: 28.0,
    points_p50: 37.0,
    points_p90: 47.0,
    position_p10: 12.0,
    position_p50: 18.0,
    position_p90: 20.0,
  },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let cachedTable: TeamProjection[] | null = FALLBACK_TABLE_DATA;
let cachedTableTimestamp = Date.now();
let inflightTablePromise: Promise<TeamProjection[]> | null = null;

// 1 hour cache TTL for league season simulation data
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Returns currently cached season projection table data if valid, or null.
 * Enables 0ms instant initial rendering when switching between tabs.
 */
export function getCachedTableData(): TeamProjection[] | null {
  if (
    cachedTable &&
    Date.now() - cachedTableTimestamp < CACHE_TTL_MS &&
    cachedTable.length > 0
  ) {
    return cachedTable;
  }
  return FALLBACK_TABLE_DATA;
}

/**
 * Fetches the simulation table with Next.js revalidation cache and in-memory memoization.
 * Deduplicates in-flight requests and provides instant 0ms access once loaded.
 */
export async function fetchTablePredictions(): Promise<TeamProjection[]> {
  const current = getCachedTableData();
  if (current && current !== FALLBACK_TABLE_DATA) {
    return current;
  }

  if (inflightTablePromise) {
    return inflightTablePromise;
  }

  inflightTablePromise = fetch(
    `${API_BASE_URL}/predictions/table?include_bands=true`,
    {
      next: { revalidate: 3600 },
    } as RequestInit
  )
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      const rawTable: TeamProjection[] = json.table || [];
      if (rawTable.length > 0) {
        // Enrich rows with official actual standings data
        const enriched = rawTable.map((row) => {
          const actual = GW6_ACTUAL_STANDINGS[row.team];
          return {
            ...row,
            played: actual?.played ?? 6,
            wins: actual?.wins,
            draws: actual?.draws,
            losses: actual?.losses,
            gf: actual?.gf,
            ga: actual?.ga,
            gd: actual?.gd,
            points: actual?.points,
            current_rank: row.current_rank ?? actual?.rank,
          };
        });
        cachedTable = enriched;
        cachedTableTimestamp = Date.now();
        inflightTablePromise = null;
        return enriched;
      }
      inflightTablePromise = null;
      return FALLBACK_TABLE_DATA;
    })
    .catch((err) => {
      inflightTablePromise = null;
      // If a previous cache or verified fallback exists despite error, fall back to it gracefully
      if (cachedTable && cachedTable.length > 0) {
        return cachedTable;
      }
      return FALLBACK_TABLE_DATA;
    });

  return inflightTablePromise;
}
