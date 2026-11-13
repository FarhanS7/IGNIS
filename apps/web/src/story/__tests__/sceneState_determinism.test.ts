import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mulberry32,
  generateSeededParticles,
  getSceneState,
} from '../sceneState.ts';
import { LEVEL_CONFIGS } from '../levels.ts';

test('sceneState Determinism: mulberry32 PRNG repeatability', () => {
  const rng1 = mulberry32(12345);
  const rng2 = mulberry32(12345);

  const seq1 = Array.from({ length: 50 }, () => rng1());
  const seq2 = Array.from({ length: 50 }, () => rng2());

  assert.deepEqual(seq1, seq2, 'mulberry32 with identical seed must produce identical sequences');

  // Verify all numbers in [0, 1)
  for (const n of seq1) {
    assert.ok(n >= 0.0 && n < 1.0, `PRNG output must be in [0, 1), got ${n}`);
  }

  // Different seed must produce different sequences
  const rngDiff = mulberry32(54321);
  const seqDiff = Array.from({ length: 50 }, () => rngDiff());
  assert.notDeepEqual(seq1, seqDiff, 'Different seeds must produce different sequences');
});

test('sceneState Determinism: seeded particle buffers are bit-identical', () => {
  const bufA = generateSeededParticles(200, 42, 3.5);
  const bufB = generateSeededParticles(200, 42, 3.5);

  assert.equal(bufA.length, 600, 'Buffer length must be count * 3');
  assert.equal(bufB.length, 600);

  for (let i = 0; i < bufA.length; i++) {
    assert.equal(bufA[i], bufB[i], `Bit mismatch at particle index ${i}`);
  }
});

test('sceneState Determinism: getSceneState pure function invariants', () => {
  const stateA = getSceneState('why-is-fire-round-in-space', 2, 0.5, { gravity_g: 0.0 }, 42, 'explorer');
  const stateB = getSceneState('why-is-fire-round-in-space', 2, 0.5, { gravity_g: 0.0 }, 42, 'explorer');

  assert.deepEqual(stateA, stateB, 'getSceneState must be pure and return identical output for identical inputs');

  // Cold open acts
  const coldState = getSceneState('why-is-fire-round-in-space', 0, 0.0, {}, 42, 'explorer');
  assert.equal(coldState.act, 'coldOpen');
  assert.equal(coldState.letterboxActive, true, 'Letterbox bars must be active in coldOpen');

  // Interactive act
  const interactiveState = getSceneState('why-is-fire-round-in-space', 2, 0.0, {}, 42, 'explorer');
  assert.equal(interactiveState.letterboxActive, false, 'Letterbox bars must retract in interactive acts');

  // Gravity regimes
  const orbitState = getSceneState('why-is-fire-round-in-space', 2, 0.0, { gravity_g: 0.0 }, 42, 'explorer');
  assert.equal(orbitState.flame.elongation, 1.0, 'In orbit (0g), flame must be a pure sphere with elongation 1.0');
  assert.equal(orbitState.flame.buoyancy, 0.0);
  assert.equal(orbitState.flame.coreColor, '#38bdf8', 'Microgravity core chemiluminescence must be blue');

  const earthState = getSceneState('why-is-fire-round-in-space', 2, 0.0, { gravity_g: 1.0 }, 42, 'explorer');
  assert.equal(earthState.flame.elongation, 2.5, 'On Earth (1g), flame must elongate into a teardrop');
  assert.equal(earthState.flame.buoyancy, 1.0);
  assert.equal(earthState.flame.coreColor, '#f59e0b', '1g core must show bright yellow soot');

  // Droplet D-squared law
  const dropletHalf = getSceneState('why-is-fire-round-in-space', 4, 0.5, { initial_diameter_mm: 2.0, burn_progress: 0.75 }, 42, 'explorer');
  // d(0.75) = 2.0 * sqrt(1 - 0.75) = 2.0 * 0.5 = 1.0
  assert.equal(dropletHalf.droplet.diameterMm, 1.0, 'Droplet must strictly follow d-squared law');

  // Truth tags must be categorical
  assert.ok(
    orbitState.truthTag === 'From NASA flight tests' || orbitState.truthTag === 'Illustration',
    'Truth tag must be categorical'
  );
});

test('sceneState Levels: Level configuration word limits', () => {
  assert.equal(LEVEL_CONFIGS.little.maxWords, 6, 'Little Explorer level must be capped at 6 words per beat');
  assert.equal(LEVEL_CONFIGS.explorer.maxWords, 25, 'Explorer level must be capped at 25 words per beat');
  assert.ok(LEVEL_CONFIGS.little.minTouchTargetPx >= 56, 'Little level touch target must be at least 56px');
});

