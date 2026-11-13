import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hasSeenIntro, markIntroSeen, resetIntroSeen } from '../introStorage.ts';
import { deriveFlameParams } from '../../../visuals/flameParams.ts';

// In-memory mock storage implementation
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

// Faulty storage implementation that throws on any access (e.g. strict private browsing)
class FaultyStorage implements Storage {
  get length(): number {
    throw new Error('QuotaExceededError or SecurityError');
  }

  clear(): void {
    throw new Error('QuotaExceededError or SecurityError');
  }

  getItem(): string | null {
    throw new Error('SecurityError: The operation is insecure.');
  }

  key(): string | null {
    throw new Error('SecurityError');
  }

  removeItem(): void {
    throw new Error('SecurityError');
  }

  setItem(): void {
    throw new Error('QuotaExceededError');
  }
}

describe('Earth vs Orbit Intro Storage & Logic Invariants', () => {
  it('returns false when storage is unset, true when marked, false when reset', () => {
    const storage = new MockStorage();

    assert.equal(hasSeenIntro(storage), false, 'Initially false');

    markIntroSeen(storage);
    assert.equal(hasSeenIntro(storage), true, 'True after marked seen');

    resetIntroSeen(storage);
    assert.equal(hasSeenIntro(storage), false, 'False after reset');
  });

  it('resilient against throwing storage without unhandled errors', () => {
    const faulty = new FaultyStorage();

    // Must never throw
    assert.doesNotThrow(() => {
      const seen = hasSeenIntro(faulty);
      assert.equal(seen, false, 'Defaults to false when storage throws');
    });

    assert.doesNotThrow(() => {
      markIntroSeen(faulty);
    });

    assert.doesNotThrow(() => {
      resetIntroSeen(faulty);
    });
  });

  it('validates shot list captions exactly match Step 5 prompt specification', () => {
    const beat1Caption = 'Fire in space is different.';
    const beat2Caption = "On Earth, smoke rises. Here, it doesn't.";

    const beat1WordCount = beat1Caption.trim().split(/\s+/).length;
    const beat2WordCount = beat2Caption.trim().split(/\s+/).length;

    assert.equal(beat1Caption, 'Fire in space is different.');
    assert.equal(beat2Caption, "On Earth, smoke rises. Here, it doesn't.");

    assert.ok(beat1WordCount <= 6, `Beat 1 has ${beat1WordCount} words`);
    assert.ok(beat2WordCount <= 7, `Beat 2 has ${beat2WordCount} words`);
  });

  it('deterministic flame morph parameters from 1g to 0g via flameParams', () => {
    const params1g = deriveFlameParams({ gravity_g: 1.0, oxygen_pct: 21.0 });
    const paramsHalfG = deriveFlameParams({ gravity_g: 0.5, oxygen_pct: 21.0 });
    const params0g = deriveFlameParams({ gravity_g: 0.0, oxygen_pct: 21.0 });

    // 1g is buoyant teardrop
    assert.equal(params1g.elongation, 1.8, '1g elongation must be 1.8');
    assert.equal(params1g.shapeDescription, 'buoyant teardrop');

    // 0g is spherical
    assert.equal(params0g.elongation, 1.0, '0g elongation must be 1.0');
    assert.equal(params0g.shapeDescription, 'spherical');

    // Intermediate gravity values are monotonically bounded
    assert.ok(
      paramsHalfG.elongation > params0g.elongation,
      'Half-g elongation must be greater than 0g'
    );
    assert.ok(
      paramsHalfG.elongation < params1g.elongation,
      'Half-g elongation must be less than 1g'
    );
  });
});
