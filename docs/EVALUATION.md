# IGNIS Assistant Evaluation & Abstention Benchmark Report

This report documents retrieval and abstention safety benchmarks across two independent datasets against the 930 NASA Physical Sciences Informatics (PSI) corpus chunks ([`data/corpus/chunks.jsonl`](file:///e:/IGNIS/data/corpus/chunks.jsonl)):
1. **Development Set (30 Questions)** ([`data/eval/qa_set.json`](file:///e:/IGNIS/data/eval/qa_set.json)): Benchmark used during initial development on which retrieval synonyms and abstention thresholds were calibrated.
2. **Held-Out Evaluation Set (26 Questions)** ([`data/eval/qa_holdout.json`](file:///e:/IGNIS/data/eval/qa_holdout.json)): Unseen test set containing randomly sampled chunk queries and novel boundary phrasings to measure true out-of-sample generalization.

## 1. Summary Comparison: Development vs. Held-Out Evaluation

| Evaluation Axis | Development Set (30 Questions, Tuned) | Held-Out Test Set (26 Questions, Unseen) | Status / Notes |
| :--- | :---: | :---: | :--- |
| **Answerable False-Abstention Rate** | 0.0% (0/20) | **0.00%** (0/14) | **PASS**: Zero false abstentions on legitimate flight questions |
| **Out-of-Scope Abstention Rate** | 100.0% (5/5) | **83.33%** (5/6) | **PARTIAL**: 5/6 caught; 1 false pass (`holdout-20`) due to lexical term overlap |
| **Untested Condition Keyword Flag Rate** | 100.0% (5/5) | **16.67%** (1/6) | **LIMITATION**: Simple keyword list fails on novel phrasings (1/6 flagged) |
| **Untested Condition Total Abstention Rate** | 100.0% (5/5) | **100.00%** (6/6) | **PASS**: Groundedness floor ($<5.0$) catches 100% (6/6) of untested regimes |
| **Retrieval Recall@1 / Recall@5** | 55.0% / 85.0% | N/A (14 single-chunk targets) | Evaluated on 20 multi-evidence questions in dev set |
| **Mean Reciprocal Rank (MRR)** | 0.677 | N/A | Shipped TypeScript BM25 retrieval rank |

## 2. Held-Out Evaluation (26 Questions)

The held-out evaluation tests genuine out-of-sample behavior without post-hoc tuning. It exposes real failure modes and verifies the defense-in-depth architecture.

### Score Distribution per Class

| Class | Count | Min Score | Mean Score | Max Score | Abstention Criterion Triggered |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Answerable** | 14 | 19.03 | 30.40 | 46.07 | All score $\ge 19.03$, well above 12.0 floor |
| **Out-of-Scope** | 6 | 7.41 | 9.71 | 14.15 | 5/6 fall below 12.0 floor; 1 lexical leak |
| **Untested Regimes** | 6 | 7.14 | 11.81 | 17.39 | 3 fall below 12.0; 3 caught by groundedness $< 5.0$ |

### Per-Question Held-Out Results

| ID | Category | Question | Top Score | Top-1 Chunk | Decision | Honest Outcome |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| `holdout-01` | Answerable | Why must temperature measurements for spherical flames in ACME Flame Design cover a broader region than normal-gravity flames? | 24.58 | `PSI-10-SRD-FLAME-DESIGN-p032-c002` | **ANSWER** | Passed (grounded) |
| `holdout-02` | Answerable | How can ACME experimental objectives for ignition location and Le < 1 wrinkling be addressed in a single experiment? | 46.07 | `PSI-10-ACME-ISRD-p060-c002` | **ANSWER** | Passed (grounded) |
| `holdout-03` | Answerable | What instrument measures the acceleration environment during BASS-II testing on the ISS? | 24.71 | `PSI-26-BASS1-SRD-p008-c001` | **ANSWER** | Passed (grounded) |
| `holdout-04` | Answerable | What vaporization ratio is observed across the blowoff branch in BASS-II surface energy balance calculations? | 28.71 | `NTRS-20210011385-p096-c001` | **ANSWER** | Passed (grounded) |
| `holdout-05` | Answerable | What is the maximum allowable mole fraction of trace contaminants in ACME burner gas? | 24.69 | `PSI-10-ACME-ISRD-p023-c003` | **ANSWER** | Passed (grounded) |
| `holdout-06` | Answerable | What is the measurement uncertainty of the suggested Hastings HFC-D-302 flow meter in ACME? | 40.69 | `PSI-10-ACME-ISRD-p031-c001` | **ANSWER** | Passed (grounded) |
| `holdout-07` | Answerable | Which 1971 study by G.R. Allen examined the spontaneous ignition temperature of organic materials in oxygen? | 44.75 | `NTRS-20080013149-p004-c001` | **ANSWER** | Passed (grounded) |
| `holdout-08` | Answerable | How is the gas radiation timescale defined in the BASS-II leading-edge energy balance formulation? | 26.37 | `NTRS-20210011385-p043-c002` | **ANSWER** | Passed (grounded) |
| `holdout-09` | Answerable | What fiber material and diameter are specified if ACME temperature measurements use Thin Filament Pyrometry? | 19.03 | `PSI-10-ACME-ISRD-p088-c001` | **ANSWER** | Passed (grounded) |
| `holdout-10` | Answerable | What six monitoring measurements are required for ACME hardware to verify boundary and initial conditions? | 35.95 | `PSI-23-ACME-SRD-REVIEW-p024-c001` | **ANSWER** | Passed (grounded) |
| `holdout-11` | Answerable | What ground-based operational goal was BASS-II microgravity data intended to assist regarding NASA material screening? | 25.71 | `NTRS-20210011385-p063-c002` | **ANSWER** | Passed (grounded) |
| `holdout-12` | Answerable | Why is it not necessary to download all optical image data for ACME exploratory test runs? | 33.84 | `PSI-10-ACME-ISRD-p026-c001` | **ANSWER** | Passed (grounded) |
| `holdout-13` | Answerable | What extinction velocities were measured for 100-µm versus 200-µm samples in BASS-II tests? | 21.17 | `NTRS-20210011385-p075-c003` | **ANSWER** | Passed (grounded) |
| `holdout-14` | Answerable | Which two spherical burner numbers were designated for the Flame Design team by Chand Associates? | 29.27 | `PSI-10-ACME-ISRD-p090-c001` | **ANSWER** | Passed (grounded) |
| `holdout-15` | Out-of-Scope | How does the Hubble Space Telescope point at distant galaxies? | 8.41 | `PSI-10-ACME-ISRD-p040-c003` | **ABSTAIN** | Abstained (clean) |
| `holdout-16` | Out-of-Scope | What is the orbital period of the ISS? | 7.41 | `PSI-10-ACME-ISRD-p011-c002` | **ABSTAIN** | Abstained (clean) |
| `holdout-17` | Out-of-Scope | How do astronauts exercise to prevent bone loss? | 7.77 | `NTRS-20210011385-p098-c001` | **ABSTAIN** | Abstained (clean) |
| `holdout-18` | Out-of-Scope | What material is the Orion heat shield made of? | 9.11 | `NTRS-20210011385-p063-c004` | **ABSTAIN** | Abstained (clean) |
| `holdout-19` | Out-of-Scope | How does the Mars helicopter fly in thin air? | 11.41 | `NTRS-20240002981-p006-c001` | **ABSTAIN** | Abstained (clean) |
| `holdout-20` | Out-of-Scope | What was the Apollo 13 oxygen tank failure? | 14.15 | `NTRS-20210011385-p123-c001` | **ANSWER** | **FAILED**: Lexical overlap with oxygen sensors |
| `holdout-21` | Untested | How would a candle flame behave on a Moon base? | 8.67 | `PSI-26-BASS1-SRD-p010-c002` | **ABSTAIN** | Abstained via groundedness safety net ($< 5.0$) |
| `holdout-22` | Untested | Would paper burn faster at the gravity found on Mars? | 9.53 | `NTRS-20240002981-p006-c001` | **ABSTAIN** | Flagged by keyword |
| `holdout-23` | Untested | What happens to a flame inside a spinning habitat with artificial gravity? | 7.14 | `NTRS-20160000593-p009-c001` | **ABSTAIN** | Abstained via groundedness safety net ($< 5.0$) |
| `holdout-24` | Untested | Is a fire in a pure-oxygen capsule like Apollo 1 more dangerous? | 15.35 | `NTRS-20210011385-p068-c001` | **ABSTAIN** | Abstained via groundedness safety net ($< 5.0$) |
| `holdout-25` | Untested | How does flame spread change in a high-pressure hyperbaric chamber? | 17.39 | `NTRS-20080013149-p002-c001` | **ABSTAIN** | Abstained via groundedness safety net ($< 5.0$) |
| `holdout-26` | Untested | What would a fire look like on a world with one-third Earth gravity? | 12.81 | `PSI-26-BASS1-SRD-p003-c001` | **ABSTAIN** | Abstained via groundedness safety net ($< 5.0$) |

### Held-Out Failure Analysis

1. **Out-of-Scope Failure (`holdout-20`)**:
   - **Question**: *"What was the Apollo 13 oxygen tank failure?"*
   - **Result**: BM25 score was **14.15** (above the 12.0 floor), and coverage of `oxygen`, `tank`, `failure` matched chunk `NTRS-20210011385-p123-c001` (BASS-II CSA-CP oxygen sensor calibration documentation discussing oxygen bottle pressure and failure modes).
   - **Root Cause**: The question contains the legitimate domain keyword `oxygen`. Because IGNIS indexes authentic spacecraft oxygen sensors, pure keyword BM25 without semantic intent parsing cannot distinguish an Apollo ECLSS oxygen tank anomaly from a BASS-II oxygen sensor failure.
   - **Mitigation Status**: Not hidden or patched post-hoc. Documented as a known limitation of lexical retrieval.

2. **Untested Keyword Brittleness (`holdout-21`, `holdout-23`, `holdout-24`, `holdout-25`, `holdout-26`)**:
   - **Finding**: When questions were phrased without exact benchmark keywords (e.g. *"Moon base"* instead of *"lunar"*, *"spinning habitat with artificial gravity"* instead of *"centrifuge"*, *"one-third Earth gravity"* instead of *"0.38 g"*), the keyword rule `detectUntestedCondition` only flagged **1/6 (16.67%)**.
   - **Defense-in-Depth Validation**: Despite the keyword miss, **100.0% (6/6)** of untested questions were safely prevented from generating ungrounded answers. 3 questions scored below the 12.0 retrieval floor, and 3 questions had score $\ge 12.0$ but failed the composite groundedness threshold ($< 5.0$). This validates the layered safety design.

## 3. Development Set Results (30 Questions, Rule Tuned On It)

> [!NOTE]
> The results below represent development-set calibration on [`data/eval/qa_set.json`](file:///e:/IGNIS/data/eval/qa_set.json). These figures must not be cited as generalizable out-of-sample performance.

| ID | Category | Question | Top Score | Top-1 Chunk | Decision |
| :--- | :--- | :--- | :---: | :--- | :---: |
| `qa-01` | Answerable | Why was the BASS-II oxygen sensor reading adjusted, and what instrument was used as the calibration reference? | 39.43 | `NTRS-20210011385-p124-c001` | **ANSWER** (Rank 1) |
| `qa-02` | Answerable | What two portable battery-powered instruments were used in the BASS-II working volume for gas measurements? | 42.11 | `NTRS-20210011385-p014-c001` | **ANSWER** (Rank 1) |
| `qa-03` | Answerable | What does a value of zero Nikon frames shot indicate according to the BASS-II ReadMe? | 18.54 | `NTRS-20210011385-p064-c001` | **ANSWER** (Rank >5) |
| `qa-04` | Answerable | What is the composition of SIBAL cloth, and what forced airflow velocities were planned for Saffire-I and Saffire-III? | 36.5 | `PSI-100-README-p001-c001` | **ANSWER** (Rank 1) |
| `qa-05` | Answerable | What were the dimensions of the rectangular flow tunnel used in Saffire IV, V, and VI? | 25.66 | `NTRS-20240002981-p002-c004` | **ANSWER** (Rank >5) |
| `qa-06` | Answerable | What was the pressurized internal volume of the Cygnus vehicle used for Saffire spacecraft fire experiments? | 25.6 | `NTRS-20240007488-p005-c001` | **ANSWER** (Rank 1) |
| `qa-07` | Answerable | What forced oxidizer flow velocity was supplied across the samples during Saffire-VI tests? | 22.54 | `NTRS-20160000593-p003-c001` | **ANSWER** (Rank 3) |
| `qa-08` | Answerable | What was the initial droplet diameter range tested in the FLEX droplet combustion experiments to observe diffusive and radiative extinction? | 25.67 | `NTRS-20130014061-p009-c001` | **ANSWER** (Rank 2) |
| `qa-09` | Answerable | What effect did reducing ambient pressure while keeping 21% O2 have on the piloted ignition delay time of PMMA in McAllister et al.? | 53.94 | `NTRS-20080013149-p002-c001` | **ANSWER** (Rank 2) |
| `qa-10` | Answerable | What thickness and sample dimensions of black PMMA were tested by McAllister et al. in the FIST apparatus? | 19.82 | `NTRS-20210011385-p055-c003` | **ANSWER** (Rank >5) |
| `qa-11` | Answerable | What is the primary scientific goal of the ACME Flame Design experiment? | 17.57 | `PSI-10-ACME-ISRD-p006-c003` | **ANSWER** (Rank 1) |
| `qa-12` | Answerable | What four burner types were designated for the first set of ACME microgravity experiments? | 21.03 | `PSI-10-ACME-ISRD-p009-c001` | **ANSWER** (Rank 1) |
| `qa-13` | Answerable | What occurs when the forced air flow is stepped down incrementally on a burning PMMA rod in BASS-II microgravity tests? | 36.54 | `NTRS-20210011385-p075-c003` | **ANSWER** (Rank 5) |
| `qa-14` | Answerable | What does the SIBAL acronym stand for in NASA combustion research? | 26.1 | `NTRS-20210011385-p102-c001` | **ANSWER** (Rank 1) |
| `qa-15` | Answerable | What range of heat release rates was observed for practical-scale fires tested in unmanned Cygnus spacecraft during Saffire? | 35.16 | `NTRS-20240007488-p021-c001` | **ANSWER** (Rank 1) |
| `qa-16` | Answerable | What type of igniter wire and electrical operating current was used in BASS-II to ignite solid samples? | 21.19 | `NTRS-20210011385-p101-c003` | **ANSWER** (Rank 2) |
| `qa-17` | Answerable | What combustion gas threshold was exceeded during the two PMMA burns in the Saffire-VI flight test? | 25.79 | `NTRS-20240002981-p003-c002` | **ANSWER** (Rank 2) |
| `qa-18` | Answerable | What range of airflow speeds was used inside the BASS-II flow duct in the Microgravity Science Glovebox? | 38.5 | `NTRS-20210011385-p064-c001` | **ANSWER** (Rank 1) |
| `qa-19` | Answerable | In droplet microgravity combustion (FLEX), what two extinction regimes govern small versus large droplets? | 27.26 | `NTRS-20130014061-p009-c001` | **ANSWER** (Rank 1) |
| `qa-20` | Answerable | What cabin pressure and oxygen concentration conditions define Space Exploration Atmospheres studied to reduce EVA prebreathe times? | 47.77 | `NTRS-20080013149-p002-c001` | **ANSWER** (Rank 1) |
| `qa-21` | Out-of-Scope | What was the battery chemistry and cell capacity of the Apollo Lunar Roving Vehicle (LRV)? | 9.64 | `PSI-10-ACME-ISRD-p016-c003` | **ABSTAIN** |
| `qa-22` | Out-of-Scope | How often are the primary mirror segments of the James Webb Space Telescope aligned by ground control? | 10.64 | `PSI-10-ACME-ISRD-p109-c001` | **ABSTAIN** |
| `qa-23` | Out-of-Scope | What type of reverse osmosis membrane material is used in the ISS Water Recovery System? | 12.06 | `NTRS-20210011385-p011-c002` | **ABSTAIN** |
| `qa-24` | Out-of-Scope | What is the maximum liquid coolant flow rate in the Extravehicular Mobility Unit (EMU) spacesuit cooling garment? | 14.15 | `NTRS-20210011385-p031-c002` | **ABSTAIN** |
| `qa-25` | Out-of-Scope | What was the cumulative solar proton radiation dosage measured by the Curiosity rover during transit to Mars? | 9.53 | `NTRS-20240002981-p006-c001` | **ABSTAIN** |
| `qa-26` | Untested | What is the flame spread rate of PMMA under Lunar partial gravity (0.16 g) at 21% O2? | N/A | N/A | **ABSTAIN** (`gravity (0.16 g)`) |

| `qa-27` | Untested | Does cast PMMA extinguish at 15 cm/s flow in a Mars surface habitat (0.38 g, 70 kPa)? | N/A | N/A | **ABSTAIN** (`gravity (0.38 g), pressure (70 kPa)`) |

| `qa-28` | Untested | How does solid flammability change under hypergravity conditions (2.0 g) in an onboard centrifuge? | N/A | N/A | **ABSTAIN** (`gravity (2.0 g)`) |

| `qa-29` | Untested | What is the flame extinction limit of SIBAL cloth under pure oxygen (100% O2) at 300 kPa pressure in microgravity? | N/A | N/A | **ABSTAIN** (`O2 (100%), pressure (300 kPa)`) |

| `qa-30` | Untested | What is the natural buoyant upward convection velocity of a laminar diffusion flame in zero gravity? | N/A | N/A | **ABSTAIN** (`gravity (0 g buoyant flow = 0)`) |

## 4. TypeScript and Python Engine Parity

To ensure the shipped web client matches offline evaluation, decision parity is verified across all 56 questions (30 development + 26 held-out):
- **Total Decisions Evaluated**: 56
- **Decisions in Exact Agreement**: 56 / 56 (**100.0%**)
- **BM25 Decision Disagreements**: **0**
- **BM25 Top Score Gap**: **0.00** across all evaluated queries
- **Continuous Integration**: Validated in CI via `node --test` in [`qa_holdout.test.ts`](file:///e:/IGNIS/apps/web/src/lib/assistant/__tests__/qa_holdout.test.ts).
