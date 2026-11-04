import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BaselineSmokeDetector,
  HeuristicFusionDetector,
  attachDetectorOutputs,
} from '../detectors.ts';
import { ZoneLocalizer, localizeSmokeSource } from '../localizer.ts';
import { FireSimulator } from '../sim.ts';
import { getHabitatById } from '../habitat.ts';
import type { SensorReadingWindow, SimStepResult } from '../types.ts';

test('BaselineSmokeDetector Behavior', async (t) => {
  const detector = new BaselineSmokeDetector();

  await t.test('returns INSUFFICIENT_EVIDENCE on empty window', () => {
    const emptyWindow: SensorReadingWindow = {
      detectorId: 'det_1',
      zoneId: 'zone_1',
      readings: [],
      sampleRate_hz: 2.0,
    };
    const out = detector.evaluate(emptyWindow);
    assert.equal(out.state, 'INSUFFICIENT_EVIDENCE');
  });

  await t.test('transitions NOMINAL -> ADVISORY -> FIRE_ALARM based on single-channel threshold', () => {
    const makeWindow = (obs: number): SensorReadingWindow => ({
      detectorId: 'det_1',
      zoneId: 'zone_1',
      readings: [
        {
          timestamp_s: 1.0,
          obscuration_pct_m: obs,
          co_ppm: 0.0,
          temperature_c: 21.5,
          tempRate_c_per_min: 0.0,
        },
      ],
      sampleRate_hz: 2.0,
    });

    const nom = detector.evaluate(makeWindow(0.5));
    assert.equal(nom.state, 'NOMINAL');
    assert.equal(nom.triggeredChannels.length, 0);

    const adv = detector.evaluate(makeWindow(1.5));
    assert.equal(adv.state, 'ADVISORY');
    assert.deepEqual(adv.triggeredChannels, ['smoke_obscuration']);

    const alarm = detector.evaluate(makeWindow(2.6));
    assert.equal(alarm.state, 'FIRE_ALARM');
    assert.deepEqual(alarm.triggeredChannels, ['smoke_obscuration']);
  });

  await t.test('triggers nuisance alarm on dust when obscuration crosses 2.5 %/m without CO', () => {
    const dustWindow: SensorReadingWindow = {
      detectorId: 'det_dust',
      zoneId: 'zone_1',
      readings: [
        {
          timestamp_s: 5.0,
          obscuration_pct_m: 2.8,
          co_ppm: 0.0, // Zero CO
          temperature_c: 21.5,
          tempRate_c_per_min: 0.0,
        },
      ],
      sampleRate_hz: 2.0,
    };
    const out = detector.evaluate(dustWindow);
    // Baseline single-channel detector cannot distinguish dust from smoke
    assert.equal(out.state, 'FIRE_ALARM');
  });
});

