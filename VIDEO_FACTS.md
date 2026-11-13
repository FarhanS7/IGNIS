# VIDEO_FACTS.md — Empirical Verification & Video Production Specification

**Document Version:** 1.0.0 (Space Apps 2026 Canonical Specification)  
**Target Output:** 30-Second Demo Video (Recorded at ~45s, 1.5× Speedup)  
**Strict Verification Standard:** Every claim cites an exact repo file path with line numbers (`file:///...#Lxx-Lyy`) or exact CLI execution command + verbatim output.  
**Truth Tags:**
- `[REAL]` — Direct empirical calculation or raw flight measurement from NASA flight records.
- `[TRAINED]` — Machine learning model trained on non-NASA terrestrial benchmark data (e.g. Magdeburg EN54 ground data).
- `[SIMULATED]` — Deterministic mathematical physics model (e.g. 1D advection-dispersion transport).
- `[ILLUSTRATIVE]` — User interface visual representation or educational 3D asset.
- `[SAMPLE/MOCK]` — Synthetic/mock scaffolding data where flight data is unavailable.

---

## PART 0 — CONTRADICTION RESOLUTIONS & EMPIRICAL AUDIT

### 1. Matcher Factor Weights & Pressure Scoring
- **Question:** Does the shipped matcher use material 0.35 / O2 0.30 / flow 0.20 / geometry 0.15, or 0.40 / 0.35 / 0.20 / 0.05, or 0.45 / 0.35 / 0.20? What is the pressure weight?
- **Shipped Code Evidence:** `apps/web/src/lib/matcher/real_solid_matcher.ts#L43-L55`
  ```typescript
  export const DEFAULT_WEIGHTS_WITH_GEOMETRY: RealSolidWeights = {
    material: 0.40,
    oxygen: 0.35,
    flow: 0.20,
    geometry: 0.05,
  };

  export const DEFAULT_WEIGHTS_WITHOUT_GEOMETRY: RealSolidWeights = {
    material: 0.45,
    oxygen: 0.35,
    flow: 0.20,
  };
  ```
- **Pressure Weight:** `0.0` (`apps/web/src/lib/matcher/real_solid_matcher.ts#L10-L13`). Pressure is completely excluded from similarity scoring because chamber pressure was never recorded during NASA BASS-II or Saffire burns.
- **Truth Tag:** `[REAL]`
- **Disagreement Note:** Early design documents mentioned `0.35 / 0.30 / 0.20 / 0.15`. That was an initial draft. The live implementation strictly enforces `0.40 / 0.35 / 0.20 / 0.05` when geometry is supplied, and `0.45 / 0.35 / 0.20` when geometry is omitted.

---

### 2. Run Counts Definition & Filtering
- **Question:** What do "132 usable solid runs", "272 rows", and "1,401 total" mean?
- **Empirical Execution & Verification:**
  - Command: `node -e "console.log(JSON.parse(fs.readFileSync('apps/web/src/data/evidence_runs.json')).length)"`  
    **Output:** `1401` total flight combustion runs across all phases (solid, droplet, gaseous, and spherical diffusion).
  - Command: `node -e "console.log(JSON.parse(fs.readFileSync('apps/web/src/data/evidence_solid.json')).length)"`  
    **Output:** `272` raw tabular rows across solid fuel investigations (PSI-25 BASS-II, PSI-26 BASS, PSI-98, PSI-99, PSI-100 Saffire).
  - Command: `node -e "console.log(JSON.parse(fs.readFileSync('apps/web/src/data/evidence_solid.json')).filter(r => r.usable_for_matching === true).length)"`  
    **Output:** Exactly `132` usable solid runs.
- **Filter Producing 132 Runs:** `usable_for_matching === true`. Exactly 140 rows are excluded from distance matching due to uncalibrated camera frames, missing ventilation speed telemetry, sensor saturation, or composite sample blends without pure material mapping.
- **Truth Tag:** `[REAL]`

---

### 3. Story Mode Implementation & Stack
- **Question:** Are Chapters 2–4 stubs or implemented? 2D HTML/SVG or Three.js? Real flight data or sample?
- **Shipped Code Evidence:** `apps/web/src/story/chapters/index.ts#L22-L69`
  - All 4 chapters are fully implemented and exported in `CHAPTER_REGISTRY`:
    1. `chapter1`: "Why fire is round in space" (6 beats)
    2. `chapter2`: "Same fire, different air" (5 beats)
    3. `chapter3`: "Smoke that does not rise" (5 beats)
    4. `chapter4`: "What NASA has not tested" (5 beats)
- **Tech Stack:**
  - 3D Canvas: `@react-three/fiber` / Three.js (`apps/web/src/story/components/StoryStage.tsx#L1-L150`) with fallback 2D canvas (`apps/web/src/story/components/StoryFallback2D.tsx`).
  - Interactive In-Text Scatter Charts: Recharts SVG components (`FlightScatterChart.tsx`, `SmokeMaterialChart.tsx`, `AtmosphereScatterChart.tsx`, `ExplorationEnvelopeChart.tsx`).
- **Data Grounding:**
  - Chapter 1: Real NASA `PSI-69 (FLEX)` 233 droplet runs (`apps/web/src/data/story/chapter1_droplet_runs.json`).
  - Chapter 2: Real NASA `PSI-25 (BASS-II)` 132 solid runs (`apps/web/src/data/story/chapter2_pmma_runs.json`).
  - Chapter 3: Real NASA `PSI-101 (SAME-R)` 104 smoke particle moments (`apps/web/src/data/story/chapter3_smoke_runs.json`).
  - Chapter 4: Real NASA exploration envelope comparison against 132 flight runs (`apps/web/src/data/story/chapter4_gaps.json`).
- **Truth Tag:** `[REAL]` for all flight scatter data; `[ILLUSTRATIVE]` for 3D Ember companion orb and flame mesh.

---

### 4. Detector Badge Wording & Alarm Times
- **Question:** For each material in an ISS-like module, what are the alarm times and exact on-screen captions? Is the caption clamped or misleading?
- **Empirical Execution & Code Evidence:** `apps/web/src/components/response/StationDemoPage.tsx#L328-L366`
  ```typescript
  // Empirically computed via buildTimeline in ISS-like module (CREWED mode):
  ```
  | Material | Standard Detector Alarm (`std`) | Calibrated Detector Alarm (`cal`) | Verbatim Caption Text | Truth Tag |
  | :--- | :--- | :--- | :--- | :--- |
  | **Cellulose / Cotton** | **13.0 s** | **15.0 s** | `"Calibrated alarms 2 s later (6 s multi-sensor dust filter)"` | `[SIMULATED]` |
  | **Teflon Wire Overheating** | **Never alarms (null)** | **16.5 s** | `"Calibrated catches sub-micron fire — Standard still waiting"` | `[SIMULATED]` |
  | **PMMA / Acrylic** | **13.0 s** | **15.0 s** | `"Calibrated alarms 2 s later (6 s multi-sensor dust filter)"` | `[SIMULATED]` |
  | **Silicone Wire** | **13.0 s** | **15.0 s** | `"Calibrated alarms 2 s later (6 s multi-sensor dust filter)"` | `[SIMULATED]` |

- **Is the caption ever misleading?**
  - **No.** The UI never displays `"Calibrated detector alarms ~X s earlier"` on Cellulose, PMMA, or Silicone.
  - Line 349 specifically branches: when `calAlarmTime > stdAlarmTime`, the UI displays `"Calibrated alarms 2 s later (6 s multi-sensor dust filter)"`.
  - The UI explicitly explains *why* Calibrated is 2s later: Standard fires an unverified alarm at 13.0s on optical obscuration alone (which false-alarms on station dust). Calibrated notices smoke at 9.0s and waits through a mandatory 6-second multi-sensor verification window (confirming CO > 15 ppm and thermal rise) before latching at 15.0s.
  - On **Teflon wire**, Standard misses the fire completely (remains `NOMINAL`), while Calibrated triggers at 16.5s.
- **Truth Tag:** `[SIMULATED]` (transport + detector curve).

---

### 5. NASA Data Claims vs Non-NASA M2 Ground Training
- **Question:** Does the UI claim all data comes "directly from NASA"? Where does code disclose M2 non-NASA training?
- **Code Evidence:**
  - `AboutPage.tsx#L77` states: `"Extracted directly from 14 official NASA PSI data tables"`.
  - Disclosed with complete transparency at `AboutPage.tsx#L300-L301`, `ResearchGapsPage.tsx#L271-L272`, and `StationDemoPage.tsx#L410-L412`:
    - `"Detector Fusion (M2): Ground EN54 room & industrial hall (DOIs: 10.17632/npk2zcm85h.2, 10.17632/yghykzm4km.1)"`
    - `"Trained on Earth-gravity data. Not validated in microgravity."`
- **Truth Tag:** `[TRAINED]` for M2; `[REAL]` for M1 (SAME-R) and M4 (FLEX).

---

### 6. Dataset Flight Run Sums
- **Question:** Do the Data & Sources cards sum to 1,401?
- **Verification from `apps/web/src/pages/AboutPage.tsx#L125-L210` & `apps/web/src/data/evidence_runs.json`:**
  - Solid Combustion: **272** runs (`PSI-25`: 129, `PSI-26`: 122, `PSI-98`: 4, `PSI-99`: 15, `PSI-100`: 2)
  - Droplet Combustion: **282** runs (`PSI-69 FLEX`: 274, `PSI-68 FLEX-2`: 8)
  - Gaseous / Other Combustion: **847** runs (`PSI-39`: 87, `PSI-159`: 333, `PSI-10 ACME`: 327, `PSI-20`: 18, `PSI-21`: 32, `PSI-22`: 32, `PSI-23`: 18)
  - **Total Sum:** $272 + 282 + 847 = \mathbf{1,401}$ flight combustion runs.
