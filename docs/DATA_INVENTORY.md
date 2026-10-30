# NASA Microgravity Combustion Data Inventory & Scientific Mapping Verdict

> **Repository:** IGNIS | **Branch:** `v2-real-data`  
> **Source:** NASA Physical Sciences Informatics (PSI) Open Science Repository (`psi.nasa.gov`)  
> **License:** CC0-1.0 (Public Domain, NASA Open Science)  
> **Verification:** 100% genuine NASA experimental tables and investigation archives with strict TLS verification.

---

## 1. Schema Mapping Verdict

Comparison of IGNIS application target schema against raw flight data parameters:

| Schema Field | Target Concept | Status in Real Data | Real Field Name(s) in Data | Derivation Method / Physical Caveats |
| :--- | :--- | :---: | :--- | :--- |
| `oxygen_pct` | Ambient O2 percentage (vol %) | **REAL** | `Calibrated initial O2 % by vol` (BASS-II), `Percent O2` (Saffire), `O initial ambient composition; mole fraction` (FLEX) | Directly reported in vol% (e.g. 13.6% - 22.2% in BASS-II) or mole fraction ($X_{O2} \times 100$ in FLEX: 12% - 40%). |
| `pressure_kpa` | Total cabin / chamber pressure | **REAL / DERIVABLE** | `Ambient pressure; mmHg` (FLEX), `Pressure` (CFI atm), `Chamber Pressure (bar)` (ACME) | **DERIVABLE** via standard pressure conversion: $1\text{ mmHg} = 0.133322\text{ kPa}$; $1\text{ atm} = 101.325\text{ kPa}$; $1\text{ bar} = 100\text{ kPa}$. In BASS-II and Saffire, runs occur at nominal ISS/Cygnus pressure (~101.3 kPa). |
| `airflow_cm_s` | Forced ventilation velocity | **REAL / DERIVABLE** | `Air Flow (cm/s)` (Saffire: 20 cm/s), `Flow Velocity (cm/s)` (FLEX-2: 0.1-5 cm/s), `Air display` & `Fan calibration data.xlsx` (BASS-II) | Directly reported in cm/s for Saffire and FLEX-2. In BASS-II, reported as fan voltage/pot dial setting, calibrated to linear flow via `Fan calibration data.xlsx`. In FLEX droplet burns, flow is quiescent (0.0 cm/s). |
| `material` | Fuel / material classification | **REAL** | `Fuel Sample Material` (BASS-II/BASS), `Material` (Saffire), `Fuel` (FLEX/CFI), `Fuel Mole Fraction` (ACME) | Fully real: Cotton fabric (SIBAL), PMMA flat films (100μm, 200μm), PMMA rods/spheres, Nomex, Heptane droplets, Methanol droplets, Methane/Ethylene gas burners. |
| `ignition_observed` | Test achieved sustained ignition | **REAL** | `Ignition Power (W)` & `Ignition Time (s)` (Saffire), `Burn time; s` (FLEX), `Test #` (BASS-II) | Directly verifiable: tests with non-zero burn times or recorded thermocouple spikes achieved ignition. Saffire explicitly logs ignition electrical wattage and pulse duration. |
| `extinction_observed` | Flame quenched / extinguished | **REAL** | `Visible flame extinction diameter; mm` & `Test end` (FLEX), `?-g Burn Length` (Saffire-II), `Final O2 %` (BASS-II) | FLEX directly logs `Test end = Extinction` and extinction droplet diameter. Saffire-II logs whether burn halted prior to full sample consumption. BASS-II logs quench limits at low O2. |
| `flame_spread_observed` | Propagation along solid surface | **REAL** | `?-g Spread Length` (mm/s) (Saffire-II), `Burn Time` (Saffire-I), `Total Frames Shot` (BASS-II) | Directly reported in Saffire-II as steady mm/s spread rate (e.g. 2.1 mm/s, 2.6 mm/s). In quiescent droplets, flame spread is Not Applicable (spherical diffusion). |

### Six Similarity Factors Supported per Investigation

| Investigation | Material (30%) | O2 % (20%) | Airflow (20%) | Pressure (15%) | Objective (10%) | Geometry (5%) | Total Support Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **PSI-25 (BASS-II)** | **YES** | **YES** | **YES** | DERIVABLE (ISS 101.3) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-26 (BASS)** | **YES** | UNKNOWN (Ambient ISS) | DERIVABLE (Fan setting) | DERIVABLE (ISS 101.3) | **YES** | **YES** | **Partial (Material, Flow, Geometry)** |
| **PSI-98 (SAFFIRE-I)** | **YES** | **YES** | **YES** | DERIVABLE (Cygnus) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-99 (SAFFIRE-II)** | **YES** | **YES** | **YES** | DERIVABLE (Cygnus) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-100 (SAFFIRE-III)** | **YES** | **YES** | **YES** | DERIVABLE (Cygnus) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-69 (FLEX)** | **YES** | **YES** | **YES** (0.0 cm/s) | **YES** (mmHg) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-68 (FLEX-2)** | **YES** | **YES** | **YES** | **YES** (atm) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-39 (CFI)** | **YES** | **YES** | **YES** (0.0 cm/s) | **YES** (atm) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-10 (ACME Flame Design)** | **YES** | **YES** | **YES** (Co-flow) | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-20 (ACME BRE)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-21 (ACME CLD Flame)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-22 (ACME E-FIELD)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-23 (ACME s-Flame)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |
| **PSI-159 (ACME CFI-G)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |

---

## 2. Experimental Tables Inventory & Statistical Profiles

### PSI-25 — BASS-II (`PSI-25_Experimental table_BASS-II.csv`)
- **DOI:** [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67)
- **Row count:** 129 real runs | **Columns:** 17 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `PI` | text / nominal | 0.0% | - | - | `Bhattacharjee`, `Ferkul`, `Fernandez-Pello` |
| `Test #` | text / nominal | 0.0% | - | - | `B1`, `B10`, `B11` |
| `Date` | text / nominal | 0.0% | - | - | `2/14/2014`, `2/18/2014`, `2/19/2014` |
| `GMT` | text / nominal | 0.0% | 45 | 216 | 100, 164, 167, 174 |
| `Sample #` | text / nominal | 0.0% | - | - | `128`, `129`, `130` |
| `Fuel Sample Material` | text / nominal | 0.0% | - | - | `0.5" black rod`, `1 cm   0.2 mm PMMA film`, `1 cm SIBAL` |
| `Flow restrictor` | text / nominal | 0.0% | 0 | 2 | 0, 1, 2 |
| `Fan display` | text / nominal | 10.1% | - | - | `.54 pot   0.45 pot`, `0.6   0.35`, `0.9   1.3   2.75` |
| `Air display` | text / nominal | 3.1% | - | - | `0`, `10`, `10   14` |
| `Radiometer gain   (1000   250   50   10)` | 1000   250   50   10 | 0.0% | - | - | `10`, `10   250`, `1000` |
| `Total Frames Shot` | text / nominal | 0.0% | - | - | `10 postburn only`, `100`, `109` |
| `Calibrated  initial O2 % by vol` | text / nominal | 0.0% | 13.6 | 22.2 | 13.6, 14.2, 14.5, 14.6 |
| `Calibrated final O2 % by vol` | text / nominal | 0.0% | - | - | `0.6`, `0.9`, `1.6` |
| `Initial CO2 % by vol` | text / nominal | 0.0% | - | - | `0`, `0.19`, `0.2` |
| `Final CO2 % by vol` | text / nominal | 0.8% | - | - | `0.2`, `0.21`, `0.25` |
| `Initial CO (ppm)` | ppm | 0.0% | - | - | `-1`, `-2`, `-3` |
| `Final CO (ppm)` | ppm | 0.8% | - | - | `0.3`, `10`, `102` |

**Physical Parameter Mapping for this Table:**
- **Material / Fuel:** Column `Fuel Sample Material` (`100 micron PMMA film 2 cm wide`, `cotton fabric strip`, etc.)
- **Oxygen:** Column `Calibrated initial O2 % by vol` (13.6% to 22.2%) & `Calibrated final O2 % by vol` (0.6% to 22.2%)
- **Combustion Gases:** Columns `Initial CO2 % by vol`, `Final CO2 % by vol`, `Initial CO (ppm)`, `Final CO (ppm)` (CO reaches up to 107 ppm post-burn)
- **Flow:** Column `Flow restrictor` (0, 1, 2) & `Air display` (duct ventilation setting), calibrated via `Fan calibration data.xlsx`
- **Quirks:** Multiple potentiometer readings in single cells (e.g., `0.6 0.35` indicating mid-run flow step-down adjustments).

---

