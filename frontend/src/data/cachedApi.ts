export interface TeamProjection {
  rank: number;
  team: string;
  champion_pct: number;
  top4_pct: number;
  relegation_pct: number;
  avg_points: number;
  avg_position: number;
  current_rank?: number;
  points_p10?: number;
  points_p50?: number;
  points_p90?: number;
  position_p10?: number;
  position_p50?: number;
  position_p90?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let cachedTable: TeamProjection[] | null = null;
let cachedTableTimestamp = 0;
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
  return null;
}

/**
 * Fetches the simulation table with Next.js revalidation cache and in-memory memoization.
 * Deduplicates in-flight requests and provides instant 0ms access once loaded.
 */
export async function fetchTablePredictions(): Promise<TeamProjection[]> {
  const current = getCachedTableData();
  if (current) {
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
      const table: TeamProjection[] = json.table || [];
      if (table.length > 0) {
        cachedTable = table;
        cachedTableTimestamp = Date.now();
      }
      inflightTablePromise = null;
      return table;
    })
    .catch((err) => {
      inflightTablePromise = null;
      // If a previous cache exists despite error, fall back to it gracefully
      if (cachedTable && cachedTable.length > 0) {
        return cachedTable;
      }
      throw err;
    });

  return inflightTablePromise;
}
