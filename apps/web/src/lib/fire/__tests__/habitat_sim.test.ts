import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FireSimulator, SeededPRNG } from '../sim.ts';
import { getHabitatPresets, calculateDuctTransportTime_s } from '../habitat.ts';
import type { FireScenario } from '../types.ts';

describe('Habitat Topology & Deterministic Smoke Transport Simulator', () => {
  it('loads valid generic habitat presets with generic names', () => {
    const presets = getHabitatPresets();
    assert.strictEqual(presets.length, 3);

    const names = presets.map((p) => p.name);
    assert.ok(names.includes('ISS-like module (illustrative)'));
    assert.ok(names.includes('Uncrewed habitat (illustrative)'));
    assert.ok(names.includes('Lunar habitat (illustrative)'));

    // Check zones and edges
    for (const h of presets) {
      assert.ok(h.zones.length >= 3);
      assert.ok(h.edges.length >= 3);
      for (const z of h.zones) {
        assert.ok(z.volume_m3 > 0);
        assert.ok(z.detectorIds.length > 0);
      }
    }
  });

  it('guarantees strict determinism: identical seed produces identical results', () => {
    const scenario: FireScenario = {
      id: 'scen-1',
      habitatId: 'iss_like_module',
      sourceZoneId: 'zone_2',
      fuel: 'silicone',
      growthRate: 0.005,
      peakHRR_kW: 15.0,
      nuisanceType: 'none',
      seed: 42,
    };

    const sim1 = new FireSimulator(scenario);
    const run1 = sim1.run(60.0);

    const sim2 = new FireSimulator(scenario);
    const run2 = sim2.run(60.0);

    assert.strictEqual(run1.length, run2.length);
    for (let i = 0; i < run1.length; i++) {
      const step1 = run1[i];
      const step2 = run2[i];
      assert.strictEqual(step1.timestamp_s, step2.timestamp_s);

      for (const detId of Object.keys(step1.detectorReadings)) {
        const r1 = step1.detectorReadings[detId];
        const r2 = step2.detectorReadings[detId];
        assert.strictEqual(r1.obscuration_pct_m, r2.obscuration_pct_m);
        assert.strictEqual(r1.co_ppm, r2.co_ppm);
        assert.strictEqual(r1.temperature_c, r2.temperature_c);
      }
    }
  });

  it('exhibits transport lag: source zone detects smoke earlier than downstream zones', () => {
    const scenario: FireScenario = {
      id: 'scen-transport',
      habitatId: 'iss_like_module',
      sourceZoneId: 'zone_2',
      fuel: 'cellulose',
      growthRate: 0.008,
      peakHRR_kW: 20.0,
      nuisanceType: 'none',
      seed: 100,
    };

    const sim = new FireSimulator(scenario);
    const run = sim.run(80.0);

    // Find time when source detector (det_2) crosses 1.0 %/m
    let tSourceCross = -1;
    let tDownstreamCross = -1;

    for (const step of run) {
      const sourceObs = step.detectorReadings['det_2'].obscuration_pct_m;
      const downObs = step.detectorReadings['det_4'].obscuration_pct_m;

      if (tSourceCross === -1 && sourceObs >= 1.0) {
        tSourceCross = step.timestamp_s;
      }
      if (tDownstreamCross === -1 && downObs >= 1.0) {
        tDownstreamCross = step.timestamp_s;
      }
    }

    assert.ok(tSourceCross > 0, 'Source zone detector should detect smoke');
    assert.ok(tDownstreamCross > 0, 'Downstream detector should detect smoke');
    assert.ok(
      tDownstreamCross > tSourceCross + 5.0,
      `Downstream detection (t=${tDownstreamCross}s) must lag behind source (t=${tSourceCross}s) due to duct travel + microgravity dispersion`
    );
  });

  it('models nuisance dust events with optical obscuration spike but zero combustion CO', () => {
    const scenario: FireScenario = {
      id: 'scen-dust',
      habitatId: 'iss_like_module',
      sourceZoneId: 'zone_3',
      fuel: 'cellulose',
      growthRate: 0.0001, // Very slow growth
      peakHRR_kW: 1.0,
      nuisanceType: 'dust',
      seed: 2026,
    };

    const sim = new FireSimulator(scenario);
    const run = sim.run(40.0);

    // Dust event occurs in zone_1 (det_1) around t=8s..t=15s
    const midStep = run.find((s) => s.timestamp_s >= 10.0 && s.timestamp_s <= 12.0);
    assert.ok(midStep);

    const det1 = midStep.detectorReadings['det_1'];
    // Should have substantial optical obscuration from dust
    assert.ok(
      det1.obscuration_pct_m >= 2.0,
      `Dust event should produce high obscuration (got ${det1.obscuration_pct_m})`
    );
    // But CO should remain negligible / baseline near 0 ppm
    assert.ok(
      det1.co_ppm < 1.0,
      `Dust event must not produce significant combustion gas CO (got ${det1.co_ppm} ppm)`
    );
  });

  it('exhibits small-particle penalty for Kapton/Teflon vs Cellulose per NTRS-20130000422', () => {
    const baseScenario: FireScenario = {
      id: 'scen-cell',
      habitatId: 'iss_like_module',
      sourceZoneId: 'zone_2',
      fuel: 'cellulose',
      growthRate: 0.01,
      peakHRR_kW: 15.0,
      nuisanceType: 'none',
      seed: 777,
    };

    const simCell = new FireSimulator(baseScenario);
    const runCell = simCell.run(30.0);

    const simTeflon = new FireSimulator({ ...baseScenario, fuel: 'teflon' });
    const runTeflon = simTeflon.run(30.0);

    const cellStep = runCell.find((s) => s.timestamp_s === 25.0);
    const teflonStep = runTeflon.find((s) => s.timestamp_s === 25.0);
    assert.ok(cellStep && teflonStep);

    const cellObs = cellStep.detectorReadings['det_2'].obscuration_pct_m;
    const teflonObs = teflonStep.detectorReadings['det_2'].obscuration_pct_m;

    assert.ok(
      teflonObs < cellObs * 0.5,
      `Teflon obscuration (${teflonObs}) must be significantly lower than cellulose (${cellObs}) due to small-particle penalty`
    );
  });
});
