# STEP 04: M2 Fusion Detector (fire vs nuisance vs background), real Earth-gravity data

Branch: `feature/fire-response-ml` | Depends on: Step 03 | Est: 5-6 h | Approval gate: yes

## Objective
Train and honestly evaluate a small, interpretable detector on D1 (+D2 cross-site), using ONLY channels the console simulator can
supply: smoke proxy (particulate matter), CO, temperature. (Optional ablation may add H2/CO2, but the exported model uses only the 3.)

## Design (follow exactly)
- Unit of analysis: one EXPERIMENT = scenario x repetition (background segments adjacent to it belong to the same group).
- Labels: FIRE, NUISANCE, BACKGROUND from the dataset's label columns (see data_inspection.md).
- Features (must be implementable in <= 60 lines of TypeScript; write exact formulas to `docs/models/feature_spec.md`):
  per channel, over a trailing window W (decided in tuning on TRAIN folds only; native cadence is ~10 s):
  background-normalized level (x / baseline_median_of_first_K_samples - 1), least-squares slope over W, max over W,
  and cross-channel agreement counts (how many channels exceed their own robust z-threshold). NO feature may depend on units.
  This is what lets the simulator (different units) feed the model later.
- Models: (a) L2-regularized logistic regression (primary), (b) shallow gradient boosting ONLY IF it beats (a) on
  held-out groups with non-overlapping group-bootstrap CIs. Export format must stay simple (LR coefficients, or explicit tree arrays).
- Baselines (thresholds fitted on TRAIN folds only): B1 particulate threshold; B2 CO threshold; B3 rule fusion (PM AND CO).
- Operating point rule (pre-registered; do not change after seeing test results): choose the decision threshold on the TRAIN fold as the most
  sensitive setting that yields ZERO false alarms on that fold's nuisance+background data; apply unchanged to the test fold.

## Splits (document every one in the model card)
S1. Leave-one-scenario-out: hold out each fire scenario type once, and each nuisance scenario type once, as the test groups (others train).
S2. Cross-site: train D1 -> test D2, and train D2 -> test D1, on common channels only.
S3. Leave-one-repetition-out within a scenario as a sanity check (expected to look optimistic; report but do not headline).
No random row-level splits anywhere. Add a unit test asserting no group id appears in both train and test.

## Metrics (per split, with 95% group-bootstrap CI: resample experiments with replacement, 2000 resamples, seed 42)
- Fire detection rate (experiments with an alarm / fire experiments), with censored misses reported
- Detection delay (s) from labeled fire onset to first alarm (median, p90)
- Nuisance rejection rate (nuisance experiments without an alarm / nuisance experiments)
- False alarms per hour of background data
- Per-scenario table (e.g., cable overload vs fog machine) so failures are visible

## Tasks
1. Implement: `scripts/ml/common/{groups.py,bootstrap.py,seed.py}`, `scripts/ml/m2_fusion/{features.py,baselines.py,splits.py,train.py,evaluate.py}`.
2. Unit tests in `scripts/ml/tests/`: feature determinism on a tiny synthetic frame (generated inside the test, not committed data), split-disjointness,
   bootstrap reproducibility (same seed -> same CI), threshold rule uses only train data (leakage test).
3. Run `python scripts/ml/m2_fusion/evaluate.py` -> writes `data/models/m2/metrics.json` (committed, small) and `docs/models/m2_fusion_detector.md` (model card).
4. Model card MUST contain: datasets + DOIs + licenses, features, window W, splits, baselines, metrics tables with CIs, per-scenario failures,
   operating-point rule, and the exact lines: "Trained on Earth-gravity data without forced ventilation. Not validated in microgravity."
   and "Metrics are on held-out experiments, not random rows."
5. If the model does NOT beat the best baseline on held-out groups, write that in the card's first paragraph. Do not tune further on test groups.
6. Do NOT pickle/joblib the model. Save the trained parameters as plain JSON in `data/models/m2/params.json` (coefficients, preprocessing constants, operating threshold). Step 08 exports them for the browser.

## Verification block
```powershell
python -m pytest scripts/ml/tests -q
python scripts/ml/m2_fusion/evaluate.py
npm test
git status
```

## Acceptance criteria
- [ ] All three baselines + the model evaluated under S1 and S2 with CIs
- [ ] Model card written; first paragraph states honestly whether the model beats baselines
- [ ] feature_spec.md has exact formulas
- [ ] No group leakage test passes; seed fixed; results reproducible (run twice, identical metrics.json)
- [ ] No raw data committed

## STOP conditions
Dataset labels unclear; fewer than 3 usable fire experiments in a split (report); model cannot be expressed with unit-free features.
