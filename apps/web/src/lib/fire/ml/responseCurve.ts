import type { M1ModelExport } from './modelTypes.ts';

export interface ParticleResponseResult {
  diameter_um: number;
  baseMultiplierPoly: number;
  baseMultiplierIsotonic: number;
  baseMultiplierRidge: number;
  ciLower95: number;
  ciUpper95: number;
  materialMultiplier: number;
  effectiveMultiplierPoly: number;
  effectiveMultiplierRidge: number;
  effectiveMultiplierIsotonic: number;
}

/**
 * Piecewise linear interpolation of calibrated SAME-R detector response curve.
 * Applies calibrated small-particle penalty if fuel/material is identified (e.g. Teflon).
 */
export function interpolateResponseCurve(
  model: M1ModelExport,
  diameter_um: number,
  material: string = 'cellulose'
): ParticleResponseResult {
  const pts = model.curve_points;
  if (!pts || pts.length === 0) {
    throw new Error('M1 model contains no curve points');
  }

  let poly = pts[0].response_multiplier_poly;
  let iso = pts[0].response_multiplier_isotonic;
  let ridge = pts[0].response_multiplier_ridge;
  let ciLo = pts[0].ci_lower_95;
  let ciHi = pts[0].ci_upper_95;

  if (diameter_um <= pts[0].diameter_um) {
    poly = pts[0].response_multiplier_poly;
    iso = pts[0].response_multiplier_isotonic;
    ridge = pts[0].response_multiplier_ridge;
    ciLo = pts[0].ci_lower_95;
    ciHi = pts[0].ci_upper_95;
  } else if (diameter_um >= pts[pts.length - 1].diameter_um) {
    const last = pts[pts.length - 1];
    poly = last.response_multiplier_poly;
    iso = last.response_multiplier_isotonic;
    ridge = last.response_multiplier_ridge;
    ciLo = last.ci_lower_95;
    ciHi = last.ci_upper_95;
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const pA = pts[i];
      const pB = pts[i + 1];
      if (diameter_um >= pA.diameter_um && diameter_um <= pB.diameter_um) {
        const span = pB.diameter_um - pA.diameter_um;
        const frac = span > 0 ? (diameter_um - pA.diameter_um) / span : 0;
        poly = pA.response_multiplier_poly + frac * (pB.response_multiplier_poly - pA.response_multiplier_poly);
        iso = pA.response_multiplier_isotonic + frac * (pB.response_multiplier_isotonic - pA.response_multiplier_isotonic);
        ridge = pA.response_multiplier_ridge + frac * (pB.response_multiplier_ridge - pA.response_multiplier_ridge);
        ciLo = pA.ci_lower_95 + frac * (pB.ci_lower_95 - pA.ci_lower_95);
        ciHi = pA.ci_upper_95 + frac * (pB.ci_upper_95 - pA.ci_upper_95);
        break;
      }
    }
  }

  let matFactor = 1.0;
  const matLower = material.toLowerCase().trim();
  if (matLower === 'teflon') {
    matFactor = model.small_particle_penalty_calibrated.teflon_mean_multiplier;
  } else if (matLower === 'kapton') {
    matFactor = model.small_particle_penalty_calibrated.kapton_mean_multiplier;
  }

  return {
    diameter_um,
    baseMultiplierPoly: poly,
    baseMultiplierIsotonic: iso,
    baseMultiplierRidge: ridge,
    ciLower95: ciLo,
    ciUpper95: ciHi,
    materialMultiplier: matFactor,
    effectiveMultiplierPoly: poly * matFactor,
    effectiveMultiplierRidge: ridge * matFactor,
    effectiveMultiplierIsotonic: iso * matFactor,
  };
}

