/**
 * Story Mode - Deterministic 3D Scene State Engine
 *
 * Pure function: (chapterSlug, beatIndex, progress, inputs, seed, level) -> SceneState
 *
 * Rules:
 * - Deterministic: Bit-identical outputs for identical inputs.
 * - Seeded PRNG: mulberry32 only. Strictly deterministic entropy without wall-clock time.
 * - Act flow: coldOpen -> wonder -> do -> reveal -> takeaway.
 * - Letterbox bars slide in for cold open and out when interactive.
 */

import type { StoryLevel } from './levels';

export type StoryAct = 'coldOpen' | 'wonder' | 'do' | 'reveal' | 'takeaway';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface FlameState {
  visible: boolean;
  radius: number;
  elongation: number; // 1.0 = pure sphere (0g), ~2.6 = buoyant teardrop (1g)
  coreColor: string;
  outerColor: string;
  buoyancy: number; // 0.0 (orbit) to 1.0 (Earth)
  sootCount: number;
  tiltAngleRad: number;
  flickerIntensity: number;
}

export interface DropletState {
  visible: boolean;
  diameterMm: number;
  initialDiameterMm: number;
  extinctionDiameterMm: number;
  burnProgress: number; // 0.0 to 1.0
  durationSec: number;
  fuel: string;
  runId: string | null;
  testNumber: number | null;
  csvRow: number | null;
}

export interface SmokeState {
  visible: boolean;
  particleCount: number;
  buoyantRiseSpeed: number; // 0 in microgravity
  dispersionRadius: number;
  driftVelocity: [number, number, number];
  detectorTripped: boolean;
}

export interface SceneState {
  chapterSlug: string;
  beatIndex: number;
  act: StoryAct;
  letterboxActive: boolean;
  camera: CameraPose;
  flame: FlameState;
  droplet: DropletState;
  smoke: SmokeState;
  starfield: {
    speed: number;
    driftZ: number;
  };
  truthTag: 'From NASA flight tests' | 'Illustration';
  illustrationDescription: string;
}

/**
 * Deterministic mulberry32 32-bit PRNG
 */