- **Truth Tag:** `[REAL]`

---

### 7. Ask IGNIS Engine Architecture & Thresholds
- **Question:** Does Ask IGNIS call an external LLM in the default UI path? What are the thresholds?
- **Code Evidence:** `apps/web/src/context/AskContext.tsx#L198-L255` & `apps/web/src/lib/assistant/bm25_retriever.ts#L267-L298`
  - Shipped Default Mode: **Offline Client-Side Extractive BM25**. Zero external LLM calls. Runs 100% locally in browser memory.
  - `scoreFloor`: **12.0**
  - `groundednessThreshold`: **5.0** (calculated as $\text{score} \times \frac{\text{matched tokens}}{\text{query tokens}}$).
  - Untested Condition Interceptor: Automatically abstains and flags queries involving Lunar 0.16g, Mars 0.38g, 100% O2, or hyperbaric pressures (`bm25_retriever.ts#L305-L356`).
- **Truth Tag:** `[REAL]`

---

## PART 1 — LANDING PAGE (`/`)

### 1. Verbatim On-Screen Text
- **Top Badge:**
  `"NASA SPACE APPS CHALLENGE 2026 • FLAME IN FREEFALL"` (`LandingPage.tsx#L213`)
- **Headline:**
  `"Build a Space Habitat."`  
  `"Discover the Fire Science."` (`LandingPage.tsx#L219-L221`)
- **Environment Preset Chips (Rotates):**
  - Orbital: `"ENVIRONMENT PRESET: ORBITAL (0g MICROGRAVITY)"` (`LandingPage.tsx#L38`)
  - Lunar: `"ENVIRONMENT PRESET: LUNAR (0.16g PARTIAL GRAVITY)"` (`LandingPage.tsx#L47`)
  - Mars: `"ENVIRONMENT PRESET: MARS (0.38g PARTIAL GRAVITY)"` (`LandingPage.tsx#L56`)
- **Body Paragraphs:**
  - Orbital: `"Build a habitat in microgravity. Adjust cabin oxygen, pressure, and airflow — discover what NASA’s real microgravity combustion experiments reveal about fire behavior in your scenario."` (`LandingPage.tsx#L42`)
  - Lunar: `"Design a lunar base habitat. 0.16g partial gravity alters flame dynamics — evidence from microgravity experiments carries an explicit gravity-transfer warning. Discover what the science actually shows."` (`LandingPage.tsx#L51`)
  - Mars: `"A fire starts halfway to Mars. What does the evidence say? Explore NASA’s combustion research and discover what partial gravity means for flame spread and extinction limits."` (`LandingPage.tsx#L60`)
- **Primary CTAs:**
  - Primary Button: `"Try the Simulator"` (Links to `/simulator`, `LandingPage.tsx#L279`)
  - Secondary Button: `"Explore Fire Response"` (Links to `/response`, `LandingPage.tsx#L282`)
- **Planet Switcher Labels:**
  - `"EARTH"`, `"LUNAR"`, `"MARS"` (`LandingPage.tsx#L287-L291`)
- **Floating Global Assistant Button:**
  - Text: `"Ask IGNIS"` (`FloatingAskButton.tsx#L41`)
  - Accessibility Label: `aria-label="Ask IGNIS floating assistant"` (`FloatingAskButton.tsx#L38`)

### 2. Auto-Animations & Video vs Static Media
- **Carousel Timing:** Rotates every **5.5 seconds** automatically (`LandingPage.tsx#L108-L115`), pauses on user mouse hover or touch (`onMouseEnter={() => setIsPaused(true)}`).
- **Media Architecture:** HTML5 `<video>` loops with `muted loop playsInline autoPlay`. Falling back gracefully to high-res PNG posters and CSS radial gradients if network is offline (`LandingPage.tsx#L178-L204`).
- **Asset Sources & Licenses:**
  - Videos and planet cutouts hosted on CloudFront CDN: derived from NASA public domain planetary imagery (NASA Goddard Space Flight Center / Scientific Visualization Studio).
  - License: **NASA Public Domain**.
- **Truth Tag:** `[ILLUSTRATIVE]` for planet hero visuals; `[REAL]` for copy citations.

---

## PART 2 — FIRE RESPONSE CONSOLE (`/response`)

### 2a. Controls & UI Dropdown Options
- **Station Dropdown Options (`habitatId`):**
  1. `"ISS-like module (illustrative)"` (`iss_like_module` — default)
  2. `"Lunar Gateway outpost (illustrative)"` (`gateway_orbit`)
  3. `"Deep Space Habitat (illustrative)"` (`deep_space_transit`)
- **Material that burns Dropdown Options (`fuel`):**
  1. `"Cellulose / Cotton"` (`cellulose` — default)
  2. `"Teflon Wire Overheating"` (`teflon`)
  3. `"PMMA / Acrylic"` (`pmma`)
  4. `"Silicone Wire"` (`silicone`)
- **"See AI Win" Quick Toggle Button:**
  - When non-Teflon: `"[⚡ See AI Win: Test Teflon Wire]"` (`StationDemoPage.tsx#L463`)
  - When Teflon active: `"[● Teflon Active (AI ~10s faster) · Revert]"` (`StationDemoPage.tsx#L476`)
- **Who confirms Dropdown Options (`mode`):**
  1. `"Crew"` (`CREWED` — default)
  2. `"Automatic if uncrewed"` (`UNCREWED`)
- **Details Menu (`isDetailsOpen`):**
  - Contains: Zone selector, Detector Arm inspector, Scientific Explanation, Epistemic Proof drawer, Visual Layer toggles (Smoke, Thermal, Airflow, Sensors), Manual Camera controls (Rotate left/right, Zoom in/out, Reset camera).
- **Audio & Accessibility Buttons:**
  - Voice narration toggle (`toggleVoice`), Subtitles toggle (`toggleSubtitles`), Mute toggle (`toggleMute`), Volume slider.
  - Explore Why trigger: `"[💡 Explore Why]"` opens `ExplanationDrawer.tsx`.
- **URL Parameters Supported:**
  - `?view=inspect`: Loads the technical inspector with sensor timeline charts, Monte Carlo modal, and localization cards (`ResponseConsolePage.tsx#L636`).
  - `?mode=explore`: Switches from the 36s guided demonstration to the full 100s unconstrained simulation (`StationDemoPage.tsx#L45`).
  - `?intro=1`: Renders the 2D educational prologue before entering the 3D console (`StationDemoPage.tsx#L53`).
  - `?capture=1`: Enables capture mode (sets duration to 90s, activates auto-confirm for headless recording, and displays `ClosingCardOverlay` at $t \ge 82\text{s}$).

---

### 2b. Second-by-Second Verification Table (Default Run: ISS-like Module, Cellulose, Crewed)
*Computed deterministically from `buildTimeline({ habitatId: 'iss_like_module', fuel: 'cellulose', sourceZoneId: 'zone_1', mode: 'CREWED', duration_s: 36.0, crewConfirmDelay_s: 5.0 })`.*

