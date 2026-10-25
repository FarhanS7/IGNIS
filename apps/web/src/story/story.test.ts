import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapScrollProgressToGravity,
  validateChapterConfig,
  velocityToTilt,
  resolveDock,
  gravityToEmberVariant,
  calculateRemainingMinutes,
  clampBeatIndex,
  snapGravityPreset,
  type ValidationFixtures,
} from './storyUtils.ts';
import { chapter1 } from './chapters/chapter1.ts';
import {
  safeStorage,
  getChapterProgress,
  saveChapterProgress,
  clearChapterProgress,
  getStorySettings,
  saveStorySettings,
  isOnboardingDismissed,
  setOnboardingDismissed,
  getLayerPreferences,
  saveLayerPreferences,
} from './storage.ts';
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

// -----------------------------------------------------------------------------
// 4. Motion and Docking Helpers Tests (DELIVERABLE 6)
// -----------------------------------------------------------------------------
test('velocityToTilt - clamped to [-8, +8], 0 at rest, monotonic', () => {
  // 0 at rest
  assert.equal(velocityToTilt(0), 0, 'Velocity 0 must result in 0 tilt');
  assert.equal(velocityToTilt(NaN), 0, 'NaN velocity must default safely to 0');

  // Clamping
  assert.equal(velocityToTilt(10000), 8, 'Large positive velocity must clamp to +8 degrees');
  assert.equal(velocityToTilt(-10000), -8, 'Large negative velocity must clamp to -8 degrees');

  // Intermediate values
  assert.equal(velocityToTilt(500), 4, 'Moderate velocity produces proportional tilt');
  assert.equal(velocityToTilt(-500), -4, 'Negative velocity produces negative tilt');

  // Monotonicity: higher velocity -> higher or equal tilt
  const sampleVelocities = [-2000, -1000, -500, -100, 0, 100, 500, 1000, 2000];
  for (let i = 0; i < sampleVelocities.length - 1; i++) {
    const t1 = velocityToTilt(sampleVelocities[i]);
    const t2 = velocityToTilt(sampleVelocities[i + 1]);
    assert.ok(t1 <= t2, `Monotonicity violated: velocityToTilt(${sampleVelocities[i]}) = ${t1} > velocityToTilt(${sampleVelocities[i + 1]}) = ${t2}`);
  }
});

test('resolveDock - valid dock position and safe defaults', () => {
  // Explicit docks on desktop
  assert.equal(resolveDock({ avatarDock: 'left' }, { width: 1200 }), 'left');
  assert.equal(resolveDock({ avatarDock: 'right' }, { width: 1200 }), 'right');
  assert.equal(resolveDock({ avatarDock: 'center' }, { width: 1200 }), 'center');
  assert.equal(resolveDock({ avatarDock: 'hidden' }, { width: 1200 }), 'hidden');

  // Safe defaults
  assert.equal(resolveDock(undefined, { width: 1200 }), 'right', 'Desktop default must be right');
  assert.equal(resolveDock({}, { width: 1200 }), 'right', 'Desktop empty beat must default to right');
  assert.equal(resolveDock(undefined, { width: 375 }), 'center', 'Mobile default must be center');
  assert.equal(resolveDock({}, { width: 375 }), 'center', 'Mobile empty beat must default to center');

  // Boolean mobile argument support
  assert.equal(resolveDock(undefined, true), 'center', 'Boolean isMobile true must default to center');
  assert.equal(resolveDock(undefined, false), 'right', 'Boolean isMobile false must default to right');

  // Invalid value safe fallback
  assert.equal(resolveDock({ avatarDock: 'invalid' as unknown as 'left' }, { width: 1200 }), 'right');
  assert.equal(resolveDock({ avatarDock: 'invalid' as unknown as 'left' }, { width: 375 }), 'center');
});

test('gravityToEmberVariant - bounds [0.0, 1.0] and endpoints', () => {
  // Endpoints: 0.0 at 0g, 1.0 at 1g
  assert.equal(gravityToEmberVariant(0.0), 0.0, '0g must map to 0.0');
  assert.equal(gravityToEmberVariant(1.0), 1.0, '1g must map to 1.0');

  // Bounds clamping
  assert.equal(gravityToEmberVariant(-0.5), 0.0, 'Negative gravity must clamp to 0.0');
  assert.equal(gravityToEmberVariant(1.5), 1.0, 'Gravity > 1 must clamp to 1.0');
  assert.equal(gravityToEmberVariant(NaN), 0.0, 'NaN must safely default to 0.0');

  // Planetary intermediate points
  assert.equal(gravityToEmberVariant(0.38), 0.38, 'Mars 0.38g');
  assert.equal(gravityToEmberVariant(0.16), 0.16, 'Moon 0.16g');
});

// -----------------------------------------------------------------------------
// 5. UX Navigation & Beat Clamping Helpers Tests (DELIVERABLE D1, D2)
// -----------------------------------------------------------------------------
test('clampBeatIndex - boundary and invalid input clamping', () => {
  assert.equal(clampBeatIndex(0, 7), 0);
  assert.equal(clampBeatIndex(3, 7), 3);
  assert.equal(clampBeatIndex(6, 7), 6);
  assert.equal(clampBeatIndex(10, 7), 6, 'Index above upper bound clamped to totalBeats - 1');
  assert.equal(clampBeatIndex(-5, 7), 0, 'Negative index clamped to 0');
  assert.equal(clampBeatIndex(NaN, 7), 0, 'NaN index defaults to 0');
  assert.equal(clampBeatIndex(2, 0), 0, 'Zero totalBeats returns 0');
});