export function mulberry32(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministically seeded Float32Array of 3D positions
 */
export function generateSeededParticles(
  count: number,
  seed: number,
  spreadRadius = 3.0
): Float32Array {
  const rng = mulberry32(seed);
  const buffer = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const r = spreadRadius * Math.cbrt(rng());
    const theta = rng() * 2 * Math.PI;
    const phi = Math.acos(2 * rng() - 1);

    buffer[idx] = r * Math.sin(phi) * Math.cos(theta);
    buffer[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
    buffer[idx + 2] = r * Math.cos(phi);
  }
  return buffer;
}

/**
 * Pure function mapping narrative beat and inputs to 3D scene state
 */
export function getSceneState(
  chapterSlug: string,
  beatIndex: number,
  progress = 0.0,
  inputs: Record<string, any> = {},
  _seed = 42,
  level: StoryLevel = 'explorer'
): SceneState {
  // Normalize progress to [0, 1]
  const p = Math.max(0.0, Math.min(1.0, progress));

  // Determine Act from beatIndex
  let act: StoryAct = 'wonder';
  if (beatIndex === 0) act = 'coldOpen';
  else if (beatIndex === 1) act = 'wonder';
  else if (beatIndex === 2 || beatIndex === 3) act = 'do';
  else if (beatIndex === 4) act = 'reveal';
  else act = 'takeaway';

  // Letterbox is active only during the Cold Open
  const letterboxActive = act === 'coldOpen';

  // Camera Rig Poses per Act
  let camera: CameraPose = {
    position: [0, 0, 5],
    target: [0, 0, 0],
    fov: 45,
  };

  if (act === 'coldOpen') {
    // Cinematic push-in: from z=7.5 down to z=4.5
    const camZ = 7.5 - p * 3.0;
    camera = {
      position: [0, 0, camZ],
      target: [0, 0, 0],
      fov: 42,
    };
  } else if (act === 'wonder') {
    camera = {
      position: [0, 0.4, 4.2],
      target: [0, 0.1, 0],
      fov: 44,
    };
  } else if (act === 'do') {
    camera = {
      position: [0, 0.2, 3.8],
      target: [0, 0.0, 0],
      fov: 45,
    };
  } else if (act === 'reveal') {
    camera = {
      position: [0.8, 0.2, 3.6],
      target: [0, 0, 0],
      fov: 48,
    };
  } else {
    // takeaway
    camera = {
      position: [0, 0, 5.0],
      target: [0, 0, 0],
      fov: 45,
    };
  }

  // Flame State calculations
  // In CH1: Gravity morph controls elongation and colors
  // inputs.gravity_g: 1.0 (Earth) -> 0.0 (Orbit)
  const gravityG = typeof inputs.gravity_g === 'number' ? Math.max(0.0, Math.min(1.0, inputs.gravity_g)) : (
    chapterSlug === 'same-fire-different-air' ? 0.0 :
      act === 'coldOpen' ? 1.0 :
        act === 'wonder' ? 1.0 :
          act === 'do' ? 0.0 :
            0.0
  );

  const buoyancy = gravityG;
  const airflow = typeof inputs.airflow_cm_s === 'number' ? Math.max(0.0, inputs.airflow_cm_s) : (
    chapterSlug === 'same-fire-different-air' ? 5.0 : 0.0
  );
  const oxygenPct = typeof inputs.oxygen_pct === 'number' ? Math.max(10.0, Math.min(30.0, inputs.oxygen_pct)) : 21.0;

  // Chapter 2: Solid fuel burning in microgravity under forced ventilation
  let elongation = 1.0 + buoyancy * 1.5;
  let radius = 1.0 + (1.0 - buoyancy) * 0.35;
  let coreColor = buoyancy < 0.2 ? '#38bdf8' : '#f59e0b';
  let outerColor = buoyancy < 0.2 ? '#0284c7' : '#ea580c';
  let sootCount = Math.round(buoyancy * 60);

  if (chapterSlug === 'same-fire-different-air') {
    if (airflow < 0.5) {
      // Quenched / suffocating in stagnant zero-g
      radius = 0.5;
      elongation = 0.95;
      coreColor = '#1e3a8a';
      outerColor = '#0c4a6e';
      sootCount = 0;
    } else {
      // Sustained by ventilation flow
      radius = 0.95 + Math.min(0.4, airflow * 0.02);
      elongation = 1.0 + Math.min(1.2, airflow * 0.04);
      coreColor = oxygenPct > 20.0 ? '#fef08a' : '#38bdf8';
      outerColor = oxygenPct > 20.0 ? '#f59e0b' : '#0284c7';
      sootCount = Math.round(oxygenPct * 1.5);
    }
  } else if (chapterSlug === 'smoke-that-does-not-rise') {
    // Smoldering wire insulation
    radius = 0.45;
    elongation = 1.0;
    coreColor = '#ea580c';
    outerColor = '#78716c';
    sootCount = 80;
  } else if (chapterSlug === 'what-nasa-has-not-tested') {
    // Exploration atmosphere regimes
    elongation = 1.0 + buoyancy * 1.4;
    radius = 0.9 + (oxygenPct - 21.0) * 0.025;
    coreColor = oxygenPct > 25.0 ? '#fef9c3' : buoyancy < 0.2 ? '#38bdf8' : '#f59e0b';
    outerColor = oxygenPct > 25.0 ? '#f59e0b' : buoyancy < 0.2 ? '#0284c7' : '#ea580c';
    sootCount = Math.round(buoyancy * 40 + oxygenPct);
  }

  const flame: FlameState = {
    visible: true,
    radius,
    elongation,
    coreColor,
    outerColor,
    buoyancy,
    sootCount,
    tiltAngleRad: airflow * 0.04,
    flickerIntensity: airflow < 0.5 ? 0.02 : 0.05 + buoyancy * 0.12, // low flicker to maintain safety
  };

  // Droplet State calculations (FLEX Flight Runs - Chapter 1 only)
  // Default values based on real NASA PSI-69 Test #1 (Methanol)
  const initialD0 = typeof inputs.initial_diameter_mm === 'number' ? inputs.initial_diameter_mm : 1.69;
  const duration = typeof inputs.burn_time_s === 'number' ? inputs.burn_time_s : 4.3;
  const burnProg = typeof inputs.burn_progress === 'number' ? Math.max(0.0, Math.min(1.0, inputs.burn_progress)) : p;

  // D-squared evaporation curve for droplet diameter
  // d(t) = d0 * sqrt(max(0, 1 - t/t_burn))
  const currentDiameter = initialD0 * Math.sqrt(Math.max(0.0, 1.0 - burnProg));

  const droplet: DropletState = {
    visible: chapterSlug === 'why-is-fire-round-in-space' && (act === 'reveal' || act === 'do'),
    diameterMm: Number(currentDiameter.toFixed(2)),
    initialDiameterMm: initialD0,
    extinctionDiameterMm: typeof inputs.extinction_diameter_mm === 'number' ? inputs.extinction_diameter_mm : 0.89,
    burnProgress: burnProg,
    durationSec: duration,
    fuel: inputs.fuel || 'Methanol',
    runId: inputs.run_id || 'PSI-69-RUN-0001',
    testNumber: inputs.test_number || 1,
    csvRow: inputs.csv_row || 2,
  };

  // Smoke State
  const smoke: SmokeState = {
    visible: chapterSlug === 'smoke-that-does-not-rise' || Boolean(inputs.show_smoke),
    particleCount: level === 'little' ? 40 : 100,
    buoyantRiseSpeed: buoyancy * 1.5,
    dispersionRadius: 1.2 + (1.0 - buoyancy) * 1.8,
    driftVelocity: [inputs.airflow_cm_s ? inputs.airflow_cm_s * 0.05 : 0.02, buoyancy * 0.8, 0],
    detectorTripped: Boolean(inputs.detector_tripped),
  };

  return {
    chapterSlug,
    beatIndex,
    act,
    letterboxActive,
    camera,
    flame,
    droplet,
    smoke,
    starfield: {
      speed: act === 'coldOpen' ? 0.8 : 0.15,
      driftZ: p * 2.0,
    },
    truthTag: act === 'reveal' ? 'From NASA flight tests' : 'Illustration',
    illustrationDescription:
      chapterSlug === 'same-fire-different-air'
        ? (act === 'reveal'
          ? `BASS-II airflow speed (${airflow.toFixed(1)} cm/s) and oxygen (${oxygenPct.toFixed(1)}%) are measured NASA flight records. Flame shape and ventilation tilt are an Illustration.`
          : 'Flame quenching and ventilation airflow response are an Illustration to build intuition.')
        : chapterSlug === 'smoke-that-does-not-rise'
          ? (act === 'reveal'
            ? 'SAME-R sensor response ratios (Rt/R0) are measured NASA flight records. Smoke aerosol dispersion animation is an Illustration.'
            : 'Smoldering wire insulation and non-buoyant aerosol motion are an Illustration to build intuition.')
          : chapterSlug === 'what-nasa-has-not-tested'
            ? (act === 'reveal'
              ? 'Tested envelope limits (13.6%–22.2% O2) are NASA flight records. Exploration flames (34% O2, Moon, Mars) are an Illustration highlighting research gaps.'
              : 'Exploration environments and untested regimes are an Illustration to build intuition.')
            : (act === 'reveal'
              ? `Droplet size (${initialD0} mm) and burn time (${duration} s) are measured NASA flight records. Droplet shrinkage animation is an Illustration.`
              : 'Flame shape morph and particle behavior are an Illustration to build intuition.'),
  };
}