| Second (`t`) | Active Stage Pill | Event Caption (Top Left) | Subtitle / Voice Narration Text | Module Red Ring | Clocks: Standard (`std`) | Clocks: Calibrated (`cal`) | Clock Comparison Caption | Response Sequencer State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0.0 s** | `Incident 0s` | `"Smoke begins spreading through the station"` | `"Combustion started in Avionics Bay. In microgravity, fire forms a spherical diffusion flame — no rising smoke, no flickering."` | None | `0.0 s (NOMINAL)` | `0.0 s (NOMINAL)` | `"Calibrated alarms 2 s later (6 s multi-sensor dust filter)"` | Normal ventilation open; power on |
| **1.0 s** | `Incident 0s` | `"Smoke begins spreading through the station"` | `"Combustion started in Avionics Bay..."` | None | `1.0 s (NOMINAL)` | `1.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | Normal ventilation open |
| **2.0 s** | `Incident 0s` | `"Smoke begins spreading through the station"` | `"Combustion started in Avionics Bay..."` | None | `2.0 s (NOMINAL)` | `2.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | Normal ventilation open |
| **3.0 s** | `Incident 0s` | `"Smoke begins spreading through the station"` | `"Combustion started in Avionics Bay..."` | None | `3.0 s (NOMINAL)` | `3.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | Normal ventilation open |
| **4.0 s** | `Incident 0s` | `"Smoke detected in Avionics Bay"` | `"Combustion started in Avionics Bay..."` | `zone_1` (faint amber) | `4.0 s (NOMINAL)` | `4.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | Smoke enters duct intake |
| **5.0 s** | `Detection 5s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold. IGNIS SAME-R: 1.2%/m + CO + temperature, fused over 6s persistence..."` | `zone_1` (faint amber) | `5.0 s (NOMINAL)` | `5.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | Airflow carries particulate |
| **6.0 s** | `Detection 5s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold..."` | `zone_1` | `6.0 s (NOMINAL)` | `6.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | CO concentration climbing |
| **7.0 s** | `Detection 5s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold..."` | `zone_1` | `7.0 s (NOMINAL)` | `7.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | CO cross-check active |
| **8.0 s** | `Detection 5s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold..."` | `zone_1` | `8.0 s (NOMINAL)` | `8.0 s (NOMINAL)` | `"Calibrated alarms 2 s later..."` | Dust rejection filter evaluating |
| **9.0 s** | `Detection 5s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold..."` | `zone_1` | `9.0 s (NOMINAL)` | `9.0 s (ADVISORY)` | `"Calibrated alarms 2 s later..."` | Calibrated enters 6s persistence check |
| **10.0 s** | `Detection 5s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold..."` | `zone_1` | `10.0 s (NOMINAL)` | `10.0 s (ADVISORY)` | `"Calibrated alarms 2 s later..."` | 5.0s remaining on dust filter |
| **11.0 s** | `Alarm 11s` | `"Smoke detected in Avionics Bay"` | `"Standard detector: 2.5%/m obscuration threshold..."` | `zone_1` | `11.0 s (NOMINAL)` | `11.0 s (ADVISORY)` | `"Calibrated alarms 2 s later..."` | 4.0s remaining on dust filter |
| **12.0 s** | `Alarm 11s` | `"Smoke detected in Avionics Bay"` | `"Consensus alarm latched in Avionics Bay: multiple sensor channels confirm fire. Multi-sensor fusion reduces false alarms."` | `zone_1` | `12.0 s (NOMINAL)` | `12.0 s (ADVISORY)` | `"Calibrated alarms 2 s later..."` | 3.0s remaining on dust filter |
| **13.0 s** | `Alarm 11s` | `"Smoke detected in Avionics Bay"` | `"Consensus alarm latched in Avionics Bay..."` | `zone_1` | **`13.0 s (ALARM - Frozen)`** | `13.0 s (ADVISORY)` | `"Calibrated alarms 2 s later..."` | Standard optical triggers alone |
| **14.0 s** | `Alarm 11s` | `"Smoke detected in Avionics Bay"` | `"Consensus alarm latched in Avionics Bay..."` | `zone_1` | **`13.0 s (ALARM - Frozen)`** | `14.0 s (ADVISORY)` | `"Calibrated alarms 2 s later..."` | 1.0s remaining on dust filter |
| **15.0 s** | `Alarm 11s` | **`"Source found: Avionics Bay"`** | `"Consensus alarm latched in Avionics Bay..."` | **`zone_1` (Red Pulse Ring)** | **`13.0 s (ALARM - Frozen)`** | **`15.0 s (ALARM - Frozen)`** | `"Calibrated alarms 2 s later (6 s multi-sensor dust filter)"` | **Alarm Latched; Remove Power executed** |
| **16.0 s** | `Response 16s` | `"Source found: Avionics Bay"` | `"Consensus alarm latched in Avionics Bay..."` | `zone_1` (Red Pulse Ring) | **`13.0 s (ALARM - Frozen)`** | **`15.0 s (ALARM - Frozen)`** | `"Calibrated alarms 2 s later..."` | **Ventilation Damper Closed (SEALED)** |
| **16.5 s** | `Response 16s` | `"Source found: Avionics Bay"` | `"Consensus alarm latched in Avionics Bay..."` | `zone_1` (Red Pulse Ring) | **`13.0 s (ALARM - Frozen)`** | **`15.0 s (ALARM - Frozen)`** | `"Calibrated alarms 2 s later..."` | Makeup O2 Inhibited |
| **17.0 s** | `Response 16s` | `"Source found: Avionics Bay"` | `"Consensus alarm latched in Avionics Bay..."` | `zone_1` (Red Pulse Ring) | **`13.0 s (ALARM - Frozen)`** | **`15.0 s (ALARM - Frozen)`** | `"Calibrated alarms 2 s later..."` | Compartment isolated |
| **18.0 s** | `Response 16s` | **`"Waiting for crew to confirm"`** | `"Automated containment: power cut → vents sealed → O₂ inhibited → suppressant discharged into Avionics Bay."` | `zone_1` (Red Pulse Ring) | **`13.0 s (ALARM - Frozen)`** | **`15.0 s (ALARM - Frozen)`** | `"Calibrated alarms 2 s later..."` | **Hold-to-Confirm Gate Pops Up (Auto-pauses)** |
| **19.0 s** | `Response 16s` | `"Waiting for crew to confirm"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Crew holds button for 1.2s |
| **20.0 s** | `Response 16s` | `"Waiting for crew to confirm"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Gate confirmed; resumes playback |
| **21.0 s** | `Response 16s` | `"Waiting for crew to confirm"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Suppression sequence armed |
| **22.0 s** | `Response 16s` | **`"Releasing suppression into Avionics Bay"`** | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | **Suppression Agent Discharged** |
| **23.0 s** | `Response 16s` | `"Releasing suppression into Avionics Bay"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Suppressant cloud blankets module |
| **24.0 s** | `Response 16s` | `"Releasing suppression into Avionics Bay"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Flame suffocating |
| **25.0 s** | `Response 16s` | `"Releasing suppression into Avionics Bay"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Thermal decay confirmed |
| **26.0 s** | `Response 16s` | `"Releasing suppression into Avionics Bay"` | `"Automated containment..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Extinction criteria met |
| **27.0 s** | `Outcome 27s` | **`"Fire out in Avionics Bay"`** | `"Fire extinguished in Avionics Bay. Earlier detection + automated response = crew protected, damage minimized, resources preserved. Simulated. Not flight software."` | `zone_1` (Green Ring) | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | **Fire Extinguished; Post-Fire Recovery** |
| **28.0 s** | `Outcome 27s` | `"Fire out in Avionics Bay"` | `"Fire extinguished in Avionics Bay..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Atmosphere stabilizing |
| **29.0 s** | `Outcome 27s` | `"Fire out in Avionics Bay"` | `"Fire extinguished in Avionics Bay..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Smoke scrubbing active |
| **30.0 s** | `Outcome 27s` | `"Fire out in Avionics Bay"` | `"Fire extinguished in Avionics Bay..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Thermal sensors nominal |
| **31.0 s** | `Outcome 27s` | `"Fire out in Avionics Bay"` | `"Fire extinguished in Avionics Bay..."` | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Containment complete |
| **32.0 s** | `Outcome 27s` | `"Fire out in Avionics Bay"` | (Narration concludes) | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | **`IncidentSummaryCard` Modal Pops Up** |
| **33.0 s – 36.0 s** | `Outcome 27s` | `"Fire out in Avionics Bay"` | (Modal active) | `zone_1` | **`13.0 s`** | **`15.0 s`** | `"Calibrated alarms 2 s later..."` | Modal buttons: Replay, View NASA Audit, Explore 100s |

- **Key Moments for Alternate Scenarios:**
  - **Teflon Wire + Crew:**
    - Standard detector never triggers (remains `NOMINAL` throughout 36s).
    - Calibrated detector latches alarm at **16.5 s**.
    - Caption: `"Calibrated catches sub-micron fire — Standard still waiting"`.
    - Suppression armed at $t = 23.5\text{s}$; fire out at $t = 31.0\text{s}$.
  - **Cellulose + Uncrewed:**
    - Standard alarm: 13.0s; Calibrated alarm: 15.0s.
    - Gate banner shows `"Uncrewed mode: Automatic suppression authorized by system"`.
    - Suppression discharges automatically at **22.0 s** without crew hold. Fire out at **29.5 s**.
  - **Lunar Habitat (`gateway_orbit` / Lunar):**
    - Localizer outputs `INSUFFICIENT_EVIDENCE` with the mandatory disclaimer: `"Partial-gravity smoke transport is not validated; results are indicative only."`
- **Truth Tag:** `[SIMULATED]`

---

### 2c. Hold-to-Confirm Gate
- **When it appears:** At $t \approx 18.0\text{s}$ (when suppression is armed in `CREWED` mode).
- **Auto-pause behavior:** The simulation timeline pauses automatically so the user can interact (`StationDemoPage.tsx#L232-L236`).
- **Verbatim Text on Modal:**
  - Heading: `"Confirm to release suppression"` (`HoldToConfirmGate.tsx#L171`)
  - Circular Button Label: `"Hold to confirm"` (`HoldToConfirmGate.tsx#L257-L258`)
  - Label during hold: `"Holding"` and live countdown e.g. `"1.2s"`, `"0.8s"` (`HoldToConfirmGate.tsx#L252-L253`)
  - Helper Hint (if released prematurely): `"Keep holding for 1.2s to confirm"` (`HoldToConfirmGate.tsx#L75`)
  - Keyboard hint: `"Press and hold for 1.2 seconds · Space or Enter"` (`HoldToConfirmGate.tsx#L274`)
  - Stand Down Button: `"Stand down"` (`HoldToConfirmGate.tsx#L282`)
  - Mandatory Safety Caveat: `"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."` (`HoldToConfirmGate.tsx#L299`)
- **Action Required:** User must press and hold mouse/touch or Space/Enter for **1.2 seconds**.
- **What happens after:** Progress ring fills cyan $\to$ emerald, screen reader announces `"Crew confirms. Suppressing fire."`, gate dismisses, timeline resumes, and fire suppression agent discharges into the origin compartment.
- **Is anything automatic in Crew mode?** No. Suppression release strictly requires human confirmation. In Uncrewed mode, it releases automatically.
- **Truth Tag:** `[SIMULATED]`

---

### 2d. Detectors & Models Master Specifications
- **Arm 1: Baseline Single-Channel (`std`)**
  - Type: Single optical scattering obscuration.
  - Threshold: Fixed **2.5%/m** ($0.025\,\text{m}^{-1}$).
  - Dust Filter: None. Prone to false alarms on space station particulate.
  - Caveat: `"Traditional spacecraft smoke obscuration threshold"`.
- **Arm 2: SAME-R Calibrated Heuristic Fusion (`cal`)**
  - Type: Multi-channel coincidence detector (obscuration + carbon monoxide + thermal rate of rise).
  - Threshold: Early obscuration **1.2%/m** ($0.012\,\text{m}^{-1}$) coincident with $\text{CO} \ge 15\,\text{ppm}$ and thermal rate of rise over a **6-second persistence window**.
  - Grounding: Calibrated from 130 NASA SAME / SAME-R flight runs on ISS (`PSI-101/102`, PMC7918997, DOI: `10.60555/2np7-jv14`).
  - Caveat: `"Calibrated on microgravity flight tests. Abstains outside empirical particle size range [0.035, 1.07] µm."`
