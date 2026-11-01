# IGNIS — Intelligent Guidance from NASA Ignition Studies

> **Query 1,401 NASA flight combustion records. Audit physical provenance. Discover the science.**  
> An empirical flight evidence retrieval system for NASA microgravity combustion research and spacecraft fire safety.

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA%20Space%20Apps-2026-0B3D91?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Project Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/7gkzC_eCZo4?si=LSB5FS33oEKB6Tgs)
[![License: MIT](https://img.shields.io/badge/License-MIT-79dce8?style=for-the-badge)](LICENSE)

---

## 💡 What This Is (in plain English)

Have you ever wondered what happens to a fire in space? Without gravity pulling down heavy cold air and pushing up light hot air, flames don't flicker or rise into tall teardrops. Instead, they form quiet, glowing spheres that can choke on their own exhaust — unless cabin fans are blowing air past them.

**IGNIS** is an interactive visual simulator and evidence tool built on real NASA spaceflight tests:
1. **Interactive 3D Flame**: Adjust gravity (space station freefall, Moon, or Mars), cabin oxygen, and ventilation airflow to see the flame morph live.
2. **What NASA Actually Saw**: Next to the flame, see what happened in 132 real spaceflight tests aboard the International Space Station (BASS-II) and Cygnus cargo spacecraft (Saffire).
3. **No Fake Risk Scores**: We never show fake "safety scores" or invented physics. If NASA tested conditions close to yours, we tell you whether a flame was photographed or went out. If NASA has never tested it yet (such as fires on the Moon or Mars), IGNIS tells you honestly.

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
| **Overall Accuracy** | 92.42% (122/132) | 91.67% (121/132) | +0.76% [-4.55%, +6.82%] ($p = 1.0000$) |
| **Balanced Accuracy** | 87.89% | 85.55% | +2.34% [-5.88%, +10.85%] |
| **Extinction Recall** | 84.00% (21/25) | 76.00% (19/25) | +8.00% [-16.67%, +33.33%] |

### Honest Finding:
Because every 95% bootstrap confidence interval for the performance difference spans zero, the multi-factor matcher demonstrates **no statistically validated performance advantage** over a simple oxygen threshold rule.

The value of IGNIS is not automated decision-making or outcome forecasting, but **epistemic provenance retrieval**: allowing engineers to inspect the 5 closest actual flight tests in parameter space, examine their raw CSV rows, check calibrated airflow formulas, and review primary NASA publications.

---

## 💻 Tech Stack & Local Execution

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Lucide icons.
- **Client Matcher**: Standalone TypeScript matcher (`apps/web/src/lib/matcher/`) executing directly in the browser with zero backend dependency.
- **Dataset**: Precompiled `evidence_runs.json` (1,401 runs) and `evidence_solid.json` (132 usable solid runs).

### Development & Build
```bash
# Install dependencies
npm install

# Run unit tests (TypeScript matcher parity, Fact provenance, and copy-lint honesty guards)
npm test

# Build production bundle
npm run build

# Preview locally
npm run preview
```

---

## 📜 Non-Operational Research Disclaimer
IGNIS is an interactive educational and research exploration tool developed for NASA Space Apps Challenge 2026. Computations and similarity retrievals provided by IGNIS do **NOT** constitute official spacecraft flight qualification, mission safety clearance, or certified life-support engineering compliance under **NASA-STD-6001B**. Real spacecraft operations must follow designated NASA Flight Safety Review Boards.
