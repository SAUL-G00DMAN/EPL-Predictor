"use client";

import React, { useEffect, useState, useRef } from "react";
import { TeamCrest } from "@/components/TeamCrest";

interface MiniPitchProps {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  simulationKey: number | string;
  onScoreProgress?: (liveHome: number, liveAway: number) => void;
  centerScore?: { home: number; away: number } | string;
}

interface GoalEvent {
  team: "home" | "away";
  goalNumber: number;
}

export function MiniPitch({
  homeTeam,
  awayTeam,
  homeGoals,
  awayGoals,
  simulationKey,
  onScoreProgress,
  centerScore,
}: MiniPitchProps) {
  const [liveHome, setLiveHome] = useState(0);
  const [liveAway, setLiveAway] = useState(0);
  const [ballPos, setBallPos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 1,
  });
  const [activeNetFlash, setActiveNetFlash] = useState<"home" | "away" | null>(null);
  const [goalBanner, setGoalBanner] = useState<string | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any previous running animation timers immediately
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset initial state
    setLiveHome(0);
    setLiveAway(0);
    setBallPos({ x: 50, y: 50, opacity: 1 });
    setActiveNetFlash(null);
    setGoalBanner(null);

    const totalGoals = homeGoals + awayGoals;

    // Handle 0-0 clean sheet case gracefully
    if (totalGoals === 0) {
      setGoalBanner("Scoreless • Defensive Deadlock");
      if (onScoreProgress) {
        onScoreProgress(0, 0);
      }
      return;
    }

    // Build interleaved goal sequence
    const events: GoalEvent[] = [];
    let hCount = 0;
    let aCount = 0;
    while (hCount < homeGoals || aCount < awayGoals) {
      if (hCount < homeGoals) {
        hCount++;
        events.push({ team: "home", goalNumber: hCount });
      }
      if (aCount < awayGoals) {
        aCount++;
        events.push({ team: "away", goalNumber: aCount });
      }
    }

    // Pace each goal: ~400ms flight + impact so total sequence takes <= 1.8s
    const goalInterval = Math.min(480, Math.max(280, Math.floor(1600 / totalGoals)));

    let runningHome = 0;
    let runningAway = 0;

    events.forEach((event, idx) => {
      const startTime = 150 + idx * goalInterval;
      const hitTime = startTime + Math.floor(goalInterval * 0.65);

      // Phase 1: Ball travels from midfield toward goal
      const t1 = setTimeout(() => {
        setGoalBanner(`⚽ Goal: ${event.team === "home" ? homeTeam : awayTeam}`);
        setBallPos({
          x: event.team === "home" ? 5 : 95, // Home shoots into Left goal, Away shoots into Right goal
          y: 45 + (idx % 3) * 5, // Slight vertical variation in shot placement
          opacity: 1,
        });
      }, startTime);
      timersRef.current.push(t1);

      // Phase 2: Ball strikes net, ripples & increments score
      const t2 = setTimeout(() => {
        if (event.team === "home") {
          runningHome++;
          setLiveHome(runningHome);
          setActiveNetFlash("home");
        } else {
          runningAway++;
          setLiveAway(runningAway);
          setActiveNetFlash("away");
        }

        if (onScoreProgress) {
          onScoreProgress(runningHome, runningAway);
        }

        // Reset ball to center for next shot if there are remaining goals
        if (idx < events.length - 1) {
          const tReset = setTimeout(() => {
            setActiveNetFlash(null);
            setBallPos({ x: 50, y: 50, opacity: 0.8 });
          }, Math.floor(goalInterval * 0.25));
          timersRef.current.push(tReset);
        } else {
          // Final goal completed
          const tFinal = setTimeout(() => {
            setActiveNetFlash(null);
            setGoalBanner(`Full Time Simulated: ${homeGoals}-${awayGoals}`);
          }, 350);
          timersRef.current.push(tFinal);
        }
      }, hitTime);
      timersRef.current.push(t2);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [homeGoals, awayGoals, homeTeam, awayTeam, simulationKey]);

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center space-y-1.5 pt-1">
      {/* Mini Pitch Header / Live Event Banner */}
      <div className="flex items-center justify-between w-full px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1 text-[#00FF85]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF85] animate-pulse" />
          Live Pitch Visualizer
        </span>
        <span className="text-slate-300 font-mono">
          {goalBanner || `${homeGoals + awayGoals} Total Goals`}
        </span>
      </div>

      {/* Horizontal Pitch Arena */}
      <div className="relative w-full h-[88px] sm:h-[96px] rounded-xl overflow-hidden border border-[#00FF85]/30 bg-gradient-to-b from-[#06180f] via-[#092215] to-[#06180f] shadow-inner shadow-black/80 flex items-center justify-between p-1.5 select-none">
        {/* Pitch Turf Pattern Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.05)_20px,rgba(255,255,255,0.05)_40px)]" />

        {/* Boundary White Line */}
        <div className="absolute inset-1.5 border border-white/20 rounded-lg pointer-events-none" />

        {/* Halfway Line */}
        <div className="absolute left-1/2 top-1.5 bottom-1.5 w-px bg-white/25 pointer-events-none" />

        {/* Center Circle & Spot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/25 pointer-events-none flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>

        {/* Left Goal Area & Net (Home Goal) */}
        <div
          className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-12 border-r border-y border-white/25 rounded-r pointer-events-none transition-all duration-200 ${
            activeNetFlash === "home" ? "bg-[#00FF85]/30 animate-net-ripple" : ""
          }`}
        >
          {/* Net Mesh Pattern */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-2 border-r-2 transition-colors ${
              activeNetFlash === "home"
                ? "border-[#00FF85] bg-[#00FF85]/40"
                : "border-[#00FF85]/70 bg-[#00FF85]/15"
            }`}
          />
        </div>

        {/* Right Goal Area & Net (Away Goal) */}
        <div
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-12 border-l border-y border-white/25 rounded-l pointer-events-none transition-all duration-200 ${
            activeNetFlash === "away" ? "bg-[#E90052]/30 animate-net-ripple" : ""
          }`}
        >
          {/* Net Mesh Pattern */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-2 border-l-2 transition-colors ${
              activeNetFlash === "away"
                ? "border-[#E90052] bg-[#E90052]/40"
                : "border-[#E90052]/70 bg-[#E90052]/15"
            }`}
          />
        </div>

        {/* Animated Football */}
        <div
          className="absolute z-20 text-xs transition-all duration-300 ease-out pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          style={{
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: ballPos.opacity,
          }}
        >
          ⚽
        </div>

        {/* Authoritative Central Static Scoreline Badge OR Team HUD Overlays */}
        {centerScore != null ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[#0B0F17]/95 border border-slate-700/80 px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-2xl backdrop-blur-sm flex items-center justify-center gap-1.5 sm:gap-2.5 pointer-events-none select-none">
            <span className="text-lg sm:text-2xl font-black font-mono text-white tracking-normal">
              {typeof centerScore === "string"
                ? centerScore.replace(/\s+/g, "").split("-")[0]
                : centerScore.home}
            </span>
            <span className="text-slate-500 text-xs sm:text-base font-black select-none">
              -
            </span>
            <span className="text-lg sm:text-2xl font-black font-mono text-white tracking-normal">
              {typeof centerScore === "string"
                ? centerScore.replace(/\s+/g, "").split("-")[1]
                : centerScore.away}
            </span>
          </div>
        ) : (
          <>
            {/* Left Side Team HUD Overlay */}
            <div className="relative z-10 flex items-center gap-1.5 pl-2 pointer-events-none">
              <TeamCrest team={homeTeam} size={22} />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-white truncate max-w-[65px] sm:max-w-[85px]">
                  {homeTeam}
                </span>
                <span className="font-mono text-xs font-black text-[#00FF85] mt-0.5">
                  {liveHome}
                </span>
              </div>
            </div>

            {/* Right Side Team HUD Overlay */}
            <div className="relative z-10 flex items-center gap-1.5 pr-2 pointer-events-none flex-row-reverse text-right">
              <TeamCrest team={awayTeam} size={22} />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-white truncate max-w-[65px] sm:max-w-[85px]">
                  {awayTeam}
                </span>
                <span className="font-mono text-xs font-black text-[#E90052] mt-0.5">
                  {liveAway}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
