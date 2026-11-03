import type {
  DetectorChannel,
  DetectorEngine,
  DetectorOutput,
  DetectorState,
  ParameterSourceTag,
  SensorReadingWindow,
} from './types.ts';
import { SIM_PARAMS, computePersistenceSamples } from './sim_params.ts';

/**
 * Single-Channel Baseline Photoelectric Smoke Detector.
 *
 * Implements standard spacecraft photoelectric smoke detection logic:
 * Fires an alarm whenever obscuration exceeds a fixed threshold without
 * multi-channel cross-validation.
 *
 * Note: Subject to false alarms during non-fire dust / aerosol events,
 * and delayed response for small sub-micron particles (e.g. Kapton/Teflon).
 */
export class BaselineSmokeDetector implements DetectorEngine {
  readonly id = 'baseline_smoke_detector';
  readonly name = 'Baseline Single-Channel Smoke Detector';
  readonly version = '1.0.0';
  readonly tag: ParameterSourceTag = SIM_PARAMS.baseline_smoke_alarm_threshold.tag;

  private readonly alarmThreshold = SIM_PARAMS.baseline_smoke_alarm_threshold.value;
  private readonly advisoryThreshold = SIM_PARAMS.fusion_smoke_advisory_threshold.value;

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
    const obs = latest.obscuration_pct_m;
    const triggered: DetectorChannel[] = [];
    let state: DetectorState = 'NOMINAL';
    const notes: string[] = [];

    if (obs >= this.alarmThreshold) {
      state = 'FIRE_ALARM';
      triggered.push('smoke_obscuration');
      notes.push(
        `Smoke obscuration (${obs.toFixed(2)} %/m) exceeds alarm threshold (${this.alarmThreshold.toFixed(2)} %/m).`
      );
    } else if (obs >= this.advisoryThreshold) {
      state = 'ADVISORY';
      triggered.push('smoke_obscuration');
      notes.push(
        `Smoke obscuration (${obs.toFixed(2)} %/m) elevated above advisory threshold (${this.advisoryThreshold.toFixed(2)} %/m).`
      );
    } else {
      state = 'NOMINAL';
      notes.push(`Obscuration (${obs.toFixed(2)} %/m) is nominal.`);
    }

    return {
      detectorId: window.detectorId,
      state,
      timestamp_s: latest.timestamp_s,
      triggeredChannels: triggered,
      confidenceNotes: notes,
      provenanceTag: this.tag,
    };
  }
}

/**
 * Multi-Channel Heuristic Fusion Detector.
 *
 * Fuses smoke obscuration (%/m), carbon monoxide (ppm), and thermal rate-of-rise (°C/min)
 * across a time persistence window to reject transient nuisance aerosol events (e.g. dust,
 * vacuum cleaner exhaust, hygiene aerosol) while rapidly confirming real combustion.
 */
export class HeuristicFusionDetector implements DetectorEngine {
  readonly id = 'heuristic_fusion_detector';
  readonly name = 'Multi-Channel Heuristic Fusion Detector';
  readonly version = '1.0.0';
  readonly tag: ParameterSourceTag = 'illustrative';

  private readonly obsAdvisory = SIM_PARAMS.fusion_smoke_advisory_threshold.value;
  private readonly coAdvisory = SIM_PARAMS.fusion_co_advisory_threshold.value;
  private readonly coAlarm = SIM_PARAMS.fusion_co_alarm_threshold.value;
  private readonly tempRateAlarm = SIM_PARAMS.fusion_temp_rate_alarm.value;
  private readonly persistenceDuration_s = SIM_PARAMS.fusion_persistence_s.value;

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
    const sampleRate = window.sampleRate_hz > 0 ? window.sampleRate_hz : SIM_PARAMS.sample_rate_hz.value;
    const requiredSamples = computePersistenceSamples(this.persistenceDuration_s, sampleRate);

    // Look back over the persistence window (up to requiredSamples)
    const windowSlice = window.readings.slice(-requiredSamples);
    const triggered: DetectorChannel[] = [];
    const notes: string[] = [];

    // Check instantaneous channels on latest reading
    const latestObsElevated = latest.obscuration_pct_m >= this.obsAdvisory;
    const latestCOElevated = latest.co_ppm >= this.coAdvisory;
    const latestCOHigh = latest.co_ppm >= this.coAlarm;
    const latestTempRapid = latest.tempRate_c_per_min >= this.tempRateAlarm;

    if (latestObsElevated) triggered.push('smoke_obscuration');
    if (latestCOElevated || latestCOHigh) triggered.push('carbon_monoxide');
    if (latestTempRapid) triggered.push('temperature_rate');

