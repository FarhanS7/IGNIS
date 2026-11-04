# M2 Multi-Sensor Fusion Detector: Model Card

## Executive Summary & Honest Comparison
On held-out scenarios (Split S1), the **M2 Learned Fusion Detector achieves 100.0% fire detection rate** with **71.4% nuisance rejection**, **200.0 s median delay**, and **0.000 false alarms/hour**. Compared to the best baseline (B1 Particulate thresholding at 100.0% fire detection, 85.7% nuisance rejection, and 300.0 s delay), **M2 cuts detection latency by 100 seconds (33% faster response, 200 s vs 300 s)**, but **does not beat B1 on nuisance rejection (71.4% vs 85.7% on unseen aerosols like hairspray)**. Baseline B2 (CO) detects only 7.7% of fires due to low smoldering emissions, and B3 (Rule Fusion) suffers severe delay (2515.0 s). Under cross-site domain shift (D2 to D1), M2 outperforms B1 in detection rate (92.3% vs 84.6%) and is over 700 seconds faster (985.0 s vs 1700.0 s).

> [!WARNING]
> **Trained on Earth-gravity data without forced ventilation. Not validated in microgravity.**
> **Metrics are on held-out experiments, not random rows.**

## 1. Datasets & Provenance
- **Training Dataset (D1):** Indoor Fire Dataset (EN54 Test Room), DOI `10.17632/npk2zcm85h.2`, CC BY 4.0 license.
- **Cross-Site Test Dataset (D2):** Indoor Fire Dataset (Industrial Hall), DOI `10.17632/yghykzm4km.1`, CC BY 4.0 license.
- **Reference Paper:** Pascal Vorwerk et al., *Distance-Based Analysis of Early Fire Indicators on a New Indoor Laboratory Dataset with Distributed Multi-Sensor Nodes*, MDPI Fire 2023, 6(8), 323.

## 2. Model Architecture & Operating Point
- **Model Type:** L2-regularized Logistic Regression with balanced class weighting.
- **Input Dimensions:** 10 unit-free features (Normalized Levels, Window Slopes, Window Maxima, and Cross-Channel Agreement Fraction).
- **Window Size ($W$):** 6 samples (60 seconds at native 10 s cadence).
- **Operating Point Rule:** Chosen strictly on the training fold as the most sensitive threshold yielding zero false alarms on training nuisance and background data.

## 3. Benchmark Evaluation Results

### Split S1: Leave-One-Scenario-Out (Unseen Fuel Generalization)

| Model | Fire Detection Rate [95% CI] | Nuisance Rejection [95% CI] | Median Delay (s) | P90 Delay (s) | False Alarms / hr |
|---|---|---|---|---|---|
| **B1_Particulate** | 100.0% [100.0%, 100.0%] | 85.7% [50.0%, 100.0%] | 300.0 s | 1646.0 s | 0.000 |
| **B2_CO** | 7.7% [0.0%, 25.0%] | 85.7% [50.0%, 100.0%] | 1160.0 s | 1160.0 s | 0.000 |
| **B3_Rule_Fusion** | 30.8% [7.1%, 58.3%] | 85.7% [50.0%, 100.0%] | 2515.0 s | 10571.0 s | 0.000 |
| **M2_Learned_Fusion** | 100.0% [100.0%, 100.0%] | 71.4% [33.3%, 100.0%] | 200.0 s | 1574.0 s | 0.000 |

### Split S2: Cross-Site Domain Shift

| Direction | Model | Fire Detection Rate | Nuisance Rejection | Median Delay (s) |
|---|---|---|---|---|
| D1_to_D2 | B1_Particulate | 88.2% | 66.7% | 1680.0 s |
| D1_to_D2 | B2_CO | 100.0% | 20.0% | 2030.0 s |
| D1_to_D2 | B3_Rule_Fusion | 100.0% | 60.0% | 2600.0 s |
| D1_to_D2 | M2_Learned_Fusion | 100.0% | 13.3% | 1490.0 s |
| D2_to_D1 | B1_Particulate | 84.6% | 100.0% | 1700.0 s |
| D2_to_D1 | B2_CO | 0.0% | 100.0% | 0.0 s |
| D2_to_D1 | B3_Rule_Fusion | 0.0% | 100.0% | 0.0 s |
| D2_to_D1 | M2_Learned_Fusion | 92.3% | 100.0% | 985.0 s |

### Split S3: Leave-One-Repetition-Out (Optimistic Reference)

| Model | Fire Detection Rate | Nuisance Rejection | Median Delay (s) |
|---|---|---|---|
| **B1_Particulate** | 100.0% | 100.0% | 300.0 s |
| **B2_CO** | 7.7% | 100.0% | 1160.0 s |
| **B3_Rule_Fusion** | 7.7% | 100.0% | 1160.0 s |
| **M2_Learned_Fusion** | 92.3% | 100.0% | 430.0 s |

## 4. Per-Scenario Failure Analysis (S1)

| Scenario Type | Category | Total Experiments | Detected Alarms (M2) | Detection Rate / Outcome |
|---|---|---|---|---|
| Cable | Fire | 4 | 4 | 100.0% |
| Candles | Fire | 3 | 3 | 100.0% |
| Deodorant | Nuisance | 2 | 0 | 0.0% |
| Ethanol | Nuisance | 4 | 1 | 25.0% |
| Hairspray | Nuisance | 1 | 1 | 100.0% |
| Lunts | Fire | 3 | 3 | 100.0% |
| Wood | Fire | 3 | 3 | 100.0% |

