/**
 * useQualityTier.ts – Classifies the device into a rendering quality tier.
 *
 * Returns 'low' | 'medium' | 'high' based on:
 *   - devicePixelRatio
 *   - navigator.hardwareConcurrency
 *   - touch/mobile UA heuristics
 *   - prefers-reduced-motion
 *
 * Tier guide:
 *   'low'    → fewer particles, no bloom, DPR capped at 1
 *   'medium' → moderate particles, DPR capped at 1.5
 *   'high'   → full particles, bloom enabled, DPR capped at 2
 */

import { useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type QualityTier = 'low' | 'medium' | 'high';

export interface QualityInfo {
  tier: QualityTier;
  /** Maximum devicePixelRatio the renderer should use */
  maxDpr: number;
  /** Whether bloom post-processing is allowed */
  bloomEnabled: boolean;
  /** Particle count multiplier (0..1) */
  particleMultiplier: number;
}

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Check for touch support and narrow viewport
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isNarrow = window.innerWidth < 768;

  // UA-based heuristic fallback
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

  return (hasTouch && isNarrow) || mobileUA;
}

function classifyTier(reducedMotion: boolean): QualityInfo {
  // Reduced motion always forces low tier
  if (reducedMotion) {
    return { tier: 'low', maxDpr: 1, bloomEnabled: false, particleMultiplier: 0 };
  }

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 2 : 2;
  const mobile = isMobile();

  // Scoring: higher = more capable
  let score = 0;
  if (dpr >= 2) score += 2;
  else if (dpr >= 1.5) score += 1;

  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;

  if (!mobile) score += 1;

  if (score >= 4) {
    return { tier: 'high', maxDpr: 2, bloomEnabled: true, particleMultiplier: 1 };
  }
  if (score >= 2) {
    return {
      tier: 'medium',
      maxDpr: mobile ? 1.5 : 2,
      bloomEnabled: false,
      particleMultiplier: 0.5,
    };
  }

  return { tier: 'low', maxDpr: 1, bloomEnabled: false, particleMultiplier: 0.2 };
}

/**
 * Hook: returns the current quality classification for the device.
 */
export function useQualityTier(): QualityInfo {
  const reducedMotion = useReducedMotion();
  return useMemo(() => classifyTier(reducedMotion), [reducedMotion]);
}
