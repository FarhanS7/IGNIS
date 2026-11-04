/**
 * Stable sigmoid function with extreme logit clamping to avoid underflow/overflow.
 */
export function stableSigmoid(z: number): number {
  if (z > 50.0) return 1.0;
  if (z < -50.0) return 0.0;
  return 1.0 / (1.0 + Math.exp(-z));
}

/**
 * Standardizes a feature vector using in-model fitted scaler mean and scale.
 * Formula: z_i = (x_i - mean_i) / scale_i
 */
export function standardizeFeatures(
  features: number[],
  mean: number[],
  scale: number[]
): number[] {
  if (features.length !== mean.length || features.length !== scale.length) {
    throw new Error(
      `Dimension mismatch in feature standardization: features (${features.length}), mean (${mean.length}), scale (${scale.length})`
    );
  }

  const result: number[] = new Array(features.length);
  for (let i = 0; i < features.length; i++) {
    const s = scale[i] > 0 ? scale[i] : 1.0;
    result[i] = (features[i] - mean[i]) / s;
  }
  return result;
}

/**
 * Evaluates linear combination and sigmoid activation for logistic regression.
 */
export function evaluateLogisticLinear(
  scaledFeatures: number[],
  coef: number[],
  intercept: number
): { logit: number; prob: number } {
  if (scaledFeatures.length !== coef.length) {
    throw new Error(
      `Dimension mismatch in logistic evaluation: scaled features (${scaledFeatures.length}), coefficients (${coef.length})`
    );
  }

  let logit = intercept;
  for (let i = 0; i < coef.length; i++) {
    logit += coef[i] * scaledFeatures[i];
  }

  const prob = stableSigmoid(logit);
  return { logit, prob };
}