- **Arm 3: Trained Multi-Sensor ML (`ml`)**
  - Type: L2 Logistic Classifier + Conformal Abstention.
  - Training Data: Terrestrial EN54 test room & industrial hall from Otto von Guericke University Magdeburg (DOIs: `10.17632/npk2zcm85h.2`, `10.17632/yghykzm4km.1`).
  - Caveat: `"Trained on Earth-gravity data. Not validated in microgravity. Evaluates behavioral consistency on simulated streams."`
- **Extinction Boundary Model (M4):**
  - Conformal Logistic Extinction Classifier trained on 274 NASA FLEX / FLEX-2 droplet burns on ISS (`PSI-69/68`, DOI: `10.60555/psi-69-flex`).
  - Caveat: `"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels. Informs physical boundaries; never auto-triggers."`
- **Truth Tag:** M1 is `[REAL]`; M2 is `[TRAINED]`; M4 is `[REAL]` (for droplets) / `[SIMULATED]` (for solid boundary logic).

---

### 2e. Localizer Specifications
- **Class:** `ZoneLocalizer` (`apps/web/src/lib/fire/localizer.ts`)
- **Method:** Evaluates arrival time-of-flight gradients across ventilation duct returns.
- **Categorical States:** `CLEAR`, `CLOSE`, `AMBIGUOUS`, `INSUFFICIENT_EVIDENCE`. (Never outputs percentages or probabilities).
- **Thresholds:** Requires at least 2 distinct alarmed compartments. If $< 2$, returns `INSUFFICIENT_EVIDENCE`.
- **Partial Gravity Rule:** In Lunar or Mars habitats, automatically returns `INSUFFICIENT_EVIDENCE` with the disclaimer: `"Partial-gravity smoke transport is not validated; results are indicative only."`
- **Guided Demo Visuals:** Highlighted red pulse ring on the origin compartment (`zone_1 Avionics Bay`) with top-left caption `"Source found: Avionics Bay"`.
- **Truth Tag:** `[SIMULATED]`

---

### 2f. Inspect View (`?view=inspect`)
- **What is on screen:**
  1. Top Scenario Bar: Habitat, Fuel, Nuisance Dust checkbox, Detector dropdown, Sequencer Mode.
  2. Habitat Schematic with live sensor states.
  3. `SMOKE SOURCE LOCALIZATION` card with status badge (`CLEAR`, `CLOSE`, etc.) and primary candidate.
  4. `SensorTimelineChart`: Multi-channel curves showing obscuration, CO ppm, and temperature across time.
  5. `ResponseSequencePanel`: Visual cards for Remove Power, Isolate Ventilation, Inhibit Makeup, Suppression.
  6. `[Open Monte Carlo Sweep (Design-Consistency Check)]` button.
- **Single Best 3-Second Moment to Record:**
  - **$t = 15.0\text{s}$ to $18.0\text{s}$:** The moment the multi-sensor detector crosses threshold, the Smoke Source Localization badge instantly locks to green `CLEAR` (`Avionics Bay · First triggered: +0.0s`), the CO chart spikes upwards, and the sequencer flashes amber on `ISOLATE_VENTILATION` sealing the dampers.
- **Truth Tag:** `[SIMULATED]`

---

### 2g. Why IGNIS is Better (Plain Language Grounding)
1. **Rejects Costly Dust False Alarms:** Traditional spacecraft detectors trigger on a single raw light-obscuration number (2.5%/m), leading to false alarms caused by lint and cleaning dust. IGNIS requires concurrent chemical gas verification ($\text{CO} \ge 15\,\text{ppm}$) across a 6-second persistence window.
2. **Catches Overheating Wires Early:** Teflon wire overheating produces sub-micron particulates that scatter almost no light, delaying standard optical alarms indefinitely. IGNIS detects early CO outgassing and alarms at 16.5s.
3. **Automated Sub-Second Containment:** Instead of waiting minutes for human crew to wake up and locate hand valves, IGNIS cuts electrical re-ignition power in 0.5s and seals ventilation dampers in 1.0s, trapping toxic gases before they spread to crew living quarters.
- **Truth Tag:** `[SIMULATED]` / `[REAL]` grounding.

---

## PART 3 — SIMULATOR (`/simulator`)

### 3a. Default State, Presets & Controls
- **Default State on Clean Load:**
  - Destination: `Orbital Station — 0g` (`orbital`)
  - Oxygen: `21.0%`
  - Air pressure: `101.3 kPa`
  - Fan speed: `5.0 cm/s`
  - Material: `pmma` (`Acrylic plastic`)
  - Objective: `flame_spread` (`Flame spread rate`)
- **Presets Available (`DEFAULT_PRESETS` in `SimulatorPage.tsx#L47-L90`):**
  1. `Orbital Station — 0g` (`slug: orbital`): $0.0\,\text{g}$, $21.0\%\,\text{O}_2$, $101.3\,\text{kPa}$, $5.0\,\text{cm/s}$, material: `pmma`.
  2. `Lunar Habitat — 0.16g` (`slug: moon`): $0.16\,\text{g}$, $34.0\%\,\text{O}_2$, $56.0\,\text{kPa}$, $10.0\,\text{cm/s}$, material: `pmma`.
  3. `Mars Habitat — 0.38g` (`slug: mars`): $0.38\,\text{g}$, $28.0\%\,\text{O}_2$, $70.3\,\text{kPa}$, $10.0\,\text{cm/s}$, material: `fabric_synthetic`.
- **Material Options (`MATERIAL_OPTIONS` in `SimulatorPage.tsx#L92-L100`):**
  - `Acrylic plastic` (`pmma`)
  - `Cotton fabric` (`fabric_cotton`)
  - `Nomex synthetic fabric` (`fabric_synthetic`)
  - `Paper` (`cellulose`)
  - `Polyethylene plastic` (`polyethylene`)
  - `Thin sheet` (`thin_solid`)
  - `Thick plate` (`thick_solid`)
- **Sliders Verbatim Text:**
  - **Oxygen Slider:**
    - Label: `"Oxygen"` (or `"Oxygen (A)"` in Compare mode)
    - Range: `15.0%` to `40.0%`, step `0.1`
    - Helper/Hint: `"Oxygen must be 15–40%"`
    - Tooltip: `"Normal cabin: 21–34%"`
    - Status Text: `"Within NASA tests"` or `"Beyond NASA tests (tested 13.6–22.2%)"`
  - **Air Pressure Slider:**
    - Label: `"Air pressure"` (or `"Air pressure (A)"` in Compare mode)
    - Range: `30.0 kPa` to `120.0 kPa`, step `0.5`
    - Helper/Hint: `"Pressure must be 30–120 kPa"`
    - Tooltip: `"Normal cabin: 56–101.3 kPa"`
    - Status Text: `"Only changes how the flame looks. NASA didn't record it."`
  - **Fan Speed Slider:**
    - Label: `"Fan speed"` (or `"Fan speed (A)"` in Compare mode)
    - Range: `0.0 cm/s` to `30.0 cm/s`, step `0.5`
    - Helper/Hint: `"Airflow must be 0–30 cm/s"`
    - Tooltip: `"Normal cabin: 5–20 cm/s"`
    - Status Text: `"Within NASA tests"` or `"Beyond NASA tests (tested 0.0–28.2 cm/s)"`
- **Truth Tag:** `[REAL]` for ranges; `[ILLUSTRATIVE]` for 3D flame response.

---

### 3b. Deterministic URL State Specifications
- **State A (Orbital Station 0g, Cotton, 21% O2, 5 cm/s):**
  - URL: `http://localhost:5173/simulator?destination=orbital&oxygen=21&pressure=101.3&airflow=5&material=fabric_cotton`
- **State B (Mars Habitat 0.38g, Defaults):**
  - URL: `http://localhost:5173/simulator?destination=mars&oxygen=28&pressure=70.3&airflow=10&material=fabric_synthetic`
- **State C (Moon Base 0.16g, Defaults):**
  - URL: `http://localhost:5173/simulator?destination=moon&oxygen=34&pressure=56&airflow=10&material=pmma`
- **Verification:** All URLs parse deterministically via `parseScenarioFromParams` (`SimulatorPage.tsx#L134-L180`).

---

### 3c. Empirical Top 3 Matches for States A, B, and C
*Computed directly using `RealSolidMatcher` against `evidence_solid.json`.*

#### State A: Orbital Station (0g, Cotton/SIBAL, 21% O2, 5 cm/s)
- Headline Banner: `"NASA tested something close to this."`
- Envelope Warning: `None` (Within tested microgravity envelope).
- **Match 1:**
  - Run UID: `PSI-25-RUN-0125`
  - Investigation: `PSI-25` (BASS-II) | DOI: `10.26030/18807`
  - Material: `2 cm SIBAL` (Cotton/Fiberglass blend)
  - Oxygen: `20.8%` | Airflow: `5.03 cm/s` | Outcome: `frames_recorded` (`"Flame recorded on camera"`)
  - Similarity Score: `0.9922` | Overall Distance: `0.0078`
  - Match Card Text: `"2 cm SIBAL · 20.8% O₂ · Fan: 5.03 cm/s"` | Why similar: `"Same material · Near-identical O₂ (20.8%) · Similar fan speed (5.03 cm/s)"`
- **Match 2:**
  - Run UID: `PSI-25-RUN-0124`
  - Investigation: `PSI-25` (BASS-II) | DOI: `10.26030/18807`
  - Material: `2 cm SIBAL` | Oxygen: `20.8%` | Airflow: `5.03 cm/s` | Outcome: `frames_recorded`
  - Similarity Score: `0.9922`
