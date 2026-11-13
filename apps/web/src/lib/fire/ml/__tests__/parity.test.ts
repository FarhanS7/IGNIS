import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  extractUnitFreeFeatures,
  resampleReadingsToCadence,
} from '../features.ts';
import {
  evaluateLogisticLinear,
  standardizeFeatures,
} from '../logistic.ts';
import { predictConformalSet } from '../abstain.ts';
import { evaluateFLEXExtinction } from '../extinctionModel.ts';
import { interpolateResponseCurve } from '../responseCurve.ts';
import { validateM1Model, validateM2Model, validateM4Model } from '../loadModel.ts';
import type { M1ModelExport, M2ModelExport, M4ModelExport } from '../modelTypes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../../..');

const m2GoldenPath = path.join(repoRoot, 'data/models/golden/m2-fusion-v1.golden.json');
const m4GoldenPath = path.join(repoRoot, 'data/models/golden/m4-extinction-v1.golden.json');
const m1GoldenPath = path.join(repoRoot, 'data/models/golden/m1-response-curve-v1.golden.json');

const m2ModelPath = path.join(repoRoot, 'apps/web/src/data/models/m2-fusion-v1.json');
const m4ModelPath = path.join(repoRoot, 'apps/web/src/data/models/m4-extinction-v1.json');
const m1ModelPath = path.join(repoRoot, 'apps/web/src/data/models/m1-response-curve-v1.json');

