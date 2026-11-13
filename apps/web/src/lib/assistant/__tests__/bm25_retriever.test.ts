import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  BM25Retriever,
  tokenize,
  extractScenarioFromQuestion,
  shouldAbstain,
  detectUntestedCondition,
  type CorpusChunk,
} from '../bm25_retriever.ts';
import rawChunks from '../../../data/corpus/chunks.json' with { type: 'json' };

describe('BM25 Retriever and Domain Synonyms', () => {
  const sampleChunks: CorpusChunk[] = [
    {
      chunk_id: 'BASS2-O2-CAL',
      doc_id: 'PSI-25-BASS2-README',
      title: 'BASS-II Experiment ReadMe',
      year: '2016',
      page: 2,
      text: 'Calibrated initial and final O2: The O2 sensor was out of calibration, so the MCA ISS reading was used to correct the initial ISS "air" reading of the sensor for the day via a constant offset.',
      source_url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
    },
    {
      chunk_id: 'SAFFIRE-SIBAL',
      doc_id: 'PSI-100-README',
      title: 'SAFFIRE-I and SAFFIRE-III Readme',
      year: '2017',
      page: 1,
      text: 'The sample material for SAFFIRE-I is a composite fabric consisting of cotton on a fiberglass substrate called SIBAL cloth. SAFFIRE-I will be conducted at an air flow velocity of 20 cm/s.',
      source_url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-100',
    },
    {
      chunk_id: 'FIST-EXPLORATION',
      doc_id: 'NTRS-20080013149',
      title: 'Piloted Ignition Delay of PMMA in Space Exploration Atmospheres',
      year: '2008',
      page: 1,
      text: 'The proposed space exploration atmosphere uses a total cabin pressure of 52.7 to 58.6 kPa with an oxygen concentration of 30 to 34% by volume to reduce decompression sickness.',
      source_url: 'https://ntrs.nasa.gov/citations/20080013149',
    },
  ];

  it('tokenizes text and filters English stop words', () => {
    const tokens = tokenize('The ignition was observed at 21% O2 in microgravity.');
    assert.ok(tokens.includes('ignition'));
    assert.ok(tokens.includes('21%'));
    assert.ok(tokens.includes('o2'));
    assert.ok(tokens.includes('microgravity'));
    assert.strictEqual(tokens.includes('the'), false);
    assert.strictEqual(tokens.includes('was'), false);
    assert.strictEqual(tokens.includes('at'), false);
  });

  it('retrieves relevant chunk using domain synonym expansion (oxygen -> o2)', () => {
    const retriever = new BM25Retriever(sampleChunks);
    const results = retriever.search('What happened to oxygen sensor calibration?');
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].chunk_id, 'BASS2-O2-CAL');
    assert.ok(results[0].score > 0);
    assert.ok(results[0].highlighted_snippets.length > 0);
  });

  it('retrieves Saffire SIBAL chunk for cotton fabric flow questions', () => {
    const retriever = new BM25Retriever(sampleChunks);
    const results = retriever.search('cotton fabric airflow velocity in Saffire');
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].chunk_id, 'SAFFIRE-SIBAL');
  });

  it('extracts structured scenario parameters from natural language questions', () => {
    const parsed = extractScenarioFromQuestion('How does PMMA burn at 34% O2 with 10 cm/s airflow in 0 g?');
    assert.ok(parsed);
    assert.strictEqual(parsed.material, 'PMMA');
    assert.strictEqual(parsed.oxygen_pct, 34.0);
    assert.strictEqual(parsed.flow_cm_s, 10.0);
    assert.strictEqual(parsed.gravity_g, 0.0);
  });

  it('extracts Lunar and Mars conditions from text mentions', () => {
    const lunar = extractScenarioFromQuestion('Will Nomex ignite in lunar habitat at 56 kPa?');
    assert.ok(lunar);
    assert.strictEqual(lunar.material, 'Nomex');
    assert.strictEqual(lunar.gravity_g, 0.16);
    assert.strictEqual(lunar.pressure_kpa, 56.0);

    const mars = extractScenarioFromQuestion('What is fire spread rate in Mars habitat?');
    assert.ok(mars);
    assert.strictEqual(mars.gravity_g, 0.38);
  });

  it('abstains on out-of-scope questions with insufficient grounding on real corpus', () => {
    const retriever = new BM25Retriever(rawChunks as unknown as CorpusChunk[]);
    // Apollo battery question
    const oosQuery = 'What was the battery chemistry and cell capacity of the Apollo Lunar Roving Vehicle?';
    const top = retriever.search(oosQuery, 1)[0];
    const abstention = shouldAbstain(oosQuery, top);
    assert.strictEqual(abstention.abstain, true);
    assert.ok(abstention.reason);
  });

  it('does NOT abstain on answerable questions with strong grounding on real corpus', () => {
    const retriever = new BM25Retriever(rawChunks as unknown as CorpusChunk[]);
    const ansQuery = 'What is the composition of SIBAL cloth, and what forced airflow velocities were planned for Saffire-I?';
    const top = retriever.search(ansQuery, 1)[0];
    const abstention = shouldAbstain(ansQuery, top);
    assert.strictEqual(abstention.abstain, false);
    assert.ok(top.score >= 12.0);
  });

  it('detects untested environmental boundary conditions', () => {
    const lunar = detectUntestedCondition('What is the flame spread rate of PMMA under Lunar partial gravity (0.16 g)?');
    assert.strictEqual(lunar.isUntested, true);
    assert.ok(lunar.axes.includes('gravity (0.16 g)'));

    const mars = detectUntestedCondition('Does cast PMMA extinguish in a Mars surface habitat (0.38 g, 70 kPa)?');
    assert.strictEqual(mars.isUntested, true);
    assert.ok(mars.axes.includes('gravity (0.38 g)'));
    assert.ok(mars.axes.includes('pressure (70 kPa)'));

    const pureO2 = detectUntestedCondition('Flame extinction under pure oxygen (100% O2) at 300 kPa');
    assert.strictEqual(pureO2.isUntested, true);
    assert.ok(pureO2.axes.includes('O2 (100%)'));
    assert.ok(pureO2.axes.includes('pressure (300 kPa)'));

    const normal = detectUntestedCondition('What happens to a PMMA flame in microgravity?');
    assert.strictEqual(normal.isUntested, false);
  });
});
