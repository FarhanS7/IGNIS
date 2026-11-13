# PROJECT_BRIEF.md — IGNIS NASA Space Apps Challenge Project Brief

> **Repository:** `E:\IGNIS`  
> **Challenge:** NASA International Space Apps Challenge 2026 — Astronaut Life Support & Habitat Safety / Challenge #8: *"Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data"*  
> **Commit Reference:** `6ccd258` (`hero-step-99`, branch `feature/hero-station`)  
> **Test Suite Status:** **278 passing unit tests across 21 suites** (`npm test`), **41 passing Playwright E2E tests** (`apps/web/e2e/`), zero TypeScript compilation errors (`tsc -b`).  
> **Target Audience:** Video Narrators, Mission Pitch Presenters, Evaluators, and Systems Engineers  
> **Ground Truth Standard:** Based strictly on code and verified documentation in this repository. All claims cite specific file paths. Items not found in code are explicitly marked `NOT FOUND IN CODE`.

---

## 1. IDENTITY

### Project Name
**IGNIS** (Intelligent Guidance from NASA Ignition Studies)  
*(Citations: `README.md:1`, `PROJECT_CONTEXT.md:43`, `apps/web/src/components/layout/Navbar.tsx:47`)*

### Tagline & Elevator Pitch
- **10-Word Pitch:**  
  *NASA microgravity flight fire evidence and habitat emergency response intelligence.*
- **25-Word Pitch:**  
  *IGNIS indexes 1,401 real NASA spaceflight combustion records, pairing interactive 3D flame morphing with multi-compartment smoke transport simulation and verifiable emergency fire containment sequencing.*
- **50-Word Pitch:**  
  *When fires ignite in space, lack of buoyancy alters flame dynamics and smoke transport. IGNIS translates 1,401 NASA flight combustion experiments into actionable habitat safety intelligence. It pairs interactive 3D flame morphing with multi-compartment smoke transport, time-of-arrival localization, and crewed emergency containment sequencing—never inventing outcomes, always citing primary flight records.*  
  *(Citations: `README.md:3-5, 21-25`, `docs/SUBMISSION.md:14-16`, `PROJECT_CONTEXT.md:43-55`)*

### NASA Space Apps Challenge Addressed
- **Challenge Track:** Astronaut Life Support & Habitat Safety  
- **Challenge #8:** *"Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data"*  
- *(Citations: `README.md:26-27`, `docs/SUBMISSION.md:4`, `PROJECT_CONTEXT.md:4`)*

### The Problem It Solves, Who Has It, and Why It Matters
- **The Problem:**  
  In Earth gravity ($1\,g$), hot air expands, becomes buoyant, and rises. This natural convection draws fresh oxygen into the base of a flame, stretching it into a tall, flickering teardrop, while carrying smoke and toxic fumes directly up to ceiling detectors.  
  In spaceflight microgravity ($0\,g$), thermal buoyancy disappears entirely. Fire forms a quiet, hemispherical or spherical diffusion dome that can suffocate on its own exhaust unless forced ventilation fans blow air past it. Smoke does not rise toward ceiling sensors; it drifts slowly and follows air conditioning ductwork.  
  Spacecraft fire safety teams and life-support architects have lacked interactive tools that bridge decades of raw NASA flight telemetry into real-time emergency response decisions. Existing tools either require days of high-performance computing for computational fluid dynamics (CFD) or employ generative AI models that hallucinate arbitrary "fire risk percentages" without physical justification.  
  *(Citations: `README.md:19-24`, `docs/FIRE_RESPONSE.md:14-16`, `docs/hero_kit/SHOT_LIST.md:7-8`)*
- **Who Has This Problem:**  
  1. Spacecraft fire safety engineers and life-support (ECLSS) system designers planning lunar and deep-space habitats (Artemis Gateway, Lunar Surface Hab, Mars Transit Vehicle, commercial space stations).  
  2. Mission flight controllers and astronaut crews who must diagnose alarms within seconds.  
  3. Aerospace students and combustion science researchers seeking intuitive physical intuition grounded in flight data.  
  *(Citations: `IGNIS_PRD_v1.1.md:200-226`, `PROJECT_CONTEXT.md:58-60`)*
- **Why It Matters:**  
  A fire aboard an enclosed spacecraft is an immediate, existential threat. Astronauts cannot open a window or evacuate outside into the vacuum of space. Extinguishing a fire requires knowing its exact location, cutting ventilation to starve it of forced oxygen, and isolating the compartment. False alarms disrupt operations; missed detections or delayed responses can lead to rapid cabin toxicity, oxygen depletion, or loss of crew.  
  *(Citations: `docs/FIRE_RESPONSE.md:5-13`, `README.md:130`)*

### Target Users
1. **Spacecraft Life-Support & Fire Safety Engineers:** Evaluate cabin atmospheres and materials against historical flight test boundaries.  
2. **Mission Architects & Flight Operations Teams:** Test containment protocols, sensor reaction latencies, and suppression confirmation gates.  
3. **Aerospace Educators & Students:** Explore physical combustion concepts through interactive 3D simulations and guided stories.  
4. **NASA Space Apps Evaluators:** Audit data integrity, machine learning calibration, and epistemic honesty.  
*(Citations: `PROJECT_CONTEXT.md:58-61`, `IGNIS_PRD_v1.1.md:200-237`)*

---

## 2. TECH STACK AND ARCHITECTURE

### Architecture Overview & Monorepo Structure
IGNIS is organized as a unified monorepo with client-side applications, serverless endpoints, Python data preparation pipelines, and offline machine learning services:
- **`apps/web/`**: Production single-page web application (SPA) executing 100% client-side deterministic inference.  
- **`apps/web/api/`**: Serverless edge endpoints (Vercel Node.js).  
- **`services/api/`**: Complete Python FastAPI service (development reference, 194 passing unit tests).  
- **`scripts/ml/` & `scripts/validate/`**: Python ML training, cross-validation, and benchmark evaluation suites.  
- **`pipelines/vision/`**: Computer vision droplet contour segmentation pipeline.  
*(Citations: `package.json:1-16`, `apps/web/package.json:1-42`, `PROJECT_CONTEXT.md:64-67`)*

### Frontend Technologies & Libraries
- **Core Framework:** React 19 (`react: ^19.3.1`, `react-dom: ^19.3.1`) with TypeScript (`typescript: ~6.0.2`).  
- **Bundler & Build Tool:** Vite 8 (`vite: ^8.3.0`, `@vitejs/plugin-react: ^6.1.1`).  
- **Styling System:** TailwindCSS v4 (`tailwindcss: ^4.3.3`, `@tailwindcss/vite: ^4.3.3`) with scoped CSS variables and design tokens (`apps/web/src/index.css:1-2150`).  
- **Routing:** React Router v7 (`react-router-dom: ^7.18.4`).  
- **Animation & Motion:**  
  - GSAP 3 (`gsap: ^3.15.1`, `@gsap/react: ^2.1.2`) for cinematic timeline staging and magnetic cursor interactions.  
  - Framer Motion (`framer-motion: ^14.0.0`) for UI transitions and accessibility-respecting reduced-motion support.  
  - Anime.js (`animejs: ^4.5.0`) for procedural SVG waveform pulsing.  
- **3D Graphics & WebGL:**  
  - Three.js (`three: ^0.186.1`).  
  - React Three Fiber (`@react-three/fiber: ^9.8.1`).  
  - Drei helpers (`@react-three/drei: ^10.7.9`).  
  - Postprocessing (`@react-three/postprocessing: ^3.2.0`).  
