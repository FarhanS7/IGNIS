import type { SensorReading } from '../types.ts';
import type { ChannelWindow } from './modelTypes.ts';

/**
 * Computes the statistical median of a numeric array.
 * If length is even, returns the mean of the two middle elements (matching np.median).
 */
export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2.0;
}

/**
 * Computes baseline median and scale epsilon from the initial k samples.
 * Exactly mirrors Python compute_baseline_stats from scripts/ml/m2_fusion/features.py.
 */
export function computeBaselineStats(
  series: number[],
  k: number = 10
): { baseline: number; scale: number } {
  const kEff = Math.min(k, series.length);
  if (kEff <= 0) {
    return { baseline: 0.0, scale: 1.0 };
  }

  const initSamples = series.slice(0, kEff);
  const b = median(initSamples);
  const deviations = initSamples.map((v) => Math.abs(v - b));
  const mad = median(deviations);
  const eps = Math.max(1e-6, mad);
  const scale = Math.max(Math.abs(b), eps);

  return { baseline: b, scale };
}

/**
 * Extracts 10 unit-free, dimensionless features across 3 channels (smoke, CO, temp).
 *
 * Implements mathematical specification from docs/models/feature_spec.md:
 * - L_c: Background-normalized level
 * - S_c: Dimensionless least-squares window slope
 * - M_c: Window maximum normalized level
 * - A: Cross-channel anomaly agreement fraction
 */
export function extractUnitFreeFeatures(
  smoke: ChannelWindow,
  co: ChannelWindow,
  temp: ChannelWindow,
  zThresholds: [number, number, number] = [0.5, 0.5, 0.2]
): number[] {
  const channels = [smoke, co, temp];
  const W = smoke.values.length;
  if (W < 2) {
    throw new Error(`Window length must be at least 2 samples, got ${W}`);
  }

  const uBar = 0.5;
  let denom = 0;
  for (let i = 0; i < W; i++) {
    const u = i / (W - 1);
    denom += (u - uBar) * (u - uBar);
  }

  const L: number[] = [];
  const S: number[] = [];
  const M: number[] = [];
  let agreementCount = 0;

  for (let cIdx = 0; cIdx < 3; cIdx++) {
    const ch = channels[cIdx];
    const effectiveScale =
      ch.scale !== undefined && ch.scale > 0
        ? ch.scale
        : Math.max(Math.abs(ch.baseline), 1e-6);

    const norm = ch.values.map((v) => (v - ch.baseline) / effectiveScale);
    const current = norm[norm.length - 1];
    L.push(current);

    // Least-squares window slope
    const yBar = norm.reduce((acc, v) => acc + v, 0) / W;
    let num = 0;
    for (let i = 0; i < W; i++) {
      const u = i / (W - 1);
      num += (u - uBar) * (norm[i] - yBar);
    }
    S.push(denom > 0 ? num / denom : 0.0);

    // Window maximum
    M.push(Math.max(...norm));

    // Agreement threshold check
    if (current >= zThresholds[cIdx]) {
      agreementCount++;
    }
  }

  const agreementFraction = agreementCount / 3.0;
  return [...L, ...S, ...M, agreementFraction];
}

/**
 * Resamples a high-cadence reading window (e.g. 2 Hz) down to native model cadence (0.1 Hz)
 * using temporal bin-averaging over the trailing duration (default: 60s = 6 bins of 10s).
 *
 * Returns null if the reading window has insufficient duration, missing channels, or NaNs.
 */
export function resampleReadingsToCadence(
  readings: SensorReading[],
  targetCadence_s: number = 10,
  requiredBins: number = 6
): {
  smoke: number[];
  co: number[];
  temp: number[];
  latestTimestamp_s: number;
} | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  const latest = readings[readings.length - 1];
  const earliest = readings[0];
  const totalDuration_s = latest.timestamp_s - earliest.timestamp_s;
  const minRequiredDuration_s = targetCadence_s * (requiredBins - 1);

  // Must have at least requiredBins readings and sufficient time span
  if (readings.length < requiredBins || totalDuration_s < minRequiredDuration_s) {
    return null;
  }

  for (const r of readings) {
    if (
      typeof r.obscuration_pct_m !== 'number' ||
      Number.isNaN(r.obscuration_pct_m) ||
      typeof r.co_ppm !== 'number' ||
      Number.isNaN(r.co_ppm) ||
      typeof r.temperature_c !== 'number' ||
      Number.isNaN(r.temperature_c)
    ) {
      return null;
    }
  }

  const smoke: number[] = new Array(requiredBins);
  const co: number[] = new Array(requiredBins);
  const temp: number[] = new Array(requiredBins);

  const n = readings.length;
  for (let b = 0; b < requiredBins; b++) {
    const startIdx = Math.floor((b * n) / requiredBins);
    const endIdx = Math.floor(((b + 1) * n) / requiredBins);
    const slice = readings.slice(startIdx, endIdx);
    if (slice.length === 0) return null;

    smoke[b] = slice.reduce((acc, r) => acc + r.obscuration_pct_m, 0) / slice.length;
    co[b] = slice.reduce((acc, r) => acc + r.co_ppm, 0) / slice.length;
    temp[b] = slice.reduce((acc, r) => acc + r.temperature_c, 0) / slice.length;
  }

  return {
    smoke,
    co,
    temp,
    latestTimestamp_s: latest.timestamp_s,
  };
}
