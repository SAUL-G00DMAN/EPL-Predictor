"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  User,
  ArrowRight,
  Trophy,
  Swords,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { HeadToHeadComparison } from "@/components/HeadToHeadComparison";
import { TEAMS_DATA } from "@/data/teams";
import { fetchTablePredictions, getCachedTableData } from "@/data/cachedApi";

export default function TeamsIndexPage() {
  const [tableData, setTableData] = useState<Record<string, any>>(() => {
    const cached = getCachedTableData();
    if (!cached) return {};
    const map: Record<string, any> = {};
    cached.forEach((row: any) => {
      map[row.team] = row;
    });
    return map;
  });
  const [compareOpen, setCompareOpen] = useState<boolean>(true);
  const [teamA, setTeamA] = useState<string>("Man City");
  const [teamB, setTeamB] = useState<string>("Chelsea");

  useEffect(() => {
    fetchTablePredictions()
      .then((table) => {
        const map: Record<string, any> = {};
        table.forEach((row: any) => {
          map[row.team] = row;
        });
        setTableData(map);
      })
      .catch(() => {});
  }, []);

  const teams = Object.values(TEAMS_DATA);
  const allTeamNames = Object.keys(TEAMS_DATA);

  const handleSwap = () => {
    const prevA = teamA;
    setTeamA(teamB);
    setTeamB(prevA);
  };

  const handleSelectForCompare = (name: string) => {
    if (name === teamA) return;
    if (name === teamB) {
      handleSwap();
      return;
    }
    setTeamB(name);
    setCompareOpen(true);
    // Smooth-scroll up to comparison studio
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header with Title and Compare Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/10 light:border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D195B]/40 light:bg-purple-50 border border-[#E90052]/30 light:border-purple-200 text-[#E90052] light:text-[#38003C] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-[#00FF85] light:text-emerald-600" />
            Club Directory & Analytics
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--pl-text-primary)] tracking-tight">
            2026-27 Premier League Team Profiles
          </h1>
        </div>

        {/* Toggle Head-to-Head Comparison Button */}
        <button
          type="button"
          onClick={() => setCompareOpen((prev) => !prev)}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 ${
            compareOpen
              ? "bg-gradient-to-r from-[#38BDF8] to-[#00FF85] light:from-[#38003C] light:to-[#6B1D76] text-black light:text-white shadow-[#38BDF8]/20 light:shadow-purple-900/20 hover:scale-105"
              : "bg-white/10 light:bg-slate-100 hover:bg-white/15 light:hover:bg-slate-200 text-white light:text-slate-800 border border-white/15 light:border-slate-300"
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>{compareOpen ? "Hide Head-to-Head" : "Compare Teams"}</span>
          {compareOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Head-to-Head Comparison Studio (Radar Overlay + Spec Comparison) */}
      {compareOpen && (
        <section className="glass-panel light:bg-white rounded-3xl p-5 sm:p-6 md:p-8 border border-white/15 light:border-slate-200 shadow-xl light:shadow-[0_4px_20px_-2px_rgba(56,0,60,0.05)] relative overflow-hidden space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-top-4 duration-300 glow-blue">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E90052]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header & Team Selectors */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10 light:border-slate-200 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#38BDF8]/10 light:bg-sky-50 border border-[#38BDF8]/30 light:border-sky-300 text-[#38BDF8] light:text-[#0284C7] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-[#00FF85] light:text-emerald-600" />
                Tactical Radar Overlay Studio
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--pl-text-primary)] tracking-tight">
                Head-to-Head Comparison
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
                Superimpose two clubs on the same radar coordinate space to analyze tactical match-ups.
              </p>
            </div>

            {/* Selector Controls: Team A vs Team B */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Team A Picker (Blue) */}
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#38BDF8]/10 light:bg-sky-50 border border-[#38BDF8]/40 light:border-sky-300 shadow-sm">
                <TeamCrest team={teamA} size={32} />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#38BDF8] light:text-[#0284C7]">
                    Team A (Blue)
                  </span>
                  <select
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    className="bg-transparent text-white light:text-slate-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    {allTeamNames.map((name) => (
                      <option key={name} value={name} className="bg-[#12121C] light:bg-white light:text-slate-900">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwap}
                className="w-8 h-8 rounded-lg bg-white/5 light:bg-slate-100 hover:bg-white/15 light:hover:bg-slate-200 border border-white/10 light:border-slate-300 flex items-center justify-center text-slate-300 light:text-slate-700 hover:text-white light:hover:text-[#19001B] transition-all cursor-pointer hover:rotate-180 duration-300"
                title="Swap Team A and Team B"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              {/* Team B Picker (Magenta) */}
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#E90052]/10 light:bg-rose-50 border border-[#E90052]/40 light:border-rose-300 shadow-sm">
                <TeamCrest team={teamB} size={32} />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#E90052] light:text-rose-700">
                    Team B (Magenta)
                  </span>
                  <select
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    className="bg-transparent text-white light:text-slate-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    {allTeamNames.map((name) => (
                      <option key={name} value={name} className="bg-[#12121C] light:bg-white light:text-slate-900">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Comparison Arena: Streamlined 5 Battle Stats + Radar */}
          <HeadToHeadComparison
            teamA={teamA}
            teamB={teamB}
            showHeader={false}
            className="border-0 p-0 shadow-none bg-transparent"
          />
        </section>
      )}

      {/* Feature: Magnetic Scroll Nudge to Club Directory */}
      <div className="flex flex-col items-center justify-center pt-1 pb-1 relative z-10">
        <button
          type="button"
          onClick={() => {
            document.getElementById("club-grid")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="relative bg-[#161628]/90 light:bg-white hover:bg-[#1E1E36] light:hover:bg-slate-50 border border-white/15 light:border-slate-200 hover:border-[#38BDF8]/60 light:hover:border-[#38003C]/40 px-5 sm:px-6 py-2.5 rounded-full shadow-lg light:shadow-md shadow-black/50 light:shadow-slate-300/40 transition-all duration-300 group cursor-pointer flex items-center gap-2.5 sm:gap-3 mx-auto animate-bounce hover:animate-none"
        >
          {/* Ambient blue glow pulse behind it */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#38BDF8]/30 via-[#00FF87]/20 to-[#38BDF8]/30 light:from-purple-200/50 light:via-pink-200/50 light:to-purple-200/50 blur-md opacity-75 group-hover:opacity-100 transition-opacity -z-10 animate-pulse pointer-events-none" />

          {/* Glowing badge */}
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#38BDF8]/15 light:bg-[#38003C]/10 border border-[#38BDF8]/40 light:border-[#38003C]/20 text-[#38BDF8] light:text-[#38003C] shadow-[0_0_10px_rgba(56,189,248,0.2)] light:shadow-none shrink-0">
            CLUB DIRECTORY
          </span>

          {/* Label */}
          <span className="text-xs sm:text-sm font-semibold text-slate-200 light:text-slate-800 group-hover:text-white light:group-hover:text-[#19001B] transition-colors">
            Browse All 20 Premier League Clubs Below
          </span>

          {/* Downward Chevron with broadcast royal blue glow */}
          <ChevronDown className="w-4 h-4 text-[#38BDF8] light:text-[#38003C] group-hover:translate-y-1 transition-transform drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] light:drop-shadow-none shrink-0" />
        </button>

        {/* Visual Connector Gradient Line (32px = h-8) */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#38BDF8]/60 to-transparent mx-auto mt-2" />
      </div>

      {/* Grid of 20 Teams */}
      <div id="club-grid" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white light:text-[#19001B] flex items-center gap-2">
            <span>All 20 Premier League Clubs</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 light:bg-slate-100 text-slate-400 light:text-slate-600 font-normal">
              Click to view profile or compare
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((t) => {
            const stats = tableData[t.name];
            const isSelectedA = teamA === t.name;
            const isSelectedB = teamB === t.name;

            return (
              <div
                key={t.name}
                className={`glass-panel light:bg-white light:border-slate-200 light:shadow-sm p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group ${
                  isSelectedA
                    ? "border-[#38BDF8] light:border-sky-500 bg-[#38BDF8]/[0.08] light:bg-sky-50 shadow-lg shadow-[#38BDF8]/15 light:shadow-sm"
                    : isSelectedB
                    ? "border-[#E90052] light:border-rose-500 bg-[#E90052]/[0.08] light:bg-rose-50 shadow-lg shadow-[#E90052]/15 light:shadow-sm"
                    : "border-white/15 light:border-slate-200 hover:border-[#38BDF8]/50 light:hover:border-slate-300 bg-[#1E1E34]/90 light:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <TeamCrest team={t.name} size={48} />
                    <div className="flex items-center gap-2">
                      {stats && (
                        <span className="text-xs font-bold font-mono tabular-nums px-2.5 py-1 rounded-full bg-emerald-950/50 light:bg-emerald-50 border border-[#00FF85]/40 light:border-emerald-300 text-[#00FF85] light:text-emerald-700 shadow-sm">
                          #{stats.rank} Proj.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="text-lg font-black text-white light:text-[#19001B] group-hover:text-[#38BDF8] light:group-hover:text-[#0284C7] transition-colors">
                      {t.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 light:text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 light:text-slate-500" />
                      <span>{t.manager}</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats footer & Action Buttons */}
                <div className="mt-5 pt-4 border-t border-white/15 light:border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-300 light:text-slate-500 font-medium">Title Odds: </span>
                      <span className="font-bold text-white light:text-slate-900 font-mono tabular-nums">
                        {stats ? `${stats.champion_pct.toFixed(1)}%` : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-300 light:text-slate-500 font-medium">Elo: </span>
                      <span className="font-bold text-white light:text-slate-900 font-mono tabular-nums">
                        {t.elo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/teams/${encodeURIComponent(t.name)}`}
                      className="flex-1 py-1.5 px-3 rounded-xl text-center text-xs font-bold bg-[#2A2A46] light:bg-slate-100 hover:bg-[#343458] light:hover:bg-slate-200 text-white light:text-slate-800 border border-white/15 light:border-slate-200 transition-all"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSelectForCompare(t.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelectedA
                          ? "bg-[#38BDF8] text-slate-950 font-extrabold shadow-sm"
                          : isSelectedB
                          ? "bg-[#E90052] text-white font-extrabold shadow-sm"
                          : "bg-[#2A2A46] light:bg-slate-100 hover:bg-[#343458] light:hover:bg-slate-200 text-slate-100 light:text-slate-700 hover:text-white light:hover:text-[#19001B] border border-white/15 light:border-slate-200"
                      }`}
                      title={`Select ${t.name} for head-to-head comparison`}
                    >
                      <Swords className="w-3 h-3 text-[#38BDF8] light:text-[#0284C7]" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
