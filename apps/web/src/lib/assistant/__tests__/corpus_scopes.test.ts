import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  BM25Retriever,
  shouldAbstain,
  detectUntestedCondition,
  type CorpusChunk,
} from '../bm25_retriever.ts';
import {
  DEFAULT_CORPUS_PROMPTS,
  filterChunksByScope,
  formatMatchMaterial,
} from '../corpus_scopes.ts';
import rawChunks from '../../../data/corpus/chunks.json' with { type: 'json' };

describe('Corpus Scopes & Default Curated Prompts', () => {
  const chunks = rawChunks as unknown as CorpusChunk[];

  it('filters corpus chunks cleanly for solid and acme scopes', () => {
    const solid = filterChunksByScope(chunks, 'solid');
    const acme = filterChunksByScope(chunks, 'acme');
    const global = filterChunksByScope(chunks, 'global');

    assert.strictEqual(global.length, chunks.length);
    assert.ok(solid.length > 100 && solid.length < chunks.length);
    assert.ok(acme.length > 100 && acme.length < chunks.length);
    assert.ok(solid.some((c) => c.doc_id.startsWith('PSI-25')));
    assert.ok(acme.every((c) => /^(PSI-10|PSI-23)/i.test(c.doc_id)));
  });

  it('every curated prompt either retrieves grounded citations or explicitly tests Moon/Mars gaps', () => {
    const retriever = new BM25Retriever(chunks);

    for (const prompt of DEFAULT_CORPUS_PROMPTS) {
      const top = retriever.search(prompt, 1)[0];
      const untested = detectUntestedCondition(prompt);
      const abstention = shouldAbstain(prompt, top);

      if (prompt.includes('Moon') || prompt.includes('Mars')) {
        assert.strictEqual(untested.isUntested, true, `Expected untested flag on: ${prompt}`);
      } else {
        assert.strictEqual(
          abstention.abstain,
          false,
          `Expected curated prompt not to abstain (${prompt}): score=${top?.score}, reason=${abstention.reason}`
        );
      }
    }
  });

  it('formats material names reliably from RealSolidMatch metadata', () => {
    assert.strictEqual(
      formatMatchMaterial({ metadata: { material_family: 'PMMA' } }),
      'PMMA'
    );
    assert.strictEqual(
      formatMatchMaterial({ factors: { material: { experiment_value: 'SIBAL cloth' } } }),
      'SIBAL cloth'
    );
    assert.strictEqual(formatMatchMaterial({}), 'Solid material');
  });
});

