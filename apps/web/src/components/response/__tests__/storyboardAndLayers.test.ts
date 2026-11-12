import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoryboardScene } from '../sceneStoryboard.ts';
import { computeStationCamera } from '../cameraMath.ts';

test('Storyboard Scene Progression Invariants', async (t) => {
  await t.test('Scene 1: Normal operation in initial timeline interval', () => {
    const scene = resolveStoryboardScene(1.0, null, false, false, false);
    assert.equal(scene.sceneNumber, 1);
    assert.equal(scene.sceneId, 'NORMAL');
    assert.equal(scene.category, 'OBSERVATION');
    assert.ok(scene.plainSummary.length > 10);
    assert.ok(scene.consequence.length > 10);
    assert.ok(scene.provenance.includes('BASELINE'));
  });

  await t.test('Scene 2: Incipient ignition upon initial fire growth', () => {
    const scene = resolveStoryboardScene(4.5, null, false, false, false);
    assert.equal(scene.sceneNumber, 2);
    assert.equal(scene.sceneId, 'IGNITION');
    assert.equal(scene.category, 'OBSERVATION');
    assert.ok(scene.plainSummary.includes('combustion'));
  });

  await t.test('Scene 3: Multi-sensor detection divergence before alarm', () => {
    const scene = resolveStoryboardScene(11.0, 15.0, false, false, false);
    assert.equal(scene.sceneNumber, 3);
    assert.equal(scene.sceneId, 'DETECTION');
    assert.equal(scene.category, 'DETECTOR');
  });

  await t.test('Scene 4: Alarm latched triggers containment sequence', () => {
    const scene = resolveStoryboardScene(16.0, 15.0, false, false, false);
    assert.equal(scene.sceneNumber, 4);
    assert.equal(scene.sceneId, 'ALARM');
    assert.equal(scene.category, 'ALARM');
  });

  await t.test('Scene 5: Suppression armed mandates human confirmation in crewed mode', () => {
    const scene = resolveStoryboardScene(20.0, 15.0, true, false, false);
    assert.equal(scene.sceneNumber, 5);
    assert.equal(scene.sceneId, 'ARMED');
    assert.equal(scene.category, 'SEQUENCER');
    assert.ok(scene.consequence.includes('human confirmation'));
  });

  await t.test('Scene 5: Active suppression discharge collapses flame', () => {
    const scene = resolveStoryboardScene(25.0, 15.0, false, true, false);
    assert.equal(scene.sceneNumber, 5);
    assert.equal(scene.sceneId, 'SUPPRESSION');
    assert.equal(scene.category, 'SEQUENCER');
  });

  await t.test('Scene 6: Flame extinguished and post-fire recovery verified', () => {
    const scene = resolveStoryboardScene(45.0, 15.0, false, false, true);
    assert.equal(scene.sceneNumber, 6);
    assert.equal(scene.sceneId, 'EXTINCTION');
    assert.equal(scene.category, 'OUTCOME');
    assert.ok(scene.provenance.includes('SIMULATED OUTCOME'));
  });
});

test('Camera Choreography Finite States', async (t) => {
  const sourceX = 2.5;
  const alarmT = 15.0;

  await t.test('resolves OVERVIEW state prior to alarm', () => {
    const cam = computeStationCamera(5.0, sourceX, alarmT, false);
    assert.equal(cam.stateId, 'OVERVIEW');
    assert.equal(cam.flyK, 0);
  });

  await t.test('resolves MODULE_APPROACH during alarm fly-to transition', () => {
    const cam = computeStationCamera(16.0, sourceX, alarmT, false);
    assert.equal(cam.stateId, 'MODULE_APPROACH');
    assert.ok(cam.flyK > 0 && cam.flyK < 0.8);
  });

  await t.test('resolves MODULE_CUTAWAY once fly-to is established', () => {
    const cam = computeStationCamera(18.5, sourceX, alarmT, false);
    assert.equal(cam.stateId, 'MODULE_CUTAWAY');
    assert.ok(cam.flyK >= 0.8);
  });

  await t.test('resolves RESPONSE_OVERVIEW during active suppression', () => {
    const cam = computeStationCamera(22.0, sourceX, alarmT, true);
    assert.equal(cam.stateId, 'RESPONSE_OVERVIEW');
  });

  await t.test('resolves OUTCOME_INTERIOR when fire is extinguished', () => {
    const cam = computeStationCamera(35.0, sourceX, alarmT, false, 0, 0, 0, true);
    assert.equal(cam.stateId, 'OUTCOME_INTERIOR');
  });

  await t.test('resolves DEBRIEF_OVERVIEW in late scenario interval', () => {
    const cam = computeStationCamera(80.0, sourceX, alarmT, false, 0, 0, 0, true);
    assert.equal(cam.stateId, 'DEBRIEF_OVERVIEW');
  });

  await t.test('resolves MANUAL_INSPECTION when user offsets camera', () => {
    const cam = computeStationCamera(18.5, sourceX, alarmT, false, 0.5, 0, 0);
    assert.equal(cam.stateId, 'MANUAL_INSPECTION');
  });
});

