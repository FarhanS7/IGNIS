import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RealSolidMatcher } from '../real_solid_matcher.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../..');
const webSrcRoot = path.resolve(__dirname, '../../..');

function getSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '__tests__') {
        getSourceFiles(fullPath, fileList);
      }
    } else if (/\.(tsx?|jsx?|html)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('Honesty Guards & Copy Lint Test', () => {
  const sourceFiles = getSourceFiles(webSrcRoot);
  const readmePath = path.join(repoRoot, 'README.md');

  const allFilesToCheck = [...sourceFiles];
  if (fs.existsSync(readmePath)) {
    allFilesToCheck.push(readmePath);
  }

  test('No use of "Telemetry Verified"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/telemetry verified/i.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden phrase "Telemetry Verified":\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "zero hallucination"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/zero.*hallucination/i.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden phrase "zero hallucination":\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "Safety Score"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/safety score/i.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden phrase "Safety Score":\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "% risk"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/% risk/i.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden phrase "% risk":\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "safe" as a verdict', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const verdictRegex = /\b(verdict[:\s]+safe|rated as safe|classified as safe|is safe to|safe to operate)\b/i;
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (verdictRegex.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden verdict "safe":\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "prediction" about outcomes', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const predRegex = /\bpredict(ion|s|ed|ing)?\s+(about\s+)?(outcome|extinction|ignition|burn)\b/i;
    const outcomePredRegex = /\boutcome\s+prediction\b/i;
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (predRegex.test(line) || outcomePredRegex.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden outcome prediction claim:\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "flame spread" for BASS-II frame-based labels', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const bassRegex = /BASS.*flame spread/i;
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (bassRegex.test(line) && !line.includes('BASS-II ReadMe')) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found forbidden "flame spread" term applied to BASS:\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No uncomputed "real NASA data" claims', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of allFilesToCheck) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/\breal NASA data\b/i.test(line)) {
          violations.push({ file: path.relative(repoRoot, file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found uncomputed "real NASA data" claim:\n${JSON.stringify(violations, null, 2)}`
    );
  });
  test('No retracted accuracy numbers outside explicit retraction context', () => {
    const retractedNumbers = ['92.42', '87.89', '84.4%', '77.5%'];
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          line.includes('Retraction') ||
          line.includes('retraction') ||
          line.includes('retracted') ||
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
            });
          }
        }
      });
    }

    assert.strictEqual(
      violations.length,
      0,
      `Found retracted accuracy numbers outside retraction context:\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('No use of "Live Physical Reaction"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/live physical reaction/i.test(line)) {
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
      `Found forbidden phrase "Live Physical Reaction":\n${JSON.stringify(violations, null, 2)}`
    );
  });

  test('Every item in data/eval/qa_set.json has a valid category', () => {
    const qaSetPath = path.join(repoRoot, 'data/eval/qa_set.json');
    const qaSet = JSON.parse(fs.readFileSync(qaSetPath, 'utf8'));
    const validCategories = new Set(['answerable', 'out_of_scope', 'untested_condition']);

    for (const item of qaSet) {
      assert.ok(
        validCategories.has(item.category),
        `Item ${item.id} has invalid category "${item.category}"`
      );
    }
  });

  test('Usable runs reported in README matches usable runs in matcher (132)', () => {
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    assert.ok(
      readmeContent.includes('132 usable solid') ||
      readmeContent.includes('132 real spaceflight tests') ||
      readmeContent.includes('106/132'),
      'README does not mention 132 usable solid runs'
    );
    const solidData = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'apps/web/src/data/evidence_solid.json'), 'utf8')
    );
    const materialMap = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'apps/web/src/data/material_map.json'), 'utf8')
    );
    const matcher = new RealSolidMatcher(solidData, materialMap);
    assert.strictEqual(matcher.usableRuns.length, 132);
  });
});
