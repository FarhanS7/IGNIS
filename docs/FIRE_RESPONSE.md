# Fire Response Console (`/response`): Epistemic Architecture & Reproducibility Guide

## 1. What the Fire Response Console Does

The **Fire Response Console** is an interactive, browser-executed mission safety console that simulates multi-sensor fire detection, smoke transport, time-of-arrival source localization, and emergency response sequencing across pressurized microgravity space habitats (such as an ISS-like module, uncrewed logistics carrier, or lunar surface habitat).

Unlike speculative "black-box" systems, IGNIS enforces strict epistemic honesty:
1. **Three Selectable Detector Arms**: Users can toggle between **Heuristic multi-sensor fusion** (default), **Baseline calibrated photoelectric** (NASA SAME-R response curve), and **Trained ML fusion** (L2-logistic classifier trained on real ground fire datasets).
2. **Real-Flight Calibrated Sensor Models**: Rather than arbitrary detection thresholds, the baseline detector incorporates empirical photoelectric response multipliers from 130 NASA SAME/SAME-R microgravity flight runs (`calibrated:m1-same-r`), properly capturing the small-particle penalty where sub-micron smoke (e.g. overheated Teflon, mean multiplier 0.257) produces lower optical obscuration than large-particle cellulose smoke.
3. **Domain-Shift Honesty**: The trained ML fusion detector (`trained:m2-fusion-v1`) prominently displays a persistent caveat banner: *"Trained on Earth-gravity data. Not validated in microgravity."* along with links to primary open-access datasets (DOIs `10.17632/npk2zcm85h.2` and `10.17632/yghykzm4km.1`) and its complete model card.
4. **Physical Regime Grounding for Suppression**: In Step 5 (`SUPPRESSION`), the sequencer provides physical extinction boundary insights powered by a conformal logistic model trained on 262 NASA FLEX/FLEX-2 microgravity droplet burns (`trained:m4-extinction-v1`). The interface enforces the mandatory scientific caveat: *"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."* and never auto-triggers suppression.
5. **Categorical Outputs Only**: Zero pseudo-probabilities or risk percentages. Outcomes are strictly categorical: `NOMINAL`, `ADVISORY`, `FIRE_ALARM`, `INSUFFICIENT_EVIDENCE`, `EXTINCTION_REGION`, and `SUSTAINED_REGION`.
6. **Pure Client-Side Execution**: All inference runs deterministically in pure TypeScript with zero external network requests or server-side dependencies.

---

## 2. Architecture Diagram

```mermaid
flowchart TD
    subgraph S["Habitat & Transport Simulation"]
        G["Habitat Graph Topology<br/>(Zones, Ducts, Volumes)"] --> SIM["FireSimulator<br/>(Compartment Advection & Mixing)"]
        PARAM["sim_params.ts<br/>(Literature & Calibrated Registry)"] -.-> SIM
    end

    subgraph DET["Detector Engine (Selectable Arms)"]
        SIM --> SENS["Sensor Reading Stream<br/>(Obscuration, CO, Temperature, Rate)"]
        SENS --> ARM1["Arm 1: Heuristic Multi-Sensor Fusion<br/>(Persistence Windows & Ratio Checks)"]
        SENS --> ARM2["Arm 2: Baseline Single-Channel<br/>(Calibrated NASA SAME-R Multipliers)"]
        SENS --> ARM3["Arm 3: Trained ML Fusion (M2)<br/>(L2 Logistic + Conformal Abstention)"]
    end

    subgraph LOC["Localization & Containment"]
        ARM1 & ARM2 & ARM3 --> OUT["Detector Outputs<br/>(Categorical States & Timestamps)"]
        OUT --> LOCAL["ZoneLocalizer<br/>(Time-of-Arrival Delay Ranking)"]
        LOCAL --> SEQ["ResponseSequencer<br/>(Crewed & Uncrewed Finite State Machine)"]
        FLEX["M4 NASA FLEX Droplet Boundary<br/>(Physical Regime Guidance)"] -.-> SEQ
    end

    subgraph UI["Interactive User Interface (/response)"]
        LOCAL --> SCHEM["Habitat Schematic & Sensor Timeline"]
        SEQ --> PANEL["Response Sequence Panel & Audit Log"]
        MC["Monte Carlo Sweep<br/>(Design-Consistency Verification)"] -.-> UI
    end
```

