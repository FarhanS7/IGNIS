# Scientific Validation of IGNIS Real-Data Matching Engine

**Evaluation Date**: 2026-10-31  
**Target Dataset**: Real NASA Solid-Fuel Microgravity Flight Runs (`data/processed/evidence_solid.json`)  
**Evaluation Scope**: 132 Usable Solid Flight Runs across 112 Physical Sample Hardware Groups (BASS-II, Saffire-I, Saffire-II)  
**Strict Epistemic Criteria**: Cabin pressure is ASSUMED in solid flight runs and strictly excluded from similarity scoring. Grouped cross-validation holds out entire physical samples to prevent data leakage between repeated burns.

---

## 1. Executive Summary

| Model / Metric Dimension | Accuracy (95% Wilson CI) | Balanced Accuracy | Difference vs Baseline [95% Bootstrap CI] | McNemar $p$-value | Extinction Recall (Quench) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Naive Majority Baseline** | **77.27%** [69.4%, 83.6%] | **33.33%** | Reference Baseline | — | **0.0%** (0/25) |
| **Single-Feature $O_2$ Rule** | **79.55%** [71.9%, 85.5%] | **44.38%** | +2.27% [-3.8%, +8.3%] | $p = 0.6276$ | **40.0%** (10/25) |
| **Material + $O_2$ Only ($k=3$)** | **81.06%** [73.5%, 86.8%] | **67.37%** | +3.79% [-2.3%, +9.8%] | $p = 0.3320$ | **28.0%** (7/25) |
| **Full IGNIS Matcher ($k=1$)** | **79.55%** [71.9%, 85.5%] | **72.76%** | +2.27% [-6.1%, +10.6%] | $p = 0.7194$ | **52.0%** (13/25) |
| **Full IGNIS Matcher ($k=5$)** | **83.33%** [76.0%, 88.7%] | **73.39%** | **+6.06% [-1.5%, +12.9%]** | **$p = 0.1530$** | **48.0%** (12/25) |

---

## 2. Grouped Cross-Validation (Leave-One-Group-Out) Backtest

### Grouping Protocol & Anti-Leakage Rationale
In microgravity combustion flight experiments, several physical fuel samples were burned multiple times under changing ambient atmospheres or flow speeds (e.g., sample 133 had 3 runs; samples 174, 176, 205, 208, 215, 217, 218, 220 each had 2 runs). Ordinary sample-level cross-validation leaks material-specific burning traits across folds.

To ensure true out-of-sample generalization, runs were grouped by **physical sample hardware tag** (`sample_no` / test series prefix), yielding **112 independent physical sample groups** across the 132 usable flight runs. In each fold, an entire physical sample was held out during training.

### Comparative Model Results Table

| Model Architecture | Overall Accuracy | Balanced Acc | Diff vs Majority [95% CI] | McNemar $p$ | Sustained Recall | Extinguished Recall | No-Ignition Recall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Majority Baseline** | 77.27% [69.4%, 83.6%] | 33.33% | +0.00% [+0.0%, +0.0%] | — | 100.0% | 0.0% | 0.0% |
| **O2-Threshold Rule** | 79.55% [71.9%, 85.5%] | 44.38% | +2.27% [-3.8%, +8.3%] | 0.6276 | 93.1% | 40.0% | 0.0% |
| **Material+O2 (k=1)** | 76.52% [68.6%, 82.9%] | 67.42% | -0.76% [-8.3%, +6.8%] | 1.0000 | 86.3% | 36.0% | 80.0% |
| **Material+O2 (k=3)** | 81.06% [73.5%, 86.8%] | 67.37% | +3.79% [-2.3%, +9.8%] | 0.3320 | 94.1% | 28.0% | 80.0% |
| **Full IGNIS (k=1)** | 79.55% [71.9%, 85.5%] | 72.76% | +2.27% [-6.1%, +10.6%] | 0.7194 | 86.3% | 52.0% | 80.0% |
| **Full IGNIS (k=3)** | 81.82% [74.4%, 87.5%] | 70.72% | +4.55% [-2.3%, +11.4%] | 0.2864 | 92.2% | 40.0% | 80.0% |
| **Full IGNIS (k=5)** | 83.33% [76.0%, 88.7%] | 73.39% | +6.06% [-1.5%, +12.9%] | 0.1530 | 92.2% | 48.0% | 80.0% |

