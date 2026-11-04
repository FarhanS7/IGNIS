# NASA Space Apps Challenge 2026 Submission Package

**Project Name**: IGNIS · Microgravity Fire Safety & Containment Intelligence  
**Challenge Track**: Astronaut Life Support & Habitat Safety  
**Live Application URL**: `<CONFIRM: paste production URL, e.g. https://ignis-fire.vercel.app>`  
**Source Code Repository**: https://github.com/FarhanS7/IGNIS  
**Demo Video URL**: `<CONFIRM: paste unlisted YouTube video URL>`  
**Team Members**: `<CONFIRM: list team member names and Space Apps usernames>`  

---

## 1. Project Summary (150 Words)

Spacecraft fires behave counterintuitively: without buoyancy, flames burn as hemispherical diffusion structures, smoke fails to rise, and toxic gases disperse along forced ventilation ducts. While NASA has flown combustion experiments for decades—from the ISS Combustion Integrated Rack to Saffire cargo burns—mission teams lack interactive tools bridging raw flight telemetry into real-time emergency fire response.

IGNIS is an epistemic mission safety platform that transforms primary NASA flight data into actionable fire intelligence. It couples an interactive multi-compartment smoke transport simulator with a 6-stage containment sequencer and 3 selectable detector engines: heuristic multi-sensor fusion, flight-calibrated single-channel response (NASA SAME-R), and learned ML fusion (M2). Rather than offering black-box predictions, IGNIS enforces strict scientific honesty: displaying prominent caveats for ground-trained models, restricting flame extinction insights to NASA FLEX droplet regimes, reporting categorical states without speculative risk percentages, and requiring astronaut confirmation for crewed suppression.

---

## 2. What Is New This Hackathon

1. **Fire Response Console (`/response`)**: Built an interactive emergency console with multi-compartment ventilation duct transport, inter-zone smoke time-of-arrival source localization, and a 6-stage containment state machine (`ALARM` → `REMOVE_POWER` → `ISOLATE_VENTILATION` → `INHIBIT_MAKEUP` → `SUPPRESSION` → `POST_FIRE_RECOVERY`).
2. **Selectable 3-Arm Detector Architecture**: Implemented side-by-side detector comparison allowing operators to evaluate Heuristic Fusion, Baseline Single-Channel (photoelectric), and Learned Multi-Sensor ML Fusion on identical simulation streams.
3. **NASA SAME/SAME-R Photoelectric Calibration (M1)**: Calibrated empirical microgravity smoke responsiveness on 130 NASA SAME/SAME-R flight runs across 5 solid materials, replacing heuristic approximations with empirical Teflon small-particle penalty multipliers ($0.2570 \pm 0.142$, MAE 0.9321).
4. **NASA FLEX Droplet Extinction Boundary (M4)**: Integrated a conformal logistic flammability limit model trained on 262 NASA FLEX droplet burns, cutting False Extinction Rate from 100.0% to 35.4%, paired with strict caveats preventing invalid extrapolation to solid cabin materials.
5. **Epistemic Integrity & Full QA Hardening**: Replaced stale ungrouped cross-validation claims with strict Grouped LOOCV benchmark (80.30% acc, $p = 1.0000$ vs $O_2$ rule), verified bit-exact determinism, added automated safety copy-lint guardrails, and implemented 29 Playwright E2E tests (including mobile 390x844 and offline CDN fallback).

---

## 3. NASA Datasets & Primary Scientific Sources

Every parameter and model in IGNIS is grounded in verified open-access flight data recorded in [`data/provenance/ml_manifest.json`](../data/provenance/ml_manifest.json):

