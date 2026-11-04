import test from 'node:test';
import assert from 'node:assert/strict';
import { FireSimulator } from '../sim.ts';
import { getHabitatById } from '../habitat.ts';
import {
  BaselineSmokeDetector,
  HeuristicFusionDetector,
  attachDetectorOutputs,
  createTrainedDetector,
} from '../detectors.ts';
import { runMonteCarloValidationSweep } from '../validate.ts';

test('Determinism & Reproducibility Verification', async (t) => {
  const habitat = getHabitatById('iss_like_module')!;
  const seed = 12345;

  await t.test('BaselineSmokeDetector produces bit-exact identical outputs across runs with same seed', () => {
    // Run 1
    const sim1 = new FireSimulator(
      {
        id: 'scen_det_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_1',
        fuel: 'cellulose',
        growthRate: 0.05,
        peakHRR_kW: 8.0,
        nuisanceType: 'none',
        seed,
      },
      habitat
    );
    const steps1 = sim1.run(60.0);
    const detector1 = new BaselineSmokeDetector();
    attachDetectorOutputs(detector1, steps1, habitat);

    // Run 2
    const sim2 = new FireSimulator(
      {
        id: 'scen_det_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_1',
        fuel: 'cellulose',
        growthRate: 0.05,
        peakHRR_kW: 8.0,
        nuisanceType: 'none',
        seed,
      },
      habitat
    );
    const steps2 = sim2.run(60.0);
    const detector2 = new BaselineSmokeDetector();
    attachDetectorOutputs(detector2, steps2, habitat);

    assert.equal(steps1.length, steps2.length, 'Step counts must match');
    for (let i = 0; i < steps1.length; i++) {
      assert.deepEqual(
        steps1[i].detectorOutputs,
        steps2[i].detectorOutputs,
        `Detector outputs at step ${i} (t=${steps1[i].timestamp_s}s) must be identical`
      );
    }
  });

  await t.test('HeuristicFusionDetector produces bit-exact identical outputs across runs with same seed', () => {
    // Run 1
    const sim1 = new FireSimulator(
      {
        id: 'scen_det_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_2',
        fuel: 'silicone',
        growthRate: 0.08,
        peakHRR_kW: 12.0,
        nuisanceType: 'dust',
        seed,
      },
      habitat
    );
    const steps1 = sim1.run(60.0);
    const detector1 = new HeuristicFusionDetector();
    attachDetectorOutputs(detector1, steps1, habitat);

    // Run 2
    const sim2 = new FireSimulator(
      {
        id: 'scen_det_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_2',
        fuel: 'silicone',
        growthRate: 0.08,
        peakHRR_kW: 12.0,
        nuisanceType: 'dust',
        seed,
      },
      habitat
    );
    const steps2 = sim2.run(60.0);
    const detector2 = new HeuristicFusionDetector();
    attachDetectorOutputs(detector2, steps2, habitat);

    assert.equal(steps1.length, steps2.length, 'Step counts must match');
    for (let i = 0; i < steps1.length; i++) {
      assert.deepEqual(
        steps1[i].detectorOutputs,
        steps2[i].detectorOutputs,
        `Heuristic detector outputs at step ${i} (t=${steps1[i].timestamp_s}s) must be identical`
      );
    }
  });

  await t.test('createTrainedDetector (M2) produces bit-exact identical outputs across runs with same seed', () => {
    // Run 1
    const sim1 = new FireSimulator(
      {
        id: 'scen_det_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_3',
        fuel: 'teflon',
        growthRate: 0.06,
        peakHRR_kW: 10.0,
        nuisanceType: 'dust',
        seed,
      },
      habitat
    );
    const steps1 = sim1.run(60.0);
    const detector1 = createTrainedDetector();
    attachDetectorOutputs(detector1, steps1, habitat);

    // Run 2
    const sim2 = new FireSimulator(
      {
        id: 'scen_det_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_3',
        fuel: 'teflon',
        growthRate: 0.06,
        peakHRR_kW: 10.0,
        nuisanceType: 'dust',
        seed,
      },
      habitat
    );
    const steps2 = sim2.run(60.0);
    const detector2 = createTrainedDetector();
    attachDetectorOutputs(detector2, steps2, habitat);

    assert.equal(steps1.length, steps2.length, 'Step counts must match');
    for (let i = 0; i < steps1.length; i++) {
      assert.deepEqual(
        steps1[i].detectorOutputs,
        steps2[i].detectorOutputs,
        `Trained detector outputs at step ${i} (t=${steps1[i].timestamp_s}s) must be identical`
      );
    }
  });

  await t.test('Monte Carlo sweep runs identically twice with the same seed', () => {
    const sweep1 = runMonteCarloValidationSweep(50, 'iss_like_module', 777);
    const sweep2 = runMonteCarloValidationSweep(50, 'iss_like_module', 777);

    assert.deepEqual(sweep1.baseline, sweep2.baseline, 'Monte Carlo baseline metrics must be bit-exact');
    assert.deepEqual(sweep1.fusion, sweep2.fusion, 'Monte Carlo heuristic fusion metrics must be bit-exact');
    assert.deepEqual(sweep1.trained, sweep2.trained, 'Monte Carlo trained metrics must be bit-exact');
    assert.deepEqual(
      sweep1.rankingComparison,
      sweep2.rankingComparison,
      'Monte Carlo ranking comparison must be bit-exact'
    );
  });
});
