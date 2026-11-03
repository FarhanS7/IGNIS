import test from 'node:test';
import assert from 'node:assert/strict';
import { ResponseSequencer, DEFAULT_SEQUENCER_POLICY } from '../responseSequencer.ts';
import { bindActionEvidence, bindAllResponseEvidence } from '../evidenceBinder.ts';
import { getHabitatById } from '../habitat.ts';

test('ResponseSequencer - Crewed Mode Progression & Safety Guards', async (t) => {
  const habitat = getHabitatById('iss_like_module')!;
  const sequencer = new ResponseSequencer(habitat, 'CREWED');

  await t.test('initializes with all steps PENDING and CREWED mode recommendations', () => {
    const state = sequencer.getState();
    assert.equal(state.mode, 'CREWED');
    assert.equal(state.currentStep, 'ALARM');
    assert.equal(state.steps.ALARM.status, 'PENDING');
    assert.equal(state.suppressionAgentRecommendation, 'WATER_MIST');
    assert.ok(state.crewSafetyAlerts.some((a) => a.includes('NTRS-20130011664')));
    assert.ok(state.crewSafetyAlerts.some((a) => a.toLowerCase().includes('water mist')));
  });

  await t.test('auto-progresses ALARM -> REMOVE_POWER -> ISOLATE_VENTILATION -> INHIBIT_MAKEUP, and pauses at SUPPRESSION: ARMED', () => {
    sequencer.triggerAlarm('zone_1', 10.0);
    const state = sequencer.getState();

    assert.equal(state.steps.ALARM.status, 'COMPLETED');
    assert.equal(state.steps.REMOVE_POWER.status, 'COMPLETED');
    assert.equal(state.steps.ISOLATE_VENTILATION.status, 'COMPLETED');
    assert.equal(state.steps.INHIBIT_MAKEUP.status, 'COMPLETED');

    // In crewed mode, suppression must NOT auto-discharge! It must pause in ARMED waiting for human action
    assert.equal(state.currentStep, 'SUPPRESSION');
    assert.equal(state.steps.SUPPRESSION.status, 'ARMED');

    // Confirm policy note is logged
    const powerEvent = state.eventLog.find((e) => e.stepId === 'REMOVE_POWER');
    assert.ok(powerEvent?.details.includes('sources disagree; verify in NASA-STD-3001 brief'));
  });

  await t.test('requires explicit crew confirmation to discharge suppression and transition to recovery', () => {
    // Attempting time update does NOT discharge in crewed mode even after 100 seconds
    sequencer.update(120.0);
    assert.equal(sequencer.getState().steps.SUPPRESSION.status, 'ARMED');

    // Explicit crew confirmation
    sequencer.confirmSuppression(125.0, 'CREW');
    const state = sequencer.getState();
    assert.equal(state.steps.SUPPRESSION.status, 'COMPLETED');
    assert.equal(state.steps.SUPPRESSION.actor, 'CREW');
    assert.equal(state.currentStep, 'POST_FIRE_RECOVERY');
    assert.equal(state.steps.POST_FIRE_RECOVERY.status, 'PENDING');
  });

  await t.test('supports manual override of any step and logs audit event', () => {
    const seq = new ResponseSequencer(habitat, 'CREWED');
    seq.triggerAlarm('zone_1', 5.0);
    seq.overrideStep('ISOLATE_VENTILATION', 8.0, 'Damper linkage stuck; manual mechanical lock engaged', 'CREW');

    const state = seq.getState();
    assert.equal(state.steps.ISOLATE_VENTILATION.status, 'OVERRIDDEN');
    const overrideEvent = state.eventLog.find((e) => e.action === 'STEP_OVERRIDDEN');
    assert.ok(overrideEvent);
    assert.equal(overrideEvent?.overrideActive, true);
    assert.ok(overrideEvent?.details.includes('manual mechanical lock engaged'));
  });
});

