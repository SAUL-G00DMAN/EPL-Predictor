"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  AlertTriangle,
  User,
  MapPin,
  Swords,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { RadarChart } from "@/components/RadarChart";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { getTeamMetadata } from "@/data/teams";
import { fetchTablePredictions, getCachedTableData } from "@/data/cachedApi";

export default function TeamProfilePage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const unwrappedParams = use(params);
  const teamName = decodeURIComponent(unwrappedParams.team);
  const meta = getTeamMetadata(teamName);

  const [tableStats, setTableStats] = useState<any>(() => {
    const cached = getCachedTableData();
    if (!cached) return null;
    return (
      cached.find((r) => r.team.toLowerCase() === teamName.toLowerCase()) || null
    );
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCachedTableData();
    if (!cached) return true;
    return !cached.find((r) => r.team.toLowerCase() === teamName.toLowerCase());
  });

  useEffect(() => {
    fetchTablePredictions()
      .then((table) => {
        const match = table.find(
          (r) => r.team.toLowerCase() === teamName.toLowerCase()
        );
        if (match) {
          setTableStats(match);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [teamName]);

  // Normalization for radar chart (0 to 100)
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

  const radarMetrics = [
    {
      label: "Elo Rating",
      value: normElo,
      rawValue: `${meta.elo.toFixed(0)}`,
    },
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
      rawValue: `${meta.recentFormPoints}/15 pts`,
    },
    {
      label: "Manager Elo",
      value: normMgr,
      rawValue: `${meta.managerElo.toFixed(0)}`,
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 light:text-slate-600 hover:text-white light:hover:text-[#19001B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Table Projections
        </Link>
      </div>

      {/* Hero Club Banner */}
      <div className="glass-panel light:bg-white light:border-slate-200 light:shadow-[0_4px_20px_-2px_rgba(56,0,60,0.05)] p-5 sm:p-6 md:p-8 rounded-3xl border border-white/10 glow-purple relative overflow-hidden">
        <div
          className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: meta.primaryColor }}
        ></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="p-3 bg-white/5 light:bg-slate-50 rounded-3xl border border-white/10 light:border-slate-200 shadow-2xl light:shadow-sm shrink-0">
            <TeamCrest team={meta.name} size={110} />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="text-xs font-mono tabular-nums font-bold px-2.5 py-0.5 rounded-full bg-white/10 light:bg-sky-50 text-[#38BDF8] light:text-[#0284C7]">
                {meta.shortName}
              </span>
              {tableStats && (
                <span className="text-xs font-mono tabular-nums font-bold px-2.5 py-0.5 rounded-full bg-[#00FF85]/20 light:bg-emerald-50 text-[#00FF85] light:text-emerald-700 border border-[#00FF85]/30 light:border-emerald-300">
                  Projected Rank: #{tableStats.rank}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white light:text-[#19001B] tracking-tight">
              {meta.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 light:text-slate-500">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#38BDF8] light:text-[#0284C7]" />
                <span className="text-slate-200 light:text-slate-700 font-semibold">{meta.manager}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E90052] light:text-rose-600" />
                <span>{meta.stadium}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href={`/predict?home=${encodeURIComponent(meta.name)}`}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 light:bg-slate-100 hover:bg-white/20 light:hover:bg-slate-200 border border-white/10 light:border-slate-300 text-white light:text-slate-800 transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4 text-[#00FF85] light:text-emerald-600" />
              Predict Matchup
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stats Grid: Radar Pentagon + Simulation Odds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Radar Pentagon Chart Card */}
        <div className="lg:col-span-6 glass-panel light:bg-white light:border-slate-200 light:shadow-[0_4px_20px_-2px_rgba(56,0,60,0.05)] p-5 sm:p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 glow-blue">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#38BDF8] light:text-[#0284C7]">
              Tactical Profile
            </span>
            <h2 className="text-xl font-black text-white light:text-[#19001B] mt-1">
              Performance Pentagon Radar
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              Normalized tactical ratings calculated by Dixon-Coles and manager Elo models.
            </p>
          </div>

          <div className="flex justify-center py-4">
            <RadarChart
              metrics={radarMetrics}
              size={340}
              primaryColor="#00FF85"
            />
          </div>

          {/* Metric breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {radarMetrics.map((m) => (
              <div
                key={m.label}
                className="p-3 rounded-xl bg-white/[0.03] light:bg-slate-50 border border-white/5 light:border-slate-200 space-y-1"
              >
                <div className="text-slate-400 light:text-slate-500 text-[11px]">{m.label}</div>
                <div className="text-sm font-black font-mono text-white light:text-slate-900">
                  {m.rawValue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season Simulation Probability Bars Card */}
        <div className="lg:col-span-6 glass-panel light:bg-white light:border-slate-200 light:shadow-[0_4px_20px_-2px_rgba(56,0,60,0.05)] p-5 sm:p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 glow-magenta">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#E90052] light:text-rose-700">
              10,000-Sim Projection
            </span>
            <h2 className="text-xl font-black text-white light:text-[#19001B] mt-1">
              Title & Relegation Probabilities
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              Live odds derived from remaining fixtures and simulated form trajectories.
            </p>
          </div>

          {tableStats ? (
            <div className="space-y-6">
              {/* Champion Probability */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] light:bg-slate-50 border border-white/5 light:border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#00FF85] light:text-emerald-600" />
                    Premier League Champion (1st)
                  </span>
                  <span className="font-mono font-black text-sm text-[#00FF85] light:text-emerald-700">
                    <AnimatedNumber
                      value={tableStats.champion_pct}
                      suffix="%"
                    />
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 light:bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00FF85] to-[#38BDF8] rounded-full animate-grow"
                    style={{ width: `${tableStats.champion_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Top 4 Probability */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] light:bg-slate-50 border border-white/5 light:border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#38BDF8] light:text-[#0284C7]" />
                    Champions League Top 4 (1st - 4th)
                  </span>
                  <span className="font-mono tabular-nums font-black text-sm text-[#38BDF8] light:text-[#0284C7]">
                    <AnimatedNumber value={tableStats.top4_pct} suffix="%" />
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 light:bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3D195B] to-[#38BDF8] rounded-full animate-grow"
                    style={{ width: `${tableStats.top4_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Relegation Risk */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] light:bg-slate-50 border border-white/5 light:border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#E90052] light:text-rose-600" />
                    Relegation Risk (18th - 20th)
                  </span>
                  <span className="font-mono font-black text-sm text-[#E90052] light:text-rose-700">
                    <AnimatedNumber
                      value={tableStats.relegation_pct}
                      suffix="%"
                    />
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 light:bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E90052] to-red-600 rounded-full animate-grow"
                    style={{ width: `${tableStats.relegation_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Confidence Bands Detail */}
              <div className="p-5 rounded-2xl bg-black/40 light:bg-slate-50 border border-white/10 light:border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase font-bold tracking-wider text-slate-300 light:text-slate-700">
                    Ceiling vs. Floor (Confidence Bands)
                  </div>
                  <span className="text-[10px] text-slate-400 light:text-slate-500 font-mono">
                    80% Range Band (10,000 Sims)
                  </span>
                </div>

                {/* Best Case vs Worst Case Split */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Best Case (Ceiling) */}
                  <div className="p-3.5 rounded-xl bg-[#00FF85]/10 light:bg-emerald-50 border border-[#00FF85]/30 light:border-emerald-300 space-y-1">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black text-[#00FF85] light:text-emerald-700">
                      <span>Best Case (Ceiling)</span>
                      <TrendingUp className="w-3 h-3 text-[#00FF85] light:text-emerald-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-white light:text-slate-900">
                      #{Math.round(Math.min(tableStats.position_p10 ?? 1, tableStats.position_p90 ?? 20))}
                    </div>
                    <div className="text-xs font-mono font-bold text-[#00FF85] light:text-emerald-700">
                      {Math.max(tableStats.points_p10 ?? 0, tableStats.points_p90 ?? 0).toFixed(0)} Points
                    </div>
                    <div className="text-[10px] text-slate-400 light:text-slate-600 font-sans">
                      Top 10% simulation finish
                    </div>
                  </div>

                  {/* Worst Case (Floor) */}
                  <div className="p-3.5 rounded-xl bg-[#E90052]/10 light:bg-rose-50 border border-[#E90052]/30 light:border-rose-300 space-y-1">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black text-[#E90052] light:text-rose-700">
                      <span>Worst Case (Floor)</span>
                      <AlertTriangle className="w-3 h-3 text-[#E90052] light:text-rose-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-white light:text-slate-900">
                      #{Math.round(Math.max(tableStats.position_p10 ?? 1, tableStats.position_p90 ?? 20))}
                    </div>
                    <div className="text-xs font-mono font-bold text-[#E90052] light:text-rose-700">
                      {Math.min(tableStats.points_p10 ?? 0, tableStats.points_p90 ?? 0).toFixed(0)} Points
                    </div>
                    <div className="text-[10px] text-slate-400 light:text-slate-600 font-sans">
                      Bottom 10% downside scenario
                    </div>
                  </div>
                </div>

                {/* Range summary */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.03] light:bg-white light:border light:border-slate-200 space-y-1">
                    <div className="text-slate-400 light:text-slate-500 text-[10px] uppercase font-bold">Points Range (Low to High)</div>
                    <div className="text-sm font-bold text-white light:text-slate-900">
                      {Math.min(tableStats.points_p10 ?? 0, tableStats.points_p90 ?? 0).toFixed(0)} – {Math.max(tableStats.points_p10 ?? 0, tableStats.points_p90 ?? 0).toFixed(0)} pts
                    </div>
                    <div className="text-[10px] text-[#00FF85] light:text-emerald-700 font-semibold">
                      Median: {tableStats.points_p50?.toFixed(0)} pts
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] light:bg-white light:border light:border-slate-200 space-y-1">
                    <div className="text-slate-400 light:text-slate-500 text-[10px] uppercase font-bold">Position Range (Best to Worst)</div>
                    <div className="text-sm font-bold text-white light:text-slate-900">
                      #{Math.round(Math.min(tableStats.position_p10 ?? 1, tableStats.position_p90 ?? 20))} to #{Math.round(Math.max(tableStats.position_p10 ?? 1, tableStats.position_p90 ?? 20))}
                    </div>
                    <div className="text-[10px] text-[#38BDF8] light:text-[#0284C7] font-semibold">
                      Median Finish: #{tableStats.position_p50?.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 light:text-slate-500 animate-pulse">
              Loading simulation projections...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