- **Data Visualization:** Recharts (`recharts: ^3.10.1`) for telemetry time-series, flight scatter plots, and sensor curves.  
- **Icons:** Lucide React (`lucide-react: ^1.52.0`).  
- **Audio:** Web Audio API procedural oscillator synthesis and HTML5 audio playback (`apps/web/src/lib/fire/narration/synthAudio.ts:1-76`).  
- **Testing Suites:** Node.js native test runner with experimental type-stripping (`node --test --experimental-strip-types`), Playwright (`playwright: ^1.64.1`) for browser E2E.  
*(Citations: `apps/web/package.json:14-41`, `apps/web/src/index.css:1-63`)*

### Backend, Serverless & Hosting
- **Production Hosting:** Vercel Static Web Hosting (`vercel.json`). The web application compiles into a zero-dependency static bundle where matching, transport physics, and ML models execute locally in the client browser.  
- **Serverless API Function (`apps/web/api/ask.ts`):** Vercel Node.js serverless function providing an optional natural language synthesis endpoint. Features:  
  - Sliding-window in-memory IP rate limiter: capped at 10 requests per minute per IP (`apps/web/api/ask.ts:15-35`).  
  - Fallback logic: Checks `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `LLM_API_KEY`. If unconfigured, gracefully instructs the client to remain in extractive browser mode (`apps/web/api/ask.ts:66-79`).  
- **Offline Backend (`services/api/`):** Python 3.13 FastAPI application (`services/api/app/main.py:1-116`) backed by SQLite/PostgreSQL schema (`services/api/migrations/001_initial_schema.sql`). Used for data verification and offline test suites.  
*(Citations: `vercel.json:1-12`, `apps/web/api/ask.ts:1-199`, `services/api/app/main.py:1-116`)*

### Data Flow from Source to Screen
```
[ NASA Physical Sciences Informatics (PSI) CSVs ]
[ NASA Technical Reports Server (NTRS) PDFs     ]
                       │
                       ▼  (Offline Python Ingestion & Preprocessing: scripts/data_prep/)
[ Precompiled Bundled Datasets ]
  ├── evidence_runs.json  (1,401 flight records)
  ├── evidence_solid.json (132 usable solid habitat runs)
  ├── chunks.json         (930 technical report text chunks)
  └── model weights JSON  (M1, M2, M4 parameter matrices)
                       │
                       ▼  (Shipped in apps/web/src/data/)
[ Client-Side Browser Engines ]
  ├── RealSolidMatcher      --> Computes weighted 4-factor physical distance
  ├── SmokeTransportSim     --> Computes 1D duct advection & zone accumulation
  ├── DetectorEngine (3-arm)--> Computes M1 / M2 / Heuristic alarms
  ├── ZoneLocalizer         --> Categorizes inter-zone arrival delays
  └── BM25Retriever         --> Indexes 930 NASA report chunks locally
                       │
                       ▼
[ Interactive UI & Visuals ]
  ├── Three.js WebGL Canvases (FlameScene & Station3DScene)
  ├── Recharts Sensor & Telemetry Plots
  ├── Mission-Control Subtitles & Web Audio Voice Narration
  └── Verifiable Provenance Drawers (Direct Raw CSV & DOI Links)
