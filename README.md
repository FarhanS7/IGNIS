# IGNIS — Intelligent Guidance from NASA Ignition Studies

> **Query 1,401 NASA flight combustion records. Audit physical provenance. Discover the science.**  
> An empirical flight evidence retrieval system for NASA microgravity combustion research and spacecraft fire safety.

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA%20Space%20Apps-2026-0B3D91?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Project Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/7gkzC_eCZo4?si=LSB5FS33oEKB6Tgs)

## 🚀 Live Demo
- **Hosted Web Application**: `<ADD LIVE URL>`
- **Video Walkthrough**: [YouTube Demo](https://youtu.be/7gkzC_eCZo4?si=LSB5FS33oEKB6Tgs)

[![License: MIT](https://img.shields.io/badge/License-MIT-79dce8?style=for-the-badge)](LICENSE)

---

## 💡 What This Is (in plain English)

Have you ever wondered what happens to a fire in space? Without gravity pulling down heavy cold air and pushing up light hot air, flames don't flicker or rise into tall teardrops. Instead, they form quiet, glowing spheres that can choke on their own exhaust — unless cabin fans are blowing air past them.

**IGNIS** is an interactive visual simulator and evidence tool built on real NASA spaceflight tests:
1. **Interactive 3D Flame**: Adjust gravity (space station freefall, Moon, or Mars), cabin oxygen, and ventilation airflow to see the flame morph live.
2. **What NASA Actually Saw**: Next to the flame, see what happened in 132 real spaceflight tests aboard the International Space Station (BASS-II) and Cygnus cargo spacecraft (Saffire).
3. **No Fake Risk Scores**: We never show fabricated risk scores or invented physics. If NASA tested conditions close to yours, we tell you whether a flame was photographed or went out. If NASA has never tested it yet (such as fires on the Moon or Mars), IGNIS tells you honestly.

**IGNIS** is an empirical flight evidence system developed for the **NASA International Space Apps Challenge 2026** under Challenge #8:  
**_Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data_**.

### The Core Principle
> **The system does not invent combustion physics — NASA flight experiments are the sole source of truth.**

Decades of NASA microgravity combustion research (aboard the International Space Station and Cygnus cargo vehicles) contain invaluable physical flight observations. IGNIS indexes these primary flight tables, provides instant similarity-based nearest-neighbor retrieval, and links every displayed factor directly to its raw CSV row and DOI publication.

---

## 📊 Ingested NASA Flight Evidence Corpus

IGNIS indexes **1,401 total flight runs** across **14 physical investigations** in the NASA Physical Sciences Informatics (PSI) repository:

| ID | Investigation Name | Fuel Tier | Flight Platform | Ingested Runs | Primary DOI |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **PSI-25** | BASS-II (Burning and Suppression of Solids II) | Solid (Habitat) | ISS MSG | 129 | [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67) |
| **PSI-26** | BASS (Burning and Suppression of Solids) | Solid (Habitat) | ISS MSG | 122 | [10.60555/58h4-dy80](https://doi.org/10.60555/58h4-dy80) |
| **PSI-98** | Saffire-I (Spacecraft Fire Experiment I) | Solid (Habitat) | Cygnus OA-6 | 4 | [10.60555/0t15-1z43](https://doi.org/10.60555/0t15-1z43) |
| **PSI-99** | Saffire-II (Spacecraft Fire Experiment II) | Solid (Habitat) | Cygnus OA-5 | 15 | [10.60555/2chp-m469](https://doi.org/10.60555/2chp-m469) |
| **PSI-100** | Saffire-III (Spacecraft Fire Experiment III) | Solid (Habitat) | Cygnus OA-7 | 2 | [10.60555/040q-4h36](https://doi.org/10.60555/040q-4h36) |
| **PSI-69** | FLEX (Flame Extinction Experiment) | Droplet (Fundamental) | ISS CIR | 274 | [10.60555/mbq8-0451](https://doi.org/10.60555/mbq8-0451) |
| **PSI-68** | FLEX-2 (Flame Extinction Experiment 2) | Droplet (Fundamental) | ISS CIR | 8 | [10.60555/byp8-h018](https://doi.org/10.60555/byp8-h018) |
| **PSI-10** | Flame Design (Spherical/Inverse Diffusion) | Gas Flame (Fundamental) | ISS CIR | 327 | [10.60555/w4zy-bt45](https://doi.org/10.60555/w4zy-bt45) |
| **PSI-20** | ACME BRE (Burning Rate Emulator) | Gas Flame (Fundamental) | ISS CIR | 18 | [10.60555/vb93-3y72](https://doi.org/10.60555/vb93-3y72) |
| **PSI-21** | ACME CLD (Coflow Laminar Diffusion) | Gas Flame (Fundamental) | ISS CIR | 32 | [10.60555/23e1-9950](https://doi.org/10.60555/23e1-9950) |
| **PSI-22** | ACME E-FIELD (Electric-Field Flames) | Gas Flame (Fundamental) | ISS CIR | 32 | [10.60555/se5a-8c73](https://doi.org/10.60555/se5a-8c73) |
| **PSI-23** | ACME s-Flame (Spherical Flames) | Gas Flame (Fundamental) | ISS CIR | 18 | [10.60555/k57n-p030](https://doi.org/10.60555/k57n-p030) |
| **PSI-39** | CFI (Confined Combustion - Flat) | Gas Flame (Fundamental) | ISS MSG | 87 | [10.60555/m6pj-a914](https://doi.org/10.60555/m6pj-a914) |
| **PSI-159** | CFI-G (Confined Combustion - Normal/Inverse) | Gas Flame (Fundamental) | ISS MSG | 333 | [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64) |
| **Total** | **14 Flight Investigations** | **Solid, Droplet, Gas** | **ISS CIR, MSG, Cygnus** | **1,401** | — |

### Usable Solid Runs for Matching: 132 Runs
- **Habitat Solid Total**: 272 runs (BASS, BASS-II, Saffire-I/II/III).
- **Usable for Matcher**: 132 runs. These runs possess verified fuel material mapping (PMMA, SIBAL cotton blend, Nomex, silicone), complete measured $O_2$ concentrations, and physical flow conversions without sensor telemetry failure.
- **Excluded Runs**: 140 runs were excluded from similarity matching due to:
  1. Sensor calibration drift (e.g. Test B2 and four other runs with $|\Delta O_2| > 5\%$ caused by MSG paramagnetic analyzer drift, documented in BASS-II ReadMe paragraph 22).
  2. Missing flow dial records.
  3. Unmapped proprietary composite materials.
- **Fundamental Science Partition**: 1,129 droplet and gas runs are partitioned into a dedicated Fundamental Science tab and excluded from the habitat solid matcher.

---

## 🔬 Physical Assumptions & Epistemic Boundaries

1. **Pressure Assumption (Untested in Flight)**:
   No solid-fuel flight combustion experiment (BASS, BASS-II, Saffire) measured chamber pressure during flight runs. All runs took place inside nominal 1 atm (101.325 kPa) cabin environments. Pressure is marked as `assumed` across all flight records and excluded from similarity distance scoring.
2. **Gravitational Transfer Boundary**:
   All matched flight runs were conducted in microgravity (~0 g). Transferring microgravity findings to partial gravity (Lunar 0.16 g, Mars 0.38 g) is physically untested in flight; IGNIS shows a persistent notice whenever partial gravity is selected.
3. **Outcome Classes & BASS-II Frame Counts**:
   Outcome labels are categorized strictly per source documents:
   - `frames_recorded`: Displayed as *"Photographed burn: frames recorded"*. Frame count includes post-burn images (BASS-II ReadMe). The term "flame spread" is not used for this class.
   - `extinguished`: Displayed as *"PI-noted extinction"*.
   - `no_ignition`: Displayed as *"PI-noted no ignition"*.

---

## 📈 Cross-Validation & Statistical Performance Limits

To evaluate whether multi-factor similarity matching provides predictive utility over simple rules, we conducted grouped leave-one-out cross-validation (Grouped LOOCV) grouped by fuel material and sample geometry (110 independent test groups across 132 usable solid runs), benchmarked against a single-parameter oxygen threshold rule:

| Metric | Full Matcher ($k=5$) | $O_2$ Threshold Rule | Difference (95% Bootstrap CI) |
| :--- | :---: | :---: | :---: |
| **Overall Accuracy** | 80.30% (106/132) | 79.55% (105/132) | +0.76% [-4.55%, +6.82%] ($p = 1.0000$) |
| **Balanced Accuracy** | 46.72% | 44.38% | +2.34% [-5.88%, +10.85%] |
| **Extinction Recall** | 48.00% (12/25) | 40.00% (10/25) | +8.00% [-16.67%, +33.33%] |

### Honest Finding & Retraction of Leaked Figures:
Because every 95% bootstrap confidence interval for the performance difference spans zero and exact McNemar test yields $p = 1.0000$, the multi-factor matcher demonstrates **no statistically validated performance advantage** over a single oxygen threshold rule.

**Retraction of Ungrouped Cross-Validation:** Earlier project snapshots reported 92.42% overall accuracy, 87.89% balanced accuracy, and 84.00% extinction recall. As documented in `docs/VALIDATION.md`, those figures were an artifact of ungrouped sample-level cross-validation, where repeated burns of the same physical hardware sample (e.g. sample tag 133 tested 3 times) leaked between training and test folds. Under strict grouped leave-one-group-out cross-validation across all 110 independent hardware groups, performance is **80.30% overall accuracy (106/132)**, **46.72% balanced accuracy**, and **48.00% extinction recall (12/25)**.

The value of IGNIS is not automated decision-making or outcome forecasting, but **epistemic provenance retrieval**: allowing engineers to inspect the 5 closest actual flight tests in parameter space, examine their raw CSV rows, check calibrated airflow formulas, and review primary NASA publications.

---

## 🛡️ Assistant Abstention & Benchmark Validation

To prevent hallucinations and out-of-distribution speculation, the assistant enforces strict abstention rules (`score < 12.0` or `groundedness < 5.0`, plus `detectUntestedCondition`). Complete evaluation methodology and per-question logs are in [`docs/EVALUATION.md`](docs/EVALUATION.md):

- **Development Set (30 Questions, rule calibrated on it)**:
  - Answerable retrieval: 55.0% Recall@1, 85.0% Recall@5, MRR 0.677, 0.0% false abstentions (0/20)
  - Out-of-scope abstention rate: **100.0%** (5/5)
  - Untested environmental boundary flagging rate: **100.0%** (5/5)
- **Held-Out Test Set (26 Questions, unseen evaluation)**:
  - Answerable false-abstention rate: **0.00% (0/14)** (scores 19.03–46.07, all answered with verified chunks)
  - Out-of-scope abstention rate: **83.33% (5/6)** — Failed on `holdout-20` (*"What was the Apollo 13 oxygen tank failure?"*, score 14.15) due to lexical overlap with legitimate BASS-II oxygen sensor calibration logs
  - Untested regime keyword flag rate: **16.67% (1/6)** — Exposes keyword brittleness when questions use novel phrasing (*"Moon base"*, *"spinning habitat with artificial gravity"*, *"one-third Earth gravity"*)
  - Untested regime composite abstention rate: **100.00% (6/6)** — Groundedness safety floor ($\text{score} \times \text{coverage} < 5.0$) safely caught all ungrounded queries missed by keywords
- **Cross-Engine Parity**: Shipped TypeScript client and Python offline pipeline achieve **100.0% decision agreement** across all 56 benchmark questions (0 decision disagreements, 0.00 BM25 score gap). Continuous integration validates parity via `npm test`.

---

## 🚒 Fire Response Console (`/response`)

The **Fire Response Console** simulates multi-sensor fire detection, time-of-arrival smoke localization, and emergency response sequencing across microgravity habitat modules (ISS-like, uncrewed payload carrier, or lunar surface habitat):

- **Three Selectable Detector Arms**:
  - *Heuristic Multi-Sensor Fusion*: Combines optical obscuration (%/m), carbon monoxide (ppm), and thermal rate-of-rise (°C/min) across a persistence window to discriminate true combustion from non-fire dust or aerosol nuisance events.
  - *Baseline Photoelectric*: Single-channel detector calibrated with empirical NASA SAME-R microgravity particle response curves (`calibrated:m1-same-r`), modeling the physical sensitivity reduction on sub-micron smoke (mean Teflon multiplier 0.257).
  - *Trained ML Fusion*: L2-logistic multi-sensor classifier (`trained:m2-fusion-v1`) trained on ground fire datasets, achieving 100.0% fire detection with a 100 s latency reduction over particulate thresholding and 0.000 false alarms/hour, accompanied by a persistent honest disclosure banner: *"Trained on Earth-gravity data. Not validated in microgravity."*
- **Droplet Extinction Insight (NASA FLEX)**: In Step 5 (`SUPPRESSION`), evaluates chemical flammability limits powered by a conformal logistic model trained on 262 NASA FLEX/FLEX-2 microgravity droplet burns (`trained:m4-extinction-v1`), explicitly caveated (*"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."*) to prevent invalid extrapolation.
- **Ventilation Transport & Mixing**: Advection along forced ventilation duct networks accounts for zero-buoyancy dispersion, grounded in qualitative findings from NASA SAME (NTRS-20130000422).
- **Categorical Localization**: Smoke origin inference reports discrete categories (`CLEAR`, `CLOSE`, `AMBIGUOUS`, `INSUFFICIENT_EVIDENCE`) based on inter-zone arrival delays rather than misleading pseudo-probabilities.
- **Emergency Containment Sequencing**: Progresses through `ALARM` → `REMOVE_POWER` → `ISOLATE_VENTILATION` → `INHIBIT_MAKEUP` → `SUPPRESSION` → `POST_FIRE_RECOVERY`. In crewed modules, suppression strictly requires explicit human confirmation to safeguard astronaut breathing volumes, warning against CO2 flooding without breathing apparatus (NTRS-20130011664).
- **Flight Data Provenance**: For each response action (e.g. flow cutoff), queries real NASA BASS-II flight runs to inspect empirical extinction behavior, accompanied by validation circularity caveats and environmental envelope warnings.
- **Parameter Registry & Sweep**: All simulation parameters reside in a single registry (`sim_params.ts`), each tagged with engineering rationale and plausible ranges (`[min, max]`) evaluated by a built-in Monte Carlo design-consistency sweep.
- **Persistent Honesty Banner**: Displays *"Simulated sensor data. Not flight software."* Extinction outcomes come solely from NASA flight evidence; the simulator never predicts flame extinction.
- **Detailed Documentation**:
  - Architecture & Reproduction Guide: [`docs/FIRE_RESPONSE.md`](docs/FIRE_RESPONSE.md)
  - Known Engineering Limitations: [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md)
  - Model Cards:
    - M1 SAME Detector Response: [`docs/models/m1_same_detector_response.md`](docs/models/m1_same_detector_response.md)
    - M2 Multi-Sensor Fusion Detector: [`docs/models/m2_fusion_detector.md`](docs/models/m2_fusion_detector.md)
    - M4 FLEX Flame Extinction Threshold: [`docs/models/m4_flex_extinction.md`](docs/models/m4_flex_extinction.md)

---

## 📚 Dataset Attribution & Open Licenses

In accordance with open-science standards and creative commons license terms, we attribute all primary experimental datasets utilized in IGNIS as recorded in [`data/provenance/ml_manifest.json`](data/provenance/ml_manifest.json):

| Dataset ID | Dataset Title | Authors / Source Organization | Persistent Identifier (DOI) | Open License | Usage in IGNIS |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **D1** | Indoor Fire Dataset with Distributed Multi-Sensor Nodes (EN54 Room) | Pascal Vorwerk et al., Otto von Guericke University Magdeburg (*MDPI Fire 2023, 6, 323*) | [10.17632/npk2zcm85h.2](https://doi.org/10.17632/npk2zcm85h.2) | CC BY 4.0 | Training & validation of M2 multi-sensor fusion detector |
| **D2** | Indoor Fire Dataset with Distributed Multi-Sensor Nodes (Industrial Hall) | Pascal Vorwerk et al., Otto von Guericke University Magdeburg | [10.17632/yghykzm4km.1](https://doi.org/10.17632/yghykzm4km.1) | CC BY 4.0 | Cross-site domain generalization evaluation of M2 |
| **D3** | Indoor Fire Dataset of Multi Sensor Data (Small Scale Test Chamber) | Pascal Vorwerk et al., Otto von Guericke University Magdeburg | [10.17632/m85f9h6g9j.1](https://doi.org/10.17632/m85f9h6g9j.1) | CC BY 4.0 | Benchmark reference & multi-sensor validation |
| **D4** | Smoke Aerosol Measurement Experiment (SAME / PSI-102) | David L. Urban et al., NASA Glenn Research Center | [10.60555/gd4k-8h62](https://doi.org/10.60555/gd4k-8h62) | CC0-1.0 (Public Domain) | M1 microgravity photoelectric response calibration |
| **D5** | Smoke Aerosol Measurement Experiment-Reflight (SAME-R / PSI-101) | David L. Urban et al., NASA Glenn Research Center | [10.60555/2np7-jv14](https://doi.org/10.60555/2np7-jv14) | CC0-1.0 (Public Domain) | M1 detector calibration across 5 spacecraft materials |
| **D6** | Flame Extinguishment Experiment (FLEX / PSI-69 & FLEX-2 / PSI-68) | Forman A. Williams et al., NASA PSI Repository | [10.60555/psi-69-flex](https://doi.org/10.60555/psi-69-flex) | CC0-1.0 (Public Domain) | M4 microgravity droplet flame extinction boundary model |

---

## 💻 Tech Stack & Local Execution

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Recharts, Lucide icons.
- **Client Inference Engines**: Pure TypeScript client-side matchers and ML inference engines (`apps/web/src/lib/fire/ml/`) executing deterministically in the user's browser with zero runtime dependencies.
- **Dataset**: Precompiled `evidence_runs.json` (1,401 runs) and `evidence_solid.json` (132 usable solid runs).

### Development & Build
```bash
# Install dependencies
npm install

# Run full TypeScript unit test suite (211 tests across 15 suites)
npm test

# Run Playwright end-to-end browser tests (29 tests: routes, console, mobile, offline)
npm run test:e2e --prefix apps/web

# Build production bundle
npm run build

# Preview locally
npm run preview
# or: npm --prefix apps/web run preview
```

### Python ML Reproduction
```bash
# Install exact ML dependencies
pip install -r requirements-ml.txt

# Run Python ML test suite (27 tests)
python -m pytest scripts/ml/tests -q

# Run Grouped LOOCV Validation Benchmark (80.30% accuracy)
python scripts/validate/grouped_loocv.py

# Re-train models and verify TS/Python parity
python -m scripts.ml.train_m2_fusion --seed 42
python -m scripts.ml.calibrate_m1_same --seed 42
python -m scripts.ml.train_m4_extinction --seed 42
python -m scripts.ml.export_models
```

---

## 🤖 AI Tool Usage Disclosure

In compliance with NASA Space Apps Challenge guidance, we disclose the use of artificial intelligence tools in this project:
- **Coding & Agentic Pair Programming**: AI coding assistants (<CONFIRM: specify AI IDE tools used, e.g. Google Antigravity / Claude Code>) were used for code drafting, refactoring, test scaffolding, and continuous verification under human architectural supervision.
- **Human Verification**: All code changes, mathematical derivations, and verification outputs were reviewed and confirmed by human authors (<CONFIRM: list team member names who verified the codebase>).
- **Epistemic Data Integrity**: All physical flight tables, fuel material properties, and DOI citations are extracted directly from primary NASA PSI files and NTRS publications without generative fabrication.
- **In-Browser Determinism**: The client-side application runs 100% deterministically in the user's browser using bundled JSON corpora without mandatory external LLM calls.
- **Optional API Assistant**: The companion backend (`services/api`) contains optional endpoints interfacing with Gemini (<CONFIRM: specify exact Gemini model version configured, e.g. Gemini 1.5 Flash>) for natural language synthesis, guarded by client-side verbatim citation verifiers (`apps/web/src/lib/assistant/client_verifier.ts`).

---

## 📜 Non-Operational Research Disclaimer
IGNIS is an interactive educational and research exploration tool developed for NASA Space Apps Challenge 2026. Computations and similarity retrievals provided by IGNIS do **NOT** constitute official spacecraft flight qualification, mission safety clearance, or certified life-support engineering compliance under **NASA-STD-6001B**. Real spacecraft operations must follow designated NASA Flight Safety Review Boards.
