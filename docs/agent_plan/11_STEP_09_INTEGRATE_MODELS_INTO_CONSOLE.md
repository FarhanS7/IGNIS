# STEP 09: Integrate Trained Models into the Fire Response Console

Branch: `feature/fire-response-ml` | Depends on: Step 08 | Est: 4 h | Approval gate: yes

## Objective
Make trained models usable in the UI, labelled honestly, WITHOUT removing the baseline and fusion detectors.

## Tasks
1. Detector selector on /response: three options: "Baseline (photoelectric)", "Heuristic fusion", "Trained fusion (Earth-gravity data)".
   Existing two remain. Default stays "Heuristic fusion".
2. When "Trained fusion" is chosen show: model id, source tag `trained:m2-fusion-v1`, datasets (D1/D2 names + DOIs), a visible badge
   "Trained on Earth-gravity data. Not validated in microgravity.", and a link/modal showing the model card text (render from the markdown file
   or an equivalent static copy; do not fetch remotely).
3. M1: if Step 05 PASSED, replace the illustrative small-particle penalty in the baseline detector with the calibrated response curve and tag it
   `calibrated:m1-same-r`; flag inputs outside the observed particle-size range (outside -> INSUFFICIENT_EVIDENCE for that detector).
   If Step 05 did not pass, change nothing and show the negative result in the limits panel.
4. M4: add a "Suppression insight" card in the response sequencer's suppression step: shows the FLEX-based EXTINCTION_REGION / SUSTAINED_REGION /
   INSUFFICIENT_EVIDENCE for the current diluent scenario with the mandatory text "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."
   It informs, it never auto-triggers anything.
5. Monte Carlo: add a third arm "trained" with the label "behaves sensibly on simulator streams; both model and simulator carry assumptions; not a
   superiority claim". Report robustness-sweep results for all three arms. Show flips honestly.
6. Parameter registry: `sim_params.ts` gets new tags `calibrated:` / `trained:` where applicable; the registry test must require each such tag to correspond
   to an existing model JSON with a model card.
7. Update the About page and Research Gaps page text to describe what is real-data-trained vs simulated (a 4-row table: detector fusion, detector response,
   extinction threshold, localization/sequencer).
8. Copy-lint: extend `fire_copy_lint.test.ts` to ban "AI-powered detection is validated", "proven", "certified", and any claim "trained on microgravity fire data"
   for M2. Add a test that every UI mention of a trained model is accompanied by the "Not validated in microgravity" phrase in the DOM (do this in e2e).
9. E2E additions: select Trained fusion -> badge visible; run scenario -> alarm or INSUFFICIENT_EVIDENCE; suppression-insight card text present; Monte Carlo shows 3 arms.

## Verification block
```powershell
npm test
npm run build
npm run test:e2e --prefix apps/web
python -m pytest scripts/ml/tests -q
```

## Acceptance criteria
- [ ] Three detectors selectable; defaults unchanged; nothing removed
- [ ] Every trained/calibrated element shows tag, datasets, and the microgravity caveat
- [ ] M1 integrated only if it beat its baseline (else documented)
- [ ] M4 card shows the droplet-flame caveat
- [ ] Registry + copy-lint + e2e updated and green

## STOP conditions
UI would need a percentage to explain a model output (do not add one; report instead).
