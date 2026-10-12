import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveFlameParams, resolveDestination } from './flameParams.ts';
import type { ScenarioInput } from '../types/api.ts';

test('deriveFlameParams - microgravity nominal scenario', () => {
  const scenario: ScenarioInput = {
    gravity_environment: 'microgravity',
    oxygen_pct: 21.0,
    airflow_cm_s: 5.0,
    pressure_kpa: 101.3,
    material: 'pmma',
  };

  const params = deriveFlameParams(scenario);

  assert.equal(params.gravityG, 0);
  assert.equal(params.buoyancy, 0);
  assert.equal(params.elongation, 1.0);
  assert.equal(params.radius, 35.0);
  assert.equal(params.tiltDeg, 6.0); // 5.0 * 1.2
  assert.equal(params.regimeLabel, 'Spherical Diffusion (0g)');
  assert.equal(params.shapeDescription, 'spherical');
  assert.equal(params.coreDescription, 'amber core');
});

test('deriveFlameParams - gravity regimes elongation', () => {
  const testRegime = (gravity_environment: ScenarioInput['gravity_environment'], expectedG: number, expectedElongation: number) => {
    const params = deriveFlameParams({ gravity_environment });
    assert.equal(params.gravityG, expectedG);
    assert.equal(params.elongation, expectedElongation);
  };

  testRegime('microgravity', 0, 1.0);
  testRegime('partial_gravity_lunar', 0.16, 1.25);
  testRegime('partial_gravity_mars', 0.38, 1.45);
  testRegime('earth_gravity', 1.0, 1.8);
});

test('deriveFlameParams - oxygen extremes color and radius clamping', () => {
  // High O2
  const highO2 = deriveFlameParams({ oxygen_pct: 35.0 });
  assert.equal(highO2.coreDescription, 'bright yellow-white core');
  assert.equal(highO2.radius, 56.0); // 35 + (35-21)*1.5 = 56 <= 65

  // Ultra-high O2 clamped to 65
  const extremeO2 = deriveFlameParams({ oxygen_pct: 50.0 });
  assert.equal(extremeO2.radius, 65.0); // clamped to max 65

  // Low O2
  const lowO2 = deriveFlameParams({ oxygen_pct: 15.0 });
  assert.equal(lowO2.coreDescription, 'blue core');
  assert.equal(lowO2.radius, Math.max(30, 35 + (15 - 21) * 1.5)); // 30 clamped
});

test('deriveFlameParams - airflow tilt cap', () => {
  // Moderate airflow
  const moderate = deriveFlameParams({ airflow_cm_s: 10.0 });
  assert.equal(moderate.tiltDeg, 12.0); // 10 * 1.2 = 12

  // High airflow capped at 25
  const highFlow = deriveFlameParams({ airflow_cm_s: 50.0 });
  assert.equal(highFlow.tiltDeg, 25.0); // capped at 25
});

test('deriveFlameParams - continuous gravity_g support', () => {
  const zeroG = deriveFlameParams({ gravity_g: 0.0 });
  assert.equal(zeroG.gravityG, 0.0);
  assert.equal(zeroG.elongation, 1.0);

  const halfG = deriveFlameParams({ gravity_g: 0.5 });
  assert.equal(halfG.gravityG, 0.5);
  assert.ok(halfG.elongation > 1.0 && halfG.elongation < 1.8);

  const oneG = deriveFlameParams({ gravity_g: 1.0 });
  assert.equal(oneG.gravityG, 1.0);
  assert.equal(oneG.elongation, 1.8);
});

test('resolveDestination - maps preset slugs and gravity regimes accurately', () => {
  assert.equal(resolveDestination('orbital'), 'orbital');
  assert.equal(resolveDestination('moon'), 'moon');
  assert.equal(resolveDestination('mars'), 'mars');
  assert.equal(resolveDestination('deep_space'), 'orbital');
  assert.equal(resolveDestination(null, 'partial_gravity_lunar'), 'moon');
  assert.equal(resolveDestination(null, 'partial_gravity_mars'), 'mars');
  assert.equal(resolveDestination(null, 'microgravity'), 'orbital');
});
