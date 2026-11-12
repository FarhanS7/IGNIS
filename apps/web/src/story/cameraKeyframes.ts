/**
 * Story Mode - Camera Keyframes & Motion Smoothing
 *
 * Provides eased transitions between beat keyframes.
 * Enforces prefers-reduced-motion: returns static keyframes with zero camera panning/shaking.
 */

import type { CameraPose } from './sceneState';

export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function lerpVector3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Interpolates smoothly between camera poses, respecting reduced motion settings.
 */
export function interpolateCameraPose(
  fromPose: CameraPose,
  toPose: CameraPose,
  factor: number,
  reduceMotion = false
): CameraPose {
  if (reduceMotion) {
    // Under reduced motion: snap directly to target keyframe without transitional travel
    return toPose;
  }

  const easedT = easeInOutCubic(Math.max(0, Math.min(1, factor)));
  return {
    position: lerpVector3(fromPose.position, toPose.position, easedT),
    target: lerpVector3(fromPose.target, toPose.target, easedT),
    fov: lerp(fromPose.fov, toPose.fov, easedT),
  };
}

