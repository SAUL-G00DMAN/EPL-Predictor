"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Swords,
  Calendar,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Trophy,
  Share2,
  Check,
  ShieldCheck,
  X,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { MiniPitch } from "@/components/MiniPitch";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { TEAMS_DATA, getTeamMetadata } from "@/data/teams";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface MatchResult {
  home_team: string;
  away_team: string;
  match_date: string;
  probabilities: {
    H: number;
    D: number;
    A: number;
  };
  expected_goals: {
    home: number;
    away: number;
  };
  predicted_outcome: string;
  outcome_meaning: string;
  predicted_score?: string;
  most_likely_score?: string;
}

const MARQUEE_PRESETS = [
  { home: "Arsenal", away: "Chelsea", label: "Arsenal vs Chelsea" },
  { home: "Liverpool", away: "Man City", label: "Liverpool vs Man City" },
  { home: "Man United", away: "Tottenham", label: "Man United vs Tottenham" },
];

/**
 * Interactive rolling number counter animation for the stochastic Monte Carlo draw.
 * Starts at 0 and counts up smoothly to target scores over ~750ms with a glowing pulse.
 */
function RollingScorePill({
  targetHome,
  targetAway,
  triggerKey,
  isRerolling = false,
  duration = 750,
}: {
  targetHome: number;
  targetAway: number;
  triggerKey: string | number;
  isRerolling?: boolean;
  duration?: number;
}) {
  const [displayHome, setDisplayHome] = useState(0);
  const [displayAway, setDisplayAway] = useState(0);
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    setDisplayHome(0);
    setDisplayAway(0);
    setIsRolling(true);

    let startTime: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out quad curve
      const easeProgress = 1 - Math.pow(1 - progress, 2);

      const nextHome = Math.round(targetHome * easeProgress);
      const nextAway = Math.round(targetAway * easeProgress);

      setDisplayHome(nextHome);
      setDisplayAway(nextAway);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayHome(targetHome);
        setDisplayAway(targetAway);
        setIsRolling(false);
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [targetHome, targetAway, triggerKey, duration]);

  const activeGlow = isRolling || isRerolling;

  return (
    <div
      className={`text-2xl sm:text-3xl font-black font-mono text-emerald-400 bg-slate-800/90 px-4 py-1.5 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 select-none ${
        activeGlow
          ? "border-[#00FF85] shadow-[0_0_16px_rgba(0,255,133,0.4)] animate-pulse scale-105"
          : "border-slate-700 shadow-inner scale-100"
      }`}
    >
      <span className="w-5 sm:w-6 text-center tabular-nums">{displayHome}</span>
      <span className="text-slate-500 text-xl font-bold select-none">-</span>
      <span className="w-5 sm:w-6 text-center tabular-nums">{displayAway}</span>
    </div>
  );
}