### PSI-26 — BASS (`PSI-26_Experimental table_BASS.csv`)
- **DOI:** [10.60555/58h4-dy80](https://doi.org/10.60555/58h4-dy80)
- **Row count:** 122 real runs | **Columns:** 6 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Date` | text / nominal | 0.0% | - | - | `3/30/2012`, `4/12/2013`, `4/16/2013` |
| `GMT` | text / nominal | 0.0% | 90 | 234 | 100, 102, 106, 113 |
| `As Run Test #` | text / nominal | 0.8% | 1 | 116 | 1, 10, 100, 101 |
| `Test #` | text / nominal | 0.8% | - | - | `1`, `10`, `100` |
| `Sample #` | text / nominal | 0.8% | 2 | 44 | 10, 11, 12, 15 |
| `Fuel Sample Material` | text / nominal | 0.0% | - | - | `1 cm sphere`, `1 cm sphere   wake`, `1 cm wake sphere` |

**Physical Parameter Mapping for this Table:**

---

### PSI-69 — FLEX (`PSI-69_Experimental table_FLEX.csv`)
- **DOI:** [10.60555/mbq8-0451](https://doi.org/10.60555/mbq8-0451)
- **Row count:** 274 real runs | **Columns:** 15 | **Encoding:** `latin1`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `FLEX Test #` | text / nominal | 0.0% | 1 | 274 | 1, 10, 100, 101 |
| `FLEX Identifier` | text / nominal | 0.0% | - | - | `053F001`, `053R001`, `061F002` |
| `Test Date` | text / nominal | 0.0% | - | - | `1/11/2010`, `1/12/2010`, `1/12/2011` |
| `Test GMT` | text / nominal | 0.4% | - | - | `0:02:52`, `0:06:41`, `0:07:51` |
| `Fuel` | text / nominal | 0.0% | - | - | `Heptane`, `Methanol` |
| `Ambient pressure; mmHg` | mmHg | 0.0% | 0 | 2319.9 | 0, 1545.7, 1553.8, 2055.6 |
| `O initial ambient composition; mole fraction` | mole fraction | 0.0% | 0.12 | 0.34 | 0.12, 0.13, 0.14, 0.15 |
| `N initial ambient composition; mole fraction` | mole fraction | 0.0% | 0.09 | 0.88 | 0.09, 0.35, 0.38, 0.42 |
| `CO initial ambient composition; mole fraction` | mole fraction | 0.0% | 0 | 0.7 | 0, 0.05, 0.1, 0.15 |
| `He initial ambient composition; mole fraction` | mole fraction | 0.0% | 0 | 0.45 | 0, 0.05, 0.1, 0.15 |
| `Droplet initial diameter; mm` | mm | 2.2% | - | - | `1.1`, `1.13`, `1.33` |
| `Visible flame extinction diameter; mm` | mm | 17.9% | - | - | `0`, `0.12`, `0.13` |
| `Burning rate; mm` | mm | 5.8% | 0.05 | 1.06 | 0.05, 0.2, 0.24, 0.25 |
| `Burn time; s` | s | 2.2% | - | - | `0.3`, `0.55`, `0.6` |
| `Test end` | text / nominal | 0.0% | - | - | `Completion`, `Disruption`, `Extinction` |

**Physical Parameter Mapping for this Table:**
- **Material / Fuel:** Column `Fuel` (`Heptane`, `Methanol`)
- **Pressure:** Column `Ambient pressure; mmHg` (0 to 2066.6 mmHg $\to$ 0 to 275.5 kPa)
- **Oxygen:** Column `O initial ambient composition; mole fraction` (0.12 to 0.40 $\to$ 12% to 40% O2)
- **Extinction Outcome:** Column `Test end` (Exact values: `Completion`, `Disruption`, `Extinction`) & `Visible flame extinction diameter; mm` (0.12 to 1.5 mm)
- **Burn Dynamics:** Column `Burning rate; mm/s` (0.05 to 0.8 mm/s) & `Burn time; s` (0.3s to 26.5s)
- **Quirks:** Latin-1 encoding with special characters in notes; pressure 0 indicates vacuum pre-fill tests.

---

### PSI-68 — FLEX-2 (`PSI-68_Experimental table_Flex2.csv`)
- **DOI:** [10.60555/byp8-h018](https://doi.org/10.60555/byp8-h018)
- **Row count:** 8 real runs | **Columns:** 7 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Sample (Fuel Type)` | Fuel Type | 0.0% | - | - | `Decane (pure)`, `Ethanol (pure)`, `Heptane (50%) IsoOctane (50%) (mixture)` |
| `Initial Droplet Diameter (mm)` | mm | 0.0% | - | - | `1.5 - 5` |
| `Ambient Gas Mixture` | text / nominal | 0.0% | - | - | `O2/N2 or O2/He` |
| `Oxygen Mole Fraction` | text / nominal | 0.0% | - | - | `0.17; 0.21;0.25; 0.3` |
| `Ambient Pressure (atm)` | atm | 0.0% | - | - | `0.5; 1.0; 1.5; 2.0; or 3.0` |
| `Ambient Temperature (C)` | C | 0.0% | 25 | 25 | 25 |
| `Flow Velocity (cm/s)` | cm/s | 0.0% | - | - | `0.1 - 5` |

**Physical Parameter Mapping for this Table:**

---

### PSI-98 — SAFFIRE-I (`PSI-98_Experimental table_SAFFIRE-1.csv`)
- **DOI:** [10.60555/0t15-1z43](https://doi.org/10.60555/0t15-1z43)
- **Row count:** 4 real runs | **Columns:** 13 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Sample Number` | text / nominal | 0.0% | - | - | `F1C1/F1C2`, `F2C1/F2C2`, `S1` |
| `Material` | text / nominal | 0.0% | - | - | `Pre-test flow visulation data for sample 1`, `Pre-test flow visulation data for sample 2`, `SIBAL Fabric` |
| `Sample Thickness (cm)` | cm | 50.0% | 0.37 | 0.37 | 0.37 |
| `Sample Length (cm)` | cm | 50.0% | 40.6 | 40.6 | 40.6 |
| `Sample Width (cm)` | cm | 50.0% | 94 | 94 | 94 |
| `Air Flow (cm/s)` | cm/s | 50.0% | 20 | 20 | 20 |
| `Percent O2` | text / nominal | 50.0% | - | - | `21.5 - 21.7`, `~ 21.5` |
| `Ignition Power (W)` | W | 50.0% | 182 | 182 | 182 |
| `Ignition Time (s)` | s | 50.0% | 8 | 8 | 8 |
| `Burn Time (s)` | s | 50.0% | 70 | 420 | 420, 70 |
| `Flow Direction` | text / nominal | 50.0% | - | - | `Concurrent`, `Opposed` |
| `Camera 1` | text / nominal | 50.0% | - | - | `S1C1`, `S2C1` |
| `Camera 2` | text / nominal | 50.0% | - | - | `S1C2`, `S2C2` |

**Physical Parameter Mapping for this Table:**
- **Material:** Column `Material` (`SIBAL Fabric` cotton-fiberglass blend, 40.6 cm length x 94 cm width x 0.37 cm thickness)
- **Oxygen & Airflow:** Column `Percent O2` (`~ 21.5%`, `21.5 - 21.7%`) & `Air Flow (cm/s)` (`20 cm/s`)
- **Ignition & Spread:** Column `Ignition Power (W)` (`182 W`), `Ignition Time (s)` (`8 s`), `Burn Time (s)` (`420 s` concurrent, `70 s` opposed)
- **Flow Direction:** `Concurrent` vs `Opposed`

---

### PSI-99 — SAFFIRE-II (`PSI-99_Experimental table_SAFFIRE-2.csv`)
- **DOI:** [10.60555/2chp-m469](https://doi.org/10.60555/2chp-m469)
- **Row count:** 15 real runs | **Columns:** 17 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Sample Number` | text / nominal | 0.0% | - | - | `2-1`, `2-2`, `2-3` |
| `Material` | text / nominal | 40.0% | - | - | `Cotton-Fiberglass (SIBAL)`, `PMMA`, `PMMA & Nomex` |
| `Samle Thickness` | text / nominal | 40.0% | - | - | `0.27 mm`, `0.61 mm`, `0.85 and 0.37 mm` |
| `Sample Length` | text / nominal | 40.0% | - | - | `29 cm`, `5 and 24 cm` |
| `Sample Width (cm)` | cm | 40.0% | - | - | `5 cm` |
| `Air Flow (cm/s)` | cm/s | 40.0% | - | - | `20 cm/s` |
| `Percent O2 (Note 1)` | Note 1 | 40.0% | - | - | `22.0 to 21.9`, `22.1 to 22.0`, `~ 21.5` |
| `Ignition Power (W)` | W | 40.0% | - | - | `80 W`, `97 W` |
| `Ignition Time (s)` | s | 40.0% | - | - | `30 s`, `9.2 s` |
| `Burn Time (s)` | s | 40.0% | - | - | `115 s`, `140 s`, `145 s` |
| `Flow Direction` | text / nominal | 40.0% | - | - | `Concurrent`, `Opposed` |
| `?-g Burn Length` | text / nominal | 40.0% | - | - | `29 cm`, `5 cm & 0 (note 2)`, `~ 0` |
| `?-g Spread Length` | text / nominal | 40.0% | - | - | `2.1 mm/s`, `2.6 mm/s`, `Note 4` |
| `1-g Burn Length` | text / nominal | 40.0% | - | - | `7.6 cm`, `Complete`, `~ 0` |
| `1-g Spread Rate` | text / nominal | 40.0% | - | - | `0.6 mm/s`, `1.2 mm/s`, `Acceleratory` |
| `Camera 1` | text / nominal | 46.7% | - | - | `S1C1`, `S4C1`, `S5C1` |
| `Camera 2` | text / nominal | 40.0% | - | - | `S1C2`, `S2C2`, `S3C2` |

**Physical Parameter Mapping for this Table:**
- **Material:** Column `Material` (`Cotton-Fiberglass (SIBAL)`, `PMMA`, `PMMA & Nomex`)
- **Spread Rate & Outcomes:** Column `?-g Spread Length` (Exact values: `2.1 mm/s`, `2.6 mm/s`, `n/a (Nomex)`)
- **Burn Length:** Column `?-g Burn Length` (`29 cm`, `5 cm & 0`, `~ 0`, `~ 10 cm`)
- **Quirk:** Nomex self-extinguished without propagation (`?-g Spread Length: n/a (Nomex)`, `?-g Burn Length: ~ 0`).

---

### PSI-100 — SAFFIRE-III (`PSI-100_Experimental table_SAFFIRE-3.csv`)
- **DOI:** [10.60555/040q-4h36](https://doi.org/10.60555/040q-4h36)
- **Row count:** 2 real runs | **Columns:** 9 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Sample Number` | text / nominal | 0.0% | - | - | `S1`, `S2` |
| `Material` | text / nominal | 0.0% | - | - | `SIBAL Fabric` |
| `Sample Thickness` | text / nominal | 0.0% | - | - | `.33 cm` |
| `Sample Length` | text / nominal | 0.0% | - | - | `94 cm` |
| `Sample Width` | text / nominal | 0.0% | - | - | `40.6 cm` |
| `Air Flow` | text / nominal | 0.0% | - | - | `30 cm/s` |
| `Direction` | text / nominal | 0.0% | - | - | `Concurrent`, `Opposed` |
| `Camera 1` | text / nominal | 0.0% | - | - | `S1C1`, `S2C1` |
| `Camera 2` | text / nominal | 0.0% | - | - | `S1C2`, `S2C2` |

**Physical Parameter Mapping for this Table:**
- **Material:** Cotton-Fiberglass fabric (SIBAL) large sample aboard Cygnus OA-7.
- **Oxygen & Flow:** High ventilation ($20\text{ cm/s}$) under exploration atmosphere.

---

### PSI-39 — CFI (`PSI-39_Experimental table_CFI.csv`)
- **DOI:** [10.60555/m6pj-a914](https://doi.org/10.60555/m6pj-a914)
- **Row count:** 87 real runs | **Columns:** 10 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Flex Number` | text / nominal | 0.0% | 1206 | 1387 | 1206, 1207, 1208, 1209 |
| `Test Date` | text / nominal | 0.0% | - | - | `1-Aug-17`, `10-Aug-17`, `10-Jul-17` |
| `Local Time` | text / nominal | 0.0% | - | - | `01:02:35 pm est`, `01:18 pm est`, `01:41:52 pm est` |
| `CIR` | text / nominal | 0.0% | - | - | `f068a03`, `f068a07`, `f068a08` |
| `Pressure` | text / nominal | 0.0% | - | - | `0.5 atm`, `0.75 atm`, `1 atm` |
| `Oxygen` | text / nominal | 0.0% | 0.17 | 0.21 | 0.17, 0.21 |
| `Nitrogen` | text / nominal | 0.0% | 0.2 | 0.83 | 0.2, 0.5, 0.76, 0.79 |
| `Helium` | text / nominal | 0.0% | 0 | 0.59 | 0, 0.29, 0.59 |
| `Fiber` | text / nominal | 10.3% | - | - | `No`, `Yes` |
| `Fuel` | text / nominal | 0.0% | - | - | `C12H26`, `[.60]/[.40] C12H26/iso-dodecane`, `[.75]/[.25] C12H26/iso-dodecane` |

**Physical Parameter Mapping for this Table:**

---

### PSI-10 — ACME Flame Design (Normal) (`PSI-10_Experimental table_Flame Design_Normal Flame.csv`)
- **DOI:** [10.60555/w4zy-bt45](https://doi.org/10.60555/w4zy-bt45)
- **Row count:** 207 real runs | **Columns:** 15 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Flame Type` | text / nominal | 0.0% | - | - | `Normal` |
| `Day` | text / nominal | 0.0% | 0 | 13 | 0, 1, 10, 11 |
| `Fuel` | text / nominal | 0.0% | - | - | `C2H4`, `C3H8` |
| `Test` | text / nominal | 0.0% | - | - | `19115A1`, `19115B1`, `19115B2` |
| `Xfuel` | text / nominal | 0.0% | - | - | `0.04984099`, `0.053108488`, `0.053119385` |
| `mfuel (mg/s)` | mg/s | 0.0% | - | - | `0.312674102`, `0.374443905`, `0.476252464` |
| `mN2 (mg/s)` | mg/s | 0.0% | - | - | `0`, `0.653400262`, `0.723668916` |
| `mtot (mg/s)` | mg/s | 0.0% | - | - | `0.312674102`, `0.374443905`, `0.476252464` |
| `XO2 (init)` | init | 0.0% | 0.198048 | 0.4 | 0.198048193, 0.198596375, 0.199163298, 0.199415737 |
| `XO2 (final)` | final | 9.7% | 0.197475 | 0.397248 | 0.197475265, 0.198048193, 0.198596375, 0.199163298 |
| `pinit (atm)` | atm | 0.0% | 0.931973 | 1.29696 | 0.931972789, 0.98870838, 0.99143022, 1.00163712 |
| `pfinal (atm)` | atm | 9.7% | 0.992791 | 1.32418 | 0.99279114, 0.99619344, 1.00776126, 1.00844172 |
| `pmean (atm)` | atm | 9.7% | 0.992111 | 1.31057 | 0.99211068, 0.99245091, 1.00537965, 1.00640034 |
| `mean Zst` | text / nominal | 0.0% | - | - | `0.060917462`, `0.061045429`, `0.061280032` |
| `Tad (K)` | K | 0.0% | - | - | `1682.720497`, `1722.401267`, `1729.397642` |

**Physical Parameter Mapping for this Table:**
- **Fuel & Burner:** Methane ($CH_4$), Ethylene ($C_2H_4$) in spherical / boundary coflow burners.
- **Pressure & Diluent:** Chamber pressure 0.5 to 3.0 bar; Dilution with $CO_2$, $N_2$, and $He$.

---

### PSI-10 — ACME Flame Design (Inverse) (`PSI-10_Experimental table_Flame Design_Inverse Flame.csv`)
- **DOI:** [10.60555/w4zy-bt45](https://doi.org/10.60555/w4zy-bt45)
- **Row count:** 120 real runs | **Columns:** 14 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Flame Type` | text / nominal | 0.0% | - | - | `Inverse` |
| `Day` | text / nominal | 0.0% | 1 | 8 | 1, 2, 3, 4 |
| `Test` | text / nominal | 0.0% | - | - | `21328A1`, `21328A2`, `21328D1` |
| `XO2` | text / nominal | 0.0% | - | - | `0.212017175`, `0.212288808`, `0.212319452` |
| `mO2 (mg/s)` | mg/s | 0.0% | - | - | `1.523649805`, `1.664362248`, `1.665328676` |
| `mN2 (mg/s)` | mg/s | 0.0% | - | - | `0.235437505`, `0.257180681`, `0.257330016` |
| `mtot (mg/s)` | mg/s | 0.0% | - | - | `1.75908731`, `1.921542929`, `1.922658692` |
| `XC2H4 initial` | text / nominal | 0.0% | 0.0803132 | 0.658126 | 0.080313163, 0.080586585, 0.08084315, 0.081198911 |
| `XC2H4 final` | text / nominal | 0.0% | 0.0800929 | 0.657133 | 0.080092897, 0.080313163, 0.080586585, 0.08084315 |
| `pinit (atm)` | atm | 0.0% | 0.424607 | 3.00763 | 0.42460704, 0.4252875, 0.42664842, 0.42800934 |
| `pfinal (atm)` | atm | 0.0% | 0.427329 | 3.02873 | 0.42732888, 0.43073118, 0.43277256, 0.50558178 |
| `pmean (atm)` | atm | 0.0% | 0.425968 | 3.01818 | 0.42596796, 0.42800934, 0.4286898, 0.43039095 |
| `mean Zst` | text / nominal | 0.0% | - | - | `0.09531966`, `0.111465943`, `0.202219079` |
| `Tad (K)` | K | 0.0% | - | - | `2074.412212`, `2083.471194`, `2101.256389` |

**Physical Parameter Mapping for this Table:**
- **Fuel & Burner:** Methane ($CH_4$), Ethylene ($C_2H_4$) in spherical / boundary coflow burners.
- **Pressure & Diluent:** Chamber pressure 0.5 to 3.0 bar; Dilution with $CO_2$, $N_2$, and $He$.

---

### PSI-20 — ACME BRE (`PSI-20_Experimental table_ACME BRE.csv`)
- **DOI:** [10.60555/vb93-3y72](https://doi.org/10.60555/vb93-3y72)
- **Row count:** 18 real runs | **Columns:** 8 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Year` | text / nominal | 0.0% | 2019 | 2021 | 2019, 2020, 2021 |
| `Month` | text / nominal | 0.0% | - | - | `April`, `Dec`, `Feb` |
| `Date` | text / nominal | 0.0% | 1 | 28 | 1, 11, 17, 20 |
| `Burner Size (mm)` | mm | 0.0% | 25 | 50 | 25, 50 |
| `Fuel Bottle` | text / nominal | 0.0% | - | - | `100% C2H4`, `100% CH4`, `100%C2H4` |
| `Oxygen Conc (percent)` | percent | 0.0% | - | - | `2100%`, `21; 26.5; 34`, `21; 26.5; 34; 40` |
| `Flames Ignited` | text / nominal | 0.0% | 0 | 21 | 0, 10, 12, 13 |
| `Notes` | text / nominal | 88.9% | - | - | `Flames Ignited is the number ignited on that day (neglecting the day change on ISS).`, `Oxygen Conc. (as diluted with nitrogen on a volume basis) was varied between tests where approximate concentrations for tests that ignited are listed. The chamber pressures were also varied but are not identified in this summary table.` |

**Physical Parameter Mapping for this Table:**

---

### PSI-21 — ACME CLD Flame (`PSI-21_Experimental table_CLD Flame.csv`)
- **DOI:** [10.60555/23e1-9950](https://doi.org/10.60555/23e1-9950)
- **Row count:** 32 real runs | **Columns:** 8 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Test Type` | text / nominal | 0.0% | - | - | `Ethylene based test`, `Improved coflow tests`, `Methane based test` |
| `Test Day` | text / nominal | 0.0% | 17319 | 21062 | 17319, 17324, 17342, 17356 |
| `Fuel MFC` | text / nominal | 0.0% | 0.1 | 0.2 | 0.1, 0.2 |
| `N2 MFC` | text / nominal | 0.0% | 0.02 | 0.2 | 0.02, 0.05, 0.1, 0.2 |
| `Fuel Bottle` | text / nominal | 0.0% | - | - | `100% C2H10`, `100% C2H11`, `100% C2H4` |
| `Fuel conc. Range` | text / nominal | 0.0% | - | - | `0%-30%`, `10%-20%`, `10%-30%` |
| `Flames ignited` | text / nominal | 0.0% | 2 | 18 | 10, 11, 12, 13 |
| `Notes` | text / nominal | 96.9% | - | - | `Test Day - includes the year as the first two digits followed by the 3-digit day of the year (where any late-hour transition to the next day is neglected). MFC - identifies the maximum flow rate of the specified ACME Mass Flow Controller (MFC) in slpm on a nitrogen basis. Fuel conc. - (as diluted with nitrogen on a volume basis) was varied between tests and sometimes during tests where the listing here accounts for both. However, it does not account for extinction that sometimes occurred before the flame fully reached the lowest concentration. Flames ignited is the number ignited on that test day.` |

**Physical Parameter Mapping for this Table:**

---

### PSI-22 — ACME E-FIELD Flames (`PSI-22_Experimental table_ACME E-FIELD Flames.csv`)
- **DOI:** [10.60555/se5a-8c73](https://doi.org/10.60555/se5a-8c73)
- **Row count:** 32 real runs | **Columns:** 10 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Test Type` | text / nominal | 34.4% | - | - | `First round of tests with coflow burner`, `Second round of tests with gas-jet burner` |
| `Test Day` | text / nominal | 34.4% | 18073 | 18319 | 18073, 18078, 18080, 18087 |
| `Year` | text / nominal | 34.4% | 2018 | 2018 | 2018 |
| `Month` | text / nominal | 34.4% | 3 | 11 | 10, 11, 3, 4 |
| `Date` | text / nominal | 34.4% | 1 | 29 | 1, 10, 12, 14 |
| `Mesh Polarity` | text / nominal | 34.4% | - | - | `negative`, `positive` |
| `Fuel Bottle` | text / nominal | 34.4% | - | - | `100% C2H4`, `100% CH4`, `30% C2H4` |
| `Fuel Conc` | text / nominal | 0.0% | 25 | 100 | 100%, 25%, 30%, 40% |
| `Flames Ignited` | text / nominal | 34.4% | 8 | 15 | 10, 11, 12, 13 |
| `Notes` | text / nominal | 87.5% | - | - | `Flames Ignited is the number ignited on that day (neglecting the day change on ISS).`, `Fuel Conc. (diluted with nitrogen on a volume basis) was varied between tests, but typically matched the bottle. The list only accounts for flames ignited.`, `Mesh polarity refers to the polarity of the high-voltage power supply and the copper electrode relative to the burner.` |

**Physical Parameter Mapping for this Table:**

---

### PSI-23 — ACME s-Flame (`PSI-23_Experimental table_ACME s-Flame.csv`)
- **DOI:** [10.60555/k57n-p030](https://doi.org/10.60555/k57n-p030)
- **Row count:** 18 real runs | **Columns:** 9 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Test Type` | text / nominal | 0.0% | - | - | `First round of tests with nitrogen-diluted fuel and oxygen`, `Second round of tests with helium-diluted fuel and oxygen` |
| `Test Day*` | text / nominal | 0.0% | 19254 | 20190 | 19254, 19256, 19304, 19308 |
| `Year` | text / nominal | 0.0% | 2019 | 2020 | 2019, 2020 |
| `Month` | text / nominal | 0.0% | - | - | `Dec.`, `Jan.`, `July` |
| `Date` | text / nominal | 0.0% | 3 | 31 | 11, 12, 13, 15 |
| `Atmosphere*` | text / nominal | 0.0% | - | - | `~21% O2 with He`, `~21% O2 with N2`, `~21% O2 with N3` |
| `Fuel Bottle` | text / nominal | 0.0% | - | - | `100% H2`, `20% C2H4 with He`, `20% H2, 25% CH4, with He` |
| `Flames Ignited*` | text / nominal | 0.0% | 7 | 23 | 10, 11, 12, 13 |
| `Notes` | text / nominal | 83.3% | - | - | `*Atmosphere is ~1 atm but pressure increases and O2% drops with vitiation.`, `*Flames Ignited is the number ignited on that day (neglecting the day change on ISS).`, `*Test Day is formatted YYDDD where YY identfies year and DDD identifies day of year (GMT).` |

**Physical Parameter Mapping for this Table:**

---

### PSI-159 — ACME CFI-G (Normal) (`PSI-159_Experimental table_CFI-G_Normal Flames.csv`)
- **DOI:** [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64)
- **Row count:** 179 real runs | **Columns:** 18 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Flame Type` | text / nominal | 0.0% | - | - | `Normal` |
| `Day` | text / nominal | 0.0% | 1 | 11 | 1, 10, 11, 2 |
| `Fuel` | text / nominal | 0.0% | - | - | `30% butane`, `30% ethane`, `30% propane` |
| `Test` | text / nominal | 0.0% | - | - | `21088 B1`, `21088 C1`, `21088 D1` |
| `Cool flame?` | text / nominal | 95.5% | - | - | `no, PCI-hot`, `yes, PCI-A`, `yes, PCI-B` |
| `XO2 before test` | text / nominal | 0.0% | 0.179686 | 0.3997 | 0.179685675, 0.1802, 0.206694811, 0.207221235 |
| `XO2  after test` | text / nominal | 0.0% | 0.179392 | 0.397259 | 0.17939183, 0.179685675, 0.206622334, 0.206694811 |
| `approx p (bar)` | bar | 0.0% | 0.50665 | 3.0399 | 0.50665, 0.9443956, 1.0133, 2.0266 |
| `Xf` | text / nominal | 0.0% | 0 | 1 | 0, 0.01827, 0.02385, 0.02717 |
| `mHC (mg/s)` | mg/s | 0.0% | 0 | 3.215 | 0, 0.1, 0.125, 0.25 |
| `TFP` | text / nominal | 0.0% | - | - | `No`, `Yes` |
| `Tad (K)` | K | 0.0% | - | - | `#DIV/0!`, `1397.031071`, `1596.02196` |
| `Zst` | text / nominal | 0.0% | - | - | `#DIV/0!`, `0.058763347`, `0.058881505` |
| `Hot ignition` | text / nominal | 0.0% | - | - | `No`, `Yes` |
| `burn time (sec)` | sec | 2.2% | 0 | 304 | 0, 1, 10, 109 |
| `Self-ext or flow term` | text / nominal | 0.0% | - | - | `-`, `FT`, `SE` |
| `Peak burner T (C )` | C | 0.0% | - | - | `-`, `101.3609727`, `105.264091` |
| `Comments` | text / nominal | 75.4% | - | - | `1  bottle, 2 days, 30% C2H6, timer reset`, `1 bottle 1 day, 30% butane, 1 timer reset`, `1 bottle 1 day, 30% butane, 3 hour gap if we want a timer reset?` |

**Physical Parameter Mapping for this Table:**

---

### PSI-159 — ACME CFI-G (Inverse) (`PSI-159_Experimental table_CFI-G_Inverse Flames.csv`)
- **DOI:** [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64)
- **Row count:** 154 real runs | **Columns:** 20 | **Encoding:** `utf-8-sig`

| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Flame Type` | text / nominal | 0.0% | - | - | `Inverse`, `inverse` |
| `Day` | text / nominal | 0.0% | 1 | 12 | 1, 10, 11, 12 |
| `Fuel` | text / nominal | 0.0% | - | - | `butane`, `ethane`, `propane` |
| `Test` | text / nominal | 0.0% | - | - | `21196 A1`, `21196 A2`, `21196 F1` |
| `Xf  before test` | text / nominal | 0.0% | 0.0564793 | 0.4287 | 0.056479312, 0.056517425, 0.056556159, 0.057086602 |
| `Xf  after test` | text / nominal | 0.0% | 0.0556264 | 0.427799 | 0.055626433, 0.056479312, 0.056517425, 0.056556159 |
| `approx p (bar)` | bar | 0.0% | 0.495382 | 3.3099 | 0.4953817, 0.55165, 1.10, 1.1033 |
| `XO2` | text / nominal | 0.0% | 0.12 | 0.85 | 0.12, 0.135, 0.15, 0.18 |
| `HC burnrate (mg/s)` | mg/s | 0.0% | 0.25 | 2.5 | 0.25, 0.375, 0.5, 0.510 |
| `O2 flow rate (mg/s)` | mg/s | 0.0% | 0.931126 | 9.08406 | 0.931125707, 1.342000602, 1.360493197, 1.39668856 |
| `TFP` | text / nominal | 0.0% | - | - | `No`, `Yes` |
| `Tad (K)` | K | 0.0% | 1567.03 | 2978.37 | 1567.030825, 1680.718299, 1779.772352, 1781.609691 |
| `Zst` | text / nominal | 0.0% | 0.105557 | 0.783918 | 0.105556515, 0.106732291, 0.107933674, 0.108454236 |
| `Hot ignition` | text / nominal | 0.0% | - | - | `No`, `Yes`, `flash` |
| `burn time (sec)` | sec | 0.0% | 0 | 152 | 0, 0.5, 1, 10 |
| `Self -ext or flow term` | text / nominal | 0.0% | - | - | `-`, `FT`, `SE` |
| `Peak burner Temp (C)` | C | 0.6% | - | - | `-`, `100`, `100.4` |
| `Peak burner temp (K)` | K | 0.0% | - | - | `#VALUE!`, `273.15`, `298.75` |
| `Color` | text / nominal | 6.5% | - | - | `-`, `Blue`, `Yellow` |
| `Comments` | text / nominal | 74.7% | - | - | `A flash and gone`, `Aborted`, `Burner T limit, most images lost` |

**Physical Parameter Mapping for this Table:**

---

## 3. NASA NTRS & Peer-Reviewed Publications List

Comprehensive catalog of all primary scientific papers and NASA technical documents cited in the metadata of these 14 investigations:

| Investigation | Year | Author(s) | Publication / NTRS Document Title | DOI / NTRS Accession |
| :--- | :---: | :--- | :--- | :--- |
| **PSI-100** | UNKNOWN | JE Niehaus, PV Ferkul, SA Gokoglu, GA Ru | Buoyant Effects on the Flammability of Silicone Samples Planned for the Spacecraft Fire Ex | NTRS Open Access |
| **PSI-100** | UNKNOWN | W Schoren, GA Ruff, DL Urban | The Spacecraft Fire Experiment (Saffire) - Objectives, Development and Status | NTRS Open Access |
| **PSI-100** | UNKNOWN | https://ntrs.nasa.gov/citations/20170000 | Operation and Development Status of the Spacecraft Fire Experiments (Saffire), 46th Intern | NTRS Open Access |
| **PSI-10** | UNKNOWN | Waddell Kendyl A., Irace Phillip H., Yab | The kinetics and warm flame chemistry associated with radiative extinction of spherical di | [10.1080/13647830.2024.2326830](https://doi.org/10.1080/13647830.2024.2326830) |
| **PSI-10** | UNKNOWN | Frolov Sergey M., Ivanov Vladislav S., F | Soot Formation in Spherical Diffusion Flames | [10.3390/math11020261](https://doi.org/10.3390/math11020261) |
| **PSI-10** | UNKNOWN | Irace Phillip H., Waddell Kendyl A., Con | On the existence of steady-state gaseous microgravity spherical diffusion flames in the pr | [10.1016/j.proci.2022.07.049](https://doi.org/10.1016/j.proci.2022.07.049) |
| **PSI-10** | UNKNOWN | Irace Phillip H., Waddell Kendyl A., Con | Critical temperature and reactant mass flux for radiative extinction of ethylene micrograv | [10.1016/j.proci.2022.07.043](https://doi.org/10.1016/j.proci.2022.07.043) |
| **PSI-10** | UNKNOWN | Irace P.H., Gopan A., Axelbaum R.L. | An investigation of thermal radiation from laminar diffusion flames in a tri-coflow burner | [10.1016/j.combustflame.2022.112158](https://doi.org/10.1016/j.combustflame.2022.112158) |
| **PSI-10** | UNKNOWN | undefined undefined, FROLOV S. M. | SPHERICAL DIFFUSION FLAME IN MICROGRAVITY CONDITIONS: FIRST RESULTS OF JOINT RUSSIAN-AMERI | [10.30826/NEPCAP9B-13](https://doi.org/10.30826/NEPCAP9B-13) |
| **PSI-10** | UNKNOWN | Irace Phillip H., Lee Han Ju, Waddell Ke | Observations of long duration microgravity spherical diffusion flames aboard the Internati | [10.1016/j.combustflame.2021.02.019](https://doi.org/10.1016/j.combustflame.2021.02.019) |
| **PSI-10** | UNKNOWN | Wang Zhengyang, Sunderland Peter B., Axe | Double blue zones in inverse and normal laminar jet diffusion flames | [10.1016/j.combustflame.2019.09.014](https://doi.org/10.1016/j.combustflame.2019.09.014) |
| **PSI-10** | UNKNOWN | Wang Zhengyang, Sunderland Peter B., Axe | Dilution effects on laminar jet diffusion flame lengths | [10.1016/j.proci.2018.06.085](https://doi.org/10.1016/j.proci.2018.06.085) |
| **PSI-10** | UNKNOWN | Wu Wendong, Adeosun Adewale, Axelbaum Ri | A new method of flame temperature measurement utilizing the acoustic emissions from laser- | [10.1016/j.proci.2018.07.096](https://doi.org/10.1016/j.proci.2018.07.096) |
| **PSI-10** | UNKNOWN | Rodenhurst Melvin K., Chao Beei-Huan, Su | Structure and extinction of spherical burner-stabilized diffusion flames that are attached | [10.1016/j.combustflame.2017.08.024](https://doi.org/10.1016/j.combustflame.2017.08.024) |
| **PSI-10** | UNKNOWN | Gopan Akshay, Yang Zhiwei, Kumfer Benjam | Effects of Inert Placement (Z st) on Soot and Radiative Heat Flux in Turbulent Diffusion F | [10.1021/acs.energyfuels.7b01092](https://doi.org/10.1021/acs.energyfuels.7b01092) |
| **PSI-10** | UNKNOWN | Wu Wendong, Yablonsky Gregory, Axelbaum  | Observation of water–gas shift equilibrium in diffusion flames | [10.1016/j.combustflame.2016.07.025](https://doi.org/10.1016/j.combustflame.2016.07.025) |
| **PSI-10** | UNKNOWN | Krishnan Siddharth, Kumfer Benjamin M.,  | An Approach to Thermocouple Measurements That Reduces Uncertainties in High-Temperature En | [10.1021/acs.energyfuels.5b00071](https://doi.org/10.1021/acs.energyfuels.5b00071) |
| **PSI-10** | UNKNOWN | Lecoustre V.R., Sunderland P.B., Chao B. | Modeled quenching limits of spherical hydrogen diffusion flames | [10.1016/j.proci.2012.07.029](https://doi.org/10.1016/j.proci.2012.07.029) |
| **PSI-10** | UNKNOWN | Xia Fei, Axelbaum Richard L. | Simplifying the complexity of diffusion flames through interpretation in C/O ratio space | [10.1016/j.camwa.2013.01.008](https://doi.org/10.1016/j.camwa.2013.01.008) |
| **PSI-10** | UNKNOWN | Xia Fei, Yablonsky Gregory S., Axelbaum  | Numerical study of flame structure and soot inception interpreted in carbon-to-oxygen atom | [10.1016/j.proci.2012.06.043](https://doi.org/10.1016/j.proci.2012.06.043) |
| **PSI-10** | UNKNOWN | Yi Fei, Axelbaum Richard L. | Stability of spray combustion for water/alcohols mixtures in oxygen-enriched air | [10.1016/j.proci.2012.05.088](https://doi.org/10.1016/j.proci.2012.05.088) |
| **PSI-10** | UNKNOWN | Lecoustre V.R., Sunderland P.B., Chao B. | Numerical investigation of spherical diffusion flames at their sooting limits | [10.1016/j.combustflame.2011.05.022](https://doi.org/10.1016/j.combustflame.2011.05.022) |
| **PSI-10** | UNKNOWN | Wang Q., Chao B.H. | Kinetic and radiative extinctions of spherical burner-stabilized diffusion flames | [10.1016/j.combustflame.2010.12.007](https://doi.org/10.1016/j.combustflame.2010.12.007) |
| **PSI-10** | UNKNOWN | Lecoustre V.R., Sunderland P.B., Chao B. | Extremely weak hydrogen flames | [10.1016/j.combustflame.2010.07.024](https://doi.org/10.1016/j.combustflame.2010.07.024) |
| **PSI-10** | UNKNOWN | Skeen S.A., Yablonsky G., Axelbaum R.L. | Characteristics of non-premixed oxygen-enhanced combustion: II. Flame structure effects on | [10.1016/j.combustflame.2010.04.013](https://doi.org/10.1016/j.combustflame.2010.04.013) |
| **PSI-10** | UNKNOWN | Skeen S.A., Yablonsky G., Axelbaum R.L. | Characteristics of non-premixed oxygen-enhanced combustion: I. The presence of appreciable | [10.1016/j.combustflame.2009.07.009](https://doi.org/10.1016/j.combustflame.2009.07.009) |
| **PSI-10** | UNKNOWN | Kumfer B.M., Skeen S.A., Axelbaum R.L. | Soot inception limits in laminar diffusion flames with application to oxy–fuel combustion | [10.1016/j.combustflame.2008.03.008](https://doi.org/10.1016/j.combustflame.2008.03.008) |
| **PSI-10** | UNKNOWN | SANTA K, CHAO B, SUNDERLAND P, URBAN D,  | Radiative extinction of gaseous spherical diffusion flames in microgravity | [10.1016/j.combustflame.2007.08.009](https://doi.org/10.1016/j.combustflame.2007.08.009) |
| **PSI-10** | UNKNOWN | Santa K. J., Sun Z., Chao B. H., Sunderl | Numerical and experimental observations of spherical diffusion flames | [10.1080/13647830601161567](https://doi.org/10.1080/13647830601161567) |
| **PSI-10** | UNKNOWN | Waddell Kendyl A., Yablonsky Gregory, Co | The effects of elevated pressure on the kinetics and extinction of hot, warm, and cool gas | [10.1016/j.proci.2024.105400](https://doi.org/10.1016/j.proci.2024.105400) |
| **PSI-10** | UNKNOWN | CHAO B. H., LIU S., AXELBAUM R. L. | On Soot Inception in Nonpremixed Flames and the Effects of Flame Structure | [10.1080/00102209808952065](https://doi.org/10.1080/00102209808952065) |
| **PSI-10** | UNKNOWN | Kumfer B.M., Skeen S.A., Chen R., Axelba | Measurement and analysis of soot inception limits of oxygen-enriched coflow flames | [10.1016/j.combustflame.2006.08.004](https://doi.org/10.1016/j.combustflame.2006.08.004) |
| **PSI-10** | UNKNOWN | Chen R., Axelbaum R.L. | Scalar dissipation rate at extinction and the effects of oxygen-enriched combustion | [10.1016/j.combustflame.2005.02.008](https://doi.org/10.1016/j.combustflame.2005.02.008) |
| **PSI-10** | UNKNOWN | Liu S., Chao B.H., Axelbaum R.L. | A theoretical study on soot inception in spherical burner-stabilized diffusion flames | [10.1016/j.combustflame.2004.08.016](https://doi.org/10.1016/j.combustflame.2004.08.016) |
| **PSI-10** | UNKNOWN | SUNDERLAND P. B., URBAN D. L., STOCKER D | SOOTING LIMITS OF MICROGRAVITY SPHERICAL DIFFUSION FLAMES IN OXYGEN-ENRICHED AIR AND DILUT | [10.1080/00102200490514994](https://doi.org/10.1080/00102200490514994) |
| **PSI-10** | UNKNOWN | Sunderland P | Effects of structure and hydrodynamics on the sooting behavior of spherical microgravity d | [10.1016/S0010-2180(02)00424-8](https://doi.org/10.1016/S0010-2180(02)00424-8) |
| **PSI-159** | UNKNOWN | Kim Minhyeng, Waddell Kendyl A., Sunderl | Spherical gas-fueled cool diffusion flames | [10.1016/j.proci.2022.07.015](https://doi.org/10.1016/j.proci.2022.07.015) |
| **PSI-159** | UNKNOWN | Waddell Kendyl A., Lee Han Ju, Nayagam V | Cool diffusion flames in a stably stratified stagnation flow | [10.1016/j.combustflame.2023.112852](https://doi.org/10.1016/j.combustflame.2023.112852) |
| **PSI-20** | UNKNOWN | Zhang Yi, Bustamante Michael J, Gollner  | Burning on flat wicks at various orientations | [10.1177/0734904113495650](https://doi.org/10.1177/0734904113495650) |
| **PSI-20** | UNKNOWN | Zhang Y., Bustamante M. J., Dotson K. T. | A Gas Burner to Emulate Condensed-Phase Burning | [10.3850/978-981-07-5936-0_03-01](https://doi.org/10.3850/978-981-07-5936-0_03-01) |
| **PSI-20** | UNKNOWN | MJ Bustamante | Experimental Investigation of Liquid and Gas Fueled Flames Towards the Development of a Bu | NTRS Open Access |
| **PSI-20** | UNKNOWN | P Dehghani, PB Sunderland, JG Quintiere, | Burning in microgravity: Experimental results and analysis | [10.1016/j.combustflame.2021.01.035](https://doi.org/10.1016/j.combustflame.2021.01.035) |
| **PSI-20** | UNKNOWN | Snegirev Alexander, Kuznetsov Egor, Mark | Transient dynamics of radiative extinction in low-momentum microgravity diffusion flames | [10.1016/j.proci.2020.06.110](https://doi.org/10.1016/j.proci.2020.06.110) |
| **PSI-20** | UNKNOWN | Auth Eric, Quintiere James G., Sunderlan | Emulation of condensed fuel flames with gaseous fuels supplied through a porous copper cal | [10.1002/fam.2896](https://doi.org/10.1002/fam.2896) |
| **PSI-20** | UNKNOWN | Kuznetsov E. A., Snegirev A. Yu., Markus | Radiative Extinction of Laminar Diffusion Flame above the Flat Porous Burner in Microgravi | [10.1134/S0010508220040036](https://doi.org/10.1134/S0010508220040036) |
| **PSI-20** | UNKNOWN | Markan Akshit, Baum Howard R., Sunderlan | Transient ellipsoidal combustion model for a porous burner in microgravity | [10.1016/j.combustflame.2019.09.030](https://doi.org/10.1016/j.combustflame.2019.09.030) |
| **PSI-20** | UNKNOWN | Markan Akshit, Sunderland Peter B., Quin | Measuring heat flux to a porous burner in microgravity | [10.1016/j.proci.2018.05.006](https://doi.org/10.1016/j.proci.2018.05.006) |
| **PSI-20** | UNKNOWN | Vermina Plathner Frida, Quintiere James  | Analysis of extinction and sustained ignition | [10.1016/j.firesaf.2019.02.003](https://doi.org/10.1016/j.firesaf.2019.02.003) |
| **PSI-20** | UNKNOWN | Markan Akshit, Sunderland Peter B., Quin | A Burning Rate Emulator (BRE) for study of condensed fuel burning in microgravity | [10.1016/j.combustflame.2018.01.044](https://doi.org/10.1016/j.combustflame.2018.01.044) |
| **PSI-20** | UNKNOWN | Lundström Frida Vermina, Sunderland Pete | Study of ignition and extinction of small-scale fires in experiments with an emulating gas | [10.1016/j.firesaf.2016.11.003](https://doi.org/10.1016/j.firesaf.2016.11.003) |
| **PSI-20** | UNKNOWN | Zhang Yi, Kim Matt, Guo Haiqing, Sunderl | Emulation of condensed fuel flames with gases in microgravity | [10.1016/j.combustflame.2015.05.005](https://doi.org/10.1016/j.combustflame.2015.05.005) |
| **PSI-20** | UNKNOWN | Dehghani Parham, Quintiere James G. | Flammability maps for microgravity burning of a small flat material in a quiescent ambient | [10.1016/j.combustflame.2023.112809](https://doi.org/10.1016/j.combustflame.2023.112809) |
| **PSI-20** | UNKNOWN | Dehghani Parham, de Ris John L., Quintie | Demonstrating steady burning for small flat materials in microgravity in a quiescent ambie | [10.1016/j.proci.2022.08.107](https://doi.org/10.1016/j.proci.2022.08.107) |
| **PSI-20** | UNKNOWN | Dehghani Parham, Quintiere James G. | Theoretical analysis and predictions of burning in microgravity using a burning emulator | [10.1016/j.combustflame.2021.111572](https://doi.org/10.1016/j.combustflame.2021.111572) |
| **PSI-21** | UNKNOWN | D Giassi, S Cao, BA Bennett, DP Stocker, | Analysis of CH* concentration and flame heat release rate in laminar coflow diffusion flam | [10.1016/j.combustflame.2016.02.012](https://doi.org/10.1016/j.combustflame.2016.02.012) |
| **PSI-21** | UNKNOWN | Giassi Davide, Long Marshall B. | Signal-to-noise ratio improvements in laser flow diagnostics using time-resolved image ave | [10.1007/s00348-016-2218-5](https://doi.org/10.1007/s00348-016-2218-5) |
| **PSI-21** | UNKNOWN | Cao S., Ma B., Bennett B.A.V., Giassi D. | A computational and experimental study of coflow laminar methane/air diffusion flames: Eff | [10.1016/j.proci.2014.05.138](https://doi.org/10.1016/j.proci.2014.05.138) |
| **PSI-21** | UNKNOWN | Dobbins Richard R., Tinjero Jesse, Squeo | A Combined Experimental and Computational Study of Soot Formation in Normal and Microgravi | [10.1080/00102202.2022.2041621](https://doi.org/10.1080/00102202.2022.2041621) |
| **PSI-21** | UNKNOWN | Kempema Nathan J., Dobbins Richard R., L | Constrained-temperature solutions of coflow laminar diffusion flames | [10.1016/j.proci.2020.06.034](https://doi.org/10.1016/j.proci.2020.06.034) |
| **PSI-21** | UNKNOWN | Cao Su, Ma Bin, Giassi Davide, Bennett B | Effects of pressure and fuel dilution on coflow laminar methane–air diffusion flames: A co | [10.1080/13647830.2017.1403051](https://doi.org/10.1080/13647830.2017.1403051) |
| **PSI-21** | UNKNOWN | Kempema Nathan J., Long Marshall B. | Effect of soot self-absorption on color-ratio pyrometry in laminar coflow diffusion flames | [10.1364/OL.43.001103](https://doi.org/10.1364/OL.43.001103) |
| **PSI-21** | UNKNOWN | Cao S., Ma B., Bennett B.A.V., Giassi D. | A computational and experimental study of coflow laminar methane/air diffusion flames: Eff | [10.1016/j.proci.2014.05.138](https://doi.org/10.1016/j.proci.2014.05.138) |
| **PSI-21** | UNKNOWN | Ma Bin, Cao Su, Giassi Davide, Stocker D | An experimental and computational study of soot formation in a coflow jet flame under micr | [10.1016/j.proci.2014.05.064](https://doi.org/10.1016/j.proci.2014.05.064) |
| **PSI-21** | UNKNOWN | Ma Bin, Long Marshall B. | Absolute light calibration using S-type thermocouples | [10.1016/j.proci.2012.05.030](https://doi.org/10.1016/j.proci.2012.05.030) |
| **PSI-21** | UNKNOWN | Herdman Jennifer D., Connelly Blair C.,  | A comparison of Raman signatures and laser-induced incandescence with direct numerical sim | [10.1016/j.carbon.2011.07.050](https://doi.org/10.1016/j.carbon.2011.07.050) |
| **PSI-21** | UNKNOWN | Kuhn Peter B., Ma Bin, Connelly Blair C. | Soot and thin-filament pyrometry using a color digital camera | [10.1016/j.proci.2010.05.006](https://doi.org/10.1016/j.proci.2010.05.006) |
| **PSI-21** | UNKNOWN | LONG MARSHALL | IMAGING FLAMES: FROM ADVANCED LASER DIAGNOSTICS TO SNAPSHOTS | [10.1142/9789814295789_0004](https://doi.org/10.1142/9789814295789_0004) |
| **PSI-21** | UNKNOWN | Connelly B.C., Bennett B.A.V., Smooke M. | A paradigm shift in the interaction of experiments and computations in combustion research | [10.1016/j.proci.2008.05.066](https://doi.org/10.1016/j.proci.2008.05.066) |
| **PSI-21** | UNKNOWN | Connelly B.C., Long M.B., Smooke M.D., H | Computational and experimental investigation of the interaction of soot and NO in coflow d | [10.1016/j.proci.2008.06.182](https://doi.org/10.1016/j.proci.2008.06.182) |
| **PSI-21** | UNKNOWN | Dworkin S. B., Cooke J. A., Bennett B. A | Distributed-memory parallel computation of a forced, time-dependent, sooting, ethylene/air | [10.1080/13647830903159293](https://doi.org/10.1080/13647830903159293) |
| **PSI-21** | UNKNOWN | Dworkin S.B., Schaffer A.M., Connelly B. | Measurements and calculations of formaldehyde concentrations in a methane/N2/air, non-prem | [10.1016/j.proci.2008.05.083](https://doi.org/10.1016/j.proci.2008.05.083) |
| **PSI-21** | UNKNOWN | Dworkin S.B., Connelly B.C., Schaffer A. | Computational and experimental study of a forced, time-dependent, methane–air coflow diffu | [10.1016/j.proci.2006.08.109](https://doi.org/10.1016/j.proci.2006.08.109) |
| **PSI-22** | UNKNOWN | YC Chien, J Tinajero, D Stocker, U Hegde | Ion Current and Flame Changes with Electric Fields in Microgravity | NTRS Open Access |
| **PSI-22** | UNKNOWN | Chien Yu-Chien, Dunn-Rankin Derek | Electric Field Induced Changes of a Diffusion Flame and Heat Transfer near an Impinging Su | [10.3390/en11051235](https://doi.org/10.3390/en11051235) |
| **PSI-22** | UNKNOWN | Y-C Chien | Electrical Aspects of Impinging Flames | NTRS Open Access |
| **PSI-22** | UNKNOWN | K Yamashita, Y-C Chien, S Karnani, D Dun | The Influence of Electric Field Power Systems on Flame Behavior | NTRS Open Access |
| **PSI-22** | UNKNOWN | Weinberg Felix, Carleton Fred | Ionization and chemiluminescence during the progressive aeration of methane flames | [10.1016/j.combustflame.2009.08.008](https://doi.org/10.1016/j.combustflame.2009.08.008) |
| **PSI-22** | UNKNOWN | Papac M. J., Dunn-Rankin D. | Modelling electric field driven convection in small combustion plasmas and surrounding gas | [10.1080/13647830701383814](https://doi.org/10.1080/13647830701383814) |
| **PSI-22** | UNKNOWN | Papac MJ, Dunn-Rankin D. | Canceling buoyancy of gaseous fuel flames in a gravitational environment using an ion-driv | [10.1196/annals.1362.038](https://doi.org/10.1196/annals.1362.038) |
| **PSI-22** | UNKNOWN | Karnani Sunny, Dunn-Rankin Derek | Detailed characterization of DC electric field effects on small non-premixed flames | [10.1016/j.combustflame.2015.03.019](https://doi.org/10.1016/j.combustflame.2015.03.019) |
| **PSI-22** | UNKNOWN | Tse Stephen D, Zhu Delin, Sung Chih-Jen, | Microgravity burner-generated spherical diffusion flames: experiment and computation. Curr | [10.1016/S0010-2180(01)00247-4](https://doi.org/10.1016/S0010-2180(01)00247-4) |
| **PSI-22** | UNKNOWN | Escofet-Martin David, Chien Yu-Chien, Du | PLIF and chemiluminescence in a small laminar coflow methane-air diffusion flame at elevat | [10.1016/j.combustflame.2022.112067](https://doi.org/10.1016/j.combustflame.2022.112067) |
| **PSI-22** | UNKNOWN | Chien Yu-Chien, Escofet-Martin David, Du | Ion current and carbon monoxide release from an impinging methane/air coflow flame in an e | [10.1016/j.combustflame.2019.03.022](https://doi.org/10.1016/j.combustflame.2019.03.022) |
| **PSI-22** | UNKNOWN | Tinajero Jesse, Dunn-Rankin Derek | Non-premixed axisymmetric flames driven by ion currents | [10.1016/j.combustflame.2018.10.036](https://doi.org/10.1016/j.combustflame.2018.10.036) |
| **PSI-22** | UNKNOWN | M. Sauer Vinicius, Dunn-Rankin Derek | Impinging nonpremixed coflow methane–air flames with unity Lewis number | [10.1016/j.proci.2016.06.193](https://doi.org/10.1016/j.proci.2016.06.193) |
| **PSI-22** | UNKNOWN | Tinajero Jesse, Bernard Guillaume, Autef | Characterizing I-V Curves for Non-Premixed Methane Flames Stabilized on Different Burner C | [10.1080/00102202.2017.1331218](https://doi.org/10.1080/00102202.2017.1331218) |
| **PSI-22** | UNKNOWN | Chien Yu-Chien, Escofet-Martin David, Du | CO emission from an impinging non-premixed flame | [10.1016/j.combustflame.2016.09.004](https://doi.org/10.1016/j.combustflame.2016.09.004) |
| **PSI-22** | UNKNOWN | Weinberg F.J., Dunn-Rankin D., Carleton  | Electrical aspects of flame quenching | [10.1016/j.proci.2012.07.007](https://doi.org/10.1016/j.proci.2012.07.007) |
| **PSI-22** | UNKNOWN | Borgatelli Francesco, Dunn-Rankin Derek | Behavior of a small diffusion flame as an electrically active component in a high-voltage  | [10.1016/j.combustflame.2011.06.002](https://doi.org/10.1016/j.combustflame.2011.06.002) |
| **PSI-22** | UNKNOWN | Yamashita Kiyotaka, Karnani Sunny, Dunn- | Numerical prediction of ion current from a small methane jet flame | [10.1016/j.combustflame.2009.02.002](https://doi.org/10.1016/j.combustflame.2009.02.002) |
| **PSI-22** | UNKNOWN | Weinberg Felix, Carleton Fred, Dunn-Rank | Electric field-controlled mesoscale burners | [10.1016/j.combustflame.2007.07.007](https://doi.org/10.1016/j.combustflame.2007.07.007) |
| **PSI-22** | UNKNOWN | Rickard Matthew, Dunn-Rankin Derek | Numerical simulation of a tubular ion-driven wind generator | [10.1016/j.elstat.2007.04.003](https://doi.org/10.1016/j.elstat.2007.04.003) |
| **PSI-22** | UNKNOWN | Dunn-Rankin D, Weinberg FJ. | Using large electric fields to control transport in microgravity. | [10.1196/annals.1362.037](https://doi.org/10.1196/annals.1362.037) |
| **PSI-22** | UNKNOWN | Rickard Matthew, Dunn-Rankin Derek, Wein | Maximizing ion-driven gas flows | [10.1016/j.elstat.2005.09.005](https://doi.org/10.1016/j.elstat.2005.09.005) |
| **PSI-22** | UNKNOWN | Weinberg Felix, Carleton Fred, Kara Dhir | Inducing gas flow and swirl in tubes using ionic wind from corona discharges | [10.1007/s00348-005-0062-0](https://doi.org/10.1007/s00348-005-0062-0) |
| **PSI-22** | UNKNOWN | Chien Yu-Chien, Girodon Hugo, Esquivias  | Modeling of Elevated Pressure Diffusion Flames with Water Addition | [10.1080/00102202.2023.2182205](https://doi.org/10.1080/00102202.2023.2182205) |
| **PSI-22** | UNKNOWN | Chien Yu-Chien, Stocker Dennis P., Hegde | Electric-field effects on methane coflow flames aboard the international space station (IS | [10.1016/j.combustflame.2022.112443](https://doi.org/10.1016/j.combustflame.2022.112443) |
| **PSI-23** | UNKNOWN | Law C.K., Faeth G.M. | Opportunities and challenges of combustion in microgravity | [10.1016/0360-1285(94)90006-X](https://doi.org/10.1016/0360-1285(94)90006-X) |
| **PSI-23** | UNKNOWN | Eng J.A., Law C.K., Zhu D.L. | On burner-stabilized cylindrical premixed flames in microgravity | [10.1016/S0082-0784(06)80819-2](https://doi.org/10.1016/S0082-0784(06)80819-2) |
| **PSI-23** | UNKNOWN | Eng J.A., Zhu D.L., Law C.K. | On the structure, stabilization, and dual response of flat-burner flames | [10.1016/0010-2180(94)00102-X](https://doi.org/10.1016/0010-2180(94)00102-X) |
| **PSI-23** | UNKNOWN | Sung C.J., Law C.K. | Extinction mechanisms of near-limit premixed flames and extended limits of flammability | [10.1016/S0082-0784(96)80296-7](https://doi.org/10.1016/S0082-0784(96)80296-7) |
| **PSI-23** | UNKNOWN | Qian J., Law C.K. | On the spreading of unsteady cylindrical diffusion flames | [10.1016/S0010-2180(97)00069-2](https://doi.org/10.1016/S0010-2180(97)00069-2) |
| **PSI-23** | UNKNOWN | Qian J., Bechtold J.K., Law C.K. | On the response of spherical premixed flames under rotation | [10.1016/S0010-2180(97)00051-5](https://doi.org/10.1016/S0010-2180(97)00051-5) |
| **PSI-23** | UNKNOWN | He Longtin, Tse Stephen D., Law Chung K. | Role of flamefront motion and criterion for global quasi-steadiness in droplet burning | [10.1016/S0082-0784(98)80038-6](https://doi.org/10.1016/S0082-0784(98)80038-6) |
| **PSI-23** | UNKNOWN | Sung C.J., Zhu D.L., Law C.K. | On micro-buoyancy spherical diffusion flames and a double luminous zone structure of the h | [10.1016/S0082-0784(98)80108-2](https://doi.org/10.1016/S0082-0784(98)80108-2) |
| **PSI-23** | UNKNOWN | Law C.K, Sung C.J | Structure, aerodynamics, and geometry of premixed flamelets | [10.1016/S0360-1285(00)00018-6](https://doi.org/10.1016/S0360-1285(00)00018-6) |
| **PSI-23** | UNKNOWN | Tse Stephen D, Zhu Delin, Sung Chih-Jen, | Microgravity burner-generated spherical diffusion flames: experiment and computation‡‡Curr | [10.1016/S0010-2180(01)00247-4](https://doi.org/10.1016/S0010-2180(01)00247-4) |
| **PSI-23** | UNKNOWN | Yoo S.W., Law C.K., Tse S.D. | Chemiluminescent OH* and CH* flame structure and aerodynamic scaling of weakly buoyant, ne | [10.1016/S1540-7489(02)80204-8](https://doi.org/10.1016/S1540-7489(02)80204-8) |
| **PSI-23** | UNKNOWN | Yoo S.W., Christiansen E.W., Law C.K. | Oscillatory extinction of spherical diffusion flames: Micro-buoyancy experiment and comput | [10.1016/S1540-7489(02)80008-6](https://doi.org/10.1016/S1540-7489(02)80008-6) |
| **PSI-23** | UNKNOWN | Law C. K., Sung C. J., Wang H., Lu T. F. | Development of Comprehensive Detailed and Reduced Reaction Mechanisms for Combustion Model | [10.2514/2.7289](https://doi.org/10.2514/2.7289) |
| **PSI-23** | UNKNOWN | Yoo S. W., Qian J., Bechtold J. K., Law  | Response of spherical diffusion flames under rotation with general Lewis numbers | [10.1080/13647830500098423](https://doi.org/10.1080/13647830500098423) |
| **PSI-23** | UNKNOWN | Yoo Sean W., Zhu Delin, Law Chung K. | Porous spherical burner for combustion experimentation | [10.1063/1.2212399](https://doi.org/10.1063/1.2212399) |
| **PSI-23** | UNKNOWN | Wang H.Y., Law C.K. | On intrinsic oscillation in radiation-affected diffusion flames | [10.1016/j.proci.2006.07.183](https://doi.org/10.1016/j.proci.2006.07.183) |
| **PSI-23** | UNKNOWN | Yoo S.W., Law C.K. | Effects of variable density on response of spherical diffusion flames under rotation | [10.1016/j.ijheatmasstransfer.2006.12.014](https://doi.org/10.1016/j.ijheatmasstransfer.2006.12.014) |
| **PSI-23** | UNKNOWN | Yang F., Law C.K., Sung C.J., Zhang H.Q. | A mechanistic study of Soret diffusion in hydrogen–air flames | [10.1016/j.combustflame.2009.09.018](https://doi.org/10.1016/j.combustflame.2009.09.018) |
| **PSI-23** | UNKNOWN | Akkerman V’yacheslav, Law Chung K., Bych | Self-similar accelerative propagation of expanding wrinkled flames and explosion triggerin | [10.1103/PhysRevE.83.026305](https://doi.org/10.1103/PhysRevE.83.026305) |
| **PSI-23** | UNKNOWN | Yoo Sean W., Chaudhuri Swetaprovo, Sacks | Response of spherical diffusion flames subjected to rotation: Microgravity experimentation | [10.1016/j.combustflame.2011.07.013](https://doi.org/10.1016/j.combustflame.2011.07.013) |
| **PSI-23** | UNKNOWN | Law Chung K. | Fuel Options for Next-Generation Chemical Propulsion | [10.2514/1.J051328](https://doi.org/10.2514/1.J051328) |
| **PSI-23** | UNKNOWN | Xin Yuxuan, Sung Chih-Jen, Law Chung K. | A mechanistic evaluation of Soret diffusion in heptane/air flames | [10.1016/j.combustflame.2012.03.005](https://doi.org/10.1016/j.combustflame.2012.03.005) |
| **PSI-23** | UNKNOWN | Wu Fujia, Jomaas Grunde, Law Chung K. | An experimental investigation on self-acceleration of cellular spherical flames | [10.1016/j.proci.2012.05.068](https://doi.org/10.1016/j.proci.2012.05.068) |
| **PSI-23** | UNKNOWN | Zhao Peng, Liang Wenkai, Deng Sili, Law  | Initiation and propagation of laminar premixed cool flames | [10.1016/j.fuel.2015.11.025](https://doi.org/10.1016/j.fuel.2015.11.025) |
| **PSI-23** | UNKNOWN | Yang Sheng, Zhu Delin, Law Chung K. | On colliding spherical flames: Morphology, corner dynamics, and flame-generated vorticity | [10.1016/j.combustflame.2015.10.029](https://doi.org/10.1016/j.combustflame.2015.10.029) |
| **PSI-23** | UNKNOWN | Liang Wenkai, Law Chung K. | Extended flammability limits of n-heptane/air mixtures with cool flames | [10.1016/j.combustflame.2017.06.015](https://doi.org/10.1016/j.combustflame.2017.06.015) |
| **PSI-23** | UNKNOWN | Liang Wenkai, Law Chung K. | Theory of first-stage ignition delay in hydrocarbon NTC chemistry | [10.1016/j.combustflame.2017.10.003](https://doi.org/10.1016/j.combustflame.2017.10.003) |
| **PSI-23** | UNKNOWN | Novoselov Alex G., Law Chung K., Mueller | Direct Numerical Simulation of turbulent nonpremixed “cool” flames: Applicability of flame | [10.1016/j.proci.2018.06.191](https://doi.org/10.1016/j.proci.2018.06.191) |
| **PSI-23** | UNKNOWN | Liang Wenkai, Law Chung K. | On Radical-Induced Ignition in Combustion Systems | [10.1146/annurev-chembioeng-060718-030141](https://doi.org/10.1146/annurev-chembioeng-060718-030141) |
| **PSI-23** | UNKNOWN | Xiong Gang, Gandhi Rahul, Zhong Xiaoshen | Binary collision of a burning droplet and a non-burning droplet of xylene: Outcome regimes | [10.1016/j.proci.2018.06.198](https://doi.org/10.1016/j.proci.2018.06.198) |
| **PSI-23** | UNKNOWN | Eng J., Law C., Zhu D. | Stabilization mechanisms and burning rates of cylindrical burner flames | [10.2514/6.1994-571](https://doi.org/10.2514/6.1994-571) |
| **PSI-23** | UNKNOWN | Sung C., Zhu D., Tse S., Law C. | On burner-supported, spherical diffusion flames under micro-buoyancy conditions | [10.2514/6.1998-563](https://doi.org/10.2514/6.1998-563) |
| **PSI-23** | UNKNOWN | SD Tse, DL Zhu, CJ Sung, CK Law | Microgravity burner-generated spherical diffusion flames - Experiment and computation | NTRS Open Access |
| **PSI-23** | UNKNOWN | Chen Shr-Jing, Tse Stephen | Thin-Flame Theory for Droplet Combustion at Low Grashof Numbers | [10.2514/6.2005-1140](https://doi.org/10.2514/6.2005-1140) |
| **PSI-23** | UNKNOWN | Wang Heyang, Bechtold John, Law Chung | Nonlinear Analysis of Pulsating Instabilities in Diffusion Flames | [10.2514/6.2005-544](https://doi.org/10.2514/6.2005-544) |
| **PSI-23** | UNKNOWN | Zhu Delin, Yoo Sean, Law C, Sacksteder K | An Experimental Study on the Response of Spherical Diffusion Flames Subjected to Rotation  | [10.2514/6.2005-1141](https://doi.org/10.2514/6.2005-1141) |
| **PSI-23** | UNKNOWN | Yang Fan, Law C.K., Sung C.J., Zhang Hui | A  Mechanistic Study of Soret Diffusion in Hydrogen-Air Flames | [10.2514/6.2009-988](https://doi.org/10.2514/6.2009-988) |
| **PSI-23** | UNKNOWN | YX Xin, CJ Sung, CK Law | A comprehensive evaluation of soret diffusion in heptane-air flames | NTRS Open Access |
| **PSI-23** | UNKNOWN | S Yoo, S Chaudhuri, K Sacksteder, P Zhan | Dynamics and morphology of spherical diffusion flames under rotation | [10.2514/6.2012-1251](https://doi.org/10.2514/6.2012-1251) |
| **PSI-23** | UNKNOWN | S Yang, S Chaudhuri, D Zhu, CK Law | Dynamics and morphology of colliding spherical flames | NTRS Open Access |
| **PSI-23** | UNKNOWN | SW Yoo | On the structure and dynamics of stationary and rotating spherical diffusion flames | NTRS Open Access |
| **PSI-23** | UNKNOWN | L Paxton | Weakly Buoyant Spherical Diffusion Flames: Properties of Hydrogen-CO Ethylene Flames | NTRS Open Access |
| **PSI-23** | UNKNOWN | T Xia | Computational Simulation of Spherical Diffusion Flame Dynamics and Extinction in Micrograv | NTRS Open Access |
| **PSI-23** | UNKNOWN | SA Gokoglu, DL Dietrich, DP Stocker, PV  | Combustion Science: A Researcher&#x27;s Guide to International Space Station | NTRS Open Access |
| **PSI-25** | UNKNOWN | Olson Sandra L., Ferkul Paul V. | Microgravity flammability boundary for PMMA rods in axial stagnation flow: Experimental re | [10.1016/j.combustflame.2017.03.001](https://doi.org/10.1016/j.combustflame.2017.03.001) |
| **PSI-25** | UNKNOWN | Bhattacharjee Subrata, Paolini Christoph | Temperature and CO2 fields of a downward spreading flame over thin cellulose: A comparison | [10.1016/j.proci.2014.05.093](https://doi.org/10.1016/j.proci.2014.05.093) |
| **PSI-25** | UNKNOWN | Bhattacharjee Subrata, Laue Matthew, Car | Opposed-flow flame spread: A comparison of microgravity and normal gravity experiments to  | [10.1016/j.firesaf.2015.11.011](https://doi.org/10.1016/j.firesaf.2015.11.011) |
| **PSI-25** | UNKNOWN | Bhattacharjee Subrata, Simsek Aslihan, O | The critical flow velocity for radiative extinction in opposed-flow flame spread in a micr | [10.1016/j.combustflame.2015.10.023](https://doi.org/10.1016/j.combustflame.2015.10.023) |
| **PSI-25** | UNKNOWN | Bhattacharjee Subrata, Tran Wynn, Laue M | Experimental validation of a correlation capturing the boundary layer effect on spread rat | [10.1016/j.proci.2014.06.125](https://doi.org/10.1016/j.proci.2014.06.125) |
| **PSI-25** | UNKNOWN | SL Olson, PV Ferkul, S Bhattacharjee, FJ | Results from on-board CSA-CP and CDM Sensor Readings during the Burning and Suppression of | NTRS Open Access |
| **PSI-25** | UNKNOWN | TJ Shah, FJ Miller, S Olson, I Wichman | Modeling and Analysis of Intermediate Thickness PMMA Sheets Burning in Microgravity Oppose | NTRS Open Access |
| **PSI-25** | UNKNOWN | X Zhao, JS Tien, PV Ferkul, S. Olson | Concurrent flame growth, spread and extinction over composite fabric samples in low speed  | NTRS Open Access |
| **PSI-25** | UNKNOWN | Bhattacharjee Subrata, Simsek Aslihan, M | Radiative, thermal, and kinetic regimes of opposed-flow flame spread: A comparison between | [10.1016/j.proci.2016.06.025](https://doi.org/10.1016/j.proci.2016.06.025) |
| **PSI-25** | UNKNOWN | Zhao Xiaoyang, Liao Ya-Ting T., Johnston | Concurrent flame growth, spread, and quenching over composite fabric samples in low speed  | [10.1016/j.proci.2016.06.028](https://doi.org/10.1016/j.proci.2016.06.028) |
| **PSI-25** | UNKNOWN | Pepper Jacob, Miller Fletcher, Olson San | A Study of the Effectiveness of a Narrow Channel Apparatus in Simulating Microgravity Flam | [10.2514/6.2012-3493](https://doi.org/10.2514/6.2012-3493) |
| **PSI-25** | UNKNOWN | J Marcum, S Olson, P Ferkul | BASS-II Summary Report | NTRS Open Access |
| **PSI-25** | UNKNOWN | JW Marcum, SL Olson, PV Ferkul | Correlation of normal gravity mixed convection blowoff limits with microgravity forced flo | NTRS Open Access |
| **PSI-25** | UNKNOWN | Hariharan Ashwin, Miller Fletcher, Olson | Fire in Microgravity | [10.1511/2016.118.44](https://doi.org/10.1511/2016.118.44) |
| **PSI-25** | UNKNOWN | SL Olson, PV Ferkul | Microgravity Flammability of PMMA Rods in Concurrent Flow | NTRS Open Access |
| **PSI-25** | UNKNOWN | G Bornand, G Sullivan, T Shah, F Miller | Using a Narrow Channel Apparatus to Study Thermally-Intermediate Fuel Combustion in a Simu | NTRS Open Access |
| **PSI-25** | UNKNOWN | SL Olson, PV Ferkul, S Bhattacharjee, FJ | Burning and Suppression of Solids – II Fire Safety Investigation for the Microgravity Scie | NTRS Open Access |
| **PSI-26** | UNKNOWN | Spivey Reggie, Luz Paul | The Microgravity Science Glovebox as a Platform for Exploration Research on the Internatio | [10.2514/6.2006-941](https://doi.org/10.2514/6.2006-941) |
| **PSI-26** | UNKNOWN | Bhattacharjee Subrata, Laue Matthew, Car | Opposed-flow flame spread: A comparison of microgravity and normal gravity experiments to  | [10.1016/j.firesaf.2015.11.011](https://doi.org/10.1016/j.firesaf.2015.11.011) |
| **PSI-26** | UNKNOWN | Takahashi Shuhei, Ebisawa Tomoya, Bhatta | Simplified model for predicting difference between flammability limits of a thin material  | [10.1016/j.proci.2014.07.017](https://doi.org/10.1016/j.proci.2014.07.017) |
| **PSI-26** | UNKNOWN | S Bhattacharjee, R Nagarkar, Y Nakamura | A Correlation for an Effective Flow Velocity for Capturing the Boundary Layer Effect in Op | [10.1080/00102202.2014.900056](https://doi.org/10.1080/00102202.2014.900056) |
| **PSI-26** | UNKNOWN | Bhattacharjee Subrata, Paolini Christoph | Radiation signature in opposed-flow flame spread | [10.1504/PCFD.2012.048249](https://doi.org/10.1504/PCFD.2012.048249) |
| **PSI-26** | UNKNOWN | Bhattacharjee Subrata, Cartnignani Luca | OS24-1 The Effect of Boundary Layer on Blow-Off Extinction in Opposed-Flow Flame Spread: R | [10.1299/jsmeatem.2015.14.289](https://doi.org/10.1299/jsmeatem.2015.14.289) |
| **PSI-26** | UNKNOWN | JR Villaraza, L Carmignani, S Bhattachar | Role of Gas Radiation in the Mechanism of Opposed-Flow Flame Spread in a Microgravity Envi | NTRS Open Access |
| **PSI-26** | UNKNOWN | P Ferkul, SL Olson, F Takahashi, M Endo, | Thickness and Fuel Preheating Effects on Material Flammability in Microgravity from the BA | NTRS Open Access |
| **PSI-26** | UNKNOWN | S Bhattacharjee, M Bundy, C Paolini, G P | A novel apparatus for flame spread study | [10.1016/j.proci.2012.05.076](https://doi.org/10.1016/j.proci.2012.05.076) |
| **PSI-26** | UNKNOWN | GR Bornand, FJ Miller, JM Pepper, SL Ols | Opposed-Flow Flame Spread in a Narrow Channel Apparatus over Thin PMMA Sheets | NTRS Open Access |
| **PSI-39** | UNKNOWN | V Nayagam, DL Dietrich, PV Ferkul, MC Hi | Can cool flames support quasi-steady alkane droplet burning? | [10.1016/j.combustflame.2012.07.012](https://doi.org/10.1016/j.combustflame.2012.07.012) |
| **PSI-39** | UNKNOWN | V Nayagam, DL Dietrich, MC Hicks, FA Wil | Cool-flame extinction during n-alkane droplet combustion in microgravity | [10.1016/j.combustflame.2015.01.012](https://doi.org/10.1016/j.combustflame.2015.01.012) |
| **PSI-39** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Willi | Partial-Burning Regime for Quasi-Steady Droplet Combustion Supported by Cool Flames | [10.2514/1.J054437](https://doi.org/10.2514/1.J054437) |
| **PSI-39** | UNKNOWN | Paczko Guenter, Peters Norbert, Seshadri | The role of cool-flame chemistry in quasi-steady combustion and extinction of n-heptane dr | [10.1080/13647830.2014.934296](https://doi.org/10.1080/13647830.2014.934296) |
| **PSI-39** | UNKNOWN | Seshadri Kalyanasundaram, Peters Norbert | Asymptotic analysis of quasi-steady n-heptane droplet combustion supported by cool-flame c | [10.1080/13647830.2016.1248494](https://doi.org/10.1080/13647830.2016.1248494) |
| **PSI-39** | UNKNOWN | Rachel Barry | Science in Short: Cool Flames | NTRS Open Access |
| **PSI-39** | UNKNOWN | Dietrich Daniel, Krause Timmothy, Nayaga | Low Temperature n-Dodecane Droplet Combustion Experiments Aboard the International Space S | [10.1007/s12217-024-10115-x](https://doi.org/10.1007/s12217-024-10115-x) |
| **PSI-68** | UNKNOWN | YC Liu, CT Avedisian, KN Trenou, JK Rah, | Experimental Study of Initial Diameter Effects on Convection-free Droplet Combustion in th | [10.2514/6.2014-1019](https://doi.org/10.2514/6.2014-1019) |
| **PSI-68** | UNKNOWN | FE Alam, YC Liu, CT Avedisian, FL Dryer, | n-Butanol droplet combustion: Numerical modeling and reduced gravity experiments | NTRS Open Access |
| **PSI-68** | UNKNOWN | Dietrich Daniel L., Nayagam Vedha, Hicks | Droplet Combustion Experiments Aboard the International Space Station | [10.1007/s12217-014-9372-2](https://doi.org/10.1007/s12217-014-9372-2) |
| **PSI-68** | UNKNOWN | TI Farouk, MC Hicks, FL Dryer | Multistage oscillatory “Cool Flame” behavior for isolated alkane droplet combustion in ele | NTRS Open Access |
| **PSI-68** | UNKNOWN | N Ghata, BD Shaw | Computational modeling of the effects of support fibers on evaporation of fiber-supported  | NTRS Open Access |
| **PSI-68** | UNKNOWN | Shaw Benjamin D., Vang Chang L. | Oxygen Lewis Number Effects on Reduced Gravity Combustion of Methanol and Heptane Droplets | [10.1080/00102202.2015.1072176](https://doi.org/10.1080/00102202.2015.1072176) |
| **PSI-68** | UNKNOWN | Shaw Benjamin D. | ISS Droplet Combustion Experiments - Uncertainties in Droplet Sizes and Burning Rates | [10.1007/s12217-014-9377-x](https://doi.org/10.1007/s12217-014-9377-x) |
| **PSI-68** | UNKNOWN | Xu Yuhao, Avedisian C. Thomas | Combustion of Butanol, Gasoline, and Butanol/Gasoline Mixture Droplets | [10.1021/acs.energyfuels.5b00158](https://doi.org/10.1021/acs.energyfuels.5b00158) |
| **PSI-68** | UNKNOWN | Ghata Narugopal, Shaw Benjamin D. | Computational Modeling of Unsupported and Fiber-Supported n-Heptane Droplet Combustion in  | [10.1080/00102202.2014.971950](https://doi.org/10.1080/00102202.2014.971950) |
| **PSI-68** | UNKNOWN | YC Liu, Y Xu, CT Avedisian, MC Hicks | The effect of support fibers on micro-convection in droplet combustion experiments | NTRS Open Access |
| **PSI-68** | UNKNOWN | V Nayagam, DL Dietrich, MC Hicks, FA Wil | Cool-flame extinction during n-alkane droplet combustion in microgravity | NTRS Open Access |
| **PSI-68** | UNKNOWN | JC Prince, FA Williams, GE Ovando | A short mechanism for the low-temperature ignition of n-heptane at high pressures | NTRS Open Access |
| **PSI-68** | UNKNOWN | Paczko Guenter, Peters Norbert, Seshadri | The role of cool-flame chemistry in quasi-steady combustion and extinction of n-heptane dr | [10.1080/13647830.2014.934296](https://doi.org/10.1080/13647830.2014.934296) |
| **PSI-68** | UNKNOWN | Aharon I., Tam V. K., Shaw B. D. | Combustion of Submillimeter Heptane/Methanol and Heptane/Ethanol Droplets in Reduced Gravi | [10.1155/2013/154202](https://doi.org/10.1155/2013/154202) |
| **PSI-68** | UNKNOWN | Farouk Tanvir I., Dryer Frederick L. | Isolated n-heptane droplet combustion in microgravity: “Cool Flames” – Two-stage combustio | [10.1016/j.combustflame.2013.09.011](https://doi.org/10.1016/j.combustflame.2013.09.011) |
| **PSI-68** | UNKNOWN | Farouk T.I., Liu Y.C., Savas A.J., Avedi | Sub-millimeter sized methyl butanoate droplet combustion: Microgravity experiments and det | [10.1016/j.proci.2012.07.074](https://doi.org/10.1016/j.proci.2012.07.074) |
| **PSI-68** | UNKNOWN | YC Liu, T Farouk, AJ Savas, FL Dryer, CT | On the spherically symmetrical combustion of methyl decanoate droplets and comparisons wit | NTRS Open Access |
| **PSI-68** | UNKNOWN | YC Liu, AJ Savas, CT Avedisian | The spherically symmetric droplet burning characteristics of Jet-A and biofuels derived fr | NTRS Open Access |
| **PSI-68** | UNKNOWN | YC Liu, AJ Savas, CT Avedisian | Spherically symmetric droplet combustion of three and four component miscible mixtures as  | NTRS Open Access |
| **PSI-68** | UNKNOWN | Dembia Christopher Lee, Liu Yu Cheng, Av | AUTOMATED DATA ANALYSIS FOR CONSECUTIVE IMAGES FROM DROPLET COMBUSTION EXPERIMENTS | [10.5566/ias.v31.p137-148](https://doi.org/10.5566/ias.v31.p137-148) |
| **PSI-68** | UNKNOWN | Farouk Tanvir I., Dryer Frederick L. | On the extinction characteristics of alcohol droplet combustion under microgravity conditi | [10.1016/j.combustflame.2012.04.005](https://doi.org/10.1016/j.combustflame.2012.04.005) |
| **PSI-68** | UNKNOWN | Liu Yu Cheng, Avedisian C. Thomas | A comparison of the spherical flame characteristics of sub-millimeter droplets of binary m | [10.1016/j.combustflame.2011.08.015](https://doi.org/10.1016/j.combustflame.2011.08.015) |
| **PSI-68** | UNKNOWN | Liu Yu Cheng, Savas Anthony J., Avedisia | Comparison of the Burning Characteristics of Indolene and Commercial Grade Gasoline Drople | [10.1021/ef3007849](https://doi.org/10.1021/ef3007849) |
| **PSI-68** | UNKNOWN | V Nayagam, DL Dietrich, PV Ferkul, MC Hi | Can cool flames support quasi-steady alkane droplet burning? | [10.1016/j.combustflame.2012.07.012](https://doi.org/10.1016/j.combustflame.2012.07.012) |
| **PSI-68** | UNKNOWN | Shaw B. D., Wang D. F. | Experiments on Submillimeter Free Droplet Flame Extinction | [10.1080/00102202.2012.759946](https://doi.org/10.1080/00102202.2012.759946) |
| **PSI-68** | UNKNOWN | D Shringi, HA Dwyer, BD Shaw | Influences of support fibers on vaporizing fuel droplets | NTRS Open Access |
| **PSI-68** | UNKNOWN | Shaw Benjamin, Wei Jingbin | Combustion of Methanol Droplets in Air-Diluent Environments with Reduced and Normal Gravit | [10.1155/2012/587987](https://doi.org/10.1155/2012/587987) |
| **PSI-68** | UNKNOWN | Farouk T., Dryer F. L. | Microgravity droplet combustion: effect of tethering fiber on burning rate and flame struc | [10.1080/13647830.2010.547601](https://doi.org/10.1080/13647830.2010.547601) |
| **PSI-68** | UNKNOWN | Shaw B. D., Wei J. B. | Influence of Gravity and Ambient Pressure on Combustion and Flammability of n-Heptane and  | [10.1080/00102202.2010.498798](https://doi.org/10.1080/00102202.2010.498798) |
| **PSI-68** | UNKNOWN | Dzik Justin, Nayagam Vedha, Williams For | Ignition and combustion of n-heptane droplets in carbon dioxide enriched environments | [10.1016/j.icheatmasstransfer.2009.10.006](https://doi.org/10.1016/j.icheatmasstransfer.2009.10.006) |
| **PSI-68** | UNKNOWN | Jin Y., Shaw B.D. | Computational modeling of n-heptane droplet combustion in air–diluent environments under r | [10.1016/j.ijheatmasstransfer.2010.08.005](https://doi.org/10.1016/j.ijheatmasstransfer.2010.08.005) |
| **PSI-68** | UNKNOWN | Yan Jin, Shaw Benjamin D. | Numerical Simulation of Unsteady Flows and Shape Oscillations in Liquid Droplets Induced b | [10.1007/s12217-008-9096-2](https://doi.org/10.1007/s12217-008-9096-2) |
| **PSI-68** | UNKNOWN | Bae J.H., Avedisian C.T. | Nonane droplet combustion with and without buoyant convection: Flame structure, burning ra | [10.1016/j.proci.2008.06.221](https://doi.org/10.1016/j.proci.2008.06.221) |
| **PSI-68** | UNKNOWN | Xiao J.S., Wei J.B., Shaw B.D., Peng Z. | Temperature and fiber optic spectroscopy composition measurements of heated propanol–aceto | [10.1016/j.optlaseng.2009.05.004](https://doi.org/10.1016/j.optlaseng.2009.05.004) |
| **PSI-68** | UNKNOWN | DS Shringi, BD Shaw, HA Dwyer | Laser-induced fluorescence imaging of acetone inside evaporating and burning fuel droplets | NTRS Open Access |
| **PSI-68** | UNKNOWN | Wei J. B., Shaw B. D. | Reduced Gravity Combustion of Propanol Droplets in Oxygen-Inert Environments | [10.1080/00102200903190851](https://doi.org/10.1080/00102200903190851) |
| **PSI-68** | UNKNOWN | SHAW B. D., WEI J. B. | PROPANOL DROPLET FLAMMABILITY AND COMBUSTION IN AIR-DILUENT ENVIRONMENTS UNDER NORMAL AND  | [10.1080/00102200601057394](https://doi.org/10.1080/00102200601057394) |
| **PSI-68** | UNKNOWN | Avedisian C. Thomas | Developing Surrogates for Liquid Transportation Fuels: The Role of Spherically Symmetric D | [10.1007/978-81-322-2211-8_16](https://doi.org/10.1007/978-81-322-2211-8_16) |
| **PSI-68** | UNKNOWN | Dietrich D. L., Calabria R., Massoli P., | Experimental Observations of the Low-Temperature Burning of Decane/Hexanol Droplets in Mic | [10.1080/00102202.2016.1225730](https://doi.org/10.1080/00102202.2016.1225730) |
| **PSI-68** | UNKNOWN | Williams Forman A., Nayagam Vedha | Cool-flame dodecane-droplet extinction diameters | [10.1016/j.combustflame.2019.10.036](https://doi.org/10.1016/j.combustflame.2019.10.036) |
| **PSI-68** | UNKNOWN | Williams Forman A., Nayagam Vedha | Quasi-steady combustion of normal-alkane droplets supported by Cool-Flame chemistry near d | [10.1080/13647830.2019.1588380](https://doi.org/10.1080/13647830.2019.1588380) |
| **PSI-68** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Willi | Radiative extinction of burner-supported spherical diffusion flames: A scaling analysis | [10.1016/j.combustflame.2019.04.027](https://doi.org/10.1016/j.combustflame.2019.04.027) |
| **PSI-68** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Willi | Unsteady droplet combustion with fuel thermal expansion | [10.1016/j.combustflame.2018.01.035](https://doi.org/10.1016/j.combustflame.2018.01.035) |
| **PSI-68** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Hicks | Radiative extinction of large n-alkane droplets in oxygen-inert mixtures in microgravity | [10.1016/j.combustflame.2018.04.023](https://doi.org/10.1016/j.combustflame.2018.04.023) |
| **PSI-68** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Willi | A Burke-Schumann analysis of dual-flame structure supported by a burning droplet | [10.1016/j.icheatmasstransfer.2017.06.016](https://doi.org/10.1016/j.icheatmasstransfer.2017.06.016) |
| **PSI-68** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Willi | A Burke–Schumann analysis of diffusion-flame structures supported by a burning droplet | [10.1080/13647830.2017.1280182](https://doi.org/10.1080/13647830.2017.1280182) |
| **PSI-68** | UNKNOWN | RB Rasul, CT Avedisian, Y Xu, MC Hicks,  | Dynamic Differential Image Circle Diameter Measurement Precision Assessment: Application t | NTRS Open Access |
| **PSI-68** | UNKNOWN | Yu Fei, Shaw Benjamin D. | Interpretation of Backlit Droplet Images from ISS Droplet Combustion Experiments | [10.2478/gsr-2014-0007](https://doi.org/10.2478/gsr-2014-0007) |
| **PSI-69** | UNKNOWN | V Nayagam, DL Dietrich, MC Hicks, FA Wil | Methanol Droplet Combustion in Oxygen-Inert Environments in Microgravity | NTRS Open Access |
| **PSI-69** | UNKNOWN | V. Nayagam | Methanol Droplet Extinction in Oxygen/Carbon-dioxide/Nitrogen Mixtures in Microgravity: Re | NTRS Open Access |
| **PSI-69** | UNKNOWN | Farouk Tanvir, Dryer Frederick | A Numerical Study On The Extinction Characteristics Of Droplet Combustion Under Microgravi | [10.2514/6.2012-1252](https://doi.org/10.2514/6.2012-1252) |
| **PSI-69** | UNKNOWN | Farouk Tanvir, Dryer Frederick L. | Tethered methanol droplet combustion in carbon-dioxide enriched environment under microgra | [10.1016/j.combustflame.2011.06.014](https://doi.org/10.1016/j.combustflame.2011.06.014) |
| **PSI-69** | UNKNOWN | JM Hickman, DL Dietrich, MC Hicks, V Nay | FLEX: A Decisive Step Forward in NASA's Combustion Research Program | NTRS Open Access |
| **PSI-69** | UNKNOWN | MC Hicks, DL Dietrich, V Nayagam, FA Wil | Dynamics of Water Absorption and Evaporation During Methanol Droplet Combustion in Microgr | NTRS Open Access |
| **PSI-69** | UNKNOWN | Nayagam Vedha | Activation energy asymptotics for methanol droplet extinction in microgravity | [10.1016/j.combustflame.2013.05.011](https://doi.org/10.1016/j.combustflame.2013.05.011) |
| **PSI-69** | UNKNOWN | Liu Yu Cheng, Rah Jeff K., Trenou Koffi  | Experimental Study of Initial Diameter Effects on Convection-free Droplet Combustion in th | [10.2514/6.2014-1019](https://doi.org/10.2514/6.2014-1019) |
| **PSI-69** | UNKNOWN | Farouk Tanvir I., Dryer Frederick L. | Isolated n-heptane droplet combustion in microgravity: “Cool Flames” – Two-stage combustio | [10.1016/j.combustflame.2013.09.011](https://doi.org/10.1016/j.combustflame.2013.09.011) |
| **PSI-69** | UNKNOWN | Urzay Javier, Nayagam Vedha, Williams Fo | Theory of the propagation dynamics of spiral edges of diffusion flames in von Kármán swirl | [10.1016/j.combustflame.2010.08.015](https://doi.org/10.1016/j.combustflame.2010.08.015) |
| **PSI-69** | UNKNOWN | Nayagam Vedha, Williams F. A. | Analysis of the melt phase of a rotating polymer disc supporting a diffusion flame | [10.1017/jfm.2011.349](https://doi.org/10.1017/jfm.2011.349) |
| **PSI-69** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Willi | Partial-Burning Regime for Quasi-Steady Droplet Combustion Supported by Cool Flames | [10.2514/1.J054437](https://doi.org/10.2514/1.J054437) |
| **PSI-69** | UNKNOWN | Seshadri Kalyanasundaram, Peters Norbert | Asymptotic analysis of quasi-steady n-heptane droplet combustion supported by cool-flame c | [10.1080/13647830.2016.1248494](https://doi.org/10.1080/13647830.2016.1248494) |
| **PSI-69** | UNKNOWN | Alam Fahd E., Liu Y.C., Avedisian C.T.,  | n-Butanol droplet combustion: Numerical modeling and reduced gravity experiments | [10.1016/j.proci.2014.06.043](https://doi.org/10.1016/j.proci.2014.06.043) |
| **PSI-69** | UNKNOWN | Dietrich Daniel L., Nayagam Vedha, Hicks | Droplet Combustion Experiments Aboard the International Space Station | [10.1007/s12217-014-9372-2](https://doi.org/10.1007/s12217-014-9372-2) |
| **PSI-69** | UNKNOWN | N Ghata, BD Shaw | Computational modeling of the effects of support fibers on evaporation of fiber-supported  | NTRS Open Access |
| **PSI-69** | UNKNOWN | Shaw Benjamin D., Vang Chang L. | Oxygen Lewis Number Effects on Reduced Gravity Combustion of Methanol and n-Heptane Drople | [10.1080/00102202.2015.1072176](https://doi.org/10.1080/00102202.2015.1072176) |
| **PSI-69** | UNKNOWN | Shaw Benjamin D. | ISS Droplet Combustion Experiments - Uncertainties in Droplet Sizes and Burning Rates | [10.1007/s12217-014-9377-x](https://doi.org/10.1007/s12217-014-9377-x) |
| **PSI-69** | UNKNOWN | Xu Yuhao, Avedisian C. Thomas | Combustion of n-Butanol, Gasoline, and n-Butanol/Gasoline Mixture Droplets | [10.1021/acs.energyfuels.5b00158](https://doi.org/10.1021/acs.energyfuels.5b00158) |
| **PSI-69** | UNKNOWN | Ghata Narugopal, Shaw Benjamin D. | Computational Modeling of Unsupported and Fiber-Supported n-Heptane Droplet Combustion in  | [10.1080/00102202.2014.971950](https://doi.org/10.1080/00102202.2014.971950) |
| **PSI-69** | UNKNOWN | Liu Y.C., Xu Y., Avedisian C.T., Hicks M | The effect of support fibers on micro-convection in droplet combustion experiments | [10.1016/j.proci.2014.07.022](https://doi.org/10.1016/j.proci.2014.07.022) |
| **PSI-69** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Hicks | Cool-flame extinction during n-alkane droplet combustion in microgravity | [10.1016/j.combustflame.2015.01.012](https://doi.org/10.1016/j.combustflame.2015.01.012) |
| **PSI-69** | UNKNOWN | Prince Juan C., Williams Forman A., Ovan | A short mechanism for the low-temperature ignition of n-heptane at high pressures | [10.1016/j.fuel.2014.08.063](https://doi.org/10.1016/j.fuel.2014.08.063) |
| **PSI-69** | UNKNOWN | Paczko Guenter, Peters Norbert, Seshadri | The role of cool-flame chemistry in quasi-steady combustion and extinction of n-heptane dr | [10.1080/13647830.2014.934296](https://doi.org/10.1080/13647830.2014.934296) |
| **PSI-69** | UNKNOWN | Aharon I., Tam V. K., Shaw B. D. | Combustion of Submillimeter Heptane/Methanol and Heptane/Ethanol Droplets in Reduced Gravi | [10.1155/2013/154202](https://doi.org/10.1155/2013/154202) |
| **PSI-69** | UNKNOWN | Farouk T.I., Liu Y.C., Savas A.J., Avedi | Sub-millimeter sized methyl butanoate droplet combustion: Microgravity experiments and det | [10.1016/j.proci.2012.07.074](https://doi.org/10.1016/j.proci.2012.07.074) |
| **PSI-69** | UNKNOWN | Liu Yu Cheng, Farouk Tanvir, Savas Antho | On the spherically symmetrical combustion of methyl decanoate droplets and comparisons wit | [10.1016/j.combustflame.2012.11.006](https://doi.org/10.1016/j.combustflame.2012.11.006) |
| **PSI-69** | UNKNOWN | Liu Yu Cheng, Savas Anthony J., Avedisia | The spherically symmetric droplet burning characteristics of Jet-A and biofuels derived fr | [10.1016/j.fuel.2013.02.025](https://doi.org/10.1016/j.fuel.2013.02.025) |
| **PSI-69** | UNKNOWN | Liu Yu Cheng, Savas Anthony J., Thomas A | Spherically symmetric droplet combustion of three and four component miscible mixtures as  | [10.1016/j.proci.2012.05.065](https://doi.org/10.1016/j.proci.2012.05.065) |
| **PSI-69** | UNKNOWN | Dembia Christopher Lee, Liu Yu Cheng, Av | AUTOMATED DATA ANALYSIS FOR CONSECUTIVE IMAGES FROM DROPLET COMBUSTION EXPERIMENTS | [10.5566/ias.v31.p137-148](https://doi.org/10.5566/ias.v31.p137-148) |
| **PSI-69** | UNKNOWN | Farouk Tanvir I., Dryer Frederick L. | On the extinction characteristics of alcohol droplet combustion under microgravity conditi | [10.1016/j.combustflame.2012.04.005](https://doi.org/10.1016/j.combustflame.2012.04.005) |
| **PSI-69** | UNKNOWN | Liu Yu Cheng, Avedisian C. Thomas | A comparison of the spherical flame characteristics of sub-millimeter droplets of binary m | [10.1016/j.combustflame.2011.08.015](https://doi.org/10.1016/j.combustflame.2011.08.015) |
| **PSI-69** | UNKNOWN | Liu Yu Cheng, Savas Anthony J., Avedisia | Comparison of the Burning Characteristics of Indolene and Commercial Grade Gasoline Drople | [10.1021/ef3007849](https://doi.org/10.1021/ef3007849) |
| **PSI-69** | UNKNOWN | Nayagam Vedha, Dietrich Daniel L., Ferku | Can cool flames support quasi-steady alkane droplet burning? | [10.1016/j.combustflame.2012.07.012](https://doi.org/10.1016/j.combustflame.2012.07.012) |
| **PSI-69** | UNKNOWN | Shaw B. D., Wang D. F. | Experiments on Submillimeter Free Droplet Flame Extinction | [10.1080/00102202.2012.759946](https://doi.org/10.1080/00102202.2012.759946) |
| **PSI-69** | UNKNOWN | Shringi D., Dwyer H.A., Shaw B.D. | Influences of support fibers on vaporizing fuel droplets | [10.1016/j.compfluid.2013.02.005](https://doi.org/10.1016/j.compfluid.2013.02.005) |
| **PSI-69** | UNKNOWN | Shringi D., Dwyer H.A., Shaw B.D. | Numerical studies of flows over liquid droplets on cylindrical fibers | [10.1016/j.compfluid.2013.02.011](https://doi.org/10.1016/j.compfluid.2013.02.011) |
| **PSI-69** | UNKNOWN | Yu Fei, Shaw Benjamin D. | Interpretation of Backlit Droplet Images from ISS Droplet Combustion Experiments | [10.2478/gsr-2014-0007](https://doi.org/10.2478/gsr-2014-0007) |
| **PSI-69** | UNKNOWN | BD Shaw, J Wei | Combustion of Methanol Droplets in Air-Diluent Environments with Reduced and Normal Gravit | [10.1155/2012/587987](https://doi.org/10.1155/2012/587987) |
| **PSI-69** | UNKNOWN | Farouk T., Dryer F. L. | Microgravity droplet combustion: effect of tethering fiber on burning rate and flame struc | [10.1080/13647830.2010.547601](https://doi.org/10.1080/13647830.2010.547601) |
| **PSI-69** | UNKNOWN | Shaw B. D., Wei J. B. | Influence of Gravity and Ambient Pressure on Combustion and Flammability of n-Heptane and  | [10.1080/00102202.2010.498798](https://doi.org/10.1080/00102202.2010.498798) |
| **PSI-69** | UNKNOWN | Dzik Justin, Nayagam Vedha, Williams For | Ignition and combustion of n-heptane droplets in carbon dioxide enriched environments | [10.1016/j.icheatmasstransfer.2009.10.006](https://doi.org/10.1016/j.icheatmasstransfer.2009.10.006) |
| **PSI-69** | UNKNOWN | Jin Y., Shaw B.D. | Computational modeling of n-heptane droplet combustion in air–diluent environments under r | [10.1016/j.ijheatmasstransfer.2010.08.005](https://doi.org/10.1016/j.ijheatmasstransfer.2010.08.005) |
| **PSI-69** | UNKNOWN | Yan Jin, Shaw Benjamin D. | Numerical Simulation of Unsteady Flows and Shape Oscillations in Liquid Droplets Induced b | [10.1007/s12217-008-9096-2](https://doi.org/10.1007/s12217-008-9096-2) |
| **PSI-69** | UNKNOWN | Bae J.H., Avedisian C.T. | Nonane droplet combustion with and without buoyant convection: Flame structure, burning ra | [10.1016/j.proci.2008.06.221](https://doi.org/10.1016/j.proci.2008.06.221) |
| **PSI-69** | UNKNOWN | Xiao J.S., Wei J.B., Shaw B.D., Peng Z. | Temperature and fiber optic spectroscopy composition measurements of heated propanol–aceto | [10.1016/j.optlaseng.2009.05.004](https://doi.org/10.1016/j.optlaseng.2009.05.004) |
| **PSI-69** | UNKNOWN | Shringi D.S., Shaw B.D., Dwyer H.A. | Laser-induced fluorescence imaging of acetone inside evaporating and burning fuel droplets | [10.1016/j.optlaseng.2008.08.002](https://doi.org/10.1016/j.optlaseng.2008.08.002) |
| **PSI-69** | UNKNOWN | Wei J. B., Shaw B. D. | Reduced Gravity Combustion of Propanol Droplets in Oxygen-Inert Environments | [10.1080/00102200903190851](https://doi.org/10.1080/00102200903190851) |
| **PSI-69** | UNKNOWN | SHAW B. D., WEI J. B. | PROPANOL DROPLET FLAMMABILITY AND COMBUSTION IN AIR-DILUENT ENVIRONMENTS UNDER NORMAL AND  | [10.1080/00102200601057394](https://doi.org/10.1080/00102200601057394) |
| **PSI-69** | UNKNOWN | Avedisian C. Thomas | Developing Surrogates for Liquid Transportation Fuels: The Role of Spherically Symmetric D | [10.1007/978-81-322-2211-8_16](https://doi.org/10.1007/978-81-322-2211-8_16) |
| **PSI-69** | UNKNOWN | DL Dietrich, VM Bryg, PV Ferkul, FA Will | Detailed results from the flame extinugishment experiment (FLEX) - March 2009 to December  | NTRS Open Access |
| **PSI-98** | UNKNOWN | W Schoren, GA Ruff, DL Urban | The Spacecraft Fire Experiment (Saffire) - Objectives, Development and Status | NTRS Open Access |
| **PSI-98** | UNKNOWN | JE Niehaus, PV Ferkul, SA Gokoglu, GA Ru | Buoyant Effects on the Flammability of Silicone Samples Planned for the Spacecraft Fire Ex | NTRS Open Access |
| **PSI-98** | UNKNOWN | Urban David L., Ferkul Paul, Olson Sandr | Flame spread: Effects of microgravity and scale | [10.1016/j.combustflame.2018.10.012](https://doi.org/10.1016/j.combustflame.2018.10.012) |
| **PSI-98** | UNKNOWN | Li Chengyao, Liao Ya-Ting T., T'ien Jame | Transient flame growth and spread processes over a large solid fabric in concurrent low-sp | [10.1016/j.proci.2018.05.168](https://doi.org/10.1016/j.proci.2018.05.168) |
| **PSI-98** | UNKNOWN | Jomaas Grunde, Torero Jose L., Eigenbrod | Fire safety in space – beyond flammability testing of small samples | [10.1016/j.actaastro.2014.11.025](https://doi.org/10.1016/j.actaastro.2014.11.025) |
| **PSI-98** | UNKNOWN | Gary A. Ruff and David L. Urban. | Operation and Development Status of the Spacecraft Fire Experiments (Saffire) | NTRS Open Access |
| **PSI-99** | UNKNOWN | JE Niehaus, PV Ferkul, SA Gokoglu, GA Ru | Buoyant Effects on the Flammability of Silicone Samples Planned for the Spacecraft Fire Ex | NTRS Open Access |
| **PSI-99** | UNKNOWN | W Schoren, GA Ruff, DL Urban | The Spacecraft Fire Experiment (Saffire) - Objectives, Development and Status | NTRS Open Access |
| **PSI-99** | UNKNOWN | Urban David L., Ferkul Paul, Olson Sandr | Flame spread: Effects of microgravity and scale | [10.1016/j.combustflame.2018.10.012](https://doi.org/10.1016/j.combustflame.2018.10.012) |
| **PSI-99** | UNKNOWN | Thomsen Maria, Fernandez-Pello Carlos, R | Buoyancy effects on concurrent flame spread over thick PMMA | [10.1016/j.combustflame.2018.10.016](https://doi.org/10.1016/j.combustflame.2018.10.016) |
| **PSI-99** | UNKNOWN | Olson Sandra L., Urban David L., Ruff Ga | Concurrent Flame Spread Over Two-Sided Thick PMMA Slabs in Microgravity | [10.1007/s10694-019-00863-3](https://doi.org/10.1007/s10694-019-00863-3) |
| **PSI-99** | UNKNOWN | Li Chengyao, Liao Ya-Ting T., T'ien Jame | Transient flame growth and spread processes over a large solid fabric in concurrent low-sp | [10.1016/j.proci.2018.05.168](https://doi.org/10.1016/j.proci.2018.05.168) |
| **PSI-99** | UNKNOWN | Wang Xiaoliang, Zhou Hao, Arnott W. Patr | Evaluation of gas and particle sensors for detecting spacecraft-relevant fire emissions | [10.1016/j.firesaf.2020.102977](https://doi.org/10.1016/j.firesaf.2020.102977) |