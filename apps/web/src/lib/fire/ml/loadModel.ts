import type { M2ModelExport, M4ModelExport, M1ModelExport } from './modelTypes.ts';

/**
 * Validates the schema and shape of exported M2 sensor fusion detector model.
 * Throws a descriptive Error if any required field is absent or invalid.
 */
export function validateM2Model(obj: unknown): M2ModelExport {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid M2 model: payload must be a non-null object');
  }
  const m = obj as Partial<M2ModelExport>;
  if (m.model_id !== 'm2-fusion-v1') {
    throw new Error(`Invalid model_id: expected "m2-fusion-v1", got "${m.model_id}"`);
  }
  if (!Array.isArray(m.feature_names) || m.feature_names.length !== 10) {
    throw new Error('Invalid feature_names: expected array of 10 feature names');
  }
  if (!m.preprocessing || !Array.isArray(m.preprocessing.scaler_mean) || m.preprocessing.scaler_mean.length !== 10) {
    throw new Error('Invalid preprocessing: scaler_mean must be an array of length 10');
  }
  if (!Array.isArray(m.preprocessing.scaler_scale) || m.preprocessing.scaler_scale.length !== 10) {
    throw new Error('Invalid preprocessing: scaler_scale must be an array of length 10');
  }
  if (!m.params || !Array.isArray(m.params.coef) || m.params.coef.length !== 10) {
    throw new Error('Invalid params: coef must be an array of length 10');
  }
  if (typeof m.params.intercept !== 'number' || Number.isNaN(m.params.intercept)) {
    throw new Error('Invalid params: intercept must be a valid number');
  }
  if (!m.abstention || typeof m.abstention.conformal_q_hat_90 !== 'number' || Number.isNaN(m.abstention.conformal_q_hat_90)) {
    throw new Error('Invalid abstention: conformal_q_hat_90 must be a valid number');
  }
  if (!m.operating_point || typeof m.operating_point.decision_threshold !== 'number' || Number.isNaN(m.operating_point.decision_threshold)) {
    throw new Error('Invalid operating_point: decision_threshold must be a valid number');
  }
  return m as M2ModelExport;
}

/**
 * Validates the schema and shape of exported M4 FLEX droplet extinction model.
 * Throws a descriptive Error if any required field is absent or invalid.
 */
export function validateM4Model(obj: unknown): M4ModelExport {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid M4 model: payload must be a non-null object');
  }
  const m = obj as Partial<M4ModelExport>;
  if (m.model_id !== 'm4-extinction-v1') {
    throw new Error(`Invalid model_id: expected "m4-extinction-v1", got "${m.model_id}"`);
  }
  if (!Array.isArray(m.feature_names) || m.feature_names.length !== 7) {
    throw new Error('Invalid feature_names: expected array of 7 feature names');
  }
  if (!m.preprocessing || !Array.isArray(m.preprocessing.scaler_mean) || m.preprocessing.scaler_mean.length !== 7) {
    throw new Error('Invalid preprocessing: scaler_mean must be an array of length 7');
  }
  if (!Array.isArray(m.preprocessing.scaler_scale) || m.preprocessing.scaler_scale.length !== 7) {
    throw new Error('Invalid preprocessing: scaler_scale must be an array of length 7');
  }
  if (!m.params || !Array.isArray(m.params.coef) || m.params.coef.length !== 7) {
    throw new Error('Invalid params: coef must be an array of length 7');
  }
  if (typeof m.params.intercept !== 'number' || Number.isNaN(m.params.intercept)) {
    throw new Error('Invalid params: intercept must be a valid number');
  }
  if (!m.abstention || typeof m.abstention.conformal_q_hat_90 !== 'number' || Number.isNaN(m.abstention.conformal_q_hat_90)) {
    throw new Error('Invalid abstention: conformal_q_hat_90 must be a valid number');
  }
  return m as M4ModelExport;
}

/**
 * Validates the schema and shape of exported M1 SAME detector response curve.
 * Throws a descriptive Error if any required field is absent or invalid.
 */
export function validateM1Model(obj: unknown): M1ModelExport {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid M1 model: payload must be a non-null object');
  }
  const m = obj as Partial<M1ModelExport>;
  if (m.model_id !== 'm1-response-curve-v1') {
    throw new Error(`Invalid model_id: expected "m1-response-curve-v1", got "${m.model_id}"`);
  }
  if (!Array.isArray(m.curve_points) || m.curve_points.length === 0) {
    throw new Error('Invalid curve_points: expected non-empty array of curve points');
  }
  if (!m.small_particle_penalty_calibrated || typeof m.small_particle_penalty_calibrated.teflon_mean_multiplier !== 'number') {
    throw new Error('Invalid small_particle_penalty_calibrated: missing teflon multiplier');
  }
  return m as M1ModelExport;
}

