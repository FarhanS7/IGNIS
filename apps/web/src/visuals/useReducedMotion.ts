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

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook: returns `true` when the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
