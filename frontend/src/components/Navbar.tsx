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
    { href: "/how-it-works", label: "How This Works", icon: BookOpen },
    { href: "/season", label: "Play Your Season", icon: Sparkles },
    { href: "/", label: "Table & Odds", icon: Trophy },
    { href: "/predict", label: "Match Predictor", icon: Swords },
    { href: "/teams", label: "Team Profiles", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-[#23293B] bg-[#141824]/95 backdrop-blur-md shadow-lg shadow-black/40 w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-7xl mx-auto px-4 sm:px-6 h-18">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#38003C] to-[#200022] p-2 flex items-center justify-center shadow-lg shadow-[#38003C]/40 border border-[#7B1FA2]/40 group-hover:scale-105 group-hover:border-[#7B1FA2]/70 transition-all duration-300">
            <PremierLeagueLion className="w-full h-full text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white">
                PREMIER LEAGUE
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Monte Carlo Engine • 10,000 Sims
            </p>
          </div>
        </Link>

        {/* Navigation Tabs - Disciplined PL Studio Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 bg-[#0B0E14]/80 p-1.5 rounded-2xl border border-[#23293B] shadow-inner shrink min-w-0 overflow-x-auto no-scrollbar">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            const isSeason = href === "/season";

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                  isSeason
                    ? isActive
                      ? "bg-[#E90052] border border-[#FF2E7E]/60 text-white shadow-sm shadow-[#E90052]/30 scale-[1.02]"
                      : "bg-[#E90052]/15 text-[#FF2E7E] border border-[#E90052]/40 hover:bg-[#E90052]/25 active:translate-y-[1px]"
                    : isActive
                    ? "bg-[#38003C] text-white border border-[#7B1FA2]/40 shadow-sm scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-colors active:translate-y-[1px]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                    isSeason
                      ? isActive
                        ? "text-white"
                        : "text-[#FF2E7E]"
                      : isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-200"
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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141824] border border-white/10 shadow-sm shrink-0 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse shrink-0" />
            <div className="text-xs whitespace-nowrap flex items-center gap-1">
              <span className="text-slate-400">Model:</span>
              <span className="font-semibold text-[#00FF87]">Live</span>
              <span className="hidden xl:inline text-slate-400">• {modelStatus.remainingFixtures} fixtures left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav row with swipe affordance fade gradient */}
      <div className="md:hidden relative border-t border-[#23293B] bg-[#141824] shadow-lg select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-3 py-2 w-full">
          {navLinks.map(({ href, label, icon: Icon }) => {
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
                      ? "bg-[#E90052] border border-[#FF2E7E]/60 text-white shadow-sm shadow-[#E90052]/30 scale-[1.02]"
                      : "bg-[#E90052]/15 text-[#FF2E7E] border border-[#E90052]/40 hover:bg-[#E90052]/25 active:translate-y-[1px]"
                    : isActive
                    ? "bg-[#38003C] text-white border border-[#7B1FA2]/40 shadow-sm scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-colors active:translate-y-[1px]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSeason
                      ? isActive
                        ? "text-white"
                        : "text-[#FF2E7E]"
                      : isActive
                      ? "text-white"
                      : "text-slate-400"
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
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#141824] via-[#141824]/80 to-transparent z-10"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
