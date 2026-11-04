import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root of apps/web
const webRoot = path.resolve(__dirname, '../../../../');
const srcDir = path.resolve(webRoot, 'src');
const packageJsonPath = path.resolve(webRoot, 'package.json');

function getAllTestFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      // Normalize relative path from webRoot with forward slashes
      const rel = path.relative(webRoot, fullPath).replace(/\\/g, '/');
      files.push(rel);
    }
  }
  return files;
}

describe('Test Runner Completeness Registry', () => {
  it('ensures every *.test.ts in apps/web/src is accounted for in package.json test script', () => {
    assert.ok(fs.existsSync(packageJsonPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const testScript: string = pkg.scripts?.test || '';

    const testFilesOnDisk = getAllTestFiles(srcDir);
    assert.ok(testFilesOnDisk.length > 0, 'Must have at least one test file on disk');

    const usesGlob = testScript.includes('src/**/*.test.ts');

    if (usesGlob) {
      // All discovered files must start with src/ and end with .test.ts
      for (const file of testFilesOnDisk) {
        assert.ok(
          file.startsWith('src/') && file.endsWith('.test.ts'),
          `File ${file} should match glob src/**/*.test.ts`
        );
      }
    } else {
      // Must explicitly mention each test file
      const missingFiles = testFilesOnDisk.filter((file) => !testScript.includes(file));
      assert.deepEqual(
        missingFiles,
        [],
        `The following test files on disk are missing from package.json test script: ${missingFiles.join(', ')}`
      );
    }
  });
});
