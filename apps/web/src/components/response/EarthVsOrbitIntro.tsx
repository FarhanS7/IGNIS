import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../visuals/useReducedMotion.ts';
import { Caption } from './Caption.tsx';
import { deriveFlameParams } from '../../visuals/flameParams.ts';

export interface EarthVsOrbitIntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export const EarthVsOrbitIntro: React.FC<EarthVsOrbitIntroProps> = ({
  onComplete,
  onSkip,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [t, setT] = useState<number>(0);
  const [reducedMotionBeat, setReducedMotionBeat] = useState<1 | 2>(1);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const tick = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsedSec = (now - startTimeRef.current) / 1000.0;
      setT(elapsedSec);

      if (elapsedSec >= 16.0) {
        onComplete();
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [prefersReducedMotion, onComplete]);

  // Beat 1: 0 to 8s (Flame Morph); Beat 2: 8 to 16s (Earth vs Orbit Split)
  const isBeat1 = prefersReducedMotion ? reducedMotionBeat === 1 : t < 8.0;
  const gravityG = isBeat1 ? 1.0 - smoothstep(1.5, 6.5, t) : 0.0;
  const flameParams = deriveFlameParams({ gravity_g: gravityG, oxygen_pct: 21.0 });

  const activeCaption = isBeat1
    ? 'Fire in space is different.'
    : "On Earth, smoke rises. Here, it doesn't.";

  return (
    <div
      data-testid="earth-orbit-intro"
      className="relative w-full h-full min-h-[460px] max-h-[660px] bg-[#03060c] border-b border-slate-800/80 overflow-hidden flex flex-col justify-between p-4 select-none animate-in fade-in duration-300"
    >
      {/* Top Bar inside Intro: Title, Illustrative Badge & Controls */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-white">IGNIS</span>
          <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            Illustrative
          </span>
        </div>

        <div className="flex items-center gap-2">
          {prefersReducedMotion && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setReducedMotionBeat(1)}
                className={`px-2 py-0.5 rounded ${
                  reducedMotionBeat === 1 ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                1. Flame Morph
              </button>
              <button
                type="button"
                onClick={() => setReducedMotionBeat(2)}
                className={`px-2 py-0.5 rounded ${
                  reducedMotionBeat === 2 ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                2. Plume Transport
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onSkip}
            data-testid="skip-intro-btn"
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold tracking-wide transition-colors"
          >
            Skip intro &rarr;
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center my-auto">
        {isBeat1 ? (
          /* Beat 1 (0-8s): Flame Morph from Teardrop to Sphere */
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg
              viewBox="0 0 300 300"
              className="w-56 h-56 sm:w-72 sm:h-72"
              role="img"
              aria-label={`Flame morphing from teardrop to sphere. Current gravity ${gravityG.toFixed(2)} g`}
            >
              <defs>
                <radialGradient id="introCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={gravityG > 0.4 ? '#fffae0' : '#d9f4ff'}
                    stopOpacity="1"
                  />
                  <stop
                    offset="45%"
                    stopColor={gravityG > 0.4 ? '#ffb53b' : '#3ad7ff'}
                    stopOpacity="0.85"
                  />
                  <stop
                    offset="85%"
                    stopColor={gravityG > 0.4 ? '#ff4258' : '#1e5080'}
                    stopOpacity="0.3"
                  />
                  <stop offset="100%" stopColor="#03060c" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Flame Ellipse / Teardrop morph */}
              <ellipse
                cx="150"
                cy={150 - (flameParams.elongation - 1.0) * 22}
                rx={flameParams.radius}
                ry={flameParams.radius * flameParams.elongation}
                fill="url(#introCoreGlow)"
                className="transition-all duration-75"
              />
            </svg>

            {/* Gravity Gauge Readout */}
            <div className="flex items-center gap-3 font-mono text-xs text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
              <span>Gravity Environment:</span>
              <span className="font-bold text-cyan-300">
                {gravityG > 0.05 ? `${gravityG.toFixed(2)} g` : '0.00 g (Microgravity)'}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 font-mono text-[11px]">{flameParams.shapeDescription}</span>
            </div>
          </div>
        ) : (
          /* Beat 2 (8-16s): Split Screen - Earth (1g) vs Orbit (0g) */
          <div className="w-full max-w-4xl grid grid-cols-2 gap-4 h-64 sm:h-72">
            {/* Left Panel: Earth (1 g) */}
            <div className="relative rounded-xl border border-slate-800 bg-[#060c18] p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-300">Earth (1 g)</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t >= 11.5 || prefersReducedMotion
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t >= 11.5 || prefersReducedMotion ? 'FIRE ALARM' : 'NOMINAL'}
                </span>
              </div>

              {/* Ceiling Smoke Detector (Target) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div
                  className={`w-6 h-3 rounded-b-md ${
                    t >= 11.5 || prefersReducedMotion
                      ? 'bg-red-500 shadow-[0_0_15px_#ff4258]'
                      : 'bg-slate-600'
                  }`}
                />
                <span className="text-[9px] font-mono text-slate-400 mt-1">Ceiling Detector</span>
              </div>

              {/* Rising Convective Plume to Ceiling */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 50% 82% Q 46% 50% 50% 20%"
                  fill="none"
                  stroke={t >= 10.0 || prefersReducedMotion ? 'rgba(174,191,211,0.65)' : 'none'}
                  strokeWidth={prefersReducedMotion ? 24 : Math.min(32, Math.max(0, (t - 8) * 6))}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Buoyant Teardrop Flame on floor */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-14 bg-gradient-to-t from-red-500 via-amber-400 to-yellow-100 rounded-full blur-[1px]" />

              <div className="text-[10px] font-mono text-slate-400 text-center">
                Buoyant thermal plume rises rapidly to ceiling
              </div>
            </div>

            {/* Right Panel: Orbit (0 g) */}
            <div className="relative rounded-xl border border-cyan-900/40 bg-[#060c18] p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-cyan-300">Orbit (0 g)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  NOMINAL
                </span>
              </div>

              {/* Ceiling Smoke Detector (Stays Nominal) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-6 h-3 rounded-b-md bg-emerald-500 shadow-[0_0_12px_#38e4a4]" />
                <span className="text-[9px] font-mono text-slate-400 mt-1">Ceiling Detector</span>
              </div>

              {/* Stagnant Spherical Smoke Envelope (Does NOT rise) */}
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-slate-700/60 bg-slate-400/20 blur-sm transition-all duration-500"
                style={{
                  width: `${prefersReducedMotion ? 75 : Math.min(90, 30 + Math.max(0, t - 8) * 8)}px`,
                  height: `${prefersReducedMotion ? 75 : Math.min(90, 30 + Math.max(0, t - 8) * 8)}px`,
                }}
              />

              {/* Spherical Microgravity Flame */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-300 via-cyan-400 to-white shadow-[0_0_16px_#3ad7ff]" />

              <div className="text-[10px] font-mono text-slate-400 text-center">
                Zero thermal buoyancy: smoke hangs near source
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Intro Caption */}
      <div className="relative z-10 pb-2">
        <Caption text={activeCaption} />
      </div>
    </div>
  );
};

export default EarthVsOrbitIntro;
