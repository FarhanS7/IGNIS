# Combustion Outcome Definitions and Epistemic Provenance

**Document Version**: 2.0  
**Target Scope**: NASA Physical Sciences Informatics (PSI) Microgravity Solid-Fuel Combustion Flight Runs  
**Investigations Covered**: BASS-II (PSI-25), BASS-I (PSI-26), Saffire-I (PSI-98), Saffire-II (PSI-99), Saffire-III (PSI-100)  
**Strict Epistemic Policy**: Never equate a camera operation diagnostic with a combustion physics state unless official flight documentation explicitly defines it. Where evidence is conflicting or ambiguous, classify strictly as `unknown` and disqualify from matching.

---

## 1. BASS-II (PSI-25) Outcome Validity & Column Analysis

### Verbatim Document Citations
Official NASA flight documentation defines the columns and operational procedures as follows:

1. **BASS-II ReadMe** (`data/raw/PSI-25_Science Documents_BASS-II_ReadMe.docx`, Paragraph 19):
   > *"Total frames: digital Nikon still image frames shot, includes test and post-burn sample images."*

2. **BASS-II Science Requirements Document (SRD)** (`data/raw/PSI-25_Science Documents_BASS-II_SRD.pdf`, Page 2):
   > *"The crew manually ignites the sample and triggers the still camera. The crew performs flow calibration and soot cleaning as needed."*

3. **BASS-II Success Criteria** (`BASS-II_SRD.pdf`, Page 3):
   > *"Minimal Success: 10 samples from each PI (of their total 20) will be successfully tested per PI matrices at the desired test conditions (O2, flow). Ignition is successful for these tests, and flame video data is obtained. Still camera data is obtained for at least 7 tests per PI."*  
   > *"Complete Success: All PI samples (100) are tested at the desired test conditions. Video data is obtained for all tests. Ignition occurs in most of the tests (90+). Extinction is observed for tests that seek to find a flammability limit. Most of the tests (90+) provide still camera data."*

### Complete Column Inventory of BASS-II Table
The flight experimental table `PSI-25_Experimental table_BASS-II.csv` contains exactly **16 columns**:

| Column Index | Column Header in CSV | Physical / Diagnostic Description | Explicit Outcome Column? |
| :--- | :--- | :--- | :--- |
| 0 | `PI` | Principal Investigator initial/name | No |
| 1 | `Test #` | Flight test identifier (e.g. B1, O5b, P13a) | No |
| 2 | `Date` | Ground calendar date of test | No |
| 3 | `GMT` | Greenwich Mean Time day of year | No |
| 4 | `Sample #` | Physical hardware sample tag | No |
| 5 | `Fuel Sample Material` | Material formulation and dimension string | No |
| 6 | `Flow restrictor` | Duct restriction plate (0=none, 1=medium, 2=high) | No |
| 7 | `Fan display` | Potentiometer dial setting or fan voltage ($\times 10$) | **Notes embedded by PI** |
| 8 | `Air display` | Flow speed reading (cm/s) on video overlay | **Notes embedded by PI** |
| 9 | `Radiometer gain` | Narrowband radiometer gain setting (10, 50, 250, 1000) | No |
| 10 | `Total Frames Shot` | Count of Nikon D300s still images triggered | **Camera proxy only** |
| 11 | `Calibrated initial O2 % by vol` | Corrected initial glovebox $O_2$ concentration | No |
| 12 | `Calibrated final O2 % by vol` | Corrected post-test glovebox $O_2$ concentration | No |
| 13 | `Initial CO2 % by vol` | CDM sensor initial carbon dioxide | No |
| 14 | `Final CO2 % by vol` | CDM sensor post-test carbon dioxide | No |
| 15 | `Initial CO (ppm)` | CSA-CP sensor initial carbon monoxide | No |
| 16 | `Final CO (ppm)` | CSA-CP sensor post-test carbon monoxide | No |

