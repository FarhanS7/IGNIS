import React, { useState, Suspense, lazy } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Info, Wind } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import type { ScenarioInput } from '../../types/api';
import { deriveFlameParams, type FlameParams } from '../../visuals/flameParams';
import { useWebGLSupport } from '../../visuals/useWebGLSupport';
import { WebGLErrorBoundary } from '../../visuals/WebGLErrorBoundary';
import { DestinationBackdrop } from '../../visuals/DestinationBackdrop';

// Lazy-load Three.js 3D flame scene to prevent bundle bloat (FR-EGV-005)
const LazyFlameScene = lazy(() => import('../../visuals/FlameScene'));

interface Props {
  scenario: ScenarioInput;
  comparableCount: number;
  label?: string;
  compact?: boolean;
  destination?: string;
  compareScenario?: ScenarioInput;
  compareDestination?: string;
}


interface SvgFlameFallbackProps {
  scenario: ScenarioInput;
  destination?: string;
  flame: FlameParams;
  compact: boolean;
  shouldReduceMotion: boolean;
  airflow: number;
  o2: number;
  flameAriaLabel: string;
}

/**
 * 2D SVG Flame Fallback Component
 * Rendered when WebGL is unavailable, while Three.js loads, or if a WebGL crash occurs.
 */
const SvgFlameFallback: React.FC<SvgFlameFallbackProps> = ({
  scenario,
  destination,
  flame,
  compact,
  shouldReduceMotion,
  airflow,
  o2,
  flameAriaLabel,
}) => {
  const isMicrogravity = flame.gravityG === 0;
  const flameBaseRadius = flame.radius;
  const flameHeightMultiplier = flame.elongation;
  const downstreamTilt = flame.tiltDeg;
  const flameColorOuter = flame.outerColor;
  const flameColorCore = flame.coreColor;

  return (
    <div
      className={`relative w-full ${compact ? 'h-56 sm:h-64' : 'h-72 sm:h-80'} bg-[#05070E] flex items-center justify-center overflow-hidden`}
    >
      {/* Destination-reactive visual backdrop with 500ms crossfade */}
      <DestinationBackdrop
        destination={destination}
        gravityEnvironment={scenario.gravity_environment}
      />

      {/* Airflow velocity vector indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-slate-800 text-xs font-mono text-cyan-300">
        <Wind className="w-3.5 h-3.5 text-cyan-400" />
        <span>Airflow: {airflow} cm/s →</span>
      </div>

      {/* Regime Badge */}
      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/70 border border-slate-800 text-xs font-mono text-slate-300">
        <span>Regime: </span>
        <span className="text-orange-400 font-semibold">{flame.regimeLabel}</span>
      </div>

      {/* Animated SVG Flame Geometry */}
      <svg
        role="img"
        aria-label={flameAriaLabel}
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
          stroke="#94A3B8"
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
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.04, 0.98, 1],
                    opacity: [0.6, 0.8, 0.6],
                  }
            }
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
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.03, 0.97, 1],
                  rx: [flameBaseRadius, flameBaseRadius * 1.02, flameBaseRadius * 0.98, flameBaseRadius],
                }
          }
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
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [0.95, 1.05, 0.98, 0.95],
                  opacity: [0.85, 0.95, 0.85],
                }
          }
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
          className={shouldReduceMotion ? '' : 'animate-ping'}
        />
      </svg>

      {/* Bottom Telemetry Legend */}
      <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
        <span>O₂: {o2}% ({o2 > 21 ? 'Accelerated Growth' : 'Nominal Flux'})</span>
        <span>Pressure: {scenario.pressure_kpa ?? 101.3} kPa</span>
        <span>Gravity: {scenario.gravity_environment ?? '0g'}</span>
      </div>
    </div>
  );
};

export const EvidenceGuidedVisualization: React.FC<Props> = React.memo(({
  scenario,
  comparableCount,
  label,
  compact = false,
  destination,
  compareScenario,
  compareDestination,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const hasWebGL = useWebGLSupport();

  // Derive all flame parameters from the shared source of truth (FR-EGV-003)
  const flame = deriveFlameParams(scenario);

  const o2 = scenario.oxygen_pct ?? 21.0;
  const airflow = scenario.airflow_cm_s ?? 5.0;

  // Dynamic scientific aria-label generation (uses derived descriptors)
  const gravityDescription = flame.gravityG === 0
    ? 'microgravity'
    : flame.gravityG <= 0.16
    ? 'lunar partial gravity'
    : flame.gravityG <= 0.38
    ? 'martian partial gravity'
    : 'terrestrial 1g';

  const flameAriaLabel = `Predicted flame shape: ${flame.shapeDescription}, ${flame.coreDescription}, ${
    o2 < 19 ? 'low oxygen' : o2 > 28 ? 'elevated oxygen' : 'nominal oxygen'
  } ${gravityDescription} scenario with ${o2}% O2, ${scenario.pressure_kpa ?? 101.3} kPa pressure, and ${airflow} cm/s airflow on ${scenario.material} sample`;

  const fallbackView = (
    <SvgFlameFallback
      scenario={scenario}
      destination={destination}
      flame={flame}
      compact={compact}
      shouldReduceMotion={Boolean(shouldReduceMotion)}
      airflow={airflow}
      o2={o2}
      flameAriaLabel={flameAriaLabel}
    />
  );

  return (
    <Card variant="glass" padding="none" className="border-sky-500/20 overflow-hidden bg-[rgba(10,20,40,0.88)] backdrop-blur-none">
      {/* Top Banner with Controls and Mandatory FR-EGV-002 Label */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="strong" size="xs">
            {label ? label : 'EVIDENCE-GUIDED VIZ (FR-EGV-001)'}
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
        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
          {comparableCount > 0
            ? `Based on ${comparableCount} comparable NASA flight runs`
            : 'No directly comparable flight runs; showing nearest matches.'}
        </span>
      </div>

      {/* Interactive Visual Canvas */}
      {isVisible && (
        <>
          {hasWebGL ? (
            <WebGLErrorBoundary fallback={fallbackView}>
              <Suspense fallback={fallbackView}>
                <LazyFlameScene
                  scenario={scenario}
                  compact={compact}
                  destination={destination}
                  compareScenario={compareScenario}
                  compareDestination={compareDestination}
                />
              </Suspense>
            </WebGLErrorBoundary>
          ) : (
            fallbackView
          )}

          {/* Mandatory caption: Illustrative rendering driven by scenario parameters, not a CFD simulation */}
          <div className="px-4 py-2 bg-black/80 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 font-mono italic">
              Illustrative rendering driven by scenario parameters, not a CFD simulation.
            </p>
          </div>
        </>
      )}
    </Card>
  );
});
