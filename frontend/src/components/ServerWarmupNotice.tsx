"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export function ServerWarmupNotice() {
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [manuallyDismissed, setManuallyDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const requestTimers = new Map<number, NodeJS.Timeout>();
    let reqCounter = 0;

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] && "url" in args[0]
          ? (args[0] as Request).url
          : "";

      // Check if request is targeting our backend API
      const isApiCall =
        url.includes("predictions") ||
        url.includes("teams") ||
        url.includes("8000") ||
        url.includes("onrender.com") ||
        (process.env.NEXT_PUBLIC_API_URL &&
          url.includes(process.env.NEXT_PUBLIC_API_URL));

      if (!isApiCall) {
        return originalFetch.apply(this, args);
      }

      const id = ++reqCounter;

      // Trigger cold-start warmup notice if request takes longer than 2.5 seconds
      const timer = setTimeout(() => {
        setIsWarmingUp(true);
        setManuallyDismissed(false);
      }, 2500);
      requestTimers.set(id, timer);

      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        const t = requestTimers.get(id);
        if (t) {
          clearTimeout(t);
          requestTimers.delete(id);
        }

        // When all pending slow requests have finished, dismiss the notice
        if (requestTimers.size === 0) {
          setIsWarmingUp(false);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
      requestTimers.forEach(clearTimeout);
      requestTimers.clear();
    };
  }, []);

  if (!isWarmingUp || manuallyDismissed) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="glass-panel bg-[#12121C]/95 light:bg-white/95 border border-[#38BDF8]/40 light:border-slate-200 shadow-2xl shadow-black/80 light:shadow-slate-300/60 rounded-2xl p-4 sm:p-4.5 flex items-start gap-3.5 backdrop-blur-xl transition-colors duration-300">
        {/* Animated Spinning Football Icon */}
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D195B] to-[#E90052] flex items-center justify-center shrink-0 border border-white/20 shadow-md shadow-[#E90052]/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-white animate-spin duration-1000"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Soccer ball geometry */}
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 8.5 10.5 9.8 14.5 14.2 14.5 15.5 10.5 12 8" />
            <path d="M12 2v6" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l4.24 3.57" />
            <path d="M19.07 4.93l-4.24 3.57" />
            <path d="M4.93 19.07l4.87-4.57" />
            <path d="M19.07 19.07l-4.87-4.57" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF85] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF85]"></span>
          </span>
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-white light:text-[#19001B] tracking-tight leading-snug">
            Waking up the Monte Carlo engine on the cloud...
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            First boot may take ~20s as free-tier instances spin up.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setManuallyDismissed(true)}
          className="text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-900 p-1 rounded-lg hover:bg-white/10 light:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
