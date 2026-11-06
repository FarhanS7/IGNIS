import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../../../lib/fire/timeline/buildTimeline.ts';

describe('Step 4: Containment & Human Suppression Gate Invariants', () => {
  it('suppression never starts without confirmation in crewed mode (state-machine invariants)', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      mode: 'CREWED',
      crewConfirmDelay_s: 8.0,
    });

    const primaryAlarm = tl.clocks.cal.alarmTime_s ?? 15.0;
    const powerCutTime = primaryAlarm;
    const ventsIsolatedTime = primaryAlarm + 1.0;
    const suppressionArmedTime = primaryAlarm + 2.0;
    const suppressionConfirmTime = suppressionArmedTime + 8.0;

    // 1. Before suppression is armed (e.g. t = alarmTime)
    const stateAtAlarm = tl.getStateAt(primaryAlarm);
    assert.equal(stateAtAlarm.stages.ALARM, 'COMPLETED');
    assert.equal(stateAtAlarm.stages.REMOVE_POWER, 'COMPLETED');
    assert.equal(stateAtAlarm.stages.SUPPRESSION, 'PENDING');
    assert.equal(stateAtAlarm.isSuppressionArmed, false);
    assert.equal(stateAtAlarm.isSuppressionActive, false);

    // 2. While suppression is armed awaiting crew confirmation (t = armedTime + 1s)
    const stateAwaitingCrew = tl.getStateAt(suppressionArmedTime + 1.0);
    assert.equal(stateAwaitingCrew.stages.SUPPRESSION, 'ARMED');
    assert.equal(stateAwaitingCrew.isSuppressionArmed, true);
    assert.equal(stateAwaitingCrew.isSuppressionActive, false);
    assert.equal(stateAwaitingCrew.isFireExtinguished, false);

    // 3. Immediately before confirmation (t = confirmTime - 0.1s)
    const stateJustBefore = tl.getStateAt(suppressionConfirmTime - 0.1);
    assert.equal(stateJustBefore.stages.SUPPRESSION, 'ARMED');
    assert.equal(stateJustBefore.isSuppressionActive, false);

    // 4. After confirmation (t >= confirmTime)
    const stateAfterConfirm = tl.getStateAt(suppressionConfirmTime + 0.5);
    assert.notEqual(stateAfterConfirm.stages.SUPPRESSION, 'ARMED');
    assert.equal(stateAfterConfirm.isSuppressionActive, true);
  });

  it('uncrewed mode auto-progresses without requiring manual crew confirmation', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      mode: 'UNCREWED',
    });

    const primaryAlarm = tl.clocks.cal.alarmTime_s ?? 15.0;
    const armedTime = primaryAlarm + 2.0;
    const autoDischargeTime = armedTime + 5.0; // Uncrewed auto-timeout

    const stateArmed = tl.getStateAt(armedTime + 0.5);
    assert.equal(stateArmed.stages.SUPPRESSION, 'ARMED');

    const stateAutoDischarged = tl.getStateAt(autoDischargeTime + 0.5);
    assert.equal(stateAutoDischarged.isSuppressionActive, true);
  });

  it('causal ordering of containment sequencer steps is strictly preserved', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      mode: 'CREWED',
    });

    const events = tl.sequencerEvents;
    const stepOrder = [
      'ALARM',
      'REMOVE_POWER',
      'ISOLATE_VENTILATION',
      'INHIBIT_MAKEUP',
      'SUPPRESSION',
      'POST_FIRE_RECOVERY',
    ];

    let lastTime = 0;
    for (const stepId of stepOrder) {
      const ev = events.find((e) => e.stepId === stepId);
      assert.ok(ev, `Missing sequencer event for step: ${stepId}`);
      assert.ok(
        ev.triggerTime_s >= lastTime,
        `Step ${stepId} (${ev.triggerTime_s}s) triggered before prior step (${lastTime}s)`
      );
      lastTime = ev.triggerTime_s;
    }
  });

  it('seeking back and forth produces identical deterministic stage states', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      mode: 'CREWED',
    });

    const checkpoints = [5.0, 15.0, 20.0, 28.0, 45.0, 80.0];
    for (const t of checkpoints) {
      const state1 = tl.getStateAt(t);
      const state2 = tl.getStateAt(t);
      assert.deepEqual(state1.stages, state2.stages);
      assert.equal(state1.isPowerCut, state2.isPowerCut);
      assert.equal(state1.areVentsIsolated, state2.areVentsIsolated);
      assert.equal(state1.isSuppressionArmed, state2.isSuppressionArmed);
      assert.equal(state1.isSuppressionActive, state2.isSuppressionActive);
    }
  });
});