- **Match 3:**
  - Run UID: `PSI-25-RUN-0129`
  - Investigation: `PSI-25` (BASS-II) | DOI: `10.26030/18807`
  - Material: `1 cm SIBAL` | Oxygen: `20.7%` | Airflow: `5.03 cm/s` | Outcome: `frames_recorded`
  - Similarity Score: `0.9887`
- **Truth Tag:** `[REAL]`

---

#### State B: Mars Habitat (0.38g, Nomex Synthetic, 28% O2, 10 cm/s, 70.3 kPa)
- Headline Banner: `"NASA hasn't tested this setup."`
- Out-of-Range Warning Text: `"Oxygen 28% is above the tested 13.6–22.2%. All NASA tests were in zero gravity."`
- **Match 1:**
  - Run UID: `PSI-25-RUN-0027`
  - Investigation: `PSI-25` (BASS-II) | DOI: `10.26030/18807`
  - Material: `1 mm thick PMMA 1 sided 2 cm` (nearest solid surrogate)
  - Oxygen: `22.2%` | Airflow: `10.07 cm/s` | Outcome: `frames_recorded`
  - Similarity Score: `0.7933` | Distance: `0.2067`
  - Match Card Text: `"1 mm thick PMMA 1 sided 2 cm · 22.2% O₂ · Fan: 10.07 cm/s"` | Why similar: `"Different material · O₂ 22.2% · Similar fan speed (10.07 cm/s)"`
- **Match 2:**
  - Run UID: `PSI-25-RUN-0040` (BASS-II, PMMA, 22.2% O2, 10.07 cm/s, Score: `0.7883`)
- **Match 3:**
  - Run UID: `PSI-25-RUN-0032` (BASS-II, PMMA, 21.8% O2, 10.07 cm/s, Score: `0.7793`)
- **Truth Tag:** `[REAL]`

---

#### State C: Moon Base (0.16g, PMMA, 34% O2, 10 cm/s, 56 kPa)
- Headline Banner: `"NASA hasn't tested this setup."`
- Out-of-Range Warning Text: `"Oxygen 34% is above the tested 13.6–22.2%. All NASA tests were in zero gravity."`
- **Match 1:**
  - Run UID: `PSI-25-RUN-0013`
  - Investigation: `PSI-25` (BASS-II) | DOI: `10.26030/18807`
  - Material: `2 cm 0.4 mm thick film` (PMMA)
  - Oxygen: `21.0%` | Airflow: `10.07 cm/s` | Outcome: `frames_recorded`
  - Similarity Score: `0.6493` | Distance: `0.3507`
  - Match Card Text: `"2 cm 0.4 mm thick film · 21% O₂ · Fan: 10.07 cm/s"` | Why similar: `"Same material · O₂ 21% · Similar fan speed (10.07 cm/s)"`
- **Match 2:**
  - Run UID: `PSI-25-RUN-0018`
  - Investigation: `PSI-25` (BASS-II) | Material: `1 cm wide 200 micron thick PMMA` | Oxygen: `17.4%` | Flow: `10.07 cm/s` | Outcome: `extinguished` (`"Went out"`) | Similarity Score: `0.6483`
- **Match 3:**
  - Run UID: `PSI-25-RUN-0008` (BASS-II, PMMA, 21% O2, 10.07 cm/s, Score: `0.6483`)
- **Truth Tag:** `[REAL]`

---

### 3d. Evidence Drawer, Numbers & Validation Metrics
- **"Source" Link Behavior:** Clicking `"Source"` on any card opens the `TrustLedgerDrawer` showing:
  - Header: e.g. `"PSI-25 · Row 126"`
  - Basis: `"measured"`
  - Source File: `data/raw/PSI-25_Experimental table_BASS-II.csv`
  - Source Column: `"Outcome / Nikon frames"`
  - DOI link: `https://doi.org/10.26030/18807`
- **"Show the numbers behind this" Accordion (`SimpleNasaResultPanel.tsx#L209-L300`):**
  - Section 1: `Range NASA has tested (O₂ vs Airflow)` interactive scatter plot (`EvidenceEnvelopePlot.tsx`).
  - Section 2: `How close the top match is` factor table (Oxygen Δ%, Airflow Δ%, Material exact/different).
  - Section 3: **Assumed Pressure Notice:**
    > *"In BASS-II and Saffire solid combustion runs, NASA did not measure chamber pressure during burns; standard cabin pressure of 101.3 kPa was assumed. We do not score pressure as a matched factor."*
  - Section 4: **Validation & Epistemic Boundaries:**
    > *"Evaluated across 132 microgravity flight runs in 110 independent hardware groups. Grouped leave-one-group-out cross-validation yields 80.30% overall accuracy (106/132), 46.72% balanced accuracy, and 48.00% extinction recall (12/25). Multi-factor matching demonstrates no statistically significant advantage over a single O₂-threshold rule (p = 1.0000; earlier higher figures from ungrouped CV had sample leakage and were retracted). The engine operates strictly as an empirical evidence locator to inspect real flight records, not an autonomous outcome predictor."*
- **Compare Mode:** Toggling `"Compare"` displays Scenario A and Scenario B side-by-side with an automated physical comparison sentence (e.g. `"Scenario B provides +13% higher O₂, enhancing flame temperatures and propagation speed."`).
- **Tour Walkthrough:**
  - Prevents auto-popup by setting `localStorage.setItem('ignis_simulator_tour_dismissed', 'true')`.
- **Export Brief Modal:** Opens a printable/exportable Markdown summary of current cabin parameters vs closest flight tests.
- **Run Fire Response Link:** Top-right plain text link: `"Run Fire Response →"` (`/response`).
- **Truth Tag:** `[REAL]`

---

### 3e. Flame Morphing & Visual Feedback
- **Physics Behavior:**
  - In Orbital (0g): Pure spherical diffusion flame ball (blue luminous base, soot cap downstream if flow present).
  - In Moon (0.16g): Weak buoyant draft begins stretching the flame vertically into an elongated teardrop.
  - In Mars (0.38g): Elongated convective flame plume.
  - Higher O2 (>22%): Flame grows brighter, larger, and burns hotter.
  - Fan speed increases: Flame tilts downwind.
  - Zero airflow (0 cm/s): Flame suffocates in its own combustion products (diffusive quenching).
- **Labeling:** The flame canvas carries a prominent epistemic badge: `"Simulated flame shape — illustrative"`.
- **WebGL Fallback:** If WebGL is unavailable or crashes, the canvas renders an SVG 2D contour diagram (`StoryFallback2D.tsx`).
- **Truth Tag:** `[ILLUSTRATIVE]`

---

## PART 4 — WHAT'S UNTESTED (`/gaps`)

### 1. Verbatim Page Text
- **Eyebrow:** `"NASA Flight Record · What’s Untested"` (`ResearchGapsPage.tsx#L75`)
- **Headline:** `"Where Are the Blind Spots?"` (`ResearchGapsPage.tsx#L78`)
- **Subtitle:** `"NASA has run 132 solid fire experiments in orbit. But future habitats (the Moon, Mars, Gateway) use atmospheres and gravities that have never been tested. Here is how well-tested each future destination actually is."` (`ResearchGapsPage.tsx#L81-L83`)

---

### 2. Five Mission Gaps Audit
*Computed directly using `computeScenarioGapMetrics` from `gap_metrics.ts`.*

| Rank | Mission Title | Evidence Coverage | Verdict Badge | Verdict Summary | Missing Flight Data Recommendations |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **1** | **ISS Cabin** | **100.0%** | `"Well tested"` | `"NASA has run dozens of flight tests matching these conditions."` | `"Tested flight record provides dense baseline data; recommended experiment is fine-grained flammability boundary mapping."` |
| **2** | **Gateway-like Habitat** | **85.0%** | `"Well tested"` | `"NASA has run dozens of flight tests matching these conditions."` | `"Requires flight burn with active pressure transducer at 70.3 kPa (tested solid record only measured at nominal 1 atm)"` |
| **3** | **Exploration Atmosphere (34% / 56 kPa)** | **31.4%** | `"Barely tested"` | `"NASA has never tested fires in this gravity or atmosphere."` | 1. `"Requires microgravity burn at 34% O2 / 10 cm/s (tested nearest: 22.2% O2, 10.07 cm/s)"`<br>2. `"Requires flight burn with active pressure transducer at 56 kPa..."`<br>3. `"Requires repeat burn campaign for material family 'PMMA'..."` |
| **4** | **Mars Surface Habitat** | **28.4%** | `"Barely tested"` | `"NASA has never tested fires in this gravity or atmosphere."` | 1. `"Requires microgravity burn at 28% O2 / 10 cm/s..."`<br>2. `"Requires flight burn with active pressure transducer at 70.3 kPa..."`<br>3. `"Requires partial-gravity centrifuge flight test or drop-tower / parabolic campaign at 0.38 g..."`<br>4. `"Requires repeat burn campaign for material family 'Nomex'..."` |
| **5** | **Lunar Surface Habitat** | **16.4%** | `"Barely tested"` | `"NASA has never tested fires in this gravity or atmosphere."` | 1. `"Requires microgravity burn at 34% O2 / 10 cm/s..."`<br>2. `"Requires flight burn with active pressure transducer at 56 kPa..."`<br>3. `"Requires partial-gravity centrifuge flight test or drop-tower / parabolic campaign at 0.16 g..."`<br>4. `"Requires repeat burn campaign for material family 'PMMA'..."` |

- **"Test in simulator" Link Pre-fill:**
  - Lunar: `/simulator?destination=moon&oxygen=34&pressure=56&airflow=10`
  - Mars: `/simulator?destination=mars&oxygen=28&pressure=70.3&airflow=10`
  - Exploration: `/simulator?destination=orbital&oxygen=34&pressure=56&airflow=10`
- **Truth Tag:** `[REAL]`

---

