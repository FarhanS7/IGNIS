# M4 FLEX Droplet Extinction Data Inspection and Schema Audit

**Document Status:** Complete Dataset Inspection and Circularity Audit  
**Dataset:** NASA PSI-69 (FLEX) and PSI-68 (FLEX-2) Droplet Combustion Experiments  
**Target Application:** M4 Extinction-Threshold Model (IGNIS Fire Response Console)  
**Date:** 2026-11-04  

---

## 1. Executive Summary

This document audits the NASA Flame Extinction Experiment (FLEX, PSI-69) and FLEX-2 (PSI-68) flight data residing in `data/processed/evidence_runs.json` and `data/raw/PSI-69_Experimental table_FLEX.csv`.

FLEX investigated the flammability limits and spherical droplet flame extinction dynamics of isolated fuel droplets in microgravity aboard the International Space Station (ISS) in the Multi-user Droplet Combustion Apparatus (MDCA) chamber within the Combustion Integrated Rack (CIR).

### Key Inspection Findings:
1. **Total Usable Runs:** 274 microgravity droplet combustion runs in PSI-69 with complete environmental gas mixtures, pressure, and test outcomes.
2. **Fuels Evaluated:** 
   - **Methanol ($CH_3OH$):** 157 runs (polar alcohol, sooting-resistant, clean blue flame)
   - **Heptane ($n-C_7H_{16}$):** 117 runs (alkane hydrocarbon, heavily sooting, radiative yellow flame)
3. **Atmospheric Diluents:**
   - **Carbon Dioxide ($CO_2$):** 0.00 to 0.70 mole fraction (0% to 70%)
   - **Nitrogen ($N_2$):** 0.09 to 0.88 mole fraction (9% to 88%)
   - **Helium ($He$):** 0.00 to 0.45 mole fraction (0% to 45%)
4. **Oxygen Concentration:** 0.12 to 0.34 mole fraction (12% to 34% $O_2$).
5. **Chamber Pressure:** 0.0 to 2320 mmHg (~0.0 to 3.05 atm / 0 to 309 kPa; median 759.6 mmHg = 101.3 kPa).
6. **Initial Droplet Diameter:** 1.10 mm to 4.67 mm (median 3.01 mm).

---

## 2. Telemetry Schema & Physical Channel Mapping

| Column in PSI-69 Table | Standard Field | Engineering Units | Valid Physical Range | Role in M4 Model |
|---|---|---|---|---|
| `Fuel` | `fuel` | Categorical | `Methanol`, `Heptane` | Fuel chemical class identifier |
| `O initial ambient composition...` | `oxygen_pct` | Mole Fraction ($X_{O2}$) | 0.120 to 0.340 (12–34%) | Critical oxidizer fraction |
| `CO initial ambient composition...` | `co2_pct` | Mole Fraction ($X_{CO2}$) | 0.000 to 0.700 (0–70%) | Thermal & radiative diluent ($CO_2$) |
| `He initial ambient composition...` | `he_pct` | Mole Fraction ($X_{He}$) | 0.000 to 0.450 (0–45%) | High-thermal-conductivity diluent ($He$) |
| `N initial ambient composition...` | `n2_pct` | Mole Fraction ($X_{N2}$) | 0.090 to 0.880 (9–88%) | Inert buffer diluent ($N_2$) |
| `Ambient pressure; mmHg` | `pressure_kpa` | mmHg / kPa | 0 to 2320 mmHg (0–309 kPa) | Total ambient chamber pressure |
| `Droplet initial diameter; mm` | `droplet_d0_mm` | mm | 1.10 mm to 4.67 mm | Fuel droplet initial dimension |
| `Test end` | `outcome_class` | Categorical | `Extinction`, `Disruption`, `Completion` | **Ground truth target label** |

---

## 3. Ground Truth Outcome Label & Circularity Audit

In `data/processed/evidence_runs.json`, the binary target is structured as:
- **`extinguished` (186 runs / 67.9%):** The visible droplet flame quenched at a non-zero droplet diameter ($d_{\text{ext}} > 0$).
- **`frames_recorded` / Sustained (88 runs in PSI-69, 92 overall / 32.1%):**
  - `Disruption` (61 runs): Droplet underwent internal bubble nucleation / disruptive boiling before flame extinction.
  - `Completion` (27 runs): Flame burned steadily until complete fuel burnout down to zero diameter ($d_{\text{ext}} \approx 0$).

### Circularity Assessment: Is the Label Circular?
- **NO OPERATIONAL CIRCULARITY:** Unlike the solid-fuel BASS-II data (where astronaut operators intentionally switched off duct ventilation fans, inducing flow-cutoff extinction), in FLEX there was **no human actuator intervention** during droplet burning. The chamber was sealed and quiescent, and spark ignition was followed by unassisted burning until natural extinction or fuel consumption.
- **PHYSICAL COUPLING CAVEAT (Droplet Diameter Effect):** In microgravity droplet burning, larger droplets take longer to burn ($t_b \approx d_0^2 / K$), causing greater cumulative radiative heat loss from soot and combustion products. As a result, larger droplets can undergo radiative extinction under conditions where smaller droplets burn to completion. Initial droplet size ($d_0$) is thus a confounding physical variable.
- **CRITICAL DOMAIN GAP (Droplets vs Spacecraft Cabin Fires):**
  > [!WARNING]
  > **Droplet flames in ISS microgravity (FLEX) are NOT cabin solid fuels.**
  > Liquid fuel droplets in a quiescent chamber lack forced convective ventilation, solid char formation, pyrolysis thermal inertia, and surface airflow boundary layers. FLEX results reflect droplet chemical and radiative flammability limits, NOT cabin-fire extinguishing requirements.

---

## 4. Grouping Unit Definition (Zero Leakage Specification)

To prevent data leakage during cross-validation, multiple runs conducted at identical or near-identical environmental mixture settings must never be split across training and test folds.

The experimental grouping unit is defined as:
$$\text{Group ID} = f(\text{Fuel},\ X_{O2},\ X_{CO2},\ X_{He},\ \text{Round}(P_{\text{amb}} / 50\text{ mmHg}))$$

Across the 274 PSI-69 runs, this produces exactly **90 distinct physical mixture groups**. Group-level cross-validation and Leave-One-Fuel-Out (holding out Methanol or Heptane) strictly partition on these 90 groups.