function MatchPredictorContent() {
  const searchParams = useSearchParams();
  const [teamList, setTeamList] = useState<string[]>(Object.keys(TEAMS_DATA));
  const [homeTeam, setHomeTeam] = useState<string>("Arsenal");
  const [awayTeam, setAwayTeam] = useState<string>("Chelsea");
  const [matchDate, setMatchDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [isSuspense, setIsSuspense] = useState(false);
  const [clashState, setClashState] = useState<"idle" | "charging" | "colliding">("idle");
  const [simulationKey, setSimulationKey] = useState<number>(0);
  const [liveScore, setLiveScore] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const [result, setResult] = useState<MatchResult | null>(null);
  const [rerolling, setRerolling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeRunIdRef = useRef<number>(0);
  const clashTimersRef = useRef<NodeJS.Timeout[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const initialUrlCheckedRef = useRef<boolean>(false);

  useEffect(() => {
    // Fetch live team list from backend
    fetch(`${API_BASE_URL}/teams`)
      .then((res) => res.json())
      .then((json) => {
        if (json.teams) {
          setTeamList(json.teams);
        }
      })
      .catch(() => {
        // Fallback to static list
      });
  }, []);

  // Core simulation engine function accepting explicit team parameters
  const runSimulation = async (
    targetHome: string = homeTeam,
    targetAway: string = awayTeam,
    targetDate: string = matchDate
  ) => {
    if (loading) return;
    setErrorMessage(null);

    if (targetHome === targetAway) {
      setErrorMessage("Please select two distinct teams for the match prediction.");
      setResult(null);
      setClashState("idle");
      return;
    }

    // Cancel all previous running animations / timers immediately
    clashTimersRef.current.forEach(clearTimeout);
    clashTimersRef.current = [];

    const runId = Date.now();
    activeRunIdRef.current = runId;

    setLoading(true);
    setIsSuspense(true);
    setResult(null);
    setClashState("charging");

    try {
      const url = `${API_BASE_URL}/predictions/match?home_team=${encodeURIComponent(
        targetHome
      )}&away_team=${encodeURIComponent(targetAway)}&match_date=${targetDate}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      clashTimersRef.current.push(timeoutId);

      const fetchPromise = fetch(url, { signal: controller.signal }).then(
        async (res) => {
          clearTimeout(timeoutId);
          const json = await res.json();
          return { ok: res.ok, status: res.status, data: json };
        }
      );

      // 0ms - 650ms: Charging inward
      // 650ms - 1200ms: Collision & impact flash shake
      const tColliding = setTimeout(() => {
        if (activeRunIdRef.current === runId) {
          setClashState("colliding");
        }
      }, 650);
      clashTimersRef.current.push(tColliding);

      const [{ ok, status, data }] = await Promise.all([
        fetchPromise,
        new Promise((resolve) => {
          const tResolve = setTimeout(resolve, 1200);
          clashTimersRef.current.push(tResolve);
        }),
      ]);

      // If a newer click superceded this run, abort silently
      if (activeRunIdRef.current !== runId) return;

      if (!ok) {
        setClashState("idle");
        if (status === 404) {
          setErrorMessage(
            "One or both selected teams could not be recognized by the predictive engine."
          );
        } else if (status === 400) {
          setErrorMessage(
            data.detail || "Home team and away team cannot be identical."
          );
        } else {
          setErrorMessage("Failed to calculate prediction. Please try again.");
        }
        setResult(null);
      } else {
        setClashState("idle");
        setSimulationKey(runId);
        setLiveScore({ home: 0, away: 0 });
        setResult(data);

        // Auto-scroll down to the results container
        setTimeout(() => {
          document.getElementById("simulation-arena")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch {
      if (activeRunIdRef.current === runId) {
        setClashState("idle");
        setErrorMessage(
          "Unable to reach prediction service. Please check your connection and try again."
        );
        setResult(null);
      }
    } finally {
      if (activeRunIdRef.current === runId) {
        setLoading(false);
        setIsSuspense(false);
      }
    }
  };

  // URL query parameter synchronization on initial page load
  useEffect(() => {
    if (initialUrlCheckedRef.current) return;
    const homeParam = searchParams.get("home");
    const awayParam = searchParams.get("away");
    const dateParam = searchParams.get("date");

    if (homeParam && awayParam) {
      initialUrlCheckedRef.current = true;
      setHomeTeam(homeParam);
      setAwayTeam(awayParam);
      if (dateParam) {
        setMatchDate(dateParam);
      }
      runSimulation(homeParam, awayParam, dateParam || matchDate);
    }
  }, [searchParams]);

  // Clean up clash timers on unmount
  useEffect(() => {
    return () => {
      clashTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // When either team or date changes: clear result and errors (with auto-swap if same team selected)
  const handleHomeTeamChange = (newHome: string) => {
    if (newHome === awayTeam) {
      setAwayTeam(homeTeam);
    }
    setHomeTeam(newHome);
    setResult(null);
    setErrorMessage(null);
  };

  const handleAwayTeamChange = (newAway: string) => {
    if (newAway === homeTeam) {
      setHomeTeam(awayTeam);
    }
    setAwayTeam(newAway);
    setResult(null);
    setErrorMessage(null);
  };

  const handleDateChange = (newDate: string) => {
    setMatchDate(newDate);
    setResult(null);
    setErrorMessage(null);
  };

  const handleSwap = () => {
    const prevHome = homeTeam;
    setHomeTeam(awayTeam);
    setAwayTeam(prevHome);
    setResult(null);
    setErrorMessage(null);
  };

  // Instant marquee preset selection + auto-simulation
  const handleSelectPreset = (presetHome: string, presetAway: string) => {
    setHomeTeam(presetHome);
    setAwayTeam(presetAway);
    runSimulation(presetHome, presetAway, matchDate);
  };

  // Share matchup link via native Web Share API with clipboard fallback
  const handleShareMatchup = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/predict?home=${encodeURIComponent(
      homeTeam
    )}&away=${encodeURIComponent(awayTeam)}`;
    const shareData = {
      title: "EPL Match Predictor",
      text: `${homeTeam} vs ${awayTeam} Premier League AI Simulation`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // clipboard failure fallback
    }
  };

  // Instant re-roll of stochastic Poisson score without resetting teams
  const handleReroll = async () => {
    if (rerolling || loading || !result) return;
    setRerolling(true);
    setErrorMessage(null);
    try {
      const url = `${API_BASE_URL}/predictions/match?home_team=${encodeURIComponent(
        homeTeam
      )}&away_team=${encodeURIComponent(awayTeam)}&match_date=${matchDate}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const runId = Date.now();
        setSimulationKey(runId);
        setLiveScore({ home: 0, away: 0 });
        setResult(data);
      } else {
        setErrorMessage(
          "Unable to reach prediction service. Please check your connection and try again."
        );
      }
    } catch {
      setErrorMessage(
        "Unable to reach prediction service. Please check your connection and try again."
      );
    } finally {
      setRerolling(false);
    }
  };

  // Parse predicted score (e.g. "2-1")
  const scoreParts = result?.predicted_score
    ? result.predicted_score.split("-")
    : ["0", "0"];
  const finalHomeScore = parseInt(scoreParts[0] ?? "0", 10) || 0;
  const finalAwayScore = parseInt(scoreParts[1] ?? "0", 10) || 0;

  // Parse statistically most likely score (e.g. "1-0" or "1 - 0")
  const mlScoreParts = (result?.most_likely_score || result?.predicted_score || "0-0")
    .replace(/\s+/g, "")
    .split("-");
  const mlHomeScore = parseInt(mlScoreParts[0] ?? "0", 10) || 0;
  const mlAwayScore = parseInt(mlScoreParts[1] ?? "0", 10) || 0;

  const isMlHomeWinner = mlHomeScore > mlAwayScore;
  const isMlAwayWinner = mlAwayScore > mlHomeScore;

  // Poisson Clean Sheet Probabilities for FPL managers
  const homeCleanSheetPct = result
    ? Math.round(Math.exp(-result.expected_goals.away) * 100)
    : 0;
  const awayCleanSheetPct = result
    ? Math.round(Math.exp(-result.expected_goals.home) * 100)
    : 0;

  const homeMeta = getTeamMetadata(homeTeam);
  const awayMeta = getTeamMetadata(awayTeam);

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Swords className="w-3.5 h-3.5 text-emerald-400" />
          <span>Match Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
          Head-to-Head Predictor
        </h1>
      </div>

      {/* Match Selector Card */}
      <div className="bg-[#151C28] p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl space-y-4 sm:space-y-8 relative overflow-hidden">
        {/* Subtle Tactical Pitch Lines & Grass Striping Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          {/* Mown Lawn Alternating Turf Pattern */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_44px,rgba(16,185,129,0.03)_44px,rgba(16,185,129,0.03)_88px)]" />
          {/* Tactical Pitch Geometry */}
          <svg
            className="absolute inset-0 w-full h-full stroke-emerald-400/10"
            fill="none"
            strokeWidth="1.25"
          >
            {/* Center Halfway Line */}
            <line x1="50%" y1="0%" x2="50%" y2="100%" strokeDasharray="6 4" />
            {/* Center Circle & Spot */}
            <circle cx="50%" cy="50%" r="56" />
            <circle cx="50%" cy="50%" r="2.5" fill="rgba(16, 185, 129, 0.2)" />
            {/* Left Box (Home Area) */}
            <path d="M 0 24% H 13% V 76% H 0" />
            <path d="M 0 38% H 4.5% V 62% H 0" />
            <path d="M 13% 43% A 20 20 0 0 1 13% 57%" />
            {/* Right Box (Away Area) */}
            <path d="M 100% 24% H 87% V 76% H 100%" />
            <path d="M 100% 38% H 95.5% V 62% H 100%" />
            <path d="M 87% 43% A 20 20 0 0 0 87% 57%" />
          </svg>
        </div>

        {/* Feature 3: Quick Marquee Presets */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Featured Clashes:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {MARQUEE_PRESETS.map((preset) => {
              const isActive =
                homeTeam === preset.home && awayTeam === preset.away;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.home, preset.away)}
                  className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm"
                      : "bg-slate-800/60 border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teams and VS Display */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-6 items-center">
          {/* Home Team Selector */}
          <div
            className={`md:col-span-5 flex flex-col items-center text-center space-y-2 sm:space-y-4 p-3 sm:p-5 rounded-2xl bg-[#182030] border transition-all duration-300 relative overflow-hidden ${
              isSuspense ? "border-emerald-500/60 scale-[1.02]" : "border-slate-800/80"
            }`}
          >
            {/* Dynamic Ambient Team Glow */}
            <div
              className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
              style={{ backgroundColor: homeMeta.primaryColor }}
            />

            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-[#94A3B8] relative z-10">
              Home Team
            </span>
            <div className="relative py-1 sm:py-2 transform transition-transform duration-300 hover:scale-105 flex items-center justify-center">
              {/* Dynamic Radial Crest Glow */}
              <div
                className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700 opacity-30"
                style={{ backgroundColor: homeMeta.primaryColor }}
              />
              <div className="block sm:hidden relative z-10">
                <TeamCrest team={homeTeam} size={50} />
              </div>
              <div className="hidden sm:block relative z-10">
                <TeamCrest team={homeTeam} size={84} />
              </div>
            </div>
            <select
              value={homeTeam}
              onChange={(e) => handleHomeTeamChange(e.target.value)}
              className="w-full min-h-[44px] bg-[#0F1520] border border-slate-700 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-white font-bold text-center text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer relative z-10"
            >
              {teamList.map((team) => (
                <option
                  key={team}
                  value={team}
                  disabled={team === awayTeam}
                  className={`bg-[#0F1520] ${team === awayTeam ? "text-slate-500" : "text-white"}`}
                >
                  {team} {team === awayTeam ? " (Away Team)" : ""}
                </option>
              ))}
            </select>

            {/* Recent 5-Match Form Badges (W - D - L) */}
            <div className="flex items-center justify-center gap-1.5 pt-1 relative z-10">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 tracking-wider">
                Form:
              </span>
              {homeMeta.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black uppercase transition-transform hover:scale-110 shadow-xs ${
                    res === "W"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : res === "D"
                      ? "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}
                  title={res === "W" ? "Win" : res === "D" ? "Draw" : "Loss"}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>

          {/* VS Center Action on Desktop, and Center Bridge + CTA on Mobile */}
          <div className="md:col-span-1 flex flex-col items-center justify-center my-0 relative z-10 w-full">
            {/* Desktop-only VS circular button */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <button
                onClick={handleSwap}
                type="button"
                title="Swap Home/Away"
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#1F2937] hover:bg-[#374151] border border-slate-700 flex items-center justify-center font-black text-xs sm:text-sm text-slate-200 shadow-lg hover:scale-110 active:scale-95 transition-all group cursor-pointer"
              >
                <span className={isSuspense ? "animate-spin" : "group-hover:hidden"}>
                  {isSuspense ? "⚡" : "VS"}
                </span>
                {!isSuspense && (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 hidden group-hover:block animate-spin text-slate-300" />
                )}
              </button>
            </div>

            {/* Mobile-only Bridge: Swap VS pill + Centered Simulate CTA */}
            <div className="flex md:hidden flex-col items-center w-full gap-2.5 my-1.5">
              <div className="flex items-center justify-center">
                <button
                  onClick={handleSwap}
                  type="button"
                  title="Swap Home/Away"
                  className="px-3.5 py-1 rounded-full bg-[#1F2937] hover:bg-[#374151] border border-slate-700 flex items-center gap-1.5 font-bold text-xs text-slate-200 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Swap</span>
                  <span className="text-emerald-400 font-black">VS</span>
                </button>
              </div>

              <button
                onClick={() => runSimulation()}
                disabled={loading}
                className={`w-full min-h-[46px] py-3 px-6 rounded-xl font-black text-sm tracking-wide bg-[#00FF85] hover:bg-[#00E676] active:scale-95 text-[#0A0A14] shadow-lg shadow-[#00FF85]/25 border border-[#00FF85] transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? "opacity-80 cursor-not-allowed pointer-events-none"
                    : "cursor-pointer hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0A0A14]" />
                    <span className="text-[#0A0A14] font-black">Simulating...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#0A0A14]" />
                    <span className="text-[#0A0A14] font-black">Simulate Matchup</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Away Team Selector */}
          <div
            className={`md:col-span-5 flex flex-col items-center text-center space-y-2 sm:space-y-4 p-3 sm:p-5 rounded-2xl bg-[#182030] border transition-all duration-300 relative overflow-hidden ${
              isSuspense ? "border-slate-600 scale-[1.02]" : "border-slate-800/80"
            }`}
          >
            {/* Dynamic Ambient Team Glow */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
              style={{ backgroundColor: awayMeta.primaryColor }}
            />

            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-[#94A3B8] relative z-10">
              Away Team
            </span>
            <div className="relative py-1 sm:py-2 transform transition-transform duration-300 hover:scale-105 flex items-center justify-center">
              {/* Dynamic Radial Crest Glow */}
              <div
                className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700 opacity-30"
                style={{ backgroundColor: awayMeta.primaryColor }}
              />
              <div className="block sm:hidden relative z-10">
                <TeamCrest team={awayTeam} size={50} />
              </div>
              <div className="hidden sm:block relative z-10">
                <TeamCrest team={awayTeam} size={84} />
              </div>
            </div>
            <select
              value={awayTeam}
              onChange={(e) => handleAwayTeamChange(e.target.value)}
              className="w-full min-h-[44px] bg-[#0F1520] border border-slate-700 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-white font-bold text-center text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer relative z-10"
            >
              {teamList.map((team) => (
                <option
                  key={team}
                  value={team}
                  disabled={team === homeTeam}
                  className={`bg-[#0F1520] ${team === homeTeam ? "text-slate-500" : "text-white"}`}
                >
                  {team} {team === homeTeam ? " (Home Team)" : ""}
                </option>
              ))}
            </select>

            {/* Recent 5-Match Form Badges (W - D - L) */}
            <div className="flex items-center justify-center gap-1.5 pt-1 relative z-10">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 tracking-wider">
                Form:
              </span>
              {awayMeta.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black uppercase transition-transform hover:scale-110 shadow-xs ${
                    res === "W"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : res === "D"
                      ? "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}
                  title={res === "W" ? "Win" : res === "D" ? "Draw" : "Loss"}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Date Selector, Share Matchup Button, and Simulate Action */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <span className="text-xs text-[#94A3B8] font-medium">Fixture Date:</span>
            </div>
            <input
              type="date"
              value={matchDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="min-h-[44px] bg-[#0F1520] border border-slate-700 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer flex items-center"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Share Matchup Link Button */}
            <button
              onClick={handleShareMatchup}
              type="button"
              className="px-3.5 py-2 sm:px-3.5 sm:py-3.5 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0 min-h-[44px]"
              title="Copy shareable link for this matchup"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Share Matchup</span>
                  <span className="sm:hidden">Share Link</span>
                </>
              )}
            </button>

            {/* Desktop-only Simulate Action at Bottom */}
            <button
              onClick={() => runSimulation()}
              disabled={loading}
              className={`hidden md:flex w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-black text-sm sm:text-base tracking-wide bg-[#00FF85] hover:bg-[#00E676] active:scale-95 text-[#0A0A14] shadow-lg shadow-[#00FF85]/25 border border-[#00FF85] transition-all duration-200 items-center justify-center gap-2 ${
                loading
                  ? "opacity-80 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0A0A14]" />
                  <span className="text-[#0A0A14] font-black">Simulating...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-[#0A0A14]" />
                  <span className="text-[#0A0A14] font-black">Simulate Matchup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Scroll-Down Visual Cue */}
      <ScrollIndicator scrollOffset={350} label="Scroll for Results & Analysis" />

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-4 sm:p-5 rounded-2xl border-l-4 border-l-rose-500 flex items-center justify-between gap-3 bg-rose-950/40 border border-rose-900/50 text-rose-200 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            type="button"
            className="text-rose-400 hover:text-white p-1 rounded-lg hover:bg-rose-900/50 transition-colors cursor-pointer shrink-0"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dramatic Clash Reveal Sequence */}
      {clashState !== "idle" && (
        <div className="bg-[#151C28] p-6 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden transition-all duration-300 shadow-xl">
          <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300 border border-slate-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Matchday Clash Simulation</span>
            </div>

            {/* Face-off Arena: Home charges from Left, Away charges from Right */}
            <div className="w-full max-w-lg relative h-36 flex items-center justify-between px-2 sm:px-8">
              {/* Home Team Charging Inward */}
              <div
                className={`flex flex-col items-center space-y-2 transition-all duration-700 ease-in-out ${
                  clashState === "charging"
                    ? "translate-x-10 sm:translate-x-20 scale-105"
                    : "translate-x-16 sm:translate-x-32 scale-110"
                }`}
              >
                <div className="p-2 sm:p-2.5 rounded-full bg-slate-800 border-2 border-slate-700 shadow-lg bg-[#182030]">
                  <TeamCrest team={homeTeam} size={64} />
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase">
                  {homeTeam}
                </span>
              </div>

              {/* Center Impact Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full flex items-center justify-center font-black text-slate-200 bg-[#182030] border-2 border-slate-700 shadow-xl">
                  <span className="font-mono text-base font-black">VS</span>
                </div>
              </div>

              {/* Away Team Charging Inward */}
              <div
                className={`flex flex-col items-center space-y-2 transition-all duration-700 ease-in-out ${
                  clashState === "charging"
                    ? "-translate-x-10 sm:-translate-x-20 scale-105"
                    : "-translate-x-16 sm:-translate-x-32 scale-110"
                }`}
              >
                <div className="p-2 sm:p-2.5 rounded-full bg-slate-800 border-2 border-slate-700 shadow-lg bg-[#182030]">
                  <TeamCrest team={awayTeam} size={64} />
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase">
                  {awayTeam}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] font-mono tracking-wider animate-pulse">
              Simulating tactical duel & Dixon-Coles goal dynamics...
            </p>
          </div>
        </div>
      )}

      {/* Prediction Output Section (ONLY visible after user clicks simulate and result arrives) */}
      {result && (
        <div
          ref={resultRef}
          id="simulation-arena"
          className="space-y-6 animate-in fade-in zoom-in-95 duration-500 scroll-mt-20"
        >
          {/* Main Dramatic Scoreline & Outcome Banner */}
          <div className="bg-[#151C28] p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
            {/* Header / Subtitle with Share Matchup Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Match Forecast
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300 font-mono">
                  {result.match_date}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleShareMatchup}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Matchup URL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Share Matchup</span>
                    </>
                  )}
                </button>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{result.outcome_meaning}</span>
                </div>
              </div>
            </div>

            {/* EXPANSIVE BROADCAST SCOREBOARD (Primary Centerpiece: Statistical Most Likely Scoreline) */}
            <div className="w-full max-w-2xl mx-auto bg-[#182030] border border-slate-700/80 rounded-2xl py-6 px-4 sm:px-8 shadow-2xl flex flex-col items-center">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs sm:text-sm font-bold text-slate-200 shadow-sm mb-5">
                <span>🎯 النتيجة الأكثر ترجيحاً إحصائياً (Most Likely Scoreline)</span>
              </div>

              {/* Flanked Broadcast Scoreboard Row: [Arsenal Crest/Name] --- [Animated Pitch with central Score] --- [Chelsea Crest/Name] */}
              <div className="w-full grid grid-cols-12 items-center gap-1 sm:gap-4">
                {/* Home Side (Flanking Left) */}
                <div className="col-span-3 flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                  <div className="transform transition-transform hover:scale-105 flex items-center justify-center">
                    <div className="hidden sm:block">
                      <TeamCrest team={result.home_team} size={64} />
                    </div>
                    <div className="sm:hidden">
                      <TeamCrest team={result.home_team} size={42} />
                    </div>
                  </div>
                  <h3 className="text-[11px] sm:text-sm font-extrabold text-[#F8FAFC] truncate max-w-full">
                    {result.home_team}
                  </h3>
                  {isMlHomeWinner && (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Winner
                    </span>
                  )}
                </div>

                {/* Dead-Center: Animated Pitch with central Score */}
                <div className="col-span-6 flex flex-col items-center justify-center w-full px-0.5 sm:px-1">
                  <MiniPitch
                    homeTeam={result.home_team}
                    awayTeam={result.away_team}
                    homeGoals={finalHomeScore}
                    awayGoals={finalAwayScore}
                    simulationKey={simulationKey}
                    centerScore={{ home: mlHomeScore, away: mlAwayScore }}
                    onScoreProgress={(liveH, liveA) => {
                      setLiveScore({ home: liveH, away: liveA });
                    }}
                  />
                </div>

                {/* Away Side (Flanking Right) */}
                <div className="col-span-3 flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                  <div className="transform transition-transform hover:scale-105 flex items-center justify-center">
                    <div className="hidden sm:block">
                      <TeamCrest team={result.away_team} size={64} />
                    </div>
                    <div className="sm:hidden">
                      <TeamCrest team={result.away_team} size={42} />
                    </div>
                  </div>
                  <h3 className="text-[11px] sm:text-sm font-extrabold text-[#F8FAFC] truncate max-w-full">
                    {result.away_team}
                  </h3>
                  {isMlAwayWinner && (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Winner
                    </span>
                  )}
                </div>
              </div>

              {/* Editorial Summary & English Label (Max 8 words Arabic) */}
              <div className="flex flex-col items-center space-y-1 mt-5 text-center">
                <p
                  dir="rtl"
                  className="text-xs sm:text-sm text-slate-300 font-semibold"
                >
                  النتيجة الأكثر تكراراً ونسبة تحقق بناءً على النماذج الإحصائية.
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  Most probable mode across all underlying goal expectation distributions.
                </p>
              </div>
            </div>

            {/* PROMINENT SECONDARY CARD: Monte Carlo Stochastic Draw */}
            <div className="w-full max-w-2xl mx-auto mt-4 bg-[#151C28] border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-lg">
              {/* Interactive Action (Left) */}
              <button
                type="button"
                onClick={handleReroll}
                disabled={rerolling || loading}
                className="order-3 sm:order-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                title="Re-roll simulation scenario"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-emerald-400 ${
                    rerolling ? "animate-spin" : ""
                  }`}
                />
                <span>{rerolling ? "جاري التحديث..." : "Re-roll ⟳"}</span>
              </button>

              {/* Score Display (Center) - Interactive Rolling Number Counter */}
              <div className="order-2 shrink-0">
                <RollingScorePill
                  targetHome={finalHomeScore}
                  targetAway={finalAwayScore}
                  triggerKey={simulationKey}
                  isRerolling={rerolling}
                />
              </div>

              {/* Label (RTL) */}
              <div
                dir="rtl"
                className="order-1 sm:order-3 text-center sm:text-right flex flex-col"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  🎲 عينة محاكاة عشوائية (Monte Carlo Stochastic Draw)
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  سيناريو عشوائي فردي مسحوب من أصل 10,000 محاكاة كاملة
                </span>
              </div>
            </div>

            {/* Segmented Probabilities Bar (Sky Sports / Opta Style) */}
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] font-semibold">
                <span>XGBoost Match Probabilities</span>
                <span>Sum: 100%</span>
              </div>

              <div className="h-9 w-full rounded-2xl overflow-hidden flex bg-slate-900 border border-slate-800 p-1 gap-1">
                {/* Home Win Segment */}
                <div
                  className="h-full rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-xs text-slate-950 transition-all duration-700 hover:brightness-110"
                  style={{ width: `${result.probabilities.H * 100}%` }}
                >
                  {result.probabilities.H > 0.12 && (
                    <span>{(result.probabilities.H * 100).toFixed(1)}%</span>
                  )}
                </div>

                {/* Draw Segment */}
                <div
                  className="h-full rounded-xl bg-slate-600 flex items-center justify-center font-bold text-xs text-white transition-all duration-700 hover:brightness-110"
                  style={{ width: `${result.probabilities.D * 100}%` }}
                >
                  {result.probabilities.D > 0.12 && (
                    <span>{(result.probabilities.D * 100).toFixed(1)}%</span>
                  )}
                </div>

                {/* Away Win Segment */}
                <div
                  className="h-full rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white transition-all duration-700 hover:brightness-110"
                  style={{ width: `${result.probabilities.A * 100}%` }}
                >
                  {result.probabilities.A > 0.12 && (
                    <span>{(result.probabilities.A * 100).toFixed(1)}%</span>
                  )}
                </div>
              </div>

              {/* Legend under bar */}
              <div className="grid grid-cols-3 text-center text-xs font-semibold pt-1">
                <div className="text-emerald-400 space-y-0.5">
                  <div>{result.home_team} Win (H)</div>
                  <div className="text-base font-black font-mono">
                    <AnimatedNumber
                      value={result.probabilities.H * 100}
                      suffix="%"
                    />
                  </div>
                </div>

                <div className="text-slate-300 space-y-0.5">
                  <div>Draw (D)</div>
                  <div className="text-base font-black font-mono">
                    <AnimatedNumber
                      value={result.probabilities.D * 100}
                      suffix="%"
                    />
                  </div>
                </div>

                <div className="text-indigo-400 space-y-0.5">
                  <div>{result.away_team} Win (A)</div>
                  <div className="text-base font-black font-mono">
                    <AnimatedNumber
                      value={result.probabilities.A * 100}
                      suffix="%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Fantasy / FPL Clean Sheet Odds Cards */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Fantasy Premier League (FPL) Clean Sheet Edge
                  </span>
                </div>
                <span className="text-[11px] text-[#94A3B8] font-mono">
                  Poisson Zero-Goal Probabilities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Home Clean Sheet */}
                <div className="p-4 rounded-2xl bg-[#182030] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <TeamCrest team={result.home_team} size={38} />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{result.home_team} Clean Sheet</span>
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        P(Away Conceded = 0) vs {result.expected_goals.away.toFixed(2)} xG
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {homeCleanSheetPct}%
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                      Probable Clean Sheet
                    </span>
                  </div>
                </div>

                {/* Away Clean Sheet */}
                <div className="p-4 rounded-2xl bg-[#182030] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <TeamCrest team={result.away_team} size={38} />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{result.away_team} Clean Sheet</span>
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        P(Home Conceded = 0) vs {result.expected_goals.home.toFixed(2)} xG
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-slate-200">
                      {awayCleanSheetPct}%
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                      Probable Clean Sheet
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dixon-Coles Expected Goals Section */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#182030] border border-slate-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <TeamCrest team={result.home_team} size={36} />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                      Expected Goals (xG)
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {result.home_team}
                    </h4>
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  <AnimatedNumber
                    value={result.expected_goals.home}
                    decimals={2}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#182030] border border-slate-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <TeamCrest team={result.away_team} size={36} />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                      Expected Goals (xG)
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {result.away_team}
                    </h4>
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-slate-200">
                  <AnimatedNumber
                    value={result.expected_goals.away}
                    decimals={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchPredictorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider uppercase font-mono text-slate-400">
            Loading Match Intelligence...
          </p>
        </div>
      }
    >
      <MatchPredictorContent />
    </Suspense>
  );
}
