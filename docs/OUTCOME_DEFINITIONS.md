# Combustion Outcome Definitions and Epistemic Provenance

**Document Version**: 2.1  
**Target Scope**: NASA Physical Sciences Informatics (PSI) Microgravity Solid-Fuel Combustion Flight Runs  
**Investigations Covered**: BASS-II (PSI-25), BASS-I (PSI-26), Saffire-I (PSI-98), Saffire-II (PSI-99), Saffire-III (PSI-100)  
**Strict Epistemic Policy**: Never equate a camera operation diagnostic with a combustion physics state unless official flight documentation explicitly defines it. Where evidence is conflicting or ambiguous, classify strictly as `unknown` and disqualify from matching.

---

## 1. BASS-II (PSI-25) Outcome Validity & Column Analysis

### Verbatim Document Citations
Official NASA flight documentation defines the columns and operational procedures as follows:

1. **BASS-II ReadMe** (`data/raw/PSI-25_Science Documents_BASS-II_ReadMe.docx`, Paragraph 19):
   > *"Total frames: digital Nikon still image frames shot, includes test and post-burn sample images."*

2. **BASS-II ReadMe** (`data/raw/PSI-25_Science Documents_BASS-II_ReadMe.docx`, Paragraph 22):
   > *"Calibrated initial and final O2: The O2 sensor was out of calibration, so the MCA ISS reading was used to correct the initial ISS 'air' reading of the sensor for the day via a constant offset."*

3. **BASS-II Science Requirements Document (SRD)** (`data/raw/PSI-25_Science Documents_BASS-II_SRD.pdf`, Page 2):
   > *"The crew manually ignites the sample and triggers the still camera. The crew performs flow calibration and soot cleaning as needed."*

4. **BASS-II Success Criteria** (`BASS-II_SRD.pdf`, Page 3):
   > *"Minimal Success: 10 samples from each PI (of their total 20) will be successfully tested per PI matrices at the desired test conditions (O2, flow). Ignition is successful for these tests, and flame video data is obtained. Still camera data is obtained for at least 7 tests per PI."*  
   > *"Complete Success: All PI samples (100) are tested at the desired test conditions. Video data is obtained for all tests. Ignition occurs in most of the tests (90+). Extinction is observed for tests that seek to find a flammability limit. Most of the tests (90+) provide still camera data."*

### Verbatim Column Inventory of BASS-II Table
The flight experimental table `data/raw/PSI-25_Experimental table_BASS-II.csv` line 1 contains the verbatim header:
```text
PI,Test #,Date,GMT,Sample #,Fuel Sample Material,Flow restrictor,Fan display,Air display,Radiometer gain   (1000   250   50   10),Total Frames Shot,Calibrated  initial O2 % by vol ,Calibrated final O2 % by vol,Initial CO2 % by vol,Final CO2 % by vol,Initial CO (ppm),Final CO (ppm)
```

The table consists of exactly **17 columns** (0-indexed indices 0 through 16):

| Index | Exact CSV Header String | Description & Epistemic Role | Explicit Outcome Column? |
| :--- | :--- | :--- | :--- |
| 0 | `PI` | Principal Investigator initial/name | No |
| 1 | `Test #` | Flight test identifier (e.g. B1, O5b, P13a) | No |
| 2 | `Date` | Calendar date of test execution | No |
| 3 | `GMT` | Greenwich Mean Time day of year | No |
| 4 | `Sample #` | Physical sample hardware tag | No |
| 5 | `Fuel Sample Material` | Material formulation and dimension string | No |
| 6 | `Flow restrictor` | Duct restriction plate (0=none, 1=medium, 2=high) | No |
| 7 | `Fan display` | Potentiometer dial setting or fan voltage ($\times 10$) | **PI notes embedded in text** |
| 8 | `Air display` | Flow speed reading (cm/s) on video overlay | **PI notes embedded in text** |
| 9 | `Radiometer gain   (1000   250   50   10)` | Narrowband radiometer gain setting (10, 50, 250, 1000) | No |
| 10 | `Total Frames Shot` | Count of Nikon D300s still images triggered | **Camera proxy only** |
| 11 | `Calibrated  initial O2 % by vol ` | MCA-offset corrected initial glovebox $O_2$ concentration | No |
| 12 | `Calibrated final O2 % by vol` | Post-test glovebox $O_2$ concentration | No |
| 13 | `Initial CO2 % by vol` | CDM sensor initial carbon dioxide | No |
| 14 | `Final CO2 % by vol` | CDM sensor post-test carbon dioxide | No |
| 15 | `Initial CO (ppm)` | CSA-CP sensor initial carbon monoxide | No |
| 16 | `Final CO (ppm)` | CSA-CP sensor post-test carbon monoxide | No |

