import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERIFIED_SOURCES, isValidLiteratureTag } from '../verified_sources.ts';
import { SIM_PARAMS } from '../sim_params.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../..');
const webSrcRoot = path.resolve(__dirname, '../../..');

function walkDir(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (entry !== 'node_modules' && entry !== '.git' && entry !== 'dist') {
        walkDir(full, fileList);
      }
    } else if (/\.(ts|tsx|md|json)$/.test(entry)) {
      fileList.push(full);
    }
  }
  return fileList;
}

describe('Step 11 Guard Checks & Safety Integrity', () => {
  const allWebSrcFiles = walkDir(webSrcRoot);
  const readmePath = path.join(repoRoot, 'README.md');
  const filesToScan = [...allWebSrcFiles, readmePath].filter((f) => fs.existsSync(f));

  it('fails if banned acronym expansion appears anywhere in source or README', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const bannedStr = ['Spacecraft', 'Atmosphere', 'Monitor'].join(' ');
    const banned = new RegExp(['Spacecraft', 'Atmosphere', 'Monitor'].join('\\s+'), 'i');

    for (const file of filesToScan) {
      if (file.includes('guard_checks.test.ts') || file.includes('sources_and_params.test.ts') || file.includes('fire_copy_lint.test.ts')) {
        continue;
      }
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        if (banned.test(line)) {
          violations.push({
            file: path.relative(repoRoot, file),
            line: idx + 1,
            text: line.trim(),
          });
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Found forbidden phrase "${bannedStr}": ${JSON.stringify(violations, null, 2)}`
    );
  });

  it('fails if "Halon" appears anywhere in apps/web/src or README', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const banned = /\bHalon\b/i;

    for (const file of filesToScan) {
      if (file.includes('guard_checks.test.ts')) continue;
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        if (banned.test(line)) {
          violations.push({
            file: path.relative(repoRoot, file),
            line: idx + 1,
            text: line.trim(),
          });
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Found forbidden chemical agent "Halon": ${JSON.stringify(violations, null, 2)}`
    );
  });

  it('fails if overclaiming safety terms appear outside explicit guard assertions', () => {
    const violations: { file: string; line: number; text: string; term: string }[] = [];
    const bannedTerms = [
      { regex: /flight-certified/i, name: 'flight-certified' },
      { regex: /\bguaranteed\b/i, name: 'guaranteed' },
      { regex: /100%\s*safe/i, name: '100% safe' },
      { regex: /predicts\s+fire\s+risk/i, name: 'predicts fire risk' },
    ];

    for (const file of filesToScan) {
      // Allow test files that check/mock these strings
      if (file.includes('__tests__') || file.includes('test.ts')) continue;

      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        for (const { regex, name } of bannedTerms) {
          if (regex.test(line)) {
            violations.push({
              file: path.relative(repoRoot, file),
              line: idx + 1,
              text: line.trim(),
              term: name,
            });
          }
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Found forbidden overclaiming safety phrases: ${JSON.stringify(violations, null, 2)}`
    );
  });

  it('fails if retracted accuracy figures appear outside explicit retraction disclosure', () => {
    const violations: { file: string; line: number; text: string; num: string }[] = [];
    const retractedNumbers = ['92.42', '87.89', '84.4%', '77.5%'];

    for (const file of filesToScan) {
      // Exclude tests and build artifacts
      if (file.includes('__tests__') || file.includes('copy_lint.test.ts') || file.includes('guard_checks.test.ts')) {
        continue;
      }
      // Exclude vite svg icon or non-text assets
      if (file.endsWith('.svg')) continue;

      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        // Allow ONLY explicit retraction disclosure contexts
        if (
          line.toLowerCase().includes('retraction') ||
          line.toLowerCase().includes('retracted') ||
          line.includes('taylorInvSqrt')
        ) {
          return;
        }

        for (const num of retractedNumbers) {
          if (line.includes(num)) {
            violations.push({
              file: path.relative(repoRoot, file),
              line: idx + 1,
              text: line.trim(),
              num,
            });
          }
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Found retracted accuracy figures outside retraction disclosure: ${JSON.stringify(violations, null, 2)}`
    );
  });

  it('fails if any literature: tag in sim_params or code is missing from verified_sources.ts', () => {
    for (const [key, param] of Object.entries(SIM_PARAMS)) {
      if (param.tag.startsWith('literature:')) {
        assert.ok(
          isValidLiteratureTag(param.tag),
          `Parameter ${key} has unregistered literature tag: "${param.tag}"`
        );
        const sourceId = param.tag.replace('literature:', '');
        const source = VERIFIED_SOURCES[sourceId];
        assert.ok(source, `Source definition for "${sourceId}" missing from VERIFIED_SOURCES`);
        assert.ok(source.title && source.title.length > 5, `Source "${sourceId}" missing title`);
        assert.ok(source.year > 1900, `Source "${sourceId}" missing valid publication year`);
      }
    }
  });

  it('fails if any trained: or calibrated: tag lacks a model JSON and valid model card', () => {
    const modelsDir = path.resolve(webSrcRoot, 'data/models');
    assert.ok(fs.existsSync(modelsDir), 'data/models directory must exist');

    const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.json') && !f.includes('.golden.'));
    const registeredTags = new Map<string, { modelId: string; cardPath: string }>();

    for (const mf of modelFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(modelsDir, mf), 'utf8'));
      if (content.source_tag && content.card) {
        registeredTags.set(content.source_tag, {
          modelId: content.model_id,
          cardPath: path.resolve(repoRoot, content.card),
        });
      }
    }

    // Check all SIM_PARAMS calibrated/trained tags
    for (const [key, param] of Object.entries(SIM_PARAMS)) {
      if (param.tag.startsWith('calibrated:') || param.tag.startsWith('trained:')) {
        const reg = registeredTags.get(param.tag);
        assert.ok(
          reg,
          `Parameter "${key}" references tag "${param.tag}", but no model in data/models/ exports this source_tag`
        );
        assert.ok(
          fs.existsSync(reg.cardPath),
          `Model card file "${reg.cardPath}" referenced by "${param.tag}" does not exist on disk`
        );
        const cardContent = fs.readFileSync(reg.cardPath, 'utf8');
        assert.ok(cardContent.length > 100, `Model card for "${param.tag}" must be non-empty and substantive`);
      }
    }
  });
});
