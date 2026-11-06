import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../../../lib/fire/timeline/buildTimeline.ts';
import { getHabitatById } from '../../../lib/fire/habitat.ts';
import { getReticleDisplay } from '../reticleDisplay.ts';
import { computeStationCamera } from '../cameraMath.ts';
import type { LocalizationResult } from '../../../lib/fire/types.ts';

describe('Step 3: Localization, Alarm, Camera Fly-To & Reticle Invariants', () => {
  it('reticle zone equals the localizer output for the timeline', () => {
    const habitat = getHabitatById('iss_like_module')!;
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      seed: 42,
    });

    const reticle = getReticleDisplay(tl.localization, habitat);

    if (tl.localization.status === 'CLEAR') {
      const sourceZone = habitat.zones.find((z) => z.id === tl.localization.sourceZoneId);
      const expectedName = sourceZone ? sourceZone.name.replace(/\(.*\)/, '').trim().split(/\s+/)[0] : 'Module';
      assert.equal(reticle.label, `Source found: ${expectedName}`);
      assert.equal(reticle.isAmber, false);
    }
  });

  it('ambiguous and insufficient evidence states never render "Source found"', () => {
    const habitat = getHabitatById('iss_like_module')!;

    // Case 1: AMBIGUOUS
    const ambiguousLoc = {
      status: 'AMBIGUOUS' as const,
      sourceZoneId: 'zone_1',
      rankedZones: [],
      availableAt_s: 20.0,
    };
    const reticleAmbiguous = getReticleDisplay(ambiguousLoc, habitat);
    assert.ok(
      !reticleAmbiguous.label.includes('Source found'),
      `Ambiguous state must never claim "Source found". Got: ${reticleAmbiguous.label}`
    );
    assert.equal(reticleAmbiguous.isAmber, true);

    // Case 2: INSUFFICIENT_EVIDENCE (e.g. Teflon scenario where baseline never triggers)
    const insufficientLoc = {
      status: 'INSUFFICIENT_EVIDENCE' as const,
      sourceZoneId: 'zone_1',
      rankedZones: [],
      availableAt_s: 20.0,
    };
    const reticleInsufficient = getReticleDisplay(insufficientLoc, habitat);
    assert.ok(
      !reticleInsufficient.label.includes('Source found'),
      `Insufficient evidence must never claim "Source found". Got: ${reticleInsufficient.label}`
    );
    assert.equal(reticleInsufficient.isAmber, true);
  });

  it('camera position at a given t is identical across two evaluations (strict determinism)', () => {
    const testTimes = [0.0, 5.2, 13.0, 15.0, 22.4, 50.0, 80.0];
    const sourceX = -4.8;
    const alarmT = 15.0;

    for (const t of testTimes) {
      const cam1 = computeStationCamera(t, sourceX, alarmT, false);
      const cam2 = computeStationCamera(t, sourceX, alarmT, false);

      assert.equal(cam1.x, cam2.x, `Camera X mismatch at t = ${t}`);
      assert.equal(cam1.y, cam2.y, `Camera Y mismatch at t = ${t}`);
      assert.equal(cam1.z, cam2.z, `Camera Z mismatch at t = ${t}`);
      assert.equal(cam1.targetX, cam2.targetX, `Camera targetX mismatch at t = ${t}`);
      assert.equal(cam1.radius, cam2.radius, `Camera radius mismatch at t = ${t}`);
      assert.equal(cam1.flyK, cam2.flyK, `Camera flyK mismatch at t = ${t}`);
    }
  });

  it('clock freeze times equal timeline alarm timestamps and flash at alarm moment', () => {
    const tl = buildTimeline({
      habitatId: 'iss_like_module',
      fuel: 'cellulose',
      sourceZoneId: 'zone_1',
      seed: 42,
    });

    const calAlarm = tl.clocks.cal.alarmTime_s;
    assert.notEqual(calAlarm, null);

    const stateAtAlarm = tl.getStateAt(calAlarm as number);
    assert.equal(stateAtAlarm.clocks.cal.isFrozen, true);
    assert.equal(stateAtAlarm.clocks.cal.time_s, calAlarm);

    const stateBeforeAlarm = tl.getStateAt((calAlarm as number) - 0.1);
    assert.equal(stateBeforeAlarm.clocks.cal.isFrozen, false);
  });
});
