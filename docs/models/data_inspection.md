# ML Data Inspection and Schema Report

Generated on: `2026-11-04T14:03:47.179062+00:00`

This document audits all datasets acquired and cataloged for IGNIS Fire Response models (M1, M2, M4, M5).
All numbers, columns, and properties recorded below are extracted directly from dataset files or primary peer-reviewed literature.

## 1. Dataset Inventory & Provenance Summary

| Id | Dataset Name | License | Format | Rows | Status / Presence | Purpose |
|---|---|---|---|---|---|---|
| **D1** | Indoor Fire Dataset (EN54 Test Room) | CC BY 4.0 | CSV | 305,304 | Acquired & Verified on Disk | M2 Multi-sensor fusion |
| **D2** | Indoor Fire Dataset (Industrial Hall) | CC BY 4.0 | CSV | 248,502 | Acquired & Verified on Disk | M2 Cross-site evaluation |
| **D3** | Indoor Fire Dataset (Small Test Chamber) | CC BY 4.0 | CSV | 2,900 | Acquired & Verified on Disk | M2 Chamber evaluation |
| **D4** | SAME (PSI-102) Smoke & Aerosol | CC0-1.0 | CSV/JSON | 8 runs | Acquired & Verified on Disk | M1 Smoke particle size |
| **D5** | SAME-R (PSI-101) Smoke Aerosol Reflight | CC0-1.0 | XLSX/CSV | 109 runs (3,922 rows) | Acquired & Verified on Disk | M1 Detector response vs particle size |
| **D6** | FLEX / FLEX-2 Droplet Extinction Runs | CC0-1.0 | JSON | 282 runs (1,401 tier) | Acquired & In-repo | M4 Droplet extinction threshold |

## 2. NASA SAME & SAME-R Flight Data Inspection (D4 & D5)

NASA PSI investigations **PSI-102 (SAME)** and **PSI-101 (SAME-R)** measured smoke particulate size distributions,
aerodynamic diameters, mass loss, and real spacecraft detector voltage responses during long-duration flight on the ISS.

### D4: SAME Experimental Table (`PSI-102_Experimental table_SAME.csv`)
- **Rows:** 8 | **Columns:** 5
- **Columns:** `['Sample #', 'Sample Material  ', 'Air Flow (cm/s)', 'Weight loss rate (mg/min)', 'Aging Duration (minutes)']`
- **Materials:** Teflon, Kapton, Silicone Rubber, Lampwick, Dibutyl Phthalate (DBP)

### D5: SAME-R Experimental Table (`PSI-101_Experimental table_SAME-R.csv`)
- **Rows:** 109 | **Columns:** 10
- **Columns:** `['Sample Type', 'SAME Test #', 'Description', 'Date', 'Inlet velocity (cm/s)', 'Rt/R0', 'Duration (sec)', 'Primary aging time (sec)', 'Primary mixing time (sec)', 'Net aging time (sec)']`
- **Sample Types / Materials:** `['Kapton', 'Lampwick', 'Pyrell', 'Silicone', 'Teflon']`
- **Flow Velocity Range:** `0.0 - 8.1 cm/s`
- **Overheating Ratio (Rt/R0):** `1.22 - 1.48`

### D5: SAME / SAME-R Combined Analyzed Telemetry (`PSI-101_Analyzed Data_SAME, SAME-R_Results.xlsx`)
- **Total Sheets:** 43
- **Key Sheets:** `Reduced Data with ISS Det` (157 rows, 31 cols), `Reduced Data with STS Det` (171 rows, 31 cols), `Combined Rslts Copy this sheet` (167 rows, 95 cols)

#### Columns in `Reduced Data with ISS Det` (Flight Calibration Telemetry):

