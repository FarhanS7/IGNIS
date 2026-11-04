import type {
  DetectorChannel,
  DetectorEngine,
  DetectorOutput,
  DetectorState,
  ParameterSourceTag,
  SensorReadingWindow,
} from '../types.ts';
import type { ChannelWindow, M2ModelExport } from './modelTypes.ts';
import { validateM2Model } from './loadModel.ts';
import {
  computeBaselineStats,
  extractUnitFreeFeatures,
  resampleReadingsToCadence,
} from './features.ts';
import { evaluateLogisticLinear, standardizeFeatures } from './logistic.ts';
import { predictConformalSet } from './abstain.ts';

/**
 * Trained Multi-Sensor ML Fusion Detector Engine (M2).
 *
 * Implements pure TypeScript browser inference of the pre-trained L2 logistic regression
 * fusion model with split-conformal abstention and pre-registered zero-false-alarm threshold.
 *
 * Implements the standard IGNIS DetectorEngine interface.
 */
export class TrainedMLDetector implements DetectorEngine {
  readonly id = 'trained_ml_fusion_detector';
  readonly name = 'Trained Multi-Sensor ML Fusion Detector';
  readonly version = '1.0.0';
  readonly tag: ParameterSourceTag;

  readonly model: M2ModelExport;
  private readonly zThresholds: [number, number, number];
  private readonly decisionThreshold: number;
  private readonly conformalQHat: number;

  constructor(model: M2ModelExport) {
    this.model = validateM2Model(model);
    this.tag = this.model.source_tag;
    this.zThresholds = this.model.preprocessing.z_thresholds;
    this.decisionThreshold = this.model.operating_point.decision_threshold;
    this.conformalQHat = this.model.abstention.conformal_q_hat_90;
  }

  /**
   * Processes a sensor time-series window and produces a categorical detector output.
   * Resamples 2 Hz telemetry to native 0.1 Hz cadence (60s trailing window).
   * Missing channels, NaNs, or insufficient window duration cause strict abstention (INSUFFICIENT_EVIDENCE).
   */
  evaluate(window: SensorReadingWindow): DetectorOutput {
    if (!window.readings || window.readings.length === 0) {
      return {
        detectorId: window.detectorId,
        state: 'INSUFFICIENT_EVIDENCE',
        timestamp_s: 0,
        triggeredChannels: [],
        confidenceNotes: ['No telemetry readings available in window.'],
        provenanceTag: this.tag,
      };
    }

    const latest = window.readings[window.readings.length - 1];

    // Resample 2 Hz telemetry to native model cadence (0.1 Hz = 10s bins, 6 bins = 60s)
    const resampled = resampleReadingsToCadence(window.readings, 10, 6);
    if (!resampled) {
      return {
        detectorId: window.detectorId,
        state: 'INSUFFICIENT_EVIDENCE',
        timestamp_s: latest.timestamp_s,
        triggeredChannels: [],
        confidenceNotes: [
          `Insufficient temporal telemetry duration or missing channel data (requires 60s window across smoke, CO, and temperature). Received ${window.readings.length} readings.`,
        ],
        provenanceTag: this.tag,
      };
    }

    // Compute baseline stats from earliest available readings in window
    const rawSmoke = window.readings.map((r) => r.obscuration_pct_m);
    const rawCO = window.readings.map((r) => r.co_ppm);
    const rawTemp = window.readings.map((r) => r.temperature_c);

    const kBaselineSamples = Math.max(1, Math.round(10 * (window.sampleRate_hz > 0 ? window.sampleRate_hz : 2.0)));
    const baseSmoke = computeBaselineStats(rawSmoke, kBaselineSamples);
    const baseCO = computeBaselineStats(rawCO, kBaselineSamples);
    const baseTemp = computeBaselineStats(rawTemp, kBaselineSamples);

    const smokeWindow: ChannelWindow = {
      values: resampled.smoke,
      baseline: baseSmoke.baseline,
      scale: baseSmoke.scale,
    };
    const coWindow: ChannelWindow = {
      values: resampled.co,
      baseline: baseCO.baseline,
      scale: baseCO.scale,
    };
    const tempWindow: ChannelWindow = {
      values: resampled.temp,
      baseline: baseTemp.baseline,
      scale: baseTemp.scale,
    };

    return this.evaluateChannels(
      smokeWindow,
      coWindow,
      tempWindow,
      window.detectorId,
      latest.timestamp_s
    );
  }

