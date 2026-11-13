import type { ExtinctionRegionCategory, M4ModelExport } from './modelTypes.ts';
import { evaluateLogisticLinear, standardizeFeatures } from './logistic.ts';
import { predictConformalSet } from './abstain.ts';

export interface FLEXExtinctionInput {
  oxygen_mole_fraction: number;
  co2_mole_fraction: number;
  nitrogen_mole_fraction: number;
  helium_mole_fraction: number;
  ambient_pressure_kpa: number;
  droplet_initial_diameter_mm: number;
  is_heptane: number;
}

export interface FLEXExtinctionOutput {
  rawFeatures: number[];
  scaledFeatures: number[];
  logit: number;
  probability: number;
  conformalSet: number[];
  isAbstained: boolean;
  category: ExtinctionRegionCategory;
  notes: string[];
}

/**
 * Evaluates droplet flame extinction limit for microgravity isolated droplets (M4).
 * Enforces conformal prediction sets to abstain on ambiguous gas mixtures.
 */
export function evaluateFLEXExtinction(
  model: M4ModelExport,
  input: FLEXExtinctionInput
): FLEXExtinctionOutput {
  const rawFeatures = [
    input.oxygen_mole_fraction,
    input.co2_mole_fraction,
    input.nitrogen_mole_fraction,
    input.helium_mole_fraction,
    input.ambient_pressure_kpa,
    input.droplet_initial_diameter_mm,
    input.is_heptane,
  ];

  // Validate inputs
  for (const v of rawFeatures) {
    if (typeof v !== 'number' || Number.isNaN(v)) {
      return {
        rawFeatures,
        scaledFeatures: [],
        logit: 0,
        probability: 0.5,
        conformalSet: [0, 1],
        isAbstained: true,
        category: 'INSUFFICIENT_EVIDENCE',
        notes: ['Input parameters contain non-numeric or NaN values.'],
      };
    }
  }

  if (input.ambient_pressure_kpa <= 0 || input.droplet_initial_diameter_mm <= 0) {
    return {
      rawFeatures,
      scaledFeatures: [],
      logit: 0,
      probability: 0.5,
      conformalSet: [0, 1],
      isAbstained: true,
      category: 'INSUFFICIENT_EVIDENCE',
      notes: ['Physical parameters out of valid domain (non-positive diameter or pressure).'],
    };
  }

  const scaledFeatures = standardizeFeatures(
    rawFeatures,
    model.preprocessing.scaler_mean,
    model.preprocessing.scaler_scale
  );

  const { logit, prob } = evaluateLogisticLinear(
    scaledFeatures,
    model.params.coef,
    model.params.intercept
  );

  const conformalSet = predictConformalSet(prob, model.abstention.conformal_q_hat_90);
  const isAbstained = conformalSet.length !== 1;

  let category: ExtinctionRegionCategory = 'INSUFFICIENT_EVIDENCE';
  const notes: string[] = [];

  if (isAbstained) {
    category = 'INSUFFICIENT_EVIDENCE';
    notes.push(
      `Conformal prediction set C(x) = {${conformalSet.join(', ')}} contains ambiguity at 90% target coverage. Model abstains.`
    );
  } else if (conformalSet[0] === 1) {
    category = 'EXTINCTION_REGION';
    notes.push(
      `Extinction region boundary reached (P_ext = ${prob.toFixed(3)} >= threshold). Droplet quenching conditions present.`
    );
  } else {
    category = 'SUSTAINED_REGION';
    notes.push(
      `Condition within sustained droplet combustion regime (P_ext = ${prob.toFixed(3)}). Continued burning conditions present.`
    );
  }

  return {
    rawFeatures,
    scaledFeatures,
    logit,
    probability: prob,
    conformalSet,
    isAbstained,
    category,
    notes,
  };
}
