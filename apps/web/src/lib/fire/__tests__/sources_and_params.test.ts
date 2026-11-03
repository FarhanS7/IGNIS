import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERIFIED_SOURCES, isValidLiteratureTag } from '../verified_sources.ts';
import { SIM_PARAMS, computePersistenceSamples, validateSimParamsSources } from '../sim_params.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../..');
const webSrcRoot = path.resolve(__dirname, '../../..');

describe('Verified Sources, Parameter Registry & Honesty Guardrails', () => {
  it('enforces that all literature tags in SIM_PARAMS exist in verified_sources.ts', () => {
    // Should not throw
    assert.doesNotThrow(() => {
      validateSimParamsSources();
    });

    // Check every param explicitly
    for (const [key, param] of Object.entries(SIM_PARAMS)) {
      assert.ok(param.value >= param.min, `${key}: value (${param.value}) < min (${param.min})`);
      assert.ok(param.value <= param.max, `${key}: value (${param.value}) > max (${param.max})`);
      assert.ok(param.rationale.length > 10, `${key}: rationale must be descriptive`);

      if (param.tag.startsWith('literature:')) {
        const sourceId = param.tag.replace('literature:', '');
        const source = VERIFIED_SOURCES[sourceId];
        assert.ok(source, `Source ID ${sourceId} must exist in VERIFIED_SOURCES`);
        assert.ok(source.ntrsId_or_doi, `${sourceId} must have an NTRS ID or DOI`);
        assert.ok(source.pageRef, `${sourceId} must specify verified page references`);
        assert.ok(source.supports, `${sourceId} must record verified qualitative finding`);
      }
    }
  });

  it('rejects invented literature tags not present in verified_sources registry', () => {
    const inventedTags = [
      'literature:NASA-CR-2005-SAME',
      'literature:NASA-TP-2016-Kapton',
      'literature:NASA-CR-1998-PTFE',
      'literature:NFPA-72-Spacecraft',
      'literature:ISS-Node2-Spec',
      'literature:SFPE-Tewarson',
      'literature:NON-EXISTENT-ID',
    ];

    for (const tag of inventedTags) {
      assert.strictEqual(
        isValidLiteratureTag(tag),
        false,
        `Invented tag "${tag}" must be rejected by isValidLiteratureTag`
      );
    }
  });

  it('correctly calculates derived persistence sample count from duration and sample rate', () => {
    // Standard 6s at 2 Hz -> 12 samples
    assert.strictEqual(computePersistenceSamples(6.0, 2.0), 12);

    // Standard 6s at 1 Hz -> 6 samples
    assert.strictEqual(computePersistenceSamples(6.0, 1.0), 6);

    // 0.5s at 2 Hz -> 1 sample
    assert.strictEqual(computePersistenceSamples(0.5, 2.0), 1);

    // 3.0s at 5 Hz -> 15 samples
    assert.strictEqual(computePersistenceSamples(3.0, 5.0), 15);

    // Fractional rounding: 1.7s at 2 Hz = 3.4 -> 3 samples
    assert.strictEqual(computePersistenceSamples(1.7, 2.0), 3);

    // Edge cases: non-positive values clamp to 1 sample minimum
    assert.strictEqual(computePersistenceSamples(0, 2.0), 1);
    assert.strictEqual(computePersistenceSamples(-5.0, 2.0), 1);
    assert.strictEqual(computePersistenceSamples(6.0, 0), 1);
    assert.strictEqual(computePersistenceSamples(6.0, -1.0), 1);
  });

  it('enforces Amendment D: bans "Spacecraft Atmosphere Monitor" naming in source and docs', () => {
    function walkDir(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
            walkDir(full, fileList);
          }
        } else if (/\.(ts|tsx|md|json)$/.test(f) && !f.includes('sources_and_params.test.ts')) {
          fileList.push(full);
        }
      }
      return fileList;
    }

    const filesToCheck = [
      ...walkDir(webSrcRoot),
      path.join(repoRoot, 'README.md'),
      path.join(repoRoot, 'docs/EVALUATION.md'),
    ].filter((f) => fs.existsSync(f));

    const violations: { file: string; line: number; text: string }[] = [];
    const bannedRegex = /Spacecraft\s+Atmosphere\s+Monitor/i;

    for (const file of filesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (bannedRegex.test(line)) {
          violations.push({
            file: path.relative(repoRoot, file),
            line: idx + 1,
            text: line.trim(),
          });
        }
      });
    }

    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden phrase "Spacecraft Atmosphere Monitor" (SAME stands for Smoke Aerosol Measurement Experiment):\n${JSON.stringify(violations, null, 2)}`
    );
  });
});

