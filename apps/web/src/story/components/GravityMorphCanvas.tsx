import React, { useState, lazy, Suspense } from 'react';
import { WebGLErrorBoundary } from '../../visuals/WebGLErrorBoundary';
import { deriveFlameParams } from '../../visuals/flameParams';
import type { ScenarioInput } from '../../types/api';
import { Globe, Compass, Orbit, Sparkles } from 'lucide-react';

const LazyFlameScene = lazy(() => import('../../visuals/FlameScene'));

export interface GravityMorphCanvasProps {
  initialGravityG?: number;
  onGravityChange?: (g: number) => void;
  className?: string;
  scrollProgressG?: number; // Optional external scroll-driven gravity
}

const REGIME_PRESETS = [
  { g: 1.0, label: 'Earth', badge: '1.0g', icon: Globe, desc: 'Convective Teardrop' },
  { g: 0.38, label: 'Mars', badge: '0.38g', icon: Compass, desc: 'Partial Buoyancy' },
  { g: 0.16, label: 'Moon', badge: '0.16g', icon: Sparkles, desc: 'Weak Buoyancy' },
  { g: 0.0, label: 'Orbit', badge: '0g', icon: Orbit, desc: 'Pure Sphere' },
];

export const GravityMorphCanvas: React.FC<GravityMorphCanvasProps> = ({
  initialGravityG = 0.0,
  onGravityChange,
  className = '',
  scrollProgressG,
}) => {
  const [userGravityG, setUserGravityG] = useState<number>(initialGravityG);
  const activeGravityG = typeof scrollProgressG === 'number' ? scrollProgressG : userGravityG;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setUserGravityG(val);
    if (onGravityChange) onGravityChange(val);
  };

  const handleSelectPreset = (g: number) => {
    setUserGravityG(g);
    if (onGravityChange) onGravityChange(g);
  };

  const scenario: ScenarioInput & { gravity_g: number } = {
    material: 'pmma',
    oxygen_pct: 21.0,
    pressure_kpa: 101.3,
    airflow_cm_s: 0.0, // Quiescent microgravity shows pure spherical symmetry
    gravity_g: activeGravityG,
  };

  const derived = deriveFlameParams(scenario);

  const svgFallback = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070E] p-6 text-center">
      <svg viewBox="0 0 200 200" className="w-32 h-32 select-none" aria-hidden="true">
        <circle cx="100" cy="100" r={derived.radius} fill={derived.outerColor} opacity="0.75" />
        <circle cx="100" cy="100" r={derived.radius * 0.45} fill={derived.coreColor} />
      </svg>
      <div className="text-xs font-mono text-cyan-300 mt-2">
        {derived.regimeLabel} ({activeGravityG.toFixed(2)}g)
      </div>
      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
        WebGL 3D engine paused or unavailable — displaying calibrated 2D cross-section schematic.
      </p>
    </div>
  );

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#040a17] shadow-2xl flex flex-col ${className}`}
      role="region"
      aria-label="Interactive Gravity Morph Flame Simulator"
    >
      {/* Screen Reader live announcement of gravity change */}
      <div className="sr-only" aria-live="polite">
        Simulated gravity set to {activeGravityG.toFixed(2)}g: {derived.regimeLabel}
      </div>

      {/* 3D WebGL Canvas wrapped in Error Boundary */}
      <div className="relative w-full h-72 sm:h-84 md:h-96">
        <WebGLErrorBoundary fallback={svgFallback}>
          <Suspense fallback={svgFallback}>
            <LazyFlameScene
              scenario={scenario}
              destination={activeGravityG === 0 ? 'orbital' : activeGravityG < 0.25 ? 'moon' : activeGravityG < 0.6 ? 'mars' : 'earth'}
              className="w-full h-full"
            />
          </Suspense>
        </WebGLErrorBoundary>

        {/* Live Flame Shape Readout Badge */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 border border-cyan-400/40 backdrop-blur-md text-xs font-mono text-cyan-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Effective Gravity: <strong>{activeGravityG.toFixed(2)}g</strong></span>
          </div>
          <div className="px-3 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300">
            Regime: <strong className="text-amber-400">{derived.regimeLabel}</strong>
          </div>
        </div>

        {/* Live Physics Measurement Callout */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col items-end gap-1 pointer-events-none text-right">
          <span className="px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-xs font-mono text-slate-300">
            Elongation: <strong>{derived.elongation.toFixed(2)}×</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-[11px] font-mono text-slate-400">
            Buoyant Stretch: <strong>{(derived.buoyancy * 100).toFixed(0)}%</strong>
          </span>
        </div>
      </div>

      {/* Control Bar: Sliders & Preset Buttons */}
      <div className="p-4 sm:p-5 bg-[#071329] border-t border-white/10 flex flex-col gap-4">
        {/* Continuous Gravity Morph Slider with >=44px touch target */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <label htmlFor="gravity-slider" className="text-slate-200 font-semibold">
              Dial Gravity Field (1.0g → 0.0g):
            </label>
            <span className="text-cyan-400 font-bold">
              {activeGravityG === 0
                ? '0.00g (Microgravity)'
                : `${activeGravityG.toFixed(2)}g (${derived.shapeDescription})`}
            </span>
          </div>

          <div className="relative py-2 flex items-center">
            <input
              id="gravity-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={activeGravityG}
              onChange={handleSliderChange}
              aria-label="Simulated gravity slider from zero g to earth gravity"
              className="w-full h-3 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400 focus-visible:outline-2 focus-visible:outline-cyan-400 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_12px_#38bdf8] [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>0g (Orbital Sphere)</span>
            <span>0.16g (Moon)</span>
            <span>0.38g (Mars)</span>
            <span>1.0g (Earth Teardrop)</span>
          </div>
        </div>

        {/* Quick Planetary Regime Buttons with min 48px height */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {REGIME_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = Math.abs(activeGravityG - preset.g) < 0.05;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset.g)}
                className={`min-h-[48px] flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold font-['Space_Grotesk'] truncate">
                    {preset.label} <span className="text-[10px] font-mono text-cyan-400">({preset.badge})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {preset.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
