import type { ParameterSourceTag } from '../types.ts';

export interface DatasetProvenanceRef {
  id: string;
  doi: string;
  sha256: string;
}

export interface TrainingMetadata {
  datasets: DatasetProvenanceRef[];
  git_commit: string;
  seed: number;
  split_notes: string;
}

export interface ConformalAbstentionConfig {
  method: 'conformal' | 'margin';
  conformal_q_hat_90: number;
  margin_threshold: number;
}

export interface M2PreprocessingConfig {
  k_baseline: number;
  window_size: number;
  sample_rate_hz: number;
  z_thresholds: [number, number, number];
  scaler_mean: number[];
  scaler_scale: number[];
}

export interface M2ModelParams {
  coef: number[];
  intercept: number;
}

export interface M2OperatingPoint {
  decision_threshold: number;
  rule: string;
}

export interface M2ModelExport {
  model_id: 'm2-fusion-v1';
  version: string;
  type: 'logistic';
  feature_names: string[];
  preprocessing: M2PreprocessingConfig;
  params: M2ModelParams;
  abstention: ConformalAbstentionConfig;
  operating_point: M2OperatingPoint;
  training: TrainingMetadata;
  metrics_ref: string;
  card: string;
  limitations: string[];
  source_tag: ParameterSourceTag;
}

export interface M4PreprocessingConfig {
  scaler_mean: number[];
  scaler_scale: number[];
}

export interface M4OperatingPoint {
  decision_threshold: number;
  extinction_region_threshold: number;
  sustained_region_threshold: number;
  rule: string;
}

export interface M4ModelExport {
  model_id: 'm4-extinction-v1';
  version: string;
  type: 'logistic';
  feature_names: string[];
  preprocessing: M4PreprocessingConfig;
  params: M2ModelParams;
  abstention: ConformalAbstentionConfig;
  operating_point: M4OperatingPoint;
  training: TrainingMetadata;
  metrics_ref: string;
  card: string;
  limitations: string[];
  source_tag: ParameterSourceTag;
}

export interface M1CurvePoint {
  diameter_um: number;
  response_multiplier_isotonic: number;
  response_multiplier_poly: number;
  response_multiplier_ridge: number;
  ci_lower_95: number;
  ci_upper_95: number;
}

export interface M1ModelExport {
  model_id: 'm1-response-curve-v1';
  version: string;
  type: 'calibrated_curve';
  platform: string;
  applicable_range_um: { min: number; max: number };
  reference_sensitivity_v_per_mg_m3: number;
  small_particle_penalty_calibrated: {
    kapton_mean_multiplier: number;
    teflon_mean_multiplier: number;
    combined_small_particle_multiplier: number;
  };
  curve_points: M1CurvePoint[];
  training: TrainingMetadata;
  metrics_ref: string;
  card: string;
  limitations: string[];
  source_tag: ParameterSourceTag;
}

export type ExtinctionRegionCategory = 'EXTINCTION_REGION' | 'SUSTAINED_REGION' | 'INSUFFICIENT_EVIDENCE';

export interface ConformalResult {
  predictionSet: number[];
  isAbstained: boolean;
  score: number;
}

export interface ChannelWindow {
  values: number[];
  baseline: number;
  scale?: number;
}

export interface RawSensorPoint {
  timestamp_s: number;
  smoke: number;
  co: number;
  temp: number;
}

