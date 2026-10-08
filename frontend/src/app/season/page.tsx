"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Trophy,
  AlertTriangle,
  Swords,
  RotateCcw,
  TrendingUp,
  Copy,
  Check,
  Download,
  Loader2,
} from "lucide-react";
import { TeamCrest } from "@/components/TeamCrest";
import { TEAMS_DATA } from "@/data/teams";
import { toPng } from "html-to-image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface TeamProjection {
  rank: number;
  team: string;
  champion_pct: number;
  top4_pct: number;
  relegation_pct: number;
  avg_points: number;
  avg_position: number;
  points_p10?: number;
  points_p50?: number;
  points_p90?: number;
  position_p10?: number;
  position_p50?: number;
  position_p90?: number;
}

function drawFallbackCanvas(
  team: TeamProjection,
  rival: TeamProjection | null,
  isStrongMood: boolean,
  isRelegationRiskMood: boolean
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Base background
  ctx.fillStyle = "#0B0B14";
  ctx.fillRect(0, 0, 1200, 630);

  // Atmospheric radial glow
  const moodColor = isStrongMood
    ? "rgba(0, 255, 133, 0.16)"
    : isRelegationRiskMood
    ? "rgba(233, 0, 82, 0.16)"
    : "rgba(4, 245, 255, 0.16)";
  const glow = ctx.createRadialGradient(200, 200, 40, 200, 200, 520);
  glow.addColorStop(0, moodColor);
  glow.addColorStop(1, "rgba(11, 11, 20, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 630);

  // Secondary violet glow in bottom right
  const glow2 = ctx.createRadialGradient(1000, 500, 40, 1000, 500, 400);
  glow2.addColorStop(0, "rgba(61, 25, 91, 0.35)");
  glow2.addColorStop(1, "rgba(11, 11, 20, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, 1200, 630);

  // Border outline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 1152, 582);

  // Header Bar
  ctx.fillStyle = "#04F5FF";
  ctx.font = "bold 18px 'Inter', sans-serif, system-ui";
  ctx.fillText("PREMIER LEAGUE 2026-27 • AI MONTE CARLO SIMULATION", 60, 75);

  ctx.fillStyle = "#64748B";
  ctx.font = "14px 'Inter', monospace, system-ui";
  ctx.fillText("10,000 SIMULATIONS", 970, 75);

  // Header Divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(60, 95);
  ctx.lineTo(1140, 95);
  ctx.stroke();

  // Team Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 52px 'Inter', sans-serif, system-ui";
  ctx.fillText(team.team, 60, 175);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 16px 'Inter', sans-serif, system-ui";
  ctx.fillText("OFFICIAL AI SEASON PROJECTION", 60, 210);

  // Projected Rank Hero Block
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fillRect(60, 240, 580, 230);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.strokeRect(60, 240, 580, 230);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 13px 'Inter', sans-serif, system-ui";
  ctx.fillText("PROJECTED FINAL FINISH", 85, 275);

  ctx.fillStyle = isStrongMood ? "#00FF85" : isRelegationRiskMood ? "#E90052" : "#04F5FF";
  ctx.font = "900 88px 'Inter', monospace, system-ui";
  ctx.fillText(`#${Math.round(team.avg_position)}`, 85, 365);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 22px 'Inter', monospace, system-ui";
  ctx.fillText(`${team.avg_points.toFixed(1)} Projected Points`, 85, 410);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "15px 'Inter', sans-serif, system-ui";
  ctx.fillText(
    `Range Band (P10 - P90): #${Math.round(team.position_p10 || 1)} to #${Math.round(team.position_p90 || 20)}`,
    85,
    445
  );

  // Arch rival line
  if (rival) {
    ctx.fillStyle = "#CBD5E1";
    ctx.font = "15px 'Inter', sans-serif, system-ui";
    ctx.fillText(
      `Projected Arch-Rival: ${rival.team} (#${Math.round(rival.avg_position)} • ${rival.avg_points.toFixed(1)} pts)`,
      60,
      505
    );
  }

  // Right Side Probability Cards (3 boxes)
  // Box 1: Title Odds
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fillRect(670, 140, 470, 95);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.strokeRect(670, 140, 470, 95);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 13px 'Inter', sans-serif, system-ui";
  ctx.fillText("TITLE PROBABILITY (1ST)", 700, 172);
  ctx.fillStyle = "#00FF85";
  ctx.font = "900 38px 'Inter', monospace, system-ui";
  ctx.fillText(`${team.champion_pct.toFixed(1)}%`, 700, 218);

  // Box 2: Top 4 Odds
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fillRect(670, 255, 470, 95);
  ctx.strokeRect(670, 255, 470, 95);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 13px 'Inter', sans-serif, system-ui";
  ctx.fillText("TOP 4 FINISH (UCL QUALIFICATION)", 700, 287);
  ctx.fillStyle = "#04F5FF";
  ctx.font = "900 38px 'Inter', monospace, system-ui";
  ctx.fillText(`${team.top4_pct.toFixed(1)}%`, 700, 333);

  // Box 3: Relegation Odds
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fillRect(670, 370, 470, 95);
  ctx.strokeRect(670, 370, 470, 95);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 13px 'Inter', sans-serif, system-ui";
  ctx.fillText("RELEGATION RISK (BOTTOM 3)", 700, 402);
  ctx.fillStyle = team.relegation_pct > 20 ? "#E90052" : "#94A3B8";
  ctx.font = "900 38px 'Inter', monospace, system-ui";
  ctx.fillText(`${team.relegation_pct.toFixed(1)}%`, 700, 448);

  // Footer
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(60, 545);
  ctx.lineTo(1140, 545);
  ctx.stroke();

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 14px 'Inter', sans-serif, system-ui";
  ctx.fillText("EPL Predictor 2026-27 • 10,000 Monte Carlo Simulations", 60, 575);

  ctx.fillStyle = "#04F5FF";
  ctx.font = "bold 14px 'Inter', monospace, system-ui";
  ctx.fillText("epl-predictor.vercel.app", 955, 575);

  return canvas.toDataURL("image/png");
}

export default function YourSeasonPage() {
  const [table, setTable] = useState<TeamProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [storyBeat, setStoryBeat] = useState<number>(0); // 0: picker, 1: finish, 2: rival, 3: range, 4: share
  const [suspenseActive, setSuspenseActive] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/predictions/table?include_bands=true`)
      .then((res) => res.json())
      .then((json) => {
        if (json.table) {
          setTable(json.table);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const teamData = table.find((t) => t.team === selectedTeam);

  // Compute closest rival by avg_position
  const rivalData = React.useMemo(() => {
    if (!teamData || table.length <= 1) return null;
    let closest: TeamProjection | null = null;
    let minDiff = Infinity;

    for (const t of table) {
      if (t.team === teamData.team) continue;
      const diff = Math.abs(t.avg_position - teamData.avg_position);
      if (diff < minDiff) {
        minDiff = diff;
        closest = t;
      }
    }
    return closest;
  }, [teamData, table]);

  const handlePickTeam = (teamName: string) => {
    setSelectedTeam(teamName);
    setSuspenseActive(true);
    setStoryBeat(1);

    // Suspense countdown / calculation effect
    setTimeout(() => {
      setSuspenseActive(false);
    }, 1400);
  };

  const handleNextBeat = () => {
    if (storyBeat < 4) {
      setStoryBeat((prev) => prev + 1);
    }
  };

  const handlePrevBeat = () => {
    if (storyBeat > 1) {
      setStoryBeat((prev) => prev - 1);
    } else if (storyBeat === 1) {
      setStoryBeat(0);
      setSelectedTeam(null);
    }
  };

  const handleRestart = () => {
    setStoryBeat(0);
    setSelectedTeam(null);
    setCopied(false);
  };

  const handleShare = () => {
    if (!teamData || !rivalData) return;
    const shareText = `🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League 2026-27 AI Season Prediction for ${teamData.team}:\n\n` +
      `🏆 Projected Finish: #${Math.round(teamData.avg_position)} (${teamData.avg_points.toFixed(1)} pts)\n` +
      `🔥 Arch-Rival: ${rivalData.team} (#${Math.round(rivalData.avg_position)})\n` +
      `📈 Ceiling (P10): #${Math.round(teamData.position_p10 || 1)} | 📉 Floor (P90): #${Math.round(teamData.position_p90 || 20)}\n\n` +
      `Simulated across 10,000 Monte Carlo season runs at Premier League AI!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadCard = async () => {
    if (!teamData) return;
    setDownloading(true);
    try {
      let dataUrl = "";
      if (exportCardRef.current) {
        try {
          dataUrl = await toPng(exportCardRef.current, {
            cacheBust: true,
            pixelRatio: 1,
            skipAutoScale: true,
          });
        } catch (domErr) {
          console.warn("toPng export failed, falling back to Canvas rendering", domErr);
        }
      }

      if (!dataUrl) {
        dataUrl = drawFallbackCanvas(teamData, rivalData, isStrong, isRelegationRisk);
      }

      const link = document.createElement("a");
      link.download = `${teamData.team.replace(/\s+/g, "_")}_Season_2026_27_Prediction.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export card:", err);
    } finally {
      setDownloading(false);
    }
  };

  const isStrong = teamData ? teamData.avg_position <= 5 || teamData.champion_pct > 15 : false;
  const isRelegationRisk = teamData ? teamData.avg_position >= 15 || teamData.relegation_pct > 25 : false;

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center max-w-5xl mx-auto space-y-6">
      {/* Title & Badge */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3D195B]/50 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#00FF85]" />
          <span>Interactive Club Story • تجربة تفاعلية مخصصة</span>
        </div>

        <h1
          dir="rtl"
          className="text-3xl sm:text-4xl font-black text-white text-center tracking-tight leading-tight"
        >
          اختر ناديك المفضل واكتشف مصيره عبر 10,000 محاكاة
        </h1>

        <p className="text-xs text-slate-400/80 font-medium text-center tracking-wide">
          Your Season, Predicted • 10,000 Monte Carlo simulation runs for all 20 Premier League clubs
        </p>
      </div>

      {/* Main Story Container (Instagram / TikTok Story format - 9:16 friendly) */}
      <div className="w-full max-w-md mx-auto bg-[#0d0d16] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[640px] sm:min-h-[680px]">
        {/* Dynamic Background Glow according to narrative mood */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none opacity-20 ${
            isStrong
              ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00FF85] via-[#3D195B] to-transparent"
              : isRelegationRisk
              ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E90052] via-[#3D195B] to-transparent"
              : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#04F5FF] via-[#3D195B] to-transparent"
          }`}
        />

        {/* Top Story Header & Progress Indicators (Visible during story beats 1-4) */}
        {storyBeat > 0 && (
          <div className="p-4 z-20 space-y-3">
            {/* 4 Story Progress Bars */}
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((beatNum) => (
                <div
                  key={beatNum}
                  className="h-1 rounded-full bg-white/20 overflow-hidden"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      storyBeat >= beatNum
                        ? isStrong
                          ? "bg-[#00FF85]"
                          : isRelegationRisk
                          ? "bg-[#E90052]"
                          : "bg-[#04F5FF]"
                        : "w-0"
                    }`}
                    style={{ width: storyBeat >= beatNum ? "100%" : "0%" }}
                  />
                </div>
              ))}
            </div>

            {/* Club Brand Tag & Restart */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                {selectedTeam && <TeamCrest team={selectedTeam} size={22} />}
                <span className="font-bold text-white">{selectedTeam}</span>
              </div>
              <button
                onClick={handleRestart}
                type="button"
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-full cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Change Club
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 0: Team Picker */}
        {storyBeat === 0 && (
          <div className="p-6 flex flex-col justify-between flex-1 z-10 space-y-6">
            <div className="text-center space-y-1">
              <h2 dir="rtl" className="text-xl font-black text-white">
                اختر ناديك لبدء محاكاة القصة
              </h2>
              <p dir="rtl" className="text-xs text-slate-300">
                اضغط على شعار فريقك لمشاهدة مساره المتوقع نقطة بنقطة
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider pt-0.5">
                Tap club crest to launch custom story
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-4 gap-3 py-6">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {Object.keys(TEAMS_DATA).map((team) => (
                  <button
                    key={team}
                    onClick={() => handlePickTeam(team)}
                    type="button"
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/5 hover:border-[#04F5FF]/50 transition-all duration-200 group cursor-pointer hover:scale-105"
                  >
                    <TeamCrest team={team} size={42} />
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate max-w-full mt-1.5">
                      {TEAMS_DATA[team].shortName}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="text-center text-[11px] text-slate-500">
              10,000 season trajectories • Updated in real time
            </div>
          </div>
        )}

        {/* SCREEN 1: Beat 1 - Predicted Finish Reveal */}
        {storyBeat === 1 && teamData && (
          <div className="p-6 flex-1 flex flex-col justify-between z-10 animate-in fade-in zoom-in-95 duration-500">
            {suspenseActive ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-[#04F5FF]/20 border-t-[#00FF85] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TeamCrest team={teamData.team} size={50} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Simulating 10,000 Trajectories...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Running Dixon-Coles goal rates & XGBoost probabilities
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4 text-center pt-2">
                  <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#04F5FF]">
                    Chapter 1 • The Final Standing
                  </span>

                  <div className="py-2 transform hover:scale-105 transition-transform duration-300">
                    <TeamCrest team={teamData.team} size={90} className="justify-center" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Predicted League Position
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`text-7xl font-black font-mono tracking-tight ${
                          isStrong
                            ? "text-[#00FF85] text-glow-green"
                            : isRelegationRisk
                            ? "text-[#E90052] text-glow-magenta"
                            : "text-[#04F5FF] text-glow-cyan"
                        }`}
                      >
                        #{Math.round(teamData.avg_position)}
                      </span>
                    </div>
                  </div>

                  {/* Narrative Verdict Banner */}
                  <div
                    className={`p-4 rounded-2xl border text-center ${
                      isStrong
                        ? "bg-[#00FF85]/10 border-[#00FF85]/30 text-[#00FF85]"
                        : isRelegationRisk
                        ? "bg-[#E90052]/10 border-[#E90052]/30 text-[#E90052]"
                        : "bg-[#04F5FF]/10 border-[#04F5FF]/30 text-[#04F5FF]"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-black text-sm">
                      {isStrong ? (
                        <>
                          <Trophy className="w-4 h-4" />
                          <span>Title Contenders / Elite European Tier</span>
                        </>
                      ) : isRelegationRisk ? (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          <span>High Relegation Peril (Danger Zone)</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span>Comfortable Mid-Table Campaign</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-mono">
                      Projected Total: {teamData.avg_points.toFixed(1)} Points
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col items-center gap-2">
                  <button
                    onClick={handleNextBeat}
                    type="button"
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#00FF85] to-[#04F5FF] text-black shadow-lg shadow-[#00FF85]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Meet Your Biggest Rival →
                  </button>
                  <span className="text-[10px] text-slate-500">
                    Tap to continue story (1 of 4)
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* SCREEN 2: Beat 2 - Biggest Rival Clashing */}
        {storyBeat === 2 && teamData && rivalData && (
          <div className="p-6 flex-1 flex flex-col justify-between z-10 animate-in fade-in slide-in-from-right duration-400">
            <div className="space-y-6 text-center">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#E90052]">
                  Chapter 2 • The Arch-Nemesis
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Your Biggest Rival
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  The team destined to battle you for every single league point.
                </p>
              </div>

              {/* Clashing Crests Collision Visual */}
              <div className="py-4 relative flex items-center justify-center">
                <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.03] p-5 rounded-3xl border border-white/10 glow-magenta">
                  {/* User Team */}
                  <div className="flex flex-col items-center space-y-2 transform -translate-x-1 hover:scale-105 transition-transform">
                    <TeamCrest team={teamData.team} size={68} />
                    <span className="text-xs font-bold text-white">
                      {teamData.team}
                    </span>
                    <span className="text-[10px] font-mono text-[#00FF85]">
                      #{Math.round(teamData.avg_position)} ({teamData.avg_points.toFixed(0)} pts)
                    </span>
                  </div>

                  {/* Clash Swords */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3D195B] to-[#E90052] flex items-center justify-center text-white shadow-lg shadow-[#E90052]/40 animate-pulse">
                    <Swords className="w-6 h-6 text-[#04F5FF]" />
                  </div>

                  {/* Rival Team */}
                  <div className="flex flex-col items-center space-y-2 transform translate-x-1 hover:scale-105 transition-transform">
                    <TeamCrest team={rivalData.team} size={68} />
                    <span className="text-xs font-bold text-white">
                      {rivalData.team}
                    </span>
                    <span className="text-[10px] font-mono text-[#E90052]">
                      #{Math.round(rivalData.avg_position)} ({rivalData.avg_points.toFixed(0)} pts)
                    </span>
                  </div>
                </div>
              </div>

              {/* Rivalry Metric Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Head-to-Head Margin:</span>
                  <span className="font-bold text-[#04F5FF] font-mono">
                    {Math.abs(teamData.avg_points - rivalData.avg_points).toFixed(1)} Projected Pts
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Position Separation:</span>
                  <span className="font-bold text-white font-mono">
                    {Math.abs(teamData.avg_position - rivalData.avg_position).toFixed(2)} Places
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  Across 10,000 simulated iterations, these two clubs swap table positions
                  more frequently than any other pairing in the league.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-2">
              <button
                onClick={handleNextBeat}
                type="button"
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#00FF85] to-[#04F5FF] text-black shadow-lg shadow-[#00FF85]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                See Best Case vs Worst Case →
              </button>
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <button
                  onClick={handlePrevBeat}
                  className="hover:text-white cursor-pointer"
                >
                  ← Back
                </button>
                <span>Story (2 of 4)</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: Beat 3 - Best Case (P10) vs Worst Case (P90) */}
        {storyBeat === 3 && teamData && (
          <div className="p-6 flex-1 flex flex-col justify-between z-10 animate-in fade-in slide-in-from-right duration-400">
            <div className="space-y-4 text-center">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#00FF85]">
                  Chapter 3 • Reality Check
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Ceiling vs. Floor
                </h2>
                <p className="text-xs text-slate-400">
                  80% Confidence Interval: The full range of simulated season outcomes.
                </p>
              </div>

              {/* Contrasting Split Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                {/* Best Case (P10) - Bright, Hopeful */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#00FF85]/15 to-transparent border border-[#00FF85]/30 space-y-2 glow-green">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#00FF85]">
                      Best Case (P10)
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#00FF85]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    #{Math.round(teamData.position_p10 || 1)}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#00FF85]">
                    {teamData.points_p10?.toFixed(0)} Points
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Ideal campaign: Peak clinical finishing, defensive resilience, and winning the high-leverage fixtures.
                  </p>
                </div>

                {/* Worst Case (P90) - Dark, Ominous */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#E90052]/15 to-transparent border border-[#E90052]/30 space-y-2 glow-magenta">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#E90052]">
                      Worst Case (P90)
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E90052]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    #{Math.round(teamData.position_p90 || 20)}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#E90052]">
                    {teamData.points_p90?.toFixed(0)} Points
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Cold run: Squad fatigue, fixture congestion, and conceding soft low-xG goals in key derbies.
                  </p>
                </div>
              </div>

              {/* Summary Band Visual */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>P10: #{Math.round(teamData.position_p10 || 1)}</span>
                  <span className="text-white font-bold">
                    Median: #{Math.round(teamData.position_p50 || teamData.avg_position)}
                  </span>
                  <span>P90: #{Math.round(teamData.position_p90 || 20)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full relative overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-[#00FF85] via-[#04F5FF] to-[#E90052] rounded-full"
                    style={{
                      left: "15%",
                      width: "70%",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-2">
              <button
                onClick={handleNextBeat}
                type="button"
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#00FF85] to-[#04F5FF] text-black shadow-lg shadow-[#00FF85]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Generate Shareable Season Card →
              </button>
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <button
                  onClick={handlePrevBeat}
                  className="hover:text-white cursor-pointer"
                >
                  ← Back
                </button>
                <span>Story (3 of 4)</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: Beat 4 - Final Shareable Season Card */}
        {storyBeat === 4 && teamData && (
          <div className="p-6 flex-1 flex flex-col justify-between z-10 animate-in fade-in zoom-in-95 duration-500">
            {/* The Actual Shareable Poster Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#12121C] via-[#07070b] to-[#170a24] border border-white/15 shadow-2xl space-y-5 text-center relative overflow-hidden">
              {/* Premier League Brand Seal */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs tracking-tight text-white">
                    PREMIER LEAGUE
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#E90052] text-white">
                    AI 26/27
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  10,000 SIMULATIONS
                </span>
              </div>

              {/* Club Crest & Big Standing */}
              <div className="space-y-2">
                <TeamCrest
                  team={teamData.team}
                  size={74}
                  className="justify-center"
                />
                <h3 className="text-2xl font-black text-white">{teamData.team}</h3>

                <div className="py-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Projected Final Rank
                  </span>
                  <div
                    className={`text-6xl font-black font-mono tracking-tight ${
                      isStrong
                        ? "text-[#00FF85] text-glow-green"
                        : isRelegationRisk
                        ? "text-[#E90052] text-glow-magenta"
                        : "text-[#04F5FF] text-glow-cyan"
                    }`}
                  >
                    #{Math.round(teamData.avg_position)}
                  </div>
                  <div className="text-xs text-slate-300 font-mono font-bold">
                    {teamData.avg_points.toFixed(1)} Projected Points
                  </div>
                </div>
              </div>

              {/* 3-Pillar Odds Summary */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="text-[9px] uppercase text-slate-400 font-semibold">
                    Title Odds
                  </div>
                  <div className="text-sm font-black font-mono text-[#00FF85]">
                    {teamData.champion_pct.toFixed(1)}%
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="text-[9px] uppercase text-slate-400 font-semibold">
                    Top 4 (UCL)
                  </div>
                  <div className="text-sm font-black font-mono text-[#04F5FF]">
                    {teamData.top4_pct.toFixed(1)}%
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="text-[9px] uppercase text-slate-400 font-semibold">
                    Relegation
                  </div>
                  <div className="text-sm font-black font-mono text-[#E90052]">
                    {teamData.relegation_pct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Rival & Range Footer Bar */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Arch-Rival:</span>
                  <span className="font-bold text-white">
                    {rivalData ? rivalData.team : "--"}
                  </span>
                </div>
                <div className="text-slate-400 font-mono">
                  Range: #{Math.round(teamData.position_p10 || 1)} - #
                  {Math.round(teamData.position_p90 || 20)}
                </div>
              </div>

              {/* Watermark Tag */}
              <div className="text-[9px] text-slate-500 font-mono">
                verified with Dixon-Coles Poisson + XGBoost Pipeline
              </div>
            </div>

            {/* Action Buttons: Download PNG / Copy / Restart */}
            <div className="pt-4 space-y-2.5">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                type="button"
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-[#00FF85] via-[#04F5FF] to-[#00FF85] bg-[length:200%_auto] text-black shadow-lg shadow-[#00FF85]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Generating High-Res PNG...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-black" />
                    <span>Download Share Card (PNG)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                type="button"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00FF85]" />
                    <span className="text-[#00FF85]">Summary Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Text Summary</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handlePrevBeat}
                  type="button"
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Back to Scenarios
                </button>
                <button
                  onClick={handleRestart}
                  type="button"
                  className="text-xs text-[#04F5FF] hover:underline cursor-pointer"
                >
                  Choose Another Club
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1200x630 Social Share Card for Image Generation (Offscreen) */}
      {teamData && (
        <div
          ref={exportCardRef}
          style={{
            width: "1200px",
            height: "630px",
            position: "fixed",
            left: "-9999px",
            top: 0,
            zIndex: -100,
          }}
          className="bg-[#0B0B14] text-white p-12 flex flex-col justify-between font-sans border-2 border-white/10 select-none overflow-hidden"
        >
          {/* Background Atmospheric Glows */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              left: "-150px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: isStrong
                ? "radial-gradient(circle, rgba(0,255,133,0.18) 0%, transparent 70%)"
                : isRelegationRisk
                ? "radial-gradient(circle, rgba(233,0,82,0.18) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(4,245,255,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-150px",
              right: "-150px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(61,25,91,0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D195B] to-[#1a082b] flex items-center justify-center border border-[#04F5FF]/30 font-black text-sm text-[#00FF85]">
                PL
              </div>
              <div>
                <div className="text-xl font-black tracking-wider text-white">
                  PREMIER LEAGUE <span className="text-[#04F5FF]">2026-27</span>
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  AI Monte Carlo Season Simulation
                </div>
              </div>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              10,000 SIMULATED SEASONS
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="relative z-10 grid grid-cols-12 gap-8 items-center py-4">
            {/* Left 7 Columns: Club & Projected Finish */}
            <div className="col-span-7 space-y-5">
              <div className="flex items-center gap-4">
                <TeamCrest team={teamData.team} size={76} />
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    {teamData.team}
                  </h2>
                  <div className="text-sm text-slate-400 font-medium">
                    Official AI Season Projection
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  Projected Final Rank
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-7xl font-black font-mono tracking-tight ${
                      isStrong
                        ? "text-[#00FF85]"
                        : isRelegationRisk
                        ? "text-[#E90052]"
                        : "text-[#04F5FF]"
                    }`}
                  >
                    #{Math.round(teamData.avg_position)}
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-white font-mono">
                      {teamData.avg_points.toFixed(1)} Points
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      P10 - P90 Band: #{Math.round(teamData.position_p10 || 1)} to #
                      {Math.round(teamData.position_p90 || 20)}
                    </div>
                  </div>
                </div>
              </div>

              {rivalData && (
                <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-slate-400">Projected Arch-Rival:</span>
                  <span className="font-bold text-white">
                    {rivalData.team} (#{Math.round(rivalData.avg_position)} •{" "}
                    {rivalData.avg_points.toFixed(1)} pts)
                  </span>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Key Outcome Probabilities */}
            <div className="col-span-5 space-y-3">
              {/* Title Probability */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Title Probability
                  </div>
                  <div className="text-xs text-slate-500">1st Place Finish</div>
                </div>
                <div className="text-3xl font-black font-mono text-[#00FF85]">
                  {teamData.champion_pct.toFixed(1)}%
                </div>
              </div>

              {/* Top 4 Probability */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Top 4 (UCL)
                  </div>
                  <div className="text-xs text-slate-500">
                    Champions League
                  </div>
                </div>
                <div className="text-3xl font-black font-mono text-[#04F5FF]">
                  {teamData.top4_pct.toFixed(1)}%
                </div>
              </div>

              {/* Relegation Probability */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Relegation Risk
                  </div>
                  <div className="text-xs text-slate-500">Bottom 3 Finish</div>
                </div>
                <div
                  className={`text-3xl font-black font-mono ${
                    teamData.relegation_pct > 20
                      ? "text-[#E90052]"
                      : "text-slate-400"
                  }`}
                >
                  {teamData.relegation_pct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                EPL Predictor 2026-27
              </span>
              <span>•</span>
              <span>10,000 Monte Carlo Simulations</span>
              <span>•</span>
              <span>Dixon-Coles & XGBoost</span>
            </div>
            <div className="font-mono text-[#04F5FF] font-semibold">
              epl-predictor.vercel.app
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
