import type { ConformalResult } from './modelTypes.ts';

/**
 * Returns split-conformal prediction set C(x) for a binary model probability.
 *
 * Mathematical formulation from scripts/ml/m5_abstain/conformal.py:
 * - Candidate y=1 is included if (1 - prob) <= q_hat
 * - Candidate y=0 is included if prob <= q_hat
 */
export function predictConformalSet(prob: number, qHat: number): number[] {
  const set: number[] = [];
  if (1.0 - prob <= qHat) {
    set.push(1);
  }
  if (prob <= qHat) {
    set.push(0);
  }
  return set;
}

/**
 * Evaluates conformal abstention for binary prediction.
 * An observation is abstained (mapped to INSUFFICIENT_EVIDENCE) if its conformal
 * prediction set has size != 1 (either ambiguous {0, 1} or empty set).
 */
export function evaluateConformalAbstention(
  prob: number,
  qHat: number
): ConformalResult {
  const predictionSet = predictConformalSet(prob, qHat);
  const isAbstained = predictionSet.length !== 1;
  return {
    predictionSet,
    isAbstained,
    score: prob,
  };
}

/**
 * Evaluates margin-based abstention around an operating threshold.
 * An observation is abstained if distance to boundary |prob - threshold| < margin.
 */
export function evaluateMarginAbstention(
  prob: number,
  threshold: number = 0.5,
  margin: number = 0.05
): { isAbstained: boolean; margin: number } {
  const isAbstained = Math.abs(prob - threshold) < margin;
  return { isAbstained, margin };
}