| Dataset ID | Mission / Investigation | Primary Authors | DOI / Permanent Identifier | Open License | Usage in IGNIS |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **D1** | EN54 Indoor Multi-Sensor Fire Dataset | Pascal Vorwerk et al., Otto von Guericke University | [10.17632/npk2zcm85h.2](https://doi.org/10.17632/npk2zcm85h.2) | CC BY 4.0 | M2 multi-sensor fusion detector training |
| **D2** | Industrial Hall Multi-Sensor Fire Dataset | Pascal Vorwerk et al., Otto von Guericke University | [10.17632/yghykzm4km.1](https://doi.org/10.17632/yghykzm4km.1) | CC BY 4.0 | M2 cross-site domain generalization evaluation |
| **D3** | Small-Scale Test Chamber Fire Dataset | Pascal Vorwerk et al. | [10.17632/m85f9h6g9j.1](https://doi.org/10.17632/m85f9h6g9j.1) | CC BY 4.0 | Benchmark reference & sensor validation |
| **D4** | NASA SAME (PSI-102) | David L. Urban et al., NASA GRC | [10.60555/gd4k-8h62](https://doi.org/10.60555/gd4k-8h62) | CC0-1.0 (Public Domain) | M1 microgravity photoelectric response calibration |
| **D5** | NASA SAME-R (PSI-101) | David L. Urban et al., NASA GRC | [10.60555/2np7-jv14](https://doi.org/10.60555/2np7-jv14) | CC0-1.0 (Public Domain) | M1 detector calibration across 5 spacecraft materials |
| **D6** | NASA FLEX / FLEX-2 (PSI-69 / PSI-68) | Forman A. Williams et al., NASA PSI | [10.60555/psi-69-flex](https://doi.org/10.60555/psi-69-flex) | CC0-1.0 (Public Domain) | M4 microgravity droplet flame extinction boundary model |

---

## 4. Technology Stack & Tools Used

- **Client Application**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Recharts, Lucide icons.
- **Client ML Inference**: Pure TypeScript browser inference engines (`apps/web/src/lib/fire/ml/`) executing 100% deterministically in the client with zero runtime dependencies.
- **Python ML Pipeline**: Python 3.13, NumPy, Pandas, Scikit-learn, SciPy, Pytest (`requirements-ml.txt`).
- **AI Tool Usage Disclosure**:
  - *Coding & Agentic Pair Programming*: AI coding assistants (<CONFIRM: specify AI IDE tools used, e.g. Google Antigravity / Claude Code>) were used for code drafting, refactoring, test scaffolding, and continuous verification under human architectural supervision.
  - *Human Verification*: All code changes, mathematical derivations, and verification outputs were reviewed and confirmed by human authors (<CONFIRM: list team member names who verified the codebase>).
  - *Epistemic Data Integrity*: All physical flight tables, fuel material properties, and DOI citations are extracted directly from primary NASA PSI files and NTRS publications without generative fabrication.
  - *In-Browser Determinism*: The client-side application runs 100% deterministically in the user's browser using bundled JSON corpora without mandatory external LLM calls.
  - *Optional API Assistant*: The companion backend (`services/api`) contains optional endpoints interfacing with Gemini (<CONFIRM: specify exact Gemini model version configured, e.g. Gemini 1.5 Flash>) for natural language synthesis, guarded by client-side verbatim citation verifiers (`apps/web/src/lib/assistant/client_verifier.ts`).

---

## 5. Limitations Summary

As documented in [`docs/LIMITATIONS.md`](LIMITATIONS.md):
1. **Simulated Sensors**: Compartment transport is modeled as a 1D advection-dispersion network assuming well-mixed zone volumes; it is not a 3D CFD simulation.
2. **Earth-Gravity Training for M2**: M2 was trained on terrestrial $1\,g$ fires. In microgravity, particulate transport is driven by ventilation airflow rather than thermal buoyancy plumes. M2 carries a prominent honest disclosure badge.
3. **Droplet Extinction Only**: M4 reflects isolated liquid droplets in quiescent microgravity, not solid polymer combustion. LOFO cross-fuel validation demonstrates high False Extinction Rates (41.9%–76.5%), proving droplet models must not be extrapolated to cabin solid fuels.
4. **Partial Gravity Unvalidated**: Lunar ($0.166\,g$) and Martian ($0.38\,g$) gravity regimes introduce unvalidated buoyancy-ventilation competition; selecting them immediately renders an advisory notice.
5. **Non-Flight Qualification**: IGNIS is an educational and mission architecture research tool developed for the Space Apps Challenge; it is not flight software and does not constitute certified spacecraft safety clearance under **NASA-STD-6001B**.

---

## 6. Space Apps Judging Criteria Alignment

| Judging Criterion | Alignment in IGNIS | Concrete Evidence in Repository |
|---|---|---|
| **Impact** | Translates decades of archived NASA flight research into an operational containment decision framework, addressing fire risks for Artemis lunar habitats and uncrewed cargo missions. | [`docs/FIRE_RESPONSE.md`](FIRE_RESPONSE.md)<br/>[`apps/web/src/pages/ResponseConsolePage.tsx`](../apps/web/src/pages/ResponseConsolePage.tsx)<br/>[`apps/web/src/components/response/ResponseSequencePanel.tsx`](../apps/web/src/components/response/ResponseSequencePanel.tsx) |
| **Creativity** | Pairs 3-arm detector benchmarking (heuristic vs baseline vs trained ML) with interactive habitat topology, time-of-arrival localization, and physical droplet extinction guidance. | [`apps/web/src/lib/fire/detectors.ts`](../apps/web/src/lib/fire/detectors.ts)<br/>[`apps/web/src/lib/fire/localizer.ts`](../apps/web/src/lib/fire/localizer.ts)<br/>[`apps/web/src/components/response/HabitatSchematic.tsx`](../apps/web/src/components/response/HabitatSchematic.tsx) |
| **Validity** | Enforces unprecedented epistemic honesty: retracted leaked ungrouped cross-validation figures, calibrated M1 on 130 SAME flight runs, calibrated M4 on 262 FLEX runs, proved TS/Python parity, and passed 211 unit tests. | [`docs/VALIDATION.md`](VALIDATION.md)<br/>[`docs/models/m1_same_detector_response.md`](models/m1_same_detector_response.md)<br/>[`docs/models/m4_flex_extinction.md`](models/m4_flex_extinction.md)<br/>[`scripts/validate/grouped_loocv.py`](../scripts/validate/grouped_loocv.py) |
| **Relevance** | Directly solves the core NASA challenge: transforming microgravity combustion physics and PSI open data into astronaut life-support protection and habitat safety containment. | [`data/provenance/ml_manifest.json`](../data/provenance/ml_manifest.json)<br/>[`apps/web/src/lib/fire/verified_sources.ts`](../apps/web/src/lib/fire/verified_sources.ts)<br/>[`README.md`](../README.md) |
| **Presentation** | High-polish responsive UI matching Tailwind theme, 29 Playwright E2E tests, full mobile 390x844 support without horizontal overflow, offline CDN resilience, and accessible ARIA live regions. | [`apps/web/e2e/mobile.spec.ts`](../apps/web/e2e/mobile.spec.ts)<br/>[`apps/web/e2e/offline.spec.ts`](../apps/web/e2e/offline.spec.ts)<br/>[`apps/web/e2e/response.spec.ts`](../apps/web/e2e/response.spec.ts)<br/>[`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md) |