**Conclusion on Table Structure**: The BASS-II data table possesses **no explicit combustion outcome column** (e.g. burn time, burn length, or flammability status). Qualitative outcome observations were recorded solely as unstructured text annotations inside the operational flow columns (`Air display` and `Fan display`).

---

## 2. Nikon Frames Shot Distribution & Physical Co-occurrence

### Value Distribution across 129 BASS-II Runs
- **Integer values $\ge 20$ frames**: 120 runs (ranging from 27 to 316 frames; modal values: 100, 304, 303, 311).
- **String `"video"`**: 3 runs (Lines 72, 73, 74: Tests O20, O21, O22).
- **String `"none"`**: 1 run (Line 3: Test B2).
- **String `"10 postburn only"`**: 1 run (Line 68: Test O16).
- **Composite string `"300+   +102"`**: 1 run (Line 32: Test M5).
- **Low integer frames (< 20)**:
  - Line 54 (Test O5b): `2` frames
  - Line 64 (Test O13b): `6` frames
  - Line 96 (Test P21b): `14` frames
  - Line 128 (Test T28a): `19` frames

### Co-occurrence Analysis with Sensor Data
Analysis of environmental sensor changes ($\Delta O_2$, $\Delta CO_2$, $\Delta CO$) refutes any naive assumption that "0 or none frames = extinguished / non-ignition":

1. **Test B2 (Line 3, Sample 155, 200 $\mu$m PMMA film)**:
   - `Total Frames Shot`: `"none"`
   - `Calibrated Initial O2`: 22.2% $\rightarrow$ `Calibrated Final O2`: **1.6%** ($\Delta O_2 = -20.6\%$)
   - *Physical reality*: The sample burned vigorously, consuming virtually all oxygen in the Microgravity Science Glovebox. The still camera was simply not triggered; the run was recorded via video. Treating `"none"` as unignited or extinguished is a severe false negative.
2. **Test O12 (Line 62, Sample 217m, PMMA rod)**:
   - `Total Frames Shot`: **52 frames**
   - `Air display` PI note: `"no ign at any flow"`
   - *Physical reality*: The Nikon camera shot 52 frames (documenting the glowing hot wire ignition attempts), but the PI explicitly recorded that ignition failed. Treating frames > 0 as sustained flame would be a false positive.
3. **Tests O20, O21, O22 (Lines 72–74, PMMA rods)**:
   - `Total Frames Shot`: `"video"`
   - $O_2$ dropped by 0.5–0.6% and CO increased by 60–140 ppm in each test. The burns succeeded on video without still photo actuation.
4. **Test O16 (Line 68, Sample 219m, PMMA rod)**:
   - `Total Frames Shot`: `"10 postburn only"`
   - Still camera recorded only post-test char/quench remnants.

---

## 3. Redefined Outcome Protocol

Because the official flight documents define `Total Frames Shot` as still photos shot by crew actuation rather than a physical combustion outcome, IGNIS enforces the following rigorous protocol:

1. **Explicit PI Annotations Take Precedence**:
   - Where `Air display` or `Fan display` explicitly records `"no ign"`, classify as `outcome_class: "no_ignition"` with `outcome_source_column: "Air display / Fan display (PI note: no ignition)"` (Test O12).
   - Where `Air display` or `Fan display` records extinction or blowoff limits (`"ext"`, `"blowoff"`, `"would not stay lit"`, `"out at fan"`), classify as `outcome_class: "extinguished"` with `outcome_source_column: "Air display / Fan display (PI note: extinction/blowoff)"` (24 runs: P1, P5, P8, P9, P10, P13a, P13b, P22a, P22b, P25, M17, O4, O8a, O14, O19, O22, etc.).
2. **Camera Frames Proxy (`camera_frames_proxy`)**:
   - For tests with $\ge 20$ frames shot, steady $O_2$ consumption, and no extinction/blowoff notes, classify as `outcome_class: "sustained"` with `outcome_source_column: "camera_frames_proxy (Total Frames Shot)"` (96 runs).
