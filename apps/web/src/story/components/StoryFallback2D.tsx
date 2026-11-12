import React from 'react';
import type { SceneState } from '../sceneState';
import { Info } from 'lucide-react';

export interface StoryFallback2DProps {
  sceneState: SceneState;
  className?: string;
  onOpenSourceDrawer?: () => void;
}

export const StoryFallback2D: React.FC<StoryFallback2DProps> = ({
  sceneState,
  className = '',
  onOpenSourceDrawer,
}) => {
  const { flame, droplet, truthTag, illustrationDescription } = sceneState;

  // 2D SVG representation of flame shape
  const cx = 150;
  const cy = 130;
  const baseRx = 40 * flame.radius;
  const baseRy = 40 * flame.radius * flame.elongation;

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between p-6 bg-[#030712] border border-cyan-500/30 rounded-2xl overflow-hidden select-none ${className}`}
      role="region"
      aria-label="2D Scientific Illustration of Combustion Scene"
    >
      {/* Background Starfield Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Banner: Truth Tag & Epistemic Status */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
              truthTag === 'From NASA flight tests'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}
          >
            {truthTag}
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            2D Scientific Cross-Section
          </span>
        </div>

        {onOpenSourceDrawer && truthTag === 'From NASA flight tests' && (
          <button
            type="button"
            onClick={onOpenSourceDrawer}
            className="text-cyan-400 hover:text-cyan-300 underline font-mono text-xs cursor-pointer flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Source</span>
          </button>
        )}
      </div>

      {/* Main SVG Visualization */}
      <div className="relative z-10 my-auto flex flex-col items-center">
        <svg
          viewBox="0 0 300 240"
          className="w-64 h-52 sm:w-80 sm:h-64"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="flameGlow2D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={flame.coreColor} stopOpacity="0.9" />
              <stop offset="65%" stopColor={flame.outerColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dropletGrad2D" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
          </defs>

          {/* Flame Envelope (Tear/Sphere) */}
          <ellipse
            cx={cx}
            cy={cy - (flame.elongation - 1) * 20}
            rx={baseRx}
            ry={baseRy}
            fill="url(#flameGlow2D)"
          />

          {/* Inner Flame Chemiluminescent Core */}
          <ellipse
            cx={cx}
            cy={cy - (flame.elongation - 1) * 12}
            rx={baseRx * 0.45}
            ry={baseRy * 0.45}
            fill={flame.coreColor}
            opacity="0.85"
          />

          {/* Fuel Droplet at center (if visible in act) */}
          {droplet.visible && (
            <g>
              <circle
                cx={cx}
                cy={cy}
                r={Math.max(4, droplet.diameterMm * 6)}
                fill="url(#dropletGrad2D)"
                stroke="#64748b"
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={cy + 35}
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {droplet.diameterMm.toFixed(2)} mm
              </text>
            </g>
          )}

          {/* 1g Buoyancy Flow Vector Indicators */}
          {flame.buoyancy > 0.3 && (
            <g opacity="0.6" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3">
              <path d="M 80,180 Q 75,100 130,50" fill="none" />
              <path d="M 220,180 Q 225,100 170,50" fill="none" />
            </g>
          )}
        </svg>

        {/* Live Readout Pill */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300">
          <span>Buoyancy: <strong>{(flame.buoyancy * 100).toFixed(0)}%</strong></span>
          <span className="text-white/20">|</span>
          <span>Shape: <strong className="text-cyan-400">{flame.elongation <= 1.05 ? 'Pure Sphere' : 'Buoyant Teardrop'}</strong></span>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="relative z-10 w-full text-center text-[11px] text-slate-400 font-sans border-t border-white/10 pt-2">
        {illustrationDescription}
      </div>
    </div>
  );
};
