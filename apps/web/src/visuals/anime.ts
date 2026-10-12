/**
 * anime.ts – Thin wrapper around animejs v4 for IGNIS.
 *
 * Provides three opinionated helpers:
 *   - countUp(el, from, to, opts)   – animates a number display
 *   - staggerIn(elements, opts)     – staggers opacity + translateY entrance
 *   - drawPath(svgPath, opts)       – SVG stroke-dashoffset draw-on animation
 *
 * All helpers:
 *   ✓ No-op (set final state immediately) when `prefers-reduced-motion` is on
 *   ✓ Return a cleanup function suitable for React useEffect
 */

import { animate } from 'animejs/animation';
import { createDrawable } from 'animejs/svg';
import { stagger } from 'animejs/utils';

// Re-export stagger for external use
export { stagger };

// ---------------------------------------------------------------------------
// Reduced-motion detection (plain, non-hook for imperative use)
// ---------------------------------------------------------------------------

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CountUpOpts {
  /** Duration in ms – default 1200 */
  duration?: number;
  /** Decimal places – default 0 */
  decimals?: number;
  /** Suffix appended to the displayed text (e.g. '%', ' kPa') */
  suffix?: string;
  /** Easing – default 'outExpo' */
  easing?: string;
}

export interface StaggerInOpts {
  /** Per-element stagger delay in ms – default 80 */
  delay?: number;
  /** Duration per element in ms – default 600 */
  duration?: number;
  /** Translate-Y start offset in px – default 20 */
  translateY?: number;
  /** Easing – default 'outExpo' */
  easing?: string;
}

export interface DrawPathOpts {
  /** Duration in ms – default 1500 */
  duration?: number;
  /** Easing – default 'inOutQuad' */
  easing?: string;
  /** Delay before starting – default 0 */
  delay?: number;
}

type Cleanup = () => void;

// ---------------------------------------------------------------------------
// countUp
// ---------------------------------------------------------------------------

/**
 * Animates the textContent of `el` from `from` to `to`.
 *
 * Returns a cleanup function that reverts/cancels the animation.
 */
export function countUp(
  el: HTMLElement | null,
  from: number,
  to: number,
  opts: CountUpOpts = {},
): Cleanup {
  if (!el) return () => {};

  const { duration = 1200, decimals = 0, suffix = '', easing = 'outExpo' } = opts;

  // Reduced motion: set final state immediately
  if (prefersReducedMotion()) {
    el.textContent = to.toFixed(decimals) + suffix;
    return () => {};
  }

  const obj = { value: from };

  const anim = animate(obj, {
    value: to,
    duration,
    ease: easing,
    onRender: () => {
      el.textContent = obj.value.toFixed(decimals) + suffix;
    },
  });

  return () => {
    anim.pause();
    el.textContent = to.toFixed(decimals) + suffix;
  };
}

// ---------------------------------------------------------------------------
// staggerIn
// ---------------------------------------------------------------------------

/**
 * Fades and slides a set of elements into view with staggered timing.
 *
 * Returns a cleanup function that pauses the animation and ensures
 * elements are at their final (visible) state.
 */
export function staggerIn(
  elements: HTMLElement[] | NodeListOf<Element> | null,
  opts: StaggerInOpts = {},
): Cleanup {
  if (!elements || (elements instanceof Array && elements.length === 0)) return () => {};

  const {
    delay = 80,
    duration = 600,
    translateY: ty = 20,
    easing = 'outExpo',
  } = opts;

  const els = elements instanceof NodeList ? Array.from(elements) : elements;

  // Reduced motion: set final state immediately
  if (prefersReducedMotion()) {
    els.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'translateY(0)';
    });
    return () => {};
  }

  // Set initial state
  els.forEach((el) => {
    (el as HTMLElement).style.opacity = '0';
    (el as HTMLElement).style.transform = `translateY(${ty}px)`;
  });

  const anim = animate(els, {
    opacity: [0, 1],
    translateY: [ty, 0],
    duration,
    delay: stagger(delay),
    ease: easing,
  });

  return () => {
    anim.pause();
    els.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'translateY(0)';
    });
  };
}

// ---------------------------------------------------------------------------
// drawPath
// ---------------------------------------------------------------------------

/**
 * Animates the stroke-dashoffset of an SVG path to create a "draw" effect.
 *
 * Returns a cleanup function that pauses the animation and sets the
 * path to its fully-drawn state.
 */
export function drawPath(
  svgPath: SVGGeometryElement | null,
  opts: DrawPathOpts = {},
): Cleanup {
  if (!svgPath) return () => {};

  const { duration = 1500, easing = 'inOutQuad', delay = 0 } = opts;

  // Reduced motion: set final (fully drawn) state immediately
  if (prefersReducedMotion()) {
    const drawables = createDrawable(svgPath, 0, 1);
    if (drawables.length) drawables[0].setAttribute('draw', '0 1');
    return () => {};
  }

  try {
    const drawables = createDrawable(svgPath, 0, 0);
    if (!drawables.length) return () => {};

    const anim = animate(drawables[0], {
      draw: '0 1',
      duration,
      delay,
      ease: easing,
    });

    return () => {
      anim.pause();
      drawables[0].setAttribute('draw', '0 1');
    };
  } catch {
    // Fallback: show path immediately if drawable creation fails
    return () => {};
  }
}
