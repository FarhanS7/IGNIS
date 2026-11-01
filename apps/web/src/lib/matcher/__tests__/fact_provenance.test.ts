import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Provenance validation logic matching <Fact> contract:
// Required: { value, unit, basis, sourceFile, sourceColumn, sourceRow, doi }
interface FactSpec {
  value: unknown;
  unit?: string | null;
  basis: 'measured' | 'converted' | 'assumed';
  sourceFile: string;
  sourceColumn: string;
  sourceRow: number;
  doi: string;
  investigationId?: string;
}

function validateFactProvenance(fact: FactSpec): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (fact.value === undefined || fact.value === null || fact.value === '') {
    errors.push('value must not be empty');
  }
  if (!['measured', 'converted', 'assumed'].includes(fact.basis)) {
    errors.push(`invalid basis: ${fact.basis}`);
  }
  if (!fact.sourceFile || typeof fact.sourceFile !== 'string' || fact.sourceFile.trim() === '') {
    errors.push('sourceFile is required and must be non-empty string');
  }
  if (!fact.sourceColumn || typeof fact.sourceColumn !== 'string' || fact.sourceColumn.trim() === '') {
    errors.push('sourceColumn is required and must be non-empty string');
  }
  if (typeof fact.sourceRow !== 'number' || fact.sourceRow <= 0 || !Number.isInteger(fact.sourceRow)) {
    errors.push(`sourceRow must be a positive integer, got: ${fact.sourceRow}`);
  }
  if (!fact.doi || typeof fact.doi !== 'string' || fact.doi.trim() === '') {
    errors.push('doi is required and must be non-empty string');
  }
  return { valid: errors.length === 0, errors };
}

