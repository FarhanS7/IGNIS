# IGNIS — Intelligent Guidance from NASA Ignition Studies

> **Build a habitat. Start a fire. Discover the science.**  
> An evidence-grounded AI experience for NASA microgravity combustion research and spacecraft fire safety.

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA%20Space%20Apps-2026-0B3D91?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Project Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/7gkzC_eCZo4?si=LSB5FS33oEKB6Tgs)
[![License: MIT](https://img.shields.io/badge/License-MIT-79dce8?style=for-the-badge)](LICENSE)
[![Status: Prototype](https://img.shields.io/badge/Status-Interactive%20Landing%20Page-ff7a3d?style=for-the-badge)](#)

---

<p align="center">
  <img src="assets/images/Hero%20Section.png" alt="IGNIS - Mission Control Hero Section" width="100%" style="border-radius: 8px;" />
</p>

> 🎬 **Project Walkthrough & Deep-Dive:** Watch our comprehensive video presentation and demonstration on [YouTube (7gkzC_eCZo4)](https://youtu.be/7gkzC_eCZo4?si=LSB5FS33oEKB6Tgs).

---

## 🚀 Overview

**IGNIS** is a web-based evidence and science-communication experience developed for the **NASA International Space Apps Challenge 2026** under the challenge:  
**_Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data_**.

### The Core Principle
> **The AI is not the source of truth — NASA experiments are.**

Decades of NASA microgravity combustion research (from Skylab and Space Shuttle drop towers to the International Space Station and Cygnus spacecraft) contain invaluable physical data. IGNIS makes that evidence searchable, comparable, visual, and understandable — without asking an AI model to hallucinate the physics.

Whenever IGNIS displays an insight, every important claim remains strictly traceable to primary NASA flight data and peer-reviewed literature.

---

## ✨ Key Features

### 1. Build a Habitat (Interactive Scenario Builder)
- **Destination Context**: Choose between **Orbital (0g)**, **Lunar Base (0.16g)**, and **Mars Base (0.38g)**.
- **Cabin Atmosphere Engineering**: Interactively adjust:
  - **Oxygen Concentration ($O_2$)**: $18.0\% - 34.0\%$ (including standard Earth sea-level $21\%$ and NASA Exploration Atmosphere $34\%$).
  - **Cabin Total Pressure**: $50.0 - 101.3\text{ kPa}$ (tested against low-pressure habitat standards).
  - **Forced Ventilation Airflow**: $0.00 - 0.25\text{ m/s}$ (quiescent up to high ventilation).
  - **Target Material Sample**: PMMA (Plexiglas), Cotton/Fiberglass fabric, Nomex flight suits, and Polyethylene solid fuel.
- **Fire Behavior Profile**: Displays evidence-grounded dimensions:
  - **Flame Spread Evidence** (Elevated / Mixed / Limited)
  - **Sustained Burning Evidence** (Elevated / Mixed / Limited)
  - **Extinction Limits** (Strong Quenching vs Flammability boundary)
- **Scientific Gravity-Transfer Caveat**: Dynamically warns users when partial gravity ($0.16g$ / $0.38g$) scenarios are matched against microgravity ($0g$) flight data, explaining the re-emergence of buoyant natural convection.
- **Persistent Disclaimer**: *Illustrative evidence-guided visualization — not a certified physical simulation.*

---

### 2. The Evidence Engine & 5-Level Trust Architecture
IGNIS enforces strict provenance. Every output is categorized into one of five transparent authority tiers:

| Tier | UI Label | Definition | Authority |
| :---: | :--- | :--- | :---: |
| **Level A** | **Observed / NASA Source** | Directly measured telemetry in NASA flight data (e.g., Saffire thermocouple logs, FLEX droplet extinction diameters). | Highest |
| **Level B** | **Normalized Source Data** | Structured, unit-converted metadata with verified DOI and NASA technical report accession numbers. | High |
| **Level C** | **Derived by IGNIS** | Computed analytics such as Computer Vision flame area, growth curves, and centroid tracking. | Reproducible |
| **Level D** | **Similarity Interpretation** | Multi-factor mathematical matching comparing habitat vectors against flight test parameters. | Evidence-backed |
| **Level E** | **AI Synthesis** | Concise natural language explanations strictly constrained to retrieved evidence passages. | Constrained |

#### Scientific Similarity Model
- **Material / Fuel Similarity**: 30%
- **Oxygen Concentration ($O_2$)**: 20%
- **Forced Airflow**: 20%
- **Atmospheric Pressure**: 15%
- **Scientific Objective**: 10%
- **Geometry & Flow Regime**: 5%

---

### 3. AI Flame Vision (Video into Science)
- Turns unstructured NASA microgravity combustion video recordings into verifiable, quantitative time-series data.
- Employs classical computer vision: HSV color-space thresholding, connected-component contour segmentation, and centroid tracking.
- Features an interactive **Timeline Scrubber**:
  - `t = 0.0s`: Spark ignition
  - `t = 3.5s`: Steady spherical blue diffusion flame
  - `t = 7.2s`: Cool flame transition
  - `t = 8.4s`: Radiative extinction
- Displays synchronized metrics: flame area ratio vs. time, peak flame diameter, and molecular diffusion coefficients.

---

### 4. Explore Fire (Guided Science Stories)
- **Story 1: Why Does Fire Burn as a Sphere in Space?**  
  Explains how the absence of gravity eliminates buoyancy-driven natural convection, causing hot combustion gases to form a serene spherical halo where molecular diffusion dictates fuel transport.
- **Story 2: Fire from Space vs Fire in Space**  
  Contrasts NASA Earthdata FIRMS satellite thermal anomaly wildfire detection on Earth with enclosed spacecraft combustion aboard Cygnus cargo vehicles.
- **Story 3: The Airflow Paradox in Spacecraft**  
  Demonstrates how zero-gravity flames self-extinguish in their own $CO_2$ without ventilation, but accelerate under gentle life-support airflow ($0.05\text{ m/s}$).

---

### 5. Ask IGNIS (Grounded Research Assistant)
- A retrieval-augmented assistant embedded to answer technical questions regarding microgravity fire safety.
- Pre-populated inquiries illustrate immediate evidence-constrained responses with primary source citation chips (e.g., *NASA TM-2015-218820*, *Saffire-I Flight Report*, *PSI Archives*).

---

## 🛠️ Technology Stack & Aesthetics

- **Core**: HTML5, Vanilla CSS3, ES6+ JavaScript.
- **Design System**:
  - Sleek NASA mission-control glassmorphism with high-performance CSS backdrop filters.
  - Deep-space cosmic starfield backdrop with authentic celestial imagery.
  - Interactive Canvas 2D glowing particle cursor trail with inertia physics.
  - Smooth Lenis momentum scrolling and staggered entrance cascade animations.
  - Responsive layout optimized from mobile screens up to 4K displays.
- **Zero Heavy Frameworks**: Instant load times and zero build steps required.

---

## 💻 Getting Started

To explore IGNIS locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FarhanS7/IGNIS.git
   cd IGNIS
   ```

2. **Open in your browser:**
   - Double-click `index.html` to open directly in any browser (Chrome, Edge, Firefox, Safari).
   - Or start a lightweight local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node / npx
     npx serve .
     ```
   - Navigate to `http://localhost:8000`

---

## 📚 NASA Open Data Sources Referenced

- **NASA Physical Sciences Informatics (PSI)**: [psi.nasa.gov](https://psi.nasa.gov)
- **NASA Open Science Data Repository (OSDR)**: [osdr.nasa.gov](https://osdr.nasa.gov)
- **Saffire (Spacecraft Fire Experiment) Mission Series**: Cygnus flights OA-5 through NG-14
- **FLEX & FLEX-2 (Flame Extinction Experiment)**: Droplet combustion aboard the ISS CIR (Combustion Integrated Rack)
- **BASS & BASS-II (Burning and Suppression of Solids)**: Microgravity Science Glovebox investigations
- **NASA Earthdata FIRMS**: Fire Information for Resource Management System

---

## 📄 License & Disclaimer

- **License**: MIT License.
- **Scientific Disclaimer**: *IGNIS is an educational and research evidence exploration tool developed for the NASA International Space Apps Challenge. It is not a certified spacecraft life-safety system.*
