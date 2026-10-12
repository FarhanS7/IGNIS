/**
 * PerfOverlay.tsx – Dev-Only WebGL Performance & HUD Monitor.
 *
 * Activated via URL parameter: `?perf=1`
 * Only compiled and rendered in DEV (`import.meta.env.DEV`).
 * Shows:
 *   - Real-time FPS (from rAF delta)
 *   - Frame Time (ms)
 *   - Three.js draw calls (gl.info.render.calls)
 *   - Triangles rendered (gl.info.render.triangles)
 *   - GPU Geometries & Textures in memory (gl.info.memory)
 *   - Effective Device Pixel Ratio (DPR)
 */

import { useEffect, useState } from 'react';
import {
  isPerfModeEnabled,
  subscribePerfMetrics,
  getLatestPerfMetrics,
  type PerfMetrics,
} from './perfStore';

/**
 * Dev-only floating overlay mounted on the page when ?perf=1 is present.
 */
export function PerfOverlay() {
  const [enabled, setEnabled] = useState(isPerfModeEnabled);
  const [stats, setStats] = useState<PerfMetrics>(getLatestPerfMetrics);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const checkEnabled = () => setEnabled(isPerfModeEnabled());
    window.addEventListener('popstate', checkEnabled);

    const unsubscribe = subscribePerfMetrics((metrics) => {
      setStats(metrics);
    });

    return () => {
      window.removeEventListener('popstate', checkEnabled);
      unsubscribe();
    };
  }, []);

  if (!import.meta.env.DEV || !enabled) {
    return null;
  }

  const fpsColor =
    stats.fps >= 55 ? 'text-emerald-400' : stats.fps >= 40 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div
      role="region"
      aria-label="Developer Performance HUD"
      className="fixed bottom-4 left-4 z-50 p-3 rounded-xl bg-slate-950/92 border border-cyan-500/50 shadow-2xl font-mono text-[11px] select-none text-slate-200 pointer-events-auto"
      style={{ minWidth: '220px' }}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] uppercase tracking-wider">
        <span className="font-bold text-cyan-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DEV PERF HUD (?perf=1)</span>
        </span>
        <span className="text-slate-400">DPR: {stats.dpr}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2">
        <div>
          <span className="text-slate-400 text-[10px] block">FRAME RATE</span>
          <span className={`text-base font-bold ${fpsColor}`}>
            {stats.fps} <span className="text-[10px] font-normal text-slate-400">FPS</span>
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">FRAME TIME</span>
          <span className="text-base font-bold text-white">
            {stats.frameTimeMs} <span className="text-[10px] font-normal text-slate-400">ms</span>
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">DRAW CALLS</span>
          <span className="text-white font-bold">{stats.drawCalls}</span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">TRIANGLES</span>
          <span className="text-white font-bold">{stats.triangles.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">GEOMETRIES</span>
          <span className="text-white font-bold">{stats.geometries}</span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">TEXTURES</span>
          <span className="text-white font-bold">{stats.textures}</span>
        </div>
      </div>
    </div>
  );
}

export default PerfOverlay;
