# STEP 08: Export Models to JSON, TypeScript Inference, Parity Tests

Branch: `feature/fire-response-ml` | Depends on: Steps 04-07 | Est: 4 h | Approval gate: yes

## Objective
Run the trained models in the browser with NO backend and NO new runtime dependency, and prove TypeScript output equals Python output.

## Export format (`apps/web/src/data/models/<model_id>.json`, each < 300 KB)
```json
{
  "model_id": "m2-fusion-v1",
  "version": "1.0.0",
  "type": "logistic" | "trees",
  "feature_names": ["..."],
  "preprocessing": { "...": "exact constants used" },
  "params": { "coef": [...], "intercept": 0.0 },
  "abstention": { "method": "margin" | "conformal", "threshold": 0.0 },
  "operating_point": { "decision_threshold": 0.0, "rule": "zero false alarms on train nuisance/background" },
  "training": { "datasets": [{"id":"D1","doi":"...","sha256":"..."}], "git_commit": "...", "seed": 42, "split_notes": "..." },
  "metrics_ref": "data/models/m2/metrics.json",
  "card": "docs/models/m2_fusion_detector.md",
  "limitations": ["Not validated in microgravity.", "..."],
  "source_tag": "trained:m2-fusion-v1"
}
```
Also export `m4-extinction-v1.json` and, if Step 05 passed, `m1-response-curve-v1.json` (or the literature table).

## Tasks
1. `scripts/ml/export/export_models.py`: writes the JSON files above from `data/models/*/params.json`. Includes the git commit hash of the repo.
2. `scripts/ml/export/golden_vectors.py`: for each model writes `data/models/golden/<model_id>.golden.json` with >= 100 cases:
   raw input windows (as the TS code will receive them), expected features, expected score, expected category. Include edge cases:
   flat signal, spike (dust-like), slow ramp, missing channel, values exactly at thresholds, max/min of training range, out-of-range input.
3. TypeScript in `apps/web/src/lib/fire/ml/` (no new dependencies):
   - `modelTypes.ts` (types), `loadModel.ts` (import JSON, validate shape; throw a clear error on mismatch),
   - `features.ts` (EXACT formulas from `docs/models/feature_spec.md`), `logistic.ts`, `trees.ts` (only if a tree model exists),
   - `abstain.ts` (margin or conformal rule), `trainedDetector.ts` implementing the existing `DetectorEngine` interface.
4. `trainedDetector.ts` details:
   - Input: console `SensorReadingWindow` (2 Hz, simulator units). It must (a) RESAMPLE to the model's native cadence by bin-averaging,
     (b) convert to unit-free features using the background-normalization defined in feature_spec.md, (c) score, (d) apply abstention.
   - Output `DetectorOutput` with state NOMINAL / ADVISORY / FIRE_ALARM / INSUFFICIENT_EVIDENCE, evidence strings (which features drove it),
     and `provenanceTag = 'trained:m2-fusion-v1'`.
   - Missing channels or too-short window -> INSUFFICIENT_EVIDENCE, never a guess.
5. Parity tests `apps/web/src/lib/fire/ml/__tests__/parity.test.ts`: for every golden case assert |TS - Python| <= 1e-6 for features and scores and exact equality for
   categories. Add the test file to `npm test` (and to the registry test from Step 01).
6. Additional TS tests: loader rejects a corrupted model; determinism; abstains on empty/short windows; no `Math.random`.
7. CI: node tests run parity automatically (golden files are committed). Add `python -m pytest scripts/ml/tests -q` check that exported JSON is up to date:
   re-export to a temp dir and compare to the committed files.

## Verification block
```powershell
python scripts/ml/export/export_models.py
python scripts/ml/export/golden_vectors.py
python -m pytest scripts/ml/tests -q
npm test
npm run build
```

## Acceptance criteria
- [ ] Models exported; each file < 300 KB; limitations + tag + DOI hashes present
- [ ] >= 100 golden cases per model; TS parity <= 1e-6 (paste max observed error)
- [ ] `TrainedMLDetector` implements `DetectorEngine`; no UI changes yet
- [ ] No new runtime dependencies (`git diff package.json` shows only test script edits)
- [ ] Exported-JSON freshness check exists

## STOP conditions
Parity fails after one honest debugging pass (report the mismatching cases and root cause; do not loosen tolerance).
