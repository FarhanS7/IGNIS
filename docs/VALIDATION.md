# Scientific Validation of IGNIS Real-Data Matching Engine

**Evaluation Date**: 2026-10-31  
**Target Dataset**: Real NASA Solid-Fuel Microgravity Flight Runs (`data/processed/evidence_solid.json`)  
**Evaluation Scope**: 132 Usable Solid Flight Runs across 110 Physical Sample Hardware Groups (BASS-II, Saffire-I, Saffire-II)  
**Strict Epistemic Criteria**: Cabin pressure is ASSUMED in solid flight runs and strictly excluded from similarity scoring. Grouped cross-validation holds out entire physical sample hardware groups to prevent data leakage between repeated burns.

---

## 1. Executive Summary

| Model / Comparison Baseline | Accuracy [95% Wilson CI] | Balanced Accuracy | Diff vs Baseline [95% Bootstrap CI] | McNemar $p$-value | Extinction Recall (Quench) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Naive Majority Baseline** | **77.27%** [69.4%, 83.6%] | **33.33%** | Reference Baseline | — | **0.0%** (0/25) |
| **Single-Feature $O_2$ Rule** | **79.55%** [71.9%, 85.5%] | **44.38%** | +2.27% [-3.8%, +8.3%] vs Majority | $p = 0.6291$ | **40.0%** (10/25) |
| **Material + $O_2$ ($k=3$)** | **78.03%** [70.2%, 84.2%] | **40.71%** | +0.76% [-4.5%, +6.1%] vs Majority | $p = 1.0000$ | **28.0%** (7/25) |
| **Full IGNIS ($k=1$)** | **77.27%** [69.4%, 83.6%] | **46.42%** | +0.00% [-7.6%, +7.6%] vs Majority | $p = 1.0000$ | **52.0%** (13/25) |
| **Full IGNIS ($k=5$)** | **80.30%** [72.7%, 86.2%] | **46.72%** | +3.03% [-3.8%, +9.8%] vs Majority | $p = 0.5034$ | **48.0%** (12/25) |

---

## 2. Head-to-Head Comparison: Full IGNIS ($k=5$) vs $O_2$-Threshold Rule

To test whether adding material family, oxidizer flow velocity, and geometric dimensions provides measurable predictive value over a simple calibrated oxygen threshold rule (fitted within each training fold), a paired bootstrap analysis (2,000 resamples) and exact McNemar test were executed:

| Metric Dimension | Full IGNIS ($k=5$) | $O_2$-Threshold Rule | Observed Difference ($\Delta$) | 95% Bootstrap Confidence Interval | Statistical Conclusion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Overall Accuracy** | 80.30% (106/132) | 79.55% (105/132) | **+0.76%** | **[-4.55%, +6.82%]** | **Spans 0 (No significant difference)** |
| **Balanced Accuracy** | 46.72% | 44.38% | **+2.34%** | **[-5.88%, +10.85%]** | **Spans 0 (No significant difference)** |
| **Extinction Recall** | 48.00% (12/25) | 40.00% (10/25) | **+8.00%** | **[-16.67%, +33.33%]** | **Spans 0 (No significant difference)** |
| **Discordant Pairs (McNemar)** | 8 correct only in $k=5$ | 7 correct only in $O_2$-rule | Total discordant = 15 | **$p = 1.0000$** | **Not statistically significant** |

### Statistical & Epistemic Honesty Statement
Because all 95% bootstrap confidence intervals for accuracy, balanced accuracy, and extinction recall difference include zero, and the McNemar test $p$-value is 1.0000, **the data does NOT demonstrate a statistically significant performance advantage for the multi-factor similarity matcher over the single-feature $O_2$ threshold rule**. 

The purpose and value of the IGNIS multi-factor engine is **epistemic provenance retrieval**, not classification dominance: it delivers the nearest matching flight runs with their measured flow velocities, geometric dimensions, and verified flight documentation links, allowing exploration engineers to inspect real flight evidence rather than relying on an ungrounded classification score.

---

## 3. Grouped Cross-Validation (Leave-One-Group-Out) Protocol

### Hardware Grouping Rationale
In microgravity combustion flight experiments, several physical fuel samples were burned multiple times under changing ambient atmospheres or flow speeds (e.g. sample 133 had 3 runs; samples 174, 176, 205, 208, 215, 217, 218, 220 each had 2 runs). Ordinary sample-level cross-validation leaks material-specific burning traits across folds.

To eliminate leakage, runs were grouped by **physical sample hardware tag** (`sample_no` / test series prefix), yielding **110 independent physical sample groups** across the 132 usable flight runs. In each fold, an entire physical sample was held out during training.

### Full Comparative Breakdown

| Model Architecture | Overall Accuracy | Balanced Acc | Diff vs Majority [95% CI] | McNemar $p$ vs Majority | Photographed Burn Recall | PI Extinction Recall | PI No-Ignition Recall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Majority Baseline** | 77.27% [69.4%, 83.6%] | 33.33% | +0.00% [+0.0%, +0.0%] | — | 100.0% | 0.0% | 0.0% |
| **O2-Threshold Rule** | 79.55% [71.9%, 85.5%] | 44.38% | +2.27% [-3.8%, +8.3%] | 0.6291 | 93.1% | 40.0% | 0.0% |
| **Material+O2 (k=1)** | 74.24% [66.2%, 80.9%] | 41.08% | -3.03% [-9.8%, +3.8%] | 0.5235 | 87.2% | 36.0% | 0.0% |
| **Material+O2 (k=3)** | 78.03% [70.2%, 84.2%] | 40.71% | +0.76% [-4.5%, +6.1%] | 1.0000 | 94.1% | 28.0% | 0.0% |
| **Full IGNIS (k=1)** | 77.27% [69.4%, 83.6%] | 46.42% | +0.00% [-7.6%, +7.6%] | 1.0000 | 87.2% | 52.0% | 0.0% |
| **Full IGNIS (k=3)** | 78.79% [71.0%, 84.9%] | 44.05% | +1.52% [-4.5%, +7.6%] | 0.8145 | 92.2% | 40.0% | 0.0% |
| **Full IGNIS (k=5)** | 80.30% [72.7%, 86.2%] | 46.72% | +3.03% [-3.8%, +9.8%] | 0.5034 | 92.2% | 48.0% | 0.0% |

---

## 4. Operational Solid Flammability Envelope

| Parameter | Flight Tested Range | Minimum Run UID | Maximum Run UID | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Oxygen ($O_2$)** | **13.6% – 22.2%** | PSI-25-RUN-0021 (13.6%) | PSI-25-RUN-0001 (22.2%) | Flammability boundary tested in 13.6%–16% range |
| **Forced Flow Velocity** | **0.0 – 28.18 cm/s** | PSI-25-RUN-0043 (0.0 cm/s) | PSI-25-RUN-0105 (28.18 cm/s) | Quiescent (0 cm/s) to high ventilation (28.2 cm/s) |
| **Cabin Pressure** | **101.3 kPa (Assumed)** | All solid flight runs | All solid flight runs | **Never measured in solid flight data; excluded from scoring** |
| **Gravity** | **~0 g (Microgravity)** | All solid flight runs | All solid flight runs | **Moon (0.16 g) and Mars (0.38 g) are flagged as extrapolations** |

---

## 5. Reproducibility Command

```bash
# Run Grouped Cross-Validation with Head-to-Head CIs
$env:PYTHONPATH = "."; python scripts/validate/grouped_loocv.py
```
