import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveNarrationCues } from '../narrationCues.ts';
import { getHabitatById } from '../../habitat.ts';
import { buildTimeline } from '../../timeline/buildTimeline.ts';

test('Synchronized Coherent Narration Segments & Epistemic Verification', async (t) => {
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
      /proven/i,
      /infallible/i,
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
});
