import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../../');

// 1. Check generated story data fixtures exist and are valid JSON
const storyDir = path.resolve(repoRoot, 'apps/web/src/data/story');
const c1Data = JSON.parse(fs.readFileSync(path.join(storyDir, 'chapter1_droplets.json'), 'utf8'));
const c2Data = JSON.parse(fs.readFileSync(path.join(storyDir, 'chapter2_atmosphere.json'), 'utf8'));
const c3Data = JSON.parse(fs.readFileSync(path.join(storyDir, 'chapter3_smoke.json'), 'utf8'));
const c4Data = JSON.parse(fs.readFileSync(path.join(storyDir, 'chapter4_gaps.json'), 'utf8'));

// 2. Load corpus chunks for quote validation
const chunksMap = new Map<string, string>();
const chunksFile = path.resolve(repoRoot, 'data/corpus/chunks.jsonl');
const chunkLines = fs.readFileSync(chunksFile, 'utf8').trim().split('\n');
for (const line of chunkLines) {
  if (!line.trim()) continue;
  const chunk = JSON.parse(line);
  chunksMap.set(chunk.chunk_id, chunk.text);
}

import { CHAPTER_REGISTRY } from '../chapters/index.ts';

test('Story Grounding: Manifest Integrity & Cryptographic Hashes', () => {
  const manifestPath = path.resolve(repoRoot, 'apps/web/src/data/story/story_data_manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'story_data_manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const [relPath, expectedHash] of Object.entries(manifest.outputs as Record<string, string>)) {
    const fullPath = path.resolve(repoRoot, relPath);
    assert.ok(fs.existsSync(fullPath), `Generated file ${relPath} must exist`);
    const fileBytes = fs.readFileSync(fullPath);
    const actualHash = crypto.createHash('sha256').update(fileBytes).digest('hex');
    assert.equal(actualHash, expectedHash, `SHA-256 hash mismatch for ${relPath}`);
  }
});

test('Story Grounding: Chapter 1 (FLEX Droplets)', () => {
  assert.ok(c1Data.runs.length > 50, 'Chapter 1 must have at least 50 real flight droplet runs');

  // Verify quote is a verbatim substring of chunk (strict, no normalization)
  const chunkText = chunksMap.get(c1Data.citation.chunk_id);
  assert.ok(chunkText, `Chunk ${c1Data.citation.chunk_id} must exist in corpus`);
  assert.ok(
    chunkText.includes(c1Data.citation.verbatim_quote),
    'Chapter 1 quote must be a strict verbatim substring of its referenced chunk'
  );

  // Verify first and sample runs against source file
  const firstRun = c1Data.runs[0];
  assert.equal(firstRun.test_number, 1);
  assert.equal(firstRun.fuel, 'Methanol');
  assert.ok(firstRun.initial_diameter_mm > 0);
  assert.ok(firstRun.burn_time_s > 0);
  assert.ok(fs.existsSync(path.resolve(repoRoot, firstRun.source_file)));
});

test('Story Grounding: Chapter 2 (BASS-II Solid Burns)', () => {
  assert.ok(c2Data.runs.length > 50, 'Chapter 2 must have at least 50 real solid burn runs');

  // Verify quote is a verbatim substring of chunk (strict, no normalization)
  const chunkText = chunksMap.get(c2Data.citation.chunk_id);
  assert.ok(chunkText, `Chunk ${c2Data.citation.chunk_id} must exist in corpus`);
  assert.ok(
    chunkText.includes(c2Data.citation.verbatim_quote),
    'Chapter 2 quote must be a strict verbatim substring of its referenced chunk'
  );

  // Verify envelope bounds match real_solid_matcher constants
  assert.equal(c2Data.envelope_summary.min_o2_pct, 13.6);
  assert.equal(c2Data.envelope_summary.max_o2_pct, 22.2);
  assert.equal(c2Data.envelope_summary.min_flow_cm_s, 0.0);
  assert.equal(c2Data.envelope_summary.max_flow_cm_s, 28.18);

  // Verify flow basis is converted
  const firstRun = c2Data.runs[0];
  assert.equal(firstRun.flow_basis, 'converted');
  assert.ok(firstRun.source_row > 0);
});

