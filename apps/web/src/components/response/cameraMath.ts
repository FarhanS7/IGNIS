/**
 * Deterministic Camera Position & Fly-to Calculation for Station 3D Scene.
 * Pure mathematical functions of timeline time `t` with optional user control offsets.
 *
 * Implements two camera modes:
 * Mode A: Guided Incident (isGuidedMode = true, 36s target duration):
 *   Stage 1: Overview (0s - 4s) -> Wide Spacecraft Overview
 *   Stage 2: Detection (4s - 10s) -> Approach & Cutaway into Affected Module
 *   Stage 3: Alarm (10s - 14s) -> Hold Focus on Affected Module
 *   Stage 4: Response (14s - 26s) -> Pull back to Spacecraft Response Overview
 *   Stage 5: Outcome (26s - 32s) -> Return to Module Interior Outcome View
 *   Stage 6: Summary (32s - 36s) -> Final Spacecraft Wide Overview
 *
 * Mode B: Explore Full Simulation (isGuidedMode = false, 100s timeline):
 *   Baseline wide overview, smooth fly-to transition upon alarm, responsive suppression overview,
 *   interior outcome upon extinction, and wide debrief overview.
 */

export type CameraStateId =
  | 'OVERVIEW'
  | 'MODULE_APPROACH'
  | 'MODULE_CUTAWAY'
  | 'RESPONSE_OVERVIEW'
  | 'OUTCOME_INTERIOR'
  | 'DEBRIEF_OVERVIEW'
  | 'MANUAL_INSPECTION';

export interface CameraOrbitState {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  radius: number;
  flyK: number;
  stateId: CameraStateId;
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function computeStationCamera(
  t: number,
  sourceZoneX: number,
  alarmTime_s: number | null,
  isSuppressionActive: boolean,
  userAzimuthOffset = 0,
  userElevationOffset = 0,
  userZoomOffset = 0,
  isFireExtinguished = false,
  selectedZoneX?: number,
  isGuidedMode = false
): CameraOrbitState {
  const focusX = selectedZoneX !== undefined ? selectedZoneX : sourceZoneX;

  // Derive manual camera control flag
  const hasManualControl =
    Math.abs(userAzimuthOffset) > 0.001 ||
    Math.abs(userElevationOffset) > 0.001 ||
    Math.abs(userZoomOffset) > 0.001;

  let baseRad = 13.0;
  let targetX = 0;
  let flyK = 0.0;
  let stateId: CameraStateId = 'OVERVIEW';

  if (isGuidedMode) {
    // --- MODE A: GUIDED INCIDENT MODE (36s Target Duration) ---
    // Stage 1: Incident (0s - 4s) -> Wide Spacecraft Overview
    if (t < 4.0) {
      baseRad = 13.5;
      targetX = 0;
      flyK = 0.0;
      stateId = 'OVERVIEW';
    }
    // Stage 2: Detection (4s - 10s) -> Approach & Cutaway into Affected Module
    else if (t < 10.0) {
      const kApproach = smoothstep(4.0, 7.0, t);
      baseRad = 13.5 - 5.3 * kApproach; // 13.5 -> 8.2
      targetX = focusX * kApproach;
      flyK = kApproach;
      stateId = kApproach >= 0.8 ? 'MODULE_CUTAWAY' : 'MODULE_APPROACH';
    }
    // Stage 3: Alarm (10s - 14s) -> Hold Focus on Affected Module
    else if (t < 14.0) {
      baseRad = 8.2;
      targetX = focusX;
      flyK = 1.0;
      stateId = 'MODULE_CUTAWAY';
    }
    // Stage 4: Response (14s - 26s) -> Pull back to Spacecraft Response Overview
    else if (t < 26.0) {
      const kPull = smoothstep(14.0, 16.5, t);
      baseRad = 8.2 + 3.0 * kPull; // 8.2 -> 11.2
      targetX = focusX * (1.0 - 0.35 * kPull);
      flyK = 1.0 - 0.35 * kPull;
      stateId = 'RESPONSE_OVERVIEW';
    }
    // Stage 5: Outcome (26s - 32s) -> Return to Module Interior Outcome View
    else if (t < 32.0) {
      const kReturn = smoothstep(26.0, 28.5, t);
      baseRad = 11.2 - 3.0 * kReturn; // 11.2 -> 8.2
      targetX = focusX * (0.65 + 0.35 * kReturn);
      flyK = 0.65 + 0.35 * kReturn;
      stateId = 'OUTCOME_INTERIOR';
    }
    // Stage 6: Summary (32s - 36s) -> Final Spacecraft Wide Overview
    else {
      const kSummary = smoothstep(32.0, 34.5, t);
      baseRad = 8.2 + 5.3 * kSummary; // 8.2 -> 13.5
      targetX = focusX * (1.0 - kSummary);
      flyK = 1.0 - kSummary;
      stateId = 'DEBRIEF_OVERVIEW';
    }
  } else {
    // --- MODE B: EXPLORE FULL SIMULATION MODE (100s Timeline) ---
    if (alarmTime_s !== null && t >= alarmTime_s) {
      flyK = smoothstep(0, 2.5, t - alarmTime_s);
    }
    const flyRad = 8.5;
    baseRad = Math.max(4.0, Math.min(25.0, 13.0 - (13.0 - flyRad) * flyK));
    targetX = focusX * flyK * (isSuppressionActive ? 0.95 : 0.8);

    if (t >= 75.0) {
      stateId = 'DEBRIEF_OVERVIEW';
    } else if (isFireExtinguished) {
      stateId = 'OUTCOME_INTERIOR';
    } else if (isSuppressionActive) {
      stateId = 'RESPONSE_OVERVIEW';
    } else if (flyK >= 0.8) {
      stateId = 'MODULE_CUTAWAY';
    } else if (flyK > 0) {
      stateId = 'MODULE_APPROACH';
    } else {
      stateId = 'OVERVIEW';
    }
  }

  // Camera orbit angles (pure functions of t + manual offsets)
  const az = 0.12 + 0.08 * Math.sin(t * 0.15) - 0.08 * flyK + userAzimuthOffset;
  const el = Math.max(-0.8, Math.min(0.8, 0.22 + 0.05 * Math.cos(t * 0.12) + userElevationOffset));
  const rad = Math.max(4.0, Math.min(25.0, baseRad * (1.0 + userZoomOffset)));

  const targetY = 0;
  const targetZ = 0;

  const x = targetX + rad * Math.cos(el) * Math.sin(az);
  const y = targetY + rad * Math.sin(el);
  const z = targetZ + rad * Math.cos(el) * Math.cos(az);

  if (hasManualControl) {
    stateId = 'MANUAL_INSPECTION';
  }

  return {
    x,
    y,
    z,
    targetX,
    targetY,
    targetZ,
    radius: rad,
    flyK,
    stateId,
  };
}