    // Persistence checks across window
    const persistentBothSmokeAndCO =
      windowSlice.length >= requiredSamples &&
      windowSlice.every((r) => r.obscuration_pct_m >= this.obsAdvisory && r.co_ppm >= this.coAdvisory);

    const persistentCOHigh =
      windowSlice.length >= requiredSamples &&
      windowSlice.every((r) => r.co_ppm >= this.coAlarm);

    const persistentThermalSpikeWithSmokeOrCO =
      windowSlice.length >= requiredSamples &&
      windowSlice.every(
        (r) =>
          r.tempRate_c_per_min >= this.tempRateAlarm &&
          (r.obscuration_pct_m >= this.obsAdvisory || r.co_ppm >= this.coAdvisory)
      );

    let state: DetectorState = 'NOMINAL';

    if (persistentBothSmokeAndCO || persistentCOHigh || persistentThermalSpikeWithSmokeOrCO) {
      state = 'FIRE_ALARM';
      if (persistentBothSmokeAndCO) {
        notes.push(
          `Coincident smoke obscuration (${latest.obscuration_pct_m.toFixed(2)} %/m) and CO (${latest.co_ppm.toFixed(1)} ppm) sustained over ${this.persistenceDuration_s}s window.`
        );
      }
      if (persistentCOHigh) {
        notes.push(
          `High carbon monoxide (${latest.co_ppm.toFixed(1)} ppm >= ${this.coAlarm} ppm) sustained over window.`
        );
      }
      if (persistentThermalSpikeWithSmokeOrCO) {
        notes.push(
          `Rapid temperature rise (${latest.tempRate_c_per_min.toFixed(1)} °C/min) with combustion products sustained.`
        );
      }
    } else if (latestObsElevated && !latestCOElevated && !latestCOHigh) {
      // Dust nuisance discrimination: obscuration elevated without corresponding CO rise
      state = 'ADVISORY';
      notes.push(
        `Smoke obscuration elevated (${latest.obscuration_pct_m.toFixed(2)} %/m), but CO is nominal (${latest.co_ppm.toFixed(1)} ppm < ${this.coAdvisory} ppm). Indicative of potential nuisance aerosol/dust.`
      );
    } else if (latestObsElevated || latestCOElevated || latestTempRapid) {
      state = 'ADVISORY';
      notes.push(
        `Elevated reading on ${triggered.join(', ')} pending persistence confirmation (${windowSlice.length}/${requiredSamples} samples).`
      );
    } else {
      state = 'NOMINAL';
      notes.push('All channels nominal.');
    }

    return {
      detectorId: window.detectorId,
      state,
      timestamp_s: latest.timestamp_s,
      triggeredChannels: triggered,
      confidenceNotes: notes,
      provenanceTag: this.tag,
    };
  }
}

/**
 * Factory functions
 */
export function createBaselineDetector(): DetectorEngine {
  return new BaselineSmokeDetector();
}

export function createFusionDetector(): DetectorEngine {
  return new HeuristicFusionDetector();
}

/**
 * Runs a detector engine across all time steps of a simulation, attaching
 * DetectorOutput for every detector in the habitat at every time step.
 */
export function attachDetectorOutputs(
  detector: DetectorEngine,
  steps: {
    timestamp_s: number;
    zoneEmissions: Record<string, { smoke_mass_g: number; co_mass_g: number; heat_kW: number }>;
    detectorReadings: Record<string, import('./types.ts').SensorReading>;
    detectorOutputs: Record<string, DetectorOutput>;
  }[],
  habitat: import('./types.ts').HabitatGraph,
  sampleRate_hz: number = SIM_PARAMS.sample_rate_hz.value
): void {
  // Map detectorId to zoneId
  const detToZone: Record<string, string> = {};
  for (const z of habitat.zones) {
    for (const dId of z.detectorIds) {
      detToZone[dId] = z.id;
    }
  }

  // Accumulate reading windows over time
  const readingHistories: Record<string, import('./types.ts').SensorReading[]> = {};

  for (const step of steps) {
    for (const [detId, reading] of Object.entries(step.detectorReadings)) {
      if (!readingHistories[detId]) {
        readingHistories[detId] = [];
      }
      readingHistories[detId].push(reading);

      // Keep up to 30s history in window
      const maxWindowSize = Math.max(10, Math.round(30.0 * sampleRate_hz));
      if (readingHistories[detId].length > maxWindowSize) {
        readingHistories[detId].shift();
      }

      const window: SensorReadingWindow = {
        detectorId: detId,
        zoneId: detToZone[detId] || 'unknown',
        readings: readingHistories[detId],
        sampleRate_hz,
      };

      step.detectorOutputs[detId] = detector.evaluate(window);
    }
  }
}
