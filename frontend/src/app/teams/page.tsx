"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { RadarChart } from "@/components/RadarChart";
import { TEAMS_DATA, getTeamMetadata, TeamMetadata } from "@/data/teams";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function computeRadarMetrics(meta: TeamMetadata) {
  const normElo = Math.min(Math.max(((meta.elo - 1300) / 480) * 100, 10), 100);
  const normAtk = Math.min(
    Math.max(((meta.attackRating - -0.5) / 2.3) * 100, 10),
    100
  );
  // Defense is negative (e.g. -1.4 is better than -0.6)
  const normDef = Math.min(
    Math.max(((-meta.defenceRating - 0.5) / 1.0) * 100, 10),
    100
  );
  const normForm = Math.min(
    Math.max((meta.recentFormPoints / 15) * 100, 10),
    100
  );
  const normMgr = Math.min(
    Math.max(((meta.managerElo - 1400) / 350) * 100, 10),
    100
  );

  return [
    { label: "Elo Rating", value: normElo, rawValue: `${meta.elo.toFixed(0)}` },
    {
      label: "Attack (xG)",
      value: normAtk,
      rawValue: `${meta.attackRating.toFixed(2)}`,
    },
    {
      label: "Defence",
      value: normDef,
      rawValue: `${Math.abs(meta.defenceRating).toFixed(2)}`,
    },
    {
      label: "Recent Form",
      value: normForm,
      rawValue: `${meta.recentFormPoints}/15`,
    },
    {
      label: "Manager Elo",
      value: normMgr,
      rawValue: `${meta.managerElo.toFixed(0)}`,
    },
  ];
}

