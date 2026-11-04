import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bindActionEvidence, bindAllResponseEvidence } from '../evidenceBinder.ts';
import { getHabitatPresets, getHabitatById } from '../habitat.ts';
import type { FuelType, SequenceStepId } from '../types.ts';
import solidRunsData from '../../../data/evidence_solid.json' with { type: 'json' };

const validRunUids = new Set(solidRunsData.map((r: { run_uid: string }) => r.run_uid));

describe('Evidence Binder Real Flight Runs & Epistemic Honesty Audit', () => {
  const fuels: FuelType[] = ['cellulose', 'silicone', 'kapton', 'teflon'];
  const steps: SequenceStepId[] = [
    'ALARM',
    'REMOVE_POWER',
    'ISOLATE_VENTILATION',
    'INHIBIT_MAKEUP',
    'SUPPRESSION',
    'POST_FIRE_RECOVERY',
  ];
  const habitats = getHabitatPresets();

  it('asserts every run_uid referenced by evidence chips exists in evidence_solid.json', () => {
    let checkedRunCount = 0;

    for (const habitat of habitats) {
      for (const fuel of fuels) {
        const chips = bindAllResponseEvidence(fuel, habitat);
        for (const step of steps) {
          const chip = chips[step];
          assert.ok(chip, `Chip for ${step} must exist`);
          for (const match of chip.matchedFlightRuns) {
            assert.ok(
              validRunUids.has(match.run_uid),
              `Referenced run_uid "${match.run_uid}" in step ${step} must exist in evidence_solid.json`
            );
            checkedRunCount++;
          }
        }
      }
    }

    assert.ok(checkedRunCount > 0, `Expected to verify matched flight run UIDs, checked: ${checkedRunCount}`);
  });

  it('verifies the ISOLATE_VENTILATION chip carries the BASS-II circularity caveat and does not make generic claims', () => {
    const issHabitat = getHabitatById('iss_like_module')!;
    const chip = bindActionEvidence('ISOLATE_VENTILATION', 'cellulose', issHabitat);

    assert.ok(
      chip.circularityCaveat.includes('BASS-II circularity caveat'),
      'Caveat must explicitly mention BASS-II circularity caveat'
    );
    assert.ok(
      chip.circularityCaveat.includes('does not guarantee extinction'),
      'Caveat must state that flow cutoff does not guarantee extinction'
    );
    assert.strictEqual(
      /shutting off (?:ventilation|flow) extinguishes fires/i.test(chip.circularityCaveat),
      false,
      'Caveat must not assert that ventilation shutoff extinguishes fires in general'
    );
  });

  it('triggers "outside NASA\'s tested range" warning when gravity != 0 (partial gravity)', () => {
    // lunar_habitat is in lunar partial g
    const lunar = getHabitatById('lunar_habitat')!;
    assert.strictEqual(lunar.environment, 'lunar_partial_g');

    const chip = bindActionEvidence('ISOLATE_VENTILATION', 'cellulose', lunar);
    assert.strictEqual(chip.isWithinFlightEnvelope, false);
    const hasTestedRangeWarning = chip.warnings.some((w) =>
      w.toLowerCase().includes("outside nasa's tested range")
    );
    assert.ok(
      hasTestedRangeWarning,
      `Expected warning with "outside NASA's tested range", got: ${JSON.stringify(chip.warnings)}`
    );
  });

  it('triggers "outside NASA\'s tested range" warning when oxygen_pct > 22.2%', () => {
    const issHabitat = getHabitatById('iss_like_module')!;
    const elevatedO2Input = {
      material: 'Cotton',
      oxygen_pct: 28.0,
      flow_cm_s: 10.0,
      thickness_mm: 1.0,
    };

    const chip = bindActionEvidence('ISOLATE_VENTILATION', 'cellulose', issHabitat, elevatedO2Input);
    assert.strictEqual(chip.isWithinFlightEnvelope, false);
    const hasTestedRangeWarning = chip.warnings.some((w) =>
      w.toLowerCase().includes("outside nasa's tested range")
    );
    assert.ok(
      hasTestedRangeWarning,
      `Expected warning with "outside NASA's tested range", got: ${JSON.stringify(chip.warnings)}`
    );
  });
});
