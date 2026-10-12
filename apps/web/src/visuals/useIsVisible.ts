/**
 * useIsVisible.ts – Tracks whether a DOM element is currently visible.
 *
 * Combines IntersectionObserver (viewport visibility) with the
 * Page Visibility API (tab hidden/shown) to return `true` only when
 * the element is both in the viewport AND the tab is focused.
 *
 * 3D / heavy-animation components use this to pause their render loops
 * when offscreen or when the user switches tabs.
 */

import { useState, useEffect, useRef, type RefObject } from 'react';

export interface UseIsVisibleOptions {
  /** IntersectionObserver rootMargin – default '100px' for pre-warming */
  rootMargin?: string;
  /** Visibility ratio threshold – default 0.05 (5 %) */
  threshold?: number;
  /** If true, remains visible once intersected and disconnects observer */
  once?: boolean;
}

/**
 * Hook: returns `[ref, isVisible]`.
 * Attach `ref` to the container element you want to observe.
 */
export function useIsVisible<T extends HTMLElement = HTMLDivElement>(
  options: UseIsVisibleOptions = {},
): [RefObject<T | null>, boolean] {
  const { rootMargin = '100px', threshold = 0.05, once = false } = options;

  const ref = useRef<T | null>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true,
  );

  // IntersectionObserver – is the element scrolled into view?
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInViewport(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  // Page Visibility API – is the tab active?
  useEffect(() => {
    const handler = () => setIsTabVisible(!document.hidden);

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return [ref, isInViewport && isTabVisible];
}
