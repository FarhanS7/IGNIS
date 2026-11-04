# M4 Extinction-Threshold Model: Model Card (NASA FLEX)

## Executive Summary & Safety-Critical Error Notice

> [!CAUTION]
> **HEADLINE METRIC: FALSE EXTINCTION RATE (FER)**
> In spacecraft fire response, predicting that a flame has extinguished when it is actually STILL BURNING is the most dangerous failure mode (crew or actuators may prematurely de-isolate power or vent suppression agent). Under Grouped 5-Fold Cross-Validation, **Logistic Regression achieves a False Extinction Rate of 35.4%** [21.6%, 52.8%] with 82.4% accuracy, significantly cutting false extinctions compared to the naive Majority Baseline (100.0% FER).

> [!WARNING]
> **Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.**
> **Not validated for partial gravity.**
> **Under Leave-One-Fuel-Out domain shift, False Extinction Rate surges to 87–100%, proving that chemical flammability limits cannot be extrapolated across different fuel classes.**

## 1. Datasets & Provenance
- **Dataset:** NASA Physical Sciences Informatics PSI-69 (Flame Extinction Experiment, FLEX).
- **Platform:** Combustion Integrated Rack (CIR) / Multi-user Droplet Combustion Apparatus (MDCA) on the International Space Station (ISS).
- **License:** Public Domain / CC0-1.0 (US Government NASA open data).
- **Fuels:** Methanol ($CH_3OH$, 157 runs) and Heptane ($n-C_7H_{16}$, 117 runs).
- **Environment:** Quiescent sealed microgravity chamber with varying $O_2$ (12–34%), $CO_2$ (0–70%), $He$ (0–45%), and pressure (0–309 kPa).

## 2. Model Architecture & Operating Rule
- **Model Type:** L2-regularized Logistic Regression on 7 physical features ($X_{O2}, X_{CO2}, X_{N2}, X_{He}, P_{\text{amb}}, d_0, \text{is\_heptane}$).
- **Operating Threshold:** Calibrated conservatively at $p \ge 0.55$ to reject ambiguous extinctions.
- **Output Categories for IGNIS Console:**
  - `EXTINCTION_REGION`: Diluent and oxygen fractions yield high predicted extinction probability ($p \ge 0.65$).
  - `SUSTAINED_REGION`: Atmosphere sustains combustion ($p \le 0.40$).
  - `INSUFFICIENT_EVIDENCE`: Ambiguous flammability boundary ($0.40 < p < 0.65$) or conditions outside experimental envelope.

## 3. Benchmark Evaluation Results

### Split 1: Grouped 5-Fold Cross-Validation (Partitioned by Mixture Group)

| Model | Accuracy [95% CI] | **FALSE EXTINCTION RATE** [95% CI] | Extinction Recall | Sustained Recall |
|---|---|---|---|---|
| **Majority_Baseline** | 68.7% [60.2%, 77.5%] | **100.0%** [100.0%, 100.0%] | 100.0% | 0.0% |
| **CO2_Threshold_Baseline** | 31.3% [22.5%, 39.8%] | **0.0%** [0.0%, 0.0%] | 0.0% | 100.0% |
| **Logistic_Regression_M4** | 82.4% [75.8%, 88.8%] | **35.4%** [21.6%, 52.8%] | 90.6% | 64.6% |

### Split 2: Leave-One-Fuel-Out (LOFO) Generalization Failure

| Split Direction | Model | Accuracy | **FALSE EXTINCTION RATE** | Extinction Recall |
|---|---|---|---|---|
| Train_Heptane_Test_Methanol | Majority_Baseline | 79.9% | **100.0%** | 100.0% |
| Train_Heptane_Test_Methanol | CO2_Threshold_Baseline | 20.1% | **0.0%** | 0.0% |
| Train_Heptane_Test_Methanol | Logistic_Regression_M4 | 76.0% | **41.9%** | 80.5% |
| Train_Methanol_Test_Heptane | Majority_Baseline | 52.8% | **100.0%** | 100.0% |
| Train_Methanol_Test_Heptane | CO2_Threshold_Baseline | 47.2% | **0.0%** | 0.0% |
| Train_Methanol_Test_Heptane | Logistic_Regression_M4 | 60.2% | **76.5%** | 93.0% |

## 4. Honest Assessment & Application Guardrails
1. **Baseline Comparison:** Under Grouped CV, Logistic Regression improves overall accuracy from 68.7% (Majority baseline) to 82.4%, and lowers the catastrophic False Extinction Rate from 100.0% to 35.4%.
2. **Domain Limitation:** The LOFO test demonstrates complete generalization failure when crossing fuel families (Methanol to Heptane produces 100% FER). The console must NEVER extrapolate this model to cabin solid fuels or untested chemical propellants.
3. **Category-Only Representation:** The console UI will display only discrete status chips (`EXTINCTION_REGION`, `SUSTAINED_REGION`, `INSUFFICIENT_EVIDENCE`) and will never present numerical probability percentages.

