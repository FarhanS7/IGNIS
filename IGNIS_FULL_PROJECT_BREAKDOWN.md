# IGNIS: Intelligent Guidance from NASA Ignition Studies
## Comprehensive System Architecture, Data Provenance, Physical Science & Feature Breakdown

> **Event**: NASA International Space Apps Challenge 2026  
> **Challenge**: Challenge #8 — *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data*  
> **Core Principle**: *The system does not invent combustion physics — NASA flight experiments are the sole source of truth.*  
> **Repository**: [GitHub — FarhanS7/IGNIS](https://github.com/FarhanS7/IGNIS)  
> **Production Branch**: `main` (with release branch `v3-friendly`)  

---

## Table of Contents

1. [Executive Summary & The Core Problem](#1-executive-summary--the-core-problem)
2. [Physical Science: Combustion in Freefall vs. Earth](#2-physical-science-combustion-in-freefall-vs-earth)
3. [NASA PSI Flight Evidence Corpus & Data Provenance](#3-nasa-psi-flight-evidence-corpus--data-provenance)
4. [The 132-Run Habitat Solid Evidence Partition](#4-the-132-run-habitat-solid-evidence-partition)
5. [System Architecture & Technology Stack](#5-system-architecture--technology-stack)
6. [Mathematical Matching Engine (TypeScript & Python Parity)](#6-mathematical-matching-engine-typescript--python-parity)
7. [AI Grounding, BM25 Retrieval & Honesty Guards](#7-ai-grounding-bm25-retrieval--honesty-guards)
8. [Full Feature Tour & Student-Friendly UX (5-Second Rule)](#8-full-feature-tour--student-friendly-ux-5-second-rule)
   - 8.1 [Visual Simulator (`/simulator`)](#81-visual-simulator-simulator)
   - 8.2 [Learn Mode / Story Mode (`/explore`)](#82-learn-mode--story-mode-explore)
   - 8.3 [Ask IGNIS (`/ask` & Floating Drawer)](#83-ask-ignis-ask--floating-drawer)
   - 8.4 [What's Untested / Research Gaps (`/gaps`)](#84-whats-untested--research-gaps-gaps)
   - 8.5 [Data & Sources Explorer (`/explorer`)](#85-data--sources-explorer-explorer)
   - 8.6 [Evidence Brief & PDF/Print Report](#86-evidence-brief--pdfprint-report)
9. [Verification, Cross-Validation & The 5-Second UX Test](#9-verification-cross-validation--the-5-second-ux-test)
10. [Local Development & Deployment Guide](#10-local-development--deployment-guide)
11. [Glossary & Terminology Audit](#11-glossary--terminology-audit)

---

## 1. Executive Summary & The Core Problem

### The Challenge
Fire is the most catastrophic threat aboard human spacecraft. When astronauts live and work inside sealed habitats—such as the International Space Station (ISS), the Artemis Lunar Gateway, or future Mars transit vehicles—they rely entirely on life support ventilation. Understanding how solid materials (clothing, acrylic windows, insulation, circuit boards) ignite, sustain flames, or self-extinguish in altered gravity is crucial for mission design.

### The Problem With Traditional Approaches
Most digital tools attempting to address spacecraft fire safety suffer from two critical flaws:
1. **Unsubstantiated Physics Simulations**: Simulating multi-phase turbulent combustion from Navier-Stokes equations with solid pyrolysis requires dozens of unmeasured kinetic parameters. Purely theoretical simulations generate convincing animations that often contradict real microgravity physics.
2. **Fake AI "Risk Scores"**: Generic AI models invent safety percentages (e.g., *"This condition has an 82% risk score"* or *"Condition is SAFE"*). In human spaceflight, **inventing numbers is dangerous**. An untested lunar atmosphere is not "safe" or "unsafe"—it is simply **untested**.

### The IGNIS Paradigm: Empirical Retrieval
IGNIS solves this problem through an **empirical evidence retrieval system**. Rather than synthesizing synthetic physics, IGNIS indexes **1,401 primary NASA flight combustion records** across 14 flight campaigns conducted on the ISS and Cygnus cargo spacecraft. 

When a user adjusts environmental sliders (gravity, oxygen percentage, airflow, material):
1. **The 3D Flame**: Morphologically illustrates known physical phenomena (spherical expansion, quenching, buoyancy elongation) with an explicit disclaimer: *"Illustrative visualization, not a physics simulation."*
2. **The Result Card ("What did NASA actually see?")**: Queries the real flight record using normalized multi-factor nearest-neighbor matching. It reports verbatim flight outcomes: how many times NASA tested conditions close to this, whether flames were photographed, or whether flames went out.
3. **Honest Gap Warnings**: If the user selects conditions NASA has never flown (such as lunar gravity $0.16g$ or oxygen $>22.2\%$), IGNIS immediately states: *"NASA hasn't tested anything close to this yet."* and highlights the missing parameters.

---

## 2. Physical Science: Combustion in Freefall vs. Earth

To understand why IGNIS is designed the way it is, one must understand how fire behaves when gravity is removed:

```
               ON EARTH (1.0g)                         IN FREEFALL (0.0g)
      Natural Convection & Buoyancy               Diffusion-Controlled Quenching

               / \  <-- Flickering Tip                       .---.
              /   \     (Buoyancy plume)                    /     \   <-- Quiet, Cool
             |     |                                       |   *   |      Spherical Flame
             |  *  |    Hot gas rises,                     |       |      (Blue/Soot-free)
             \     /    pulls cold O2 in                    \     /
              \___/                                          '---'
            =========  Solid Fuel                          =========  Solid Fuel
```

### 1. Buoyancy Disappears
On Earth, a candle or solid flame heats adjacent air. Hot air becomes less dense than surrounding cold air and rises rapidly ($1$ to $2\text{ m/s}$). This creates natural convection: the rising plume pulls fresh oxygen into the base of the flame, resulting in the familiar teardrop shape and yellow soot flicker.

In orbital freefall ($0g$), hot air does not rise. Light gas and heavy gas weigh the same. Natural convection drops to **zero**.

### 2. The Spherical Flame and Oxygen Starvation
Without convection, oxygen can only reach the flame zone through **molecular diffusion** (Brownian motion), which is orders of magnitude slower than buoyant flow. The flame spreads out uniformly in all directions, forming a **dim, blue, quiet spherical sphere**.

Combustion products (carbon dioxide and water vapor) linger around the flame, forming an insulating blanket. Unless forced ventilation is present, a microgravity flame quickly **chokes on its own exhaust and extinguishes**.

### 3. The Ventilation Paradox
Because natural convection is absent, spacecraft cabin ventilation fans become the sole supplier of oxygen:
- **Low Airflow ($<2\text{ cm/s}$)**: The flame starves from lack of oxidizer and extinguishes.
- **Moderate Airflow ($5\text{--}15\text{ cm/s}$)**: The flame thrives. Fresh oxygen is continuously swept in, and heat is transferred into the fuel ahead of the burn front.
- **High Airflow ($>30\text{--}40\text{ cm/s}$)**: The gas velocity exceeds the flame spread rate, blowing heat away and causing **blowoff extinction**.

This creates a **flammability U-curve**: materials that are non-flammable on Earth can become flammable in spacecraft airflow regimes, and vice versa.

---

## 3. NASA PSI Flight Evidence Corpus & Data Provenance

All data in IGNIS originates from the **NASA Physical Sciences Informatics (PSI)** repository, verified against published primary literature and NASA Technical Reports Server (NTRS) technical papers.

### The 14 Ingested Flight Investigations (1,401 Total Runs)

| Investigation ID | Experiment Name | Fuel Tier | Platform | Ingested Runs | Primary DOI / Publication |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **PSI-25** | BASS-II (Burning and Suppression of Solids II) | Solid (Habitat) | ISS MSG | 129 | [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67) |
| **PSI-26** | BASS (Burning and Suppression of Solids) | Solid (Habitat) | ISS MSG | 122 | [10.60555/58h4-dy80](https://doi.org/10.60555/58h4-dy80) |
| **PSI-98** | Saffire-I (Spacecraft Fire Experiment I) | Solid (Habitat) | Cygnus OA-6 | 4 | [10.60555/0t15-1z43](https://doi.org/10.60555/0t15-1z43) |
| **PSI-99** | Saffire-II (Spacecraft Fire Experiment II) | Solid (Habitat) | Cygnus OA-5 | 15 | [10.60555/2chp-m469](https://doi.org/10.60555/2chp-m469) |
| **PSI-100** | Saffire-III (Spacecraft Fire Experiment III) | Solid (Habitat) | Cygnus OA-7 | 2 | [10.60555/040q-4h36](https://doi.org/10.60555/040q-4h36) |
| **PSI-69** | FLEX (Flame Extinction Experiment) | Droplet (Fundamental) | ISS CIR | 274 | [10.60555/mbq8-0451](https://doi.org/10.60555/mbq8-0451) |
| **PSI-68** | FLEX-2 (Flame Extinction Experiment 2) | Droplet (Fundamental) | ISS CIR | 8 | [10.60555/byp8-h018](https://doi.org/10.60555/byp8-h018) |
| **PSI-10** | Flame Design (Inverse & Normal Gas Flame) | Gas Flame (Fundamental) | ISS CIR | 327 | [10.60555/w4zy-bt45](https://doi.org/10.60555/w4zy-bt45) |
| **PSI-20** | ACME BRE (Burning Rate Emulator) | Gas Flame (Fundamental) | ISS CIR | 18 | [10.60555/vb93-3y72](https://doi.org/10.60555/vb93-3y72) |
| **PSI-21** | ACME CLD (Coflow Laminar Diffusion) | Gas Flame (Fundamental) | ISS CIR | 32 | [10.60555/23e1-9950](https://doi.org/10.60555/23e1-9950) |
| **PSI-22** | ACME E-FIELD (Electric-Field Flames) | Gas Flame (Fundamental) | ISS CIR | 32 | [10.60555/se5a-8c73](https://doi.org/10.60555/se5a-8c73) |
| **PSI-23** | ACME s-Flame (Spherical Flames) | Gas Flame (Fundamental) | ISS CIR | 18 | [10.60555/k57n-p030](https://doi.org/10.60555/k57n-p030) |
| **PSI-39** | CFI (Confined Combustion - Flat) | Gas Flame (Fundamental) | ISS MSG | 87 | [10.60555/m6pj-a914](https://doi.org/10.60555/m6pj-a914) |
| **PSI-159** | CFI-G (Confined Combustion - Normal/Inverse) | Gas Flame (Fundamental) | ISS MSG | 333 | [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64) |
| **Total** | **14 Flight Campaigns** | **Solid, Droplet, Gas** | **ISS CIR, MSG, Cygnus** | **1,401** | — |

---

## 4. The 132-Run Habitat Solid Evidence Partition

While all 1,401 records are searchable in the Data Explorer, the habitat fire safety matcher exclusively operates on the **132 validated solid combustion runs**.

### Why 132 Runs Out of 272 Solid Runs?
The habitat solid corpus originally contained 272 raw flight entries across BASS, BASS-II, and Saffire-I/II/III. An automated audit pipeline excluded 140 runs according to strict scientific standards:

```
Total Habitat Solid Runs: 272
 │
 ├── Excluded: Sensor Calibration Drift (5 runs, e.g. Test B2 with |ΔO2| > 5% 
 │             caused by MSG paramagnetic analyzer drift, documented in BASS-II ReadMe §22)
 ├── Excluded: Missing Flow Dial Telemetry (83 runs where flow controller failed or was unrecorded)
 ├── Excluded: Unmapped Proprietary Blends (52 runs with uncharacterized commercial composites)
 │
 └── Validated Usable Habitat Runs: 132
     ├── PMMA (Polymethyl methacrylate - acrylic windows, gloveboxes): 52 runs
     ├── SIBAL (Cotton/fiberglass fabric blend - astronaut clothing analog): 38 runs
     ├── Nomex (Flame-resistant meta-aramid fabric): 28 runs
     └── Silicone (Elastomer seals, gaskets, cable jackets): 14 runs
```

### Pressure Honesty: The Assumed $101.3\text{ kPa}$ Standard
In NASA's Microgravity Science Glovebox (MSG), total atmospheric pressure is maintained at standard sea-level station pressure ($1\text{ atm} \approx 101.3\text{ kPa}$). The BASS-II experimental flight tables recorded oxygen mole fraction, airflow speed, and fuel geometry, but did not log a continuous pressure transducer column in the summary CSV.

**IGNIS preserves scientific honesty**:
- Pressure is stored with an explicit basis badge: `basis: "assumed"`.
- The UI notes: *"Assumed standard ISS cabin pressure ($101.3\text{ kPa}$) in accordance with BASS-II MSG operational parameters."*
- If the user changes cabin pressure to Exploration Atmosphere ($56.0\text{ kPa}$), the matcher factors this deviation into the distance metric and warns that all tests were flown at station pressure.

---

## 5. System Architecture & Technology Stack

IGNIS is structured as a high-performance modern web application with a zero-latency client-side matching engine and a Python data engineering backend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IGNIS Client (Browser)                          │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│    Visual Presentation   │      User Navigation    │   Engine Layer    │
│  • Three.js 3D Flame     │  • Simulator (Home)     │  • RealSolid-     │
│  • Dynamic Buoyancy Mesh │  • Learn (Story Mode)   │    Matcher (TS)   │
│  • Morphing Core Shaders │  • Ask IGNIS            │  • BM25 Science   │
│  • Coachmark Onboarding  │  • What's Untested      │    Retriever      │
│  • Synced Slider Inputs  │  • Data & Sources       │  • Golden Parity  │
└────────────┬─────────────┴────────────┬────────────┴─────────┬─────────┘
             │                          │                      │
             ▼                          ▼                      ▼
┌──────────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│      Vercel Edge SPA     │ │ In-Memory PSI Data │ │ FastAPI / Uvicorn  │
│  • vercel.json rewrites  │ │ • evidence_solid   │ │ • RAG Search       │
│  • Vite bundle (1.11s)   │ │ • material_map     │ │ • QA Benchmarks    │
│  • Gzip assets (738 kB)  │ │ • corpus_chunks    │ │ • LOOCV Validation │
└──────────────────────────┘ └────────────────────┘ └────────────────────┘
```

### Core Technologies
- **Frontend Framework**: React 18, TypeScript, TailwindCSS with custom Vanilla CSS tokens.
- **3D Graphics Engine**: Three.js (`@react-three/fiber`, `@react-three/drei`) with custom particle systems for microgravity sooting, buoyancy pinch, and diffusion spheres.
- **Client Matching Engine**: Pure TypeScript implementation of the multi-factor nearest-neighbor engine with pre-bundled static JSON (`evidence_solid.json`). Runs synchronously in under $1\text{ millisecond}$.
- **Backend Service**: Python 3.11, FastAPI, Uvicorn, Pandas, SciPy, Scikit-learn (used for data ingestion, PDF OCR extraction, grouped cross-validation, and LOOCV analysis).
- **Automated Testing Harness**: Node.js test runner (`node:test`), Playwright Chromium headless runner, copy-lint AST regex checkers.

---

## 6. Mathematical Matching Engine (TypeScript & Python Parity)

The core retrieval logic uses a **Normalized Weighted Euclidean Distance Metric** across multi-dimensional physical space.

### Physical Factor Vector
For any flight test $i$ and user input $u$, the physical state is represented as:
$$\vec{x} = \left[ g, \text{O}_2, v, P, M \right]$$
Where:
- $g$: Gravity acceleration ($g_0$, $0.0g$ to $1.0g$)
- $\text{O}_2$: Oxygen concentration percentage ($0.0\%$ to $40.0\%$)
- $v$: Forced ventilation airflow speed ($\text{cm/s}$, $0.0$ to $55.0\text{ cm/s}$)
- $P$: Total atmospheric pressure ($\text{kPa}$, $30.0$ to $110.0\text{ kPa}$)
- $M$: Material family categorical compatibility ($1.0$ if exact match, $0.5$ if related polymer, $0.0$ if mismatched)

### Distance Formula
The normalized distance $D(u, i)$ between user state $u$ and flight run $i$ is:
$$D(u, i) = \sqrt{ w_g \left(\frac{\Delta g}{R_g}\right)^2 + w_{\text{O}_2} \left(\frac{\Delta \text{O}_2}{R_{\text{O}_2}}\right)^2 + w_v \left(\frac{\Delta v}{R_v}\right)^2 + w_P \left(\frac{\Delta P}{R_P}\right)^2 + w_M (1 - S_M)^2 }$$

Where:
- $R_k$: The normalization range of factor $k$ ($R_{\text{O}_2} = 40.0$, $R_v = 55.0$, $R_P = 80.0$, $R_g = 1.0$).
- $w_k$: Calibrated factor weights based on combustion sensitivity:
  - $w_{\text{O}_2} = 0.35$ (Oxygen concentration has primary chemical kinetic influence)
  - $w_v = 0.30$ (Forced airflow dictates convective oxygen transport)
  - $w_g = 0.20$ (Gravity governs natural buoyancy convection)
  - $w_M = 0.10$ (Material category compatibility)
  - $w_P = 0.05$ (Pressure influence on chemical reaction order)
- $\sum w_k = 1.0$.

### Similarity Metric
The similarity score $S \in [0, 1]$ displayed in the details panel is computed as:
$$S(u, i) = \frac{1}{1 + D(u, i)}$$

### Neighborhood Selection
1. The engine calculates $D(u, i)$ for all $N = 132$ habitat solid runs.
2. Runs are sorted in ascending order of distance.
3. The closest $k \le 3$ runs are retrieved as **"Closest real NASA tests"**.
4. The **Evidence Envelope** evaluates whether $D_{\min} \le D_{\text{threshold}}$ ($0.15$). If all flight runs exceed the threshold (e.g. Moon gravity $0.16g$), the system triggers the friendly un-tested banner.

### Golden Test Parity
The TypeScript matcher (`apps/web/src/lib/matching/real_solid_matcher.ts`) is verified against the Python reference matcher (`services/api/app/matching/real_solid.py`) across a 50-scenario golden test suite (`data/fixtures/golden_scenarios_50.json`). All 50 scenarios produce **$100.0\%$ identical nearest-neighbor run IDs, similarity scores within $10^{-6}$, and identical outcome counts**.

---

## 7. AI Grounding, BM25 Retrieval & Honesty Guards

### Client-Side BM25 Retrieval
Rather than making expensive or unreliable external LLM API calls that hallucinate answers, IGNIS features a high-speed in-browser **BM25 Retrieval-Augmented Generation (RAG) system**:
1. **Corpus**: 14 primary science definition documents and flight mission readmes (BASS-II SRD, Saffire Science Readmes, ACME Science Requirements, etc.) chunked into semantic paragraphs (`data/corpus/chunks.jsonl`).
2. **Term Inverted Index**: Computes BM25 Okapi scores directly in JavaScript:
   $$\text{Score}(D, Q) = \sum_{i=1}^n \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
3. **Response Synthesis**: Synthesizes verbatim excerpts into a concise $2\text{ to }4$ sentence explanation.
4. **Numbered Source Chips**: Every sentence links directly to its source with numbered chips (e.g. `[1] BASS-II Technical Report, p.4`).

### Honesty Guardrail: Zero Hallucination Fallback
If an inquiry falls outside the indexed NASA flight corpus (e.g. *"What happens to diesel fuel on Venus?"* or *"Can I burn wood in Apollo 13?"*), the assistant strictly refuses to guess:
> *"I couldn't find that in the NASA reports I have."*

### Prompt Injection Hardening
The assistant parser sanitizes all inputs against system prompt leakage, roleplaying exploits, and adversarial instruction overrides.

---

## 8. Full Feature Tour & Student-Friendly UX (5-Second Rule)

In release `v3-friendly`, IGNIS was completely restructured around the **5-Second Rule**: *A high-school student must understand the screen within 5 seconds without encountering scientific jargon.*

### 8.1 Visual Simulator (`/simulator`)
The primary interface of IGNIS.

```
┌────────────────────────────────────────────────────────────────────────┐
│  IGNIS  |  Simulator   Learn   Ask   What's untested   Data & Sources  │
├──────────────────────────┬─────────────────────────────────────────────┤
│  DESTINATION PRESETS     │            3D VISUAL FLAME                  │
│  [ Orbital 0g ]          │                                             │
│  [ Moon 0.16g ]          │                 ( * )                       │
│  [ Mars 0.38g ]          │                                             │
│                          │  "Illustrative visualization,               │
│  SLIDERS & NUMBERS       │   not a physics simulation."                │
│  Oxygen:   [===o===] 21% ├─────────────────────────────────────────────┤
│  Airflow:  [=o=====] 5.0 │  WHAT DID NASA ACTUALLY SEE?                │
│  Pressure: [=====o=] 101 │  "NASA tested conditions close to this 12   │
│  Material: [ Acrylic ▾ ] │   times. In 9 of them a flame was photo-    │
│                          │   graphed; in 3 the flame went out."        │
│  [ Compare A vs B ]      │                                             │
│                          │  CLOSEST REAL NASA TESTS                    │
│                          │  1. BASS-II Run 14 · PMMA · 21.0% O2 [DOI]  │
│                          │  2. BASS-II Run 18 · PMMA · 21.0% O2 [DOI]  │
│                          │  3. Saffire-I Run 02 · PMMA · 21.2% O2 [DOI]│
│                          │                                             │
│                          │  ▸ Show the details (Scatter plot & tables) │
└──────────────────────────┴─────────────────────────────────────────────┘
```

#### Key Elements:
1. **Destination Presets**: Instant one-click configurations:
   - **Orbital (ISS)**: $0g$, $21.0\%\text{ O}_2$, $5.0\text{ cm/s}$, $101.3\text{ kPa}$.
   - **Lunar Habitat**: $0.16g$, $34.0\%\text{ O}_2$, $10.0\text{ cm/s}$, $56.0\text{ kPa}$ (NASA Exploration Atmosphere).
   - **Mars Base**: $0.38g$, $28.0\%\text{ O}_2$, $8.0\text{ cm/s}$, $70.3\text{ kPa}$.
2. **Synchronized Sliders**: Dragging a slider updates the numeric input box in real time; typing a number moves the slider.
3. **Compare Mode (A vs B)**: Splits the screen to contrast two different environments side-by-side (e.g. ISS Freefall vs. Lunar Gravity).
4. **Onboarding Tour**: 4-step coachmark walk-through for first-time visitors.
5. **The "What Did NASA Actually See?" Card**:
   - One plain-English summary sentence.
   - Exact outcome verbs: *"flame photographed"*, *"flame went out"*, *"no flame started"*. Never says *"safe"* or *"risk percentage"*.
   - If conditions are untested, displays an amber notice: *"NASA hasn't tested anything close to this yet. No tests above 22% oxygen, and none on the Moon or Mars."*
6. **Collapsible Details**: Scientific scatter plots, factor weighting tables, assumed pressure notices, and validation limits are tucked safely inside an expandable accordion (closed by default).

### 8.2 Learn Mode / Story Mode (`/explore`)
An interactive educational experience that guides users through the fundamentals of microgravity fire science:
- **Chapter 1: The Quiet Flame**: Explains how buoyancy vanishes and why space flames form glowing blue spheres.
- **Chapter 2: The Ventilation Dilemma**: Demonstrates why air conditioning vents dictate fire spread in spacecraft.
- **Chapter 3: Fighting Fire Without Up or Down**: How astronauts extinguish fires when smoke doesn't rise to the ceiling.
- **Chapter 4: The Next Frontier**: Exploration atmospheres for Artemis and Mars.

### 8.3 Ask IGNIS (`/ask` & Floating Drawer)
A dedicated knowledge assistant accessible from both the main navigation bar and a persistent floating action button in the bottom right corner:
- 4 friendly suggested questions:
  - *"What happens to a flame when there is no gravity?"*
  - *"Why does a flame go out if there is no airflow in space?"*
  - *"Has NASA ever tested fires on the Moon or Mars?"*
  - *"What materials burn easiest inside a spacecraft?"*
- Clear answers in $2\text{ to }4$ sentences.
- Direct links to NASA source documents.

### 8.4 What's Untested / Research Gaps (`/gaps`)
Highlights where human spaceflight knowledge ends:
- 5 clean destination cards: **ISS**, **Artemis Gateway**, **Exploration Atmosphere**, **Moon Base**, and **Mars Transit**.
- Plain verdict badges: **"Well tested"**, **"Partly tested"**, and **"Barely tested"**.
- Single-click action: *"Test in simulator"* immediately pre-loads the conditions.
- Collapsed *"How we decide"* section detailing the multi-dimensional distance cutoff.

### 8.5 Data & Sources Explorer (`/explorer`)
Merges the Experiment Explorer and About pages into a clean, transparent data repository:
- **Investigation Highlights**: Quick cards summarizing BASS, BASS-II, and Saffire flight series.
- **"For Researchers" Toggle**: Unrolls the complete 1,401-run virtualized data table.
- **Direct Downloads**: One-click download of the cleaned dataset in CSV and JSON formats.

### 8.6 Evidence Brief & PDF/Print Report
Clicking *"Export Evidence Brief"* generates a publication-ready scientific summary:
- Selected environmental parameters.
- Nearest flight matches with full DOIs and raw CSV row references.
- 2D Evidence Envelope Scatter Plot.
- Print-optimized CSS styling for NASA design reviews.

---

## 9. Verification, Cross-Validation & The 5-Second UX Test

### 1. Grouped Leave-One-Out Cross-Validation (LOOCV)
To prove the reliability of the matching engine without data leakage, the matcher underwent grouped cross-validation grouped by material and experiment run blocks:
- **Overall Accuracy**: **$92.4\%$** across flight outcome classifications.
- **Extinction Recall**: **$88.2\%$** (flame quenching prediction).
- **Bootstrap $95\%$ Confidence Interval**: $[0.864, 0.961]$.
- **McNemar Test vs. Baseline Classifier**: $p < 0.001$ (statistically significant superiority over majority-class baseline).

### 2. The Circularity Check
During the development audit, BASS-II test matrix entries were audited for potential circularity between fan dial notes and extinction events. When rows deriving both flow and outcome from display notes were masked or excluded:
- Full Dataset LOOCV: $92.4\%$ accuracy.
- Excluded Questionable Rows: $91.8\%$ accuracy.
- Flow Masked: $89.5\%$ accuracy.
This confirms that the engine's predictive power stems from underlying thermodynamic correlations rather than textual artifacts.

### 3. Automated Copy-Lint Honesty Guard
A dedicated AST test suite (`apps/web/src/tests/copy_lint.test.ts`) inspects the UI copy to ensure strict honesty:
- **Forbidden Terms**: `"safe"`, `"unsafe"`, `"risk percentage"`, `"fire hazard score"`, `"confidence: 99%"`.
- **Mandatory Disclaimers**: Assumed pressure notice and the 3D flame visualization disclaimer.
- If any developer inadvertently adds an unbacked claim, the test suite halts the build.

### 4. The 5-Second Student UX Test
Documented in `docs/UX_TEST.md`, Playwright automated tests captured 14 full-screen screenshots across Desktop ($1440\times900$) and Mobile ($390\times844$) viewports to evaluate four criteria:

| Screen | One Obvious Action? | Flame Meaning Clear? | Scientific Jargon Hidden? | Numbers on Screen? | Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Landing (`/`)** | Yes ("Try Simulator") | Yes (Spherical freefall) | Yes (Zero jargon) | 3 ($\le 6$) | **PASS** |
| **Simulator Default** | Yes (Sliders / Presets) | Yes (Label + plain counts) | Yes (Details collapsed) | 5 ($\le 6$) | **PASS** |
| **Simulator Moon** | Yes (Lunar card active) | Yes ("None on Moon") | Yes (Plain explanation) | 5 ($\le 6$) | **PASS** |
| **Simulator High $\text{O}_2$**| Yes (Slider control) | Yes ("None above 22%") | Yes (Plain warning) | 5 ($\le 6$) | **PASS** |
| **Learn / Story Mode** | Yes ("Start Story") | Yes (Buoyancy narrative) | Yes (Student-oriented) | 4 ($\le 6$) | **PASS** |
| **Ask IGNIS** | Yes (4 suggestion chips) | Yes (2-4 sentence answers) | Yes (Numbered chips) | 4 ($\le 6$) | **PASS** |
| **What's Untested** | Yes ("Test in simulator")| Yes (Tested verdict badge)| Yes (Formulas collapsed) | 4 ($\le 6$) | **PASS** |

**Overall 5-Second Test Score**: **$100\%$ ($7\text{ of }7$ screens passed)**.

---

## 10. Local Development & Deployment Guide

### Prerequisites
- Node.js 18+ or 20+
- Python 3.10+ or 3.11+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/FarhanS7/IGNIS.git
cd IGNIS

# Install frontend dependencies
npm --prefix apps/web install

# (Optional) Install Python backend dependencies
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r services/api/requirements.txt
```

### Running the Services Locally
```bash
# Terminal 1: Frontend Development Server (Vite HMR)
npm --prefix apps/web run dev
# -> Opens at http://localhost:5174/ (or 5173)

# Terminal 2: Production Build & Preview
npm --prefix apps/web run build
npm --prefix apps/web run preview
# -> Opens at http://localhost:4173/

# Terminal 3: (Optional) Python Backend Service
uvicorn app.main:app --app-dir services/api --host 127.0.0.1 --port 8000
# -> Interactive API Swagger UI at http://127.0.0.1:8000/docs
```

### Running Validation and Tests
```bash
# Run all frontend tests (89 unit tests, copy-lint, golden parity)
npm --prefix apps/web test

# Run build verification
npm --prefix apps/web run build

# Run Playwright visual UX verification screenshots
node scripts/ux_test_screenshots.mjs
```

### Vercel Deployment Configuration
IGNIS is configured for zero-configuration continuous deployment on Vercel via [vercel.json](file:///e:/IGNIS/vercel.json):
```json
{
  "buildCommand": "npm --prefix apps/web run build",
  "installCommand": "npm --prefix apps/web install",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/|api$).*)",
      "destination": "/index.html"
    }
  ]
}
```
Any push to `main` triggers an automatic build and deploys to the global edge network in under 90 seconds.

---

## 11. Glossary & Terminology Audit

In accordance with Step 3 of the human-centered redesign, all technical terminology is mapped to plain English across the UI ([apps/web/src/content/glossary.ts](file:///e:/IGNIS/apps/web/src/content/glossary.ts)):

| Engineering / Jargon Term | Plain-English UI Replacement | Tooltip / Meaning |
| :--- | :--- | :--- |
| **Evidence Envelope** | *"Range NASA has tested"* | The boundary of environmental conditions explored during spaceflight. |
| **Physical Provenance** | *"Where this comes from"* | The direct link to the raw NASA flight CSV row, sensor log, and published paper. |
| **Similarity Vector / Score** | *"How close"* | A mathematical measure of how closely NASA's flight conditions match your settings. |
| **`extinguished`** | *"Flame went out"* | The flame naturally starved from low ventilation or was blown out by high speed air. |
| **`frames_recorded`** | *"Flame photographed"* | NASA cameras captured an active, visible flame burning on the sample. |
| **`no_ignition`** | *"No flame started"* | The electric hot-wire igniter triggered, but the fuel never ignited. |
| **Trust Ledger** | *"Every number links to its NASA source"* | A small footer chip that opens the provenance inspection drawer. |
| **Basis Badges** | *Hidden by default* | Inside details, shows whether a value was directly `measured`, `calculated`, or `assumed`. |

---

## Conclusion & Legacy

IGNIS demonstrates that complex microgravity aerospace science can be made accessible to a high-school student in five seconds **without dumbing down the scientific rigor or inventing synthetic data**. By grounding every visualization, card, and sentence in real NASA flight records, IGNIS bridges the gap between deep scientific research and public education.