### Epistemic & Statistical Interpretation

1. **Statistical Significance on Overall Accuracy**:
   - The Full IGNIS Matching Engine ($k=5$) achieves an overall accuracy of **83.33%**, which is **+6.06 percentage points** higher than the naive majority baseline (77.27%).
   - However, the paired bootstrap 95% confidence interval for this accuracy difference is **[-1.5%, +12.9%]**, which spans zero.
   - McNemar's test for paired discordant classifications yields **$p = 0.1530$** ($> 0.05$).
   - **Rigorous Verdict**: The overall accuracy difference is **not statistically significant** at the $lpha = 0.05$ level. We do not claim that the model demonstrably "lifts overall accuracy" over majority voting.

2. **The True Value: Balanced Accuracy & Extinction Detection**:
   - While naive majority prediction achieves 77.27% raw accuracy due to class imbalance (102 sustained out of 132 runs), its balanced accuracy is only **33.33%**. It has **0.0% recall on extinctions** and **0.0% recall on non-ignitions**.
   - In spacecraft fire safety, missing a flame extinction limit or an ignition threshold is a catastrophic safety failure.
   - The Full IGNIS Matching Engine ($k=1$) achieves a balanced accuracy of **72.76%**, correctly identifying **52.0% of all flame extinctions** (13 of 25) and **80.0% of ignition failures** (4 of 5).
   - Adding oxidizer flow velocity and geometry improves extinction recall from 28.0% (Material+$O_2$ only) to **48.0%–52.0%** (Full IGNIS).

---

## 3. Factor Weight Sensitivity Analysis

Active weights (Material = 0.45, $O_2$ = 0.35, Flow = 0.20) were perturbed by **±50%** across **200 Monte Carlo draws** for 5 representative space exploration mission atmospheres ($N = 1,000$ evaluations).

| Spaceflight Atmosphere / Scenario | Top-5 Exact Match % | Top-5 Changed % | Mean Overlap (of 5) | Mean Jaccard | Top-1 Match % |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ISS Standard Atmosphere (PMMA Rod/Sheet) | 97.0% | 3.0% | 4.91 / 5 | 0.978 | 100.0% |
| ISS Cabin Low-Flow Quench Risk (SIBAL Fabric) | 100.0% | 0.0% | 5.00 / 5 | 1.000 | 100.0% |
| Exploration Atmosphere 34% O2 (EVA Prep / Orion) | 100.0% | 0.0% | 5.00 / 5 | 1.000 | 100.0% |
| Lunar Gateway Hab (Nomex Material) | 100.0% | 0.0% | 5.00 / 5 | 1.000 | 100.0% |
| Hypoxic Flammability Boundary (PMMA 14.5% O2) | 48.0% | 52.0% | 4.39 / 5 | 0.806 | 100.0% |
| **OVERALL SUMMARY (1,000 runs)** | **89.0%** | **11.0%** | **4.86 / 5** | **0.957** | **100.0%** |

---

## 4. Operational Solid Flammability Envelope

| Parameter | Flight Tested Range | Minimum Run UID | Maximum Run UID | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Oxygen ($O_2$)** | **13.6% – 22.2%** | PSI-25-RUN-0021 (13.6%) | PSI-25-RUN-0001 (22.2%) | Hypoxic flammability limit boundary in 13.6%–16% range |
| **Forced Flow Velocity** | **0.0 – 28.18 cm/s** | PSI-25-RUN-0043 (0.0 cm/s) | PSI-25-RUN-0105 (28.18 cm/s) | Quiescent (0 cm/s) to high ventilation (28.2 cm/s) |
| **Cabin Pressure** | **101.3 kPa (Assumed)** | All solid flight runs | All solid flight runs | **Never measured in solid flight data; excluded from scoring** |
| **Gravity** | **~0 g (Microgravity)** | All solid flight runs | All solid flight runs | **Moon (0.16 g) and Mars (0.38 g) are flagged as extrapolations** |

---

## 5. Reproducibility Commands

```bash
# 1. Run Grouped Cross-Validation Backtest
python scripts/validate/grouped_loocv.py

# 2. Run Factor Weight Sensitivity Monte Carlo Analysis
python scripts/validate/weight_sensitivity.py

# 3. Regenerate this full validation document
python scripts/validate/run_all_validation.py
```