test('Story Grounding: Chapter 3 (SAME-R Smoke & Detector)', () => {
  assert.ok(c3Data.runs.length > 30, 'Chapter 3 must have real SAME-R smoke detection runs');

  // Verify quote is a verbatim substring of chunk (strict, no normalization)
  const chunkText = chunksMap.get(c3Data.citation.chunk_id);
  assert.ok(chunkText, `Chunk ${c3Data.citation.chunk_id} must exist in corpus`);
  assert.ok(
    chunkText.includes(c3Data.citation.verbatim_quote),
    'Chapter 3 quote must be a strict verbatim substring of its referenced chunk'
  );

  // Platform and run count checks
  assert.equal(c3Data.platform, 'International Space Station (ISS)');
  assert.ok(c3Data.run_count_explanation);

  // Verify sample materials are real spacecraft materials
  const materials = new Set(c3Data.runs.map((r: { sample_material: string }) => r.sample_material));
  assert.ok(materials.has('Kapton'));
  assert.ok(materials.has('Silicone'));
  assert.ok(materials.has('Teflon'));
});

test('Story Grounding: Chapter 4 (NASA Tested Envelope & Gaps)', () => {
  // Verify quote is a verbatim substring of chunk (strict, no normalization)
  const chunkText = chunksMap.get(c4Data.citation.chunk_id);
  assert.ok(chunkText, `Chunk ${c4Data.citation.chunk_id} must exist in corpus`);
  assert.ok(
    chunkText.includes(c4Data.citation.verbatim_quote),
    'Chapter 4 quote must be a strict verbatim substring of its referenced chunk'
  );

  // Verify tested envelope notes
  assert.equal(c4Data.tested_envelope.gravity.tested, '0.0g (ISS orbit only)');
  assert.equal(c4Data.tested_envelope.pressure.tested, '101.3 kPa (assumed, not measured)');
  assert.equal(c4Data.tested_envelope.oxygen.tested_min_pct, 13.6);
  assert.equal(c4Data.tested_envelope.oxygen.tested_max_pct, 22.2);
});

test('Story Grounding: All 4 Chapters Conformance (Beats, Words, Provenance, Takeaways)', () => {
  assert.equal(CHAPTER_REGISTRY.length, 4, 'Must have exactly 4 registered chapters');

  // Load all flight run IDs
  const c1RunIds = new Set(c1Data.runs.map((r: { run_id: string }) => r.run_id));
  const c2RunIds = new Set(c2Data.runs.map((r: { run_uid: string }) => r.run_uid));
  const c3RunIds = new Set(c3Data.runs.map((r: { test_id: string }) => r.test_id));

  CHAPTER_REGISTRY.forEach((chapter, chIdx) => {
    // 1. Length constraint: 4 to 6 beats per chapter
    assert.ok(
      chapter.beats.length >= 4 && chapter.beats.length <= 6,
      `Chapter ${chapter.number} must have between 4 and 6 beats (got ${chapter.beats.length})`
    );

    // 2. Clear end: 3 bullet takeaways
    assert.ok(
      Array.isArray(chapter.takeaways) && chapter.takeaways.length === 3,
      `Chapter ${chapter.number} must have exactly 3 bullet takeaways`
    );

    // 3. Every beat body max 35 words
    chapter.beats.forEach((beat, bIdx) => {
      const fullBodyText = beat.layer1.paragraphs.join(' ');
      const wordCount = fullBodyText.split(/\s+/).filter(Boolean).length;
      assert.ok(
        wordCount <= 35,
        `Chapter ${chapter.number} Beat ${bIdx + 1} ("${beat.id}") body exceeds 35 words (${wordCount} words): "${fullBodyText}"`
      );

      // 4. Provenance drawer on every beat
      assert.ok(
        Boolean(beat.provenance),
        `Chapter ${chapter.number} Beat ${bIdx + 1} ("${beat.id}") must have a provenance record`
      );
      assert.ok(
        Boolean(beat.provenance?.datasetId && beat.provenance?.platform && beat.provenance?.quoteOrRow),
        `Chapter ${chapter.number} Beat ${bIdx + 1} provenance missing required fields`
      );

      // 5. If run ID is cited in provenance or layer3, verify it exists in flight datasets
      if (beat.provenance?.runId) {
        const id = beat.provenance.runId;
        const exists = c1RunIds.has(id) || c2RunIds.has(id) || c3RunIds.has(id);
        assert.ok(exists, `Beat "${beat.id}" cites runId "${id}" not found in flight datasets`);
      }

      if (beat.layer3 && Array.isArray(beat.layer3.data)) {
        beat.layer3.data.forEach((d) => {
          const runId = (d as any).runId || (d as any).testId;
          if (runId) {
            const exists = c1RunIds.has(runId) || c2RunIds.has(runId) || c3RunIds.has(runId);
            assert.ok(exists, `Layer3 data point cites runId "${runId}" not found in flight datasets`);
          }
        });
      }
    });

    // 6. Epistemic caveats
    if (chapter.number === 1) {
      assert.equal(
        chapter.epistemicCaveat,
        'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.'
      );
    }
    if (chapter.number === 3) {
      // Chapter 3 does not claim ML detector caveat
      assert.equal(
        chapter.epistemicCaveat,
        undefined
      );
    }
  });
});