describe('ML Model Parity Tests: Python vs TypeScript Browser Inference', () => {
  it('achieves exact mathematical parity (<= 1e-6 error) on M2 Multi-Sensor Fusion Detector across >= 100 cases', () => {
    assert.ok(fs.existsSync(m2GoldenPath), `Missing M2 golden file: ${m2GoldenPath}`);
    assert.ok(fs.existsSync(m2ModelPath), `Missing M2 model file: ${m2ModelPath}`);

    const goldenData = JSON.parse(fs.readFileSync(m2GoldenPath, 'utf8'));
    const modelData: M2ModelExport = validateM2Model(JSON.parse(fs.readFileSync(m2ModelPath, 'utf8')));

    assert.ok(goldenData.cases.length >= 100, `Expected >= 100 cases, found ${goldenData.cases.length}`);

    let maxFeatureError = 0;
    let maxScoreError = 0;

    for (const c of goldenData.cases) {
      const { smoke, co, temp } = c.input;

      // 1. Feature extraction parity
      const features = extractUnitFreeFeatures(smoke, co, temp, modelData.preprocessing.z_thresholds);
      assert.equal(features.length, 10, `Case ${c.case_id}: expected 10 features`);

      for (let i = 0; i < 10; i++) {
        const err = Math.abs(features[i] - c.expected.features[i]);
        if (err > maxFeatureError) maxFeatureError = err;
        assert.ok(
          err <= 1e-6,
          `Case ${c.case_id} feature [${i}] mismatch: TS=${features[i]}, Py=${c.expected.features[i]}, err=${err}`
        );
      }

      // 2. Standardization parity
      const scaled = standardizeFeatures(
        features,
        modelData.preprocessing.scaler_mean,
        modelData.preprocessing.scaler_scale
      );
      for (let i = 0; i < 10; i++) {
        const err = Math.abs(scaled[i] - c.expected.scaled_features[i]);
        if (err > maxFeatureError) maxFeatureError = err;
        assert.ok(
          err <= 1e-6,
          `Case ${c.case_id} scaled feature [${i}] mismatch: TS=${scaled[i]}, Py=${c.expected.scaled_features[i]}, err=${err}`
        );
      }

      // 3. Score (logit & probability) parity
      const { logit, prob } = evaluateLogisticLinear(
        scaled,
        modelData.params.coef,
        modelData.params.intercept
      );
      const logitErr = Math.abs(logit - c.expected.logit);
      const probErr = Math.abs(prob - c.expected.probability);
      if (logitErr > maxScoreError) maxScoreError = logitErr;
      if (probErr > maxScoreError) maxScoreError = probErr;

      assert.ok(
        logitErr <= 1e-6,
        `Case ${c.case_id} logit mismatch: TS=${logit}, Py=${c.expected.logit}, err=${logitErr}`
      );
      assert.ok(
        probErr <= 1e-6,
        `Case ${c.case_id} prob mismatch: TS=${prob}, Py=${c.expected.probability}, err=${probErr}`
      );

      // 4. Conformal prediction set parity
      const pset = predictConformalSet(prob, modelData.abstention.conformal_q_hat_90).sort();
      assert.deepEqual(
        pset,
        c.expected.conformal_set,
        `Case ${c.case_id} conformal set mismatch: TS=[${pset}], Py=[${c.expected.conformal_set}]`
      );

      // 5. Resampling check if raw_window provided
      if (c.raw_window) {
        const resampled = resampleReadingsToCadence(c.raw_window.readings, 10, 6);
        assert.ok(resampled !== null, `Case ${c.case_id}: resampled readings returned null`);
        for (let b = 0; b < 6; b++) {
          assert.ok(Math.abs(resampled.smoke[b] - smoke.values[b]) <= 1e-4);
          assert.ok(Math.abs(resampled.co[b] - co.values[b]) <= 1e-4);
          assert.ok(Math.abs(resampled.temp[b] - temp.values[b]) <= 1e-4);
        }
      }
    }

    console.log(`[PARITY SUCCESS] M2: evaluated ${goldenData.cases.length} cases. Max feature error: ${maxFeatureError.toExponential(4)}, Max score error: ${maxScoreError.toExponential(4)}`);
    assert.ok(maxFeatureError <= 1e-6, `M2 max feature error exceeded 1e-6: ${maxFeatureError}`);
    assert.ok(maxScoreError <= 1e-6, `M2 max score error exceeded 1e-6: ${maxScoreError}`);
  });

  it('achieves exact mathematical parity (<= 1e-6 error) on M4 NASA FLEX Droplet Extinction Model across >= 100 cases', () => {
    assert.ok(fs.existsSync(m4GoldenPath), `Missing M4 golden file: ${m4GoldenPath}`);
    assert.ok(fs.existsSync(m4ModelPath), `Missing M4 model file: ${m4ModelPath}`);

    const goldenData = JSON.parse(fs.readFileSync(m4GoldenPath, 'utf8'));
    const modelData: M4ModelExport = validateM4Model(JSON.parse(fs.readFileSync(m4ModelPath, 'utf8')));

    assert.ok(goldenData.cases.length >= 100, `Expected >= 100 cases, found ${goldenData.cases.length}`);

    let maxScoreError = 0;

    for (const c of goldenData.cases) {
      const res = evaluateFLEXExtinction(modelData, c.input);

      for (let i = 0; i < 7; i++) {
        const err = Math.abs(res.scaledFeatures[i] - c.expected.scaled_features[i]);
        assert.ok(
          err <= 1e-6,
          `M4 Case ${c.case_id} scaled feature [${i}] mismatch: TS=${res.scaledFeatures[i]}, Py=${c.expected.scaled_features[i]}, err=${err}`
        );
      }

      const logitErr = Math.abs(res.logit - c.expected.logit);
      const probErr = Math.abs(res.probability - c.expected.probability);
      if (logitErr > maxScoreError) maxScoreError = logitErr;
      if (probErr > maxScoreError) maxScoreError = probErr;

      assert.ok(
        logitErr <= 1e-6,
        `M4 Case ${c.case_id} logit mismatch: TS=${res.logit}, Py=${c.expected.logit}, err=${logitErr}`
      );
      assert.ok(
        probErr <= 1e-6,
        `M4 Case ${c.case_id} prob mismatch: TS=${res.probability}, Py=${c.expected.probability}, err=${probErr}`
      );

      assert.deepEqual(
        res.conformalSet.sort(),
        c.expected.conformal_set,
        `M4 Case ${c.case_id} conformal set mismatch: TS=[${res.conformalSet}], Py=[${c.expected.conformal_set}]`
      );

      assert.equal(
        res.category,
        c.expected.category,
        `M4 Case ${c.case_id} category mismatch: TS=${res.category}, Py=${c.expected.category}`
      );
    }

    console.log(`[PARITY SUCCESS] M4: evaluated ${goldenData.cases.length} cases. Max score error: ${maxScoreError.toExponential(4)}`);
    assert.ok(maxScoreError <= 1e-6, `M4 max score error exceeded 1e-6: ${maxScoreError}`);
  });

  it('achieves exact mathematical parity (<= 1e-6 error) on M1 SAME Microgravity Response Curve across >= 100 cases', () => {
    assert.ok(fs.existsSync(m1GoldenPath), `Missing M1 golden file: ${m1GoldenPath}`);
    assert.ok(fs.existsSync(m1ModelPath), `Missing M1 model file: ${m1ModelPath}`);

    const goldenData = JSON.parse(fs.readFileSync(m1GoldenPath, 'utf8'));
    const modelData: M1ModelExport = validateM1Model(JSON.parse(fs.readFileSync(m1ModelPath, 'utf8')));

    assert.ok(goldenData.cases.length >= 100, `Expected >= 100 cases, found ${goldenData.cases.length}`);

    let maxMultiplierError = 0;

    for (const c of goldenData.cases) {
      const res = interpolateResponseCurve(modelData, c.input.diameter_um, c.input.material);

      const polyErr = Math.abs(res.baseMultiplierPoly - c.expected.base_multiplier_poly);
      const isoErr = Math.abs(res.baseMultiplierIsotonic - c.expected.base_multiplier_isotonic);
      const ridgeErr = Math.abs(res.baseMultiplierRidge - c.expected.base_multiplier_ridge);
      const effErr = Math.abs(res.effectiveMultiplierRidge - c.expected.effective_multiplier_ridge);

      const err = Math.max(polyErr, isoErr, ridgeErr, effErr);
      if (err > maxMultiplierError) maxMultiplierError = err;

      assert.ok(
        err <= 1e-6,
        `M1 Case ${c.case_id} multiplier mismatch: TS=${res.effectiveMultiplierRidge}, Py=${c.expected.effective_multiplier_ridge}, err=${err}`
      );
      assert.ok(
        Math.abs(res.materialMultiplier - c.expected.material_multiplier) <= 1e-6,
        `M1 Case ${c.case_id} material multiplier mismatch: TS=${res.materialMultiplier}, Py=${c.expected.material_multiplier}`
      );
    }

    console.log(`[PARITY SUCCESS] M1: evaluated ${goldenData.cases.length} cases. Max multiplier error: ${maxMultiplierError.toExponential(4)}`);
    assert.ok(maxMultiplierError <= 1e-6, `M1 max multiplier error exceeded 1e-6: ${maxMultiplierError}`);
  });
});
