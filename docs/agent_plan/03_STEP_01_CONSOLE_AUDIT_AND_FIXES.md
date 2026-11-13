# STEP 01: Audit and Fix the Fire Response Console (already built, unreviewed)

Branch: `feature/fire-response-console` | Depends on: Step 00 | Est: 3-4 h | Approval gate: yes

## Objective
The console was built without waiting for review. Verify every claim, fix defects, and remove anything unverified.
Read `19_REVIEW_FINDINGS.md` first: it lists known concerns that MUST each be resolved or explicitly answered.

## Tasks
### 1.1 Scope and hygiene review
- `git diff --stat origin/fix/phase0-integrity..HEAD` -> list every changed file. Confirm only the files listed in the
  report of Stage 5 changed among existing files. Flag anything else.
- `git log --stat origin/fix/phase0-integrity..HEAD | Select-String "temp_|apply_|update_"` -> no stray scripts may exist
  in any commit. If found, STOP and report.
- `git grep -n "Math.random" -- apps/web/src/lib/fire` must be empty.
- Confirm `real_solid_matcher.ts`, `data/processed/*.json`, golden parity tests are unmodified:
  `git diff --stat origin/fix/phase0-integrity..HEAD -- apps/web/src/lib/matcher data/processed` must be empty.

### 1.2 Test-runner completeness
- Show how `npm test` selects files (package.json). Every `*.test.ts` under `apps/web/src` must run.
- Add `apps/web/src/lib/fire/__tests__/test_registry.test.ts`: it lists all `*.test.ts` files on disk and fails if any
  is missing from the `test` script in package.json (or if a glob is used, asserts the glob matches all of them).

### 1.3 Source registry verification (CRITICAL)
For EVERY entry in `verified_sources.ts`:
1. Download the actual document (`https://ntrs.nasa.gov/api/citations/<id>/downloads/<id>.pdf`; if blocked, ask the human to
   download it into `data/raw_ml/sources/`, which is gitignored).
2. Find the passage that supports the registered claim. Record real page number and a 1-sentence paraphrase.
3. Mark VERIFIED or UNVERIFIED in a table in the report.
4. UNVERIFIED entries: remove them from the registry and retag every dependent parameter as `illustrative`.
Specific checks:
- `photoelectric_small_particle_penalty` is tagged `literature:NTRS-20130000422`. That document is the SAME-2 particle
  size/morphology paper. The claim "ISS photoelectric detector responds less to small Kapton/Teflon particles" may instead
  come from "Evaluation of Spacecraft Smoke Detector Performance in the Low-Gravity Environment" (PMC7918997) or
  NTRS 20205008167. Open them, find the exact passage, and re-point the tag to the document that actually says it.
- `nuisance_dust_peak_obscuration` cites NTRS-20210022143 for a "qualitative issue". Verify it says background aerosols/dust
  cause false alarms; otherwise retag `illustrative`.
- Confirm no registry entry or comment says "Spacecraft Atmosphere Monitor" and that SAME is "Smoke Aerosol Measurement Experiment".
- The registry test must fail if a `literature:` id is not in the registry (already exists; re-run it).

### 1.4 UI honesty sweep (run `npm run dev`, open /response)
- Banner "Simulated sensor data. Not flight software." visible at all times.
- No percentage confidence/risk anywhere. `git grep -nE "confidence|%\s*(risk|confidence)" -- apps/web/src/components/response apps/web/src/pages/ResponseConsolePage.tsx`
  and read every hit.
- Parameter tags (illustrative / literature / calibrated / trained) are visible where parameters are shown.
- Lunar preset shows: "Partial-gravity smoke transport is not validated; results are indicative only" and the localizer returns INSUFFICIENT_EVIDENCE.
- No Halon text: `git grep -ni "halon" -- apps/web/src` must be empty.
- Take screenshots of /response in 3 states (nominal, alarm, post-isolation) into `docs/screenshots/` (PNG, each < 400 KB).

### 1.5 Evidence binder audit
- Every `run_uid`/flight run referenced by evidence chips must exist in `evidence_solid.json`. Write a test that loads
  all chips for all steps for all 3 habitats and asserts each referenced run exists.
- The "ventilation shutoff" chip must carry the BASS-II circularity caveat text from docs/VALIDATION.md and must not say a
  fan shutoff "extinguishes fires" in general. Read the displayed text and quote it in the report.
- Envelope warnings: O2 > 22.2 % or gravity != 0 must show "outside NASA's tested range". Add a test for both.

### 1.6 Sequencer and localizer logic review
- Crewed mode: suppression is a recommendation requiring confirmation; CO2 + breathing-apparatus incompatibility alert present.
- Uncrewed mode: autonomous suppression only after the timeout; overrides work; every action is in the event log.
- Localizer returns categories CLEAR / CLOSE / AMBIGUOUS / INSUFFICIENT_EVIDENCE (no numeric confidence).
- Add tests for any behavior above that is not already tested.

### 1.7 Accessibility basics
- Every button has an accessible name; override/confirm buttons reachable and operable by keyboard; alarm state is not
  conveyed by colour alone (text label present). Fix gaps with minimal diffs and add a DOM-level check in Step 02.

### 1.8 Fix list
Fix every defect found with its own commit: `fix(fire): <what>`; push after each commit.

## Verification block
```powershell
npm test
npm run build
npm run lint
git status
```

## Acceptance criteria
- [ ] Source verification table complete; all unverified claims removed/retagged
- [ ] Every item in 19_REVIEW_FINDINGS.md answered (fixed / not an issue / needs human) with evidence
- [ ] test_registry test added and passing; evidence-run existence test added and passing
- [ ] No stray temp scripts, no Math.random, matcher untouched
- [ ] Screenshots committed
- [ ] Test count >= previous (157 or higher), build exit 0

## STOP conditions
Matcher or processed data modified; stray scripts in history; cannot access a source document (ask human); any test failure you cannot fix without weakening a test.