test('Story Grounding: Chapter 1 Audience Levels & Truth Grounding', () => {
  const c1 = CHAPTER_REGISTRY.find((c) => c.number === 1);
  assert.ok(c1, 'Chapter 1 must exist');

  const bannedWords = [
    'safe',
    'guaranteed',
    'certified',
    '% risk',
    'safety score',
    'telemetry verified',
    'live physical reaction',
    'real nasa data',
    'zero hallucination',
  ];

  c1.beats.forEach((beat, idx) => {
    // 1. Level text exists
    assert.ok(beat.levelText, `Beat ${idx + 1} (${beat.id}) must have levelText defined`);

    // 2. Little Explorer max 6 words
    const littleWords = beat.levelText.little.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(
      littleWords <= 6,
      `Beat ${idx + 1} little level text exceeds 6 words (${littleWords} words): "${beat.levelText.little}"`
    );

    // 3. Explorer max 25 words
    const explorerWords = beat.levelText.explorer.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(
      explorerWords <= 25,
      `Beat ${idx + 1} explorer level text exceeds 25 words (${explorerWords} words): "${beat.levelText.explorer}"`
    );

    // 4. Scientist level text present and within limits
    const scientistWords = beat.levelText.scientist.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(
      scientistWords <= 120,
      `Beat ${idx + 1} scientist level text exceeds 120 words (${scientistWords} words)`
    );

    // 5. Copy lint on all level texts
    for (const [level, text] of Object.entries(beat.levelText)) {
      const lower = text.toLowerCase();
      for (const banned of bannedWords) {
        assert.ok(
          !lower.includes(banned),
          `Beat ${idx + 1} ${level} text contains banned phrase "${banned}": "${text}"`
        );
      }
    }
  });

  // Verify Beat 5 has 4 flight droplet runs
  const beat5 = c1.beats[4];
  assert.equal(beat5.id, 'beat-05-reveal');
  assert.ok(Array.isArray(beat5.dropletRuns) && beat5.dropletRuns.length === 4);
  assert.equal(beat5.truthTag, 'From NASA flight tests');

  for (const r of beat5.dropletRuns!) {
    assert.ok(r.runId.startsWith('PSI-69-RUN-'));
    assert.ok(r.initialDiameterMm > 0);
    assert.ok(r.durationSec > 0);
    assert.ok(r.csvRow > 0);
  }
});

