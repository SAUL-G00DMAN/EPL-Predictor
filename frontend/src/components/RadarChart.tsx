"use client";

import React from "react";

export interface RadarMetric {
  label: string;
  value: number; // 0 to 100 normalized
  rawValue: string;
}

export interface RadarChartProps {
  metrics: RadarMetric[];
  size?: number;
  primaryColor?: string;
  secondaryMetrics?: RadarMetric[];
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function RadarChart({
  metrics,
  size = 320,
  primaryColor = "#04F5FF",
  secondaryMetrics,
  secondaryColor = "#E90052",
}: RadarChartProps) {
  const center = size / 2;
  const radius = center - 52;
  const numAxes = metrics.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (valueNormalized: number, index: number) => {
    // Start from top (- PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * (valueNormalized / 100);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build the polygon points string for primary team
  const dataPointsPrimary = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(Math.max(m.value, 10), i);
      return `${x},${y}`;
    })
    .join(" ");

  // Build the polygon points string for secondary team if provided
  const dataPointsSecondary = secondaryMetrics
    ? secondaryMetrics
        .map((m, i) => {
          const { x, y } = getCoordinates(Math.max(m.value, 10), i);
          return `${x},${y}`;
        })
        .join(" ")
    : null;

  return (
    <div className="relative flex items-center justify-center max-w-full overflow-hidden">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto overflow-visible select-none"
      >
        <defs>
          <radialGradient
            id="radarGlowPrimary"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.08" />
          </radialGradient>
          <radialGradient
            id="radarGlowSecondary"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {/* Concentric grid pentagons */}
        {levels.map((level, lvlIdx) => {
          const gridPoints = Array.from({ length: numAxes })
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = radius * level;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(" ");

          return (
            <polygon
              key={lvlIdx}
              points={gridPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis spokes */}
        {Array.from({ length: numAxes }).map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);

          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Secondary team data polygon (Team B - Magenta) */}
        {dataPointsSecondary && (
          <polygon
            points={dataPointsSecondary}
            fill="url(#radarGlowSecondary)"
            stroke={secondaryColor}
            strokeWidth="2.5"
            className="transition-all duration-700 filter drop-shadow-[0_0_10px_rgba(233,0,82,0.4)]"
          />
        )}

        {/* Primary team data polygon (Team A - Cyan) */}
        <polygon
          points={dataPointsPrimary}
          fill="url(#radarGlowPrimary)"
          stroke={primaryColor}
          strokeWidth="2.5"
          className="transition-all duration-700 filter drop-shadow-[0_0_10px_rgba(4,245,255,0.4)]"
        />

        {/* Secondary team vertex markers */}
        {secondaryMetrics &&
          secondaryMetrics.map((m, i) => {
            const { x, y } = getCoordinates(Math.max(m.value, 10), i);
            return (
              <circle
                key={`sec-${i}`}
                cx={x}
                cy={y}
                r="4.5"
                fill={secondaryColor}
                stroke="#07070b"
                strokeWidth="2"
                className="filter drop-shadow-[0_0_6px_rgba(233,0,82,0.9)]"
              />
            );
          })}

        {/* Primary team vertex markers */}
        {metrics.map((m, i) => {
          const { x, y } = getCoordinates(Math.max(m.value, 10), i);
          return (
            <circle
              key={`pri-${i}`}
              cx={x}
              cy={y}
              r="4.5"
              fill={primaryColor}
              stroke="#07070b"
              strokeWidth="2"
              className="filter drop-shadow-[0_0_6px_rgba(4,245,255,0.9)]"
            />
          );
        })}

        {/* Axis labels */}
        {metrics.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 32;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);

          if (secondaryMetrics && secondaryMetrics[i]) {
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-bold select-none"
              >
                <tspan x={x} dy="-0.4em" className="fill-white font-extrabold text-xs">
                  {m.label}
                </tspan>
                <tspan x={x} dy="1.3em" className="font-mono text-[10px]">
                  <tspan fill={primaryColor} className="font-bold">
                    {m.rawValue}
                  </tspan>
                  <tspan fill="#64748b"> vs </tspan>
                  <tspan fill={secondaryColor} className="font-bold">
                    {secondaryMetrics[i].rawValue}
                  </tspan>
                </tspan>
              </text>
            );
          }

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-bold fill-slate-300 select-none"
            >
              <tspan x={x} dy="-0.3em" className="fill-white font-extrabold">
                {m.label}
              </tspan>
              <tspan
                x={x}
                dy="1.2em"
                className="fill-[#04F5FF] font-mono text-[10px]"
              >
                {m.rawValue}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