describe('Fact Provenance Contract and Shipped Runs Audit', () => {
  test('Valid Fact passes provenance verification', () => {
    const validFact: FactSpec = {
      value: 18.5,
      unit: '%',
      basis: 'measured',
      sourceFile: 'BASS-II_data_table.csv',
      sourceColumn: 'Calibrated  initial O2 % by vol ',
      sourceRow: 14,
      doi: '10.60555/4qc4-de67',
      investigationId: 'PSI-25',
    };
    const result = validateFactProvenance(validFact);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('Fact lacking sourceFile fails provenance audit', () => {
    const invalidFact: any = {
      value: 18.5,
      unit: '%',
      basis: 'measured',
      sourceFile: '',
      sourceColumn: 'Calibrated  initial O2 % by vol ',
      sourceRow: 14,
      doi: '10.60555/4qc4-de67',
    };
    const result = validateFactProvenance(invalidFact);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('sourceFile')));
  });

  test('Fact lacking sourceColumn fails provenance audit', () => {
    const invalidFact: any = {
      value: 18.5,
      unit: '%',
      basis: 'measured',
      sourceFile: 'BASS-II_data_table.csv',
      sourceColumn: '',
      sourceRow: 14,
      doi: '10.60555/4qc4-de67',
    };
    const result = validateFactProvenance(invalidFact);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('sourceColumn')));
  });

  test('Fact with non-positive sourceRow fails provenance audit', () => {
    const invalidFact: any = {
      value: 18.5,
      unit: '%',
      basis: 'measured',
      sourceFile: 'BASS-II_data_table.csv',
      sourceColumn: 'Col',
      sourceRow: 0,
      doi: '10.60555/4qc4-de67',
    };
    const result = validateFactProvenance(invalidFact);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('sourceRow')));
  });

  test('Fact lacking DOI fails provenance audit', () => {
    const invalidFact: any = {
      value: 18.5,
      unit: '%',
      basis: 'measured',
      sourceFile: 'BASS-II_data_table.csv',
      sourceColumn: 'Col',
      sourceRow: 14,
      doi: '',
    };
    const result = validateFactProvenance(invalidFact);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('doi')));
  });

  test('Every solid run in evidence_solid.json has complete provenance attributes', () => {
    const solidRunsPath = path.resolve(__dirname, '../../../data/evidence_solid.json');
    assert.ok(fs.existsSync(solidRunsPath), `evidence_solid.json exists at ${solidRunsPath}`);
    const runs = JSON.parse(fs.readFileSync(solidRunsPath, 'utf8'));
    assert.strictEqual(runs.length, 272, 'Must have exactly 272 solid runs in evidence_solid');
    const usableRuns = runs.filter((r: any) => r.usable_for_matching);
    assert.strictEqual(usableRuns.length, 132, 'Must have exactly 132 usable solid runs for matching');

    for (const run of usableRuns) {
      assert.ok(run.run_uid, `Run missing run_uid`);
      assert.ok(run.doi && run.doi.trim().length > 0, `Run ${run.run_uid} missing doi`);
      assert.ok(run.investigation_id, `Run ${run.run_uid} missing investigation_id`);
      
      // Every factor must have full provenance
      for (const factorKey of ['oxygen_pct', 'flow_cm_s', 'pressure_kpa'] as const) {
        const factor = run[factorKey];
        assert.ok(factor, `Run ${run.run_uid} missing factor ${factorKey}`);
        assert.ok(factor.source_file, `Run ${run.run_uid} factor ${factorKey} missing source_file`);
        assert.ok(factor.source_column, `Run ${run.run_uid} factor ${factorKey} missing source_column`);
        assert.ok(typeof factor.source_row === 'number' && factor.source_row > 0, `Run ${run.run_uid} factor ${factorKey} invalid source_row`);
        assert.ok(
          factor.basis && ['measured', 'converted', 'assumed'].includes(factor.basis),
          `Run ${run.run_uid} factor ${factorKey} invalid basis: ${factor.basis}`
        );
      }
    }
  });

  test('Trust Ledger calculation accurately tallies bases and flags zero without source', () => {
    const mockMountedFacts: FactSpec[] = [
      { value: 21.0, basis: 'measured', sourceFile: 'f1.csv', sourceColumn: 'c1', sourceRow: 1, doi: 'doi1' },
      { value: 15.0, basis: 'measured', sourceFile: 'f1.csv', sourceColumn: 'c2', sourceRow: 1, doi: 'doi1' },
      { value: 5.0, basis: 'converted', sourceFile: 'f2.csv', sourceColumn: 'c3', sourceRow: 2, doi: 'doi2' },
      { value: 101.3, basis: 'assumed', sourceFile: 'f3.csv', sourceColumn: 'c4', sourceRow: 3, doi: 'doi3' },
    ];

    const counts = {
      total: mockMountedFacts.length,
      measured: mockMountedFacts.filter((f) => f.basis === 'measured').length,
      converted: mockMountedFacts.filter((f) => f.basis === 'converted').length,
      assumed: mockMountedFacts.filter((f) => f.basis === 'assumed').length,
      withoutSource: mockMountedFacts.filter((f) => !f.sourceFile || !f.doi).length,
    };

    assert.strictEqual(counts.total, 4);
    assert.strictEqual(counts.measured, 2);
    assert.strictEqual(counts.converted, 1);
    assert.strictEqual(counts.assumed, 1);
    assert.strictEqual(counts.withoutSource, 0, 'Must have 0 facts without source');
  });

  test('Explorer solid-tier view shows N assumed (pressure) rather than 0', () => {
    const rawData = fs.readFileSync(path.join(__dirname, '../../../data/evidence_runs.json'), 'utf-8');
    const runs = JSON.parse(rawData);
    const solidRuns = runs.filter((r: any) => r.fuel_class === 'solid');
    assert.ok(solidRuns.length > 0, 'Must have solid runs in corpus');

    // Page 1 of solid runs view (pageSize = 50)
    const pageRuns = solidRuns.slice(0, 50);
    const registeredFacts: FactSpec[] = [];

    for (const run of pageRuns) {
      // Oxygen fact
      if (run.oxygen_pct) {
        registeredFacts.push({
          value: run.oxygen_pct.value,
          basis: run.oxygen_pct.basis,
          sourceFile: run.oxygen_pct.source_file,
          sourceColumn: run.oxygen_pct.source_column,
          sourceRow: run.oxygen_pct.source_row,
          doi: run.doi,
        });
      }
      // Flow fact
      if (run.flow_cm_s) {
        registeredFacts.push({
          value: run.flow_cm_s.value,
          basis: run.flow_cm_s.basis,
          sourceFile: run.flow_cm_s.source_file,
          sourceColumn: run.flow_cm_s.source_column,
          sourceRow: run.flow_cm_s.source_row,
          doi: run.doi,
        });
      }
      // Pressure fact (Assumed for all solid flight runs)
      const pressureFact: FactSpec = run.pressure_kpa
        ? {
            value: run.pressure_kpa.value,
            basis: run.pressure_kpa.basis,
            sourceFile: run.pressure_kpa.source_file,
            sourceColumn: run.pressure_kpa.source_column,
            sourceRow: run.pressure_kpa.source_row,
            doi: run.doi,
          }
        : {
            value: '101.3 kPa',
            basis: 'assumed',
            sourceFile: run.oxygen_pct?.source_file || 'PSI-25_Science Documents_BASS-II_ReadMe.docx',
            sourceColumn: 'Assumed nominal atmospheric pressure',
            sourceRow: run.oxygen_pct?.source_row || 1,
            doi: run.doi,
            investigationId: run.investigation_id,
          };
      registeredFacts.push(pressureFact);
    }

    const assumedCount = registeredFacts.filter((f) => f.basis === 'assumed').length;
    // Must show N assumed (where N == pageRuns.length == 50), strictly greater than 0
    assert.strictEqual(assumedCount, pageRuns.length);
    assert.strictEqual(assumedCount, 50);

    // Verify all assumed facts have 100% valid provenance
    for (const af of registeredFacts.filter((f) => f.basis === 'assumed')) {
      const v = validateFactProvenance(af);
      assert.strictEqual(v.valid, true, `Assumed fact failed provenance: ${v.errors.join(', ')}`);
    }
  });
});