// -----------------------------------------------------------------------------
// 6. Time Remaining Estimation Tests (DELIVERABLE D2)
// -----------------------------------------------------------------------------
test('calculateRemainingMinutes - computes realistic time based on word count and mode', () => {
  const fullRemainingStart = calculateRemainingMinutes(chapter1.beats, 0, 'full');
  const fullRemainingMid = calculateRemainingMinutes(chapter1.beats, 3, 'full');
  const fullRemainingLast = calculateRemainingMinutes(chapter1.beats, chapter1.beats.length - 1, 'full');

  assert.ok(fullRemainingStart >= 3 && fullRemainingStart <= 10, `Full journey at start should be ~3-10m (got ${fullRemainingStart})`);
  assert.ok(fullRemainingMid < fullRemainingStart, 'Midway remaining must be strictly less than at start');
  assert.equal(fullRemainingLast, 1, 'Last beat should estimate 1 min remaining');

  // Quick mode should estimate less than or equal to full mode
  const quickRemainingStart = calculateRemainingMinutes(chapter1.beats, 0, 'quick');
  assert.ok(quickRemainingStart <= fullRemainingStart, 'Quick mode remaining time must be <= full mode');

  // Empty or invalid input edge case
  assert.equal(calculateRemainingMinutes([], 0, 'full'), 1, 'Empty beats list returns baseline 1m');
  assert.equal(calculateRemainingMinutes(chapter1.beats, 100, 'full'), 1, 'Out of bounds index returns 1m');
});

// -----------------------------------------------------------------------------
// 7. Slider Preset Snapping Tests (DELIVERABLE D6)
// -----------------------------------------------------------------------------
test('snapGravityPreset - snaps to closest preset value', () => {
  const presets = [1.0, 0.38, 0.16, 0.0];

  assert.equal(snapGravityPreset(1.0, presets), 1.0);
  assert.equal(snapGravityPreset(0.95, presets), 1.0);
  assert.equal(snapGravityPreset(0.40, presets), 0.38);
  assert.equal(snapGravityPreset(0.18, presets), 0.16);
  assert.equal(snapGravityPreset(0.04, presets), 0.0);
  assert.equal(snapGravityPreset(-0.2, presets), 0.0, 'Negative gravity snaps to closest (0.0)');
  assert.equal(snapGravityPreset(1.8, presets), 1.0, 'High gravity snaps to closest (1.0)');
});

// -----------------------------------------------------------------------------
// 8. Settings & Layer Preferences Safe Storage Tests (DELIVERABLE D4, D5, D8)
// -----------------------------------------------------------------------------
test('safeStorage - settings persistence and corrupted data fallback', () => {
  safeStorage.clearMemoryStoreForTesting();

  // Initial default settings
  const defaultSettings = getStorySettings();
  assert.equal(defaultSettings.emberEnabled, true);
  assert.equal(defaultSettings.reduceMotionOverride, 'system');
  assert.equal(defaultSettings.textSize, 'normal');

  // Save new settings
  saveStorySettings({
    emberEnabled: false,
    reduceMotionOverride: 'true',
    textSize: 'large',
  });

  const updatedSettings = getStorySettings();
  assert.equal(updatedSettings.emberEnabled, false);
  assert.equal(updatedSettings.reduceMotionOverride, 'true');
  assert.equal(updatedSettings.textSize, 'large');

  // Corrupted settings JSON in storage should not throw and should safely return defaults
  safeStorage.setItem('ignis_story_settings', '{invalid_json');
  const fallbackSettings = getStorySettings();
  assert.equal(fallbackSettings.emberEnabled, true);
  assert.equal(fallbackSettings.reduceMotionOverride, 'system');
  assert.equal(fallbackSettings.textSize, 'normal');
});

test('safeStorage - layer preferences persistence and corrupted fallback', () => {
  safeStorage.clearMemoryStoreForTesting();

  // Initial layer preferences
  const initialPrefs = getLayerPreferences();
  assert.equal(initialPrefs.layer2Open, false);
  assert.equal(initialPrefs.layer3Open, false);

  // Save layer preferences
  saveLayerPreferences({ layer2Open: true, layer3Open: false });
  assert.equal(getLayerPreferences().layer2Open, true);
  assert.equal(getLayerPreferences().layer3Open, false);

  // Corrupted layer prefs JSON
  safeStorage.setItem('ignis_story_layer_prefs', 'corrupted_string');
  const recoveredPrefs = getLayerPreferences();
  assert.equal(recoveredPrefs.layer2Open, false);
  assert.equal(recoveredPrefs.layer3Open, false);
});

test('safeStorage - onboarding tour dismissal persistence', () => {
  safeStorage.clearMemoryStoreForTesting();

  assert.equal(isOnboardingDismissed(), false);
  setOnboardingDismissed(true);
  assert.equal(isOnboardingDismissed(), true);
  setOnboardingDismissed(false);
  assert.equal(isOnboardingDismissed(), false);
});

