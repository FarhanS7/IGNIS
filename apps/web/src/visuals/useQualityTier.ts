/**
 * useQualityTier.ts – Classifies the device into a rendering quality tier.
 *
 * Defaults:
 *   - 'medium' on laptops/desktops
 *   - 'low' on mobile/touch devices or prefers-reduced-motion
 *
 * User preference:
 *   - Stored in localStorage under 'ignis_visual_quality': 'auto' | 'high' | 'medium' | 'low'
 *   - Dispatches a custom event 'ignis:quality-change' on update for instant reactive re-renders
 *
 * Tier definitions:
 *   - 'low':    DPR 1.0, 200 particles, static backdrops, no bloom, 2 noise octaves
 *   - 'medium': DPR [1, 1.25], 700 particles, fake glow, no bloom, 3 noise octaves
 *   - 'high':   DPR [1, 1.5], 1500 particles, bloom enabled, 3 noise octaves
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type QualityTier = 'low' | 'medium' | 'high';
export type QualityPreference = 'auto' | 'high' | 'medium' | 'low';

export interface QualityInfo {
  tier: QualityTier;
  preference: QualityPreference;
  maxDpr: number;
  bloomEnabled: boolean;
  particleCount: number;
  staticBackdrop: boolean;
  noiseOctaves: number;
}

export const QUALITY_STORAGE_KEY = 'ignis_visual_quality';
const QUALITY_EVENT_NAME = 'ignis:quality-change';

export function getQualityPreference(): QualityPreference {
  if (typeof window === 'undefined') return 'auto';
  try {
    const saved = localStorage.getItem(QUALITY_STORAGE_KEY);
    if (saved === 'high' || saved === 'medium' || saved === 'low' || saved === 'auto') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'auto';
}

export function setQualityPreference(pref: QualityPreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUALITY_STORAGE_KEY, pref);
    window.dispatchEvent(new CustomEvent(QUALITY_EVENT_NAME, { detail: pref }));
  } catch {
    // Ignore storage errors
  }
}

function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isNarrow = window.innerWidth < 768;
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  return (hasTouch && isNarrow) || mobileUA;
}

export function resolveQualityTier(
  pref: QualityPreference,
  reducedMotion: boolean,
): QualityTier {
  if (reducedMotion) return 'low';
  if (pref !== 'auto') return pref;

  // 'auto' mode: default to 'low' on mobile/touch, 'medium' on mid-range laptops/desktops
  if (isMobileDevice()) {
    return 'low';
  }

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 2 : 2;

  // Only promote to 'high' automatically if the machine has high hardware concurrency and high dpr
  if (cores >= 8 && dpr >= 2) {
    return 'high';
  }

  // Standard mid-range default
  return 'medium';
}

export function getTierInfo(tier: QualityTier, preference: QualityPreference): QualityInfo {
  switch (tier) {
    case 'low':
      return {
        tier: 'low',
        preference,
        maxDpr: 1.0,
        bloomEnabled: false,
        particleCount: 200,
        staticBackdrop: true,
        noiseOctaves: 2,
      };
    case 'high':
      return {
        tier: 'high',
        preference,
        maxDpr: 1.5,
        bloomEnabled: true,
        particleCount: 1500,
        staticBackdrop: false,
        noiseOctaves: 3,
      };
    case 'medium':
    default:
      return {
        tier: 'medium',
        preference,
        maxDpr: 1.25,
        bloomEnabled: false,
        particleCount: 700,
        staticBackdrop: false,
        noiseOctaves: 3,
      };
  }
}

/**
 * Hook: returns current active QualityInfo and reactive setter.
 */
export function useQualityTier(): QualityInfo & {
  setPreference: (p: QualityPreference) => void;
} {
  const reducedMotion = useReducedMotion();
  const [pref, setPref] = useState<QualityPreference>(getQualityPreference);

  useEffect(() => {
    const handleQualityChange = (e: Event) => {
      const customEvent = e as CustomEvent<QualityPreference>;
      setPref(customEvent.detail || getQualityPreference());
    };

    window.addEventListener(QUALITY_EVENT_NAME, handleQualityChange);
    window.addEventListener('storage', handleQualityChange);
    return () => {
      window.removeEventListener(QUALITY_EVENT_NAME, handleQualityChange);
      window.removeEventListener('storage', handleQualityChange);
    };
  }, []);

  const tier = useMemo(
    () => resolveQualityTier(pref, reducedMotion),
    [pref, reducedMotion],
  );

  const info = useMemo(() => getTierInfo(tier, pref), [tier, pref]);

  const updatePreference = useCallback((p: QualityPreference) => {
    setQualityPreference(p);
    setPref(p);
  }, []);

  return {
    ...info,
    setPreference: updatePreference,
  };
}
