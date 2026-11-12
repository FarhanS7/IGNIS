import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveNarrationCues } from '../narrationCues.ts';
import { getHabitatById } from '../../habitat.ts';
import { buildTimeline } from '../../timeline/buildTimeline.ts';

test('Event-Driven Educational Narration Segments & Epistemic Verification', async (t) => {
  const habitat = getHabitatById('iss_like_module')!;
  const timeline = buildTimeline({
    habitatId: 'iss_like_module',
    fuel: 'cellulose',
    sourceZoneId: 'zone_2',
    mode: 'CREWED',
    duration_s: 36.0,
    crewConfirmDelay_s: 5.0,
  });

  await t.test('derives 5 distinct coherent narrative segments in guided mode', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    assert.equal(cues.length, 5);
  });

  await t.test('spans the full 36-second guided duration contiguously without gaps', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    assert.equal(cues[0].startTime_s, 0.0);
    assert.equal(cues[cues.length - 1].endTime_s, 36.0);

    for (let i = 0; i < cues.length - 1; i++) {
      assert.equal(cues[i].endTime_s, cues[i + 1].startTime_s);
    }
  });

  await t.test('accurately refers to the source zone name from habitat metadata', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const sourceZone = habitat.zones.find((z) => z.id === 'zone_2')!;
    const expectedName = sourceZone.name.replace(/\(.*\)/, '').trim();

    const mentions = cues.filter((c) => c.spokenText.includes(expectedName));
    assert.ok(mentions.length >= 2, `Expected at least 2 cues mentioning ${expectedName}`);
  });

  await t.test('triggers critical sound effects for alarm, confirmation, and outcome', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);

    const alarmCue = cues.find((c) => c.soundEffect === 'alarm');
    const confirmCue = cues.find((c) => c.soundEffect === 'confirm');
    const resolvedCue = cues.find((c) => c.soundEffect === 'resolved');

    assert.ok(alarmCue, 'Must have an alarm sound effect cue');
    assert.ok(confirmCue, 'Must have a confirm sound effect cue');
    assert.ok(resolvedCue, 'Must have a resolved sound effect cue');

    assert.equal(alarmCue.stageId, 'ALARM');
    assert.equal(confirmCue.stageId, 'RESPONSE');
    assert.equal(resolvedCue.stageId, 'OUTCOME');
  });

  await t.test('enforces copy honesty: zero banned promotional terms in narration', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const bannedPatterns = [
      /flight-certified/i,
      /guaranteed/i,
      /100%\s*safe/i,
      /predicts\s*fire\s*risk/i,
      /\bproven\b/i,
      /\binfallible\b/i,
      /\bcertified\b/i,
      /telemetry verified/i,
      /zero hallucination/i,
      /safety score/i,
    ];

    for (const cue of cues) {
      for (const pattern of bannedPatterns) {
        assert.ok(
          !pattern.test(cue.spokenText),
          `Banned term ${pattern} found in spokenText: ${cue.spokenText}`
        );
        assert.ok(
          !pattern.test(cue.subtitleText),
          `Banned term ${pattern} found in subtitleText: ${cue.subtitleText}`
        );
      }
    }
  });

  await t.test('distinguishes epistemic categories across storyboard progression', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const categories = cues.map((c) => c.category);

    assert.ok(categories.includes('OBSERVATION'));
    assert.ok(categories.includes('DETECTOR'));
    assert.ok(categories.includes('ALARM'));
    assert.ok(categories.includes('COMMAND'));
    assert.ok(categories.includes('OUTCOME'));
  });

  await t.test('cue boundaries derive from actual timeline alarm time, not hardcoded', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const calAlarmTime = timeline.clocks.cal.alarmTime_s;

    if (calAlarmTime !== null) {
      // The alarm cue (stage 3) should start before the actual alarm time
      const alarmCue = cues.find((c) => c.stageId === 'ALARM')!;
      assert.ok(
        alarmCue.startTime_s <= calAlarmTime,
        `Alarm cue starts at ${alarmCue.startTime_s} but alarm fires at ${calAlarmTime}`
      );
      // The alarm cue should end after the actual alarm time
      assert.ok(
        alarmCue.endTime_s > calAlarmTime,
        `Alarm cue ends at ${alarmCue.endTime_s} but alarm fires at ${calAlarmTime}`
      );
    }
  });

  await t.test('educational content explains microgravity fire physics', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const incidentCue = cues.find((c) => c.stageId === 'INCIDENT')!;

    // Must explain lack of buoyancy and spherical flame shape
    assert.ok(
      /buoyancy|spherical|microgravity/i.test(incidentCue.spokenText),
      'Incident cue must explain microgravity fire physics'
    );
  });

  await t.test('educational content explains AI/ML detection advantage', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const detectionCue = cues.find((c) => c.stageId === 'DETECTION')!;

    // Must mention the threshold comparison (1.2% vs 2.5%)
    assert.ok(
      /1\.2/.test(detectionCue.spokenText) && /2\.5/.test(detectionCue.spokenText),
      'Detection cue must compare SAME-R threshold (1.2%) to standard (2.5%)'
    );
  });

  await t.test('educational content explains automated response steps', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const responseCue = cues.find((c) => c.stageId === 'RESPONSE')!;

    // Must mention the containment steps
    assert.ok(
      /power/i.test(responseCue.spokenText) &&
        /ventilation|damper/i.test(responseCue.spokenText) &&
        /oxygen|O2/i.test(responseCue.spokenText),
      'Response cue must explain containment steps (power, vents, O2)'
    );
  });

  await t.test('outcome cue includes simulated disclaimer', () => {
    const cues = deriveNarrationCues(timeline, habitat, true);
    const outcomeCue = cues.find((c) => c.stageId === 'OUTCOME')!;

    assert.ok(
      /simulated/i.test(outcomeCue.spokenText),
      'Outcome cue must include "Simulated" disclaimer'
    );
  });

  await t.test('explore mode derives 5 segments spanning 100s', () => {
    const cues = deriveNarrationCues(timeline, habitat, false);
    assert.equal(cues.length, 5);
    assert.equal(cues[0].startTime_s, 0.0);
    assert.equal(cues[cues.length - 1].endTime_s, 100.0);

    for (let i = 0; i < cues.length - 1; i++) {
      assert.equal(cues[i].endTime_s, cues[i + 1].startTime_s);
    }
  });

  await t.test('no cue references audioUrl (SpeechSynthesis is primary)', () => {
    const guidedCues = deriveNarrationCues(timeline, habitat, true);
    const exploreCues = deriveNarrationCues(timeline, habitat, false);
    const allCues = [...guidedCues, ...exploreCues];

    for (const cue of allCues) {
      assert.equal(
        cue.audioUrl,
        undefined,
        `Cue ${cue.id} should not reference audioUrl — SpeechSynthesis is primary`
      );
    }
  });
});
