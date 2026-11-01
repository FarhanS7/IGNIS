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

## 4. Circularity Audit & Flow Disentanglement (Task A.2)

### The Circularity Condition
In the BASS-II investigation (`PSI-25`), 25 flight runs have their outcome class (`extinguished` or `no_ignition`) derived from handwritten operator notes located in the `Air display` or `Fan display` columns of the experimental table, while their flow velocity (`flow_cm_s`) was parsed from the very same cell.

For example, when astronauts performed flow step-down tests to determine the extinction limit, they entered values like `"5 3 2 ext"` or `"10 blowoff"` in the flow meter log. The parsing script extracted the numerical velocity from this string and simultaneously classified the outcome as `extinguished`.

### All 25 Circular BASS-II Flight Runs

| Run UID | BASS-II Test ID | Column Containing Note & Flow | Raw Cell Text | Parsed Flow ($u_g$) | Outcome Class |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PSI-25-RUN-0014** | Test B14 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0018** | Test B18 | `Air display` | `"10.0 blowoff"` | 10.07 cm/s | `extinguished` |
| **PSI-25-RUN-0019** | Test B19 | `Air display` | `"10.0 blowoff"` | 10.07 cm/s | `extinguished` |
| **PSI-25-RUN-0021** | Test B21 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0043** | Test M17 | `Air display` | `"10.0 blowoff"` | 10.07 cm/s | `extinguished` |
| **PSI-25-RUN-0051** | Test O4 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0055** | Test O7 | `Fan display (pot dial)` | `"9.06 (ext)"` | 9.06 cm/s | `extinguished` |
| **PSI-25-RUN-0056** | Test O8a | `Fan display (pot dial)` | `"9.06 (ext)"` | 9.06 cm/s | `extinguished` |
| **PSI-25-RUN-0057** | Test O8b | `Fan display (pot dial)` | `"9.06 (ext)"` | 9.06 cm/s | `extinguished` |
| **PSI-25-RUN-0058** | Test O9 | `Fan display (pot dial)` | `"9.06 (ext)"` | 9.06 cm/s | `extinguished` |
| **PSI-25-RUN-0060** | Test O11 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0061** | Test O12 | `Fan display (pot dial)` | `"2.57 (no ign)"` | 2.59 cm/s | `no_ignition` |
| **PSI-25-RUN-0064** | Test O14 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0070** | Test O19 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0073** | Test O22 | `Air display` | `"4.03 ext"` | 4.03 cm/s | `extinguished` |
| **PSI-25-RUN-0074** | Test P1 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0079** | Test P5 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0081** | Test P8 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0082** | Test P9 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0083** | Test P10 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0085** | Test P13a | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0086** | Test P13b | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0096** | Test P22a | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0097** | Test P22b | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |
| **PSI-25-RUN-0100** | Test P25 | `Air display` | `"5.0 ext"` | 5.03 cm/s | `extinguished` |

### Cross-Validation Across the Three Conditions

To measure how much model performance depends on this circularity, Leave-One-Group-Out CV was executed under three conditions:
1. **Condition (a) As-Is**: All 132 usable flight runs evaluated.
2. **Condition (b) Excluding Circular Rows**: 25 circular runs completely removed (leaving 107 runs across 94 physical groups).
3. **Condition (c) Masking Flow for Circular Rows**: The 25 runs are retained, but their `flow_cm_s` is masked to `None`. The matcher dynamically redistributes factor weights to material family, oxygen concentration, and geometry.

| Condition | Usable Runs ($N$) | Physical Groups | Full IGNIS ($k=5$) Acc | $O_2$-Rule Acc | Acc Diff vs $O_2$-Rule [95% CI] | Full IGNIS Extinction Recall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **(a) As-is (Full Corpus)** | 132 | 110 | **80.30%** | 79.55% | +0.76% [-4.55%, +6.82%] | **48.00%** (12/25) |
| **(b) Excluding Circular Rows** | 107 | 94 | **95.33%** | 95.33% | +0.00% [+0.00%, +0.00%] | **0.00%** (0/1) |
| **(c) Flow Masked for Circular** | 132 | 110 | **78.03%** | 79.55% | -1.52% [-6.82%, +3.79%] | **44.00%** (11/25) |

### Key Epistemic Findings
- **Almost all extinctions in BASS-II are circular**: Out of 25 extinction events across the entire 132-run corpus, **24 occurred in these flow-note rows**. Only 1 non-circular extinction run exists in the remaining solid records (`PSI-25-RUN-0020`, Test B20, where extinction was recorded in a dedicated outcome remark).
- **In Condition (b)**, the dataset collapses into a single dominant class: 102 `frames_recorded`, 1 `extinguished`, and 4 `no_ignition`. Naive majority class prediction gives 95.33% accuracy. With only 1 extinction in the entire dataset, extinction recall drops to 0.0%.
- **In Condition (c)**, masking flow reduces Full IGNIS accuracy from 80.30% to 78.03% (-2.27%), and extinction recall from 48.0% to 44.0%. This confirms that flow velocity carries genuine predictive information, but because quenching and flow were co-recorded in the same text entry, flow measurements in these rows are entangled with outcome logging.

