/**
 * useReducedMotion.ts – Respects the user's `prefers-reduced-motion` setting.
 *
 * Returns `true` when the OS/browser accessibility setting requests
 * reduced motion.  The hook listens for live changes (e.g. the user
 * toggles the setting while the page is open).
 *
 * All animation helpers in this module must no-op when this returns true
 * (render a single static frame, set final state immediately).
 */

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Hook: returns `true` when the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(QUERY);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mql.addEventListener('change', handler);
    // Sync in case the initial state changed between SSR and hydration
    setPrefersReduced(mql.matches);

    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
