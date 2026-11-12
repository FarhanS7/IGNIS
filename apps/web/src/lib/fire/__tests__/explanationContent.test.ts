import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPLANATION_REGISTRY,
  resolveActiveExplanation,
  getStoredExplanationDepth,
  setStoredExplanationDepth,
} from '../upgrade/explanationContent.ts';
import type { ExplanationTrigger } from '../upgrade/types.ts';

test('Contextual Explanation Registry & Content Invariants', async (t) => {
  const triggers: ExplanationTrigger[] = [
    'SCENARIO_START',
    'ALARM_FIRST',
    'DETECTOR_DISAGREEMENT',
    'LOCALIZATION_ESTABLISHED',
    'POWER_CUT',
    'VENT_ISOLATION',
    'SUPPRESSION_ARMED',
    'SUPPRESSION_DISCHARGED',
    'FIRE_EXTINGUISHED',
    'POST_FIRE_SAFE',
  ];

  await t.test('all 10 trigger states have valid registered explanations', () => {
    for (const trigger of triggers) {
      const exp = EXPLANATION_REGISTRY[trigger];
      assert.ok(exp, `Missing explanation for trigger: ${trigger}`);
      assert.equal(exp.trigger, trigger);
      assert.ok(exp.title.length > 5, `Title too short for ${trigger}`);
      assert.ok(exp.quick.length > 20, `Quick text too short for ${trigger}`);
      assert.ok(exp.science.mechanism.length > 20, `Science mechanism too short for ${trigger}`);
      assert.ok(exp.science.quantities.length > 0, `Quantities empty for ${trigger}`);
      assert.ok(exp.science.limitation.length > 10, `Limitation empty for ${trigger}`);
      assert.ok(exp.engineering.sourceFields.length > 0, `Source fields empty for ${trigger}`);
      assert.ok(exp.engineering.thresholds.length > 0, `Thresholds empty for ${trigger}`);
      assert.ok(exp.engineering.provenance.length > 10, `Provenance empty for ${trigger}`);
    }
  });

  await t.test('epistemic copy rules: no banned terms in any explanation', () => {
    const bannedPatterns = [
      /\bguaranteed\b/i,
      /\b100%\s*safe\b/i,
      /\bflight-certified\b/i,
      /\bpredicts\s+fire\s+risk\b/i,
      /\bpredicts\s+flame\s+extinction\b/i,
      /\bconfidenceScore\b/,
      /\d+%\s*confidence\b/i,
      /\bAI-powered\s+detection\s+is\s+validated\b/i,
      /\bproven\b/i,
      /\bcertified\b/i,
    ];

    for (const [trigger, exp] of Object.entries(EXPLANATION_REGISTRY)) {
      const textToScan = [
        exp.title,
        exp.quick,
        exp.science.mechanism,
        ...exp.science.quantities,
        exp.science.limitation,
        ...exp.engineering.sourceFields,
        ...exp.engineering.thresholds,
        exp.engineering.stateTransition,
        exp.engineering.provenance,
      ].join(' ');

      for (const pattern of bannedPatterns) {
        assert.equal(
          pattern.test(textToScan),
          false,
          `Explanation for ${trigger} violated banned pattern ${pattern}: "${textToScan}"`
        );
      }
    }
  });

  await t.test('resolveActiveExplanation returns appropriate trigger as simulation advances', () => {
    // At t = 0
    const start = resolveActiveExplanation(0, false, false, false, 13.0, 15.0);
    assert.equal(start.trigger, 'SCENARIO_START');

    // At t = 13.2 (disagreement window: cal alarmed, std has not)
    const disagree = resolveActiveExplanation(13.2, false, false, false, 13.0, 15.0);
    assert.equal(disagree.trigger, 'DETECTOR_DISAGREEMENT');

    // At t = 17.5 with suppression armed
    const armed = resolveActiveExplanation(17.5, true, false, false, 13.0, 15.0);
    assert.equal(armed.trigger, 'SUPPRESSION_ARMED');

    // With suppression active
    const active = resolveActiveExplanation(25.0, false, true, false, 13.0, 15.0);
    assert.equal(active.trigger, 'SUPPRESSION_DISCHARGED');

    // With fire extinguished
    const extinguished = resolveActiveExplanation(30.0, false, false, true, 13.0, 15.0);
    assert.equal(extinguished.trigger, 'FIRE_EXTINGUISHED');

    // Post fire safe at t >= 40
    const safe = resolveActiveExplanation(45.0, false, false, true, 13.0, 15.0);
    assert.equal(safe.trigger, 'POST_FIRE_SAFE');
  });

  await t.test('storage helper gracefully handles missing localStorage in node environment', () => {
    const depth = getStoredExplanationDepth();
    assert.ok(['quick', 'science', 'engineering'].includes(depth));
    setStoredExplanationDepth('science');
  });
});

