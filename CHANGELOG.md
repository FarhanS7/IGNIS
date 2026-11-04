# Changelog

All notable changes to the IGNIS project are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-11-05

### Phase 0 Scientific Integrity & Grounding Fixes
- **Retraction of Ungrouped Cross-Validation Figures**: Retracted previously reported 92.42% accuracy, 87.89% balanced accuracy, and 84.00% extinction recall. Documented and proved that those numbers were artifacts of ungrouped data leakage where repeated burns of identical physical samples leaked across train/test splits.
- **Grouped LOOCV Benchmark**: Established strict grouped leave-one-group-out cross-validation across all 110 independent physical hardware groups (132 usable solid runs). Reported true performance: **80.30% overall accuracy (106/132)**, **46.72% balanced accuracy**, and **48.00% extinction recall (12/25)**, with McNemar test ($p = 1.0000$) proving no statistically significant advantage over a single oxygen threshold rule.
- **Citation & Terminology Audit**: Corrected acronym expansion for NASA SAME (Smoke Aerosol Measurement Experiment, replacing incorrect historical references). Re-grounded all physical parameters in primary peer-reviewed literature (PMC7918997, NTRS-20130000422).
- **Epistemic Guardrails**: Added strict copy-lint and provenance tests failing the build if overclaiming phrases ("flight-certified", "guaranteed", "100% safe", "predicts fire risk") appear.

### Fire Response Console (`/response`)
- **Interactive Mission Safety Console**: Shipped `/response` route simulating multi-compartment smoke transport, multi-sensor detection, time-of-arrival localization, and containment sequencing across ISS-like, uncrewed logistics, and lunar habitat topologies.
- **Selectable Detector Arms**: Added dropdown switching between:
  - *Heuristic Fusion*: Multi-sensor persistence window evaluating optical obscuration, CO, and thermal rate-of-rise.
  - *Baseline Photoelectric*: Single-channel detector calibrated with empirical NASA SAME-R particle response curves.
  - *Trained ML Fusion*: L2-logistic multi-sensor classifier with conformal abstention and persistent Earth-gravity honest disclosure banner.
- **Categorical Source Localization**: Inter-zone arrival delays classify smoke origins into discrete categories (`CLEAR`, `CLOSE`, `AMBIGUOUS`, `INSUFFICIENT_EVIDENCE`), banning misleading risk percentages.
- **Response Sequencer**: Six-stage containment progression (`ALARM` → `REMOVE_POWER` → `ISOLATE_VENTILATION` → `INHIBIT_MAKEUP` → `SUPPRESSION` → `POST_FIRE_RECOVERY`). Crewed mode requires mandatory astronaut confirmation for fire suppression agent release.
- **Monte Carlo Design-Consistency Sweep**: Added async chunked Monte Carlo simulation ($N=100/200/500$) completing 200 runs in 1.69 s without blocking the UI, reporting parameter robustness and plain-language ranking flips.
- **Parameter Registry**: Centralized all simulation parameters in `sim_params.ts`, tagged with verified DOIs (`literature:`), calibrated models (`calibrated:`), or trained models (`trained:`).

### Machine Learning Models & Browser Inference
- **M1 Detector Response Model**: Calibrated on 130 NASA SAME/SAME-R microgravity flight runs (PSI-101 / PSI-102), empirically validating the small-particle penalty (Teflon multiplier $0.2570 \pm 0.142$, MAE 0.9321 vs Global Mean baseline 1.1620).
- **M2 Incipient Fire Fusion Detector**: Trained on Mendeley Data EN54 (D1) and Industrial Hall (D2) datasets with 10 unit-free features, achieving 100.0% fire detection with a 100 s latency reduction over particulate thresholding and 0.000 false alarms/hour.
- **M4 FLEX Droplet Extinction Boundary**: Trained on 262 NASA FLEX/FLEX-2 microgravity droplet runs (PSI-69 / PSI-68), reducing False Extinction Rate from 100.0% to 35.4% under grouped CV. Documented catastrophic failure under LOFO (FER 41.9%–76.5%), proving droplet models cannot extrapolate to cabin solid fuels.
- **M5 Conformal Abstention & Reliability**: Implemented split-conformal prediction sets ($1 - \alpha = 0.90$), boosting confident accuracy to 94.9% for M4 and protecting M2 against cross-site domain shifts.
- **Pure TypeScript Browser Inference**: Implemented zero-dependency deterministic inference in `apps/web/src/lib/fire/ml/`, matching Python scikit-learn models across 345 golden test vectors with mathematical parity ($\le 5.09 \times 10^{-11}$ error).

### Testing, QA & Hardening
- **Expanded Unit Test Suite**: Increased unit test count to **211 passed tests across 15 test suites** using native Node 22 experimental type stripping.
- **Playwright E2E Suite**: Shipped **29 passing end-to-end browser tests**, including:
  - Complete 12-route navigation audit.
  - Full Fire Response Console interactive workflow.
  - Mobile responsiveness test at 390x844 viewport verifying zero horizontal scroll.
  - Offline and CDN fallback tests verifying full client-side operation when external CDNs are blocked.
- **Determinism Tests**: Added bit-exact unit determinism tests proving identical outputs across repeated runs with identical seeds for all detector arms and Monte Carlo sweeps.
- **Accessibility & Contrast**: Added `aria-live="polite"` and ARIA landmark roles (`status`, `alert`, `log`, `region`) to alarm banners, crew safety alerts, extinction insights, and audit event logs.
- **Security & Hygiene**: Verified zero committed secrets, `.env` gitignored, and zero unexpected third-party dependencies added to `apps/web/package.json`.
