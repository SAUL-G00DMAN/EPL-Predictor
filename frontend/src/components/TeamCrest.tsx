"use client";

import React, { useState, useEffect } from "react";
import { getTeamMetadata } from "@/data/teams";

interface TeamCrestProps {
  team: string;
  size?: number;
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

export const TeamCrest = React.memo(function TeamCrest({
  team,
  size = 32,
  className = "",
  showName = false,
  nameClassName = "font-medium text-slate-200",
}: TeamCrestProps) {
  const [hasError, setHasError] = useState(false);
  const meta = getTeamMetadata(team);

  // Reset error state if team or crest URL changes
  useEffect(() => {
    setHasError(false);
  }, [team, meta.crestUrl]);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{
          width: size,
          height: size,
        }}
      >
        {!hasError && meta.crestUrl ? (
          <img
            src={meta.crestUrl}
            alt={`${team} crest`}
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          />
        ) : (
          <span
            className="font-black text-xs uppercase tracking-wider text-white select-none flex items-center justify-center w-full h-full rounded-full border border-white/20"
            style={{ backgroundColor: meta.primaryColor }}
          >
            {meta.shortName}
          </span>
        )}
      </div>

      {showName && (
        <span className={`truncate ${nameClassName}`}>
          {meta.name}
        </span>
      )}
    </div>
  );
});
