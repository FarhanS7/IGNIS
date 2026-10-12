/**
 * flameParams.ts – Pure, unit-testable flame parameter derivation.
 *
 * Single source of truth consumed by both the SVG fallback flame and
 * the (future) Three.js flame mesh. Every visual property is derived
 * deterministically from the ScenarioInput fields that already exist
 * on the backend contract.
 *
 * Math ported from EvidenceGuidedVisualization.tsx (FR-EGV-003):
 *   - radius    = clamp(35 + (o2 − 21) × 1.5,  30, 65)
 *   - elongation by gravity: 0g → 1.0, lunar → 1.25, mars → 1.45, 1g → 1.8
 *   - tilt      = min(25, airflow × 1.2)
 *   - O2 color thresholds: >28 hot, <19 cool, else nominal
 *
 * No scientific claims are made here – these are illustrative visual
 * mappings, not CFD outputs.
 */

import type { ScenarioInput, GravityEnvironment } from '../types/api';

// ---------------------------------------------------------------------------
// Output type
// ---------------------------------------------------------------------------

export interface FlameParams {
  /** Effective gravity in multiples of Earth-g (0, 0.16, 0.38, 1) */
  gravityG: number;
  /** Normalised buoyancy strength 0..1 (0 = microgravity, 1 = full 1-g) */
  buoyancy: number;
  /** Height-to-width multiplier (1 = sphere, 1.8 = tall teardrop) */
  elongation: number;
  /** Downstream tilt in degrees from forced airflow */
  tiltDeg: number;
  /** Base radius of the outer flame envelope (SVG / mesh units) */
  radius: number;
  /** CSS/hex colour string for the high-temperature core */
  coreColor: string;
  /** CSS/hex colour string for the cooler outer envelope */
  outerColor: string;
  /** Normalised soot amount 0..1 (higher for rich/low-O2 flames) */
  sootAmount: number;
  /** Normalised brightness 0..1 */
  brightness: number;
  /** Flicker animation speed multiplier (1 = nominal) */
  flickerSpeed: number;
  /** Lateral drift magnitude from asymmetric buoyancy/airflow */
  drift: number;
  /** Human-readable gravity regime label */
  regimeLabel: string;
  /** Shape descriptor for ARIA / a11y */
  shapeDescription: string;
  /** Core colour descriptor for ARIA / a11y */
  coreDescription: string;
}

// ---------------------------------------------------------------------------
// Gravity look-up
// ---------------------------------------------------------------------------

const GRAVITY_TABLE: Record<
  string,
  { g: number; buoyancy: number; elongation: number; label: string; shape: string }
> = {
  microgravity:          { g: 0,    buoyancy: 0,    elongation: 1.0,  label: 'Spherical Diffusion (0g)',    shape: 'spherical' },
  partial_gravity_lunar: { g: 0.16, buoyancy: 0.16, elongation: 1.25, label: 'Weak Buoyancy (0.16g)',       shape: 'slightly elongated' },
  partial_gravity_mars:  { g: 0.38, buoyancy: 0.38, elongation: 1.45, label: 'Partial Buoyancy (0.38g)',    shape: 'moderately elongated' },
  earth_gravity:         { g: 1.0,  buoyancy: 1.0,  elongation: 1.8,  label: 'Convective Plume (1g)',       shape: 'buoyant teardrop' },
};

function resolveGravity(env?: GravityEnvironment | null) {
  if (!env || !(env in GRAVITY_TABLE)) {
    // Default to microgravity (the primary research context of IGNIS)
    return GRAVITY_TABLE.microgravity;
  }
  return GRAVITY_TABLE[env];
}

// ---------------------------------------------------------------------------
// O2-dependent colour thresholds
// ---------------------------------------------------------------------------

function deriveColors(o2: number) {
  if (o2 > 28) {
    return {
      coreColor: 'rgba(254, 240, 138, 0.95)',   // Brilliant yellow-white
      outerColor: 'rgba(255, 87, 34, 0.65)',     // Rich bright orange-red
      coreDescription: 'bright yellow-white core',
    };
  }
  if (o2 < 19) {
    return {
      coreColor: 'rgba(125, 211, 252, 0.85)',    // Pale blue
      outerColor: 'rgba(56, 189, 248, 0.7)',     // Dim cold blue
      coreDescription: 'blue core',
    };
  }
  return {
    coreColor: 'rgba(253, 186, 116, 0.9)',       // Amber core
    outerColor: 'rgba(245, 158, 11, 0.6)',       // Nominal golden
    coreDescription: 'amber core',
  };
}

// ---------------------------------------------------------------------------
// Main derivation
// ---------------------------------------------------------------------------

export function deriveFlameParams(scenario: ScenarioInput | Partial<ScenarioInput>): FlameParams {
  const o2 = scenario.oxygen_pct ?? 21.0;
  const airflow = scenario.airflow_cm_s ?? 5.0;
  const pressure = scenario.pressure_kpa ?? 101.3;

  const gravity = resolveGravity(scenario.gravity_environment);
  const colors = deriveColors(o2);

  // Flame scale – clamped [30, 65]
  const radius = Math.max(30, Math.min(65, 35 + (o2 - 21) * 1.5));

  // Downstream tilt from forced ventilation – capped at 25°
  const tiltDeg = Math.min(25, airflow * 1.2);

  // Soot: higher in low-O2, higher-pressure environments
  const sootAmount = Math.max(0, Math.min(1, (1 - (o2 - 15) / 20) * (pressure / 101.3)));

  // Brightness: scales with O2 enrichment
  const brightness = Math.max(0.3, Math.min(1, 0.5 + (o2 - 21) * 0.04));

  // Flicker speed: faster in turbulent (high airflow) scenarios
  const flickerSpeed = Math.max(0.5, Math.min(2, 1 + (airflow - 5) * 0.03));

  // Lateral drift: combination of airflow push and weak gravity
  const drift = tiltDeg * (1 - gravity.buoyancy * 0.5);

  return {
    gravityG: gravity.g,
    buoyancy: gravity.buoyancy,
    elongation: gravity.elongation,
    tiltDeg,
    radius,
    coreColor: colors.coreColor,
    outerColor: colors.outerColor,
    sootAmount,
    brightness,
    flickerSpeed,
    drift,
    regimeLabel: gravity.label,
    shapeDescription: gravity.shape,
    coreDescription: colors.coreDescription,
  };
}
