import test from 'node:test';
import assert from 'node:assert/strict';
import { mapScrollProgressToGravity, validateChapterConfig, type ValidationFixtures } from './storyUtils.ts';
import { chapter1 } from './chapters/chapter1.ts';
import { safeStorage, getChapterProgress, saveChapterProgress, clearChapterProgress } from './storage.ts';
import experimentsFixture from '../../../../data/fixtures/experiments.json' with { type: 'json' };
import experimentRunsFixture from '../../../../data/fixtures/experiment_runs.json' with { type: 'json' };
import sourceDocsFixture from '../../../../data/fixtures/source_documents.json' with { type: 'json' };

// -----------------------------------------------------------------------------
// 1. Scroll-Progress to Gravity Mapping Tests (DELIVERABLE 6)
// -----------------------------------------------------------------------------
test('mapScrollProgressToGravity - endpoints 1g and 0g', () => {
  const gAtStart = mapScrollProgressToGravity(0.0);
  const gAtEnd = mapScrollProgressToGravity(1.0);

  assert.equal(gAtStart, 1.0, 'Progress 0.0 must map to Earth 1.0g');
  assert.equal(gAtEnd, 0.0, 'Progress 1.0 must map to Orbital 0.0g');
});

test('mapScrollProgressToGravity - strict bounds clamping', () => {
  assert.equal(mapScrollProgressToGravity(-0.5), 1.0, 'Negative progress clamped to 1.0g');
  assert.equal(mapScrollProgressToGravity(1.5), 0.0, 'Progress > 1 clamped to 0.0g');
  assert.equal(mapScrollProgressToGravity(NaN), 1.0, 'NaN safely defaults to 1.0g');
});

test('mapScrollProgressToGravity - monotonicity (non-increasing)', () => {
  const steps = 100;
  let previousG = 1.0;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const currentG = mapScrollProgressToGravity(progress);

    assert.ok(
      currentG <= previousG + 1e-6,
      `Monotonicity violation at progress ${progress}: ${currentG} > ${previousG}`
    );
    assert.ok(currentG >= 0.0 && currentG <= 1.0, `Gravity out of range [0, 1]: ${currentG}`);
    previousG = currentG;
  }
});

test('mapScrollProgressToGravity - intermediate planetary regimes', () => {
  const gMars = mapScrollProgressToGravity(0.35);
  const gMoon = mapScrollProgressToGravity(0.65);

  assert.ok(Math.abs(gMars - 0.38) <= 0.05, `Progress 0.35 should map close to Mars 0.38g (got ${gMars})`);
  assert.ok(Math.abs(gMoon - 0.16) <= 0.05, `Progress 0.65 should map close to Moon 0.16g (got ${gMoon})`);
});

// -----------------------------------------------------------------------------
// 2. Chapter Config Validation Tests (DELIVERABLE 6)
// -----------------------------------------------------------------------------
test('validateChapterConfig - validates Chapter 1 against NASA fixtures', () => {
  const fixtures: ValidationFixtures = {
    experiments: new Set(experimentsFixture.map((e: { id: string }) => e.id)),
    runs: new Set(experimentRunsFixture.map((r: { id: string }) => r.id)),
    sourceDocs: new Set(sourceDocsFixture.map((s: { id: string }) => s.id)),
  };

  const result = validateChapterConfig(chapter1, fixtures);
  assert.equal(result.valid, true, `Chapter 1 validation failed with errors: ${result.errors.join('; ')}`);
  assert.equal(result.errors.length, 0);

  // Verify all 7 beat types are present in Chapter 1
  const types = chapter1.beats.map((b) => b.type);
  assert.ok(types.includes('hook'));
  assert.ok(types.includes('predict'));
  assert.ok(types.includes('reveal'));
  assert.ok(types.includes('why'));
  assert.ok(types.includes('check'));
  assert.ok(types.includes('real-world'));
  assert.ok(types.includes('takeaway'));
});

test('validateChapterConfig - catches invalid avatar expression, missing mode, and invalid citation', () => {
  const invalidChapter = JSON.parse(JSON.stringify(chapter1));
  invalidChapter.beats[0].avatar.expression = 'non_existent_mood';
  invalidChapter.beats[1].modes = [];
  invalidChapter.beats[2].layer2.evidenceRefs.push({
    type: 'measured',
    experimentId: 'invalid-uuid-000000',
  });

  const fixtures: ValidationFixtures = {
    experiments: new Set(experimentsFixture.map((e: { id: string }) => e.id)),
    runs: new Set(experimentRunsFixture.map((r: { id: string }) => r.id)),
    sourceDocs: new Set(sourceDocsFixture.map((s: { id: string }) => s.id)),
  };

  const result = validateChapterConfig(invalidChapter, fixtures);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('avatar expression')));
  assert.ok(result.errors.some((e) => e.includes('at least one mode')));
  assert.ok(result.errors.some((e) => e.includes('cites non-existent experiment ID')));
});

// -----------------------------------------------------------------------------
// 3. Safe Storage Tests (DELIVERABLE 6)
// -----------------------------------------------------------------------------
test('safeStorage - stores, retrieves, and clears progress safely in memory/fallback', () => {
  safeStorage.clearMemoryStoreForTesting();
  const testSlug = 'unit-test-chapter';

  // Initially empty
  assert.equal(getChapterProgress(testSlug), null);

  // Save progress
  saveChapterProgress({
    chapterSlug: testSlug,
    currentBeatIndex: 3,
    completedBeatIds: ['beat-01', 'beat-02', 'beat-03'],
    predictedChoiceId: 'predict-sphere',
    checkAnswerId: 'check-stretch',
    mode: 'full',
    lastUpdated: Date.now(),
  });

  const retrieved = getChapterProgress(testSlug);
  assert.ok(retrieved !== null);
  assert.equal(retrieved.currentBeatIndex, 3);
  assert.equal(retrieved.predictedChoiceId, 'predict-sphere');
  assert.equal(retrieved.mode, 'full');
  assert.equal(retrieved.completedBeatIds.length, 3);

  // Clear progress
  clearChapterProgress(testSlug);
  assert.equal(getChapterProgress(testSlug), null);
});

test('safeStorage - corrupted data handling does not crash', () => {
  safeStorage.setItem('ignis_story_v2_corrupted-slug', '{"invalid_json: unclosed');
  const retrieved = getChapterProgress('corrupted-slug');
  assert.equal(retrieved, null, 'Should return null without throwing');
});
