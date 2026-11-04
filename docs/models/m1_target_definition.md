# M1 Detector Response Target Definition

**Document Status:** Pre-modelling Target Specification  
**Dataset:** NASA SAME / SAME-R Spacecraft Flight Telemetry (NASA PSI-101 / PSI-102)  
**Authors / Context:** IGNIS Fire Response System (Step 05)  
**Date:** 2026-11-04  

---

## 1. Physical Objective

To replace the heuristic constant small-particle sensitivity penalty (`0.35`) in the spacecraft smoke simulator with an empirical microgravity calibration derived from actual International Space Station (ISS) flight experiments.

In spacecraft environments, lack of buoyant convection fundamentally alters smoke particle size distributions. Pyrolysis products undergo prolonged Brownian agglomeration and coagulation in the cabin airflow without thermal plume acceleration, producing distinct particle morphology and size distributions compared to terrestrial 1g fires.

---

## 2. Mathematical Definition of Target Variables

### 2.1 Primary Target: Relative Photoelectric Detector Sensitivity ($\eta_{\text{photo}}$)

The ISS photoelectric smoke detector operates on light scattering (90° forward-scatter optical chamber illuminated by a near-IR diode, $\lambda \approx 880\text{ nm}$).

In the NASA SAME-R flight telemetry (`Reduced Data with ISS Det`):
- $V_{\text{ISS}}$ = `ISS Detector Scatter (volts)`: Signal voltage from the flight photoelectric detector (0.00 V to 6.29 V saturation).
- $C_{\text{ref}}$ = `DustTrak B calibratred and corrected for dilution (mg/m3)`: True reference optical aerosol mass concentration ($mg/m^3$) measured simultaneously by the calibrated flight reference instrument.

The raw photoelectric mass-specific response is defined as:
$$R_{\text{photo}} = \frac{V_{\text{ISS}}}{C_{\text{ref}}} \quad \left[\frac{\text{V}}{\text{mg/m}^3}\right]$$

To produce the dimensionless **response multiplier** $\eta_{\text{photo}}(d)$ needed by the IGNIS simulator:
$$\eta_{\text{photo}} = \frac{R_{\text{photo}}}{R_{\text{ref}}}$$
where $R_{\text{ref}}$ is the nominal baseline sensitivity for standard reference fuels (e.g. median response of cellulose / Lampwick at standard particle size, $R_{\text{ref}} \approx 0.2153\ \text{V}/(\text{mg/m}^3)$).

### 2.2 Secondary Target: Relative Ionization Detector Sensitivity ($\eta_{\text{ion}}$)

The Space Shuttle (STS) ionization chamber smoke detector measures current reduction as smoke particles capture alpha-induced air ions.

In the flight telemetry:
- $\Delta V_{\text{STS}}$ = `STS detector delta`: Voltage drop signal from the flight ionization detector (offset-corrected, in Volts).
- $C_{\text{ref}}$ = Reference mass concentration ($mg/m^3$).

The ionization mass-specific response is defined as:
$$R_{\text{ion}} = \frac{\Delta V_{\text{STS}}}{C_{\text{ref}}} \quad \left[\frac{\text{V}}{\text{mg/m}^3}\right]$$

---

## 3. Predictor Variables & Operational Bounds

All candidate features must be measurable in flight or produced by the habitat simulator:

| Feature Name | Telemetry Column | Physical Meaning | Valid Flight Range | Units |
|---|---|---|---|---|
| **$d_{\text{AMD}}$** | `M1/M0 (micro-m)--AMD` | Aerodynamic Mean Diameter | `0.05` to `1.10` | $\mu\text{m}$ |
| **$v_{\text{flow}}$** | `Inlet Velocity (cm/sec)` | Forced ventilation airspeed | `0.0` to `8.1` | $\text{cm/s}$ |
| **$t_{\text{aging}}$** | `Net Aging  Duration` | Agglomeration / residence time | `0.0` to `720.0` | $\text{s}$ |
| **$T_{\text{sample}}$** | `Sample Temperature C` | Fuel overheating temperature | `200.0` to `650.0` | °C |
| **Material** | `Sample Type` | Overheated spacecraft material | 5 classes | Categorical |

### Spacecraft Materials Evaluated (5 Solid Substrates)
1. **Teflon (PTFE):** Wire insulation and high-temperature polymers (produces sub-micron fluoropolymer aerosol).
2. **Kapton (Polyimide):** Avionics wire harnesses and thermal blankets (produces very fine aromatic smoke).
3. **Lampwick (Cellulose):** Fabric, cotton wipes, and crew apparel proxy.
4. **Silicone Rubber:** Gaskets, cable seals, and potting materials (produces larger agglomerated particles).
5. **Pyrell (Polyurethane foam):** Spacecraft acoustic and vibration damping foam.

---

## 4. Physical Principles & Hypotheses

1. **Rayleigh / Mie Scattering Regime:**
   For $d \ll \lambda$ ($d < 0.2\ \mu\text{m}$), scattering cross section scales as $d^6$, and scattering per unit mass scales as $d^3$. Sub-micron Teflon and Kapton particles must produce systematically lower photoelectric response $\eta_{\text{photo}}$ than larger silicone and cellulose particles.
2. **Monotonicity with Diameter:**
   Within the sub-micron and low-micron regime ($0.05\ \mu\text{m} \le d \le 1.0\ \mu\text{m}$), $\eta_{\text{photo}}(d)$ is expected to be monotonically non-decreasing with diameter $d$.
3. **Extrapolation Guard:**
   The model must strictly refuse or flag extrapolation outside the empirical microgravity domain:
   $$0.05\ \mu\text{m} \le d_{\text{AMD}} \le 1.10\ \mu\text{m}$$

---

## 5. Model Formulation & Evaluation Protocol

1. **Models to Compare:**
   - **Baseline G (Global Mean):** Predicts constant global mean across all training materials.
   - **Baseline M (Per-Material Mean):** In-sample reference only (cannot predict unseen materials).
   - **Model 1 (Isotonic Regression):** Non-parametric monotonically non-decreasing fit on $d_{\text{AMD}}$.
   - **Model 2 (Smooth Low-Degree Polynomial / Spline):** Constrained 2nd-degree polynomial in $\log(d)$.
   - **Model 3 (Regularized Ridge Linear Model):** Fits $[\log(d), v_{\text{flow}}, t_{\text{aging}}]$.
2. **Validation Split: Leave-One-Material-Out (LOMO):**
   - 5 folds, holding out each material once (Teflon, Kapton, Lampwick, Silicone, Pyrell).
   - Training fold contains 4 materials; test fold contains all runs of the 5th material.
   - Evaluated by Root Mean Squared Error (RMSE) and Mean Absolute Error (MAE) with 95% bootstrap CIs (2000 resamples).
3. **Acceptance Rule for Simulator Calibration:**
   Only if Model 1 or Model 2 beats Baseline G on held-out materials under LOMO may the parameter be tagged `calibrated:m1-same-r`. If it fails to generalize across materials, the result must be honestly reported and the tag kept as `illustrative`.