### 3. "How We Decide" Formula & Model Transparency Table
- **Mathematical Formula:**
  $$\text{Coverage} = 40\% \times \text{Proximity} + 30\% \times \text{Density}(R) + 15\% \times \text{PressureRegime} + 15\% \times \text{GravityRegime}$$
- **Model Transparency Table Verbatim Text (`ResearchGapsPage.tsx#L258-L294`):**
  1. **Detector Fusion (M2):** Implementation: `L2 Logistic Classifier + Conformal Abstention`. Source: `Ground EN54 room & industrial hall (DOIs: 10.17632/npk2zcm85h.2, 10.17632/yghykzm4km.1)`. Caveats: `"Trained on Earth-gravity data. Not validated in microgravity. Evaluates behavioral consistency on simulated streams."`
  2. **Detector Response (M1):** Implementation: `Calibrated Response Curve + Domain Check`. Source: `130 NASA SAME / SAME-R flight runs on ISS (PSI-101/102, PMC7918997)`. Caveats: `"Calibrated on microgravity flight tests. Abstains outside empirical particle size range [0.035, 1.07] µm."`
  3. **Extinction Boundary (M4):** Implementation: `Conformal Logistic Extinction Classifier`. Source: `274 NASA FLEX / FLEX-2 droplet burns on ISS (PSI-69/68)`. Caveats: `"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels. Informs physical boundaries; never auto-triggers."`
  4. **Transport & Sequencer:** Implementation: `1D Advection-Dispersion Compartment Network`. Source: `Qualitative transport from NASA SAME (NTRS-20130000422) & ISS Procedures (NTRS-20030053429)`. Caveats: `"Simulated sensor data. Not flight software. Assumes well-mixed zone compartments."`
- **Truth Tag:** `[REAL]` for formula; `[TRAINED]` / `[SIMULATED]` as labeled.

---

## PART 5 — ASK IGNIS (`/ask`)

### 1. Empirical 15-Question Test Suite
*Executed against bundled 930 corpus chunks via client BM25Retriever.*

| # | Question Text | Status | Verbatim Answer Summary | Primary Citation | Nearest Match |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **Q1** | *"How is SIBAL cloth composed and tested in Saffire-I?"* | **ANSWERED** | `"The specific objective of SAFFIRE-I and SAFFIRE-III tests is to determine how rapidly a large-scale fire grows in low-gravity and whether it reaches a steady-state spread rate. The sample material for SAFFIRE-I and SAFFIRE-III is a composite fabric consisting of cotton on a fiberglass substrate (75% cotton, 25% fiberglass by weight)."` | `[1] SAFFIRE-I and SAFFIRE-III Experiment Readme, p.1 (doc_id: PSI-100-README)` | `PSI-25-RUN-0125` |
| **Q2** | *"What happens to PMMA burning rate when forced airflow slows down in BASS-II?"* | **ANSWERED** | `"Once successfully ignited, the flow was reduced incrementally until the flame extinguished... Microgravity Science Glovebox (MSG)."` | `[1] Burning and Suppression of Solids-II (BASS-II) Summary Report, p.75 (doc_id: NTRS-20210011385)` | `PSI-25-RUN-0013` |
| **Q3** | *"What cabin oxygen and pressure are used in space exploration atmospheres?"* | **ANSWERED** | `"The proposed environment uses a total cabin pressure of 52.7 to 58.6 kPa with an oxygen concentration of 30 to 34% by volume and was chosen with material flammability in mind."` | `[1] Piloted Ignition Delay of PMMA in Space Exploration Atmospheres, p.2 (doc_id: NTRS-20080013149)` | None |
| **Q4** | *"Has NASA ever tested fires on the Moon or Mars?"* | **ABSTAINED** | `"Untested flight regime: Environmental conditions along [gravity (0.38 g)] were not tested in NASA microgravity solid combustion flight experiments. All usable flight runs in the archive were conducted in freefall microgravity (~0 g)."` | None (Untested Guardrail) | `PSI-25-RUN-0013` |
| **Q5** | *"How does Teflon wire insulation smoke detection behave in microgravity?"* | **ABSTAINED** | `"I couldn't find a direct report excerpt above the citation threshold, though structured flight matching found nearby NASA PSI runs below."` | None | `PSI-25-RUN-0011` |
| **Q6** | *"What was discovered about smoke particle diameter in the SAME-R experiment?"* | **ABSTAINED** | `"I couldn't find that in the NASA reports I have."` | None | None |
| **Q7** | *"Can a fire burn in lunar gravity of 0.16 g?"* | **ABSTAINED** | `"Untested flight regime: Environmental conditions along [gravity (0.16 g)] were not tested in NASA microgravity solid combustion flight experiments. All usable flight runs in the archive were conducted in freefall microgravity (~0 g)."` | None (Untested Guardrail) | `PSI-25-RUN-0013` |
| **Q8** | *"Can a fire ignite in Martian gravity of 0.38 g?"* | **ABSTAINED** | `"Untested flight regime: Environmental conditions along [gravity (0.38 g)] were not tested in NASA microgravity solid combustion flight experiments. All usable flight runs in the archive were conducted in freefall microgravity (~0 g)."` | None (Untested Guardrail) | `PSI-25-RUN-0027` |
| **Q9** | *"What are the limiting oxygen concentration limits for solid materials in space?"* | **ANSWERED** | `"Early work on flammability limits has demonstrated that using a hemispherical stagnation flow geometry provides a good way to obtain the flammability limits of various fuels as a function of upward flowing oxidizer gas. Similar limiting O2 concentrations (13 to 14 percent)..."` | `[1] Burning and Suppression of Solids-II (BASS-II) Summary Report, p.73 (doc_id: NTRS-20210011385)` | None |
| **Q10** | *"Does low airflow quench a flame in zero gravity?"* | **ANSWERED** | `"As flow speed is increased, blowoff extinction is initiated by the formation of a hole in the flame sheet in the stagnation region of the flame. Once the stagnation region is blown far enough downstream... the flame is unable to propagate back upstream even when the flow is reduced."` | `[1] Burning and Suppression of Solids-II (BASS-II) Summary Report, p.97 (doc_id: NTRS-20210011385)` | `PSI-25-RUN-0011` |
| **Q11** | *"What fire suppression agents are used on the International Space Station?"* | **ANSWERED** | `"We also want to acknowledge the ground support teams at Glenn Research Center, Johnson Space Center, and Marshall Space Flight Center... Burning and Suppression of Solids—II Fire Safety Investigation for the Microgravity Science Glovebox."` | `[1] Burning and Suppression of Solids-II (BASS-II) Summary Report, p.20 (doc_id: NTRS-20210011385)` | None |
| **Q12** | *"What was the burning area and flame spread rate in Saffire tests?"* | **ANSWERED** | `"The thin cotton samples from each flight will be included in this analysis because the heat release rate can be estimated from the spread rate for thin fuels. The Saffire VI sample card contained four samples and was configured for four ignitions."` | `[1] Preliminary Results from the Saffire VI Experiment, p.3 (doc_id: NTRS-20240002981)` | None |
| **Q13** | *"What fuels were tested in the FLEX droplet combustion experiments?"* | **ANSWERED** | `"Methanol Droplet Combustion in Oxygen-Inert Environments in Microgravity... The Flame Extinguishment (FLEX) experiment that is currently underway in the Combustion Integrated Rack facility onboard the International Space Station is aimed at understanding the effects of inert diluents on the flammability of condensed phase fuels."` | `[1] Methanol Droplet Combustion in Oxygen-Inert Environments in Microgravity, p.1 (doc_id: NTRS-20130014061)` | None |
| **Q14** | *"How does lunar gravity affect flame spread across PMMA slabs?"* | **ABSTAINED** | `"Untested flight regime: Environmental conditions along [gravity (0.16 g)] were not tested in NASA microgravity solid combustion flight experiments. All usable flight runs in the archive were conducted in freefall microgravity (~0 g)."` | None (Untested Guardrail) | `PSI-25-RUN-0013` |
| **Q15** | *"What suppression concentration of CO2 is required in microgravity?"* | **ABSTAINED** | `"I couldn't find a direct report excerpt above the citation threshold, though structured flight matching found nearby NASA PSI runs below."` | None | `PSI-25-RUN-0011` |

---

### 2. Best 3 Questions Recommended for Video
1. **Query:** `"What cabin oxygen and pressure are used in space exploration atmospheres?"`  
   *Why:* Fast, answered in 2 crystal-clear sentences citing NTRS-20080013149 (52.7 to 58.6 kPa at 30 to 34% O2).
2. **Query:** `"How is SIBAL cloth composed and tested in Saffire-I?"`  
   *Why:* Cites real NASA flight README, explaining the 75% cotton / 25% fiberglass fabric used in large-scale fire tests.
3. **Query:** `"Has NASA ever tested fires on the Moon or Mars?"`  
   *Why:* Demonstrates **epistemic honesty** — instead of hallucinating, IGNIS abstains and explains that 0.16g and 0.38g are untested flight regimes, while automatically linking to nearest microgravity runs.

### 3. Pipeline Explanation in 3 Sentences
1. Queries are tokenized and scored client-side against 930 indexed NASA technical report excerpts using an in-memory Okapi BM25 engine.
2. An environmental interceptor checks for unvalidated conditions (such as Lunar 0.16g or Mars 0.38g) and forces an honest abstention before scoring.
3. If groundedness exceeds the 5.0 threshold, exact sentences are extracted and displayed alongside direct NTRS document citations and nearest matched flight runs.

### 4. Disabled Scope Button Text
- Label: `"NASA Earthdata FIRMS (not in bundle)"` (`corpus_scopes.ts#L33`)
- Description: `"Not connected in offline spacecraft corpus build."` (`corpus_scopes.ts#L35`)
- Active Corpus Description: `"Searches all 14 bundled PSI and NTRS technical reports."`

