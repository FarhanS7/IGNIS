import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fireLibDir = path.resolve(__dirname, '..');
const componentsDir = path.resolve(__dirname, '../../../components/response');
const pagesDir = path.resolve(__dirname, '../../../pages');

function getSourceFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
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

test('Fire Response Console Honesty & Copy Lint', async (t) => {
  const targetFiles: string[] = [];
  getSourceFiles(fireLibDir, targetFiles);
  getSourceFiles(componentsDir, targetFiles);

  // Also include ResponseConsolePage if it exists
  const responseConsolePage = path.join(pagesDir, 'ResponseConsolePage.tsx');
  if (fs.existsSync(responseConsolePage)) {
    targetFiles.push(responseConsolePage);
  }

  assert.ok(targetFiles.length > 0, 'Should find fire response source files');

  await t.test('bans incorrect SAME expansion (SAME is Smoke Aerosol Measurement Experiment)', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const bannedPattern = new RegExp(['Spacecraft', 'Atmosphere', 'Monitor'].join('\\s+'), 'i');
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (bannedPattern.test(line)) {
          violations.push({ file: path.basename(file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.deepEqual(violations, [], `Found forbidden phrase in: ${JSON.stringify(violations)}`);
  });

  await t.test('bans "guaranteed" and "100% safe"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/\bguaranteed\b/i.test(line) || /100%\s*safe/i.test(line)) {
          violations.push({ file: path.basename(file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.deepEqual(violations, [], `Found overclaiming safety phrase in: ${JSON.stringify(violations)}`);
  });

  await t.test('bans "flight-certified"', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/flight-certified/i.test(line)) {
          violations.push({ file: path.basename(file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.deepEqual(violations, [], `Found forbidden phrase "flight-certified" in: ${JSON.stringify(violations)}`);
  });

  await t.test('bans "predicts fire risk" and flame extinction prediction claims in simulator', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          /predicts\s+(?:fire\s+)?risk/i.test(line) ||
          /predicts\s+(?:flame\s+)?extinction/i.test(line) ||
          /predicts\s+whether\s+flame\s+extinguishes/i.test(line)
        ) {
          violations.push({ file: path.basename(file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.deepEqual(violations, [], `Found forbidden prediction claim in: ${JSON.stringify(violations)}`);
  });

  await t.test('bans percentage confidence and confidenceScore fields in fire domain types', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/\bconfidenceScore\b/.test(line) || /\d+%\s*confidence\b/i.test(line)) {
          violations.push({ file: path.basename(file), line: idx + 1, text: line.trim() });
        }
      });
    }
    assert.deepEqual(violations, [], `Found forbidden percentage confidence in: ${JSON.stringify(violations)}`);
  });
});
