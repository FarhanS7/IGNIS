/**
 * visuals/index.ts – Public barrel export for the IGNIS visual infrastructure.
 *
 * Consumers import from 'src/visuals' or 'src/visuals/flameParams' etc.
 */

// Flame parameter derivation (pure, testable)
export { deriveFlameParams } from './flameParams';
export type { FlameParams } from './flameParams';

// Hooks
export { useWebGLSupport } from './useWebGLSupport';
export { useReducedMotion } from './useReducedMotion';
export { useIsVisible } from './useIsVisible';
export { useQualityTier, getQualityPreference, setQualityPreference } from './useQualityTier';
export type { QualityTier, QualityPreference, QualityInfo } from './useQualityTier';
export { QualitySelector } from './QualitySelector';

// Animation helpers (animejs v4)
export { countUp, staggerIn, drawPath, stagger } from './anime';

// Error boundary
export { WebGLErrorBoundary } from './WebGLErrorBoundary';

// 3D GPU Flame (for direct or lazy usage)
export { FlameScene } from './FlameScene';
export type { FlameSceneProps } from './FlameScene';

// Dev-only Performance overlay (?perf=1)
export { PerfOverlay } from './PerfOverlay';
export { reportRendererStats, isPerfModeEnabled, subscribePerfMetrics, getLatestPerfMetrics } from './perfStore';
export type { PerfMetrics } from './perfStore';

