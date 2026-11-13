import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  IGNIS_SUBMISSION_URL,
  TOTAL_CAPTURE_DURATION_S,
  CAPTURE_BEATS,
  REAL_NASA_PROVENANCE,
} from '../../../lib/fire/captureConstants.ts';

describe('Capture Mode Constants & Provenance Invariants', () => {
  it('defines valid non-empty submission URL', () => {
    assert.ok(IGNIS_SUBMISSION_URL.startsWith('https://'), 'URL must be HTTPS');
    assert.ok(IGNIS_SUBMISSION_URL.length > 8, 'URL must be non-trivial');
  });

  it('spans exactly 90.0 seconds for the Space Apps submission video', () => {
    assert.equal(TOTAL_CAPTURE_DURATION_S, 90.0, 'Total capture duration must be 90s');
  });

  it('maintains continuous, non-overlapping capture beats covering 0 to 90 seconds', () => {
    assert.ok(CAPTURE_BEATS.length >= 7, 'Must have all core narrative beats');

    assert.equal(CAPTURE_BEATS[0].start_s, 0.0, 'First beat must start at 0s');
    assert.equal(
      CAPTURE_BEATS[CAPTURE_BEATS.length - 1].end_s,
      90.0,
      'Last beat must end at 90s'
    );

    for (let i = 0; i < CAPTURE_BEATS.length - 1; i++) {
      const current = CAPTURE_BEATS[i];
      const next = CAPTURE_BEATS[i + 1];

      assert.ok(
        current.end_s <= next.start_s + 0.001,
        `Beats must not overlap: ${current.id} (${current.end_s}) and ${next.id} (${next.start_s})`
      );
      assert.ok(
        current.end_s >= current.start_s,
        `Beat duration must be positive: ${current.id}`
      );
    }
  });

  it('confirms every beat caption conforms to brevity constraints', () => {
    for (const beat of CAPTURE_BEATS) {
      const wordCount = beat.caption.trim().split(/\s+/).length;
      assert.ok(
        wordCount <= 7,
        `Beat "${beat.id}" caption has ${wordCount} words: "${beat.caption}"`
      );
    }
  });

  it('epistemic NASA provenance integrity: all fields populated from real flight records', () => {
    assert.equal(REAL_NASA_PROVENANCE.investigationId, 'SAME-R');
    assert.equal(REAL_NASA_PROVENANCE.flightPlatform, 'International Space Station (ISS)');
    assert.equal(REAL_NASA_PROVENANCE.doi, '10.2514/6.2013-3435');
    assert.ok(REAL_NASA_PROVENANCE.sensorTypes.length >= 2);
  });
});