test('HeuristicFusionDetector Behavior', async (t) => {
  const detector = new HeuristicFusionDetector();

  await t.test('returns INSUFFICIENT_EVIDENCE on empty window', () => {
    const emptyWindow: SensorReadingWindow = {
      detectorId: 'det_1',
      zoneId: 'zone_1',
      readings: [],
      sampleRate_hz: 2.0,
    };
    const out = detector.evaluate(emptyWindow);
    assert.equal(out.state, 'INSUFFICIENT_EVIDENCE');
  });

  await t.test('rejects dust nuisance alarm: does NOT alarm when obscuration is elevated but CO is 0', () => {
    // 20 consecutive readings with high obscuration (2.8 %/m) but 0 ppm CO
    const readings = Array.from({ length: 20 }, (_, i) => ({
      timestamp_s: i * 0.5,
      obscuration_pct_m: 2.8,
      co_ppm: 0.2, // Near-zero CO
      temperature_c: 21.5,
      tempRate_c_per_min: 0.0,
    }));

    const dustWindow: SensorReadingWindow = {
      detectorId: 'det_dust',
      zoneId: 'zone_1',
      readings,
      sampleRate_hz: 2.0,
    };

    const out = detector.evaluate(dustWindow);
    // Multi-sensor fusion recognizes absence of CO and stays in ADVISORY, rejecting false FIRE_ALARM
    assert.notEqual(out.state, 'FIRE_ALARM');
    assert.equal(out.state, 'ADVISORY');
    assert.ok(out.confidenceNotes.some((n) => n.toLowerCase().includes('nuisance')));
  });

  await t.test('confirms FIRE_ALARM when smoke and CO persist for full 6s window (12 samples at 2Hz)', () => {
    // 11 samples: elevated smoke + CO, but persistence not yet satisfied (need 12 at 2Hz)
    const partialReadings = Array.from({ length: 11 }, (_, i) => ({
      timestamp_s: i * 0.5,
      obscuration_pct_m: 1.8,
      co_ppm: 20.0,
      temperature_c: 22.0,
      tempRate_c_per_min: 0.5,
    }));

    const partialWindow: SensorReadingWindow = {
      detectorId: 'det_combustion',
      zoneId: 'zone_1',
      readings: partialReadings,
      sampleRate_hz: 2.0,
    };

    const outPartial = detector.evaluate(partialWindow);
    assert.equal(outPartial.state, 'ADVISORY'); // Not yet alarm because 11 < 12 samples

    // Now 12 samples sustained
    const fullReadings = [...partialReadings, {
      timestamp_s: 6.0,
      obscuration_pct_m: 2.0,
      co_ppm: 22.0,
      temperature_c: 22.5,
      tempRate_c_per_min: 0.5,
    }];

    const fullWindow: SensorReadingWindow = {
      ...partialWindow,
      readings: fullReadings,
    };

    const outFull = detector.evaluate(fullWindow);
    assert.equal(outFull.state, 'FIRE_ALARM');
    assert.ok(outFull.triggeredChannels.includes('smoke_obscuration'));
    assert.ok(outFull.triggeredChannels.includes('carbon_monoxide'));
  });

  await t.test('confirms FIRE_ALARM on sustained high CO alone (>= 35 ppm)', () => {
    const highCOReadings = Array.from({ length: 12 }, (_, i) => ({
      timestamp_s: i * 0.5,
      obscuration_pct_m: 0.4, // Smoke is low
      co_ppm: 40.0, // High CO
      temperature_c: 21.5,
      tempRate_c_per_min: 0.0,
    }));

    const window: SensorReadingWindow = {
      detectorId: 'det_co',
      zoneId: 'zone_1',
      readings: highCOReadings,
      sampleRate_hz: 2.0,
    };

    const out = detector.evaluate(window);
    assert.equal(out.state, 'FIRE_ALARM');
    assert.ok(out.triggeredChannels.includes('carbon_monoxide'));
  });
});

