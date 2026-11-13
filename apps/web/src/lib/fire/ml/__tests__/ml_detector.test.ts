import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TrainedMLDetector,
  createTrainedMLDetector,
} from '../trainedDetector.ts';
import {
  validateM1Model,
  validateM2Model,
  validateM4Model,
} from '../loadModel.ts';
import type { M2ModelExport } from '../modelTypes.ts';
import type { SensorReadingWindow } from '../../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../../..');
const m2ModelPath = path.join(repoRoot, 'apps/web/src/data/models/m2-fusion-v1.json');

describe('Trained ML Detector Engine & Loader Tests', () => {
  const validM2: M2ModelExport = JSON.parse(fs.readFileSync(m2ModelPath, 'utf8'));

  it('rejects corrupted model JSON with informative descriptive errors', () => {
    assert.throws(
      () => validateM2Model(null),
      /Invalid M2 model: payload must be a non-null object/
    );
    assert.throws(
      () => validateM2Model({ model_id: 'wrong-id' }),
      /expected "m2-fusion-v1"/
    );
    assert.throws(
      () => validateM2Model({ ...validM2, feature_names: ['only_one'] }),
      /expected array of 10 feature names/
    );
    assert.throws(
      () => validateM2Model({ ...validM2, preprocessing: { ...validM2.preprocessing, scaler_mean: [1, 2] } }),
      /scaler_mean must be an array of length 10/
    );
    assert.throws(
      () => validateM2Model({ ...validM2, params: { ...validM2.params, coef: [1, 2] } }),
      /coef must be an array of length 10/
    );
    assert.throws(
      () => validateM2Model({ ...validM2, params: { ...validM2.params, intercept: NaN } }),
      /intercept must be a valid number/
    );
    assert.throws(
      () => validateM2Model({ ...validM2, abstention: { ...validM2.abstention, conformal_q_hat_90: NaN } }),
      /conformal_q_hat_90 must be a valid number/
    );
  });

  it('rejects corrupted M4 and M1 models', () => {
    assert.throws(
      () => validateM4Model({ model_id: 'bad-m4' }),
      /expected "m4-extinction-v1"/
    );
    assert.throws(
      () => validateM1Model({ model_id: 'bad-m1' }),
      /expected "m1-response-curve-v1"/
    );
  });

  it('returns INSUFFICIENT_EVIDENCE on empty or short reading windows', () => {
    const detector = createTrainedMLDetector(validM2);

    const emptyWin: SensorReadingWindow = {
      detectorId: 'det_1',
      zoneId: 'zone_1',
      sampleRate_hz: 2.0,
      readings: [],
    };
    const resEmpty = detector.evaluate(emptyWin);
    assert.equal(resEmpty.state, 'INSUFFICIENT_EVIDENCE');
    assert.equal(resEmpty.provenanceTag, 'trained:m2-fusion-v1');

    // Only 10 readings at 2 Hz = 5s (requires 60s)
    const shortWin: SensorReadingWindow = {
      detectorId: 'det_2',
      zoneId: 'zone_1',
      sampleRate_hz: 2.0,
      readings: Array.from({ length: 10 }, (_, i) => ({
        timestamp_s: i * 0.5,
        obscuration_pct_m: 0.1,
        co_ppm: 0.5,
        temperature_c: 21.0,
        tempRate_c_per_min: 0.0,
      })),
    };
    const resShort = detector.evaluate(shortWin);
    assert.equal(resShort.state, 'INSUFFICIENT_EVIDENCE');
    assert.ok(resShort.confidenceNotes[0].includes('Insufficient temporal telemetry duration'));
  });

  it('returns INSUFFICIENT_EVIDENCE if channel data contains NaNs', () => {
    const detector = createTrainedMLDetector(validM2);

    const nanWin: SensorReadingWindow = {
      detectorId: 'det_nan',
      zoneId: 'zone_1',
      sampleRate_hz: 2.0,
      readings: Array.from({ length: 120 }, (_, i) => ({
        timestamp_s: i * 0.5,
        obscuration_pct_m: i === 50 ? NaN : 0.05,
        co_ppm: 0.1,
        temperature_c: 21.0,
        tempRate_c_per_min: 0.0,
      })),
    };
    const resNaN = detector.evaluate(nanWin);
    assert.equal(resNaN.state, 'INSUFFICIENT_EVIDENCE');
  });

  it('is completely deterministic across repeated evaluations and never calls Math.random', () => {
    const detector = new TrainedMLDetector(validM2);

    const testWin: SensorReadingWindow = {
      detectorId: 'det_det',
      zoneId: 'zone_alpha',
      sampleRate_hz: 2.0,
      readings: Array.from({ length: 120 }, (_, i) => ({
        timestamp_s: i * 0.5,
        obscuration_pct_m: 0.02 + 0.001 * i,
        co_ppm: 0.05 + 0.002 * i,
        temperature_c: 21.0 + 0.01 * i,
        tempRate_c_per_min: 0.6,
      })),
    };

    let randomCalled = false;
    const origRandom = Math.random;
    Math.random = () => {
      randomCalled = true;
      return origRandom();
    };

    try {
      const firstOut = detector.evaluate(testWin);
      for (let run = 0; run < 50; run++) {
        const nextOut = detector.evaluate(testWin);
        assert.deepEqual(nextOut, firstOut);
      }
      assert.equal(randomCalled, false, 'Inference must never invoke Math.random');
    } finally {
      Math.random = origRandom;
    }
  });

  it('correctly discriminates nominal, ambiguous abstention, and fire alarm on direct channel evaluation', () => {
    const detector = new TrainedMLDetector(validM2);

    // 1. Nominal baseline
    const nomOut = detector.evaluateChannels(
      { values: [0.01, 0.01, 0.01, 0.01, 0.01, 0.01], baseline: 0.01 },
      { values: [0.02, 0.02, 0.02, 0.02, 0.02, 0.02], baseline: 0.02 },
      { values: [21.0, 21.0, 21.0, 21.0, 21.0, 21.0], baseline: 21.0 }
    );
    assert.equal(nomOut.state, 'NOMINAL');
    assert.equal(nomOut.triggeredChannels.length, 0);

    // 2. Ambiguous single-channel anomaly (dust-like spike): triggers conformal abstention
    const dustOut = detector.evaluateChannels(
      { values: [0.01, 0.02, 0.8, 1.2, 1.5, 1.4], baseline: 0.01 },
      { values: [0.01, 0.01, 0.01, 0.01, 0.02, 0.01], baseline: 0.01 },
      { values: [21.0, 21.0, 21.1, 21.0, 21.0, 21.1], baseline: 21.0 }
    );
    assert.equal(dustOut.state, 'INSUFFICIENT_EVIDENCE');
    assert.ok(dustOut.confidenceNotes[0].includes('Conformal prediction set'));

    // 3. Real fire: both smoke and CO elevate strongly to exceed alarm threshold
    const fireOut = detector.evaluateChannels(
      { values: [1.0, 5.0, 15.0, 30.0, 50.0, 80.0], baseline: 0.05 },
      { values: [2.0, 10.0, 25.0, 50.0, 80.0, 120.0], baseline: 0.1 },
      { values: [21.0, 22.0, 25.0, 32.0, 45.0, 60.0], baseline: 21.0 }
    );
    assert.equal(fireOut.state, 'FIRE_ALARM');
    assert.ok(fireOut.triggeredChannels.includes('smoke_obscuration'));
    assert.ok(fireOut.triggeredChannels.includes('carbon_monoxide'));
  });
});