| Column Name | Physical Meaning | Engineering Units | Role in IGNIS M1 Model |
|---|---|---|---|
| `Sample Type` | Overheated material | Categorical | Material identifier (Teflon, Kapton, Silicone, Lampwick, Pyrell, DBP) |
| `Inlet Velocity (cm/sec)` | Forced ventilation speed | cm/s | Habitat ventilation velocity (advection speed) |
| `Rt/R0` | Overheating resistance ratio | Dimensionless | Thermal heating severity indicator |
| `Net Aging Duration` | Residence/aging time in microgravity | seconds | Particle coagulation / agglomeration time (smoke aging) |
| `ISS Detector Scatter (volts)` | ISS Photoelectric Scatter Detector | Volts (0 - 10 V) | **Primary Ground Truth: Photoelectric smoke detector signal** |
| `STS Detector (volts)` | Shuttle Ionization Chamber Detector | Volts | **Primary Ground Truth: Ionization chamber smoke detector signal** |
| `M0 best Diameter` | Zeroth moment particle count | particles / cm³ | Particle concentration baseline |
| `M1 (mm/cm^3)` | First moment of size distribution | mm / cm³ | Total particle volume / length proxy |
| `DustTrak A / B (mg/m3)` | Calibrated optical aerosol mass | mg/m³ | Optical mass concentration proxy |
| `M1/M0 (micro-m)--AMD` | Aerodynamic Mean Diameter | µm (micrometers) | Mean physical smoke particle size |
| `Diameter of Average mass` | Mass mean diameter | µm (micrometers) | Mass-weighted particle diameter |
| `Hatch Choate Dg` | Geometric mean diameter | µm (micrometers) | Lognormal particle distribution center |
| `Hatch Choate Sigma g` | Geometric standard deviation | Dimensionless | Lognormal particle distribution width |
| `Sample Temperature C` | Heating wire temperature | °C | Pyrolysis temperature |
| `Mass Loss mg` | Pyrolyzed fuel mass | mg | Emission mass yield |

> [!IMPORTANT]
> **Derivability of Detector Response vs Particle Size per Material:**
> **YES, IT IS DIRECTLY DERIVABLE.**
> The SAME/SAME-R dataset couples simultaneous measurements of:
> 1. Real spaceflight smoke detector outputs (`ISS Detector Scatter (volts)` and `STS Detector (volts)`),
> 2. Exact particle size distribution parameters (`AMD M1/M0`, `Hatch Choate Dg`, `Sigma g`), and
> 3. Spacecraft materials (`Teflon`, `Kapton`, `Silicone`, `Pyrell foam`, `Lampwick/Cellulose`).
> This allows M1 to fit an empirical calibration curve of photoelectric response vs mean diameter:
> Small Kapton/Teflon particles (AMD < 0.1 µm) yield very low photoelectric scatter per unit mass,
> whereas aged silicone and cellulose smoke (AMD > 0.5 µm) produce strong scatter voltage.

## 3. NASA FLEX Droplet Extinction Data Inspection (D6)

- **Total Evidence Tier Runs:** 1401
- **FLEX / FLEX-2 Droplet Runs Count:** 282
- **Columns / Keys:** `['run_uid', 'investigation_id', 'platform', 'fuel_class', 'material', 'gravity_regime', 'doi', 'ntrs_ids', 'frames_shot', 'outcome_class', 'outcome_source_column', 'usable_for_matching', 'unusable_reasons', 'oxygen_pct', 'pressure_kpa', 'flow_cm_s', 'ignited', 'extinguished', 'spread_rate_mm_s', 'burn_time_s', 'co_ppm', 'co2_pct', 'metadata']`
- **Droplet Outcome Breakdown:** `extinguished`: 186, `frames_recorded` (sustained burning): 92, `unknown`: 4
- **Environmental Features Available:** `oxygen_pct`, `pressure_kpa`, `flow_cm_s`, `burn_time_s`

## 4. Multi-Sensor Benchmark Inspection (D1: EN54 & D2: Industrial Hall)

Source: Mendeley Data (DOI 10.17632/npk2zcm85h.2 & 10.17632/yghykzm4km.1); Pascal Vorwerk et al., MDPI Fire 2023, 6, 323.

### D1: EN54 Test Room (`Indoor Fire Dataset with Distributed Multi-Sensor Nodes.csv`)
- **Total Rows:** 305,304 | **Columns:** 19
- **Column List:** `['Date', 'Sensor_ID', 'CO2_Room', 'CO_Room', 'H2_Room', 'Humidity_Room', 'PM05_Room', 'PM100_Room', 'PM10_Room', 'PM25_Room', 'PM40_Room', 'PM_Room_Typical_Size', 'PM_Total_Room', 'Temperature_Room', 'UV_Room', 'VOC_Room_RAW', 'scenario_label', 'anomaly_label', 'ternary_label']`
- **Sampling Interval:** 10.0 seconds per node (native continuous multivariate time series)
- **Sensor Nodes (9 positions):** `Sensorknoten0008` through `Sensorknoten0016` distributed across EN54 test room (9.8 m × 7.9 m × 3.0 m).
- **Source Position Recoverability:** **YES.** The fire and nuisance sources were placed at the standardized central test location $(x_0, y_0) = (4.90\text{ m}, 3.95\text{ m})$. The exact Manhattan/Euclidean distance from each `Sensor_ID` to the source is published.
- **Ternary Label Counts:**
  - `Background`: 253,327 (82.98%)
  - `Fire`: 38,148 (12.50%) — Cable (10,658), Lunts (9,605), Wood (9,213), Candles (8,672)
  - `Nuisance`: 13,829 (4.52%) — Ethanol (9,076), Deodorant (3,170), Hairspray (1,583)
