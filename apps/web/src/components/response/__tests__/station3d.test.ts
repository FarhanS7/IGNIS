import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SmokeParticleEngine } from '../smokeParticles.ts';

describe('Station 3D Smoke Particles Engine Invariants', () => {
  it('particle seed produces bit-identical positions and alphas for identical t', () => {
    const engineA = new SmokeParticleEngine({ seed: 42, zoneCount: 4 });
    const engineB = new SmokeParticleEngine({ seed: 42, zoneCount: 4 });

    const smokeInputs = [1.2, 0.4, 0.0, 0.0];
    const resA = engineA.evaluate(15.5, smokeInputs, false, false, 0);
    const resB = engineB.evaluate(15.5, smokeInputs, false, false, 0);

    assert.equal(
      resA.zonePositions.length,
      resB.zonePositions.length,
      'Position buffer lengths must match'
    );

    // Bit-exact float comparison
    for (let i = 0; i < resA.zonePositions.length; i++) {
      assert.equal(
        resA.zonePositions[i],
        resB.zonePositions[i],
        `Mismatch at index ${i} for zonePositions`
      );
    }

    for (let i = 0; i < resA.zoneAlphas.length; i++) {
      assert.equal(
        resA.zoneAlphas[i],
        resB.zoneAlphas[i],
        `Mismatch at index ${i} for zoneAlphas`
      );
    }
  });

  it('particles do NOT rise (microgravity zero-buoyancy physics constraint)', () => {
    const engine = new SmokeParticleEngine({ seed: 42, zoneCount: 4 });
    const smokeInputs = [2.5, 1.0, 0.5, 0.0];

    // Evaluate at multiple time steps
    for (const t of [0, 10, 25, 50, 75]) {
      const res = engine.evaluate(t, smokeInputs, false, false, 0);
      const totalParticles = engine.zoneDefs.length;

      // Ensure no particles escape the cylinder envelope or form a rising plume
      for (let i = 0; i < totalParticles; i++) {
        const y = res.zonePositions[i * 3 + 1];
        // Radius of module is ~0.95; particles must stay within radial bounds [-1.0, 1.0]
        assert.ok(
          y >= -1.05 && y <= 1.05,
          `Particle ${i} breached vertical microgravity envelope: y = ${y}`
        );
      }
    }
  });

  it('duct particles stagnate and disappear when ventilation dampers isolate', () => {
    const engine = new SmokeParticleEngine({ seed: 42, zoneCount: 4 });
    const smokeInputs = [2.5, 1.5, 0.0, 0.0];

    // When dampers are open, duct particles have non-zero alpha
    const openRes = engine.evaluate(20.0, smokeInputs, false, false, 0);
    const hasActiveDuctParticles = Array.from(openRes.ductAlphas).some((a) => a > 0);
    assert.ok(hasActiveDuctParticles, 'Open ducts should show flowing smoke particles');

    // When isolated, all duct particles must drop to 0 alpha (isolation)
    const isolatedRes = engine.evaluate(20.0, smokeInputs, true, false, 0);
    const anyActiveWhenIsolated = Array.from(isolatedRes.ductAlphas).some((a) => a > 0);
    assert.equal(
      anyActiveWhenIsolated,
      false,
      'Duct particles must have zero opacity when isolation dampers are closed'
    );
  });
});