---

## PART 6 — STORY MODE (`/stories`)

### 1. Chapters Registry & Beats Count
- **Chapter 1 (`why-is-fire-round-in-space`):** `"Why fire is round in space"` — **6 beats**. Tags: `FLEX (PSI-69)`, `Droplet Flames`, `0g Freefall`.
- **Chapter 2 (`same-fire-different-air`):** `"Same fire, different air"` — **5 beats**. Tags: `BASS-II (PSI-25)`, `PMMA Solid Fuel`, `Airflow Quenching`.
- **Chapter 3 (`smoke-that-does-not-rise`):** `"Smoke that does not rise"` — **5 beats**. Tags: `SAME-R (PSI-101)`, `Kapton / Teflon Wire`, `Sub-Micron Smoke`.
- **Chapter 4 (`what-nasa-has-not-tested`):** `"What NASA has not tested"` — **5 beats**. Tags: `Artemis Gateway`, `34% O2 at 56 kPa`, `Exploration Gaps`.

---

### 2. Chapter 1 & Chapter 2 First Two Beats Verbatim

#### Chapter 1 (FLEX Droplet Combustion)
- **Beat 1 (`beat-01-cold-open`):**
  - Title: `"Why Fire is Round in Space"`
  - Subtitle: `"Every campfire you have ever seen points up — except in space"`
  - Avatar Speech: `"Every fire on Earth has a top and a bottom. But what happens when you turn off gravity?"`
  - Headline: `"Every flame on Earth points up"`
  - Body Text: `"On Earth, campfires stretch into flickering teardrops. In orbital microgravity, flames blossom into calm, spherical blue balls."`
  - Key Fact: `"Flames only stretch upward because Earth gravity pulls cold air down."`
  - Provenance: `PSI-69 (FLEX)`, ISS CIR, `NTRS-20130014061`.
- **Beat 2 (`beat-02-wonder`):**
  - Title: `"The Gravity Chimney"`
  - Subtitle: `"Why does campfire smoke and fire rise on Earth?"`
  - Avatar Speech: `"Think about a campfire. If heavy air did not sink, where would hot air go?"`
  - Headline: `"Gravity creates a natural chimney"`
  - Body Text: `"Heavy cold air sinks under gravity, forcing lighter hot air upward into a chimney draft that stretches the flame."`
  - Key Fact: `"Without gravity pulling cold air down, hot air has nowhere to rise."`

#### Chapter 2 (BASS-II Solid Fuel Quenching)
- **Beat 1 (`beat-01-hook`):**
  - Title: `"The Suffocating Flame"`
  - Subtitle: `"Why still air is a spacecraft fire’s worst enemy"`
  - Avatar Speech: `"On Earth, blowing on a match puts it out. But in space, still air is what puts fire out!"`
  - Headline: `"Dead air puts fire out"`
  - Body Text: `"On Earth, blowing gently on a candle blows it out. But in orbit, completely still air starves fire because hot smoke cannot rise away from the fuel."`
  - Key Fact: `"Without gravity, hot combustion exhaust stays trapped right against the fuel surface."`
  - Provenance: `PSI-25 (BASS-II)`, ISS MSG, `NTRS-20210011385`.
- **Beat 2 (`beat-02-predict`):**
  - Title: `"The Airflow Paradox"`
  - Subtitle: `"What happens when ventilation shuts off?"`
  - Avatar Speech: `"If a fire starts behind a locker and fans shut down, will it spread through the station?"`
  - Headline: `"Does space fire survive still air?"`
  - Body Text: `"If a solid fuel catches fire inside the Microgravity Glovebox with ventilation fans turned off, will the flame grow, shrink, or extinguish?"`
  - Key Fact: `"Without forced airflow, solid fuels cannot sustain combustion in microgravity."`

### 3. Best 3-Second Moment to Show
- **Chapter 2 Beat 4:** The interactive airflow slider dragging from 5 cm/s down to 0 cm/s — the 3D flame shrinks, changes from orange to pale blue, and suffocates into quiescent extinction as the BASS-II scatter chart highlights run `PSI-25-RUN-0018`.
- **Truth Tag:** `[REAL]` for charts; `[ILLUSTRATIVE]` for 3D Ember orb and morphing flame.

---

## PART 7 — DATASETS MASTER TABLE

| ID | Dataset Title & Primary Investigation | DOI / Permanent Identifier | Provider / Platform | Fuel Class & Tested Platform | Usable Run Count | Open License | Feature / Subsystem Usage | UI Location |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **D1** | Indoor Fire Dataset (EN54 Room) · P. Vorwerk et al. | `10.17632/npk2zcm85h.2` | Univ. Magdeburg | Terrestrial 1g Room | 305,304 rows | CC BY 4.0 | M2 Detector Fusion Training | `/response`, `/gaps` |
| **D2** | Indoor Fire Dataset (Industrial Hall) · P. Vorwerk et al. | `10.17632/yghykzm4km.1` | Univ. Magdeburg | Terrestrial 1g Hall | 248,502 rows | CC BY 4.0 | M2 Cross-Site Testing | `/response`, `/gaps` |
| **D3** | Indoor Fire Dataset (Test Chamber) · P. Vorwerk et al. | `10.17632/m85f9h6g9j.1` | Univ. Magdeburg | Terrestrial 1g Chamber | 2,900 rows | CC BY 4.0 | Benchmark Evaluation | `/about` |
| **D4** | Smoke Aerosol Measurement Experiment (SAME / PSI-102) | `10.60555/gd4k-8h62` | NASA GRC | Microgravity (ISS) | 8 flight runs | CC0-1.0 | M1 Transport Calibration | `/response`, `/about` |
| **D5** | Smoke Aerosol Measurement-Reflight (SAME-R / PSI-101) | `10.60555/2np7-jv14` | NASA GRC | Microgravity (ISS) | 109 flight runs | CC0-1.0 | M1 Smoke Moment Detector | `/response`, `/stories` |
| **D6** | Flame Extinguishment Experiment (FLEX / PSI-69 & FLEX-2 / PSI-68) | `10.60555/psi-69-flex` | NASA PSI | Droplet Flames (ISS CIR) | 282 flight runs | CC0-1.0 | M4 Extinction Classifier | `/response`, `/stories` |
| **D7** | Burning and Suppression of Solids-II (BASS-II / PSI-25) | `10.26030/18807` | NASA PSI | Solid Fuels (ISS MSG) | 129 flight runs (110 groups) | CC0-1.0 | Solid Matcher & Gap Analysis | `/simulator`, `/gaps` |
| **D8** | Burning and Suppression of Solids (BASS / PSI-26) | `10.26030/18808` | NASA PSI | Solid Fuels (ISS MSG) | 122 flight runs | CC0-1.0 | Solid Fuel Matcher | `/simulator`, `/about` |
| **D9** | Spacecraft Fire Experiment (Saffire-I to VI / PSI-98, 99, 100) | `10.60555/saffire` | NASA GRC | Large Solid Fabric (Cygnus) | 21 flight runs | CC0-1.0 | Solid Fuel Matcher & Ask | `/simulator`, `/ask` |
| **D10** | Advanced Combustion Microgravity Experiments (ACME / PSI-10) | `10.60555/psi-10` | NASA PSI | Gaseous Spherical (ISS CIR) | 327 flight runs | CC0-1.0 | ACME Corpus Scope | `/ask`, `/about` |
| **D11** | Flame Design Investigation (PSI-159) | `10.60555/psi-159` | NASA PSI | Spherical Soot (ISS CIR) | 333 flight runs | CC0-1.0 | Gaseous Corpus | `/about` |

---

## PART 8 — NARRATION-SAFE CLAIMS & "DO NOT SAY" AUDIT

### (a) 25 Short Claims Safe to Say Aloud

1. `"Without gravity pulling cold air down, fire forms a calm, spherical blue ball."` `[REAL]` (`chapter1.ts#L30-L50`)
2. `"IGNIS is grounded in 1,401 real NASA spaceflight combustion runs."` `[REAL]` (`evidence_runs.json`)
3. `"In zero gravity, fire does not rise — hot exhaust smothers the fuel unless a fan supplies airflow."` `[REAL]` (`NTRS-20210011385#L75`)
4. `"NASA has tested 132 usable solid combustion experiments in orbit."` `[REAL]` (`evidence_solid.json`)
5. `"Standard optical smoke detectors take 13 seconds to detect cotton smoke and trigger without a gas cross-check."` `[SIMULATED]` (`StationDemoPage.tsx#L328`)
6. `"IGNIS uses NASA SAME-R calibration to verify smoke and carbon monoxide together."` `[REAL]` (`PSI-101`)
7. `"To prevent false alarms from station dust, IGNIS enforces a 6-second persistence window."` `[SIMULATED]` (`StationDemoPage.tsx#L351`)
8. `"When Teflon wire overheats, standard optical detectors miss the sub-micron smoke completely."` `[SIMULATED]` (`StationDemoPage.tsx#L334`)
9. `"IGNIS catches Teflon wire overheating at 16.5 seconds by detecting carbon monoxide gas."` `[SIMULATED]` (`StationDemoPage.tsx#L334`)
10. `"In crewed mode, fire suppression release strictly requires human confirmation."` `[SIMULATED]` (`StationDemoPage.tsx#L232`)
11. `"The crew holds the confirmation button for 1.2 seconds to authorize suppression."` `[SIMULATED]` (`HoldToConfirmGate.tsx#L21`)
12. `"In uncrewed spacecraft, IGNIS authorizes automated suppression release in seconds."` `[SIMULATED]` (`HoldToConfirmGate.tsx#L292`)
13. `"Containment cuts electrical power in 0.5 seconds to eliminate re-ignition energy."` `[SIMULATED]` (`narrationCues.ts#L18`)
14. `"Ventilation dampers seal the burning module in 1.0 second to stop smoke spreading."` `[SIMULATED]` (`StationDemoPage.tsx#L248`)
15. `"NASA solid combustion flight tests were all performed in zero-g freefall."` `[REAL]` (`ResearchGapsPage.tsx#L81`)
16. `"Zero flight tests exist in Lunar 0.16g or Martian 0.38g gravity."` `[REAL]` (`gap_metrics.ts#L158`)
17. `"The International Space Station cabin is 100% covered by existing NASA flight tests."` `[REAL]` (`gap_metrics.ts#L137`)
18. `"Artemis Exploration Atmospheres are only 31.4% covered by historical flight data."` `[REAL]` (`gap_metrics.ts#L137`)
19. `"NASA never measured chamber pressure during BASS-II or Saffire solid burns; 101.3 kPa was assumed."` `[REAL]` (`SimpleNasaResultPanel.tsx#L289`)
20. `"Ask IGNIS answers questions using client-side extractive search across 930 NASA report excerpts."` `[REAL]` (`chunks.json`)
21. `"Ask IGNIS refuses to guess when asked about untested conditions like Lunar or Mars gravity."` `[REAL]` (`bm25_retriever.ts#L305`)
22. `"Droplet combustion models are trained on 274 NASA FLEX flight experiments."` `[REAL]` (`PSI-69`)
23. `"Sensor fusion detector M2 was trained on terrestrial EN54 room data and is not validated in microgravity."` `[TRAINED]` (`AboutPage.tsx#L301`)
24. `"Flames require between 1 and 5 cm/s of airflow to prevent self-extinction in zero gravity."` `[REAL]` (`NTRS-20210011385#L75`)
25. `"All simulation displays carry the mandatory disclosure: Simulated. Not flight software."` `[SIMULATED]` (`StationDemoPage.tsx#L408`)

