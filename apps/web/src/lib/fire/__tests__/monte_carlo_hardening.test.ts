import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  runMonteCarloValidationSweep,
  runMonteCarloValidationSweepAsync,
  runRobustnessSweep,
} from '../validate.ts';

describe('Monte Carlo Hardening, Determinism & Robustness Sweep', () => {
  it('guarantees bit-exact determinism: same seed yields identical outputs', () => {
    const run1 = runMonteCarloValidationSweep(30, 'iss_like_module', 42);
    const run2 = runMonteCarloValidationSweep(30, 'iss_like_module', 42);

    assert.deepEqual(run1.baseline, run2.baseline, 'Baseline metrics must match exactly for same seed');
    assert.deepEqual(run1.fusion, run2.fusion, 'Fusion metrics must match exactly for same seed');
    assert.ok(run1.trained, 'Trained metrics arm must be present');
    assert.deepEqual(run1.trained, run2.trained, 'Trained metrics must match exactly for same seed');
    assert.equal(
      run1.trained.label,
      'behaves sensibly on simulator streams; both model and simulator carry assumptions; not a superiority claim'
    );
    assert.equal(
      run1.rankingComparison.rankingHoldsAcrossSweep,
      run2.rankingComparison.rankingHoldsAcrossSweep
    );
  });

  it('runs async chunked sweep with non-blocking progress updates', async () => {
    const progressUpdates: number[] = [];
    const totalRuns = 40;

    const res = await runMonteCarloValidationSweepAsync(
      totalRuns,
      'iss_like_module',
      42,
      (completed, total) => {
        progressUpdates.push(completed);
        assert.equal(total, totalRuns);
      }
    );

    assert.equal(res.totalRuns, totalRuns);
    assert.ok(progressUpdates.length >= 2, 'Should emit at least 2 chunk progress updates');
    assert.equal(progressUpdates[progressUpdates.length - 1], totalRuns, 'Final update must reach 100%');

    // Chunks must be <= 20
    for (let i = 1; i < progressUpdates.length; i++) {
      const stepSize = progressUpdates[i] - progressUpdates[i - 1];
      assert.ok(stepSize <= 20, `Chunk step size (${stepSize}) must not exceed 20`);
    }
  });

  it('reports robustness sweep across parameter ranges with "holds in X of Y" syntax', () => {
    const robustness = runRobustnessSweep('iss_like_module', 101);

    assert.ok(robustness.totalSettings >= 10, 'Should test across multiple parameter settings');
    assert.match(
      robustness.delayHoldsFraction,
      /holds in \d+ of \d+ settings/,
      'Delay fraction must use "holds in X of Y settings" format'
    );
    assert.match(
      robustness.falseAlarmHoldsFraction,
      /holds in \d+ of \d+ settings/,
      'False alarm fraction must use "holds in X of Y settings" format'
    );
    assert.match(
      robustness.localizationHoldsFraction,
      /holds in \d+ of \d+ settings/,
      'Localization fraction must use "holds in X of Y settings" format'
    );
  });

  it('identifies and reports ranking flips in plain words when consistency criteria break', () => {
    // Test that the reporting logic articulates ranking flips in plain words
    const metrics = runMonteCarloValidationSweep(30, 'iss_like_module', 999);
    assert.ok(metrics.rankingComparison.sweepDiscrepancyNotes, 'Must provide plain words discrepancy notes');

    if (metrics.rankingComparison.rankingFlipsDetected) {
      assert.ok(
        metrics.rankingComparison.sweepDiscrepancyNotes.includes('Ranking flips observed') ||
          metrics.rankingComparison.sweepDiscrepancyNotes.includes('flipped'),
        'Must articulate flips in plain words'
      );
      assert.ok(
        metrics.rankingComparison.rankingFlipDetails && metrics.rankingComparison.rankingFlipDetails.length > 0,
        'Must provide details of the flips'
      );
    } else {
      assert.ok(
        metrics.rankingComparison.sweepDiscrepancyNotes.includes('holds') ||
          metrics.rankingComparison.sweepDiscrepancyNotes.includes('rejection'),
        'Must state ranking holds when no flips'
      );
    }
  });
});

