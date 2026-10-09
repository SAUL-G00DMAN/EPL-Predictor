"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  scrollOffset?: number;
  label?: string;
  className?: string;
}

export function ScrollIndicator({
  scrollOffset = 350,
  label = "Scroll for Results & Analysis",
  className = "",
}: ScrollIndicatorProps) {
  const handleScroll = () => {
    window.scrollBy({ top: scrollOffset, behavior: "smooth" });
  };

  return (
    <div className={`block sm:hidden flex flex-col items-center justify-center py-1 ${className}`}>
      <button
        type="button"
        onClick={handleScroll}
        className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group select-none active:scale-95"
        aria-label="Scroll down to view content"
      >
        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 tracking-wider uppercase">
          {label}
        </span>
        <div className="w-7 h-7 rounded-full bg-[#151C28] border border-slate-700/80 flex items-center justify-center shadow-sm">
          <ChevronDown className="w-4 h-4 text-[#00FF85] animate-bounce" />
        </div>
      </button>
    </div>
  );
}
