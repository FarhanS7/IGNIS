# STEP 05: M1 Detector-Response Model from NASA SAME / SAME-R (real microgravity data)

Branch: `feature/fire-response-ml` | Depends on: Step 03 | Est: 3-4 h | Approval gate: yes

## Objective
Use real ISS data to replace the illustrative "small-particle penalty" in the simulator's baseline smoke detector with something
calibrated on SAME-R, if (and only if) the data supports it.

## Time-box
Spend at most 3 hours trying to use the PSI SAME/SAME-R files. If columns are unusable, STOP and propose the literature fallback (below).

## Tasks
1. From `docs/models/data_inspection.md`, define the target: relative response of the ISS-style photoelectric detector (and the
   ionization detector) versus particle size (e.g., mean/mode diameter) and material, normalized against a reference instrument.
   Write the exact definition to `docs/models/m1_target_definition.md` BEFORE modelling.
2. Features: material, particle-size metric(s), aging time, flow, sample temperature (only those actually present).
3. Models: per-material mean (baseline), monotone/smooth regression on particle size (e.g., isotonic or low-degree polynomial), and a
   regularized linear model. No complex models; the dataset is small.
4. Validation: leave-one-material-out (5 materials: Teflon, Kapton, cotton, silicone rubber, Pyrell) with bootstrap CIs. Report per-material error.
   Baseline = global mean and per-material mean (the latter cannot be used on held-out material; state this).
5. Output: `data/models/m1/response_curve.json` = response multiplier vs diameter for each detector type + uncertainty band, and
   `docs/models/m1_same_detector_response.md` (model card). Card must state: ISS microgravity data; pre-ignition heated-material smoke, not flaming fires;
   small sample size; applicable particle-size range only.
6. Tests: curve is monotone where declared; interpolation stays within data range (no extrapolation beyond the observed particle sizes: outside -> flagged);
   leave-one-material-out has no material overlap.
7. Tagging rule for later integration: only if the model beats the baseline under leave-one-material-out may the simulator tag
   `calibrated:m1-same-r`. Otherwise keep `illustrative` and record the negative result.

## LITERATURE FALLBACK (only if data unusable)
Read the published SAME papers (PMC7918997; NTRS 20130000422; NTRS 20205008167). Extract the reported detector-response observations
into `data/models/m1/literature_table.json` with exact page/table references and units. Tag as `literature:<registry-id>` (QUALITATIVE or
the exact published table values, never extrapolated). Add the sources to `verified_sources.ts` only after reading them. No model card claiming "trained".

## Verification block
```powershell
python -m pytest scripts/ml/tests -q
python scripts/ml/m1_same/evaluate.py
npm test
```

## Acceptance criteria
- [ ] Target definition written before modelling
- [ ] Leave-one-material-out results with CIs OR a documented stop + literature fallback
- [ ] Model card with honest conclusion
- [ ] Extrapolation guard tested
- [ ] No raw data committed

## STOP conditions
Columns unusable (report + fallback); data license not CC0 as expected.