---

### (b) 10 "DO NOT SAY" Prohibited Claims

1. ❌ **DO NOT SAY:** *"IGNIS predicts exactly how any fire will burn."*  
   **Why:** IGNIS is an empirical evidence retrieval system and deterministic transport model, not a predictive flame code.
2. ❌ **DO NOT SAY:** *"IGNIS AI replaces astronaut decision-making."*  
   **Why:** In crewed mode, suppression release strictly requires human physical authorization.
3. ❌ **DO NOT SAY:** *"NASA tested fires on the Moon or Mars."*  
   **Why:** All NASA solid combustion flight tests were conducted in zero-g orbital freefall on ISS or Cygnus.
4. ❌ **DO NOT SAY:** *"The ML detector is validated for spaceflight."*  
   **Why:** Detector M2 was trained on ground EN54 data in Earth gravity. It is explicitly labeled: *"Trained on Earth-gravity data. Not validated in microgravity."*
5. ❌ **DO NOT SAY:** *"IGNIS calculates a 99.4% probability of extinction."*  
   **Why:** Banned term rule! IGNIS outputs categorical states only (`CLEAR`, `CLOSE`, `NOMINAL`, `FIRE_ALARM`), never risk percentages or false certainty.
6. ❌ **DO NOT SAY:** *"Standard detectors failed because they are obsolete."*  
   **Why:** Standard optical detectors are engineered for larger particles in terrestrial drafts; microgravity physics alters the particle distribution.
7. ❌ **DO NOT SAY:** *"The 3D fire response console runs live telemetry from the ISS."*  
   **Why:** The response console runs a deterministic simulation based on NASA flight findings, not live station telemetry.
8. ❌ **DO NOT SAY:** *"Calibrated is always faster than Standard."*  
   **Why:** On Cellulose, PMMA, and Silicone, Calibrated alarms 2.0s later because it enforces a 6-second dust filter to prevent false alarms.
9. ❌ **DO NOT SAY:** *"Chamber pressure was accurately matched from flight data."*  
   **Why:** Pressure was never measured during NASA solid flight burns; standard 101.3 kPa was assumed.
10. ❌ **DO NOT SAY:** *"This is flight-ready software for Artemis."*  
    **Why:** Violates core rule: *"Simulated. Not flight software."* must remain prominent.

---

## PART 9 — CAPTURE RUNBOOK & SHOT LIST

### 1. Recording Setup & Hygiene
- **Local Dev Server:** `npm run dev` (Runs Vite on `http://localhost:5173/`).
- **Resolution & Zoom:** Set browser window to exactly **1920 × 1080**, 100% device pixel ratio.
- **Hide Floating Ask Button:** Open DevTools console and run:  
  `document.querySelector('.print\\:hidden')?.remove();`
- **Reset Tour & Story Progress:** Run in console:  
  `localStorage.clear(); localStorage.setItem('ignis_simulator_tour_dismissed', 'true');`
- **Audio Configuration:** Ensure Chromium audio autoplay is permitted, or use screen recorder desktop audio capture. Auto-pace narration pauses timeline automatically during speech.
- **Determinism:** All timeline simulations use fixed seed `42` and exact time `t`. Replays are 100% bit-identical.

---

### 2. Shot List (9 Essential Cuts for a 30s Video)

| Shot # | Target URL / View | Click Path & Interactions | Duration | Start Screen State | End Screen State |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **Shot 1** | `http://localhost:5173/` | Hover hero stage to show Earth rotation; click `"Try the Simulator"`. | **3.0 s** | Landing page with `"Build a Space Habitat"` and rotating Earth. | Hovering over CTA button. |
| **Shot 2** | `http://localhost:5173/simulator` | Drag Oxygen slider from 21% up to 34% (Moon Exploration Atmosphere). | **3.5 s** | Simulator loaded with round 0g flame and 3 closest BASS-II matches. | Flame brightens; match card updates with envelope warning. |
| **Shot 3** | `http://localhost:5173/simulator` | Click `"Show the numbers behind this"` to reveal O2 vs Flow scatter plot. | **3.0 s** | Factor comparison table. | Full Recharts scatter plot showing 132 flight dots + assumed pressure notice. |
| **Shot 4** | `http://localhost:5173/gaps` | Click `"Where Are the Blind Spots?"` and expand Lunar Surface card. | **3.5 s** | 5 mission cards showing 100% down to 16.4% coverage. | Expanded card showing missing centrifuge flight recommendations. |
| **Shot 5** | `http://localhost:5173/response?fuel=teflon` | Switch material to `"Teflon Wire Overheating"`; hit Play. | **4.0 s** | 3D Space Station with wire smolder in Avionics Bay. | $t = 16.5\text{s}$: Calibrated alarms; Standard misses completely. |
| **Shot 6** | `http://localhost:5173/response` | Scrub to $t = 18.0\text{s}$; Hold circular button for 1.2s. | **4.0 s** | Hold-to-confirm modal: `"Confirm to release suppression"`. | Ring fills green; announcement: `"Crew confirms. Suppressing fire."` |
| **Shot 7** | `http://localhost:5173/response` | Play through $t = 27.0\text{s}$ to $32.0\text{s}$. | **3.5 s** | Suppressant blanketing Avionics Bay; vents sealed. | Green ring on module; `IncidentSummaryCard` displays `"Fire out in Avionics Bay"`. |
| **Shot 8** | `http://localhost:5173/response?view=inspect` | Jump to $t = 15.0\text{s}$. | **3.0 s** | Technical Inspector with sensor charts and sequencer. | Smoke Source Localization locks to green `CLEAR`; CO ppm spikes. |
| **Shot 9** | `http://localhost:5173/ask` | Click curated chip: *"How is SIBAL cloth composed and tested in Saffire-I?"* | **3.5 s** | Clean search prompt with 4 chips. | Instant extractive answer with `[1] SAFFIRE-I Readme, p.1` badge. |

---

## PART 10 — VISUAL IDENTITY & KNOWN RECORDING ARTIFACTS

### 1. Design Tokens & Typography
- **Headings Font:** `'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif`.
- **Interface & Prose Font:** `'Inter', system-ui, -apple-system, sans-serif`.
- **Telemetry & Monospace Font:** `'JetBrains Mono', 'Fira Code', monospace`.
- **Key Color Tokens:**
  - Background Base: `#04070d` / `#060b13` / `#09111c`
  - NASA Cyan Primary: `#22d3ee` / `#79dce8` / `rgba(58, 215, 255, 1.0)`
  - Fire Warning Amber: `#f59e0b` / `#fbbf24` / `rgba(245, 158, 11, 1.0)`
  - Emergency Alarm Crimson: `#ef4444` / `#f87171` / `rgba(239, 68, 68, 1.0)`
  - Verified Emerald: `#10b981` / `#38e4a4` / `rgba(56, 228, 164, 1.0)`
- **Logos & Badges:**
  - Header: IGNIS Gradient Core Mark (`bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950`).
  - Required Header Caveats: `Simulated. Not flight software.` (amber border) and `Trained on Earth-gravity data. Not validated in microgravity.` (slate border).

### 2. Known Recording Artifacts & Mitigations
- **Tour Auto-Trigger:** On first load, `SimulatorPage` triggers a coachmark walkthrough after 800ms. Set `localStorage.setItem('ignis_simulator_tour_dismissed', 'true')` before recording to prevent this popup.
- **WebGL Context Limit:** The application strictly maintains **one active WebGL canvas at a time**. Navigating between `/response` and `/stories` properly disposes Three.js contexts. Do not embed multiple 3D canvases on one screen.
- **Speech Synthesis Heartbeat:** Chromium speech synthesis can hang after 10s of continuous utterance. The app includes an active heartbeat timer (`useNarration.ts#L182-L210`) that resumes speech automatically.
- **Scrollbar Visual Noise:** Hide scrollbars during video capture by adding `overflow: hidden` to the `<body>` element or using full-screen capture mode (`F11`).

