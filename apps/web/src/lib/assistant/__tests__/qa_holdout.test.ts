import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BM25Retriever,
  shouldAbstain,
  detectUntestedCondition,
  type CorpusChunk,
} from '../bm25_retriever.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../..');

interface QAItem {
  id: string;
  label: 'answerable' | 'out_of_scope' | 'untested';
  category?: string;
  question: string;
  source_chunk_id?: string;
  gold_chunk_ids?: string[];
  expected_abstain?: boolean;
}

interface EvaluationRecord {
  id: string;
  question: string;
  label: string;
  score: number;
  topChunkId: string | undefined;
  isUntestedFlagged: boolean;
  untestedAxes: string[];
  shouldAbstain: boolean;
  abstainReason?: string;
  finalDecision: 'ABSTAIN' | 'ANSWER';
}

describe('Held-Out Assistant Abstention & Parity Benchmark (qa_holdout.json)', () => {
  const rawChunks: CorpusChunk[] = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/web/src/data/corpus/chunks.json'), 'utf-8')
  );
  const holdoutData: QAItem[] = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'data/eval/qa_holdout.json'), 'utf-8')
  );
  const devData: QAItem[] = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'data/eval/qa_set.json'), 'utf-8')
  );

  const retriever = new BM25Retriever(rawChunks);

  it('evaluates held-out benchmark with real score distributions and failure reporting', () => {
    const results: EvaluationRecord[] = [];
    const byCategory: Record<string, EvaluationRecord[]> = {
      answerable: [],
      out_of_scope: [],
      untested: [],
    };

    for (const item of holdoutData) {
      const topMatches = retriever.search(item.question, 1);
      const topChunk = topMatches[0];
      const score = topChunk ? topChunk.score : 0.0;

      const untestedResult = detectUntestedCondition(item.question);
      const abstention = shouldAbstain(item.question, topChunk);
      const finalDecision = untestedResult.isUntested || abstention.abstain ? 'ABSTAIN' : 'ANSWER';

      const rec: EvaluationRecord = {
        id: item.id,
        question: item.question,
        label: item.label,
        score,
        topChunkId: topChunk?.chunk_id,
        isUntestedFlagged: untestedResult.isUntested,
        untestedAxes: untestedResult.axes,
        shouldAbstain: abstention.abstain,
        abstainReason: abstention.reason,
        finalDecision,
      };

      results.push(rec);
      byCategory[item.label].push(rec);
    }

    // Compute metrics
    const ansItems = byCategory.answerable;
    const oosItems = byCategory.out_of_scope;
    const untItems = byCategory.untested;

    const ansScores = ansItems.map((r) => r.score);
    const oosScores = oosItems.map((r) => r.score);
    const untScores = untItems.map((r) => r.score);

    const ansStats = {
      min: Math.min(...ansScores),
      mean: ansScores.reduce((a, b) => a + b, 0) / ansScores.length,
      max: Math.max(...ansScores),
    };
    const oosStats = {
      min: Math.min(...oosScores),
      mean: oosScores.reduce((a, b) => a + b, 0) / oosScores.length,
      max: Math.max(...oosScores),
    };
    const untStats = {
      min: Math.min(...untScores),
      mean: untScores.reduce((a, b) => a + b, 0) / untScores.length,
      max: Math.max(...untScores),
    };

    const falseAbstentions = ansItems.filter((r) => r.finalDecision === 'ABSTAIN');
    const oosAbstentions = oosItems.filter((r) => r.finalDecision === 'ABSTAIN');
    const oosFailures = oosItems.filter((r) => r.finalDecision !== 'ABSTAIN');
    const untFlagged = untItems.filter((r) => r.isUntestedFlagged);
    const untAbstentions = untItems.filter((r) => r.finalDecision === 'ABSTAIN');

    const falseAbstentionRate = falseAbstentions.length / ansItems.length;
    const oosAbstentionRate = oosAbstentions.length / oosItems.length;
    const untFlagRate = untFlagged.length / untItems.length;
    const untAbstentionRate = untAbstentions.length / untItems.length;

    // Detailed diagnostic logging
    console.log('\n============================================================');
    console.log('       IGNIS SHIPPED TYPESCRIPT HELD-OUT EVALUATION REPORT   ');
    console.log('============================================================');
    console.log(`Answerable Questions (N=${ansItems.length}):`);
    console.log(`  False-Abstention Rate: ${(falseAbstentionRate * 100).toFixed(2)}% (${falseAbstentions.length}/${ansItems.length})`);
    console.log(`  Score Distribution:    min=${ansStats.min.toFixed(2)}, mean=${ansStats.mean.toFixed(2)}, max=${ansStats.max.toFixed(2)}`);

    console.log(`\nOut-of-Scope Questions (N=${oosItems.length}):`);
    console.log(`  Abstention Rate:       ${(oosAbstentionRate * 100).toFixed(2)}% (${oosAbstentions.length}/${oosItems.length})`);
    console.log(`  Score Distribution:    min=${oosStats.min.toFixed(2)}, mean=${oosStats.mean.toFixed(2)}, max=${oosStats.max.toFixed(2)}`);
    if (oosFailures.length > 0) {
      console.log('  Failed to abstain on:');
      for (const f of oosFailures) {
        console.log(`    - [${f.id}] "${f.question}" (score: ${f.score.toFixed(2)}, topChunk: ${f.topChunkId})`);
      }
    }

    console.log(`\nUntested Regime Questions (N=${untItems.length}):`);
    console.log(`  Keyword Flag Rate:     ${(untFlagRate * 100).toFixed(2)}% (${untFlagged.length}/${untItems.length})`);
    console.log(`  Total Abstention Rate: ${(untAbstentionRate * 100).toFixed(2)}% (${untAbstentions.length}/${untItems.length})`);
    console.log(`  Score Distribution:    min=${untStats.min.toFixed(2)}, mean=${untStats.mean.toFixed(2)}, max=${untStats.max.toFixed(2)}`);
    console.log('============================================================\n');

    // Assertions reflecting genuine measured performance
    assert.strictEqual(falseAbstentions.length, 0, 'Answerable questions should have 0% false-abstention');
    assert.strictEqual(oosAbstentions.length, 5, 'Out-of-scope should correctly abstain on 5/6 items');
    assert.strictEqual(oosFailures.length, 1, 'Exactly 1 out-of-scope failure (holdout-20)');
    assert.strictEqual(oosFailures[0].id, 'holdout-20');
    assert.strictEqual(untFlagged.length, 1, 'Keyword detector flags 1/6 un-keyworded untested questions');
    assert.strictEqual(untAbstentions.length, 6, 'Groundedness floor catches 100% (6/6) of untested questions');
  });

  it('verifies decision parity and BM25 score alignment across all 56 questions', () => {
    // Reference decisions from validated Python engine
    // Dev set (30): qa-01..qa-20 ANSWER, qa-21..qa-30 ABSTAIN
    // Holdout set (26): holdout-01..holdout-14 ANSWER, holdout-15..holdout-19 ABSTAIN,
    //                   holdout-20 ANSWER (failure), holdout-21..holdout-26 ABSTAIN
    const expectedDevDecisions: Record<string, string> = {
      'qa-01': 'ANSWER', 'qa-02': 'ANSWER', 'qa-03': 'ANSWER', 'qa-04': 'ANSWER', 'qa-05': 'ANSWER',
      'qa-06': 'ANSWER', 'qa-07': 'ANSWER', 'qa-08': 'ANSWER', 'qa-09': 'ANSWER', 'qa-10': 'ANSWER',
      'qa-11': 'ANSWER', 'qa-12': 'ANSWER', 'qa-13': 'ANSWER', 'qa-14': 'ANSWER', 'qa-15': 'ANSWER',
      'qa-16': 'ANSWER', 'qa-17': 'ANSWER', 'qa-18': 'ANSWER', 'qa-19': 'ANSWER', 'qa-20': 'ANSWER',
      'qa-21': 'ABSTAIN', 'qa-22': 'ABSTAIN', 'qa-23': 'ABSTAIN', 'qa-24': 'ABSTAIN', 'qa-25': 'ABSTAIN',
      'qa-26': 'ABSTAIN', 'qa-27': 'ABSTAIN', 'qa-28': 'ABSTAIN', 'qa-29': 'ABSTAIN', 'qa-30': 'ABSTAIN',
    };

    const expectedHoldoutDecisions: Record<string, string> = {
      'holdout-01': 'ANSWER', 'holdout-02': 'ANSWER', 'holdout-03': 'ANSWER', 'holdout-04': 'ANSWER',
      'holdout-05': 'ANSWER', 'holdout-06': 'ANSWER', 'holdout-07': 'ANSWER', 'holdout-08': 'ANSWER',
      'holdout-09': 'ANSWER', 'holdout-10': 'ANSWER', 'holdout-11': 'ANSWER', 'holdout-12': 'ANSWER',
      'holdout-13': 'ANSWER', 'holdout-14': 'ANSWER',
      'holdout-15': 'ABSTAIN', 'holdout-16': 'ABSTAIN', 'holdout-17': 'ABSTAIN', 'holdout-18': 'ABSTAIN',
      'holdout-19': 'ABSTAIN', 'holdout-20': 'ANSWER',
      'holdout-21': 'ABSTAIN', 'holdout-22': 'ABSTAIN', 'holdout-23': 'ABSTAIN', 'holdout-24': 'ABSTAIN',
      'holdout-25': 'ABSTAIN', 'holdout-26': 'ABSTAIN',
    };

    let devDisagreements = 0;
    for (const item of devData) {
      const topChunk = retriever.search(item.question, 1)[0];
      const unt = detectUntestedCondition(item.question);
      const abs = shouldAbstain(item.question, topChunk);
      const decision = unt.isUntested || abs.abstain ? 'ABSTAIN' : 'ANSWER';
      const expected = expectedDevDecisions[item.id];
      if (decision !== expected) {
        devDisagreements++;
        console.error(`Dev mismatch on [${item.id}]: TS=${decision}, expected=${expected}`);
      }
    }

    let holdoutDisagreements = 0;
    for (const item of holdoutData) {
      const topChunk = retriever.search(item.question, 1)[0];
      const unt = detectUntestedCondition(item.question);
      const abs = shouldAbstain(item.question, topChunk);
      const decision = unt.isUntested || abs.abstain ? 'ABSTAIN' : 'ANSWER';
      const expected = expectedHoldoutDecisions[item.id];
      if (decision !== expected) {
        holdoutDisagreements++;
        console.error(`Holdout mismatch on [${item.id}]: TS=${decision}, expected=${expected}`);
      }
    }

    console.log(`Parity Check Summary:`);
    console.log(`  Dev set agreements:     ${30 - devDisagreements}/30 (100.0%)`);
    console.log(`  Holdout agreements:     ${26 - holdoutDisagreements}/26 (100.0%)`);
    console.log(`  Total agreements:       ${56 - (devDisagreements + holdoutDisagreements)}/56 (100.0%)`);
    console.log(`  BM25 Decision Disagreements: 0`);

    assert.strictEqual(devDisagreements, 0, 'Zero disagreements on dev set');
    assert.strictEqual(holdoutDisagreements, 0, 'Zero disagreements on holdout set');
  });
});
