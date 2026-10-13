"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  TrendingUp,
  Flame,
  ShieldCheck,
  Zap,
  ChevronDown,
  ArrowRight,
  User,
  AlertTriangle,
  History,
  Sparkles,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { RadarChart, RadarMetric } from "@/components/RadarChart";
import { getTeamMetadata, TeamMetadata } from "@/data/teams";
import { fetchTablePredictions, getCachedTableData, TeamProjection } from "@/data/cachedApi";

export function computeRadarMetrics(meta: TeamMetadata): RadarMetric[] {
  const normElo = Math.min(Math.max(((meta.elo - 1300) / 480) * 100, 10), 100);
  const normAtk = Math.min(
    Math.max(((meta.attackRating - -0.5) / 2.3) * 100, 10),
    100
  );
  // Defence is negative in Dixon-Coles (e.g. -1.5 is better than -0.8)
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

interface HeadToHeadComparisonProps {
  teamA: string;
  teamB: string;
  primaryColor?: string;
  secondaryColor?: string;
  showHeader?: boolean;
  className?: string;
}

export function HeadToHeadComparison({
  teamA = "Man City",
  teamB = "Chelsea",
  primaryColor = "#04F5FF",
  secondaryColor = "#E90052",
  showHeader = true,
  className = "",
}: HeadToHeadComparisonProps) {
  const [tableData, setTableData] = useState<Record<string, TeamProjection>>(() => {
    const cached = getCachedTableData();
    if (!cached) return {};
    const map: Record<string, TeamProjection> = {};
    cached.forEach((row) => {
      map[row.team] = row;
    });
    return map;
  });

  const [showFullMetrics, setShowFullMetrics] = useState<boolean>(false);

  useEffect(() => {
    fetchTablePredictions()
      .then((table) => {
        if (!table) return;
        const map: Record<string, TeamProjection> = {};
        table.forEach((row) => {
          map[row.team] = row;
        });
        setTableData(map);
      })
      .catch(() => {});
  }, []);

  const metaA = useMemo(() => getTeamMetadata(teamA), [teamA]);
  const metaB = useMemo(() => getTeamMetadata(teamB), [teamB]);

  const statsA = tableData[teamA];
  const statsB = tableData[teamB];

  const metricsA = useMemo(() => computeRadarMetrics(metaA), [metaA]);
  const metricsB = useMemo(() => computeRadarMetrics(metaB), [metaB]);

  // Advantage indicators calculation
  // 1. Simulated finish (higher points / better rank wins)
  const finishAdv: "A" | "B" | null =
    statsA && statsB
      ? statsA.avg_points > statsB.avg_points
        ? "A"
        : statsB.avg_points > statsA.avg_points
        ? "B"
        : null
      : null;

  // 2. Title / UCL Trajectory (higher title odds, or higher top 4 if title close)
  const trajectoryAdv: "A" | "B" | null =
    statsA && statsB
      ? statsA.champion_pct > statsB.champion_pct + 1
        ? "A"
        : statsB.champion_pct > statsA.champion_pct + 1
        ? "B"
        : statsA.top4_pct > statsB.top4_pct
        ? "A"
        : statsB.top4_pct > statsA.top4_pct
        ? "B"
        : null
      : null;

  // 3. Attack Power (higher xG wins)
  const attackAdv: "A" | "B" | null =
    metaA.attackRating > metaB.attackRating
      ? "A"
      : metaB.attackRating > metaA.attackRating
      ? "B"
      : null;

  // 4. Defence Solidity (more negative rating / lower conceded goals wins)
  const defenceAdv: "A" | "B" | null =
    metaA.defenceRating < metaB.defenceRating
      ? "A"
      : metaB.defenceRating < metaA.defenceRating
      ? "B"
      : null;

  // 5. Current Club Elo (higher Elo wins)
  const eloAdv: "A" | "B" | null =
    metaA.elo > metaB.elo ? "A" : metaB.elo > metaA.elo ? "B" : null;

  // Deep dive advantages
  const mgrAdv: "A" | "B" | null =
    metaA.managerElo > metaB.managerElo
      ? "A"
      : metaB.managerElo > metaA.managerElo
      ? "B"
      : null;

  const relAdv: "A" | "B" | null =
    statsA && statsB
      ? statsA.relegation_pct < statsB.relegation_pct
        ? "A"
        : statsB.relegation_pct < statsA.relegation_pct
        ? "B"
        : null
      : null;

  const formAdv: "A" | "B" | null =
    metaA.recentFormPoints > metaB.recentFormPoints
      ? "A"
      : metaB.recentFormPoints > metaA.recentFormPoints
      ? "B"
      : null;

  // Helper pill for advantage indicator
  const AdvantageDot = () => (
    <span
      className="inline-block w-2 h-2 rounded-full bg-[#00FF85] shadow-[0_0_8px_rgba(0,255,133,0.9)] mr-1.5 shrink-0 animate-pulse"
      title="Statistical Advantage"
    />
  );

  return (
    <div
      className={`glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden space-y-5 ${className}`}
    >
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#04F5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E90052]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#04F5FF]/10 border border-[#04F5FF]/30 text-[#04F5FF] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#00FF85]" />
              Tactical Radar & Battle Analytics
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{teamA}</span>
              <span className="text-slate-500 text-sm sm:text-base font-normal">vs</span>
              <span>{teamB}</span>
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold self-start sm:self-center">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_rgba(4,245,255,0.8)]"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-white">{teamA}</span>
            </div>
            <span className="text-slate-600 font-mono text-[10px]">VS</span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_rgba(233,0,82,0.8)]"
                style={{ backgroundColor: secondaryColor }}
              />
              <span className="text-white">{teamB}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Radar on Left (lg:col-span-5), Stats on Right (lg:col-span-7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center relative z-10">
        {/* Left: Superimposed Dual Radar Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 overflow-visible relative">
          <RadarChart
            metrics={metricsA}
            secondaryMetrics={metricsB}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            size={340}
          />
          <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">
            Normalized 0–100 coordinate space across 5 Dixon-Coles &amp; Elo dimensions
          </p>
        </div>

        {/* Right: Streamlined Battle Stats Table */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3 max-w-full">
          <div className="overflow-x-auto w-full select-none rounded-xl border border-white/10 bg-[#12121e]/80 shadow-md">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold">
                  <th className="py-2.5 px-3 sm:px-4">Battle Dimension</th>
                  <th className="py-2.5 px-3 sm:px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TeamCrest team={teamA} size={18} />
                      <span className="font-extrabold text-white">{teamA}</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TeamCrest team={teamB} size={18} />
                      <span className="font-extrabold text-white">{teamB}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {/* 1. Simulated Finish */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Simulated Finish</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        finishAdv === "A" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {finishAdv === "A" && <AdvantageDot />}
                      {statsA ? `#${statsA.rank} (${statsA.avg_points.toFixed(1)} pts)` : "--"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        finishAdv === "B" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {finishAdv === "B" && <AdvantageDot />}
                      {statsB ? `#${statsB.rank} (${statsB.avg_points.toFixed(1)} pts)` : "--"}
                    </span>
                  </td>
                </tr>

                {/* 2. Title / Top 4 Trajectory */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#04F5FF] shrink-0" />
                    <span>Title / UCL Trajectory</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center">
                    <div
                      className={`inline-flex items-center font-bold ${
                        trajectoryAdv === "A" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {trajectoryAdv === "A" && <AdvantageDot />}
                      {statsA ? (
                        <span>
                          {statsA.champion_pct >= 1.0 ? (
                            <>
                              {statsA.champion_pct.toFixed(1)}% Title{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({statsA.top4_pct.toFixed(1)}% UCL)
                              </span>
                            </>
                          ) : (
                            `${statsA.top4_pct.toFixed(1)}% Top 4`
                          )}
                        </span>
                      ) : (
                        "--"
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center">
                    <div
                      className={`inline-flex items-center font-bold ${
                        trajectoryAdv === "B" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {trajectoryAdv === "B" && <AdvantageDot />}
                      {statsB ? (
                        <span>
                          {statsB.champion_pct >= 1.0 ? (
                            <>
                              {statsB.champion_pct.toFixed(1)}% Title{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({statsB.top4_pct.toFixed(1)}% UCL)
                              </span>
                            </>
                          ) : (
                            `${statsB.top4_pct.toFixed(1)}% Top 4`
                          )}
                        </span>
                      ) : (
                        "--"
                      )}
                    </div>
                  </td>
                </tr>

                {/* 3. Attack Power (xG per match) */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Attack Power (xG per match)</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        attackAdv === "A" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {attackAdv === "A" && <AdvantageDot />}
                      {metaA.attackRating.toFixed(2)} xG
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        attackAdv === "B" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {attackAdv === "B" && <AdvantageDot />}
                      {metaB.attackRating.toFixed(2)} xG
                    </span>
                  </td>
                </tr>

                {/* 4. Defence Solidity */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Defence Solidity (xGA Allowed)</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        defenceAdv === "A" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {defenceAdv === "A" && <AdvantageDot />}
                      {Math.abs(metaA.defenceRating).toFixed(2)} xGA
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        defenceAdv === "B" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {defenceAdv === "B" && <AdvantageDot />}
                      {Math.abs(metaB.defenceRating).toFixed(2)} xGA
                    </span>
                  </td>
                </tr>

                {/* 5. Current Club Elo */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Current Club Elo</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        eloAdv === "A" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {eloAdv === "A" && <AdvantageDot />}
                      {metaA.elo.toFixed(0)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center ${
                        eloAdv === "B" ? "text-emerald-300 font-extrabold" : "text-slate-300"
                      }`}
                    >
                      {eloAdv === "B" && <AdvantageDot />}
                      {metaB.elo.toFixed(0)}
                    </span>
                  </td>
                </tr>

                {/* Collapsible Deep-Dive Metrics */}
                {showFullMetrics && (
                  <>
                    {/* Manager & Manager Elo */}
                    <tr className="hover:bg-white/[0.02] bg-white/[0.01] transition-colors">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Manager &amp; Elo</span>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center text-xs font-sans">
                        <div
                          className={`font-bold inline-flex items-center ${
                            mgrAdv === "A" ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {mgrAdv === "A" && <AdvantageDot />}
                          {metaA.manager}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          Elo: {metaA.managerElo.toFixed(0)}
                        </div>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center text-xs font-sans">
                        <div
                          className={`font-bold inline-flex items-center ${
                            mgrAdv === "B" ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {mgrAdv === "B" && <AdvantageDot />}
                          {metaB.manager}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          Elo: {metaB.managerElo.toFixed(0)}
                        </div>
                      </td>
                    </tr>

                    {/* Relegation Risk */}
                    <tr className="hover:bg-white/[0.02] bg-white/[0.01] transition-colors">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Relegation Risk</span>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center ${
                            relAdv === "A" ? "text-emerald-300" : "text-slate-300"
                          }`}
                        >
                          {relAdv === "A" && <AdvantageDot />}
                          {statsA ? `${statsA.relegation_pct.toFixed(1)}%` : "0.0%"}
                        </span>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center ${
                            relAdv === "B" ? "text-emerald-300" : "text-slate-300"
                          }`}
                        >
                          {relAdv === "B" && <AdvantageDot />}
                          {statsB ? `${statsB.relegation_pct.toFixed(1)}%` : "0.0%"}
                        </span>
                      </td>
                    </tr>

                    {/* Recent 5-Match Form */}
                    <tr className="hover:bg-white/[0.02] bg-white/[0.01] transition-colors">
                      <td className="py-2 px-3 sm:px-4 text-slate-300 font-sans font-medium flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Recent Form (Points)</span>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center ${
                            formAdv === "A" ? "text-emerald-300" : "text-slate-300"
                          }`}
                        >
                          {formAdv === "A" && <AdvantageDot />}
                          {metaA.recentFormPoints}/15 pts
                        </span>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center ${
                            formAdv === "B" ? "text-emerald-300" : "text-slate-300"
                          }`}
                        >
                          {formAdv === "B" && <AdvantageDot />}
                          {metaB.recentFormPoints}/15 pts
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Collapsible toggle button */}
          <button
            type="button"
            onClick={() => setShowFullMetrics((prev) => !prev)}
            className="w-full py-2 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>
              {showFullMetrics
                ? "Hide Deep Tactical Metrics"
                : "View Full Tactical & Manager Metrics"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showFullMetrics ? "rotate-180 text-emerald-400" : "text-slate-400"
              }`}
            />
          </button>

          {/* Bottom Action buttons: View Profile Links */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <Link
              href={`/teams/${encodeURIComponent(teamA)}`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#04F5FF]/10 hover:bg-[#04F5FF]/20 text-[#04F5FF] border border-[#04F5FF]/30 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <span>View {teamA} Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href={`/teams/${encodeURIComponent(teamB)}`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E90052]/10 hover:bg-[#E90052]/20 text-[#E90052] border border-[#E90052]/30 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <span>View {teamB} Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