```
*(Citations: `apps/web/src/lib/matcher/real_solid_matcher.ts`, `apps/web/src/lib/fire/sim.ts`, `apps/web/src/lib/assistant/bm25_retriever.ts`)*

### AI/ML Models, Algorithms, and Formulas

#### 1. Real Solid Matcher Algorithm (`apps/web/src/lib/matcher/real_solid_matcher.ts`)
- **Purpose:** Finds the closest historical NASA flight burns to a user's chosen habitat atmosphere and fuel material.
- **Formula:** Normalized weighted Euclidean distance:
  $$d = \sqrt{w_{\text{mat}} d_{\text{mat}}^2 + w_{O_2} d_{O_2}^2 + w_{\text{flow}} d_{\text{flow}}^2 + w_{\text{geom}} d_{\text{geom}}^2}$$
- **Weights:** Material Family ($w = 0.35$), Oxygen Concentration ($w = 0.30$), Forced Airflow Velocity ($w = 0.20$), Sample Geometry ($w = 0.15$).
- **Pressure Exclusion:** Chamber pressure weight is explicitly set to $w = 0.00$ because no solid-fuel flight experiment actively logged chamber pressure during burns; nominal $1\,\text{atm}$ ($101.3\,\text{kPa}$) was assumed across all solid flight data.
- **Grouped LOOCV Benchmark:** Under strict leave-one-group-out cross-validation across **110 independent hardware sample groups** (132 usable solid runs), performance is:
  - **Overall Accuracy:** **80.30% (106 / 132)** [$95\%$ Wilson CI: $72.7\%, 86.2\%$]
  - **Balanced Accuracy:** **46.72%**
  - **Extinction Recall:** **48.00% (12 / 25)**
  - **Difference vs. Single-$O_2$ Rule:** $+0.76\%$ [$95\%$ Bootstrap CI: $-4.55\%, +6.82\%$], McNemar test $p = 1.0000$ (spans zero; no statistically significant advantage over a single oxygen-threshold baseline).
- **Epistemic Role:** Proven to function as an empirical nearest-neighbor **evidence locator**, not an autonomous outcome predictor.
- *(Citations: `apps/web/src/lib/matcher/real_solid_matcher.ts:240-275`, `docs/VALIDATION.md:10-58`, `scripts/validate/grouped_loocv.py:1-120`)*

#### 2. Multi-Compartment 1D Smoke Transport Network (`apps/web/src/lib/fire/sim.ts`)
- **Purpose:** Deterministically models how combustion products travel through interconnected space station modules without requiring heavy 3D CFD.
- **Formula:** First-order mass conservation across well-mixed module volumes ($V_i$) and duct ventilation flow rates ($Q_{ij}$):
  $$\frac{dC_i}{dt} = \frac{\dot{S}_i(t)}{V_i} + \sum_j \frac{Q_{ji} C_j(t)}{V_i} - \frac{Q_{i,\text{out}} C_i(t)}{V_i}$$
  where $\dot{S}_i(t) = \alpha t^2$ models standard $t^2$ fire growth.
- *(Citations: `apps/web/src/lib/fire/sim.ts:40-95`, `apps/web/src/lib/fire/sim_params.ts:1-180`)*

#### 3. Model M1: Microgravity Photoelectric Particle Calibration (`apps/web/src/lib/fire/ml/responseCurve.ts`)
- **Purpose:** Calibrates how smoke detectors respond to sub-micron particles produced in microgravity.
- **Basis:** Grounded in 130 NASA SAME and SAME-R spaceflight runs (`PSI-101`, `PSI-102`).
- **Scattering Penalty Multipliers:** Teflon wire insulation ($0.2570 \pm 0.142$), Kapton ($0.38 \pm 0.11$), Cellulose ($1.00$). Explains why standard optical smoke detectors fail to detect overheated Teflon wiring in space.
- *(Citations: `docs/models/m1_same_detector_response.md:1-95`, `apps/web/src/lib/fire/ml/responseCurve.ts:1-75`)*

#### 4. Model M2: Multi-Sensor Fusion Detector (`apps/web/src/lib/fire/ml/logistic.ts`)
- **Purpose:** Detects fire early while ignoring nuisance dust and cooking aerosols.
- **Algorithm:** $L_2$-regularized logistic regression over 10 statistical rolling features (mean, variance, rate-of-change across optical obscuration, carbon monoxide, and temperature over a 60-second sliding window).
- **Training Data:** Open EN54 multi-sensor fire dataset (`DOI: 10.17632/npk2zcm85h.2`).
- **Mandatory Caveat:** Persistently displays: *"Trained on Earth-gravity data. Not validated in microgravity."*
- *(Citations: `docs/models/m2_fusion_detector.md:1-115`, `apps/web/src/lib/fire/ml/logistic.ts:1-92`)*

#### 5. Model M4: NASA FLEX Droplet Extinction Boundary (`apps/web/src/lib/fire/ml/extinctionModel.ts`)
- **Purpose:** Evaluates flammability and extinction limits for microgravity droplet combustion.
- **Algorithm:** Conformal logistic model trained on 262 NASA FLEX/FLEX-2 flight burns on the ISS (`PSI-69`, `PSI-68`).
- **Mandatory Caveat:** Displays: *"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."*
- *(Citations: `docs/models/m4_flex_extinction.md:1-85`, `apps/web/src/lib/fire/ml/extinctionModel.ts:1-80`)*

#### 6. Inter-Zone Time-of-Arrival Smoke Localizer (`apps/web/src/lib/fire/localizer.ts`)
- **Purpose:** Identifies the module where a fire started based on sensor onset timestamps.
- **Categorical States:**
  - `CLEAR`: Earliest zone triggers $\ge 6.0\,\text{s}$ before any other zone.
  - `CLOSE`: Arrival time difference is between $2.0\,\text{s}$ and $6.0\,\text{s}$.
  - `AMBIGUOUS`: Arrival time difference is $< 2.0\,\text{s}$.
  - `INSUFFICIENT_EVIDENCE`: Fewer than 2 sensors triggered.
- *(Citations: `apps/web/src/lib/fire/localizer.ts:1-98`)*

#### 7. In-Browser Okapi BM25 Assistant (`apps/web/src/lib/assistant/bm25_retriever.ts`)
- **Purpose:** Answers user technical questions using 930 text chunks from 7 NASA NTRS publications without hallucination.
- **Algorithm:** Pure TypeScript BM25 retrieval ($k_1 = 1.5, b = 0.75$) with verbatim sentence extraction. Verified by client verifier (`client_verifier.ts`) to ensure every returned sentence is an exact substring of a primary NASA document.
- *(Citations: `apps/web/src/lib/assistant/bm25_retriever.ts:1-185`, `apps/web/src/lib/assistant/client_verifier.ts:1-115`)*

---

## 3. DATA SOURCES (EXHAUSTIVE)

IGNIS indexes **1,401 total spaceflight combustion records** across **14 physical flight investigations** in the NASA Physical Sciences Informatics (PSI) repository, augmented by 5 laboratory calibration datasets and 7 NASA technical publications:

| # | Investigation Name | Dataset ID / DOI | Platform & Facility | Ingested Runs | Variables Used in IGNIS | Role in UI & Processing | Access Mode & License |
|---|---|---|---|---|---|---|---|
| 1 | **BASS-II** (Burning and Suppression of Solids II) | `PSI-25`<br/>`10.60555/4qc4-de67` | ISS Microgravity Science Glovebox (MSG) | 129 runs | Material, thickness, width, length, oxygen conc. (%), nitrogen conc. (%), flow speed (cm/s), video frames shot, outcome (`frames_recorded`, `extinguished`, `no_ignition`). | Primary dataset for `/simulator` Habitat Solid Matcher (129 runs ingested, filtered to usable runs); inspected in `/experiments`. | Bundled CSV/JSON (`data/raw/PSI-25*`, `data/processed/evidence_runs.json`). Public Domain (NASA Open Data). |
| 2 | **BASS** (Burning and Suppression of Solids) | `PSI-26`<br/>`10.60555/58h4-dy80` | ISS MSG | 122 runs | Fuel material, sample dimensions, oxygen %, flow speed (cm/s), burn outcome. | Displayed in `/experiments`; 3 usable solid runs matched in `/simulator`. | Bundled CSV/JSON. Public Domain. |
| 3 | **Saffire-I** (Spacecraft Fire Experiment I) | `PSI-98`<br/>`10.60555/0t15-1z43` | Cygnus Cargo OA-6 | 4 runs | Large-scale cotton-fiberglass fabric (SIBAL, 0.4 m x 1.0 m), airflow velocity, thermocouple arrays, flame spread rate. | Validates large-scale fabric flammability in `/simulator` and `/about`. | Bundled CSV/JSON. Public Domain. |
| 4 | **Saffire-II** (Spacecraft Fire Experiment II) | `PSI-99`<br/>`10.60555/2chp-m469` | Cygnus Cargo OA-5 | 15 runs | 9 sample cards (PMMA, Nomex, silicone, SIBAL) across varying sample thicknesses, airflow velocities. | Ingested into `/simulator` solid matcher and `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 5 | **Saffire-III** (Spacecraft Fire Experiment III) | `PSI-100`<br/>`10.60555/040q-4h36` | Cygnus Cargo OA-7 | 2 runs | Large-scale SIBAL cotton fabric re-test under higher airflow velocity. | Ingested into `/simulator` and `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 6 | **FLEX** (Flame Extinction Experiment) | `PSI-69`<br/>`10.60555/mbq8-0451` | ISS Combustion Integrated Rack (CIR) | 274 runs | Liquid droplet initial diameter ($d_0$), fuel species (heptane, methanol, decane), oxygen %, extinction diameter ($d_{\text{ext}}$), burning rate. | Used to train Model M4 droplet extinction boundary displayed in `/response` Step 5 (`SUPPRESSION`) and `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 7 | **FLEX-2** (Flame Extinction Experiment 2) | `PSI-68`<br/>`10.60555/byp8-h018` | ISS CIR | 8 runs | Droplet combustion flammability limits and binary fuel mixtures. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 8 | **Flame Design** | `PSI-10`<br/>`10.60555/w4zy-bt45` | ISS CIR | 327 runs | Spherical and inverse gas diffusion flames, soot production, radiant extinction limits. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 9 | **ACME BRE** (Burning Rate Emulator) | `PSI-20`<br/>`10.60555/vb93-3y72` | ISS CIR | 18 runs | Flat porous gas burner emulating solid fuel burning rates in microgravity. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 10 | **ACME CLD** (Coflow Laminar Diffusion) | `PSI-21`<br/>`10.60555/23e1-9950` | ISS CIR | 32 runs | Coflow laminar gas diffusion flames, flame lift-off, and soot inception limits. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 11 | **ACME E-FIELD** | `PSI-22`<br/>`10.60555/se5a-8c73` | ISS CIR | 32 runs | Electric field effects on ionic wind and soot formation in diffusion flames. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 12 | **ACME s-Flame** | `PSI-23`<br/>`10.60555/k57n-p030` | ISS CIR | 18 runs | Spherical gas diffusion flames, radiative soot extinction limits. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 13 | **CFI** (Confined Combustion - Flat) | `PSI-39`<br/>`10.60555/m6pj-a914` | ISS MSG | 87 runs | Confined fuel channel, flame spread over thin cellulosic fabrics and PMMA. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 14 | **CFI-G** (Confined Combustion - Normal/Inverse) | `PSI-159`<br/>`10.60555/cyt1-kh64` | ISS MSG | 333 runs | Normal and inverse flow geometry, boundary layer quenching distances. | Partitioned into Fundamental Science tab in `/experiments`. | Bundled CSV/JSON. Public Domain. |
| 15 | **EN54 Multi-Sensor Room Fire Dataset** | `D1`<br/>`10.17632/npk2zcm85h.2` | University of Magdeburg (EN54 Room) | 36 runs | Continuous time-series of optical obscuration (%/m), CO (ppm), temperature (°C), aerosol particle count. | Training dataset for Model M2 Multi-Sensor Fusion Detector (`apps/web/src/data/models/m2-fusion-v1.json`). | Local CSV (`data/raw_ml/d1_en54/`). Creative Commons CC BY 4.0. |
| 16 | **Industrial Hall Multi-Sensor Dataset** | `D2`<br/>`10.17632/yghykzm4km.1` | University of Magdeburg (Hall) | 12 runs | Sensor time-series across large spatial volumes. | Used for out-of-distribution domain generalization testing of Model M2. | Local CSV (`data/raw_ml/d2_hall/`). CC BY 4.0. |
| 17 | **Small-Scale Chamber Dataset** | `D3`<br/>`10.17632/m85f9h6g9j.1` | University of Magdeburg (Chamber) | 24 runs | Multi-sensor combustion signatures under controlled dilution. | Reference benchmark for multi-sensor baseline validation. | Local CSV (`data/raw_ml/d3_chamber/`). CC BY 4.0. |
| 18 | **NASA SAME & SAME-R** | `D4` (`PSI-102`) & `D5` (`PSI-101`)<br/>`10.60555/gd4k-8h62` | ISS | 130 runs | Smoke particle size distributions, ionization detector current, photoelectric scattering voltages across 5 materials (Cellulose, Teflon, Kapton, Silicone, Pyrene). | Calibrated Model M1 photoelectric response curves and small-particle scattering penalty multipliers. | Bundled CSV/JSON (`data/raw_ml/d4_same/`, `d5_samer/`). Public Domain (CC0). |
| 19 | **NASA NTRS Technical Report Corpus** | 7 Reports<br/>(e.g., `NASA-STD-6001B`, `NTRS-20130011664`) | NASA Technical Reports Server | 930 chunks | 930 extracted text passages covering flammability standards, smoke detection physics, and flight lessons. | Knowledge base indexed in-browser by Okapi BM25 engine for `/ask`. | Bundled JSON (`apps/web/src/data/corpus/chunks.json`). Public Domain. |

