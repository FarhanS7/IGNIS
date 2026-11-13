import React from 'react';
import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';

export interface StationFallback2DProps {
  habitat: HabitatGraph;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  userAzimuthOffset?: number;
  userElevationOffset?: number;
  userZoomOffset?: number;
  layers?: any;
}

export const StationFallback2D: React.FC<StationFallback2DProps> = ({
  habitat,
  timeline,
  frameState,
  t,
  selectedZoneId,
  onSelectZone,
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
          const isSelected = zone.id === selectedZoneId;

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
            <g
              key={zone.id}
              onClick={() => onSelectZone?.(zone.id)}
              className="cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={`Inspect ${zone.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectZone?.(zone.id);
                }
              }}
            >
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
                stroke={isSelected ? '#ffffff' : borderColor}
                strokeWidth={isSelected ? 3.0 : isOrigin && isAlarmed ? 2.5 : 1.5}
                filter={isAlarmed || isSelected ? 'url(#glowFilter)' : undefined}
              />

              {/* Selection Halo Ring */}
              {isSelected && (
                <rect
                  x={x - 4}
                  y={y - 4}
                  width={modWidth + 8}
                  height={modHeight + 8}
                  rx="18"
                  fill="none"
                  stroke="#3ad7ff"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.85"
                />
              )}

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

              {/* Smoke Cloud representation */}
              {obs > 0.05 && (
                <circle
                  cx={x + modWidth / 2}
                  cy={y + modHeight / 2}
                  r={Math.min(modWidth / 2 - 10, 20 + obs * 80)}
                  fill="url(#smokeCloud2D)"
                  opacity={Math.min(0.85, obs * 0.9)}
                />
              )}

              {/* Microgravity Spherical Diffusion Flame (Origin only) */}
              {isOrigin && !frameState.isFireExtinguished && t > 0.5 && (
                <circle
                  cx={x + modWidth / 2 - 15}
                  cy={y + modHeight / 2 + 10}
                  r={frameState.isSuppressionActive ? 12 : 24}
                  fill="url(#microgFlame2D)"
                  filter="url(#glowFilter)"
                />
              )}

              {/* Module Name Label */}
              <rect
                x={x + 10}
                y={y - 28}
                width={modWidth - 20}
                height="22"
                rx="4"
                fill="#02050a"
                stroke="#1e324d"
                strokeWidth="1"
              />
              <text
                x={x + modWidth / 2}
                y={y - 14}
                fill={isSelected ? '#3ad7ff' : '#d8e5f2'}
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                letterSpacing="0.05em"
              >
                {shortLabel.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default StationFallback2D;
