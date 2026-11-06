import React from 'react';
import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';

export interface StationFallback2DProps {
  habitat: HabitatGraph;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
}

export const StationFallback2D: React.FC<StationFallback2DProps> = ({
  habitat,
  timeline,
  frameState,
  t,
}) => {
  const zones = habitat.zones;
  const zoneCount = zones.length;
  const originZoneId = timeline.scenario.sourceZoneId;

  // Step index
  const stepIdx = Math.min(
    timeline.steps.length - 1,
    Math.floor(t / timeline.dt_s)
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 relative select-none">
      <svg
        viewBox="0 0 1000 340"
        className="w-full h-full max-h-[500px]"
        role="img"
        aria-label="2D schematic cutaway of the space station habitat"
      >
        <defs>
          {/* Radial gradient for microgravity spherical flame */}
          <radialGradient id="microgFlame2D" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9f4ff" stopOpacity="1" />
            <stop offset="40%" stopColor="#3ad7ff" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#1e5080" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#04070d" stopOpacity="0" />
          </radialGradient>

          {/* Smoke diffusion gradient */}
          <radialGradient id="smokeCloud2D" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#aebfd3" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#7a92ad" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#09111c" stopOpacity="0" />
          </radialGradient>

          {/* Damper indicator filter */}
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Space Station Ambient Hull Backbone */}
        <rect
          x="40"
          y="40"
          width="920"
          height="260"
          rx="12"
          fill="#060c18"
          stroke="#1a2a42"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Modules & Ducts */}
        {zones.map((zone, idx) => {
          const modWidth = 180;
          const modHeight = 190;
          const startX = 60;
          const spacing = 230;
          const x = startX + idx * spacing;
          const y = 75;

          const series = timeline.zoneSeries[zone.id];
          const obs = series?.smokeObscuration[stepIdx] ?? 0;
          const co = series?.coPpm[stepIdx] ?? 0;
          const isAlarmed = obs >= 0.5 || co >= 15.0;
          const isOrigin = zone.id === originZoneId;

          // Border color: nominal cyan, advisory amber, alarm red
          let borderColor = '#3ad7ff';
          let fillColor = 'rgba(58, 215, 255, 0.05)';
          if (isOrigin && t >= (timeline.clocks.cal.alarmTime_s ?? 999)) {
            borderColor = '#ff4258';
            fillColor = 'rgba(255, 66, 88, 0.12)';
          } else if (isAlarmed) {
            borderColor = '#ffb53b';
            fillColor = 'rgba(255, 181, 59, 0.08)';
          }

          if (frameState.isPowerCut && isOrigin) {
            fillColor = 'rgba(10, 16, 26, 0.6)';
          }

          // Label: max 2 words
          const labelParts = zone.name.replace(/\(.*\)/, '').trim().split(/\s+/);
          const shortLabel = labelParts.slice(0, 2).join(' ');

          // Duct connecting to next module
          const hasNext = idx < zoneCount - 1;
          const ductX = x + modWidth;
          const ductY = y + modHeight / 2 - 12;
          const ductWidth = spacing - modWidth;
          const ductHeight = 24;

          return (
            <g key={zone.id}>
              {/* Ventilation Duct to next module */}
              {hasNext && (
                <g>
                  <rect
                    x={ductX}
                    y={ductY}
                    width={ductWidth}
                    height={ductHeight}
                    fill="#0a1526"
                    stroke={frameState.areVentsIsolated ? '#ff4258' : '#3ad7ff'}
                    strokeWidth="1.5"
                    opacity={frameState.areVentsIsolated ? 0.9 : 0.6}
                  />
                  {/* Duct Flow particles or Damper Blade */}
                  {frameState.areVentsIsolated ? (
                    <line
                      x1={ductX + ductWidth / 2}
                      y1={ductY - 4}
                      x2={ductX + ductWidth / 2}
                      y2={ductY + ductHeight + 4}
                      stroke="#ff4258"
                      strokeWidth="4"
                      filter="url(#glowFilter)"
                    />
                  ) : (
                    <line
                      x1={ductX + 6}
                      y1={ductY + ductHeight / 2}
                      x2={ductX + ductWidth - 6}
                      y2={ductY + ductHeight / 2}
                      stroke="#3ad7ff"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                  )}
                </g>
              )}

              {/* Module Translucent Container */}
              <rect
                x={x}
                y={y}
                width={modWidth}
                height={modHeight}
                rx="14"
                fill={fillColor}
                stroke={borderColor}
                strokeWidth={isOrigin && isAlarmed ? 2.5 : 1.5}
                filter={isAlarmed ? 'url(#glowFilter)' : undefined}
              />

              {/* Equipment Rack outlines inside module */}
              <rect
                x={x + 14}
                y={y + 110}
                width="42"
                height="65"
                rx="4"
                fill="none"
                stroke={borderColor}
                strokeWidth="1"
                opacity="0.4"
              />
              <rect
                x={x + 124}
                y={y + 110}
                width="42"
                height="65"
                rx="4"
                fill="none"
                stroke={borderColor}
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Sensor Node on wall */}
              <circle
                cx={x + modWidth / 2}
                cy={y + 12}
                r={isAlarmed ? 6 : 4}
                fill={borderColor}
                filter="url(#glowFilter)"
              />

              {/* Smoke Cloud (Zero upward buoyancy: stays centered/radial) */}
              {obs > 0.1 && (
                <ellipse
                  cx={x + modWidth / 2}
                  cy={y + modHeight / 2 + 10}
                  rx={Math.min(75, 25 + obs * 30)}
                  ry={Math.min(70, 25 + obs * 28)}
                  fill="url(#smokeCloud2D)"
                  opacity={Math.min(0.85, obs / 2.2)}
                />
              )}

              {/* Microgravity Spherical Flame (at origin zone only) */}
              {isOrigin && !frameState.isFireExtinguished && t > 0 && (
                <circle
                  cx={x + modWidth / 2}
                  cy={y + modHeight / 2 + 15}
                  r={Math.max(5, Math.min(32, 12 + Math.sqrt(t) * 3))}
                  fill="url(#microgFlame2D)"
                  filter="url(#glowFilter)"
                />
              )}

              {/* Suppression Mist Discharge */}
              {isOrigin && frameState.isSuppressionActive && (
                <rect
                  x={x + 4}
                  y={y + 4}
                  width={modWidth - 8}
                  height={modHeight - 8}
                  rx="10"
                  fill="#38e4a4"
                  opacity="0.25"
                />
              )}

              {/* Floating Zone Label (max 2 words) */}
              <text
                x={x + modWidth / 2}
                y={y - 12}
                textAnchor="middle"
                fill="#b9c7d8"
                fontSize="12"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
                letterSpacing="0.08em"
              >
                {shortLabel}
              </text>

              {/* Live Metric Readout */}
              <text
                x={x + modWidth / 2}
                y={y + modHeight - 12}
                textAnchor="middle"
                fill="#8a9bb1"
                fontSize="10"
                fontFamily="monospace"
              >
                {obs.toFixed(2)} %/m · {co.toFixed(0)} ppm
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-[10px] font-mono text-slate-500 mt-1">
        2D Microgravity Fallback View · Reduced Motion / Canvas Fallback
      </div>
    </div>
  );
};

