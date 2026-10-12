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
export { useQualityTier } from './useQualityTier';
export type { QualityTier, QualityInfo } from './useQualityTier';

// Animation helpers (animejs v4)
export { countUp, staggerIn, drawPath, stagger } from './anime';

// Error boundary
export { WebGLErrorBoundary } from './WebGLErrorBoundary';
