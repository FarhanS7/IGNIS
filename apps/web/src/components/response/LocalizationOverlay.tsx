import React from 'react';
import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';
import { getReticleDisplay } from './reticleDisplay.ts';
export { getReticleDisplay };

export interface LocalizationOverlayProps {
  habitat: HabitatGraph;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
  containerWidth?: number;
  containerHeight?: number;
}

export const LocalizationOverlay: React.FC<LocalizationOverlayProps> = ({
  habitat,
  timeline,
  frameState,
  t,
}) => {
  const loc = timeline.localization;
  const isAvailable = t >= loc.availableAt_s && !frameState.isFireExtinguished;

  if (!isAvailable) {
    return null;
  }

  const { label, isAmber } = getReticleDisplay(loc, habitat);
  const zones = habitat.zones;
  const zoneCount = zones.length;
  const sourceZoneId = loc.sourceZoneId;
  const sourceIndex = Math.max(0, zones.findIndex((z) => z.id === sourceZoneId));

  // Normalized horizontal position for localized module in viewport (percentage)
  const normX = ((sourceIndex + 0.5) / zoneCount) * 100;
  const normY = 52; // slightly above vertical center

  // Time elapsed since localization became available
  const age = Math.max(0, t - loc.availableAt_s);
  const ringScale = Math.min(1.0, age / 2.0);
  const ringOpacity = Math.max(0.1, 1.0 - (age % 2.5) / 2.5);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      {/* SVG Convergence Rings and Reticle */}
      <svg className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
        {/* Converging sensor wave rings */}
        <circle
          cx={`${normX}%`}
          cy={`${normY}%`}
          r={Math.max(12, 60 * (1 - ringScale * 0.5))}
          fill="none"
          stroke={isAmber ? '#ffb53b' : '#3ad7ff'}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity={ringOpacity * 0.7}
        />
        <circle
          cx={`${normX}%`}
          cy={`${normY}%`}
          r={Math.max(18, 95 * (1 - ringScale * 0.4))}
          fill="none"
          stroke={isAmber ? '#ffb53b' : '#3ad7ff'}
          strokeWidth="1"
          opacity={ringOpacity * 0.4}
        />
      </svg>

      {/* Center Target & Brackets */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: `${normX}%`, top: `${normY}%` }}
      >
        {/* Corner Reticle Brackets */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          {/* Top-left */}
          <div
            className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${
              isAmber ? 'border-amber-400' : 'border-red-500'
            }`}
          />
          {/* Top-right */}
          <div
            className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${
              isAmber ? 'border-amber-400' : 'border-red-500'
            }`}
          />
          {/* Bottom-left */}
          <div
            className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${
              isAmber ? 'border-amber-400' : 'border-red-500'
            }`}
          />
          {/* Bottom-right */}
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${
              isAmber ? 'border-amber-400' : 'border-red-500'
            }`}
          />

          {/* Center Crosshair Dot */}
          <div
            className={`w-2 h-2 rounded-full ${
              isAmber ? 'bg-amber-400' : 'bg-red-400'
            } animate-ping opacity-75`}
          />
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isAmber ? 'bg-amber-400' : 'bg-white'
            }`}
          />
        </div>

        {/* Reticle Lock Badge */}
        <div
          className={`mt-2 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase border shadow-lg backdrop-blur-md whitespace-nowrap transition-all ${
            isAmber
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-amber-950/50'
              : 'bg-red-950/85 border-red-500/90 text-white shadow-red-950/60'
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
