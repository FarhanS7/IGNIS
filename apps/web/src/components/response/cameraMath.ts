/**
 * Deterministic Camera Position & Fly-to Calculation for Station 3D Scene.
 * Pure mathematical functions of timeline time `t`.
 */

export interface CameraOrbitState {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  radius: number;
  flyK: number;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function computeStationCamera(
  t: number,
  sourceZoneX: number,
  alarmTime_s: number | null,
  isSuppressionActive: boolean
): CameraOrbitState {
  // If alarm has triggered, smoothly interpolate fly-to over 2.5 seconds
  let flyK = 0.0;
  if (alarmTime_s !== null && t >= alarmTime_s) {
    flyK = smoothstep(0, 2.5, t - alarmTime_s);
  }

  // Camera orbit parameters (pure functions of t)
  const az = 0.12 + 0.08 * Math.sin(t * 0.15) - 0.08 * flyK;
  const el = 0.24 + 0.05 * Math.cos(t * 0.12);
  const baseRad = 13.0;
  const flyRad = 8.5;
  const rad = baseRad - (baseRad - flyRad) * flyK;

  const targetX = sourceZoneX * flyK * (isSuppressionActive ? 0.95 : 0.8);
  const targetY = 0;
  const targetZ = 0;

  const x = targetX + rad * Math.cos(el) * Math.sin(az);
  const y = rad * Math.sin(el);
  const z = rad * Math.cos(el) * Math.cos(az);

  return {
    x,
    y,
    z,
    targetX,
    targetY,
    targetZ,
    radius: rad,
    flyK,
  };
}

