"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Shield, Sparkles, Swords, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { PremierLeagueLion } from "./PremierLeagueLion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function Navbar() {
  const pathname = usePathname();
  const [modelStatus, setModelStatus] = useState<{
    loaded: boolean;
    remainingFixtures: number;
    accuracy?: number;
  }>({
    loaded: true,
    remainingFixtures: 320,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "ok") {
          setModelStatus({
            loaded: data.model_loaded,
            remainingFixtures: data.remaining_fixtures,
            accuracy: data.accuracy_gate?.accuracy,
          });
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  const navLinks = [
    { href: "/how-it-works", label: "How This Works", icon: BookOpen, iconColor: "text-amber-400" },
    { href: "/", label: "Table & Odds", icon: Trophy, iconColor: "text-[#00FF85]" },
    { href: "/predict", label: "Match Predictor", icon: Swords, iconColor: "text-[#04F5FF]" },
    { href: "/teams", label: "Team Profiles", icon: Shield, iconColor: "text-[#E90052]" },
    { href: "/season", label: "Your Season", icon: Sparkles, iconColor: "text-rose-400" },
  ];

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-white/15 bg-[#141424]/90 backdrop-blur-md shadow-lg shadow-black/40 w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-7xl mx-auto px-4 sm:px-6 h-18">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B16FF] via-[#3D195B] to-[#E90052] p-2 flex items-center justify-center shadow-lg shadow-[#7B16FF]/40 border border-purple-400/30 group-hover:scale-105 group-hover:shadow-[#7B16FF]/60 transition-all duration-300">
            <PremierLeagueLion className="w-full h-full text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white">
                PREMIER LEAGUE
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
              Monte Carlo Engine • 10,000 Sims
            </p>
          </div>
        </Link>

        {/* Navigation Tabs - Flexible container with shrink min-w-0 */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 bg-[#171728]/95 p-1 rounded-2xl border border-white/15 shadow-xl shrink min-w-0 overflow-x-auto no-scrollbar">
          {navLinks.map(({ href, label, icon: Icon, iconColor }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            const isSeason = href === "/season";

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                  isSeason
                    ? isActive
                      ? "bg-[#E11D48] border border-rose-300 text-white shadow-[0_0_18px_rgba(225,29,72,0.5)] scale-[1.03]"
                      : "bg-[#38111E] border border-rose-500/70 text-rose-100 shadow-[0_2px_4px_rgba(0,0,0,0.4)] hover:bg-[#4C1428] hover:border-rose-400 active:translate-y-[1px]"
                    : isActive
                    ? "bg-gradient-to-r from-[#7B16FF] via-[#D8005A] to-[#E90052] text-white shadow-lg shadow-[#E90052]/40 border border-white/30 scale-[1.03]"
                    : "bg-[#222238] border border-slate-600/80 text-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.4)] hover:bg-[#2D2D48] hover:border-slate-400 hover:text-white active:translate-y-[1px] transition-all"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                    isActive
                      ? "text-white"
                      : isSeason
                      ? "text-rose-300 group-hover:text-rose-100"
                      : iconColor
                  }`}
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Model Status Badge (Anchored cleanly to far right with ml-auto) */}
        <div className="ml-auto shrink-0 flex items-center pl-2">
          {/* Diagnostic Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1c30] border border-white/20 shadow-sm shrink-0 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-xs whitespace-nowrap flex items-center gap-1">
              <span className="text-slate-300">Model:</span>
              <span className="font-medium text-emerald-400">Live</span>
              <span className="hidden xl:inline text-slate-400">• {modelStatus.remainingFixtures} fixtures left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav row with swipe affordance fade gradient */}
      <div className="md:hidden relative border-t border-white/15 bg-[#171728] shadow-lg select-none">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-3 py-2 w-full">
          {navLinks.map(({ href, label, icon: Icon, iconColor }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            const isSeason = href === "/season";

            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSeason
                    ? isActive
                      ? "bg-[#E11D48] border border-rose-300 text-white shadow-[0_0_14px_rgba(225,29,72,0.6)] ring-1 ring-rose-400 scale-[1.02]"
                      : "bg-[#38111E] border border-rose-500/80 text-rose-100 shadow-[0_0_10px_rgba(225,29,72,0.3)] ring-1 ring-rose-500/40 hover:bg-[#4C1428] hover:border-rose-400 active:translate-y-[1px]"
                    : isActive
                    ? "bg-gradient-to-r from-[#7B16FF] via-[#D8005A] to-[#E90052] text-white shadow-md shadow-[#E90052]/30 border border-white/30 scale-[1.02]"
                    : "bg-[#222238] border border-slate-600/80 text-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.4)] hover:text-white hover:bg-[#2D2D48] hover:border-slate-400 active:translate-y-[1px]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-white" : isSeason ? "text-rose-300" : iconColor
                  }`}
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
          {/* Right edge scroll spacer so last item is never clipped or glued to boundary */}
          <div className="w-8 shrink-0" aria-hidden="true" />
        </div>

        {/* Right-edge soft fade gradient mask indicating more scrollable content */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#171728] via-[#171728]/80 to-transparent z-10"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
