/**
 * ParameterMap.tsx – 2D Flight Evidence Parameter Distribution Map (SVG + anime.js).
 *
 * Visualizes where the user's habitat scenario sits relative to real NASA flight runs:
 *   - X-axis: Gravity regime bands (Orbital 0g, Moon 0.16g, Mars 0.38g, Earth 1g)
 *   - Y-axis: Oxygen concentration (% O2, 15% to 40%)
 *   - Dots: NASA flight runs colored by experiment family, sized by chamber pressure (kPa)
 *   - User Scenario: Pulsing beacon marker (frozen on reduced motion)
 *   - Animated connector lines: anime.js drawPath stroke-dashoffset to top 3 matches
 *   - Interactive tooltip & click to navigate to /experiment/:id
 *   - Accessible text alternative (hidden data table) and full legend
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Compass, ExternalLink } from 'lucide-react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import type { EvidenceMatch, ScenarioInput } from '../types/api';
import { drawPath } from '../visuals/anime';
import { useReducedMotion } from '../visuals/useReducedMotion';

interface Props {
  matches: EvidenceMatch[];
  scenario: ScenarioInput;
  className?: string;
}

// ---------------------------------------------------------------------------
// Experiment Family Palette & Gravity Bands
// ---------------------------------------------------------------------------

const FAMILY_COLORS: Record<string, string> = {
  BASS: '#F97316',      // Warm amber
  Saffire: '#38BDF8',   // Electric sky cyan
  FLEX: '#10B981',      // Emerald green
  ACME: '#A855F7',      // Atmospheric purple
  BRE: '#EC4899',       // Deep rose
  CIR: '#EAB308',       // Golden
  DEFAULT: '#94A3B8',   // Slate
};

function getFamilyColor(family?: string | null): string {
  if (!family) return FAMILY_COLORS.DEFAULT;
  const match = Object.keys(FAMILY_COLORS).find((k) =>
    family.toLowerCase().includes(k.toLowerCase()),
  );
  return match ? FAMILY_COLORS[match] : FAMILY_COLORS.DEFAULT;
}

const GRAVITY_BANDS = [
  { key: 'orbital', label: 'Orbital (0g)', g: 0.0, centerPct: 0.18, minG: 0, maxG: 0.08 },
  { key: 'moon', label: 'Moon (0.16g)', g: 0.16, centerPct: 0.42, minG: 0.08, maxG: 0.27 },
  { key: 'mars', label: 'Mars (0.38g)', g: 0.38, centerPct: 0.68, minG: 0.27, maxG: 0.65 },
  { key: 'earth', label: 'Earth (1g)', g: 1.0, centerPct: 0.90, minG: 0.65, maxG: 1.5 },
];

// SVG Dimension Constants
const VIEW_BOX_WIDTH = 640;
const VIEW_BOX_HEIGHT = 360;
const PADDING = { top: 35, right: 35, bottom: 45, left: 55 };
const PLOT_WIDTH = VIEW_BOX_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = VIEW_BOX_HEIGHT - PADDING.top - PADDING.bottom;

// Oxygen scale: [15%, 40%]
const MIN_O2 = 15;
const MAX_O2 = 40;

function getYForO2(o2: number): number {
  const clamped = Math.max(MIN_O2, Math.min(MAX_O2, o2));
  const norm = (clamped - MIN_O2) / (MAX_O2 - MIN_O2);
  return PADDING.top + (1 - norm) * PLOT_HEIGHT;
}

function getXForGravity(env?: string | null, customG?: number | null): number {
  let effectiveG = 0;
  if (customG != null) {
    effectiveG = customG;
  } else if (env === 'partial_gravity_lunar') {
    effectiveG = 0.16;
  } else if (env === 'partial_gravity_mars') {
    effectiveG = 0.38;
  } else if (env === 'earth_gravity') {
    effectiveG = 1.0;
  }

  if (effectiveG < 0.08) return PADDING.left + PLOT_WIDTH * 0.18;
  if (effectiveG < 0.27) return PADDING.left + PLOT_WIDTH * 0.42;
  if (effectiveG < 0.65) return PADDING.left + PLOT_WIDTH * 0.68;
  return PADDING.left + PLOT_WIDTH * 0.90;
}

export const ParameterMap: React.FC<Props> = React.memo(({ matches, scenario, className = '' }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // User scenario coordinates
  const userO2 = scenario.oxygen_pct ?? 21.0;
  const userG = 'gravity_g' in scenario && typeof scenario.gravity_g === 'number'
    ? scenario.gravity_g
    : scenario.gravity_environment === 'earth_gravity'
    ? 1.0
    : scenario.gravity_environment === 'partial_gravity_mars'
    ? 0.38
    : scenario.gravity_environment === 'partial_gravity_lunar'
    ? 0.16
    : 0.0;

  const userPoint = useMemo(() => ({
    x: getXForGravity(scenario.gravity_environment, userG),
    y: getYForO2(userO2),
  }), [scenario.gravity_environment, userG, userO2]);

  // Plotted flight run items with jitter to prevent exact overlaps within bands
  const plottedPoints = useMemo(() => {
    return matches.map((m, idx) => {
      const runO2 = m.run.oxygen_pct ?? 21.0;
      const runG = m.run.gravity_environment;
      const baseCenterX = getXForGravity(runG);
      const baseY = getYForO2(runO2);

      // Subtle deterministic horizontal spread within band
      const jitterX = ((idx % 5) - 2) * 12;
      const jitterY = (((idx * 3) % 5) - 2) * 4;

      const pressure = m.run.pressure_kpa ?? 101.3;
      // Dot size by pressure (clamped 4.5 .. 8.5)
      const radius = Math.max(4.5, Math.min(8.5, 4.5 + ((pressure - 50) / 60) * 3.5));

      return {
        match: m,
        rank: idx + 1,
        x: baseCenterX + jitterX,
        y: baseY + jitterY,
        radius,
        color: getFamilyColor(m.experiment.experiment_family),
      };
    });
  }, [matches]);

  // Top 3 matches for connector lines
  const topThree = useMemo(() => plottedPoints.slice(0, 3), [plottedPoints]);

  // Anime.js connector line draw-in
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    pathRefs.current.forEach((pathEl, i) => {
      if (pathEl) {
        const cleanup = drawPath(pathEl, {
          duration: 1200,
          delay: i * 150,
          easing: 'outQuad',
        });
        if (cleanup) cleanups.push(cleanup);
      }
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [topThree, userPoint]);

  // Interactive Hover Tooltip State
  const [hovered, setHovered] = useState<{
    point: typeof plottedPoints[0];
    screenX: number;
    screenY: number;
  } | null>(null);

  // Check if any flight data is missing
  const hasValidData = matches.length > 0;

  return (
    <Card variant="glass" padding="none" className={`border-sky-500/25 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="strong" size="xs">
            PARAMETER SPACE
          </Badge>
          <span className="text-xs sm:text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Flight Evidence Distribution vs Your Scenario</span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Showing {matches.length} candidate flight runs
        </span>
      </div>

      {/* Main SVG Visualization Canvas */}
      <div className="relative w-full bg-[#05070E] p-2 sm:p-4 select-none">
        <svg
          viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          className="w-full h-auto max-h-[380px]"
          role="img"
          aria-label={`2D flight parameter map plotting gravity regimes against oxygen percentages for ${matches.length} NASA flight runs`}
        >
          <defs>
            {/* Background grid pattern */}
            <pattern id="paramGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>

            {/* User marker radial gradient glow */}
            <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid background */}
          <rect
            x={PADDING.left}
            y={PADDING.top}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            fill="url(#paramGrid)"
            className="opacity-60"
          />

          {/* Categorical Gravity Bands & Dividing Guides */}
          {GRAVITY_BANDS.map((band, idx) => {
            const bandCenterX = PADDING.left + PLOT_WIDTH * band.centerPct;
            return (
              <g key={band.key}>
                {/* Vertical column band shading */}
                <rect
                  x={bandCenterX - PLOT_WIDTH * 0.11}
                  y={PADDING.top}
                  width={PLOT_WIDTH * 0.22}
                  height={PLOT_HEIGHT}
                  fill={idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                />

                {/* Vertical Center Axis Guide */}
                <line
                  x1={bandCenterX}
                  y1={PADDING.top}
                  x2={bandCenterX}
                  y2={PADDING.top + PLOT_HEIGHT}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="2 4"
                />

                {/* X Axis Band Label */}
                <text
                  x={bandCenterX}
                  y={PADDING.top + PLOT_HEIGHT + 20}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {band.label}
                </text>
              </g>
            );
          })}

          {/* Y Axis Grid Lines & Ticks (Oxygen %) */}
          {[15, 21, 28, 35].map((o2) => {
            const y = getYForO2(o2);
            return (
              <g key={o2}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + PLOT_WIDTH}
                  y2={y}
                  stroke={o2 === 21 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeDasharray={o2 === 21 ? 'none' : '3 3'}
                  strokeWidth={o2 === 21 ? 1.5 : 1}
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={o2 === 21 ? '#38BDF8' : '#64748B'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {o2}%
                </text>
              </g>
            );
          })}

          {/* Axis Titles */}
          <text
            x={PADDING.left + PLOT_WIDTH / 2}
            y={VIEW_BOX_HEIGHT - 6}
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize="11"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="bold"
          >
            Gravity Regime (Effective Convection Band)
          </text>

          <text
            x={-PADDING.top - PLOT_HEIGHT / 2}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize="11"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="bold"
          >
            Oxygen Concentration (% O₂)
          </text>

          {/* Animated Connector Lines to Top 3 Matches */}
          {topThree.map((pt, i) => (
            <path
              key={`line-${pt.match.run.id || i}`}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={`M ${userPoint.x} ${userPoint.y} Q ${(userPoint.x + pt.x) / 2} ${(userPoint.y + pt.y) / 2 - 12} ${pt.x} ${pt.y}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={1.8 - i * 0.3}
              strokeDasharray="4 3"
              strokeOpacity={0.7 - i * 0.15}
            />
          ))}

          {/* NASA Flight Run Dots */}
          {plottedPoints.map((pt) => {
            const isTop3 = pt.rank <= 3;
            return (
              <g
                key={pt.match.run.id || pt.rank}
                className="cursor-pointer transition-transform duration-150 group"
                onClick={() => navigate(`/experiment/${pt.match.experiment.id}`)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHovered({ point: pt, screenX: rect.x, screenY: rect.y });
                }}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Glow ring for top 3 matches */}
                {isTop3 && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.radius + 3.5}
                    fill="none"
                    stroke={pt.color}
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                  />
                )}

                {/* Primary Data Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.radius}
                  fill={pt.color}
                  stroke="#0F172A"
                  strokeWidth="1.5"
                  className="transition-all hover:scale-125"
                />

                {/* Rank number badge on top match */}
                {pt.rank === 1 && (
                  <text
                    x={pt.x}
                    y={pt.y - pt.radius - 4}
                    textAnchor="middle"
                    fill="#F97316"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    #1
                  </text>
                )}
              </g>
            );
          })}

          {/* User Habitat Scenario Pulsing Marker */}
          <g>
            {/* Animated Pulsing Outer Ring (suppressed if reduced motion) */}
            {!shouldReduceMotion && (
              <circle
                cx={userPoint.x}
                cy={userPoint.y}
                r="16"
                fill="url(#userGlow)"
                className="animate-ping"
                style={{ animationDuration: '2.5s' }}
              />
            )}

            {/* Static Halo */}
            <circle
              cx={userPoint.x}
              cy={userPoint.y}
              r="10"
              fill="rgba(56, 189, 248, 0.25)"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />

            {/* Core user beacon center */}
            <circle cx={userPoint.x} cy={userPoint.y} r="4.5" fill="#FFFFFF" />

            {/* Scenario Label Tag */}
            <g transform={`translate(${userPoint.x + 12}, ${userPoint.y - 10})`}>
              <rect x="0" y="0" width="94" height="18" rx="4" fill="#0A0F1D" stroke="#38BDF8" strokeWidth="1" />
              <text x="6" y="12" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                YOUR HABITAT
              </text>
            </g>
          </g>
        </svg>

        {/* Hover Floating Tooltip */}
        {hovered && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-md"
            style={{
              left: Math.max(10, Math.min(PLOT_WIDTH, hovered.point.x - 60)),
              top: Math.max(10, hovered.point.y - 85),
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="font-bold text-white truncate max-w-[180px]">
                {hovered.point.match.experiment.title}
              </span>
              <span className="text-orange-400 font-bold">
                {Math.round(hovered.point.match.similarity_score * 100)}% Match
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <p>
                <span className="text-slate-400">Campaign: </span>
                <span style={{ color: hovered.point.color }} className="font-semibold">
                  {hovered.point.match.experiment.experiment_family}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Run: </span>
                <span>{hovered.point.match.run.run_label || hovered.point.match.run.id.slice(0, 8)}</span>
              </p>
              <p>
                <span className="text-slate-400">Conditions: </span>
                <span className="text-cyan-300">
                  {hovered.point.match.run.oxygen_pct ?? 21}% O₂, {hovered.point.match.run.pressure_kpa ?? 101.3} kPa
                </span>
              </p>
            </div>
            <p className="text-[10px] text-sky-400 font-sans flex items-center gap-1 pt-0.5">
              <span>Click to open flight details</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </p>
          </div>
        )}
      </div>

      {/* Legend & Metadata Footer */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Experiment Families Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 flex items-center gap-1.5 font-sans">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Campaigns:</span>
          </span>
          {Object.entries(FAMILY_COLORS).filter(([k]) => k !== 'DEFAULT').map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[11px]">{name}</span>
            </div>
          ))}
        </div>

        {/* Pressure & Scenario Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="w-3 h-3 rounded-full bg-slate-400" />
            <span>Dot Size = Chamber Pressure</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-cyan-400" />
            <span>Target Scenario</span>
          </div>
        </div>
      </div>

      {/* Accessible Screen Reader Table Alternative */}
      <div className="sr-only">
        <h4>Flight Evidence Condition Comparison Table</h4>
        <table>
          <caption>Comparison between target habitat scenario and matched NASA flight experiments</caption>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Experiment</th>
              <th>Campaign</th>
              <th>Gravity Band</th>
              <th>Oxygen %</th>
              <th>Pressure (kPa)</th>
              <th>Similarity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Target</td>
              <td>Your Configured Scenario</td>
              <td>Custom</td>
              <td>{scenario.gravity_environment || 'microgravity'}</td>
              <td>{userO2}%</td>
              <td>{scenario.pressure_kpa ?? 101.3} kPa</td>
              <td>100%</td>
            </tr>
            {matches.map((m, i) => (
              <tr key={m.run.id || i}>
                <td>#{i + 1}</td>
                <td>{m.experiment.title}</td>
                <td>{m.experiment.experiment_family}</td>
                <td>{m.run.gravity_environment || 'microgravity'}</td>
                <td>{m.run.oxygen_pct}%</td>
                <td>{m.run.pressure_kpa} kPa</td>
                <td>{Math.round(m.similarity_score * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasValidData && (
        <div className="p-4 bg-amber-500/10 border-t border-amber-500/20 text-center text-xs text-amber-300">
          Run-level condition data is currently being fetched or no candidate matches met the threshold.
        </div>
      )}
    </Card>
  );
});

export default ParameterMap;

