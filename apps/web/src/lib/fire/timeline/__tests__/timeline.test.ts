import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../buildTimeline.ts';

describe('Timeline Precomputation and Invariants', () => {
  it('building the same timeline twice gives bit-identical output', () => {
    const config = {
      habitatId: 'iss_like_module',
      fuel: 'cellulose' as const,
      sourceZoneId: 'zone_1',
      seed: 42,
      duration_s: 100.0,
    };

    const tl1 = buildTimeline(config);
    const tl2 = buildTimeline(config);

    // Serialization comparison of simulation steps
    const serialized1 = JSON.stringify({
      steps: tl1.steps,
      zoneSeries: tl1.zoneSeries,
      clocks: tl1.clocks,
      gap_s: tl1.gap_s,
      localization: tl1.localization,
      sequencerEvents: tl1.sequencerEvents,
    });

    const serialized2 = JSON.stringify({
      steps: tl2.steps,
      zoneSeries: tl2.zoneSeries,
      clocks: tl2.clocks,
      gap_s: tl2.gap_s,
      localization: tl2.localization,
      sequencerEvents: tl2.sequencerEvents,
    });

    assert.equal(serialized1, serialized2, 'Two timeline runs with identical configs must be bit-identical');
  });

  it('clock freeze times equal the timeline alarm timestamps', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      seed: 42,
      duration_s: 100.0,
    });

    // Check at t = 0 (before alarms): clocks are not frozen
    const stateAt0 = tl.getStateAt(0.0);
    assert.equal(stateAt0.clocks.std.isFrozen, false);
    assert.equal(stateAt0.clocks.cal.isFrozen, false);

    // If an alarm timestamp exists, the clock must freeze exactly at/after that timestamp
    if (tl.clocks.std.alarmTime_s !== null) {
      const alarmT = tl.clocks.std.alarmTime_s;
      const stateBefore = tl.getStateAt(Math.max(0, alarmT - 0.1));
      const stateAt = tl.getStateAt(alarmT);
      const stateAfter = tl.getStateAt(alarmT + 10.0);

      assert.equal(stateBefore.clocks.std.isFrozen, false, 'Standard clock should not freeze before alarm time');
      assert.equal(stateAt.clocks.std.isFrozen, true, 'Standard clock must freeze at alarm time');
      assert.equal(stateAt.clocks.std.time_s, alarmT, 'Frozen time must equal alarm timestamp');
      assert.equal(stateAfter.clocks.std.isFrozen, true, 'Standard clock remains frozen after alarm time');
      assert.equal(stateAfter.clocks.std.time_s, alarmT, 'Frozen time must remain fixed at alarm timestamp');
    }

    if (tl.clocks.cal.alarmTime_s !== null) {
      const alarmT = tl.clocks.cal.alarmTime_s;
      const stateBefore = tl.getStateAt(Math.max(0, alarmT - 0.1));
      const stateAt = tl.getStateAt(alarmT);
      const stateAfter = tl.getStateAt(alarmT + 10.0);

      assert.equal(stateBefore.clocks.cal.isFrozen, false, 'Calibrated clock should not freeze before alarm time');
      assert.equal(stateAt.clocks.cal.isFrozen, true, 'Calibrated clock must freeze at alarm time');
      assert.equal(stateAt.clocks.cal.time_s, alarmT, 'Frozen time must equal alarm timestamp');
      assert.equal(stateAfter.clocks.cal.isFrozen, true, 'Calibrated clock remains frozen after alarm time');
      assert.equal(stateAfter.clocks.cal.time_s, alarmT, 'Frozen time must remain fixed at alarm timestamp');
    }
  });

  it('gap equals the absolute difference of alarm timestamps', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      seed: 42,
    });

    if (tl.clocks.std.alarmTime_s !== null && tl.clocks.cal.alarmTime_s !== null) {
      const expectedGap = Math.round(Math.abs(tl.clocks.std.alarmTime_s - tl.clocks.cal.alarmTime_s) * 10) / 10;
      assert.equal(tl.gap_s, expectedGap, 'Timeline gap_s must equal |stdAlarm - calAlarm|');
    }
  });

  it('seeking to the same t twice produces identical frame state', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      seed: 42,
    });

    const testTimes = [0, 5.5, 13.0, 15.0, 25.4, 50.0, 100.0];
    for (const t of testTimes) {
      const stateA = tl.getStateAt(t);
      const stateB = tl.getStateAt(t);
      assert.deepEqual(stateA, stateB, `State at t = ${t} must be completely deterministic and identical`);
    }
  });

  it('evaluates Teflon wire smoke sub-micron particle penalty correctly', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'teflon',
      sourceZoneId: 'zone_1',
      seed: 42,
    });

    // Standard optical baseline should not alarm within 100s due to small-particle penalty
    assert.equal(tl.clocks.std.alarmTime_s, null, 'Single-channel baseline should not alarm in teflon scenario');

    // SAME-R calibrated fusion detects CO and alarms
    assert.notEqual(tl.clocks.cal.alarmTime_s, null, 'Calibrated fusion must alarm via CO in teflon scenario');
    assert.equal(tl.gapText, 'Standard detector still waiting');
  });

  it('enforces max 6 words per caption across the entire run', () => {
    const tl = buildTimeline();
    for (const caption of tl.captions) {
      const words = caption.text.trim().split(/\s+/);
      assert.ok(
        words.length <= 6,
        `Caption "${caption.text}" exceeds 6 words (${words.length} words)`
      );
    }
  });
});