export default function TeamsIndexPage() {
  const [tableData, setTableData] = useState<Record<string, any>>({});
  const [compareOpen, setCompareOpen] = useState<boolean>(true);
  const [teamA, setTeamA] = useState<string>("Arsenal");
  const [teamB, setTeamB] = useState<string>("Man City");

  useEffect(() => {
    fetch(`${API_BASE_URL}/predictions/table?include_bands=true`)
      .then((res) => res.json())
      .then((json) => {
        if (json.table) {
          const map: Record<string, any> = {};
          json.table.forEach((row: any) => {
            map[row.team] = row;
          });
          setTableData(map);
        }
      })
      .catch(() => {});
  }, []);

  const teams = Object.values(TEAMS_DATA);
  const allTeamNames = Object.keys(TEAMS_DATA);

  const metaA = getTeamMetadata(teamA);
  const metaB = getTeamMetadata(teamB);
  const statsA = tableData[teamA];
  const statsB = tableData[teamB];

  const metricsA = useMemo(() => computeRadarMetrics(metaA), [metaA]);
  const metricsB = useMemo(() => computeRadarMetrics(metaB), [metaB]);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D195B]/40 border border-[#E90052]/30 text-[#E90052] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-[#00FF85]" />
            Club Directory & Analytics
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            2026-27 Premier League Team Profiles
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Tactical radar metrics, goal ratings, and simulation bands across all 20 clubs.
          </p>
        </div>

        {/* Toggle Head-to-Head Comparison Button */}
        <button
          type="button"
          onClick={() => setCompareOpen((prev) => !prev)}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 ${
            compareOpen
              ? "bg-gradient-to-r from-[#04F5FF] to-[#00FF85] text-black shadow-[#04F5FF]/20 hover:scale-105"
              : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
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
        <section className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/15 shadow-xl relative overflow-hidden space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-top-4 duration-300 glow-cyan">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#04F5FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E90052]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header & Team Selectors */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#04F5FF]/10 border border-[#04F5FF]/30 text-[#04F5FF] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-[#00FF85]" />
                Tactical Radar Overlay Studio
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Head-to-Head Comparison
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Superimpose two clubs on the same radar coordinate space to analyze tactical match-ups.
              </p>
            </div>

            {/* Selector Controls: Team A vs Team B */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Team A Picker (Cyan) */}
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#04F5FF]/10 border border-[#04F5FF]/40 shadow-sm">
                <TeamCrest team={teamA} size={32} />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#04F5FF]">
                    Team A (Cyan)
                  </span>
                  <select
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    {allTeamNames.map((name) => (
                      <option key={name} value={name} className="bg-[#12121C]">
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
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer hover:rotate-180 duration-300"
                title="Swap Team A and Team B"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              {/* Team B Picker (Magenta) */}
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#E90052]/10 border border-[#E90052]/40 shadow-sm">
                <TeamCrest team={teamB} size={32} />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#E90052]">
                    Team B (Magenta)
                  </span>
                  <select
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    {allTeamNames.map((name) => (
                      <option key={name} value={name} className="bg-[#12121C]">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Comparison Arena: Radar on Left, Specs Table on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
            {/* Left: Superimposed Dual Radar Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 max-w-full overflow-hidden">
              <div className="flex items-center gap-5 mb-2 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#04F5FF] shadow-[0_0_8px_rgba(4,245,255,0.8)]" />
                  <span className="text-white">{teamA}</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">VS</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E90052] shadow-[0_0_8px_rgba(233,0,82,0.8)]" />
                  <span className="text-white">{teamB}</span>
                </div>
              </div>

              <RadarChart
                metrics={metricsA}
                secondaryMetrics={metricsB}
                primaryColor="#04F5FF"
                secondaryColor="#E90052"
                size={280}
              />

              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Normalized 0–100 scale across 5 Dixon-Coles & Elo dimensions
              </p>
            </div>

            {/* Right: Side-by-Side Spec Comparison Table */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3 max-w-full overflow-hidden">
              <div className="overflow-x-auto w-full select-none -webkit-overflow-scrolling-touch rounded-xl border border-white/10">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold select-none">
                      <th className="py-2 px-3 sm:px-4">Metric</th>
                      <th className="py-2 px-3 sm:px-4 text-center text-[#04F5FF]">
                        <div className="flex items-center justify-center gap-1.5">
                          <TeamCrest team={teamA} size={18} />
                          <span className="font-extrabold">{teamA}</span>
                        </div>
                      </th>
                      <th className="py-2 px-3 sm:px-4 text-center text-[#E90052]">
                        <div className="flex items-center justify-center gap-1.5">
                          <TeamCrest team={teamB} size={18} />
                          <span className="font-extrabold">{teamB}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {/* Simulated Finish */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Simulated Finish
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold text-white">
                        {statsA ? `#${statsA.rank} (${statsA.avg_points.toFixed(1)} pts)` : "--"}
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold text-white">
                        {statsB ? `#${statsB.rank} (${statsB.avg_points.toFixed(1)} pts)` : "--"}
                      </td>
                    </tr>

                    {/* Title Probability */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Title Probability
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-extrabold text-[#00FF85]">
                        {statsA ? `${statsA.champion_pct.toFixed(1)}%` : "--"}
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-extrabold text-[#00FF85]">
                        {statsB ? `${statsB.champion_pct.toFixed(1)}%` : "--"}
                      </td>
                    </tr>

                    {/* Top 4 Probability */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Top 4 (UCL)
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold text-[#04F5FF]">
                        {statsA ? `${statsA.top4_pct.toFixed(1)}%` : "--"}
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold text-[#04F5FF]">
                        {statsB ? `${statsB.top4_pct.toFixed(1)}%` : "--"}
                      </td>
                    </tr>

                    {/* Relegation Probability */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Relegation Risk
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold text-[#E90052]">
                        {statsA ? `${statsA.relegation_pct.toFixed(1)}%` : "--"}
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold text-[#E90052]">
                        {statsB ? `${statsB.relegation_pct.toFixed(1)}%` : "--"}
                      </td>
                    </tr>

                    {/* Attack Rating */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Attack Rating (xG)
                      </td>
                      <td
                        className={`py-2 px-3 sm:px-4 text-center font-bold ${
                          metaA.attackRating >= metaB.attackRating
                            ? "text-[#04F5FF]"
                            : "text-slate-400"
                        }`}
                      >
                        {metaA.attackRating.toFixed(2)}
                      </td>
                      <td
                        className={`py-2 px-3 sm:px-4 text-center font-bold ${
                          metaB.attackRating >= metaA.attackRating
                            ? "text-[#E90052]"
                            : "text-slate-400"
                        }`}
                      >
                        {metaB.attackRating.toFixed(2)}
                      </td>
                    </tr>

                    {/* Defence Rating */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Defence Rating (Lower = Better)
                      </td>
                      <td
                        className={`py-2 px-3 sm:px-4 text-center font-bold ${
                          metaA.defenceRating <= metaB.defenceRating
                            ? "text-[#04F5FF]"
                            : "text-slate-400"
                        }`}
                      >
                        {metaA.defenceRating.toFixed(2)}
                      </td>
                      <td
                        className={`py-2 px-3 sm:px-4 text-center font-bold ${
                          metaB.defenceRating <= metaA.defenceRating
                            ? "text-[#E90052]"
                            : "text-slate-400"
                        }`}
                      >
                        {metaB.defenceRating.toFixed(2)}
                      </td>
                    </tr>

                    {/* Club Elo */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Club Elo
                      </td>
                      <td
                        className={`py-2 px-3 sm:px-4 text-center font-bold ${
                          metaA.elo >= metaB.elo ? "text-[#04F5FF]" : "text-slate-400"
                        }`}
                      >
                        {metaA.elo.toFixed(0)}
                      </td>
                      <td
                        className={`py-2 px-3 sm:px-4 text-center font-bold ${
                          metaB.elo >= metaA.elo ? "text-[#E90052]" : "text-slate-400"
                        }`}
                      >
                        {metaB.elo.toFixed(0)}
                      </td>
                    </tr>

                    {/* Manager & Manager Elo */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium">
                        Manager & Elo
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center text-xs text-slate-200 font-sans">
                        <div className="font-bold text-white">{metaA.manager}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          Elo: {metaA.managerElo.toFixed(0)}
                        </div>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center text-xs text-slate-200 font-sans">
                        <div className="font-bold text-white">{metaB.manager}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          Elo: {metaB.managerElo.toFixed(0)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quick links to profiles */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <Link
                  href={`/teams/${encodeURIComponent(teamA)}`}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#04F5FF]/10 hover:bg-[#04F5FF]/20 text-[#04F5FF] border border-[#04F5FF]/30 transition-all flex items-center gap-1.5"
                >
                  View {teamA} Profile <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href={`/teams/${encodeURIComponent(teamB)}`}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#E90052]/10 hover:bg-[#E90052]/20 text-[#E90052] border border-[#E90052]/30 transition-all flex items-center gap-1.5"
                >
                  View {teamB} Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature: Magnetic Scroll Nudge to Club Directory */}
      <div className="flex flex-col items-center justify-center pt-1 pb-1 relative z-10">
        <button
          type="button"
          onClick={() => {
            document.getElementById("club-grid")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="relative bg-[#161628]/90 hover:bg-[#1E1E36] border border-white/15 hover:border-[#04F5FF]/60 px-5 sm:px-6 py-2.5 rounded-full shadow-lg shadow-black/50 transition-all duration-300 group cursor-pointer flex items-center gap-2.5 sm:gap-3 mx-auto animate-bounce hover:animate-none"
        >
          {/* Ambient cyan glow pulse behind it */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#04F5FF]/30 via-[#00FF85]/20 to-[#04F5FF]/30 blur-md opacity-75 group-hover:opacity-100 transition-opacity -z-10 animate-pulse pointer-events-none" />

          {/* Glowing badge */}
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#04F5FF]/15 border border-[#04F5FF]/40 text-[#04F5FF] shadow-[0_0_10px_rgba(4,245,255,0.2)] shrink-0">
            CLUB DIRECTORY
          </span>

          {/* Label */}
          <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            Browse All 20 Premier League Clubs Below
          </span>

          {/* Downward Chevron with electric cyan glow */}
          <ChevronDown className="w-4 h-4 text-[#04F5FF] group-hover:translate-y-1 transition-transform drop-shadow-[0_0_6px_rgba(4,245,255,0.8)] shrink-0" />
        </button>

        {/* Visual Connector Gradient Line (32px = h-8) */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#04F5FF]/60 to-transparent mx-auto mt-2" />
      </div>

      {/* Grid of 20 Teams */}
      <div id="club-grid" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>All 20 Premier League Clubs</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-400 font-normal">
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
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group ${
                  isSelectedA
                    ? "border-[#04F5FF] bg-[#04F5FF]/[0.08] shadow-lg shadow-[#04F5FF]/15"
                    : isSelectedB
                    ? "border-[#E90052] bg-[#E90052]/[0.08] shadow-lg shadow-[#E90052]/15"
                    : "border-white/15 hover:border-[#04F5FF]/50 bg-[#1E1E34]/90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <TeamCrest team={t.name} size={48} />
                    <div className="flex items-center gap-2">
                      {stats && (
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-950/50 border border-[#00FF85]/40 text-[#00FF85] shadow-sm">
                          #{stats.rank} Proj.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="text-lg font-black text-white group-hover:text-[#04F5FF] transition-colors">
                      {t.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.manager}</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats footer & Action Buttons */}
                <div className="mt-5 pt-4 border-t border-white/15 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-300 font-medium">Title Odds: </span>
                      <span className="font-bold text-white font-mono">
                        {stats ? `${stats.champion_pct.toFixed(1)}%` : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-300 font-medium">Elo: </span>
                      <span className="font-bold text-white font-mono">
                        {t.elo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/teams/${encodeURIComponent(t.name)}`}
                      className="flex-1 py-1.5 px-3 rounded-xl text-center text-xs font-bold bg-[#2A2A46] hover:bg-[#343458] text-white border border-white/15 transition-all"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSelectForCompare(t.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelectedA
                          ? "bg-[#04F5FF] text-black font-extrabold shadow-sm"
                          : isSelectedB
                          ? "bg-[#E90052] text-white font-extrabold shadow-sm"
                          : "bg-[#2A2A46] hover:bg-[#343458] text-slate-100 hover:text-white border border-white/15"
                      }`}
                      title={`Select ${t.name} for head-to-head comparison`}
                    >
                      <Swords className="w-3 h-3 text-[#04F5FF]" />
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
