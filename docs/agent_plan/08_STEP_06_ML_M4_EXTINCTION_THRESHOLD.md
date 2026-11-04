# STEP 06: M4 Extinction-Threshold Model from NASA FLEX (real microgravity data)

Branch: `feature/fire-response-ml` | Depends on: Step 03 | Est: 3 h | Approval gate: yes

## Objective
Using the droplet-flame flight data already in the repo (`data/processed/evidence_runs.json`, FLEX PSI-69 and FLEX-2 PSI-68), estimate how
diluent (CO2, He, N2) and oxygen fractions relate to flame extinction, to feed an honest "suppression insight" panel.
This is droplet-flame evidence ONLY. It must never be presented as cabin-fire suppression guidance.

## Tasks
1. Inspect the droplet tier schema (fuel, O2, CO2, N2, He, pressure, droplet diameter, outcome fields, run/test identifiers). Write findings to
   `docs/models/m4_inspection.md`. Check how the outcome label was derived and whether it is circular (like BASS-II notes). Report.
2. Define the grouping unit (one physical test / mixture setting) so repeated rows from the same test never straddle train and test. Document it.
3. Models: majority class baseline; single-feature in-fold threshold (e.g., CO2 fraction); logistic regression on (fuel, O2, diluent fractions, pressure).
   Gradient boosting only if it beats LR with non-overlapping group-bootstrap CIs.
4. Validation: grouped CV by test unit (and leave-one-fuel-out as a harder split). 95% group-bootstrap CIs, seed 42.
5. SAFETY-CRITICAL ERROR: report separately the rate of false "extinction predicted" when the flame actually persisted. This error type must be the
   headline in the model card (it is the dangerous one).
6. Output categories for the app: EXTINCTION_REGION / SUSTAINED_REGION / INSUFFICIENT_EVIDENCE. No percentages. INSUFFICIENT_EVIDENCE comes from Step 07.
7. Write `data/models/m4/params.json`, `data/models/m4/metrics.json`, `docs/models/m4_flex_extinction.md` with lines:
   "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels." and "Not validated for partial gravity."
8. Tests: group disjointness, determinism, the false-extinction metric computed correctly on a hand-made confusion example.

## Verification block
```powershell
python -m pytest scripts/ml/tests -q
python scripts/ml/m4_flex/evaluate.py
npm test
```

## Acceptance criteria
- [ ] Schema + circularity inspection written
- [ ] Grouped CV + leave-one-fuel-out results with CIs; false-extinction rate headlined
- [ ] Honest statement if the model does not beat baselines
- [ ] Model card complete

## STOP conditions
Droplet tier lacks the needed fields; labels circular beyond repair (report and propose a descriptive-only panel instead of a model).
