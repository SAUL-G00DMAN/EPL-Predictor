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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Table Projections
        </Link>
      </div>

      {/* Hero Club Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 glow-purple relative overflow-hidden">
        <div
          className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: meta.primaryColor }}
        ></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="p-3 bg-white/5 rounded-3xl border border-white/10 shadow-2xl shrink-0">
            <TeamCrest team={meta.name} size={110} />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#04F5FF]">
                {meta.shortName}
              </span>
              {tableStats && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/30">
                  Projected Rank: #{tableStats.rank}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {meta.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#04F5FF]" />
                <span className="text-slate-200 font-semibold">{meta.manager}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E90052]" />
                <span>{meta.stadium}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href={`/predict?home=${encodeURIComponent(meta.name)}`}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4 text-[#00FF85]" />
              Predict Matchup
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stats Grid: Radar Pentagon + Simulation Odds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Radar Pentagon Chart Card */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 glow-cyan">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#04F5FF]">
              Tactical Profile
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Performance Pentagon Radar
            </h2>
            <p className="text-xs text-slate-400 mt-1">
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
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1"
              >
                <div className="text-slate-400 text-[11px]">{m.label}</div>
                <div className="text-sm font-black font-mono text-white">
                  {m.rawValue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season Simulation Probability Bars Card */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 glow-magenta">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#E90052]">
              10,000-Sim Projection
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Title & Relegation Probabilities
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live odds derived from remaining fixtures and simulated form trajectories.
            </p>
          </div>

          {tableStats ? (
            <div className="space-y-6">
              {/* Champion Probability */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#00FF85]" />
                    Premier League Champion (1st)
                  </span>
                  <span className="font-mono font-black text-sm text-[#00FF85]">
                    <AnimatedNumber
                      value={tableStats.champion_pct}
                      suffix="%"
                    />
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00FF85] to-[#04F5FF] rounded-full animate-grow"
                    style={{ width: `${tableStats.champion_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Top 4 Probability */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#04F5FF]" />
                    Champions League Top 4 (1st - 4th)
                  </span>
                  <span className="font-mono font-black text-sm text-[#04F5FF]">
                    <AnimatedNumber value={tableStats.top4_pct} suffix="%" />
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3D195B] to-[#04F5FF] rounded-full animate-grow"
                    style={{ width: `${tableStats.top4_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Relegation Risk */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#E90052]" />
                    Relegation Risk (18th - 20th)
                  </span>
                  <span className="font-mono font-black text-sm text-[#E90052]">
                    <AnimatedNumber
                      value={tableStats.relegation_pct}
                      suffix="%"
                    />
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E90052] to-red-600 rounded-full animate-grow"
                    style={{ width: `${tableStats.relegation_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Confidence Bands Detail */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-300">
                  P10 / P50 / P90 Confidence Bands
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.03] space-y-1">
                    <div className="text-slate-400 text-[11px]">Points Range</div>
                    <div className="text-base font-bold text-white">
                      {tableStats.points_p10?.toFixed(0)} - {tableStats.points_p90?.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[#00FF85]">
                      Median: {tableStats.points_p50?.toFixed(0)} pts
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] space-y-1">
                    <div className="text-slate-400 text-[11px]">Position Range</div>
                    <div className="text-base font-bold text-white">
                      #{tableStats.position_p10?.toFixed(0)} - #{tableStats.position_p90?.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[#04F5FF]">
                      Median Finish: #{tableStats.position_p50?.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 animate-pulse">
              Loading simulation projections...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