*(Citations: `README.md:40-56`, `data/provenance/ml_manifest.json:1-95`, `apps/web/src/data/corpus/chunks.json`)*

---

## 4. FEATURE-BY-FEATURE BREAKDOWN

### 1. Hero Planetary Carousel & Dual CTAs
- **What it does:** Displays an orbital hero section rotating across Earth ($0\,g$ freefall), Moon ($0.16\,g$), and Mars ($0.38\,g$), with dual exploration CTAs: *"Try the Simulator"* (`/simulator`) and *"Explore Fire Response"* (`/response`).
- **Why it is useful:** Gives immediate visual comprehension of different gravity regimes within 5 seconds and routes users directly to either the engineering simulator or the 3D response console.
- **How it works:** `LandingPage.tsx` runs an auto-rotation timer every 5.5s $\to$ updates `featuredPlanet` $\to$ crossfades planetary cutouts and lede copy with smooth 0.8s CSS transitions. User can also click side planet buttons to switch manually.
- **Data Source:** Static assets (`PLANETS` record in `LandingPage.tsx:35-63`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/LandingPage.tsx:74-285`.
- **Visuals:** Auto-rotating planetary discs with atmospheric backdrops, destination preset pills, and glowing buttons.

### 2. Live Telemetry Signal Observation Card (Section 01)
- **What it does:** Renders a real-time scientific telemetry HUD streaming live microgravity flame metrics.
- **Why it is useful:** Demonstrates to visitors that IGNIS is grounded in real ISS flight experiments rather than speculative fiction.
- **How it works:** Mounted in `HowItWorksSection.tsx` $\to$ displays $0.0001\,g$ residual acceleration, $101.3\,\text{kPa}$ pressure, $21.0\%\,O_2$ concentration $\to$ animates an SVG pulse waveform traversing across the screen via `@keyframes liveWaveDash`.
- **Data Source:** NASA BASS-II and Saffire instrumentation baselines (`README.md:42-46`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/landing/HowItWorksSection.tsx:75-125`, `apps/web/src/index.css:1980-2050`.
- **Visuals:** Pulsing cyan LED beacon, large monospace numbers with text-shadow glow, and traveling SVG stroke path.

### 3. Interactive Gravity Morphing Simulator (Section 02)
- **What it does:** Allows users to drag a slider from $0.00\,g$ to $1.00\,g$ to see combustion morph from a spherical ball to a buoyant flame.
- **Why it is useful:** Provides instant physical intuition on how gravity reshapes fire before entering the full simulator.
- **How it works:** User moves slider $\to$ `setGravity(value)` $\to$ `deriveFlameParams(scenario)` updates elongation, radius, and color $\to$ Three.js WebGL canvas (`FlameScene.tsx`) re-renders GPU particle geometry in real time.
- **Data Source:** Procedural shader parameterized by empirical combustion formulas (`apps/web/src/visuals/flameParams.ts`).
- **Status:** **Fully working** (with 2D SVG fallback when WebGL is unavailable).
- **File Path:** `apps/web/src/components/landing/SimulatorMiniDemo.tsx:1-332`.
- **Visuals:** GPU volumetric particle flame, aerospace coordinates badge (`ISS COLUMBUS MODULE`), corner-bracketed journey button.

### 4. Flight Science Archives & Exploration Gateway (Section 03)
- **What it does:** Showcases three deep exploratory pathways into NASA flight science: Flight Data Archive (`/experiments`), Guided Stories (`/stories`), and Ask IGNIS Research Assistant (`/ask`).
- **Why it is useful:** Directs researchers, students, and evaluators to deep data repositories right from the landing page.
- **How it works:** Three responsive interactive cards with Framer Motion hover states and badge tags link directly to sub-applications.
- **Data Source:** Ingested PSI investigation catalogs.
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/landing/ExploreMoreRow.tsx:1-102`.
- **Visuals:** High-contrast frosted glass cards, category accent icons, and hover glow transitions.

### 5. Empirical Flight Provenance & Trust Ledger (Section 04)
- **What it does:** Displays an audited trust banner linking directly to the methodology and provenance documentation.
- **Why it is useful:** Reassures users and evaluators that every record is verified under open science standards.
- **How it works:** Shows real-time flight dataset scope (1,401 runs across 14 PSI investigations) and links to `/about`.
- **Data Source:** Monorepo provenance manifest (`data/provenance/ml_manifest.json`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/landing/TrustStrip.tsx:1-46`.
- **Visuals:** Pulsing emerald verified indicator, monospace telemetry label, and direct documentation arrow CTA.

### 6. Floating Journey Exploration HUD
- **What it does:** A floating glass dock that appears when scrolling down the landing page, showing exploration progress and section jumps.
- **Why it is useful:** Enables fast navigation across landing page sections while tracking scroll depth.
- **How it works:** Window scroll listener detects $y > 350\,\text{px}$ $\to$ fades in `.bottom-hud-journey` $\to$ calculates closest section to viewport $\to$ highlights active pill (`01 Guide`, `02 Morphing`, `03 Archives`, `04 Provenance`).
- **Data Source:** DOM element scroll offsets.
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/LandingPage.tsx:340-370`, `apps/web/src/index.css:2050-2110`.
- **Visuals:** Frosted glass pill container, animated `.scroll-mouse` icon, active cyan glow badges.

### 7. Habitat Scenario Configurator (Stage A)
- **What it does:** Lets engineers configure destination presets, cabin oxygen (15–30%), pressure (50–105 kPa), airflow (0–30 cm/s), and fuel material.
- **Why it is useful:** Allows mission designers to test custom spacecraft atmospheres (e.g. Artemis $34\%\,O_2$ low-pressure protocols).
- **How it works:** User picks preset $\to$ updates `ScenarioInput` state $\to$ dual range sliders show "Habitat typical" vs "NASA tested" boundaries $\to$ clamps values to physical limits.
- **Data Source:** Habitat presets (`apps/web/src/data/habitats.json`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/SimulatorPage.tsx:700-880`.
- **Visuals:** Aerospace toggle buttons, synced numeric badges, ambient warning banners for partial gravity.

### 8. 3D Procedural WebGL Flame Canvas (Stage B)
- **What it does:** Renders a 3D procedural flame showing real-time physical changes in shape, elongation, color, and reaction halo.
- **Why it is useful:** Connects mathematical parameters to visual intuition without claiming to be an unverified CFD model.
- **How it works:** React Three Fiber canvas mounts `FlameScene.tsx` $\to$ calculates flame geometry via `deriveFlameParams` $\to$ renders core, envelope, and particle plume shaders.
- **Data Source:** Analytical combustion parameter derivation (`apps/web/src/visuals/flameParams.ts`).
- **Status:** **Fully working** (lazy-mounted to maintain single WebGL canvas rule).
- **File Path:** `apps/web/src/visuals/FlameScene.tsx:1-150`.
- **Visuals:** Glowing 3D particle halo, dynamic camera orbiting, 2D SVG fallback.

### 9. Real Solid Matcher & Provenance Drawer (Stage C)
- **What it does:** Evaluates historical NASA flight experiments against the user's scenario, renders the top 3 nearest cards in the summary panel (and top 5 in printable/JSON Evidence Brief exports) with raw CSV row data and DOI citations.
- **Why it is useful:** Gives engineers empirical flight evidence with zero AI hallucination.
- **How it works:** User changes scenario $\to$ `RealSolidMatcher.findNearestMatches()` evaluates 132 usable solid runs $\to$ ranks by weighted physical distance $\to$ clicking a match opens `EvidenceBriefModal.tsx` (or Evidence Ledger drawer) showing raw CSV rows, sensor logs, and investigation DOI (`PSI-25`/`PSI-26`/`PSI-98`/`PSI-99`/`PSI-100`).
- **Data Source:** Bundled NASA BASS-II and Saffire runs (`apps/web/src/data/evidence_solid.json`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/lib/matcher/real_solid_matcher.ts:1-480`, `apps/web/src/components/evidence/RealMatchCard.tsx:1-210`.
- **Visuals:** Physical factor delta chips ($\Delta O_2, \Delta \text{flow}$), outcome badges, printable dossier button.

### 10. Space Station 3D Hero Demo (`/response`)
- **What it does:** Renders a cinematic 3D cutaway space station with 4 modules, ventilation duct network, GPU smoke particles, reticle lock-on, and synchronized voice narration.
- **Why it is useful:** Provides an engaging, broadcast-ready demo of spacecraft fire detection, localization, and emergency containment.
- **How it works:** User navigates to `/response` $\to$ Three.js loads `Station3DScene.tsx` $\to$ timeline plays $\to$ smoke points drift through ducts $\to$ detector race clocks tick $\to$ reticle locks on fire zone $\to$ power cuts $\to$ dampers close.
- **Data Source:** Precomputed deterministic simulation timeline (`apps/web/src/lib/fire/timeline/buildTimeline.ts`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/response/StationDemoPage.tsx:1-969`, `Station3DScene.tsx:1-350`.
- **Visuals:** 3D module cutaway with glowing ventilation ducts, converging localization rings, reticle target lock, lighting blackout on power cut, extinguishing mist.

### 11. Synchronized Voice Narration & Mission Control Subtitles
- **What it does:** Plays voiceover audio synchronized to timeline milestones, complete with mission-control subtitles.
- **Why it is useful:** Enables judges and evaluators to understand the emergency response flow without reading dense text.
- **How it works:** `useNarration.ts` monitors active timeline step $\to$ plays audio cues (`stage1_incident.wav` to `stage5_outcome.wav`) $\to$ falls back to procedural Web Audio speech synthesis if audio files are unconfigured $\to$ updates `NarrationSubtitlesOverlay.tsx`.
- **Data Source:** Narration cue registry (`apps/web/src/lib/fire/narration/narrationCues.ts`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/response/UnifiedNarrationDeck.tsx:1-120`, `NarrationSubtitlesOverlay.tsx:1-85`.
- **Visuals:** Monospace mission-control telemetry subtitle bar with active audio waveform indicator and audio mute/replay controls.

### 12. Multi-Sensor Race Clocks HUD
- **What it does:** Displays side-by-side race clocks comparing detection times between a standard optical smoke detector and a NASA SAME-R calibrated multi-sensor detector.
- **Why it is useful:** Shows visually why multi-sensor detection is essential in microgravity.
- **How it works:** Reads alarm timestamps from simulation data $\to$ calibrated clock stops at $t = 15.0\,\text{s}$ and flashes green $\to$ standard clock keeps counting until $t = 50.0\,\text{s}$ or fails $\to$ displays dynamic gap caption (`"{X} seconds earlier"`).
- **Data Source:** Deterministic detector timeline (`apps/web/src/lib/fire/detectors.ts`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/response/StationStage.tsx:150-250`, `Caption.tsx:1-60`.
- **Visuals:** Glowing digital stopwatch displays with pulse animations and dynamic delta badges.

### 13. Hold-to-Confirm Astronaut Suppression Gate
- **What it does:** Requires the operator to press and hold a button for 1.2 seconds before fire suppression can be released in crewed habitats.
- **Why it is useful:** Prevents automated systems from dumping toxic suppression agent into breathing volumes while astronauts are unmasked.
- **How it works:** User clicks and holds $\to$ SVG circular progress ring animates from 0% to 100% over 1200ms $\to$ if released early, cancels $\to$ upon completion, triggers suppression release.
- **Data Source:** Life-safety protocol constraint (NASA-STD-6001B, NTRS-20130011664).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/response/HoldToConfirmGate.tsx:1-120`.
- **Visuals:** Radial SVG progress sweep with tactile click and confirmation chime.

### 14. Droplet Extinction Insight Card (NASA FLEX Model M4)
- **What it does:** Displays flammability boundaries and extinction predictions based on 262 NASA FLEX droplet combustion runs.
- **Why it is useful:** Informs operators of the physical oxygen limits required to extinguish fire in microgravity.
- **How it works:** During Step 5 (`SUPPRESSION`), queries Model M4 $\to$ evaluates conformal extinction threshold $\to$ displays `EXTINCTION_REGION` with persistent caveat preventing extrapolation to solid cabin materials.
- **Data Source:** Model M4 parameter weights (`apps/web/src/data/models/m4-extinction-v1.json`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/lib/fire/ml/extinctionModel.ts:1-80`, `ResponseSequencePanel.tsx:280-330`.
- **Visuals:** Flammability region badge with amber caveat box.

### 15. Three-Tier Progressive Explanation Drawer
- **What it does:** Provides 3 depths of explanation for every response event: Quick Summary, Physical Mechanism, and NASA Provenance.
- **Why it is useful:** Adapts explanation complexity for general audiences, students, and NASA evaluators alike.
- **How it works:** User clicks "Why this happened" $\to$ opens `ExplanationDrawer.tsx` $\to$ displays tiered tabs (`Quick`, `Deep Dive`, `Flight Data`) citing specific NTRS reports.
- **Data Source:** Structured explanation registry (`apps/web/src/lib/fire/upgrade/explanationContent.ts`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/response/ExplanationDrawer.tsx:1-160`.
- **Visuals:** Sliding glass drawer with interactive tabs and expandable DOI cards.

### 16. Fire Response Engineering Inspect Console (`/response?view=inspect`)
- **What it does:** Deep engineering dashboard featuring 1D multi-compartment smoke transport plots, 3-arm detector comparisons, and 6-stage containment sequencing.
- **Why it is useful:** Allows safety engineers to inspect exact concentration curves ($CO$, obscuration, temperature) and test Monte Carlo sweeps.
- **How it works:** Switching view to `inspect` mounts `ResponseConsolePage.tsx` $\to$ scrubber advances timeline $\to$ Recharts renders multi-sensor time-series $\to$ localizer classifies source zone.
- **Data Source:** 1D transport engine (`sim.ts`) and detector models (`detectors.ts`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/ResponseConsolePage.tsx:1-250`.
- **Visuals:** Interactive 2D habitat schematic with animated ventilation dampers, Recharts sensor timeline graphs, and Monte Carlo modal.

### 17. Monte Carlo Consistency Sweep Engine
- **What it does:** Runs chunked Monte Carlo sweeps ($N = 100, 200, 500$) across randomized fire growth rates, sensor noise, and airflow fluctuations.
- **Why it is useful:** Proves that simulation behavior is robust and design-consistent across edge-case variations.
- **How it works:** User opens modal and clicks "Execute Sweep" $\to$ worker processes batches in chunks (avoiding main thread freeze) $\to$ tabulates alarm rates, false alarm counts, and mean detection times.
- **Data Source:** Seeded PRNG parameter generator (`apps/web/src/lib/fire/__tests__/monte_carlo_hardening.test.ts`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/components/response/MonteCarloValidationModal.tsx:1-190`.
- **Visuals:** Animated progress bar, multi-arm comparison table with latency deltas.

### 18. Flight Data Explorer (`/experiments`)
- **What it does:** Tabular browser for 1,401 real NASA flight records across 14 investigations with search, filtering, and export.
- **Why it is useful:** Serves as a transparent open-science repository where anyone can audit raw NASA flight experiments.
- **How it works:** Loads `evidence_runs.json` $\to$ filters by fuel material, mission ID, and outcome $\to$ pagination with CSV/JSON export.
- **Data Source:** Precompiled PSI flight corpus (`apps/web/src/data/evidence_runs.json`).
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/ExperimentExplorerPage.tsx:1-350`.
- **Visuals:** High-density aerospace data grid, material filter pills, modal record viewer.

### 19. Grounded Assistant (`/ask`)
- **What it does:** Answers user questions using exact verbatim sentences extracted from 930 NASA technical report chunks.
- **Why it is useful:** Eliminates AI hallucinations by guaranteeing that every answer cites a verified NASA document chunk.
- **How it works:** User types query $\to$ in-browser BM25 engine scores 930 chunks $\to$ extracts top-matching sentences $\to$ client verifier checks exact substring match $\to$ displays answer with report title, page number, and chunk ID.
- **Data Source:** Bundled report chunks (`apps/web/src/data/corpus/chunks.json`).
- **Status:** **Fully working** (client extractive mode; serverless LLM mode configured via `api/ask.ts`).
- **File Path:** `apps/web/src/pages/AskIgnisPage.tsx:1-260`, `bm25_retriever.ts:1-185`.
- **Visuals:** Chat stream with verified citation badges, question suggestion chips, and abstention notices.

### 20. Research Gaps & Mission Ranking (`/gaps`)
- **What it does:** Evaluates 5 future exploration habitat atmospheres (Gateway, Lunar, Mars) against NASA flight data coverage.
- **Why it is useful:** Pinpoints which cabin atmospheres have never been tested in space, guiding future research priorities.
- **How it works:** Calculates geometric distance between target atmospheres and 132 flown burns $\to$ computes coverage score $\to$ ranks atmospheres from well-tested to uncharacterized.
- **Data Source:** Habitat exploration definitions and solid flight corpus.
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/ResearchGapsPage.tsx:1-220`, `gap_metrics.ts:1-85`.
- **Visuals:** Atmosphere coverage progress bars, parameter gap distance cards.

### 21. Science Stories — Chapters 1–4 (`/stories`)
- **What it does:** Scrollytelling guided narratives featuring Ember the mascot companion across droplet freefall (`chapter1`), airflow/PMMA flammability (`chapter2`), smoke/smoldering (`chapter3`), and research gaps (`chapter4`).
- **Why it is useful:** Teaches core microgravity combustion physics to non-technical audiences and students.
- **How it works:** User selects any of the 4 chapters and scrolls through narrative beats while a deterministic canvas/2D fallback animates flame geometry and interactive prediction cards test intuition.
- **Data Source:** Curated PSI chapter modules (`apps/web/src/story/chapters/chapter1.ts`–`chapter4.ts`).
- **Status:** **Implemented (Simulated Narrative Data)** — all 4 chapters are interactive; time-series illustrations use seeded/fixture data tagged with mock UUIDs rather than direct sensor streams.
- **File Path:** `apps/web/src/pages/StoryModeV2Page.tsx`, `apps/web/src/story/chapters/chapter1.ts`–`chapter4.ts`.
- **Visuals:** Ember companion avatar, scroll-driven Three.js morph canvas, interactive prediction cards.

### 22. Methodology & Epistemic Honesty Page (`/about`)
- **What it does:** Discloses full methodology, calibration curves, dataset DOIs, and the formal retraction of leaked cross-validation figures.
- **Why it is useful:** Provides unmatched scientific transparency for academic and NASA evaluators.
- **How it works:** Static informational page laying out the Grouped LOOCV benchmark, M1 and M4 calibration plots, and complete dataset attribution.
- **Data Source:** Documentation in `docs/VALIDATION.md` and `data/provenance/ml_manifest.json`.
- **Status:** **Fully working**.
- **File Path:** `apps/web/src/pages/AboutPage.tsx:1-396`.
- **Visuals:** Side-by-side benchmark comparison tables, sensor calibration charts, persistent disclaimer badges.

---

## 5. USER JOURNEY (60–90 SECOND DEMO PATH)

This exact demo path is optimized for video recording and live judge presentations, showcasing the core strengths of IGNIS within 90 seconds:

```
[0:00 - 0:15] Landing Page Hook & Physical Contrast
  └─ Start on "/"
  └─ Point out the Earth -> Moon -> Mars auto-rotating carousel
  └─ Scroll to "02 / Interactive Habitat Simulation"
  └─ Drag the Gravity Slider from 1.00g to 0.00g (Flame morphs from flickering teardrop to quiet blue sphere)
  └─ Highlight the Coordinates HUD: "ISS COLUMBUS MODULE • 21% O2 • 101.3 kPa"

[0:15 - 0:35] Habitat Fire Safety Simulator & Provenance
  └─ Click "Try the Simulator" (navigates to "/simulator")
  └─ Pick Material: "Cotton / SIBAL fabric"
  └─ Set Oxygen to 21%, Airflow to 5 cm/s
  └─ Look at Stage C (Nearest Matches): Click on Match #1 (Run UID "BASS2_133")
  └─ "Evidence Brief" modal opens: shows raw flight CSV row, measured sensor parameters, and permanent DOI link

[0:35 - 0:45] Honest Epistemic Boundary (Partial Gravity Warning)
  └─ In the Simulator, switch Destination preset to "Lunar Surface Base (0.16g)"
  └─ Point out the amber warning banner: "Outside NASA Tested Range. Buoyancy stratification is unvalidated."
  └─ Emphasize: IGNIS does not hallucinate false confidence where NASA has never tested.

[0:45 - 1:15] The Fire Response Console 3D Space Station Demo
  └─ Click "Explore Fire Response" on the hero banner or navigate to "/response"
  └─ Click "Play Timeline"
  └─ t = 12s: Smoke points enter Avionics Bay ducts.
  └─ t = 15s: Calibrated SAME-R detector clock alarms and freezes green. Standard clock keeps running.
  └─ t = 20s: Localization rings converge on Avionics Bay. Camera flies in; reticle locks target.
  └─ t = 28s: Sequencer cuts power (lights blackout) and seals ventilation dampers.
  └─ t = 42s: Hold-to-Confirm Suppression Gate appears. Press and hold for 1.2s.
  └─ Extinguishing mist fills module; flame shrinks to zero; station glows cyan.

[1:15 - 1:25] Droplet Extinction Insight & 3-Arm Detector Audit
  └─ Open the Sequencer panel, look at Step 5 (Suppression).
  └─ Show the NASA FLEX Droplet Extinction card with the honest caveat banner:
     "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."
  └─ Switch to "?view=inspect" to show the multi-compartment smoke concentration curves and Monte Carlo sweep modal.

[1:25 - 1:30] Closing Statement & Transparent Principles
  └─ Highlight the persistent banner: "Simulated. Not flight software."
  └─ End with core thesis: "AI is not the source of truth — NASA flight experiments are."
```
*(Citations: `docs/DEMO_SCRIPT.md:1-54`, `docs/hero_kit/SHOT_LIST.md:1-28`, `docs/hero_kit/DECISION.md:10-45`)*

### Local Setup Instructions
To run this demo locally with full 3D performance:
```bash
# 1. Clone repository and install dependencies
git clone https://github.com/FarhanS7/IGNIS.git
cd IGNIS
npm install

# 2. Start Vite local development server
npm --prefix apps/web run dev

# 3. Open browser at:
http://localhost:5173/
```
*(Citations: `README.md:167-183`, `PROJECT_CONTEXT.md:76-81`)*

---

## 6. SCREENSHOT PLAN

| ID | Route / URL | Exact UI State | Steps to Reproduce | Feature & Data Shown | Capture Framing | Theme / Mode |
|---|---|---|---|---|---|---|
| **S01** | `/` | Hero section, Earth preset active | Load `/` at viewport $1920 \times 1080$ | Hero planetary stage, orbital video backdrop, primary CTAs ("Try the Simulator", "Explore Fire Response") | Full-screen desktop | Dark (`#04101f`) |
| **S02** | `/` | Post-hero Section 01 scrolled into view | Scroll down to `#how-it-works` | Live Telemetry Card, animated SVG waveform, $0.0001\,g$ readout | Cropped section ($1200 \times 700$) | Dark |
| **S03** | `/` | Post-hero Section 02, slider at $0.00\,g$ | Drag gravity slider to $0.00\,g$ | 3D spherical flame diffusion ball, coordinates HUD badge | Cropped section ($1100 \times 750$) | Dark |
| **S04** | `/simulator` | Cotton selected, $O_2 = 21\%$, flow $= 5\,\text{cm/s}$ | Go to `/simulator`, select Cotton | 3-stage layout: sliders, 3D flame morph, top 5 NASA matches | Full-screen desktop | Dark |
| **S05** | `/simulator` | Evidence Brief Modal open | Click "Inspect CSV" on match #1 (`BASS2_133`) | Raw CSV table row, measured sensor deltas, DOI link | Modal pop-up ($900 \times 650$) | Dark frosted glass |
| **S06** | `/simulator` | Lunar preset active ($0.16\,g$) | Click "Lunar" destination chip | Unvalidated partial-gravity warning banner | Cropped Stage A & B ($1200 \times 600$) | Dark with Amber alert |
| **S07** | `/response` | 3D Station Demo at $t = 16\,\text{s}$ | Go to `/response`, click Play, pause at $16\,\text{s}$ | 3D station cutaway, duct smoke points, detector race clocks | Full-screen desktop | Dark |
| **S08** | `/response` | Reticle target lock at $t = 24\,\text{s}$ | Advance timeline to $t = 24\,\text{s}$ | Converging localization rings, reticle lock on Avionics Bay | Full-screen desktop | Dark with Red alarm |
| **S09** | `/response` | Hold-to-Confirm Gate active at $t = 42\,\text{s}$ | Advance timeline to $t = 42\,\text{s}$ | 1.2s circular progress ring for crew suppression approval | Close-up modal / center stage | Dark with Amber/Cyan |
| **S10** | `/response?view=inspect` | Engineering console, timeline at $t = 30\,\text{s}$ | Open `/response?view=inspect` | Recharts multi-sensor curves ($CO$, obscuration, temp) | Full-screen desktop | Dark high-density |
| **S11** | `/experiments` | Solid fuels tab, filtered to Cotton | Open `/experiments`, filter by Cotton | Data table of real BASS-II flight runs, DOI links, export | Full-screen desktop | Dark data grid |
| **S12** | `/ask` | Answer card with verified citations | Ask: *"Why is fire spherical in microgravity?"* | Extractive answer card with NTRS report citation chips | Cropped chat area ($900 \times 600$) | Dark |

*(Citations: `docs/hero_kit/SHOT_LIST.md:5-16`, `docs/DEMO_SCRIPT.md:8-53`)*

---

## 7. VISUAL IDENTITY

### Color Palette (Hex Codes)
- **Primary Backgrounds:**  
  - Deep Space Canvas: `#04101f` / `#060813`  
  - Card & Glass Surfaces: `rgba(7, 18, 39, 0.75)` / `rgba(10, 20, 40, 0.88)`  
  - Border Lines: `rgba(121, 220, 232, 0.25)` / `rgba(255, 255, 255, 0.08)`
- **Accent & State Colors:**  
  - Cyan Glow / Primary Accent: `#79dce8` / `#5fd0e1` / `#38bdf8` (Nominal states, scientific highlights, interactive borders)  
  - Ember / Convection Accent: `#ff7a3d` / `#f97316` (Thermal buoyancy, flame cores)  
  - Solar Amber / Caution Accent: `#ffaa40` / `#d9af75` (Advisory notices, partial gravity warnings)  
  - Emergency Rose: `#f43f5e` / `#e11d48` (Fire alarm states, zone localization locks)  
  - Verified Emerald: `#34d399` / `#10b981` (Provenance confirmed, suppression completed)  
*(Citations: `apps/web/src/index.css:10-14, 44-63`, `docs/upgrade_kit/docs/DESIGN_SYSTEM.md:15-45`)*

### Typography
- **Primary Display & Sans-Serif:** **Plus Jakarta Sans** (clean, modern geometric sans-serif for headlines, navigation, and body copy; loaded from Google Fonts and aliased across all UI components).  
- **Technical & Telemetry Monospace:** **JetBrains Mono** (used for numerical telemetry, sensor readouts, timestamps, coordinates HUD, and code).  
- **Fallback Headings:** Space Grotesk / Inter (aliased gracefully via CSS font-face).  
*(Citations: `apps/web/src/index.css:3-8, 16-43`, `apps/web/index.html:10-16`)*

### Logo & Iconography
- **Logo Identity:** Custom SVG icon depicting an atomic/orbital combustion ring surrounding a luminous nucleus, styled with cyan-to-white gradients (`apps/web/src/components/layout/Navbar.tsx:49-55`).  
- **Icon Style:** Lucide React icons, rendered with 1.5–2px stroke-width and paired with soft glow effects (`lucide-react`).  
*(Citations: `apps/web/src/components/layout/Navbar.tsx:47-56`)*

---

## 8. DIFFERENTIATORS AND IMPACT

### Core Differentiators (Supported Strictly by Code)
1. **Zero Generative Hallucination:** IGNIS does not use generative AI to guess combustion outcomes. It queries an indexed corpus of **1,401 real NASA spaceflight runs**; if an atmospheric condition was never tested in space, it says so plainly (`real_solid_matcher.ts:430-434`).
2. **Raw Flight Provenance to the CSV Row:** Every match displays exact sensor telemetry, test chamber fan dial settings, and permanent DOI links to published NASA papers (`RealMatchCard.tsx`, `EvidenceBriefModal.tsx`).
3. **Transparent Scientific Retraction:** Unlike typical AI projects that hide flaws, IGNIS openly publishes the retraction of its earlier ungrouped cross-validation figures, replacing them with a strict Grouped Leave-One-Out CV benchmark (**80.30% accuracy**) (`docs/VALIDATION.md`, `scripts/validate/grouped_loocv.py`).
4. **Empirically Calibrated Smoke Physics (NASA SAME-R):** Models the real physical reason smoke alarms fail in spaceflight: sub-micron particles from overheated Teflon wiring escape detection by standard optical sensors (`Model M1`, `responseCurve.ts`).
5. **Life-Safety Astronaut Confirmation Gate:** Suppression requires an explicit 1.2s human hold-to-confirm in crewed habitats, upholding astronaut life-support safety standards (`HoldToConfirmGate.tsx`).

### Real-World Impact
- **Artemis & Commercial Space Stations:** Informs habitat environmental design (e.g. testing whether proposed $34\%\,O_2$ EVA preparation atmospheres have empirical fire flammability precedent).  
- **Rapid Incident Diagnosis:** Reduces multi-compartment smoke localization ambiguity using inter-zone arrival delays.  
- **Open Science Education:** Demystifies spaceflight fire physics for students worldwide through interactive 3D WebGL simulations.  
*(Citations: `docs/FIRE_RESPONSE.md:5-13`, `README.md:215-216`)*

### Honest Limitations & Boundaries
1. **Not Flight Software:** Developed for the NASA Space Apps Challenge; does not certify materials under **NASA-STD-6001B**.  
2. **Simplified 1D Transport:** Compartment smoke transport uses a 1D well-mixed network rather than 3D CFD.  
3. **Terrestrial Training for M2:** Model M2 was trained on terrestrial $1\,g$ room fires; it carries a persistent disclosure badge.  
4. **Droplet Extinction Only:** Model M4 is calibrated on isolated liquid droplets (FLEX); it cannot be extrapolated to cabin solid plastics.  
5. **Partial Gravity Unvalidated:** No solid combustion experiments have flown on the lunar or Martian surface; fractional gravity selections render advisory notices.  
*(Citations: `docs/LIMITATIONS.md:1-55`, `README.md:69-82, 133, 215-216`)*

---

## 9. JUDGE-FACING SUMMARY

- **Innovation:**  
  IGNIS replaces black-box "fire risk percentages" with an empirical similarity engine that directly retrieves the 5 closest actual NASA spaceflight experiments in parameter space, linking every recommendation to raw CSV rows and DOI publications. It bridges physical flight tables with a cinematic 3D space station emergency response simulator featuring multi-sensor race clocks and a life-critical crew suppression gate (`apps/web/src/lib/matcher/real_solid_matcher.ts`, `apps/web/src/components/response/StationDemoPage.tsx`).
- **Technical Depth:**  
  The platform integrates 1,401 NASA flight runs, calibrates photoelectric response curves against 130 NASA SAME-R flight runs, trains conformal droplet extinction boundaries on 262 NASA FLEX burns, and enforces bit-exact determinism across **278 automated unit tests** and 41 Playwright E2E tests (`docs/models/`, `npm test`). It features full client-side execution with zero external runtime dependencies.
- **Use of NASA Data:**  
  IGNIS exhaustively ingests 14 distinct NASA flight investigations from the Physical Sciences Informatics (PSI) repository spanning solid, droplet, and gas regimes (BASS, BASS-II, Saffire-I/II/III, FLEX, ACME, CFI), alongside 930 indexed text passages from 7 NASA NTRS technical reports (`README.md:40-56`, `data/provenance/ml_manifest.json`).
- **Usability & Design Polish:**  
  Featuring a high-performance Three.js WebGL cutaway station, responsive Tailwind styling, Plus Jakarta Sans typography, synchronized mission-control subtitles, Web Audio speech synthesis, and full mobile responsiveness (tested down to 390x844 with 0 horizontal overflow), IGNIS allows anyone to comprehend microgravity combustion within 30 seconds (`apps/web/e2e/`, `apps/web/src/index.css`).
- **Impact & Scientific Honesty:**  
  IGNIS demonstrates unprecedented scientific integrity by publishing the retraction of its earlier ungrouped machine learning claims, enforcing persistent warning banners for unvalidated gravity regimes, and mandating human confirmation before releasing fire suppression in crewed modules (`docs/VALIDATION.md`, `apps/web/src/components/response/HoldToConfirmGate.tsx`).

---

## 10. GAPS & OPEN ITEMS

1. **Validation Numbers & Simulator DOI Provenance:** [RESOLVED]  
   `AboutPage.tsx`, `SimpleNasaResultPanel.tsx`, `EvidenceBriefModal.tsx`, and `MiniEnvelopePlot.tsx` now display verified Grouped Leave-One-Out CV benchmarks (**80.30% overall accuracy (106/132), 46.72% balanced accuracy, 48.00% extinction recall (12/25)**), verified usable-run tested bounds (`O2 13.6%–22.2%`, `flow 0.0–28.18 cm/s` / `27.15 cm/s`), and canonical PSI investigation DOIs (`PSI-25`..`PSI-100`).
2. **Response Console Telemetry & Detector Race Honesty (`StationDemoPage.tsx`, `OutcomeSummaryModal.tsx`):** [RESOLVED]  
   Detector clocks and `OutcomeSummaryModal.tsx` now report exact signed alarm order (`calibrated earlier`, `+6.0 s persistence lag`, or `Standard still waiting`) and live timeline metrics rather than hardcoded placeholders.
3. **Corpus Scope Filtering & Honest Extractive Mode on `/ask` (`corpus_scopes.ts`, `AskContext.tsx`, `AskIgnisPage.tsx`):** [RESOLVED]  
   Scope selection (`global`, `solid`, `acme`) filters chunks with dedicated `BM25Retriever` indices; unconfigured `earthdata` is explicitly disabled with a `Coming soon` badge, browser mode is accurately labeled as extractive BM25 search with opt-in LLM synthesis, and abstention + structured matcher parity (`56/56` holdout check) is preserved.
4. **Story Mode Chapters 1–4 (`apps/web/src/story/chapters/`):** [RESOLVED]  
   All 4 chapters (`chapter1.ts`–`chapter4.ts`) are implemented and launchable from `/stories`, while retaining explicit fixture provenance tags for illustrative time-series charts.
5. **Team Member Names & Production URLs:**  
   The submission files contain placeholders (`<CONFIRM: list team member names>`, `<CONFIRM: paste production URL>`). The author must supply final names, live Vercel URL, `GEMINI_API_KEY` (if enabling optional serverless LLM synthesis), and video links prior to final submission (`docs/SUBMISSION.md:5-8`).