- **Fine-grained Scenario Classes:** 4 fire scenarios (Beech wood, Candles, Cotton lunts, Cable overload) + 3 nuisance scenarios (Ethanol, Deodorant, Hairspray) + Background.

### D2: Industrial Hall Cross-Site Benchmark (`Indoor Fire Dataset with Distributed Multi-Sensor Nodes_Industrial Hall.csv`)
- **Total Rows:** 248,502 | **Columns:** 23
- **Column List:** `['Date', 'Sensor_ID', 'CO2_Room', 'scenario_label', 'progress_label', 'experiment_number', 'H2_Room', 'PM05_Room', 'PM100_Room', 'PM10_Room', 'PM25_Room', 'PM40_Room', 'PM_Room_Typical_Size', 'PM_Total_Room', 'VOC_Room_RAW', 'Valid_Experiment', 'fire', 'nuisance', 'Temperature_Room', 'Humidity_Room', 'CO_Room', 'anomaly_label', 'anomaly_scenario']`
- **Environment:** 10 m × 22 m × 8 m unventilated industrial hall, 9 distributed sensor nodes (`sensornode0006` through `sensornode0015`).
- **Scenario Label Breakdown:**
  - `Background`: 207,937
  - `Fire`: Wood (13,309), Candles (6,652), Lunts (5,481), Cable (2,079)
  - `Nuisance`: Green_Waste (2,807), Ethanol (2,661), Deodorant (2,104), Exhaust (2,042), CO (1,363), Smoke (1,261), Welding (540), Abrasive_Cutting (266)
- **Purpose:** Evaluates M2 model robustness against spatial domain shift (large industrial hall vs EN54 room).

## 5. Channel Mapping: Benchmark Features to Spacecraft Fire Response Console

The table below details how ground test sensor channels map to the IGNIS Fire Response Console,
and justifies why certain terrestrial channels are unsuitable for microgravity spacecraft habitats:

| Console Channel | D1/D2 Benchmark Column | SAME/SAME-R Flight Channel | Physical Units | Spacecraft Microgravity Context |
|---|---|---|---|---|
| **Smoke Obscuration** (`smoke_obs`) | `PM25_Room` / `PM10_Room` | `ISS Detector Scatter (volts)` | %/m (console) / µg/m³ (D1) / Volts (SAME) | **PRIMARY.** Detects particulate scattering. In microgravity, smoke remains suspended without buoyant chimney updraft. |
| **Carbon Monoxide** (`co_ppm`) | `CO_Room` | N/A (electrolytic sensor) | ppm | **PRIMARY.** Smoldering pyrolysis emits CO rapidly before open flames emerge; unaffected by microgravity convective shutdown. |
| **Temperature** (`temp_c`) | `Temperature_Room` | `Sample Temperature C` | °C | **PRIMARY.** Thermal sensors inside racks detect resistive overheating. |
| **Hydrogen** (`h2_ppm` - secondary) | `H2_Room` | N/A | ppm | **SECONDARY.** Early battery off-gassing indicator in electrical bays. |
| **Carbon Dioxide** (`co2_ppm` - secondary) | `CO2_Room` | N/A | ppm | **SECONDARY.** Useful but background fluctuates with crew presence (~3,000–5,000 ppm on ISS). |
| *UV Radiation* | `UV_Room` | N/A | mW/cm² | **UNUSABLE.** Optical line-of-sight blocked by opaque avionics racks, wire bundles, and payload enclosures. |
| *Volatile Organic Compounds* | `VOC_Room_RAW` | N/A | ppb / index | **UNUSABLE.** Spacecraft cabins have high steady-state off-gassing from plastics, alcohol wipes, and human skin; broad MOS VOC sensors drift and trigger false alarms. |
| *Humidity* | `Humidity_Room` | N/A | % RH | **UNUSABLE.** Regulated tightly by ECLSS condensing heat exchangers; condensation dynamics in microgravity differ from terrestrial convective plumes. |

