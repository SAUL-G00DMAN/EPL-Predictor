"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  ExternalLink,
  RotateCcw,
  Search,
  X,
  Minus,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { PremierLeagueLion } from "@/components/PremierLeagueLion";
import { getTeamMomentum } from "@/data/teams";
import {
  TeamProjection,
  fetchTablePredictions,
  getCachedTableData,
} from "@/data/cachedApi";
import {
  initAudio,
  playMechanicalClick,
  playSimulationCrunch,
  playOdometerTick,
  playLockInSound,
  playExploreUnlock,
  soundFx,
  isAudioMuted,
  toggleAudioMuted,
} from "@/lib/soundFx";

type SortField =
  | "rank"
  | "team"
  | "champion_pct"
  | "top4_pct"
  | "relegation_pct"
  | "avg_points";
type SortDirection = "asc" | "desc";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const CRUNCH_LOGS = [
  "Simulating remaining 320 fixtures across 20 clubs...",
  "Crunching Dixon-Coles goal expectation matrices (xG)...",
  "Updating Home Advantage & Manager Elo ratings...",
  "Running 10,000 Monte Carlo season permutations...",
  "Computing title, UCL Top 4, and relegation distributions...",
  "Telemetry verified: 10,000/10,000 seasons simulated successfully!",
];

interface CrunchTelemetryProps {
  crunchCount: number;
  crunchLogIndex: number;
}