---

## 3. Epistemic Transparency Audit

Every subsystem in the Fire Response Console is explicitly audited into one of four provenance tiers:

| Subsystem | Implementation Architecture | Grounding / Training Source | Operational Boundary & Caveats |
|---|---|---|---|
| **Detector Fusion (M2)** | L2-regularized Logistic Regression + Conformal Abstention (`trained:m2-fusion-v1`) | Ground EN54 test room & industrial hall (DOIs: `10.17632/npk2zcm85h.2`, `10.17632/yghykzm4km.1`) | **Trained on Earth-gravity data. Not validated in microgravity.** Evaluates behavioral consistency on simulated streams; not an empirical microgravity superiority claim. |
| **Detector Response (M1)** | Calibrated Response Curve + Extrapolation Guard (`calibrated:m1-same-r`) | 130 NASA SAME / SAME-R flight runs on the ISS (PSI-101 / PSI-102, PMC7918997) | **Calibrated on microgravity flight tests.** Pre-ignition heated materials in forced flow ducts. Abstains outside flight-tested particle size range $[0.035, 1.07]\,\mu\text{m}$. |
| **Extinction Boundary (M4)** | Conformal Logistic Extinction Classifier (`trained:m4-extinction-v1`) | 262 NASA FLEX / FLEX-2 droplet burns on the ISS (PSI-69 / PSI-68) | **Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.** Informs physical boundaries; never auto-triggers suppression. Under LOFO, FER reaches 41.9–76.5% across fuel families. |
| **Transport & Sequencer** | 1D Advection-Dispersion Compartment Network & Finite State Machine | Qualitative transport from NASA SAME (NTRS-20130000422) & ISS Procedures (NTRS-20030053429) | **Simulated sensor data. Not flight software.** Assumes well-mixed zone compartments. In crewed habitats, human authorization is mandatory for fire suppression. |

---

## 4. Model Summaries & Audited Metrics

### M1: NASA SAME / SAME-R Detector Response Calibration
- **Purpose**: Models microgravity photoelectric detector responsiveness as a function of aerosol aerodynamic mean diameter ($d_{\text{AMD}}$).
- **Architecture**: Ridge multivariate regression and isotonic monotonic regression with physical domain extrapolation guards ($0.049\,\mu\text{m} \le d \le 1.103\,\mu\text{m}$).
- **Evaluation**: Leave-One-Material-Out (LOMO) cross-validation across all 5 flight materials (Teflon, Kapton, Lampwick, Silicone, Pyrell).
- **Audited Metrics**: Ridge Multivariate achieves an overall **MAE of 0.9321 [0.5605, 1.4626] and RMSE of 2.8419**, outperforming the Global Mean Baseline (MAE 1.1620, RMSE 2.8773). Empirical Teflon multiplier ($0.2570 \pm 0.142$) directly replaces heuristic approximations.
- **Model Card**: [`docs/models/m1_same_detector_response.md`](models/m1_same_detector_response.md)