test('ZoneLocalizer and localizeSmokeSource', async (t) => {
  const issHabitat = getHabitatById('iss_like_module')!;
  const lunarHabitat = getHabitatById('lunar_habitat')!;
  const localizer = new ZoneLocalizer();

  await t.test('abstains with INSUFFICIENT_EVIDENCE on partial-gravity habitat and displays unvalidated disclaimer', () => {
    const dummySteps: SimStepResult[] = [
      {
        timestamp_s: 10.0,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_lunar_1: {
            detectorId: 'det_lunar_1',
            state: 'FIRE_ALARM',
            timestamp_s: 10.0,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
    ];

    const result = localizer.localize(lunarHabitat, dummySteps);
    assert.equal(result.status, 'INSUFFICIENT_EVIDENCE');
    assert.equal(result.isPartialGravityUnvalidated, true);
    assert.ok(result.disclaimer?.includes('Partial-gravity smoke transport is not validated'));
  });

  await t.test('returns INSUFFICIENT_EVIDENCE when 0 detectors alarm', () => {
    const steps: SimStepResult[] = [
      {
        timestamp_s: 10.0,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_1: {
            detectorId: 'det_1',
            state: 'NOMINAL',
            timestamp_s: 10.0,
            triggeredChannels: [],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
    ];

    const result = localizer.localize(issHabitat, steps);
    assert.equal(result.status, 'INSUFFICIENT_EVIDENCE');
    assert.equal(result.rankedZones.length, 0);
  });

  await t.test('returns INSUFFICIENT_EVIDENCE when only 1 zone alarms', () => {
    const steps: SimStepResult[] = [
      {
        timestamp_s: 12.0,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_1: {
            detectorId: 'det_1',
            state: 'FIRE_ALARM',
            timestamp_s: 12.0,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
    ];

    const result = localizer.localize(issHabitat, steps);
    assert.equal(result.status, 'INSUFFICIENT_EVIDENCE');
    assert.equal(result.rankedZones.length, 1);
    assert.ok(result.disclaimer?.includes('Only one zone alarmed'));
  });

  await t.test('classifies CLEAR when onset delta >= 6.0s and ranks zones correctly', () => {
    const steps: SimStepResult[] = [
      {
        timestamp_s: 5.0,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_1: {
            detectorId: 'det_1',
            state: 'FIRE_ALARM',
            timestamp_s: 5.0,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
      {
        timestamp_s: 12.5,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_2: {
            detectorId: 'det_2',
            state: 'FIRE_ALARM',
            timestamp_s: 12.5,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
    ];

    const result = localizer.localize(issHabitat, steps);
    assert.equal(result.status, 'CLEAR');
    assert.equal(result.rankedZones.length, 2);
    assert.equal(result.rankedZones[0].zoneId, 'zone_1');
    assert.equal(result.rankedZones[1].zoneId, 'zone_2');
    assert.equal(result.rankedZones[0].onsetDelay_s, 0.0);
    assert.equal(result.rankedZones[1].onsetDelay_s, 7.5);
    assert.equal(result.rankedZones[0].category, 'CLEAR');
  });

  await t.test('classifies CLOSE when 2.0s <= onset delta < 6.0s', () => {
    const steps: SimStepResult[] = [
      {
        timestamp_s: 10.0,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_1: {
            detectorId: 'det_1',
            state: 'FIRE_ALARM',
            timestamp_s: 10.0,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
      {
        timestamp_s: 13.5, // delta = 3.5s
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_2: {
            detectorId: 'det_2',
            state: 'FIRE_ALARM',
            timestamp_s: 13.5,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
    ];

    const result = localizer.localize(issHabitat, steps);
    assert.equal(result.status, 'CLOSE');
    assert.equal(result.rankedZones[0].category, 'CLOSE');
  });

  await t.test('classifies AMBIGUOUS when onset delta < 2.0s', () => {
    const steps: SimStepResult[] = [
      {
        timestamp_s: 10.0,
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_1: {
            detectorId: 'det_1',
            state: 'FIRE_ALARM',
            timestamp_s: 10.0,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
      {
        timestamp_s: 11.2, // delta = 1.2s (< 2.0s)
        zoneEmissions: {},
        detectorReadings: {},
        detectorOutputs: {
          det_2: {
            detectorId: 'det_2',
            state: 'FIRE_ALARM',
            timestamp_s: 11.2,
            triggeredChannels: ['smoke_obscuration'],
            confidenceNotes: [],
            provenanceTag: 'illustrative',
          },
        },
      },
    ];

    const result = localizer.localize(issHabitat, steps);
    assert.equal(result.status, 'AMBIGUOUS');
    assert.equal(result.rankedZones[0].category, 'AMBIGUOUS');
  });

  await t.test('end-to-end: running FireSimulator with attachDetectorOutputs localizes origin to source zone', () => {
    const habitat = getHabitatById('iss_like_module')!;
    const sim = new FireSimulator(
      {
        id: 'scen_test',
        habitatId: 'iss_like_module',
        sourceZoneId: 'zone_1',
        fuel: 'cellulose',
        growthRate: 0.05,
        peakHRR_kW: 8.0,
        nuisanceType: 'none',
        seed: 42,
      },
      habitat
    );

    const steps = sim.run(100.0);
    const baselineDetector = new BaselineSmokeDetector();
    attachDetectorOutputs(baselineDetector, steps, habitat);

    const result = localizeSmokeSource(habitat, steps);
    assert.ok(result.status === 'CLEAR' || result.status === 'CLOSE');
    assert.equal(result.rankedZones[0].zoneId, 'zone_1');
  });
});
