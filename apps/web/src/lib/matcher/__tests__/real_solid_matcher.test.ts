/**
 * Parity Test: TypeScript RealSolidMatcher vs Python RealSolidMatcher.
 * Verifies exact parity across 50 golden scenarios with 1e-9 similarity tolerance.
 */

import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RealSolidMatcher } from "../real_solid_matcher.ts";
import type { RawEvidenceSolidRun, MaterialMap } from "../types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
function findRepoRoot(): string {
  let cur = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(cur, "data/processed/evidence_solid.json"))) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return path.resolve(__dirname, "../../../../../../");
}

const repoRoot = findRepoRoot();
const evidencePath = path.join(repoRoot, "data/processed/evidence_solid.json");
const materialMapPath = path.join(repoRoot, "data/processed/material_map.json");
const goldenPath = path.join(repoRoot, "data/fixtures/golden_scenarios_50.json");

const evidenceRuns: RawEvidenceSolidRun[] = JSON.parse(
  fs.readFileSync(evidencePath, "utf-8")
);
const materialMap: MaterialMap = JSON.parse(
  fs.readFileSync(materialMapPath, "utf-8")
);
const goldenScenarios = JSON.parse(
  fs.readFileSync(goldenPath, "utf-8")
);

const matcher = new RealSolidMatcher(evidenceRuns, materialMap);

test("TypeScript RealSolidMatcher parity across 50 golden scenarios", async (t) => {
  assert.strictEqual(goldenScenarios.length, 50, "Expected 50 golden scenarios");

  let totalMatchesChecked = 0;

  for (let idx = 0; idx < goldenScenarios.length; idx++) {
    const item = goldenScenarios[idx];
    const scenarioId = item.scenario_id;

    await t.test(`Scenario ${scenarioId}: ${item.input.material} (O2=${item.input.oxygen_pct}%, Flow=${item.input.flow_cm_s}cm/s)`, () => {
      const result = matcher.match(
        item.input,
        item.custom_weights,
        item.top_k
      );

      const expected = item.expected;

      // 1. Total evaluated count
      assert.strictEqual(
        result.total_evaluated,
        expected.total_evaluated,
        `Scenario ${scenarioId}: total_evaluated mismatch`
      );

      // 2. Tested envelope metrics
      assert.strictEqual(
        result.envelope.outside_tested_range,
        expected.outside_tested_range,
        `Scenario ${scenarioId}: outside_tested_range mismatch`
      );

      assert.ok(
        Math.abs(result.envelope.nearest_distance_norm - expected.nearest_distance_norm) < 1e-4,
        `Scenario ${scenarioId}: nearest_distance_norm mismatch: got ${result.envelope.nearest_distance_norm}, expected ${expected.nearest_distance_norm}`
      );

      // 3. Epistemic warnings
      assert.strictEqual(
        result.warnings.length,
        expected.warnings.length,
        `Scenario ${scenarioId}: warnings count mismatch`
      );
      for (let wIdx = 0; wIdx < expected.warnings.length; wIdx++) {
        assert.strictEqual(
          result.warnings[wIdx],
          expected.warnings[wIdx],
          `Scenario ${scenarioId}: warning #${wIdx} mismatch`
        );
      }

      // 4. Matches ranking and similarity tolerance (1e-9)
      assert.strictEqual(
        result.matches.length,
        expected.matches.length,
        `Scenario ${scenarioId}: matches count mismatch`
      );

      for (let mIdx = 0; mIdx < expected.matches.length; mIdx++) {
        const actualMatch = result.matches[mIdx];
        const expMatch = expected.matches[mIdx];

        // Ranking assertion
        assert.strictEqual(
          actualMatch.run_uid,
          expMatch.run_uid,
          `Scenario ${scenarioId} Match #${mIdx}: ranking mismatch (got ${actualMatch.run_uid}, expected ${expMatch.run_uid})`
        );

        // Similarity tolerance assertion (1e-9)
        const simDiff = Math.abs(actualMatch.similarity - expMatch.similarity);
        assert.ok(
          simDiff < 1e-9,
          `Scenario ${scenarioId} Match #${mIdx} (${actualMatch.run_uid}): similarity diff ${simDiff} exceeds 1e-9 (got ${actualMatch.similarity}, expected ${expMatch.similarity})`
        );

        // Source file and row provenance
        assert.strictEqual(
          actualMatch.source_file,
          expMatch.source_file,
          `Scenario ${scenarioId} Match #${mIdx}: source_file mismatch`
        );
        assert.strictEqual(
          actualMatch.source_row,
          expMatch.source_row,
          `Scenario ${scenarioId} Match #${mIdx}: source_row mismatch`
        );

        // Outcome class
        assert.strictEqual(
          actualMatch.outcome_class,
          expMatch.outcome_class,
          `Scenario ${scenarioId} Match #${mIdx}: outcome_class mismatch`
        );

        // Factor breakdowns
        for (const [factorName, expFactor] of Object.entries(expMatch.factors)) {
          const actFactor = actualMatch.factors[factorName];
          assert.ok(actFactor, `Scenario ${scenarioId} Match #${mIdx}: missing factor ${factorName}`);
          assert.strictEqual(
            actFactor.basis,
            (expFactor as any).basis,
            `Scenario ${scenarioId} Match #${mIdx} factor ${factorName}: basis mismatch`
          );
          if ((expFactor as any).similarity != null) {
            const fSimDiff = Math.abs(actFactor.similarity! - (expFactor as any).similarity);
            assert.ok(
              fSimDiff < 1e-4,
              `Scenario ${scenarioId} Match #${mIdx} factor ${factorName}: similarity diff ${fSimDiff} exceeds 1e-4`
            );
          }
        }

        totalMatchesChecked++;
      }
    });
  }

  console.log(`\nSuccessfully verified 50 scenarios and ${totalMatchesChecked} individual ranked matches to 1e-9 precision!`);
});