### M2: Multi-Sensor Incipient Fire Fusion Detector
- **Purpose**: Rapidly detects incipient fires while rejecting non-fire nuisance aerosols (dust, sprays) using 10 unit-free statistical features over a 60-second sliding window.
- **Architecture**: L2-regularized Logistic Regression with balanced class weighting and split-conformal prediction sets ($1 - \alpha = 0.90$).
- **Evaluation**: Leave-One-Scenario-Out (S1), Cross-Site Domain Shift (S2), and Leave-One-Repetition-Out (S3) with 2,000-resample group-bootstrap 95% CIs.
- **Audited Metrics**: Under S1, achieves **100.0% fire detection rate** with **71.4% [33.3%, 100.0%] nuisance rejection**, **200.0 s median delay** (100 s faster than single-channel particulate thresholding B1 at 300.0 s), and **0.000 false alarms/hour**. Conformal abstention drops ambiguous domain-shift cases, maintaining 84.8% accuracy on non-abstained inputs under cross-site shift (D1 to D2).
- **Model Card**: [`docs/models/m2_fusion_detector.md`](models/m2_fusion_detector.md)

### M4: NASA FLEX Microgravity Flame Extinction Threshold
- **Purpose**: Evaluates atmospheric flammability boundaries ($O_2$, $CO_2$, $N_2$, $He$, ambient pressure, droplet size) to determine whether an atmosphere sustains combustion or enters the extinction regime.
- **Architecture**: L2-regularized Logistic Regression with conservative decision boundary and split-conformal calibration.
- **Evaluation**: Grouped 5-Fold Cross-Validation (partitioned by chemical mixture group) and Leave-One-Fuel-Out (LOFO).
- **Audited Metrics**: Under Grouped CV, achieves **82.4% [75.8%, 88.8%] accuracy** and reduces the safety-critical False Extinction Rate (predicting flameout when fire is still burning) from **100.0% (Majority baseline) to 35.4% [21.6%, 52.8%]**. Split-conformal calibration ($\hat{q}_{0.10} = 0.6994$) yields 96.8% coverage and boosts confident accuracy to **94.9%** (38.1% abstention). LOFO demonstrates catastrophic generalization failure across fuel families (FER 41.9%–76.5%), strictly proving that droplet models must not be extrapolated to solid cabin materials.
- **Model Card**: [`docs/models/m4_flex_extinction.md`](models/m4_flex_extinction.md)

---

## 5. Local Execution Guide

### Prerequisites
- Node.js >= 20 (Node 22 recommended)
- Python >= 3.11 (Python 3.13 supported)

### Running the Application Locally
```bash
# Install frontend dependencies
npm install

# Start local development server (Vite)
npm run dev

# Open browser at http://localhost:5173/response
```

### Running Test Suites
```bash
# TypeScript Unit Tests (211 tests across 15 test suites)
npm test

# Full End-to-End Test Suite (29 Playwright tests, including mobile 390x844 & offline CDN fallback)
npm run test:e2e --prefix apps/web

# Production Build Verification
npm run build

# Code Quality & Linter
npm run lint
```

---

## 6. Model Training & Parity Reproduction

All models can be retrained and validated from source with bit-exact reproducibility:

### Python ML Environment Setup
```bash
# Create and activate Python virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install exact ML dependencies
pip install -r requirements-ml.txt
```

### Reproducing Model Training & Evaluation
```bash
# 1. Train and evaluate M2 Multi-Sensor Fusion Detector
python -m scripts.ml.train_m2_fusion --seed 42

# 2. Calibrate and evaluate M1 NASA SAME/SAME-R Detector Response Model
python -m scripts.ml.calibrate_m1_same --seed 42

# 3. Train and evaluate M4 NASA FLEX Droplet Extinction Model
python -m scripts.ml.train_m4_extinction --seed 42

# 4. Calibrate Conformal Abstention Thresholds (M5)
python -m scripts.ml.calibrate_abstention --seed 42

# 5. Export JSON Model Artifacts and Generate 345 Golden Vectors
python -m scripts.ml.export_models

# 6. Run Python ML Unit Tests (27 tests)
python -m pytest scripts/ml/tests -q

# 7. Run Full Grouped LOOCV Validation Benchmark (80.30% acc)
python scripts/validate/grouped_loocv.py
```

All exported JSON models reside in `apps/web/src/data/models/` and are validated against TypeScript golden parity fixtures via `npm test`.
