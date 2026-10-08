"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Info,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { AnimatedNumber } from "@/components/AnimatedNumber";

interface TeamProjection {
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
  const [data, setData] = useState<TeamProjection[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetch(`${API_BASE_URL}/predictions/table?include_bands=true`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json.table || []);
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

  // Featured widget: Top 4 teams strictly ranked by Champion_%
  const titleRaceTeams = useMemo(() => {
    return [...data]
      .sort((a, b) => b.champion_pct - a.champion_pct)
      .slice(0, 4);
  }, [data]);

  // Featured widget: Bottom 3 teams strictly ranked by Relegation_%
  const relegationBattleTeams = useMemo(() => {
    return [...data]
      .sort((a, b) => b.relegation_pct - a.relegation_pct)
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
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Streamlined Top Header / Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-slate-200 text-xs font-semibold shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Updated through Matchweek 5 • 2026-27 Season</span>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-panel p-5 rounded-2xl border border-white/5 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-white/10 rounded"></div>
                <div className="w-5 h-5 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-8 w-36 bg-white/10 rounded"></div>
              <div className="h-3 w-24 bg-white/5 rounded"></div>
            </div>
          ))
        ) : (
          <>
            {/* 1. Title Favorite */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-[#00FF85] bg-gradient-to-br from-[#1E1E34] to-[#122A22]/90 border border-white/15 shadow-xl shadow-[#00FF85]/10 hover:border-[#00FF85]/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#00FF85]">
                  Title Favorite
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#00FF85]/15 flex items-center justify-center border border-[#00FF85]/30">
                  <Trophy className="w-4 h-4 text-[#00FF85]" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {data[0]?.team || "Man City"}
                </span>
                <span className="text-base font-black text-[#00FF85] font-mono">
                  {data[0]?.champion_pct ? `${data[0].champion_pct.toFixed(1)}%` : "68.1%"}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium">
                Proj. {data[0]?.avg_points ? data[0].avg_points.toFixed(1) : "--"} pts
              </p>
            </div>

            {/* 2. Top 4 Race Cutoff */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-[#04F5FF] bg-gradient-to-br from-[#1E1E34] to-[#102434]/90 border border-white/15 shadow-xl shadow-[#04F5FF]/10 hover:border-[#04F5FF]/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#04F5FF]">
                  Top 4 Race Cutoff
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#04F5FF]/15 flex items-center justify-center border border-[#04F5FF]/30">
                  <TrendingUp className="w-4 h-4 text-[#04F5FF]" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {data[3]?.team || "Chelsea"}
                </span>
                <span className="text-base font-black text-[#04F5FF] font-mono">
                  {data[3]?.top4_pct ? `${data[3].top4_pct.toFixed(1)}%` : "26.5%"}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium">
                4th spot threshold: ~58 pts
              </p>
            </div>

            {/* 3. Highest Relegation Risk */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-[#E90052] bg-gradient-to-br from-[#1E1E34] to-[#2E1220]/90 border border-white/15 shadow-xl shadow-[#E90052]/10 hover:border-[#E90052]/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#E90052]">
                  Highest Relegation Risk
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#E90052]/15 flex items-center justify-center border border-[#E90052]/30">
                  <AlertTriangle className="w-4 h-4 text-[#E90052]" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {relegationBattleTeams[0]?.team || data[data.length - 1]?.team || "Sunderland"}
                </span>
                <span className="text-base font-black text-[#E90052] font-mono">
                  {relegationBattleTeams[0]?.relegation_pct
                    ? `${relegationBattleTeams[0].relegation_pct.toFixed(1)}%`
                    : data[data.length - 1]?.relegation_pct
                    ? `${data[data.length - 1].relegation_pct.toFixed(1)}%`
                    : "28.6%"}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium">18th - 20th drop zone</p>
            </div>
          </>
        )}
      </section>

      {/* Editorial Feature: Analyst's Take */}
      <section
        dir="rtl"
        className="bg-[#181829] border border-slate-700/80 border-r-4 border-r-[#00FF85] rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden text-right"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-pulse shrink-0" />
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#00FF85]">
              رؤية المحلل • ملاحظات الجولة 5
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            قراءة تكتيكية ونسب احتمالات
          </span>
        </div>
        <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans font-medium">
          مانشستر سيتي يتصدر الترشيحات بنسبة{" "}
          <span dir="ltr" className="text-[#00FF85] font-semibold">
            68.1%
          </span>{" "}
          لحسم اللقب، لكن توزيعات محاكاة{" "}
          <span dir="ltr" className="text-[#04F5FF] font-mono">
            Monte Carlo
          </span>{" "}
          تظهر تقلبات حساسة في هوامش الحسم: المواجهات المباشرة ضد{" "}
          <span dir="ltr" className="text-white font-medium">
            Arsenal
          </span>{" "}
          و{" "}
          <span dir="ltr" className="text-white font-medium">
            Liverpool
          </span>{" "}
          تمثل مواجهات بست نقاط كفيلة بتقليص الفارق المتوقع لأدنى مستوياته.
        </p>
      </section>

      {/* Featured Highlights: Title Race & Relegation Battle */}
      {loading ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Title Race Podium Skeleton */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 animate-pulse">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10"></div>
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-white/10 rounded"></div>
                  <div className="h-3 w-48 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 px-1 sm:px-2 min-h-[220px]">
                {/* #2 Silver skeleton */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/10"></div>
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                  <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-white/5 border-t border-x border-white/10"></div>
                </div>

                {/* #1 Gold center skeleton */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30"></div>
                  <div className="h-4 w-20 bg-amber-500/20 rounded"></div>
                  <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-amber-500/10 border-t-2 border-x border-amber-500/30"></div>
                </div>

                {/* #3 Bronze skeleton */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/10"></div>
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                  <div className="w-full h-18 sm:h-22 rounded-t-2xl bg-white/5 border-t border-x border-white/10"></div>
                </div>
              </div>

              {/* #4 skeleton */}
              <div className="h-12 w-full rounded-xl bg-white/[0.02] border border-white/5"></div>
            </div>
          </div>

          {/* Relegation Battle Skeleton */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-[#E90052]/20 space-y-5 animate-pulse">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-[#E90052]/20"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-[#E90052]/20 rounded"></div>
                <div className="h-3 w-40 bg-white/5 rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#E90052]/[0.04] border border-[#E90052]/20 flex flex-col items-center space-y-3"
                >
                  <div className="w-11 h-11 rounded-full bg-white/10"></div>
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                  <div className="h-5 w-12 bg-[#E90052]/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : data.length > 0 ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Part 1: Title Race (Top 4 by Champion_%) */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 glow-cyan flex flex-col justify-between space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00FF85]/15 border border-[#00FF85]/30 flex items-center justify-center shadow-lg shadow-[#00FF85]/10">
                  <Trophy className="w-5 h-5 text-[#00FF85]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    Title Race
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                      Top 4 Contenders
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ranked by Monte Carlo Champion probability (Champion_%)
                  </p>
                </div>
              </div>
            </div>

            {/* Podium Visual: #2 (Left), #1 (Center, Tallest, Gold), #3 (Right) */}
            <div className="flex flex-col space-y-3 pt-2">
              <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 px-1 sm:px-2 min-h-[220px]">
                {/* #2 Platform (Left) */}
                {titleRaceTeams[1] && (
                  <Link
                    href={`/teams/${encodeURIComponent(titleRaceTeams[1].team)}`}
                    className="group flex flex-col items-center text-center animate-podium-2 cursor-pointer"
                  >
                    <div className="flex flex-col items-center space-y-1 pb-2 transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="relative">
                        <TeamCrest team={titleRaceTeams[1].team} size={46} />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-mono font-black text-[10px] flex items-center justify-center border border-white shadow">
                          2
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[125px] group-hover:text-[#04F5FF] transition-colors">
                        {titleRaceTeams[1].team}
                      </h4>
                      <span className="text-sm sm:text-base font-black text-slate-200 font-mono">
                        {titleRaceTeams[1].champion_pct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-800/90 via-slate-700/40 to-slate-700/20 border-t-2 border-x border-slate-400/40 shadow-lg flex flex-col items-center justify-start pt-2 sm:pt-3">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-300/70">
                        2nd
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                        Silver
                      </span>
                    </div>
                  </Link>
                )}

                {/* #1 Platform (Center - Tallest & Warm Gold Glow) */}
                {titleRaceTeams[0] && (
                  <Link
                    href={`/teams/${encodeURIComponent(titleRaceTeams[0].team)}`}
                    className="group flex flex-col items-center text-center animate-podium-1 relative z-10 cursor-pointer"
                  >
                    <div className="flex flex-col items-center space-y-1.5 pb-2.5 transition-transform duration-300 group-hover:-translate-y-1.5">
                      <div className="relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400">
                          <Trophy className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        </div>
                        <div className="p-1 rounded-full ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] bg-[#12121C]">
                          <TeamCrest team={titleRaceTeams[0].team} size={54} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-mono font-black text-xs flex items-center justify-center border-2 border-white shadow-lg">
                          1
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-white truncate max-w-[110px] sm:max-w-[150px] group-hover:text-amber-300 transition-colors">
                        {titleRaceTeams[0].team}
                      </h4>
                      <span className="text-lg sm:text-xl font-black text-amber-300 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                        {titleRaceTeams[0].champion_pct.toFixed(1)}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-amber-300/90 font-bold bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                        Favorite
                      </span>
                    </div>

                    <div className="w-full h-32 sm:h-38 rounded-t-2xl bg-gradient-to-t from-amber-950/80 via-amber-500/25 to-amber-400/20 border-t-2 border-x border-amber-400/80 glow-gold shadow-2xl flex flex-col items-center justify-start pt-2 sm:pt-3">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                        1st
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-200 font-black mt-0.5">
                        Champion
                      </span>
                    </div>
                  </Link>
                )}

                {/* #3 Platform (Right) */}
                {titleRaceTeams[2] && (
                  <Link
                    href={`/teams/${encodeURIComponent(titleRaceTeams[2].team)}`}
                    className="group flex flex-col items-center text-center animate-podium-3 cursor-pointer"
                  >
                    <div className="flex flex-col items-center space-y-1 pb-2 transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="relative">
                        <TeamCrest team={titleRaceTeams[2].team} size={42} />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-amber-100 font-mono font-black text-[10px] flex items-center justify-center border border-amber-400 shadow">
                          3
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[125px] group-hover:text-[#00FF85] transition-colors">
                        {titleRaceTeams[2].team}
                      </h4>
                      <span className="text-sm sm:text-base font-black text-amber-200/90 font-mono">
                        {titleRaceTeams[2].champion_pct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full h-18 sm:h-22 rounded-t-2xl bg-gradient-to-t from-amber-950/60 via-amber-900/30 to-amber-800/15 border-t-2 border-x border-amber-700/50 shadow-lg flex flex-col items-center justify-start pt-2">
                      <span className="text-lg sm:text-xl font-black font-mono text-amber-500/80">
                        3rd
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-amber-400/80 font-bold">
                        Bronze
                      </span>
                    </div>
                  </Link>
                )}
              </div>

              {/* #4 Entry: Lower "just missed it" entry below the podium */}
              {titleRaceTeams[3] && (
                <Link
                  href={`/teams/${encodeURIComponent(titleRaceTeams[3].team)}`}
                  className="group animate-podium-4 flex items-center justify-between p-2.5 sm:p-3 px-3.5 sm:px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-[#04F5FF]/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="font-mono text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                      #4
                    </span>
                    <TeamCrest team={titleRaceTeams[3].team} size={28} />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-[#04F5FF] transition-colors">
                        {titleRaceTeams[3].team}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        (just missed the podium)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      Champion:
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-[#04F5FF]">
                      {titleRaceTeams[3].champion_pct.toFixed(1)}%
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Part 2: Relegation Battle (Bottom 3 by Relegation_%) */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-[#E90052]/30 bg-[#E90052]/[0.02] glow-magenta flex flex-col justify-between space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E90052]/15 border border-[#E90052]/40 flex items-center justify-center shadow-lg shadow-[#E90052]/10">
                  <AlertTriangle className="w-5 h-5 text-[#E90052]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    Relegation Battle
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E90052]/15 text-[#E90052] border border-[#E90052]/30">
                      Drop Zone
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    3 teams with highest simulated relegation probability
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relegationBattleTeams.map((t, idx) => (
                <Link
                  key={t.team}
                  href={`/teams/${encodeURIComponent(t.team)}`}
                  className="group relative p-4 rounded-2xl bg-[#E90052]/[0.06] hover:bg-[#E90052]/[0.12] border border-[#E90052]/25 hover:border-[#E90052]/60 transition-all duration-200 flex flex-col items-center text-center space-y-2.5 shadow-sm"
                >
                  <div className="absolute top-2.5 left-2.5 text-[10px] font-mono font-black text-[#E90052] px-1.5 py-0.5 rounded bg-[#E90052]/15 border border-[#E90052]/30">
                    {idx === 0 ? "20th" : idx === 1 ? "19th" : "18th"}
                  </div>
                  <div className="pt-2 transform group-hover:scale-110 transition-transform duration-200">
                    <TeamCrest team={t.team} size={46} />
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-[#E90052] transition-colors">
                      {t.team}
                    </h4>
                    <div className="mt-1 flex flex-col items-center">
                      <span className="text-lg font-black text-[#E90052] font-mono">
                        {t.relegation_pct.toFixed(1)}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-red-300/80 font-bold">
                        Relegation %
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Feature: Magnetic Visual Scroll Nudge / Affordance */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1 relative z-10">
        <button
          type="button"
          onClick={() => {
            document.getElementById("simulated-table")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="relative bg-[#161628]/90 hover:bg-[#1E1E36] border border-white/15 hover:border-[#00FF85]/60 px-5 sm:px-6 py-2.5 rounded-full shadow-lg shadow-black/50 transition-all duration-300 group cursor-pointer flex items-center gap-2.5 sm:gap-3 mx-auto animate-bounce hover:animate-none"
        >
          {/* Ambient cyan/emerald glow pulse behind it */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#04F5FF]/30 via-[#00FF85]/30 to-[#04F5FF]/30 blur-md opacity-75 group-hover:opacity-100 transition-opacity -z-10 animate-pulse pointer-events-none" />

          {/* Glowing badge */}
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#00FF85]/15 border border-[#00FF85]/40 text-[#00FF85] shadow-[0_0_10px_rgba(0,255,133,0.2)] shrink-0">
            TABLE &amp; PROJECTIONS
          </span>

          {/* Label */}
          <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            Explore Full 20-Club Table &amp; Confidence Bands
          </span>

          {/* Downward Chevron */}
          <ChevronDown className="w-4 h-4 text-[#00FF85] group-hover:translate-y-1 transition-transform drop-shadow-[0_0_6px_rgba(0,255,133,0.8)] shrink-0" />
        </button>

        {/* Visual Connector Gradient Line */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#00FF85]/50 to-transparent mx-auto mt-2" />
      </div>

      {/* Main Projections Table */}
      <section
        id="simulated-table"
        className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl scroll-mt-24"
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
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-[#12121C] border border-white/10 focus:border-[#04F5FF] rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
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
                <tr className="border-b border-white/15 text-[11px] uppercase tracking-wider text-slate-300 bg-[#161628]/90 font-bold select-none">
                  {/* Sticky Rank Header */}
                  <th
                    className="py-3.5 px-3 sm:px-4 cursor-pointer hover:text-white sticky left-0 z-30 bg-[#1E1E34] w-16 sm:w-20 select-none"
                    onClick={() => handleSort("rank")}
                  >
                    <div className="flex items-center gap-1 text-slate-300 hover:text-white">
                      # <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  {/* Sticky Team Header */}
                  <th
                    className="py-3.5 px-3 sm:px-4 cursor-pointer hover:text-white sticky left-16 sm:left-20 z-30 bg-[#1E1E34] border-r border-white/15 shadow-[4px_0_12px_rgba(0,0,0,0.5)] min-w-[150px] sm:min-w-[200px] select-none"
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
                      className="py-12 px-4 text-center text-slate-400 space-y-2 bg-[#1E1E34]"
                    >
                      <p className="text-sm font-semibold text-slate-300">
                        No clubs found matching &ldquo;{searchQuery}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-[#04F5FF] hover:underline font-medium cursor-pointer"
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
                    ? "bg-[#252540]"
                    : isSearchMatch
                    ? "bg-[#152e3c]"
                    : "bg-[#1E1E34]";

                  return (
                    <React.Fragment key={row.team}>
                      <tr
                        onClick={() =>
                          setExpandedTeam(isExpanded ? null : row.team)
                        }
                        className={`hover:bg-white/[0.05] transition-colors cursor-pointer group ${
                          isExpanded
                            ? "bg-white/[0.05]"
                            : isSearchMatch
                            ? "bg-[#04F5FF]/[0.08] ring-1 ring-[#04F5FF]/50"
                            : ""
                        }`}
                      >
                        {/* Sticky Rank + Projected Movement Delta */}
                        <td
                          className={`py-4 px-3 sm:px-4 font-mono font-bold sticky left-0 z-20 ${stickyBg} group-hover:bg-[#282845] transition-colors w-16 sm:w-20`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-slate-200 text-xs sm:text-sm font-black w-4 text-right shrink-0">
                              {row.rank}
                            </span>
                            {(() => {
                              const delta =
                                row.current_rank != null
                                  ? row.current_rank - row.rank
                                  : 0;
                              let badgeStyle =
                                "text-slate-400 bg-white/5 border-white/10";
                              let text = "—";

                              if (delta > 0) {
                                badgeStyle =
                                  "text-[#00FF85] bg-[#00FF85]/15 border-[#00FF85]/35 shadow-xs shadow-[#00FF85]/20";
                                text = `↑ +${delta}`;
                              } else if (delta < 0) {
                                badgeStyle =
                                  "text-[#E90052] bg-[#E90052]/15 border-[#E90052]/35 shadow-xs shadow-[#E90052]/20";
                                text = `↓ -${Math.abs(delta)}`;
                              }

                              return (
                                <span
                                  className="group/delta relative inline-block cursor-help shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center text-[10px] font-black px-1.5 py-0.5 rounded border transition-transform group-hover/delta:scale-105 ${badgeStyle}`}
                                  >
                                    {text}
                                  </span>
                                  {/* Tooltip on hover */}
                                  <span className="absolute bottom-full left-0 mb-2 hidden group-hover/delta:block w-52 p-2.5 rounded-xl bg-[#121222] border border-white/20 text-[10px] font-sans font-normal text-slate-200 shadow-2xl z-50 pointer-events-none normal-case tracking-normal text-left whitespace-normal backdrop-blur-md">
                                    <span className="font-semibold text-white block mb-0.5">
                                      MW5: #{row.current_rank ?? row.rank} → Proj: #{row.rank}
                                    </span>
                                    Projected season trajectory: AI forecast vs current Matchweek 5 standing.
                                  </span>
                                </span>
                              );
                            })()}
                          </div>
                        </td>

                        {/* Sticky Team name + crest */}
                        <td
                          className={`py-4 px-3 sm:px-4 font-bold text-white sticky left-16 sm:left-20 z-20 ${stickyBg} group-hover:bg-[#282845] transition-colors border-r border-white/15 shadow-[4px_0_12px_rgba(0,0,0,0.5)] min-w-[150px] sm:min-w-[200px]`}
                        >
                          <div className="flex items-center gap-3">
                            <TeamCrest team={row.team} size={30} />
                            <Link
                              href={`/teams/${encodeURIComponent(row.team)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-[#04F5FF] transition-colors flex items-center gap-1.5 group/link truncate"
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
                                {row.points_p10.toFixed(0)} – {row.points_p90.toFixed(0)} pts
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
                          <td colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.03] p-5 rounded-2xl border border-white/5">
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
                                    {row.points_p10?.toFixed(0)} – {row.points_p90?.toFixed(0)} Pts
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-medium">Floor / Worst Case</span>
                                    <span className="font-mono font-bold text-slate-300 text-sm">{row.points_p10?.toFixed(0)} pts</span>
                                    <span className="text-[9px] text-slate-500 block font-mono">P10</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#04F5FF]/10 border border-[#04F5FF]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#04F5FF] block font-bold">Projected</span>
                                    <span className="font-mono font-black text-white text-sm">{row.points_p50?.toFixed(0)} pts</span>
                                    <span className="text-[9px] text-[#04F5FF]/80 block font-mono">P50 (Median)</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#00FF85] block font-bold">Ceiling / Best Case</span>
                                    <span className="font-mono font-black text-white text-sm">{row.points_p90?.toFixed(0)} pts</span>
                                    <span className="text-[9px] text-[#00FF85]/80 block font-mono">P90</span>
                                  </div>
                                </div>

                                {/* Range Visual Bar */}
                                <div className="h-3 bg-white/10 rounded-full relative overflow-hidden">
                                  <div
                                    className="absolute h-full bg-gradient-to-r from-[#3D195B] via-[#04F5FF] to-[#00FF85] rounded-full"
                                    style={{
                                      left: `${Math.max(
                                        ((row.points_p10 || 20) / 100) * 100,
                                        0
                                      )}%`,
                                      width: `${Math.min(
                                        (((row.points_p90 || 80) -
                                          (row.points_p10 || 20)) /
                                          100) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  80% of simulations finish between{" "}
                                  <strong className="text-white">{row.points_p10?.toFixed(0)}</strong> (worst case) and{" "}
                                  <strong className="text-white">{row.points_p90?.toFixed(0)}</strong> points (best case).
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
                                    #{row.position_p10?.toFixed(0)} – #{row.position_p90?.toFixed(0)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="p-2 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#00FF85] block font-bold">Ceiling / Best Case</span>
                                    <span className="font-mono font-black text-white text-sm">#{row.position_p10?.toFixed(0)}</span>
                                    <span className="text-[9px] text-[#00FF85]/80 block font-mono">P10</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-[#04F5FF]/10 border border-[#04F5FF]/30 space-y-0.5">
                                    <span className="text-[10px] text-[#04F5FF] block font-bold">Projected</span>
                                    <span className="font-mono font-black text-white text-sm">#{row.position_p50?.toFixed(0)}</span>
                                    <span className="text-[9px] text-[#04F5FF]/80 block font-mono">P50 (Median)</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-medium">Floor / Worst Case</span>
                                    <span className="font-mono font-bold text-slate-300 text-sm">#{row.position_p90?.toFixed(0)}</span>
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
