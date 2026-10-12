/**
 * perfStore.ts – Dev-only performance telemetry listener and store.
 */

export interface PerfMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  dpr: number;
}

let globalPerfMetrics: PerfMetrics = {
  fps: 60,
  frameTimeMs: 16.6,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  dpr: 1,
};

type PerfListener = (metrics: PerfMetrics) => void;
const perfListeners = new Set<PerfListener>();

let frameCount = 0;
let lastFpsTime = performance.now();
let lastFrameTime = performance.now();

export function isPerfModeEnabled(): boolean {
  if (typeof window === 'undefined' || !import.meta.env.DEV) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('perf') === '1' || params.has('perf');
}

export function reportRendererStats(
  info: {
    render: { calls: number; triangles: number };
    memory: { geometries: number; textures: number };
  },
  dpr: number,
) {
  if (!import.meta.env.DEV) return;

  frameCount++;
  const now = performance.now();
  const dt = now - lastFrameTime;
  lastFrameTime = now;

  if (now - lastFpsTime >= 500) {
    const elapsed = now - lastFpsTime;
    const computedFps = Math.round((frameCount * 1000) / elapsed);
    frameCount = 0;
    lastFpsTime = now;

    globalPerfMetrics = {
      fps: computedFps,
      frameTimeMs: Math.round(dt * 10) / 10,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      dpr: Math.round(dpr * 100) / 100,
    };

    perfListeners.forEach((cb) => cb(globalPerfMetrics));
  }
}

export function subscribePerfMetrics(listener: PerfListener): () => void {
  perfListeners.add(listener);
  listener(globalPerfMetrics);
  return () => {
    perfListeners.delete(listener);
  };
}

export function getLatestPerfMetrics(): PerfMetrics {
  return globalPerfMetrics;
}
