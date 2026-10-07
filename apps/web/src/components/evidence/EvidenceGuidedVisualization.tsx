import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Info, Wind } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import type { ScenarioInput } from '../../types/api';

interface Props {
  scenario: ScenarioInput;
  comparableCount: number;
}

export const EvidenceGuidedVisualization: React.FC<Props> = ({
  scenario,
  comparableCount,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Deterministic physical flame geometry rules (FR-EGV-003)
  const isMicrogravity =
    scenario.gravity_environment === 'microgravity' || !scenario.gravity_environment;
  const isLunar = scenario.gravity_environment === 'partial_gravity_lunar';
  const isMars = scenario.gravity_environment === 'partial_gravity_mars';

  const o2 = scenario.oxygen_pct ?? 21.0;
  const airflow = scenario.airflow_cm_s ?? 5.0;

  // Flame scale and elongation
  const flameBaseRadius = Math.max(30, Math.min(65, 35 + (o2 - 21) * 1.5));
  const flameHeightMultiplier = isMicrogravity
    ? 1.0 // Perfect spherical dome
    : isLunar
    ? 1.25 // Slight elongation in 1/6th g
    : isMars
    ? 1.45 // Moderate elongation in 0.38g
    : 1.8; // Terrestrial buoyant teardrop

  // Downstream flame tilt based on forced ventilation airflow
  const downstreamTilt = Math.min(25, airflow * 1.2);

  const flameColorOuter =
    o2 > 28
      ? 'rgba(255, 87, 34, 0.65)' // Rich bright orange-red
      : o2 < 19
      ? 'rgba(56, 189, 248, 0.7)' // Dim cold blue
      : 'rgba(245, 158, 11, 0.6)'; // Nominal golden-blue

  const flameColorCore =
    o2 > 28
      ? 'rgba(254, 240, 138, 0.95)' // Brilliant yellow-white
      : o2 < 19
      ? 'rgba(125, 211, 252, 0.85)' // Pale blue
      : 'rgba(253, 186, 116, 0.9)'; // Amber core

  return (
    <Card variant="glass" padding="none" className="border-sky-500/20 overflow-hidden">
      {/* Top Banner with Controls and Mandatory FR-EGV-002 Label */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="plasma" size="xs">
            EVIDENCE-GUIDED VIZ (FR-EGV-001)
          </Badge>
          <span className="text-xs font-semibold text-white font-['Space_Grotesk',sans-serif]">
            Physical Regime Visualization
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* FR-EGV-004: Toggle display */}
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isVisible ? 'Minimize Canvas' : 'Expand Canvas'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Persistent Non-Simulation Label (FR-EGV-002) */}
      <div className="px-4 py-2 bg-black/60 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-amber-300">
        <div className="flex items-center gap-1.5 font-mono">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider">Scientific Disclaimer:</span>
          <span className="text-slate-300">
            Illustrative evidence-guided visualization — not a validated physical simulation (PRD v1.1 §16.6)
          </span>
        </div>
        <span className="text-slate-500 font-mono hidden sm:inline">
          Ground truth: {comparableCount} flight runs
        </span>
      </div>

      {/* Interactive Visual Canvas */}
      {isVisible && (
        <div className="relative w-full h-72 sm:h-80 bg-[#05070E] flex items-center justify-center overflow-hidden">
          {/* Background grid markings for laboratory context */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, #38BDF8 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Airflow velocity vector indicator */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-slate-800 text-xs font-mono text-cyan-300">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Airflow: {airflow} cm/s →</span>
          </div>

          {/* Regime Badge */}
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/70 border border-slate-800 text-xs font-mono text-slate-300">
            <span>Regime: </span>
            <span className="text-orange-400 font-semibold">
              {isMicrogravity
                ? 'Spherical Diffusion (0g)'
                : isLunar
                ? 'Weak Buoyancy (0.16g)'
                : isMars
                ? 'Partial Buoyancy (0.38g)'
                : 'Convective Plume (1g)'}
            </span>
          </div>

          {/* Animated SVG Flame Geometry */}
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full max-w-lg filter drop-shadow-[0_0_25px_rgba(255,87,34,0.25)]"
          >
            <defs>
              <radialGradient id="flameOuterGrad" cx="50%" cy="55%" r="50%">
                <stop offset="0%" stopColor={flameColorCore} stopOpacity="0.9" />
                <stop offset="50%" stopColor={flameColorOuter} stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="blueHaloGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
                <stop offset="70%" stopColor="rgba(2, 132, 199, 0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Fuel sample substrate plate */}
            <rect
              x="140"
              y="220"
              width="120"
              height="8"
              rx="3"
              fill="#334155"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <text
              x="200"
              y="245"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="10"
              fontFamily="monospace"
            >
              {scenario.material.toUpperCase()} SAMPLE
            </text>

            {/* Microgravity Blue Diffusion Halo */}
            {isMicrogravity && (
              <motion.circle
                cx={200 + downstreamTilt}
                cy={180}
                r={flameBaseRadius * 1.55}
                fill="url(#blueHaloGrad)"
                animate={{
                  scale: [1, 1.04, 0.98, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Main Outer Flame Envelope */}
            <motion.ellipse
              cx={200 + downstreamTilt}
              cy={180 - (flameHeightMultiplier - 1) * 20}
              rx={flameBaseRadius}
              ry={flameBaseRadius * flameHeightMultiplier}
              fill="url(#flameOuterGrad)"
              animate={{
                scale: [1, 1.03, 0.97, 1],
                rx: [flameBaseRadius, flameBaseRadius * 1.02, flameBaseRadius * 0.98, flameBaseRadius],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Inner High-Temperature Flame Core */}
            <motion.ellipse
              cx={200 + downstreamTilt * 0.7}
              cy={185 - (flameHeightMultiplier - 1) * 15}
              rx={flameBaseRadius * 0.5}
              ry={flameBaseRadius * 0.5 * flameHeightMultiplier}
              fill={flameColorCore}
              animate={{
                scale: [0.95, 1.05, 0.98, 0.95],
                opacity: [0.85, 0.95, 0.85],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Ignition Spark / Quench center */}
            <circle
              cx={200}
              cy={218}
              r="2.5"
              fill="#F97316"
              className="animate-ping"
            />
          </svg>

          {/* Bottom Telemetry Legend */}
          <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
            <span>O₂: {o2}% ({o2 > 21 ? 'Accelerated Growth' : 'Nominal Flux'})</span>
            <span>Pressure: {scenario.pressure_kpa ?? 101.3} kPa</span>
            <span>Gravity: {scenario.gravity_environment ?? '0g'}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