---

## 5. Explanation of CV Discrepancies Between Versions (Task A.3)

Earlier development snapshots reported accuracy figures rising from ~83% to 92.42%, with extinction recall changing from 48–52% to 84.0%. Here we document the exact mathematical cause and row-level provenance of these discrepancies.

### Class Counts and Relabeled Rows

| Outcome Class | Early Version (Proxy) | Current Version (Standardized) | Net Change | Explanation |
| :--- | :--- | :--- | :--- | :--- |
| **`frames_recorded`** | 107 | 102 | **-5** | 5 runs were relabeled to `no_ignition` after verifying PI remarks |
| **`extinguished`** | 25 | 25 | **0** | Remained identical (24 from flow notes + 1 from remark) |
| **`no_ignition`** | 0 | 5 | **+5** | Explicitly separated: Tests B11, B12, B13, O10, O12 |
| **Total Usable Runs** | 132 | 132 | 0 | Unchanged |

**Rows relabeled from `frames_recorded` to `no_ignition`**:
- `PSI-25-RUN-0011` (Test B11): Note `"no ignition"` in remarks.
- `PSI-25-RUN-0012` (Test B12): Note `"no ign"` in remarks.
- `PSI-25-RUN-0013` (Test B13): Note `"no ign, wire burnt"` in remarks.
- `PSI-25-RUN-0059` (Test O10): Note `"no ign, low hot wire"` in remarks.
- `PSI-25-RUN-0061` (Test O12): Note `"2.57 (no ign)"` in `Fan display`.

### Mathematical Cause of the 92.4% Accuracy & 84% Extinction Recall Claims

The 92.42% (122/132) accuracy and 84.0% (21/25) extinction recall figures previously recorded were produced by **ungrouped Leave-One-Out Cross-Validation (LOOCV)**.

1. **Hardware Sample Leakage in Ungrouped CV**:
   In BASS-II, single physical samples were burned repeatedly. For example:
   - Sample hardware tag `133` was tested 3 times (Tests B14, B15, B16) at closely spaced flow rates.
   - Sample hardware tags `174`, `176`, `205`, `208`, `215`, `217`, `218`, `220` were each tested 2 to 3 times.
   When cross-validation is performed without grouping, a burn from sample `133` in the test fold matches another burn of the exact same physical sample in the training fold. Because the sample's physical dimensions, chemical batch, and ignition wire characteristics are identical, the model achieves an artificially inflated **92.42% accuracy** and **84.0% extinction recall**.

2. **Strict Grouped CV (Leave-One-Group-Out)**:
   When all burns sharing the same physical sample hardware are held out together (110 independent hardware groups), no hardware properties leak between training and testing.
   Under this strict protocol:
   - Full IGNIS ($k=5$) accuracy is **80.30% (106/132)**.
   - $O_2$-Threshold Rule accuracy is **79.55% (105/132)**.
   - The true difference is **+0.76% (95% CI: [-4.55%, +6.82%])**, which is **not statistically significant** ($p = 1.0000$).
   - Extinction recall drops from the inflated 84% down to **48.00% (12/25)**.

This proves that the apparent 92% accuracy was an artifact of data leakage between repeated burns of the same sample, justifying why grouped cross-validation is scientifically required.

---

## 6. Operational Solid Flammability Envelope

| Parameter | Flight Tested Range | Minimum Run UID | Maximum Run UID | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Oxygen ($O_2$)** | **13.6% – 22.2%** | PSI-25-RUN-0021 (13.6%) | PSI-25-RUN-0001 (22.2%) | Flammability boundary tested in 13.6%–16% range |
| **Forced Flow Velocity** | **0.0 – 28.18 cm/s** | PSI-25-RUN-0043 (0.0 cm/s) | PSI-25-RUN-0105 (28.18 cm/s) | Quiescent (0 cm/s) to high ventilation (28.2 cm/s) |
| **Cabin Pressure** | **101.3 kPa (Assumed)** | All solid flight runs | All solid flight runs | **Never measured in solid flight data; excluded from scoring** |
| **Gravity** | **~0 g (Microgravity)** | All solid flight runs | All solid flight runs | **Moon (0.16 g) and Mars (0.38 g) are flagged as extrapolations** |

---

## 7. Reproducibility Commands

```bash
# 1. Run Strict Grouped Cross-Validation (Leave-One-Group-Out)
python scripts/validate/grouped_loocv.py

# 2. Run Circularity Sensitivity Audit (Conditions a, b, c)
python scripts/validate/circularity_cv.py
```
