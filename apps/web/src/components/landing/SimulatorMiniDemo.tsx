/**
 * SimulatorMiniDemo.tsx – Interactive gravity morphing demonstration.
 *
 * Rendered below the hero on the landing page:
 *   - Continuous "Gravity" slider from 0.00 to 1.00 g with labeled tick marks:
 *     "Orbital 0g", "Moon 0.16g", "Mars 0.38g", "Earth 1g".
 *   - Smoothly morphs the flame from a 0g spherical diffusion ball to a 1g buoyant teardrop.
 *   - Plain-language caption dynamically updates by range.
 *   - Clear non-analysis disclaimer and "Run this in the Simulator" CTA.
 *   - Full keyboard accessibility (arrow keys) with aria-valuetext.
 *   - Lazy-mounts WebGL only when scrolled into view.
 *   - ErrorBoundary and SVG fallback for WebGL failure.
 */

import React, { useState, useMemo, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sliders, ArrowRight, Info, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import type { ScenarioInput, GravityEnvironment } from '../../types/api';
import { deriveFlameParams } from '../../visuals/flameParams';
import { useWebGLSupport } from '../../visuals/useWebGLSupport';
import { useIsVisible } from '../../visuals/useIsVisible';
import { WebGLErrorBoundary } from '../../visuals/WebGLErrorBoundary';

// Lazy-load Three.js GPU Flame scene
const LazyFlameScene = lazy(() => import('../../visuals/FlameScene'));

interface TickMark {
  value: number;
  label: string;
  preset: string;
}

const TICKS: TickMark[] = [
  { value: 0.0, label: 'Orbital 0g', preset: 'orbital' },
  { value: 0.16, label: 'Moon 0.16g', preset: 'moon' },
  { value: 0.38, label: 'Mars 0.38g', preset: 'mars' },
  { value: 1.0, label: 'Earth 1g', preset: 'earth' },
];

function getAriaValueText(g: number): string {
  if (g < 0.05) return `${g.toFixed(2)} g, orbital microgravity`;
  if (g < 0.25) return `${g.toFixed(2)} g, lunar gravity`;
  if (g < 0.65) return `${g.toFixed(2)} g, martian gravity`;
  return `${g.toFixed(2)} g, terrestrial gravity`;
}

function getGravityCaption(g: number): string {
  if (g < 0.08) {
    return "With no gravity, hot air doesn't rise, so the flame forms a quiescent, spherical blue diffusion ball.";
  }
  if (g < 0.27) {
    return "In weak lunar gravity, a slight buoyant draft emerges, causing the flame to gently elongate into a soft dome.";
  }
  if (g < 0.65) {
    return "At partial Martian gravity, buoyant convection re-emerges clearly, drawing oxidizer upward into a taller plume.";
  }
  return "As gravity returns, hot gases rise and stretch the flame upward into a buoyant flickering plume.";
}

function getNearestPreset(g: number): { slug: string; name: string } {
  if (g < 0.08) return { slug: 'orbital', name: 'Orbital (0g)' };
  if (g < 0.27) return { slug: 'moon', name: 'Lunar (0.16g)' };
  return { slug: 'mars', name: 'Mars (0.38g)' };
}

/**
 * 2D SVG Fallback Flame rendered when WebGL is unavailable or loading.
 */
function MiniSvgFallback({
  scenario,
  shouldReduceMotion,
}: {
  scenario: ScenarioInput & { gravity_g?: number };
  shouldReduceMotion: boolean;
}) {
  const flame = deriveFlameParams(scenario);
  const isMicrogravity = flame.gravityG < 0.05;

  return (
    <div className="relative w-full h-64 sm:h-72 bg-[#05070E] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #38BDF8 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <svg
        role="img"
        aria-label={`SVG Flame preview: ${flame.shapeDescription}`}
        viewBox="0 0 400 300"
        className="w-full h-full max-w-sm filter drop-shadow-[0_0_25px_rgba(255,87,34,0.25)]"
      >
        <defs>
          <radialGradient id="miniFlameOuter" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor={flame.coreColor} stopOpacity="0.9" />
            <stop offset="50%" stopColor={flame.outerColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="miniBlueHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
            <stop offset="70%" stopColor="rgba(2, 132, 199, 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Substrate plate */}
        <rect x="140" y="220" width="120" height="8" rx="3" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />

        {/* Halo in microgravity */}
        {isMicrogravity && (
          <circle cx={200} cy={180} r={flame.radius * 1.5} fill="url(#miniBlueHalo)" />
        )}

        {/* Outer flame */}
        <ellipse
          cx={200}
          cy={180 - (flame.elongation - 1) * 20}
          rx={flame.radius}
          ry={flame.radius * flame.elongation}
          fill="url(#miniFlameOuter)"
        />

        {/* Core */}
        <ellipse
          cx={200}
          cy={185 - (flame.elongation - 1) * 15}
          rx={flame.radius * 0.5}
          ry={flame.radius * 0.5 * flame.elongation}
          fill={flame.coreColor}
        />

        {/* Ignition center */}
        <circle cx={200} cy={218} r="2.5" fill="#F97316" className={shouldReduceMotion ? '' : 'animate-ping'} />
      </svg>

      <div className="absolute bottom-2 inset-x-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Gravity: {flame.gravityG.toFixed(2)}g</span>
        <span>Regime: {flame.regimeLabel}</span>
      </div>
    </div>
  );
}

export const SimulatorMiniDemo: React.FC = () => {
  const [gravity, setGravity] = useState<number>(0.0);
  const shouldReduceMotion = useReducedMotion();
  const hasWebGL = useWebGLSupport();

  // Lazy-mount WebGL when section enters viewport, unmount when far out of view
  const [containerRef, hasScrolledIntoView] = useIsVisible<HTMLElement>({ rootMargin: '200px', once: false });

  // Construct scenario input reflecting continuous slider value
  const scenario = useMemo<ScenarioInput & { gravity_g: number }>(() => {
    let env: GravityEnvironment = 'microgravity';
    if (gravity >= 0.65) env = 'earth_gravity';
    else if (gravity >= 0.27) env = 'partial_gravity_mars';
    else if (gravity >= 0.08) env = 'partial_gravity_lunar';

    return {
      material: 'pmma',
      objective: 'flame_spread',
      gravity_environment: env,
      gravity_g: gravity,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 5.0,
    };
  }, [gravity]);

  const nearest = getNearestPreset(gravity);
  const dynamicCaption = getGravityCaption(gravity);
  const ariaValueText = getAriaValueText(gravity);

  const fallback = <MiniSvgFallback scenario={scenario} shouldReduceMotion={Boolean(shouldReduceMotion)} />;

  return (
    <section ref={containerRef} className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Physical Morphing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
          How Gravity Reshapes Fire
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Drag the gravity slider below to watch combustion morph in real time from a spherical 0g bubble into an Earth teardrop.
        </p>
      </div>

      <Card variant="glass" padding="none" className="border-sky-500/25 overflow-hidden shadow-2xl space-y-0">
        {/* Top Disclaimer Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="xs">
              PHYSICS DEMO
            </Badge>
            <span className="font-semibold text-slate-200">
              Visual demo of the gravity effect. Not an analysis result.
            </span>
          </div>
          <span className="text-cyan-400 font-mono text-[11px] font-semibold">
            Current: {gravity.toFixed(2)} g
          </span>
        </div>

        {/* 3D GPU Flame Viewport with Lazy-Mounting & Fallback */}
        <div className="relative border-b border-slate-800">
          {hasScrolledIntoView && hasWebGL ? (
            <WebGLErrorBoundary fallback={fallback}>
              <Suspense fallback={fallback}>
                <LazyFlameScene scenario={scenario} compact />
              </Suspense>
            </WebGLErrorBoundary>
          ) : (
            fallback
          )}
        </div>

        {/* Mandatory Caption */}
        <div className="px-4 py-2 bg-black/60 border-b border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 font-mono italic">
            Illustrative rendering driven by scenario parameters, not a CFD simulation.
          </p>
        </div>

        {/* Controls Section: Gravity Slider & Presets */}
        <div className="p-6 sm:p-8 space-y-6 bg-[rgba(10,20,40,0.88)] border-t border-slate-800/80">
          {/* Slider Header */}
          <div className="flex items-center justify-between">
            <label htmlFor="gravity-slider" className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Gravity Force (g)</span>
            </label>
            <span className="text-sm font-mono font-bold text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-md border border-orange-500/30">
              {gravity.toFixed(2)} g
            </span>
          </div>

          {/* Interactive Range Input */}
          <div className="space-y-3">
            <input
              id="gravity-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              aria-label="Gravity environment slider"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={gravity}
              aria-valuetext={ariaValueText}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />

            {/* Labeled Tick Marks */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {TICKS.map((tick) => {
                const isActive = Math.abs(gravity - tick.value) < 0.04;
                return (
                  <button
                    key={tick.label}
                    type="button"
                    onClick={() => setGravity(tick.value)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono text-center transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    <span>{tick.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Plain-Language Caption & CTA */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Physical Phenomenon:</span>
              </div>
              <motion.p
                key={dynamicCaption}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl"
              >
                {dynamicCaption}
              </motion.p>
            </div>

            <Link
              to={`/simulator?destination=${nearest.slug}`}
              className="shrink-0"
              aria-label={`Run this scenario in the Simulator with ${nearest.name}`}
            >
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Run this in the Simulator
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SimulatorMiniDemo;