**Conclusion on Table Structure**: The BASS-II data table possesses **no explicit combustion outcome column** (e.g. burn time, burn length, or flammability status). Qualitative outcome observations were recorded solely as unstructured text annotations inside operational columns (`Air display` and `Fan display`).

---

## 2. Nikon Frames Shot Distribution & Sensor Reality

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

### Sensor Anomaly Audit: Implausible $\Delta O_2$ Runs
In the Microgravity Science Glovebox (~255 L sealed volume), burning small test samples (100–200 $\mu$m PMMA films or small rods of several centimeters) consumes mere milligrams to decigrams of solid fuel, which corresponds to a theoretical chamber oxygen depletion of $< 0.5\%$.

An audit of all 129 BASS-II runs reveals 5 runs with $|Final\ O_2 - Initial\ O_2| > 5.0\%$:

| Row in CSV | Test # | Raw `Calibrated  initial O2 % by vol ` | Raw `Calibrated final O2 % by vol` | Calculated $\Delta O_2$ | `Total Frames Shot` | Notes / Operational Context | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 3 | **Test B2** | 22.2 | 1.6 | **-20.60%** | none | Flow speed 5 | **Implausible Sensor Artifact** |
| 97 | **Test P22a** | 20.8 | 0.6 | **-20.20%** | 83 | Flow speed 5 down to ext | **Implausible Sensor Artifact** |
| 98 | **Test P22b** | 20.0 | 39.1 | **+19.10%** | 155 | Flow speed 5 down to ext | **Implausible Sensor Artifact** |
| 128 | **Test T28a** | 20.7 | 0.9 | **-19.80%** | 19 | Flow speed 5 | **Implausible Sensor Artifact** |
| 129 | **Test T28b** | 20.7 | 40.4 | **+19.70%** | 27 | Flow speed 5 | **Implausible Sensor Artifact** |

**Physical & Epistemic Verdict**:
1. Burning a thin PMMA specimen could not physically consume 20.6% of the glovebox oxygen (reducing it from 22.2% to 1.6%), nor could any combustion process create oxygen to increase from 20.0% to 39.1% or 40.4%.
2. Paragraph 22 of the BASS-II ReadMe explains: *"The O2 sensor was out of calibration, so the MCA ISS reading was used to correct the initial ISS 'air' reading of the sensor for the day via a constant offset."*
3. The final O2 readings in these 5 runs represent sensor failure, telemetry loss, or raw voltage saturation without offset correction.
4. **Strict Policy**: These 5 $\Delta O_2$ values are flagged as **implausible sensor artifacts** and are strictly excluded from any evidence text claiming flame consumption.
5. In addition, Test B2 (`Total Frames Shot: "none"`) is classified as `outcome_class: "unknown"` and disqualified from matching.

---

## 3. Redefined Outcome Protocol

Because the official flight documents define `Total Frames Shot` as still photos shot by crew actuation rather than a physical combustion outcome, IGNIS enforces the following rigorous protocol:

1. **Explicit PI Annotations Take Precedence**:
   - Where `Air display` or `Fan display` explicitly records `"no ign"`, classify as `outcome_class: "no_ignition"` (display: **"PI-noted no ignition"**) with `outcome_source_column: "Air display / Fan display (PI note: no ignition)"` (Test O12).
   - Where `Air display` or `Fan display` records extinction or blowoff limits (`"ext"`, `"blowoff"`, `"would not stay lit"`, `"out at fan"`), classify as `outcome_class: "extinguished"` (display: **"PI-noted extinction"**) with `outcome_source_column: "Air display / Fan display (PI note: extinction/blowoff)"` (24 runs: P1, P5, P8, P9, P10, P13a, P13b, P22a, P22b, P25, M17, O4, O8a, O14, O19, O22, etc.).
