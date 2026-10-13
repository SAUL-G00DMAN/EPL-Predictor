"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Search,
  X,
  Minus,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { getTeamMomentum } from "@/data/teams";
import {
  TeamProjection,
  fetchTablePredictions,
  getCachedTableData,
} from "@/data/cachedApi";

type SortField =
  | "rank"
  | "team"
  | "champion_pct"
  | "top4_pct"
  | "relegation_pct"
  | "avg_points";
type SortDirection = "asc" | "desc";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function HomePage() {
  const [data, setData] = useState<TeamProjection[]>(() => getCachedTableData() || []);
  const [loading, setLoading] = useState<boolean>(() => !getCachedTableData());
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"percentage" | "odds">("percentage");
  const [searchQuery, setSearchQuery] = useState("");

  const formatCellOdds = (pct: number) => {
    if (!pct || pct <= 0.05) return "-";
    const odds = 100 / pct;
    return odds >= 1000 ? "999.00" : odds.toFixed(2);
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "team" || field === "rank" ? "asc" : "desc");
    }
  };

  const getBarColor = (type: "champ" | "top4" | "releg", val: number) => {
    if (type === "champ") {
      if (val > 40) return "bg-gradient-to-r from-[#00FF85] to-[#04F5FF]";
      if (val > 10) return "bg-gradient-to-r from-[#04F5FF] to-[#3D195B]";
      return "bg-[#3D195B]";
    }
    if (type === "top4") {
      if (val > 60) return "bg-gradient-to-r from-[#00FF85] to-[#04F5FF]";
      if (val > 20) return "bg-gradient-to-r from-[#3D195B] to-[#04F5FF]";
      return "bg-slate-700";
    }
    // relegation
    if (val > 50) return "bg-gradient-to-r from-[#E90052] to-red-600";
    if (val > 15) return "bg-[#E90052]/70";
    return "bg-slate-800";
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Streamlined Top Header / Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141824] border border-[#23293B] text-slate-200 text-xs font-semibold shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF87]"></span>
          </span>
          <span>Updated through Gameweek 6 • 320 Fixtures Remaining</span>
        </div>
      </div>

      {/* Editorial Feature: Analyst's Take + Compact Top 3 Mini-Podium */}
      <section className="bg-gradient-to-l from-[#38003C]/25 via-[#141824]/95 to-[#141824] border border-[#23293B] border-r-4 border-r-[#7B1FA2] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Compact Top 3 Mini-Podium */}
          <div className="order-2 lg:order-1 flex-1 lg:max-w-[420px] bg-[#0B0E14]/85 border border-[#23293B] rounded-2xl p-3 sm:p-3.5 shadow-inner shrink-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse"></span>
                Top 3 Title Favorites
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                10,000 Sims
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* #2 Platform (Left - Arsenal) */}
              {top3TitleTeams[1] && (
                <Link
                  href={`/teams/${encodeURIComponent(top3TitleTeams[1].team)}`}
                  className="group flex flex-col items-center p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-slate-400/40 transition-all cursor-pointer"
                >
                  <div className="relative mb-1">
                    <div className="p-1 rounded-xl border border-slate-400/30 bg-[#12141F]">
                      <TeamCrest team={top3TitleTeams[1].team} size={30} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-300 text-slate-900 font-mono font-black text-[9px] flex items-center justify-center border border-white shadow">
                      2
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px] group-hover:text-slate-200 transition-colors">
                    {top3TitleTeams[1].team}
                  </span>
                  <span className="text-xs font-black text-slate-200 font-mono">
                    {top3TitleTeams[1].champion_pct.toFixed(1)}%
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                    Silver
                  </span>
                </Link>
              )}

              {/* #1 Platform (Center - Man City Gold Favorite) */}
              {top3TitleTeams[0] && (
                <Link
                  href={`/teams/${encodeURIComponent(top3TitleTeams[0].team)}`}
                  className="group flex flex-col items-center p-2 rounded-xl bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-400/30 hover:border-amber-400/60 shadow-sm transition-all cursor-pointer relative"
                >
                  <div className="relative mb-1">
                    <div className="p-1 rounded-xl border border-amber-400/50 bg-[#12141F]">
                      <TeamCrest team={top3TitleTeams[0].team} size={32} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-mono font-black text-[9px] flex items-center justify-center border border-white/90 shadow">
                      1
                    </span>
                  </div>
                  <span className="text-xs font-black text-white truncate max-w-[85px] group-hover:text-amber-300 transition-colors">
                    {top3TitleTeams[0].team}
                  </span>
                  <span className="text-xs font-black text-amber-300 font-mono">
                    {top3TitleTeams[0].champion_pct.toFixed(1)}%
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-amber-300/90 font-black bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/25">
                    Favorite
                  </span>
                </Link>
              )}

              {/* #3 Platform (Right - Liverpool Bronze) */}
              {top3TitleTeams[2] && (
                <Link
                  href={`/teams/${encodeURIComponent(top3TitleTeams[2].team)}`}
                  className="group flex flex-col items-center p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-700/40 transition-all cursor-pointer"
                >
                  <div className="relative mb-1">
                    <div className="p-1 rounded-xl border border-amber-700/30 bg-[#12141F]">
                      <TeamCrest team={top3TitleTeams[2].team} size={30} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-700 text-amber-100 font-mono font-black text-[9px] flex items-center justify-center border border-amber-400/80 shadow">
                      3
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[80px] group-hover:text-amber-200 transition-colors">
                    {top3TitleTeams[2].team}
                  </span>
                  <span className="text-xs font-black text-amber-200/90 font-mono">
                    {top3TitleTeams[2].champion_pct.toFixed(1)}%
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-amber-400/80 font-bold">
                    Bronze
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side: Editorial Analysis (dir="rtl") */}
          <div dir="rtl" className="order-1 lg:order-2 flex-1 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF87] shrink-0" />
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-white">
                  رؤية المحلل • ملاحظات ختام الجولة 6
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                قراءة تكتيكية ونسب احتمالات (10,000 محاكاة)
              </span>
            </div>
            <p className="text-slate-100 text-sm leading-relaxed font-sans font-medium">
              مانشستر سيتي يعزز صدارته للترشيحات بنسبة{" "}
              <span dir="ltr" className="text-[#00FF87] font-bold">
                78.2%
              </span>{" "}
              لحسم اللقب بعد ختام الجولة 6 بالعلامة الكاملة (18 نقطة)، بينما يحتفظ{" "}
              <span dir="ltr" className="text-white font-semibold">
                Arsenal
              </span>{" "}
              بنسبة{" "}
              <span dir="ltr" className="text-slate-200 font-bold">
                19.5%
              </span>{" "}
              كأقرب الملاحقين وفق محاكاة{" "}
              <span dir="ltr" className="text-slate-300 font-mono text-xs">
                Monte Carlo
              </span>
              ، مع اشتعال صراع المربع الذهبي بين برايتون، تشيلسي، وبرينتفورد.
            </p>
          </div>
        </div>
      </section>

      {/* Main Projections Table */}
      <section
        id="simulated-table"
        className="glass-panel rounded-3xl overflow-hidden border border-[#23293B] shadow-2xl scroll-mt-24 mt-4 sm:mt-6"
      >
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>Full 20-Team Probability Projections</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-normal">
                Click any row for confidence bands
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {displayMode === "odds"
                ? "Decimal odds format: Odds = 100 / Probability. Lower odds reflect higher simulated likelihood."
                : "Percentages represent empirical Monte Carlo finish rates out of 10,000 season runs."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Feature 2: Club Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your club..."
                className="w-full min-h-[44px] sm:min-h-0 bg-white/5 hover:bg-white/10 focus:bg-[#12121C] border border-white/10 focus:border-[#04F5FF] rounded-xl pl-8.5 pr-7 py-2 sm:py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all flex items-center"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Switch: % Probabilities vs Decimal Odds */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDisplayMode("percentage")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  displayMode === "percentage"
                    ? "bg-gradient-to-r from-[#3D195B] to-[#E90052] text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                % Probabilities
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("odds")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  displayMode === "odds"
                    ? "bg-gradient-to-r from-[#00FF85] to-[#04F5FF] text-black shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Decimal Odds
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF85]"></span>
                <span className="hidden sm:inline">Title</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#04F5FF]"></span>
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
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse gap-4"
              >
                <div className="flex items-center gap-3 w-52 shrink-0">
                  <div className="w-6 h-4 bg-white/10 rounded font-mono text-xs"></div>
                  <div className="w-7 h-7 rounded-full bg-white/10 shrink-0"></div>
                  <div className="w-28 h-4 bg-white/10 rounded"></div>
                </div>
                <div className="hidden sm:block flex-1 max-w-[140px] space-y-1">
                  <div className="w-12 h-3 bg-white/10 rounded ml-auto"></div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
                </div>
                <div className="hidden md:block flex-1 max-w-[140px] space-y-1">
                  <div className="w-12 h-3 bg-white/10 rounded ml-auto"></div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
                </div>
                <div className="hidden lg:block flex-1 max-w-[140px] space-y-1">
                  <div className="w-12 h-3 bg-white/10 rounded ml-auto"></div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
                </div>
                <div className="w-12 h-4 bg-white/10 rounded shrink-0"></div>
                <div className="w-20 h-6 bg-white/10 rounded-full shrink-0"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-slate-500 mt-2">
              Ensure FastAPI is running on http://127.0.0.1:8000
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full select-none -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-sm border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-[#23293B] text-[11px] uppercase tracking-wider text-slate-300 bg-[#141824] font-bold select-none">
                  {/* Sticky Rank Header */}
                  <th
                    className="py-3.5 px-2 sm:px-3 cursor-pointer hover:text-white sticky left-0 z-30 bg-[#141824] w-16 sm:w-20 select-none"
                    onClick={() => handleSort("rank")}
                    title="Rank & Momentum Trajectory (Simulated vs Official GW6)"
                  >
                    <div className="flex items-center gap-1 text-slate-300 hover:text-white">
                      # <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  {/* Sticky Team Header */}
                  <th
                    className="py-3.5 px-3 sm:px-4 cursor-pointer hover:text-white sticky left-16 sm:left-20 z-30 bg-[#141824] border-r border-[#23293B] shadow-[4px_0_12px_rgba(0,0,0,0.5)] min-w-[150px] sm:min-w-[200px] select-none"
                    onClick={() => handleSort("team")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 hover:text-white">
                      Team <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("champion_pct")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 hover:text-white">
                      {displayMode === "odds" ? "Champion Odds" : "Champion %"}{" "}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("top4_pct")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 hover:text-white">
                      {displayMode === "odds" ? "Top 4 Odds" : "Top 4 %"}{" "}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("relegation_pct")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 hover:text-white">
                      {displayMode === "odds" ? "Relegation Odds" : "Relegation %"}{" "}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white text-right"
                    onClick={() => handleSort("avg_points")}
                  >
                    <div className="flex items-center justify-end gap-1 text-slate-300 hover:text-white">
                      Avg Pts <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 group relative text-slate-300">
                      <span>Range Band</span>
                      <Info className="w-3 h-3 text-slate-400 hover:text-slate-200 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 rounded-lg bg-[#1E1E34] border border-white/20 text-[10px] text-slate-200 shadow-xl z-30 font-normal pointer-events-none normal-case tracking-normal text-center">
                        10th-to-90th percentile finish range across 10,000 simulations.
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 px-4 text-center text-slate-400 space-y-2 bg-[#141824]"
                    >
                      <p className="text-sm font-semibold text-slate-300">
                        No clubs found matching &ldquo;{searchQuery}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-[#00FF87] hover:underline font-medium cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    </td>
                  </tr>
                )}

                {filteredData.map((row) => {
                  const isExpanded = expandedTeam === row.team;
                  const isSearchMatch =
                    searchQuery.trim().length > 0 &&
                    row.team
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase().trim());

                  const stickyBg = isExpanded
                    ? "bg-[#1E2538]"
                    : isSearchMatch
                    ? "bg-[#1A2636]"
                    : "bg-[#141824]";

                  return (
                    <React.Fragment key={row.team}>
                      <tr
                        onClick={() =>
                          setExpandedTeam(isExpanded ? null : row.team)
                        }
                        className={`hover:bg-white/[0.04] transition-colors cursor-pointer group ${
                          isExpanded
                            ? "bg-white/[0.04]"
                            : isSearchMatch
                            ? "bg-[#00FF87]/[0.08] ring-1 ring-[#00FF87]/40"
                            : ""
                        }`}
                      >
                        {/* Sticky Rank + Momentum & Trajectory Indicator */}
                        <td
                          className={`py-4 px-2 sm:px-3 font-mono font-bold sticky left-0 z-20 ${stickyBg} group-hover:bg-[#1E2538] transition-colors w-16 sm:w-20`}
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <span className="text-slate-200 text-xs sm:text-sm font-black w-3.5 sm:w-4 text-right shrink-0">
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
                                      <ChevronUp className="w-3 h-3 stroke-[3] text-emerald-400 shrink-0" />
                                    )}
                                    {momentum.type === "negative" && (
                                      <ChevronDown className="w-3 h-3 stroke-[3] text-rose-400 shrink-0" />
                                    )}
                                    {momentum.type === "steady" && (
                                      <Minus className="w-2.5 h-2.5 stroke-[3] text-slate-400 shrink-0" />
                                    )}
                                    <span>{momentum.label}</span>
                                  </span>

                                  {/* Sleek Rich Tooltip */}
                                  <span className="absolute bottom-full left-0 mb-2 hidden group-hover/delta:block w-56 sm:w-64 p-3 rounded-xl bg-[#121222]/95 border border-white/20 text-[10px] sm:text-[11px] font-sans font-normal text-slate-200 shadow-2xl z-50 pointer-events-none normal-case tracking-normal text-left whitespace-normal backdrop-blur-md">
                                    <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
                                      <span className="font-extrabold text-white text-xs flex items-center gap-1">
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

                                    <p className="text-slate-300 leading-relaxed mb-2">
                                      {momentum.description}
                                    </p>

                                    {/* 5-Match Form sequence */}
                                    <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[9px]">
                                      <span className="text-slate-400 font-medium">Recent 5 Form:</span>
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
                                        <span className="text-slate-400 ml-1">
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
                          className={`py-4 px-3 sm:px-4 font-bold text-white sticky left-16 sm:left-20 z-20 ${stickyBg} group-hover:bg-[#1E2538] transition-colors border-r border-[#23293B] shadow-[4px_0_12px_rgba(0,0,0,0.5)] min-w-[150px] sm:min-w-[200px]`}
                        >
                          <div className="flex items-center gap-3">
                            <TeamCrest team={row.team} size={30} />
                            <Link
                              href={`/teams/${encodeURIComponent(row.team)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-[#00FF87] transition-colors flex items-center gap-1.5 group/link truncate"
                            >
                              <span className="truncate">{row.team}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                          </div>
                        </td>

                        {/* Champion % / Odds */}
                        <td className="py-4 px-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              {displayMode === "odds" ? (
                                <span
                                  className={
                                    row.champion_pct > 0.05
                                      ? "font-bold text-[#00FF85]"
                                      : "text-slate-500"
                                  }
                                >
                                  {formatCellOdds(row.champion_pct)}
                                </span>
                              ) : (
                                <AnimatedNumber
                                  value={row.champion_pct}
                                  decimals={1}
                                  suffix="%"
                                  className={
                                    row.champion_pct > 0.05
                                      ? "font-bold text-[#00FF85]"
                                      : "text-slate-500"
                                  }
                                />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full animate-grow ${getBarColor(
                                  "champ",
                                  row.champion_pct
                                )}`}
                                style={{
                                  width: `${Math.max(
                                    row.champion_pct,
                                    row.champion_pct > 0 ? 2 : 0
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Top 4 % / Odds */}
                        <td className="py-4 px-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              {displayMode === "odds" ? (
                                <span
                                  className={
                                    row.top4_pct > 50
                                      ? "font-bold text-[#04F5FF]"
                                      : row.top4_pct > 0.05
                                      ? "text-slate-300"
                                      : "text-slate-500"
                                  }
                                >
                                  {formatCellOdds(row.top4_pct)}
                                </span>
                              ) : (
                                <AnimatedNumber
                                  value={row.top4_pct}
                                  decimals={1}
                                  suffix="%"
                                  className={
                                    row.top4_pct > 50
                                      ? "font-bold text-[#04F5FF]"
                                      : "text-slate-400"
                                  }
                                />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full animate-grow ${getBarColor(
                                  "top4",
                                  row.top4_pct
                                )}`}
                                style={{ width: `${row.top4_pct}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Relegation % / Odds */}
                        <td className="py-4 px-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              {displayMode === "odds" ? (
                                <span
                                  className={
                                    row.relegation_pct > 15
                                      ? "font-bold text-[#E90052]"
                                      : row.relegation_pct > 0.05
                                      ? "text-slate-300"
                                      : "text-slate-500"
                                  }
                                >
                                  {formatCellOdds(row.relegation_pct)}
                                </span>
                              ) : (
                                <AnimatedNumber
                                  value={row.relegation_pct}
                                  decimals={1}
                                  suffix="%"
                                  className={
                                    row.relegation_pct > 15
                                      ? "font-bold text-[#E90052]"
                                      : "text-slate-500"
                                  }
                                />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full animate-grow ${getBarColor(
                                  "releg",
                                  row.relegation_pct
                                )}`}
                                style={{ width: `${row.relegation_pct}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Avg Points */}
                        <td className="py-4 px-4 text-right font-mono font-bold text-white">
                          <AnimatedNumber
                            value={row.avg_points}
                            decimals={1}
                          />
                        </td>

                        {/* Range Band Badge + Expand trigger */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-2 justify-center">
                            {row.points_p10 !== undefined && row.points_p90 !== undefined && (
                              <span
                                title="Floor to Ceiling finish range across 10,000 simulations (P10 - P90)"
                                className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:border-[#04F5FF]/30 transition-colors"
                              >
                                {Math.min(row.points_p10, row.points_p90).toFixed(0)} – {Math.max(row.points_p10, row.points_p90).toFixed(0)} pts
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label="Expand confidence bands"
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#04F5FF]" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Confidence Bands Visual */}
                      {isExpanded && (
                        <tr className="bg-black/40 border-b border-white/10">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/5">
                              {/* Official Gameweek 6 Standings Snapshot */}
                              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-extrabold text-white uppercase tracking-wider text-[11px] bg-white/10 px-2 py-0.5 rounded">
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
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-300">
                                    Table Rank: <strong className="text-white">#{row.current_rank ?? row.rank}</strong>
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-300">
                                    Matches Played: <strong className="text-white">{row.played ?? 6}</strong>
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 font-mono text-[11px]">
                                  <span className="text-slate-300"><strong className="text-emerald-400">{row.wins ?? 0}</strong>W</span>
                                  <span className="text-slate-300"><strong className="text-amber-400">{row.draws ?? 0}</strong>D</span>
                                  <span className="text-slate-300"><strong className="text-rose-400">{row.losses ?? 0}</strong>L</span>
                                  <span className="text-slate-600 hidden sm:inline">|</span>
                                  <span className="text-slate-300">GF: <strong className="text-white">{row.gf ?? 0}</strong></span>
                                  <span className="text-slate-300">GA: <strong className="text-white">{row.ga ?? 0}</strong></span>
                                  <span className="text-slate-300">
                                    GD: <strong className={((row.gd ?? 0) >= 0) ? "text-[#00FF85]" : "text-[#E90052]"}>
                                      {((row.gd ?? 0) > 0) ? `+${row.gd}` : (row.gd ?? 0)}
                                    </strong>
                                  </span>
                                  <span className="text-slate-600 hidden sm:inline">|</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-[#00FF85]/15 border border-[#00FF85]/35 text-[#00FF85] font-black">
                                    {row.points ?? 0} Pts
                                  </span>
                                </div>
                              </div>

                              {/* Points Confidence Band */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                                  <div className="flex items-center gap-1.5 group relative">
                                    <span>Points Range (Floor to Ceiling)</span>
                                    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-[#04F5FF] cursor-help" />
                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2.5 rounded-xl bg-[#12121C] border border-white/15 text-[11px] text-slate-300 shadow-2xl z-30 font-normal pointer-events-none text-left">
                                      10th-to-90th percentile finish range across 10,000 simulations, capturing 80% of expected outcomes while filtering extreme anomalies.
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#04F5FF]/10 text-[#04F5FF] font-mono text-xs font-bold border border-[#04F5FF]/20">
                                    {Math.min(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} – {Math.max(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} Pts
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-medium">Floor / Worst Case</span>
                                    <span className="font-mono font-bold text-slate-300 text-sm">
                                      {Math.min(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} pts
                                    </span>
                                    <span className="text-[9px] text-slate-500 block font-mono">P10</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#04F5FF]/10 border border-[#04F5FF]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#04F5FF] block font-bold">Projected</span>
                                    <span className="font-mono font-black text-white text-sm">{row.points_p50?.toFixed(0)} pts</span>
                                    <span className="text-[9px] text-[#04F5FF]/80 block font-mono">P50 (Median)</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#00FF85] block font-bold">Ceiling / Best Case</span>
                                    <span className="font-mono font-black text-white text-sm">
                                      {Math.max(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)} pts
                                    </span>
                                    <span className="text-[9px] text-[#00FF85]/80 block font-mono">P90</span>
                                  </div>
                                </div>

                                {/* Range Visual Bar */}
                                <div className="h-3 bg-white/10 rounded-full relative overflow-hidden">
                                  <div
                                    className="absolute h-full bg-gradient-to-r from-[#3D195B] via-[#04F5FF] to-[#00FF85] rounded-full"
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
                                <p className="text-[11px] text-slate-400">
                                  80% of simulations finish between{" "}
                                  <strong className="text-white">
                                    {Math.min(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)}
                                  </strong>{" "}
                                  (worst case) and{" "}
                                  <strong className="text-white">
                                    {Math.max(row.points_p10 || 0, row.points_p90 || 0)?.toFixed(0)}
                                  </strong>{" "}
                                  points (best case).
                                </p>
                              </div>

                              {/* Position Confidence Band */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                                  <div className="flex items-center gap-1.5 group relative">
                                    <span>Finish Position (Ceiling to Floor)</span>
                                    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-[#00FF85] cursor-help" />
                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2.5 rounded-xl bg-[#12121C] border border-white/15 text-[11px] text-slate-300 shadow-2xl z-30 font-normal pointer-events-none text-left">
                                      10th-to-90th percentile finish range across 10,000 simulations (lower position number is better).
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#00FF85]/10 text-[#00FF85] font-mono text-xs font-bold border border-[#00FF85]/20">
                                    #{Math.min(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)} – #{Math.max(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="p-2 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#00FF85] block font-bold">Ceiling / Best Case</span>
                                    <span className="font-mono font-black text-white text-sm">
                                      #{Math.min(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)}
                                    </span>
                                    <span className="text-[9px] text-[#00FF85]/80 block font-mono">P10</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#04F5FF]/10 border border-[#04F5FF]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#04F5FF] block font-bold">Projected</span>
                                    <span className="font-mono font-black text-white text-sm">#{row.position_p50?.toFixed(0)}</span>
                                    <span className="text-[9px] text-[#04F5FF]/80 block font-mono">P50 (Median)</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-medium">Floor / Worst Case</span>
                                    <span className="font-mono font-bold text-slate-300 text-sm">
                                      #{Math.max(row.position_p10 || 1, row.position_p90 || 20)?.toFixed(0)}
                                    </span>
                                    <span className="text-[9px] text-slate-500 block font-mono">P90</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-2">
                                  <p className="text-[11px] text-slate-400">
                                    Projected to finish <strong className="text-white">#{row.position_p50?.toFixed(0)}</strong> on average.
                                  </p>
                                  <Link
                                    href={`/teams/${encodeURIComponent(row.team)}`}
                                    className="text-xs font-semibold text-[#04F5FF] hover:underline flex items-center gap-1 shrink-0"
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
        )}
      </section>
    </div>
  );
}
