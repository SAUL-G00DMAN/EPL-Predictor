"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Shield, Compass, Swords, Trophy, Sun, Moon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { PremierLeagueLion } from "./PremierLeagueLion";
import { getInitialTheme, toggleTheme, Theme } from "@/lib/theme";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How This Works", icon: BookOpen },
  { href: "/season", label: "Play Your Season", icon: Compass },
  { href: "/", label: "Table & Odds", icon: Trophy },
  { href: "/predict", label: "Match Predictor", icon: Swords },
  { href: "/teams", label: "Team Profiles", icon: Shield },
];

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

  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemeState(getInitialTheme());

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme) {
        setThemeState(customEvent.detail.theme);
      }
    };

    window.addEventListener("epl-theme-changed", handleThemeChange);
    return () => window.removeEventListener("epl-theme-changed", handleThemeChange);
  }, []);

  const handleToggleTheme = useCallback(() => {
    const next = toggleTheme();
    setThemeState(next);
  }, []);

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

  const isLight = mounted ? theme === "light" : false;

  const getNavButtonClasses = (isActive: boolean) => {
    const base =
      "group relative inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1.5 lg:px-3.5 lg:py-1.5 min-h-[40px] sm:min-h-0 rounded-xl font-semibold text-xs sm:text-xs lg:text-sm transition-all duration-150 ease-out select-none cursor-pointer shrink-0 -translate-y-[2px] active:translate-y-[1px]";

    if (!isLight) {
      if (isActive) {
        return `${base} bg-[#20242D] border border-white/20 text-white shadow-[0_3.5px_0_0_#090A0C,0_4px_0_1px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.25)] active:shadow-[0_1px_0_0_#090A0C,0_1px_0_1px_rgba(255,255,255,0.15)]`;
      }

      return `${base} bg-[#16181D] hover:bg-[#1E2128] border border-white/[0.07] hover:border-white/[0.14] text-slate-300 hover:text-white shadow-[0_3.5px_0_0_#090A0C,0_4px_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.08)] active:shadow-[0_1px_0_0_#090A0C,0_1px_0_1px_rgba(255,255,255,0.05)]`;
    }

    // Light Mode styling - Crisp studio architectural keycaps
    if (isActive) {
      return `${base} bg-[#F3E8FF] border-2 border-[#38003C] text-[#19001B] font-bold shadow-[0_3.5px_0_0_#CBD5E1,0_4px_0_1px_#38003C,inset_0_1px_0_0_rgba(255,255,255,0.9)] active:shadow-[0_1px_0_0_#CBD5E1,0_1px_0_1px_#38003C]`;
    }

    return `${base} bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#475569] hover:text-[#19001B] shadow-[0_3.5px_0_0_#CBD5E1,0_4px_0_1px_#E2E8F0,inset_0_1px_0_0_rgba(255,255,255,0.9)] active:shadow-[0_1px_0_0_#CBD5E1,0_1px_0_1px_#E2E8F0]`;
  };

  const getNavIconClasses = (isActive: boolean) => {
    if (isLight) {
      if (isActive) {
        return "text-[#38003C]";
      }
      return "text-slate-500 group-hover:text-[#19001B]";
    }
    if (isActive) {
      return "text-[#00FF87]";
    }
    return "text-slate-400 group-hover:text-slate-200";
  };

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-white/[0.07] light:border-[#E2E8F0] bg-[#090A0C]/95 light:bg-white/95 backdrop-blur-md shadow-md light:shadow-sm w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18">
        {/* Brand / Logo */}
        <Link href="/" prefetch={true} className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#38003C] to-[#200022] p-1.5 sm:p-2 flex items-center justify-center shadow-lg shadow-[#38003C]/40 light:shadow-[#38003C]/20 border border-[#7B1FA2]/40 light:border-[#38003C]/30 group-hover:scale-105 group-hover:border-[#7B1FA2]/70 transition-transform duration-200">
            <PremierLeagueLion
              fill="#FFFFFF"
              className="w-full h-full pl-lion-crest text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-lg text-white light:text-[#19001B]">
                PREMIER LEAGUE
              </span>
            </div>
            <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-400 light:text-slate-500 font-semibold truncate max-w-[125px] sm:max-w-none">
              Monte Carlo Engine • 10,000 Sims
            </p>
          </div>
        </Link>

        {/* Navigation Tabs - Free-standing Tactile 3D Keycaps */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5 shrink-0 py-2">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                className={getNavButtonClasses(isActive)}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 shrink-0 ${getNavIconClasses(
                    isActive
                  )}`}
                />
                <span className="whitespace-nowrap">{label}</span>
                {isActive && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-150 ease-out ${
                      isLight
                        ? "bg-[#38003C] shadow-[0_0_5px_rgba(56,0,60,0.4)]"
                        : "bg-[#00FF87] shadow-[0_0_5px_#00FF87]"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster: Theme Toggle & Model Status Badge */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2.5 z-20">
          {/* Tactile 3D Keycap Theme Toggle Button - 44x44px touch target on mobile */}
          <button
            type="button"
            onClick={handleToggleTheme}
            suppressHydrationWarning
            aria-label={isLight ? "Switch to Dark Mode" : "Switch to Broadcast Light Mode"}
            title={isLight ? "Switch to Dark Mode" : "Switch to Broadcast Light Mode"}
            className={`group relative z-30 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[44px] min-w-[44px] rounded-xl font-semibold text-xs transition-all duration-150 ease-out select-none cursor-pointer shrink-0 -translate-y-[2px] active:translate-y-[1px] ${
              isLight
                ? "bg-white hover:bg-slate-50 border border-[#CBD5E1] hover:border-[#94A3B8] text-[#19001B] shadow-[0_3.5px_0_0_#CBD5E1,0_4px_0_1px_#CBD5E1,inset_0_1px_0_0_rgba(255,255,255,0.8)] active:shadow-[0_1px_0_0_#CBD5E1,0_1px_0_1px_#CBD5E1]"
                : "bg-[#16181D] hover:bg-[#1E2128] border border-white/[0.08] hover:border-white/[0.14] text-slate-200 hover:text-white shadow-[0_3.5px_0_0_#090A0C,0_4px_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.08)] active:shadow-[0_1px_0_0_#090A0C]"
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-[#38003C] group-hover:-rotate-12 transition-transform duration-200 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-[#19001B]">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-[#00FF87] group-hover:rotate-45 transition-transform duration-200 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-slate-200">Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav row with swipe affordance fade gradient */}
      <div className="md:hidden relative border-t border-white/[0.07] light:border-[#E2E8F0] bg-[#111317] light:bg-white shadow-md light:shadow-sm select-none">
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-3 py-2.5 w-full touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                className={getNavButtonClasses(isActive)}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-150 group-hover:scale-110 shrink-0 ${getNavIconClasses(
                    isActive
                  )}`}
                />
                <span className="whitespace-nowrap">{label}</span>
                {isActive && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-150 ease-out ${
                      isLight
                        ? "bg-[#38003C] shadow-[0_0_5px_rgba(56,0,60,0.4)]"
                        : "bg-[#00FF87] shadow-[0_0_5px_#00FF87]"
                    }`}
                  />
                )}
              </Link>
            );
          })}
          {/* Right edge scroll spacer so last item is never clipped or glued to boundary */}
          <div className="w-8 shrink-0" aria-hidden="true" />
        </div>

        {/* Left-edge soft fade gradient mask */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#111317] to-transparent light:from-white light:to-transparent z-10"
          aria-hidden="true"
        />

        {/* Right-edge soft fade gradient mask indicating more scrollable content */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#111317] via-[#111317]/80 to-transparent light:from-white light:via-white/80 light:to-transparent z-10"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