2. **Camera Frames Proxy (`camera_frames_proxy`)**:
   - For tests with $\ge 20$ frames shot and no extinction/blowoff notes, classify as `outcome_class: "frames_recorded"` (display: **"Photographed burn: frames recorded"**) with `outcome_source_column: "camera_frames_proxy (Total Frames Shot)"` (96 runs).
   - **Mandatory Tooltip**: *"Frame count includes post-burn images (BASS-II ReadMe)"*.
   - **Terminology Rule**: The term "flame spread" is never used for this camera diagnostic class.
3. **Ambiguous Cases Classified as `unknown`**:
   - Any run where frames is `"none"` (Test B2), `"10 postburn only"` (Test O16), `"video"` without extinction note (Tests O20, O21), or low frames (< 20 without explicit note: O5b, O13b, P21b, T28a) is classified as `outcome_class: "unknown"` and disqualified from matching.

---

## 4. Per-Investigation Outcome Summary Table

| Investigation | Total Runs | Real Outcome Columns in Data Table | Outcome Derivation Rule | Photographed Burn (`frames_recorded`) | PI-Noted Extinction (`extinguished`) | PI-Noted No Ignition (`no_ignition`) | Unknown (Disqualified) | Usable Runs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BASS-II (PSI-25)** | 129 | None (notes in `Air display`, `Fan display`) | PI notes for ext/no-ign; `camera_frames_proxy` ($\ge 20$ frames) for frames_recorded; ambiguous $\rightarrow$ unknown | 96 | 24 | 1 | 8 | **121** |
| **BASS-I (PSI-26)** | 122 | None | No outcome or environmental columns in table $\rightarrow$ unknown | 0 | 0 | 0 | 122 | **0** |
| **Saffire-I (PSI-98)**| 4 | `Flow Direction` + telemetry burn time | Published telemetry: S1 (420 s) & S2 (70 s) burned; S3 & S4 missing burn telemetry | 2 | 0 | 0 | 2 | **2** |
| **Saffire-II (PSI-99)**| 15 | `Burn length (cm)`, `Burn time (s)` | Explicit table columns: 2-1 to 2-4 length ~0, time Insignificant $\rightarrow$ ext; 2-5 to 2-9 length 5–29 cm $\rightarrow$ frames_recorded; cold flow & notes $\rightarrow$ unknown | 5 | 4 | 0 | 6 | **9** |
| **Saffire-III (PSI-100)**| 2 | None | CSV table lacks $O_2$ and burn time columns $\rightarrow$ unknown | 0 | 0 | 0 | 2 | **0** |
| **TOTALS** | **272** | — | — | **103** | **28** | **1** | **140** | **132** |

---

## 5. Usability Census Across 272 Solid Flight Runs

A solid run is classified as `usable_for_matching: true` **only if**:
1. It has an unambiguous combustion outcome (`outcome_class != "unknown"`);
2. It has measured/converted oxygen concentration;
3. It has measured/converted flow velocity.

### Breakdown of Usable Runs (132 Runs)
- **BASS-II (PSI-25)**: **121 runs** (96 frames_recorded, 24 extinguished, 1 no_ignition)
- **Saffire-I (PSI-98)**: **2 runs** (2 frames_recorded: S1 Concurrent, S2 Opposed)
- **Saffire-II (PSI-99)**: **9 runs** (5 frames_recorded: 2-5 to 2-9; 4 extinguished: 2-1 to 2-4 Silicone non-propagation)

### Breakdown of Disqualified Unusable Runs (140 Runs)
- **122 runs (BASS-I / PSI-26)**: Raw CSV contains only sample IDs and ignition watts; lacks explicit outcome, $O_2$, and flow measurements.
- **8 runs (BASS-II / PSI-25)**: Ambiguous camera proxy / sensor anomaly (`ambiguous_or_missing_outcome`):
  - Test B2: frames='none' and final O2 sensor recorded 1.6% (uncalibrated drift).
  - Test O16: frames='10 postburn only'.
  - Tests O20, O21: frames='video' without still photo count.
  - Tests O5b (2 frames), O13b (6 frames), P21b (14 frames), T28a (19 frames): sub-threshold frame counts without PI confirmation.
- **6 runs (Saffire-II / PSI-99)**: Lines 11–12 are pre-test cold flow visualization (`F1C1`, `F2C1`); lines 13–16 are table footnotes (`Note 1` to `Note 4`).
- **2 runs (Saffire-I / PSI-98)**: Samples 3 and 4 were unignited / missing burn telemetry rows.
- **2 runs (Saffire-III / PSI-100)**: CSV table lacks $O_2$ and burn duration columns.
