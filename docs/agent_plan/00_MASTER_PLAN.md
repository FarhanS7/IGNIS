# Master Plan: IGNIS Fire Response (detect, locate, respond) + real-data ML

## 1. Goal
Add, WITHOUT removing any existing IGNIS feature, a Fire Response Console that:
1. **Detects** fire from (simulated) spacecraft sensor streams, using detectors whose behavior is grounded in
   NASA findings and in real, labeled sensor data.
2. **Alarms and locates** the fire at ZONE level (not exact point) on a habitat schematic.
3. **Responds** with a simulated, human-overridable response sequence, with each step linked to real NASA flight
   evidence (existing matcher) and its caveats.
4. Uses **real data** to train/calibrate models where real data exists, and says plainly where it does not.

IGNIS core principle stays: the AI is not the source of truth, NASA flight data is. No risk percentages.
Categories only: NOMINAL / ADVISORY / FIRE_ALARM / INSUFFICIENT_EVIDENCE.

## 2. Why this should score (Space Apps criteria: Impact, Creativity, Validity, Relevance, Presentation)
- Impact/Creativity: closes the loop from flight evidence to response, incl. uncrewed (Gateway-style) autonomy.
- Validity: honest validation (grouped splits, baselines, CIs), every parameter tagged, limits shown on screen.
- Relevance: every response step cites NASA combustion evidence; models trained on NASA PSI data where possible.
- Presentation: one clear demo arc; limitations stated up front.

## 3. Current status (as of the last agent report)
| Area | Status |
|---|---|
| Phase 0 integrity fixes | Done on `fix/phase0-integrity` (10 commits, tests 89 -> 96). NOT yet in `main`. Held-out abstention test pending (Step 10). |
| Fire Response Console (sim, detectors, localizer, sequencer, evidence binder, UI, integrations) | Built on `feature/fire-response-console`, agent-reported 157 passing tests and clean build. **UNREVIEWED**: the agent ran Stages 3-5 without waiting for approval. Step 01 audits it. |
| Verified-sources registry | Built; citations NOT yet independently verified (see 19_REVIEW_FINDINGS.md). |
| ML pipeline M1-M5 | Not started. Branch `feature/fire-response-ml` has only the .gitignore commit. |
| Trained-model inference in TypeScript | Not started. |
| E2E tests, CI for ML, Monte Carlo UI hardening | Not started. |
| Docs, dataset attribution, AI-tool disclosure | Partial; placeholders remain (live URL, model name, copyright). |
| Deployment / live URL | Not done. |

## 4. Architecture (target)
```
Python (offline, reproducible)                     TypeScript (browser, no backend)
scripts/ml/                                        apps/web/src/lib/fire/
  data/ download+manifest                            sim.ts  (seeded, advection + mixing)
  m2_fusion/  fire vs nuisance (Earth data)          detectors.ts (baseline, fusion)  + ml/trainedDetector.ts
  m1_same/    detector response (SAME-R)             localizer.ts (zone-level, abstains)
  m4_flex/    extinction threshold (FLEX)            responseSequencer.ts (crewed / uncrewed)
  m5_abstain/ conformal / margin abstention          evidenceBinder.ts (uses existing matcher, read-only)
  export/     JSON models + golden vectors  ----->   ml/ (JSON model loader + inference + parity tests)
docs/models/  model cards + data inspection        apps/web/src/data/models/*.json  (small, committed)
data/provenance/ml_manifest.json (hashes)          pages/ResponseConsolePage.tsx  (/response)
data/raw_ml/  (gitignored raw data)
```

## 5. Data and model inventory (honesty classes)
| Item | Real data? | Domain | Claim allowed |
|---|---|---|---|
| M2 fusion detector | Yes: Magdeburg indoor fire datasets (Mendeley Data) | Earth gravity, no forced ventilation | "Trained on real Earth-gravity incipient-fire data. Not validated in microgravity." |
| M1 detector response | Yes: NASA SAME / SAME-R (PSI-101, PSI-102, CC0) if columns usable; else literature tables | ISS microgravity, pre-ignition smoke from 5 materials | "Calibrated on SAME-R" only if data used; else `literature:` tag |
| M4 extinction threshold | Yes: FLEX in existing `data/processed/evidence_runs.json` | ISS microgravity, droplet flames | "Droplet-flame evidence only; not cabin solid fuels." |
| M5 abstention | Derived from M2/M4 | n/a | "Calibration checked on held-out groups." |
| Localizer | No real multi-detector microgravity data | Simulation | "Simulated. Zone-level." Never claim trained/validated in flight. |
| Response sequencer | No (rules + evidence) | Simulation | "Simulated actuators; human override; not flight software." |

Do NOT use synthetic datasets (IEEE DataPort synthetic set, Zenodo STAGAT simulated set) as "real data".

## 6. Branch and merge strategy
- `main` stays releasable. Only PRs with green CI. Tag `baseline-before-fire-response` is the rollback point.
- Steps 00-02 on `feature/fire-response-console`. Then merge console into `feature/fire-response-ml`.
- Steps 03-12 on `feature/fire-response-ml` (it then contains everything).
- Step 13: PR `fix/phase0-integrity` -> main; merge main into ml branch; PR ml branch -> main; tag release.

## 7. Schedule (target dates; adjust)
| Date | Steps |
|---|---|
| Nov 5 | 00, 01, 02 |
| Nov 6 | 03 |
| Nov 7 | 04 |
| Nov 8 | 05, 06 |
| Nov 9 | 07, 08 |
| Nov 10 | 09 |
| Nov 11 | 10, 11 |
| Nov 12 | 12, 13 |
| Nov 13 | 14 (demo, freeze). Official resource list opens. |
| Nov 14-15 | Hackathon: submit, polish only. |

## 8. Risks
1. Eligibility: Space Apps says teams must submit during the hackathon; pre-event work may be restricted. HUMAN must
   confirm the 2026 Terms with the local lead (Step 00). Keep small dated commits as evidence of build timeline.
2. Fabricated citations/parameters (already happened once). Mitigation: verified_sources registry + Step 01 audit.
3. Domain transfer (Earth-trained model used on microgravity-style simulation). Mitigation: unit-free features,
   loud labels, no superiority claims.
4. Circular validation (simulator vs detectors written by us). Mitigation: robustness sweep, "design-consistency
   check, not validation" label; real-data validation only for M1, M2, M4.
5. Scope creep. Mitigation: out-of-scope list below.
6. Agent skipping gates. Mitigation: 01_AGENT_RULES.md approval gate and report template.

## 9. Out of scope (do NOT build)
3D/CFD simulation; new pages beyond `/response`; a deployed backend; ONNX or other heavy ML runtimes; deep neural
nets; any claim of flight certification; any percentage risk/confidence displayed to users; partial-gravity smoke
transport model.

## 10. Definition of Done
All of: every step report approved; `npm test`, `npm run build`, `npm run lint`, ML pytest, backend pytest, e2e all
green locally and in CI; TS/Python parity <= 1e-6; model cards exist for every shipped model; every dataset in
ml_manifest.json with license + SHA-256; no invented citations; README, About, docs updated; PRs merged to main;
live Vercel URL works; demo video recorded; release tag pushed. See 18_FINAL_CHECKLIST.md.