test('ResponseSequencer - Uncrewed Mode Autonomous Progression', async (t) => {
  const uncrewedHabitat = getHabitatById('uncrewed_habitat')!;
  const sequencer = new ResponseSequencer(uncrewedHabitat, 'UNCREWED');

  await t.test('initializes with INERT_GAS_FLOOD recommendation', () => {
    const state = sequencer.getState();
    assert.equal(state.mode, 'UNCREWED');
    assert.equal(state.suppressionAgentRecommendation, 'INERT_GAS_FLOOD');
  });

  await t.test('discharges suppression autonomously after isolation timeout expires', () => {
    sequencer.triggerAlarm('zone_core', 10.0);
    // At t = 10.5, isolation is completed. Timeout is 45s, so should discharge around t = 55.5s
    assert.equal(sequencer.getState().steps.SUPPRESSION.status, 'ARMED');

    // Advance 20 seconds (t = 30.5) - should still be ARMED
    sequencer.update(30.5);
    assert.equal(sequencer.getState().steps.SUPPRESSION.status, 'ARMED');

    // Advance past 45s timeout (t = 57.0) - should discharge automatically!
    sequencer.update(57.0);
    const state = sequencer.getState();
    assert.equal(state.steps.SUPPRESSION.status, 'COMPLETED');
    assert.equal(state.steps.SUPPRESSION.actor, 'SYSTEM');
    assert.equal(state.currentStep, 'POST_FIRE_RECOVERY');

    const dischargeEvent = state.eventLog.find((e) => e.action === 'AUTONOMOUS_SUPPRESSION_DISCHARGED');
    assert.ok(dischargeEvent);
    assert.ok(dischargeEvent?.details.includes('INERT_GAS_FLOOD'));
  });
});

test('EvidenceBinder - Flight Data Links & Epistemic Honesty', async (t) => {
  const habitat = getHabitatById('iss_like_module')!;
  const lunarHabitat = getHabitatById('lunar_habitat')!;

  await t.test('binds real BASS-II flight runs for ISOLATE_VENTILATION step with circularity caveat', () => {
    const chip = bindActionEvidence('ISOLATE_VENTILATION', 'cellulose', habitat, {
      material: 'Cotton',
      oxygen_pct: 21.0,
      flow_cm_s: 0.0,
    });

    assert.equal(chip.stepId, 'ISOLATE_VENTILATION');
    assert.ok(chip.matchedFlightRuns.length > 0, 'Should match real microgravity flight runs');
    assert.ok(
      chip.circularityCaveat.includes('circularity caveat'),
      'Must include validation circularity caveat'
    );
    assert.ok(chip.nasaReferences.some((r) => r.includes('BASS-II')));
  });

  await t.test('flags fractional-gravity environment as outside tested flight envelope', () => {
    const chip = bindActionEvidence('ISOLATE_VENTILATION', 'cellulose', lunarHabitat);
    assert.equal(chip.isWithinFlightEnvelope, false);
    assert.ok(chip.warnings.some((w) => w.toLowerCase().includes('fractional gravity') || w.toLowerCase().includes('outside tested')));
  });

  await t.test('flags high oxygen concentration (> 22.2%) as outside flight envelope', () => {
    const chip = bindActionEvidence('ISOLATE_VENTILATION', 'cellulose', habitat, {
      material: 'Cotton',
      oxygen_pct: 30.0,
      flow_cm_s: 0.0,
    });

    assert.equal(chip.isWithinFlightEnvelope, false);
    assert.ok(chip.warnings.some((w) => w.includes('above nominal')));
  });

  await t.test('bindAllResponseEvidence returns complete set of chips for all 6 steps', () => {
    const allChips = bindAllResponseEvidence('cellulose', habitat);
    assert.ok(allChips.ALARM);
    assert.ok(allChips.REMOVE_POWER);
    assert.ok(allChips.ISOLATE_VENTILATION);
    assert.ok(allChips.INHIBIT_MAKEUP);
    assert.ok(allChips.SUPPRESSION);
    assert.ok(allChips.POST_FIRE_RECOVERY);
  });
});