3. **Ambiguous Cases Classified as `unknown`**:
   - Any run where frames is `"none"` (Test B2), `"10 postburn only"` (Test O16), `"video"` without extinction note (Tests O20, O21), or low frames (< 20 without explicit note: O5b, O13b, P21b, T28a) is classified as `outcome_class: "unknown"` and disqualified from matching.

---

## 4. Per-Investigation Outcome Summary Table

| Investigation | Total Runs | Real Outcome Columns in Data Table | Outcome Derivation Rule | Sustained | Extinguished | No Ignition | Unknown (Unusable) | Usable Runs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BASS-II (PSI-25)** | 129 | None (notes in `Air display`, `Fan display`) | PI notes for ext/no-ign; `camera_frames_proxy` ($\ge 20$ frames) for sustained; ambiguous $\rightarrow$ unknown | 96 | 24 | 1 | 8 | **121** |
| **BASS-I (PSI-26)** | 122 | None | No outcome or environmental columns in table $\rightarrow$ unknown | 0 | 0 | 0 | 122 | **0** |
| **Saffire-I (PSI-98)**| 4 | `Flow Direction` + telemetry burn time | Published telemetry: S1 (420 s) & S2 (70 s) sustained; S3 & S4 missing burn telemetry | 2 | 0 | 0 | 2 | **2** |
| **Saffire-II (PSI-99)**| 15 | `Burn length (cm)`, `Burn time (s)` | Explicit table columns: 2-1 to 2-4 length ~0, time Insignificant $\rightarrow$ ext; 2-5 to 2-9 length 5–29 cm $\rightarrow$ sustained; cold flow & notes $\rightarrow$ unknown | 5 | 4 | 0 | 6 | **9** |
| **Saffire-III (PSI-100)**| 2 | None | CSV table lacks $O_2$ and burn time columns $\rightarrow$ unknown | 0 | 0 | 0 | 2 | **0** |
| **TOTALS** | **272** | — | — | **103** | **28** | **1** | **140** | **132** |

---

## 5. Usability Census Across 272 Solid Flight Runs

A solid run is classified as `usable_for_matching: true` **only if**:
1. It has an unambiguous combustion outcome (`outcome_class != "unknown"`);
2. It has measured/converted oxygen concentration;
3. It has measured/converted flow velocity.

### Breakdown of Usable Runs (132 Runs)
- **BASS-II (PSI-25)**: **121 runs** (96 sustained, 24 extinguished, 1 no_ignition)
- **Saffire-I (PSI-98)**: **2 runs** (2 sustained: S1 Concurrent, S2 Opposed)
- **Saffire-II (PSI-99)**: **9 runs** (5 sustained: 2-5 to 2-9; 4 extinguished: 2-1 to 2-4 Silicone non-propagation)

### Breakdown of Disqualified Unusable Runs (140 Runs)
- **122 runs (BASS-I / PSI-26)**: Raw CSV contains only sample IDs and ignition watts; lacks explicit outcome, $O_2$, and flow measurements.
- **8 runs (BASS-II / PSI-25)**: Ambiguous camera proxy / conflicting sensor evidence (`ambiguous_or_missing_outcome`):
  - Test B2: frames='none' but 20.6% $O_2$ consumed.
  - Test O16: frames='10 postburn only'.
  - Tests O20, O21: frames='video' without still photo count.
  - Tests O5b (2 frames), O13b (6 frames), P21b (14 frames), T28a (19 frames): sub-threshold frame counts without PI confirmation.
- **6 runs (Saffire-II / PSI-99)**: Lines 11–12 are pre-test cold flow visualization (`F1C1`, `F2C1`); lines 13–16 are table footnotes (`Note 1` to `Note 4`).
- **2 runs (Saffire-I / PSI-98)**: Samples 3 and 4 were unignited / missing burn telemetry rows.
- **2 runs (Saffire-III / PSI-100)**: CSV table lacks $O_2$ and burn duration columns.