const CrunchTelemetryView = React.memo(function CrunchTelemetryView({
  crunchCount,
  crunchLogIndex,
}: CrunchTelemetryProps) {
  return (
    <div className="py-2 space-y-3">
      {/* Big Live Monospace Odometer with Tabular Figures */}
      <div className="flex items-baseline justify-center gap-2 font-mono tabular-nums">
        <span className="text-4xl sm:text-5xl font-mono font-black tabular-nums tracking-wider text-[#00FF87] light:text-[#047857]">
          {crunchCount.toLocaleString()}
        </span>
        <span className="text-slate-400 light:text-slate-600 font-mono text-sm sm:text-base font-bold tabular-nums">
          / 10,000 SIMS
        </span>
      </div>

      {/* Clean Architectural Linear Progress Bar (GPU-Accelerated scaleX) */}
      <div className="w-full bg-slate-800/80 light:bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="w-full h-full bg-[#00FF87] light:bg-[#047857] rounded-full transition-transform duration-75 ease-out"
          style={{
            transform: `scaleX(${Math.min(1, crunchCount / 10000)})`,
            transformOrigin: "left",
            willChange: "transform",
          }}
        />
      </div>

      {/* Terminal Log Ticker */}
      <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300 light:text-slate-700 bg-[#090A0C] light:bg-slate-100 py-2 px-3 rounded-xl border border-white/[0.07] light:border-slate-200">
        {crunchCount >= 10000 ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87] light:text-[#047857] shrink-0" />
        ) : (
          <Cpu className="w-3.5 h-3.5 text-[#00FF87] light:text-[#047857] animate-pulse shrink-0" />
        )}
        <span className="truncate">{CRUNCH_LOGS[crunchLogIndex]}</span>
      </div>
    </div>
  );
});

const formatCellOdds = (pct: number) => {
  if (!pct || pct <= 0.05) return "-";
  const odds = 100 / pct;
  return odds >= 1000 ? "999.00" : odds.toFixed(2);
};

const getZoneBorderClass = (rank: number) => {
  if (rank <= 4) return "border-l-[3px] border-l-[#00FF87] light:border-l-[#047857]";
  if (rank === 5) return "border-l-[3px] border-l-sky-500 light:border-l-sky-600";
  if (rank >= 18) return "border-l-4 border-l-[#E90052]";
  return "border-l-[3px] border-l-transparent";
};

const getBarColor = (type: "champ" | "top4" | "releg", val: number) => {
  if (type === "champ") {
    if (val > 40) return "bg-gradient-to-r from-[#00FF85] to-[#38BDF8] light:bg-none light:bg-[#047857]";
    if (val > 10) return "bg-gradient-to-r from-[#38BDF8] to-[#3D195B] light:bg-none light:bg-[#047857]";
    return "bg-[#3D195B] light:bg-none light:bg-[#047857]";
  }
  if (type === "top4") {
    if (val > 60) return "bg-gradient-to-r from-[#00FF85] to-[#38BDF8] light:from-[#047857] light:to-[#0284C7]";
    if (val > 20) return "bg-gradient-to-r from-[#3D195B] to-[#38BDF8] light:from-[#38003C] light:to-[#0284C7]";
    return "bg-slate-700 light:bg-slate-300";
  }
  // relegation
  if (val > 50) return "bg-gradient-to-r from-[#E90052] to-red-600 light:from-[#E90052] light:to-rose-600";
  if (val > 15) return "bg-[#E90052]/70 light:bg-[#E90052]";
  return "bg-slate-800 light:bg-slate-300";
};

export default function HomePage() {
  const [data, setData] = useState<TeamProjection[]>(() => getCachedTableData() || []);
  const [loading, setLoading] = useState<boolean>(() => !getCachedTableData());
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"percentage" | "odds">("percentage");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulation Launchpad & Cinematic Reveal State Machine
  // 'idle' -> 'crunching' -> 'podium_ready' -> 'revealed'
  type SimulationPhase = "idle" | "crunching" | "podium_ready" | "revealed";

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [phase, setPhase] = useState<SimulationPhase>("idle"); // strictly default to 'idle' to eliminate table flash
  const [simulationsRun, setSimulationsRun] = useState<boolean>(false);
  const [crunchCount, setCrunchCount] = useState<number>(0);
  const [crunchLogIndex, setCrunchLogIndex] = useState<number>(0);
  const [revealing, setRevealing] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const animFrameRef = React.useRef<number | null>(null);
  const logIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setIsMuted(isAudioMuted());
    try {
      const hasCompleted = localStorage.getItem("epl_simulations_completed");
      if (hasCompleted === "true") {
        setPhase("revealed");
        setSimulationsRun(true);
        document.documentElement.classList.add("epl-sims-completed");
      } else {
        setPhase("idle");
        setSimulationsRun(false);
        document.documentElement.classList.remove("epl-sims-completed");
      }
    } catch {
      // Graceful fallback if storage restricted
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, []);

  const handleStartSimulation = useCallback(() => {
    // 1. Fail-safe audio: never blocks or aborts the simulation state machine
    try {
      initAudio().catch(() => {});
      soundFx.playSimulationCrunch();
      playMechanicalClick();
    } catch {
      // Silent fallback
    }

    // 2. Immediately switch to crunching state and reset counter
    setPhase("crunching");
    setSimulationsRun(false);
    setCrunchCount(0);
    setCrunchLogIndex(0);

    const duration = 3000; // strictly 3000ms
    const startTime = performance.now();
    let lastUpdateTime = 0;

    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    logIntervalRef.current = setInterval(() => {
      setCrunchLogIndex((prev) =>
        prev < CRUNCH_LOGS.length - 2 ? prev + 1 : prev
      );
    }, 450);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Decelerating cubic easing curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentSims = Math.min(10000, Math.floor(easedProgress * 10000));

      // Throttle React state updates and audio ticks to ~70ms intervals (prevents 60 full-page re-renders/sec)
      if (currentTime - lastUpdateTime >= 70 || progress >= 1) {
        lastUpdateTime = currentTime;
        setCrunchCount(currentSims);

        if (progress < 1) {
          try {
            playOdometerTick(progress);
          } catch {}
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setCrunchCount(10000);
        setCrunchLogIndex(CRUNCH_LOGS.length - 1);

        try {
          playLockInSound();
        } catch {}

        // Complete 3-second simulation and transition to revealed
        setPhase("revealed");
        setSimulationsRun(true);

        try {
          localStorage.setItem("epl_simulations_completed", "true");
          document.documentElement.classList.add("epl-sims-completed");
        } catch {}

        // Smoothly scroll to the standings table and insights
        setTimeout(() => {
          const tableElem = document.getElementById("simulated-table");
          if (tableElem) {
            tableElem.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const handleRevealFullTable = useCallback(async () => {
    try {
      localStorage.setItem("epl_simulations_completed", "true");
      document.documentElement.classList.add("epl-sims-completed");
    } catch {}

    try {
      await initAudio();
      playExploreUnlock();
    } catch {}

    setRevealing(true);

    setTimeout(() => {
      setPhase("revealed");
      setSimulationsRun(true);
      setRevealing(false);
    }, 400);
  }, []);

  const handleRerunSimulation = useCallback(() => {
    try {
      localStorage.removeItem("epl_simulations_completed");
      document.documentElement.classList.remove("epl-sims-completed");
    } catch {
      // Ignore
    }
    setSimulationsRun(false);
    setPhase("idle");
    setCrunchCount(0);
    setCrunchLogIndex(0);
    setRevealing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleToggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = toggleAudioMuted();
    setIsMuted(next);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevField;
      } else {
        setSortDir(field === "team" || field === "rank" ? "asc" : "desc");
        return field;
      }
    });
  }, []);

  const handleToggleTeam = useCallback((team: string) => {
    setExpandedTeam((prev) => (prev === team ? null : team));
  }, []);

  useEffect(() => {
    fetchTablePredictions()
      .then((table) => {
        setData(table);
        setLoading(false);
      })
      .catch(() => {
        setError(`Failed to fetch predictions table from ${API_BASE_URL}`);
        setLoading(false);
      });
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") {
        const cmp = (aVal as string).localeCompare(bVal as string);
        return sortDir === "asc" ? cmp : -cmp;
      }

      aVal = aVal as number;
      bVal = bVal as number;
      if (aVal !== bVal) {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      // Stable tie-breaker: maintain projected rank order
      return a.rank - b.rank;
    });
  }, [data, sortField, sortDir]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sortedData;
    const q = searchQuery.toLowerCase().trim();
    return sortedData.filter((row) => row.team.toLowerCase().includes(q));
  }, [sortedData, searchQuery]);

  // Mini-podium: Top 3 title favorites
  const top3TitleTeams = useMemo(() => {
    if (!data || data.length < 3) {
      return [
        { team: "Man City", champion_pct: 78.21 },
        { team: "Arsenal", champion_pct: 19.51 },
        { team: "Liverpool", champion_pct: 1.6 },
      ];
    }
    return [...data]
      .sort((a, b) => b.champion_pct - a.champion_pct)
      .slice(0, 3);
  }, [data]);

  return (
    <>
      <div
        className={`min-h-screen py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 transition-all duration-500 ease-out ${
          !simulationsRun && phase !== "revealed"
            ? "filter blur-md pointer-events-none select-none opacity-40"
            : "filter-none opacity-100"
        }`}
      >
        {(simulationsRun || phase === "revealed") && (
          <>
            {/* Re-run Simulation Action Button (Top Right) */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleRerunSimulation}
                type="button"
                className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white light:text-slate-700 light:hover:text-[#19001B] bg-[#1C2230] hover:bg-[#232B3D] light:bg-white light:hover:bg-slate-50 border border-[#38435E] hover:border-[#00FF87]/50 light:border-slate-200 light:hover:border-slate-300 shadow-[0_2.5px_0_0_#0F131C,0_3px_0_1px_#38435E,inset_0_1px_0_0_rgba(255,255,255,0.15)] light:shadow-[0_2.5px_0_0_#CBD5E1,0_3px_0_1px_#E2E8F0,inset_0_1px_0_0_rgba(255,255,255,0.9)] active:translate-y-[1px] active:shadow-[0_1px_0_0_#0F131C] light:active:shadow-[0_1px_0_0_#CBD5E1] transition-all cursor-pointer select-none -translate-y-[1px]"
                title="Replay the 10,000 Monte Carlo season simulation"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#00FF87] light:text-[#047857] group-hover:-rotate-180 transition-transform duration-500" />
                <span dir="rtl">إعادة محاكاة 10,000 موسم ↻</span>
              </button>
            </div>

            {/* Editorial Feature: Full-Width Analyst's Take */}
            <section
              className={`epl-editorial-card bg-[#111317] light:bg-white border border-white/[0.07] light:border-slate-200 border-r-[3px] border-r-[#7B1FA2] light:border-r-[#38003C] rounded-xl p-4 sm:p-5 shadow-xl light:shadow-[0_4px_20px_-2px_rgba(56,0,60,0.05)] relative overflow-hidden ${
                simulationsRun || phase === "revealed"
                  ? "animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both opacity-100"
                  : "opacity-40"
              }`}
            >
              {/* Full-Width Editorial Analysis (dir="rtl") */}
              <div dir="rtl" className="w-full text-right space-y-2.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/10 light:border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#00FF87] light:bg-[#047857] shrink-0" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold text-white light:text-[#38003C] light:bg-[#38003C]/10">
                    رؤية المحلل • قراءة تكتيكية بعد ختام الجولة 6
                  </span>
                </div>
                <p className="text-slate-100 light:text-[#475569] text-sm sm:text-base leading-relaxed font-sans font-medium">
                  مانشستر سيتي يعزز صدارته للترشيحات بنسبة{" "}
                  <span dir="ltr" className="text-[#00FF87] light:text-[#047857] font-bold">
                    78.2%
                  </span>{" "}
                  لحسم اللقب بعد ختام الجولة 6 بالعلامة الكاملة (18 نقطة)، بينما يحتفظ{" "}
                  <span dir="ltr" className="text-white light:text-[#19001B] font-semibold">
                    Arsenal
                  </span>{" "}
                  بنسبة{" "}
                  <span dir="ltr" className="text-slate-200 light:text-[#19001B] font-bold">
                    19.5%
                  </span>{" "}
                  كأقرب الملاحقين وفق محاكاة{" "}
                  <span dir="ltr" className="text-slate-300 light:text-slate-600 font-mono text-xs">
                    Monte Carlo
                  </span>
                  ، مع اشتعال صراع المربع الذهبي بين برايتون، تشيلسي، وبرينتفورد واحتدام المنافسة في قاع الترتيب لتفادي الهبوط.
                </p>
              </div>
            </section>

      {/* Main Projections Table */}
      <section
        id="simulated-table"
        className={`bg-[#111317] light:bg-white rounded-xl overflow-hidden border border-white/[0.07] light:border-slate-200 shadow-2xl light:shadow-[0_4px_20px_-2px_rgba(56,0,60,0.05)] scroll-mt-24 ${
          simulationsRun || phase === "revealed"
            ? "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both opacity-100"
            : "opacity-40"
        }`}
      >
        <div className="p-6 border-b border-white/10 light:border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white light:text-[#19001B] flex items-center gap-2.5">
              <span>Full 20-Team Probability Projections</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 light:bg-slate-100 text-slate-300 light:text-slate-600 font-normal">
                Click any row for confidence bands
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Feature 2: Club Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 light:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your club..."
                className="w-full min-h-[44px] sm:min-h-0 bg-white/5 hover:bg-white/10 focus:bg-[#12121C] light:bg-slate-50 light:hover:bg-slate-100 light:focus:bg-white border border-white/10 focus:border-[#38BDF8] light:border-slate-200 light:focus:border-[#38003C] rounded-xl pl-8.5 pr-7 py-2 sm:py-1.5 text-xs text-white light:text-[#19001B] placeholder-slate-400 light:placeholder-slate-400 focus:outline-none transition-all flex items-center"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-900 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Switch: % Probabilities vs Decimal Odds */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDisplayMode("percentage")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  displayMode === "percentage"
                    ? "bg-gradient-to-r from-[#3D195B] to-[#E90052] text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white light:text-slate-600 light:hover:text-[#19001B]"
                }`}
              >
                % Probabilities
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("odds")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  displayMode === "odds"
                    ? "bg-gradient-to-r from-[#00FF85] to-[#38BDF8] light:from-[#047857] light:to-sky-700 text-black light:text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white light:text-slate-600 light:hover:text-[#19001B]"
                }`}
              >
                Decimal Odds
              </button>
            </div>

            <div className="text-xs text-slate-400 light:text-slate-600 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF85] light:bg-[#047857]"></span>
                <span className="hidden sm:inline">Title</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] light:bg-sky-500"></span>
                <span className="hidden sm:inline">Top 4</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E90052]"></span>
                <span className="hidden sm:inline">Relegation</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] light:bg-slate-100/60 border border-white/5 light:border-slate-200 animate-pulse gap-4"
              >
                <div className="flex items-center gap-3 w-52 shrink-0">
                  <div className="w-6 h-4 bg-white/10 light:bg-slate-200 rounded font-mono text-xs"></div>
                  <div className="w-7 h-7 rounded-full bg-white/10 light:bg-slate-200 shrink-0"></div>
                  <div className="w-28 h-4 bg-white/10 light:bg-slate-200 rounded"></div>
                </div>
                <div className="hidden sm:block flex-1 max-w-[140px] space-y-1">
                  <div className="w-12 h-3 bg-white/10 light:bg-slate-200 rounded ml-auto"></div>
                  <div className="w-full h-1.5 bg-white/5 light:bg-slate-200 rounded-full"></div>
                </div>
                <div className="hidden md:block flex-1 max-w-[140px] space-y-1">
                  <div className="w-12 h-3 bg-white/10 light:bg-slate-200 rounded ml-auto"></div>
                  <div className="w-full h-1.5 bg-white/5 light:bg-slate-200 rounded-full"></div>
                </div>
                <div className="hidden lg:block flex-1 max-w-[140px] space-y-1">
                  <div className="w-12 h-3 bg-white/10 light:bg-slate-200 rounded ml-auto"></div>
                  <div className="w-full h-1.5 bg-white/5 light:bg-slate-200 rounded-full"></div>
                </div>
                <div className="w-12 h-4 bg-white/10 light:bg-slate-200 rounded shrink-0"></div>
                <div className="w-20 h-6 bg-white/10 light:bg-slate-200 rounded-full shrink-0"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 light:text-rose-600">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-slate-500 light:text-slate-600 mt-2">
              Ensure FastAPI is running on http://127.0.0.1:8000
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile Swipe Prompt Banner */}
            <div className="sm:hidden px-3.5 py-2 border-b border-white/[0.07] light:border-slate-200 bg-[#0E1013] light:bg-slate-50 flex items-center justify-between text-[11px] text-slate-400 light:text-slate-600 font-mono">
              <span className="flex items-center gap-1.5">
                <span>👈</span> اسحب الجدول أفقياً لعرض كامل الإحصائيات
              </span>
              <span className="text-[10px] uppercase font-bold text-[#00FF87] light:text-[#047857]">
                Swipe ➔
              </span>
            </div>

            <div
              className="overflow-x-auto w-full touch-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="w-full text-left text-sm border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.07] light:border-slate-200 text-[11px] uppercase tracking-wider text-slate-300 light:text-slate-600 bg-[#111317] light:bg-slate-50 font-bold select-none">
                    {/* Sticky Rank Header */}
                    <th
                      className="py-3.5 px-2 sm:px-3 cursor-pointer hover:text-white light:hover:text-slate-900 sticky left-0 z-30 bg-[#111317] light:bg-slate-50 w-16 sm:w-20 select-none"
                      onClick={() => handleSort("rank")}
                      title="Rank & Momentum Trajectory (Simulated vs Official GW6)"
                    >
                      <div className="flex items-center gap-1 text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900">
                        # <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>

                    {/* Sticky Team Header */}
                    <th
                      className="py-3.5 px-3 sm:px-4 cursor-pointer hover:text-white light:hover:text-slate-900 sticky left-16 sm:left-20 z-30 bg-[#111317] light:bg-slate-50 border-r border-white/[0.07] light:border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.5)] light:shadow-[4px_0_12px_rgba(0,0,0,0.06)] min-w-[150px] sm:min-w-[200px] select-none"
                      onClick={() => handleSort("team")}
                    >
                    <div className="flex items-center gap-1 text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900">
                      Team <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white light:hover:text-slate-900"
                    onClick={() => handleSort("champion_pct")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900">
                      {displayMode === "odds" ? "Champion Odds" : "Champion %"}{" "}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white light:hover:text-slate-900"
                    onClick={() => handleSort("top4_pct")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900">
                      {displayMode === "odds" ? "Top 4 Odds" : "Top 4 %"}{" "}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white light:hover:text-slate-900"
                    onClick={() => handleSort("relegation_pct")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900">
                      {displayMode === "odds" ? "Relegation Odds" : "Relegation %"}{" "}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white light:hover:text-slate-900 text-right"
                    onClick={() => handleSort("avg_points")}
                  >
                    <div className="flex items-center justify-end gap-1 text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900">
                      Avg Pts <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 group relative text-slate-300 light:text-slate-600">
                      <span>Range Band</span>
                      <Info className="w-3 h-3 text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 rounded-lg bg-[#1E1E34] light:bg-white light:text-slate-700 light:border-slate-200 border border-white/20 text-[10px] text-slate-200 shadow-xl z-30 font-normal pointer-events-none normal-case tracking-normal text-center">
                        10th-to-90th percentile finish range across 10,000 simulations.
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 light:divide-slate-100 font-medium">
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 px-4 text-center text-slate-400 light:text-slate-500 space-y-2 bg-[#111317] light:bg-white"
                    >
                      <p className="text-sm font-semibold text-slate-300 light:text-slate-700">
                        No clubs found matching &ldquo;{searchQuery}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-[#00FF87] light:text-[#047857] hover:underline font-medium cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    </td>
                  </tr>
                )}

                {filteredData.map((row, index) => {
                  const isExpanded = expandedTeam === row.team;
                  const isSearchMatch =
                    searchQuery.trim().length > 0 &&
                    row.team
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase().trim());
                  const isRelegation = row.rank >= 18;

                  const stickyBg = isExpanded
                    ? "bg-[#16181D] light:bg-slate-100"
                    : isSearchMatch
                    ? "bg-[#1A222D] light:bg-emerald-100"
                    : isRelegation
                    ? "bg-[#1E1216] light:bg-[#FFF1F2]"
                    : "bg-[#111317] light:bg-white";

                  const stickyHoverBg = isRelegation
                    ? "group-hover:bg-[#281520] light:group-hover:bg-[#FFE4E6]"
                    : "group-hover:bg-[#181B22] light:group-hover:bg-slate-100";

                  return (
                    <React.Fragment key={row.team}>
                      <tr
                        onClick={() => handleToggleTeam(row.team)}
                        style={{
                          animationDelay: `${index * 30}ms`,
                        }}
                        className={`transition-colors cursor-pointer group border-b border-white/[0.04] light:border-b light:border-slate-100 ${
                          simulationsRun ? "animate-row-cascade" : ""
                        } ${
                          isExpanded
                            ? "bg-white/[0.04] light:bg-slate-50/90"
                            : isSearchMatch
                            ? "bg-[#00FF87]/[0.08] light:bg-emerald-50/60 ring-1 ring-[#00FF87]/40 light:ring-emerald-400/50"
                            : isRelegation
                            ? "bg-rose-950/20 hover:bg-rose-900/30 light:bg-rose-50/70 light:hover:bg-rose-100/80"
                            : "hover:bg-white/[0.04] light:hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Sticky Rank + Momentum & Trajectory Indicator */}
                        <td
                          className={`py-3.5 px-2 sm:px-3 font-mono font-bold sticky left-0 z-20 ${stickyBg} ${getZoneBorderClass(
                            row.rank
                          )} ${stickyHoverBg} transition-colors w-16 sm:w-20`}
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <span className="text-slate-200 light:text-slate-800 text-xs sm:text-sm font-black w-3.5 sm:w-4 text-right shrink-0">
                              {row.rank}
                            </span>
                            {(() => {
                              const momentum = getTeamMomentum(
                                row.team,
                                row.rank,
                                row.current_rank
                              );

                              return (
                                <span
                                  className="group/delta relative inline-block cursor-help shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                  title={`${momentum.title}: ${momentum.description}`}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center gap-0.5 text-[9px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.5 rounded-md border transition-transform group-hover/delta:scale-105 shadow-xs ${momentum.badgeStyle}`}
                                  >
                                    {momentum.type === "positive" && (
                                      <ChevronUp className="w-3 h-3 stroke-[3] text-emerald-400 light:text-emerald-800 shrink-0" />
                                    )}
                                    {momentum.type === "negative" && (
                                      <ChevronDown className="w-3 h-3 stroke-[3] text-rose-400 light:text-rose-800 shrink-0" />
                                    )}
                                    {momentum.type === "steady" && (
                                      <Minus className="w-2.5 h-2.5 stroke-[3] text-slate-400 light:text-slate-600 shrink-0" />
                                    )}
                                    <span>{momentum.label}</span>
                                  </span>

                                  {/* Sleek Rich Tooltip */}
                                  <span className="absolute bottom-full left-0 mb-2 hidden group-hover/delta:block w-56 sm:w-64 p-3 rounded-xl bg-[#121222]/95 light:bg-white light:border-slate-200 border border-white/20 text-[10px] sm:text-[11px] font-sans font-normal text-slate-200 light:text-slate-700 shadow-2xl z-50 pointer-events-none normal-case tracking-normal text-left whitespace-normal backdrop-blur-md">
                                    <div className="flex items-center justify-between gap-1.5 border-b border-white/10 light:border-slate-200 pb-1.5 mb-1.5">
                                      <span className="font-extrabold text-white light:text-slate-900 text-xs flex items-center gap-1">
                                        {momentum.type === "positive" && (
                                          <span className="text-emerald-400">🟢</span>
                                        )}
                                        {momentum.type === "negative" && (
                                          <span className="text-rose-400">🔴</span>
                                        )}
                                        {momentum.type === "steady" && (
                                          <span className="text-slate-400">⚪</span>
                                        )}
                                        {momentum.title}
                                      </span>
                                      <span
                                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${momentum.badgeStyle}`}
                                      >
                                        {momentum.label}
                                      </span>
                                    </div>

                                    <p className="text-slate-300 light:text-slate-600 leading-relaxed mb-2">
                                      {momentum.description}
                                    </p>

                                    {/* 5-Match Form sequence */}
                                    <div className="flex items-center justify-between pt-1.5 border-t border-white/10 light:border-slate-200 text-[9px]">
                                      <span className="text-slate-400 light:text-slate-500 font-medium">Recent 5 Form:</span>
                                      <div className="flex items-center gap-1 font-mono font-bold">
                                        {momentum.formHistory.map((res, i) => (
                                          <span
                                            key={i}
                                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-black text-white ${
                                              res === "W"
                                                ? "bg-emerald-500"
                                                : res === "D"
                                                ? "bg-amber-500 text-black"
                                                : "bg-rose-500"
                                            }`}
                                          >
                                            {res}
                                          </span>
                                        ))}
                                        <span className="text-slate-400 light:text-slate-500 ml-1">
                                          ({momentum.recentFormPoints} pts)
                                        </span>
                                      </div>
                                    </div>
                                  </span>
                                </span>
                              );
                            })()}
                          </div>
                        </td>

                        {/* Sticky Team name + crest */}
                        <td
                          className={`py-3.5 px-3 sm:px-4 font-bold text-white light:text-[#19001B] sticky left-16 sm:left-20 z-20 ${stickyBg} ${stickyHoverBg} transition-colors border-r border-white/[0.07] light:border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.5)] light:shadow-[4px_0_12px_rgba(0,0,0,0.04)] min-w-[150px] sm:min-w-[200px]`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <TeamCrest team={row.team} size={30} />
                            <Link
                              href={`/teams/${encodeURIComponent(row.team)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-[#00FF87] light:hover:text-[#047857] text-white light:text-[#19001B] transition-colors flex items-center gap-1.5 group/link truncate font-bold"
                            >
                              <span className="truncate">{row.team}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 light:text-slate-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                          </div>
                        </td>

                        {/* Champion % / Odds */}
                        <td className="py-3.5 px-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              {displayMode === "odds" ? (
                                <span
                                  className={
                                    row.champion_pct > 0.05
                                      ? "font-bold text-[#00FF85] light:text-[#047857]"
                                      : "text-slate-500 light:text-slate-500 font-mono"
                                  }
                                >
                                  {formatCellOdds(row.champion_pct)}
                                </span>
                              ) : (
                                <AnimatedNumber
                                  value={simulationsRun ? row.champion_pct : 0}
                                  decimals={1}
                                  suffix="%"
                                  className={
                                    row.champion_pct > 0.05
                                      ? "font-bold text-[#00FF85] light:text-[#047857]"
                                      : "text-slate-500 light:text-slate-500 font-mono"
                                  }
                                />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 light:bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-[800ms] ease-out ${getBarColor(
                                  "champ",
                                  row.champion_pct
                                )}`}
                                style={{
                                  width: `${
                                    simulationsRun
                                      ? Math.max(
                                          row.champion_pct,
                                          row.champion_pct > 0 ? 2 : 0
                                        )
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Top 4 % / Odds */}
                        <td className="py-3.5 px-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                              {displayMode === "odds" ? (
                                <span
                                  className={
                                    row.top4_pct > 50
                                      ? "font-bold text-[#38BDF8] light:text-sky-700"
                                      : row.top4_pct > 0.05
                                      ? "text-slate-300 light:text-slate-700 font-semibold"
                                      : "text-slate-500 light:text-slate-500 font-mono"
                                  }
                                >
                                  {formatCellOdds(row.top4_pct)}
                                </span>
                              ) : (
                                <AnimatedNumber
                                  value={simulationsRun ? row.top4_pct : 0}
                                  decimals={1}
                                  suffix="%"
                                  className={
                                    row.top4_pct > 50
                                      ? "font-bold text-[#38BDF8] light:text-sky-700"
                                      : row.top4_pct > 0.05
                                      ? "text-slate-400 light:text-slate-700 font-semibold"
                                      : "text-slate-500 light:text-slate-500 font-mono"
                                  }
                                />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 light:bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-[800ms] ease-out ${getBarColor(
                                  "top4",
                                  row.top4_pct
                                )}`}
                                style={{ width: `${simulationsRun ? row.top4_pct : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Relegation % / Odds */}
                        <td className="py-3.5 px-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                              {displayMode === "odds" ? (
                                <span
                                  className={
                                    row.relegation_pct > 15 || isRelegation
                                      ? "font-black text-[#E90052] light:text-[#D00045]"
                                      : row.relegation_pct > 0.05
                                      ? "text-slate-300 light:text-slate-700 font-semibold"
                                      : "text-slate-500 light:text-slate-500 font-mono"
                                  }
                                >
                                  {formatCellOdds(row.relegation_pct)}
                                </span>
                              ) : (
                                <AnimatedNumber
                                  value={simulationsRun ? row.relegation_pct : 0}
                                  decimals={1}
                                  suffix="%"
                                  className={
                                    row.relegation_pct > 15 || isRelegation
                                      ? "font-black text-[#E90052] light:text-[#D00045]"
                                      : row.relegation_pct > 0.05
                                      ? "text-slate-400 light:text-slate-700 font-semibold"
                                      : "text-slate-500 light:text-slate-500 font-mono font-medium"
                                  }
                                />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 light:bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-[800ms] ease-out ${
                                  isRelegation && row.relegation_pct <= 15
                                    ? "bg-[#E90052]"
                                    : getBarColor("releg", row.relegation_pct)
                                }`}
                                style={{ width: `${simulationsRun ? row.relegation_pct : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Avg Points */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-white light:text-slate-900">
                          <AnimatedNumber
                            value={simulationsRun ? row.avg_points : 0}
                            decimals={1}
                          />
                        </td>

                        {/* Range Band Badge + Expand trigger */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-2 justify-center">
                            {row.points_p10 !== undefined && row.points_p90 !== undefined && (
                              <span
                                title="Floor to Ceiling finish range across 10,000 simulations (P10 - P90)"
                                className="hidden sm:inline-block text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 text-slate-300 light:text-slate-700 hover:border-[#38BDF8]/30 light:hover:border-sky-400 transition-colors"
                              >
                                {Math.min(row.points_p10, row.points_p90).toFixed(0)} – {Math.max(row.points_p10, row.points_p90).toFixed(0)} pts
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label="Expand confidence bands"
                              className="p-1 rounded-lg text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-100 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#38BDF8] light:text-sky-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Confidence Bands Visual */}
                      {isExpanded && (
                        <tr className="bg-black/40 light:bg-slate-50/70 border-b border-white/10 light:border-slate-200">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white/[0.03] light:bg-white p-4 sm:p-5 rounded-2xl border border-white/5 light:border-slate-200/90 light:shadow-sm">
                              {/* Official Gameweek 6 Standings Snapshot */}
                              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/10 light:border-slate-200 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-extrabold text-white light:text-[#38003C] uppercase tracking-wider text-[11px] bg-white/10 light:bg-[#38003C]/10 px-2 py-0.5 rounded">
                                    Official GW6 Record
                                  </span>
                                  {(() => {
                                    const m = getTeamMomentum(row.team, row.rank, row.current_rank);
                                    return (
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${m.badgeStyle}`}
                                      >
                                        {m.type === "positive" && <ChevronUp className="w-3 h-3 stroke-[3]" />}
                                        {m.type === "negative" && <ChevronDown className="w-3 h-3 stroke-[3]" />}
                                        {m.type === "steady" && <Minus className="w-2.5 h-2.5 stroke-[3]" />}
                                        {m.title}
                                      </span>
                                    );
                                  })()}
                                  <span className="text-slate-500 light:text-slate-300">•</span>
                                  <span className="text-slate-300 light:text-slate-600">
                                    Table Rank: <strong className="text-white light:text-slate-900">#{row.current_rank ?? row.rank}</strong>
                                  </span>
                                  <span className="text-slate-500 light:text-slate-300">•</span>
                                  <span className="text-slate-300 light:text-slate-600">
                                    Matches Played: <strong className="text-white light:text-slate-900">{row.played ?? 6}</strong>
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 font-mono text-[11px]">
                                  <span className="text-slate-300 light:text-slate-600"><strong className="text-emerald-400 light:text-emerald-700">{row.wins ?? 0}</strong>W</span>
                                  <span className="text-slate-300 light:text-slate-600"><strong className="text-amber-400 light:text-amber-700">{row.draws ?? 0}</strong>D</span>
                                  <span className="text-slate-300 light:text-slate-600"><strong className="text-rose-400 light:text-rose-700">{row.losses ?? 0}</strong>L</span>
                                  <span className="text-slate-600 light:text-slate-300 hidden sm:inline">|</span>
                                  <span className="text-slate-300 light:text-slate-600">GF: <strong className="text-white light:text-slate-900">{row.gf ?? 0}</strong></span>
                                  <span className="text-slate-300 light:text-slate-600">GA: <strong className="text-white light:text-slate-900">{row.ga ?? 0}</strong></span>
                                  <span className="text-slate-300 light:text-slate-600">
                                    GD: <strong className={((row.gd ?? 0) >= 0) ? "text-[#00FF85] light:text-emerald-700" : "text-[#E90052] light:text-rose-700"}>
                                      {((row.gd ?? 0) > 0) ? `+${row.gd}` : (row.gd ?? 0)}
                                    </strong>
                                  </span>
                                  <span className="text-slate-600 light:text-slate-300 hidden sm:inline">|</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-[#00FF85]/15 light:bg-emerald-500/10 border border-[#00FF85]/35 light:border-emerald-500/30 text-[#00FF85] light:text-emerald-700 font-black">
                                    {row.points ?? 0} Pts
                                  </span>
                                </div>
                              </div>

                              {/* Points Confidence Band */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-300 light:text-slate-700 font-semibold">
                                  <div className="flex items-center gap-1.5 group relative">
                                    <span>Points Range (Floor to Ceiling)</span>
                                    <Info className="w-3.5 h-3.5 text-slate-500 light:text-slate-400 hover:text-[#38BDF8] light:hover:text-sky-600 cursor-help" />
                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2.5 rounded-xl bg-[#12121C] light:bg-white light:border-slate-200 light:text-slate-700 border border-white/15 text-[11px] text-slate-300 shadow-2xl z-30 font-normal pointer-events-none text-left">
                                      10th-to-90th percentile finish range across 10,000 simulations, capturing 80% of expected outcomes while filtering extreme anomalies.
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#38BDF8]/10 light:bg-sky-50 text-[#38BDF8] light:text-[#0284C7] font-mono tabular-nums text-xs font-bold border border-[#38BDF8]/20 light:border-sky-300">
                                    {Math.min(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} – {Math.max(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} Pts
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="p-2 rounded-xl bg-white/[0.02] light:bg-slate-50 border border-white/5 light:border-slate-200 space-y-0.5">
                                    <span className="text-[10px] text-slate-400 light:text-slate-500 block font-medium">Floor / Worst Case</span>
                                    <span className="font-mono tabular-nums font-bold text-slate-300 light:text-slate-800 text-sm">
                                      {Math.min(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} pts
                                    </span>
                                    <span className="text-[9px] text-slate-500 light:text-slate-400 block font-mono">P10</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#38BDF8]/10 light:bg-sky-50 border border-[#38BDF8]/30 light:border-sky-300 space-y-0.5">
                                    <span className="text-[10px] text-[#38BDF8] light:text-[#0284C7] block font-bold">Projected</span>
                                    <span className="font-mono tabular-nums font-black text-white light:text-slate-900 text-sm">{row.points_p50?.toFixed(0)} pts</span>
                                    <span className="text-[9px] text-[#38BDF8]/80 light:text-[#0284C7]/80 block font-mono">P50 (Median)</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#00FF85]/10 light:bg-emerald-50 border border-[#00FF85]/30 light:border-emerald-300 space-y-0.5">
                                    <span className="text-[10px] text-[#00FF85] light:text-emerald-700 block font-bold">Ceiling / Best Case</span>
                                    <span className="font-mono tabular-nums font-black text-white light:text-slate-900 text-sm">
                                      {Math.max(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} pts
                                    </span>
                                    <span className="text-[9px] text-[#00FF85]/80 light:text-emerald-600 block font-mono">P90</span>
                                  </div>
                                </div>

                                {/* Range Visual Bar */}
                                <div className="h-3 bg-white/10 light:bg-slate-100 rounded-full relative overflow-hidden">
                                  <div
                                    className="absolute h-full bg-gradient-to-r from-[#3D195B] via-[#38BDF8] to-[#00FF85] light:from-[#38003C] light:via-sky-500 light:to-[#00A855] rounded-full"
                                    style={{
                                      left: `${Math.max(
                                        ((Math.min(row.points_p10 || 20, row.points_p90 || 20)) / 100) * 100,
                                        0
                                      )}%`,
                                      width: `${Math.min(
                                        (((Math.max(row.points_p10 || 80, row.points_p90 || 80)) -
                                          (Math.min(row.points_p10 || 20, row.points_p90 || 20))) /
                                          100) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-[11px] text-slate-400 light:text-slate-600">
                                  80% of simulations finish between{" "}
                                  <strong className="text-white light:text-slate-900">
                                    {Math.min(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)}
                                  </strong>{" "}
                                  (worst case) and{" "}
                                  <strong className="text-white light:text-slate-900">
                                    {Math.max(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)}
                                  </strong>{" "}
                                  points (best case).
                                </p>
                              </div>

                              {/* Position Confidence Band */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-300 light:text-slate-700 font-semibold">
                                  <div className="flex items-center gap-1.5 group relative">
                                    <span>Finish Position (Ceiling to Floor)</span>
                                    <Info className="w-3.5 h-3.5 text-slate-500 light:text-slate-400 hover:text-[#00FF85] light:hover:text-emerald-600 cursor-help" />
                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2.5 rounded-xl bg-[#12121C] light:bg-white light:border-slate-200 light:text-slate-700 border border-white/15 text-[11px] text-slate-300 shadow-2xl z-30 font-normal pointer-events-none text-left">
                                      10th-to-90th percentile finish range across 10,000 simulations (lower position number is better).
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#00FF85]/10 light:bg-emerald-50 text-[#00FF85] light:text-emerald-700 font-mono tabular-nums text-xs font-bold border border-[#00FF85]/20 light:border-emerald-300">
                                    #{Math.min(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)} – #{Math.max(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="p-2 rounded-xl bg-[#00FF85]/10 light:bg-emerald-50 border border-[#00FF85]/30 light:border-emerald-300 space-y-0.5">
                                    <span className="text-[10px] text-[#00FF85] light:text-emerald-700 block font-bold">Ceiling / Best Case</span>
                                    <span className="font-mono tabular-nums font-black text-white light:text-slate-900 text-sm">
                                      #{Math.min(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)}
                                    </span>
                                    <span className="text-[9px] text-[#00FF85]/80 light:text-emerald-600 block font-mono">P10</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#38BDF8]/10 light:bg-sky-50 border border-[#38BDF8]/30 light:border-sky-300 space-y-0.5">
                                    <span className="text-[10px] text-[#38BDF8] light:text-[#0284C7] block font-bold">Projected</span>
                                    <span className="font-mono tabular-nums font-black text-white light:text-slate-900 text-sm">#{row.position_p50?.toFixed(0)}</span>
                                    <span className="text-[9px] text-[#38BDF8]/80 light:text-[#0284C7]/80 block font-mono">P50 (Median)</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-white/[0.02] light:bg-slate-50 border border-white/5 light:border-slate-200 space-y-0.5">
                                    <span className="text-[10px] text-slate-400 light:text-slate-500 block font-medium">Floor / Worst Case</span>
                                    <span className="font-mono tabular-nums font-bold text-slate-300 light:text-slate-800 text-sm">
                                      #{Math.max(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)}
                                    </span>
                                    <span className="text-[9px] text-slate-500 light:text-slate-400 block font-mono">P90</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-2">
                                  <p className="text-[11px] text-slate-400 light:text-slate-600">
                                    Projected to finish <strong className="text-white light:text-slate-900">#{row.position_p50?.toFixed(0)}</strong> on average.
                                  </p>
                                  <Link
                                    href={`/teams/${encodeURIComponent(row.team)}`}
                                    className="text-xs font-semibold text-[#38BDF8] light:text-[#0284C7] hover:underline flex items-center gap-1 shrink-0"
                                  >
                                    Team Profile & Radar →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </section>
          </>
        )}
      </div>

      {/* Simulation Command Deck & Cinematic Reveal Overlay */}
      {!simulationsRun && phase !== "revealed" && (
        <div
          className={`epl-launchpad-overlay fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-500 ease-out ${
            revealing
              ? "opacity-0 pointer-events-none backdrop-blur-none bg-[#090A0C]/0 light:bg-[#F4F5F8]/0"
              : "opacity-100 pointer-events-auto backdrop-blur-xl bg-[#090A0C]/85 light:bg-[#F4F5F8]/85"
          }`}
        >
          {/* Central Deck Card */}
          <div
            className={`relative w-full ${
              phase === "podium_ready"
                ? "max-w-lg sm:max-w-xl"
                : "max-w-md sm:max-w-lg"
            } mx-auto bg-[#111317] light:bg-white/95 border border-white/[0.08] light:border-slate-200/90 rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] light:shadow-[0_10px_35px_-5px_rgba(56,0,60,0.06)] text-center overflow-hidden transition-all duration-400 ease-out ${
              revealing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            {/* Audio Mute/Unmute Toggle Button */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? "Unmute simulation audio" : "Mute simulation audio"}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 light:bg-slate-100 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-all cursor-pointer shadow-xs select-none"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400 light:text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#00FF87] light:text-[#047857]" />
              )}
            </button>

            {/* Step 1 (Idle) & Step 2 (Crunching) View */}
            {(phase === "idle" || phase === "crunching") && (
              <div className="relative z-10 space-y-6">
                {/* Central PL Emblem with Telemetry Ring */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
                  {phase === "crunching" && (
                    <div className="absolute inset-0 rounded-full border-2 border-[#00FF87]/20 border-t-[#00FF87] light:border-[#047857]/20 light:border-t-[#047857] animate-spin" />
                  )}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#38003C] to-[#1a001c] light:from-[#38003C] light:to-[#220025] p-3 flex items-center justify-center shadow-xl light:shadow-md border border-[#7B1FA2]/50 light:border-[#38003C]/30 transition-transform duration-500 ${
                      phase === "crunching" ? "scale-105" : ""
                    }`}
                  >
                    <PremierLeagueLion
                      fill="#FFFFFF"
                      className="w-full h-full pl-lion-crest text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>

                {/* Title */}
                <h2
                  dir="rtl"
                  className="text-2xl sm:text-3xl font-black text-white light:text-[#19001B] tracking-tight leading-snug pt-1"
                >
                  {phase === "crunching"
                    ? "جارٍ معالجة 10,000 مسار احتمالي..."
                    : "جاهز لمعرفة مصير الدوري الإنجليزي؟"}
                </h2>

                {/* Step 2: Telemetry Crunching Counter (Isolated Component) */}
                {phase === "crunching" ? (
                  <CrunchTelemetryView
                    crunchCount={crunchCount}
                    crunchLogIndex={crunchLogIndex}
                  />
                ) : (
                  /* Step 1: Initial Launch 3D Keycap Button */
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleStartSimulation}
                      className="w-full min-h-[52px] relative inline-flex items-center justify-center px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base text-[#0B0E14] light:text-white bg-gradient-to-b from-[#00FF87] to-[#00D670] light:from-[#38003C] light:to-[#260029] border border-[#5CFFB0] light:border-[#4A0050] shadow-[0_4px_0_0_#009E52,0_5px_0_1px_#007A3E,inset_0_1px_0_0_rgba(255,255,255,0.4),0_10px_25px_rgba(0,255,135,0.3)] light:shadow-[0_4px_0_0_#1E0020,0_5px_0_1px_#140015,inset_0_1px_0_0_rgba(255,255,255,0.3),0_10px_25px_rgba(56,0,60,0.2)] hover:-translate-y-[1px] hover:brightness-105 light:hover:from-[#430048] light:hover:to-[#2B002E] active:translate-y-[2px] active:shadow-[0_1px_0_0_#009E52,0_1px_0_1px_#007A3E] light:active:shadow-[0_1px_0_0_#1E0020,0_1px_0_1px_#140015] transition-all cursor-pointer select-none"
                    >
                      <span>Run 10000 Simulations Now</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Top 3 Broadcast Podium Preview */}
            {phase === "podium_ready" && (
              <div className="relative z-10 space-y-5 sm:space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF87]/10 light:bg-emerald-50 border border-[#00FF87]/30 light:border-emerald-200 text-[#00FF87] light:text-[#047857] text-[11px] font-bold font-mono uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87] light:text-[#047857]" />
                    <span>10,000 Simulations Complete</span>
                  </div>
                  <h3
                    dir="rtl"
                    className="text-2xl sm:text-3xl font-black text-white light:text-[#19001B] tracking-tight"
                  >
                    منصة التتويج
                  </h3>
                </div>

                {/* Structured Glass Podium Box Container */}
                <div className="bg-[#16181D] light:bg-white border border-white/[0.07] light:border-slate-200 rounded-xl p-2.5 sm:p-4 shadow-inner light:shadow-sm">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 text-center items-end pt-2">
                    {/* #2 Platform (Left - Arsenal Silver) */}
                    {top3TitleTeams[1] && (
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-white/[0.02] light:bg-slate-50/80 border border-slate-400/30 light:border-slate-200 shadow-md light:shadow-sm relative">
                        <div className="relative mb-1.5 sm:mb-2">
                          <div className="p-1 sm:p-1.5 rounded-xl border border-slate-400/40 light:border-slate-300 bg-[#111317] light:bg-white light:shadow-xs">
                            <TeamCrest team={top3TitleTeams[1].team} size={32} />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-200 text-slate-900 font-mono font-black text-[9px] sm:text-[10px] flex items-center justify-center border border-white shadow">
                            2
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-sm font-bold text-white light:text-[#19001B] truncate max-w-[72px] sm:max-w-[90px]">
                          {top3TitleTeams[1].team}
                        </span>
                        <span className="text-xs sm:text-base font-black text-slate-200 light:text-slate-800 font-mono mt-0.5">
                          {top3TitleTeams[1].champion_pct.toFixed(1)}%
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 light:text-slate-600 font-bold bg-white/5 light:bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10 light:border-slate-200 mt-1">
                          Silver
                        </span>
                      </div>
                    )}

                    {/* #1 Platform (Center - Man City Gold Favorite - Elevated) */}
                    {top3TitleTeams[0] && (
                      <div className="flex flex-col items-center p-2.5 sm:p-4 rounded-xl bg-gradient-to-b from-amber-500/15 via-amber-500/[0.04] to-transparent light:from-amber-50/90 light:via-amber-50/40 light:to-transparent border-2 border-amber-400/70 light:border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.2)] light:shadow-[0_4px_20px_rgba(245,158,11,0.12)] -translate-y-2 sm:-translate-y-3 z-10 relative">
                        <div className="relative mb-1.5 sm:mb-2">
                          <div className="p-1 sm:p-1.5 rounded-xl border border-amber-400/60 light:border-amber-400/80 bg-[#111317] light:bg-white shadow-[0_0_12px_rgba(251,191,36,0.3)] light:shadow-sm">
                            <TeamCrest team={top3TitleTeams[0].team} size={40} />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-mono font-black text-[9px] sm:text-[10px] flex items-center justify-center border border-white shadow">
                            1
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-sm font-black text-white light:text-[#19001B] truncate max-w-[78px] sm:max-w-[95px]">
                          {top3TitleTeams[0].team}
                        </span>
                        <span className="text-sm sm:text-lg font-black text-amber-300 light:text-amber-800 font-mono mt-0.5">
                          {top3TitleTeams[0].champion_pct.toFixed(1)}%
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-300 light:text-amber-800 font-black bg-amber-400/20 light:bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400/40 light:border-amber-300 mt-1">
                          Favorite
                        </span>
                      </div>
                    )}

                    {/* #3 Platform (Right - Liverpool Bronze) */}
                    {top3TitleTeams[2] && (
                      <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-white/[0.02] light:bg-orange-50/40 border border-amber-700/40 light:border-amber-300/60 shadow-lg light:shadow-sm relative">
                        <div className="relative mb-1.5 sm:mb-2">
                          <div className="p-1 sm:p-1.5 rounded-xl border border-amber-700/50 light:border-amber-300 bg-[#111317] light:bg-white light:shadow-xs">
                            <TeamCrest team={top3TitleTeams[2].team} size={32} />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-700 text-amber-100 font-mono font-black text-[9px] sm:text-[10px] flex items-center justify-center border border-amber-400/80 shadow">
                            3
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-sm font-bold text-white light:text-[#19001B] truncate max-w-[72px] sm:max-w-[90px]">
                          {top3TitleTeams[2].team}
                        </span>
                        <span className="text-xs sm:text-base font-black text-amber-200/90 light:text-amber-900 font-mono mt-0.5">
                          {top3TitleTeams[2].champion_pct.toFixed(1)}%
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-400/80 light:text-amber-800 font-bold bg-white/5 light:bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10 light:border-amber-200 mt-1">
                          Bronze
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4 Trigger: Reveal Full Standings Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await initAudio();
                      handleRevealFullTable();
                    }}
                    className="w-full min-h-[52px] relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base text-[#0B0E14] light:text-white bg-gradient-to-b from-[#00FF87] to-[#00D670] light:from-[#38003C] light:to-[#260029] border border-[#5CFFB0] light:border-[#4A0050] shadow-[0_4px_0_0_#009E52,0_5px_0_1px_#007A3E,inset_0_1px_0_0_rgba(255,255,255,0.4),0_10px_25px_rgba(0,255,135,0.3)] light:shadow-[0_4px_0_0_#1E0020,0_5px_0_1px_#140015,inset_0_1px_0_0_rgba(255,255,255,0.3),0_10px_25px_rgba(56,0,60,0.2)] hover:-translate-y-[1px] hover:brightness-105 light:hover:from-[#430048] light:hover:to-[#2B002E] active:translate-y-[2px] active:shadow-[0_1px_0_0_#009E52,0_1px_0_1px_#007A3E] light:active:shadow-[0_1px_0_0_#1E0020,0_1px_0_1px_#140015] transition-all cursor-pointer select-none"
                  >
                    <span>استكشف الجدول الكامل والترتيب ➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