  /**
   * Direct channel-level inference on 6-sample trailing windows.
   */
  evaluateChannels(
    smoke: ChannelWindow,
    co: ChannelWindow,
    temp: ChannelWindow,
    detectorId: string = 'det_direct',
    timestamp_s: number = 0
  ): DetectorOutput {
    // 1. Feature extraction
    const rawFeatures = extractUnitFreeFeatures(smoke, co, temp, this.zThresholds);

    // 2. Feature standardization
    const scaledFeatures = standardizeFeatures(
      rawFeatures,
      this.model.preprocessing.scaler_mean,
      this.model.preprocessing.scaler_scale
    );

    // 3. Logistic evaluation
    const { prob } = evaluateLogisticLinear(
      scaledFeatures,
      this.model.params.coef,
      this.model.params.intercept
    );

    // 4. Split-conformal prediction set
    const conformalSet = predictConformalSet(prob, this.conformalQHat);
    const isAbstained = conformalSet.length !== 1;

    // 5. Triggered channel identification
    const triggered: DetectorChannel[] = [];
    if (rawFeatures[0] >= this.zThresholds[0]) triggered.push('smoke_obscuration');
    if (rawFeatures[1] >= this.zThresholds[1]) triggered.push('carbon_monoxide');
    if (rawFeatures[2] >= this.zThresholds[2]) triggered.push('temperature_rate');

    // 6. Evidence strings: find top feature contributors (w_i * z_i)
    const contributions = this.model.feature_names.map((name, i) => ({
      name,
      val: this.model.params.coef[i] * scaledFeatures[i],
    }));
    contributions.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
    const topEvidence = contributions
      .slice(0, 3)
      .map((c) => `${c.name} (${c.val >= 0 ? '+' : ''}${c.val.toFixed(2)})`)
      .join(', ');

    // 7. Categorical state determination
    let state: DetectorState = 'NOMINAL';
    const notes: string[] = [];

    if (isAbstained) {
      state = 'INSUFFICIENT_EVIDENCE';
      notes.push(
        `Conformal prediction set C(x) = {${conformalSet.join(', ')}} contains statistical ambiguity at 90% target coverage. Model abstains.`
      );
    } else if (conformalSet.includes(1) && prob >= this.decisionThreshold) {
      state = 'FIRE_ALARM';
      notes.push(
        `Multi-sensor fusion confirms combustion signature exceeding zero-false-alarm operating threshold. Key drivers: ${topEvidence}.`
      );
    } else if (rawFeatures[0] >= this.zThresholds[0] && rawFeatures[1] < this.zThresholds[1]) {
      state = 'ADVISORY';
      notes.push(
        `Smoke obscuration elevated without corresponding carbon monoxide rise. Characteristic of transient dust or non-combustion aerosol.`
      );
    } else if (triggered.length > 0 || prob >= 0.5) {
      state = 'ADVISORY';
      notes.push(
        `Elevated reading on ${triggered.length > 0 ? triggered.join(', ') : 'fusion probability'} below alarm confirmation threshold.`
      );
    } else {
      state = 'NOMINAL';
      notes.push('All normalized sensor channels within nominal baseline envelope.');
    }

    return {
      detectorId,
      state,
      timestamp_s,
      triggeredChannels: triggered,
      confidenceNotes: notes,
      provenanceTag: this.tag,
    };
  }
}

/**
 * Factory function to create a TrainedMLDetector instance from an exported model JSON.
 */
export function createTrainedMLDetector(model: M2ModelExport): DetectorEngine {
  return new TrainedMLDetector(model);
}

