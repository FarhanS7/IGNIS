# IGNIS Evaluation Benchmark Report

Generated from [`data/eval/qa_set.json`](file:///e:/IGNIS/data/eval/qa_set.json) against 930 NASA Physical Sciences Informatics (PSI) corpus chunks ([`data/corpus/chunks.jsonl`](file:///e:/IGNIS/data/corpus/chunks.jsonl)).

## 1. Summary Metrics

| Metric | Evaluated Subset | Score | Target Bar |
| :--- | :--- | :---: | :---: |
| **Recall@1** | 20 Answerable Questions | **85.0%** (17/20) | >= 70% |
| **Recall@3** | 20 Answerable Questions | **90.0%** (18/20) | >= 85% |
| **Recall@5** | 20 Answerable Questions | **95.0%** (19/20) | >= 90% |
| **Mean Reciprocal Rank (MRR)** | 20 Answerable Questions | **0.879** | >= 0.750 |
| **Out-of-Scope Abstention Rate** | 5 Out-of-Scope Questions | **100.0%** (5/5) | 100% |
| **Untested Condition Flagging Rate** | 5 Untested Conditions | **100.0%** (5/5) | 100% |

## 2. Answerable Questions Retrieval Evaluation (20 Questions)

| ID | Question | Gold Chunk(s) | Top-1 Chunk | Rank | Score |
| :--- | :--- | :--- | :--- | :---: | :---: |
| qa-01 | Why was the BASS-II oxygen sensor reading adjusted, and what instrument was used as the calibration reference? | `NTRS-20210011385-p124-c002`, `NTRS-20210011385-p014-c001`, `NTRS-20210011385-p124-c001` | `PSI-25-BASS2-README-p001-c002` | **4** | 21.5 |
| qa-02 | What two portable battery-powered instruments were used in the BASS-II working volume for gas measurements? | `NTRS-20210011385-p014-c001` | `NTRS-20210011385-p014-c001` | **1** | 26.56 |
| qa-03 | What does a value of zero Nikon frames shot indicate according to the BASS-II ReadMe? | `PSI-25-BASS2-README-p001-c002` | `PSI-25-BASS2-README-p001-c002` | **1** | 17.32 |
| qa-04 | What is the composition of SIBAL cloth, and what forced airflow velocities were planned for Saffire-I and Saffire-III? | `PSI-100-README-p001-c001` | `PSI-100-README-p001-c001` | **1** | 39.77 |
| qa-05 | What were the dimensions of the rectangular flow tunnel used in Saffire IV, V, and VI? | `NTRS-20240002981-p004-c001` | `NTRS-20240002981-p004-c001` | **1** | 26.95 |
| qa-06 | What was the pressurized internal volume of the Cygnus vehicle used for Saffire spacecraft fire experiments? | `NTRS-20240007488-p005-c001` | `NTRS-20240007488-p005-c001` | **1** | 29.55 |
| qa-07 | What forced oxidizer flow velocity was supplied across the samples during Saffire-VI tests? | `NTRS-20240002981-p004-c001`, `NTRS-20240007488-p013-c001` | `NTRS-20160000593-p003-c001` | **>5** | 22.75 |
| qa-08 | What was the initial droplet diameter range tested in the FLEX droplet combustion experiments to observe diffusive and radiative extinction? | `NTRS-20130014061-p001-c002` | `NTRS-20130014061-p009-c001` | **3** | 29.49 |
| qa-09 | What effect did reducing ambient pressure while keeping 21% O2 have on the piloted ignition delay time of PMMA in McAllister et al.? | `NTRS-20080013149-p002-c002` | `NTRS-20080013149-p002-c002` | **1** | 41.19 |
| qa-10 | What thickness and sample dimensions of black PMMA were tested by McAllister et al. in the FIST apparatus? | `NTRS-20080013149-p005-c001`, `NTRS-20080013149-p005-c002` | `NTRS-20080013149-p005-c001` | **1** | 17.17 |
| qa-11 | What is the primary scientific goal of the ACME Flame Design experiment? | `PSI-10-ACME-ISRD-p006-c002`, `PSI-10-ACME-ISRD-p006-c003` | `PSI-10-ACME-ISRD-p006-c002` | **1** | 17.71 |
| qa-12 | What four burner types were designated for the first set of ACME microgravity experiments? | `PSI-10-ACME-ISRD-p009-c001` | `PSI-10-ACME-ISRD-p009-c001` | **1** | 19.13 |
| qa-13 | What occurs when the forced air flow is stepped down incrementally on a burning PMMA rod in BASS-II microgravity tests? | `NTRS-20210011385-p097-c002`, `NTRS-20210011385-p074-c002`, `NTRS-20210011385-p066-c001` | `NTRS-20210011385-p074-c002` | **1** | 21.27 |
| qa-14 | What does the SIBAL acronym stand for in NASA combustion research? | `NTRS-20210011385-p102-c001`, `PSI-100-README-p001-c001`, `NTRS-20240002981-p002-c002` | `NTRS-20210011385-p102-c001` | **1** | 22.89 |
| qa-15 | What range of heat release rates was observed for practical-scale fires tested in unmanned Cygnus spacecraft during Saffire? | `NTRS-20240007488-p021-c001`, `NTRS-20240002981-p006-c001` | `NTRS-20240007488-p021-c001` | **1** | 30.35 |
| qa-16 | What type of igniter wire and electrical operating current was used in BASS-II to ignite solid samples? | `PSI-25-BASS2-SRD-p001-c001`, `NTRS-20210011385-p013-c002` | `PSI-25-BASS2-SRD-p001-c001` | **1** | 14.07 |
| qa-17 | What combustion gas threshold was exceeded during the two PMMA burns in the Saffire-VI flight test? | `NTRS-20240002981-p005-c001`, `NTRS-20240002981-p005-c002`, `NTRS-20240007488-p018-c001` | `NTRS-20240002981-p005-c001` | **1** | 14.56 |
| qa-18 | What range of airflow speeds was used inside the BASS-II flow duct in the Microgravity Science Glovebox? | `NTRS-20210011385-p064-c002`, `NTRS-20210011385-p064-c001` | `NTRS-20210011385-p064-c001` | **1** | 32.14 |
| qa-19 | In droplet microgravity combustion (FLEX), what two extinction regimes govern small versus large droplets? | `NTRS-20130014061-p009-c001`, `NTRS-20130014061-p001-c002` | `NTRS-20130014061-p009-c001` | **1** | 32.63 |
| qa-20 | What cabin pressure and oxygen concentration conditions define Space Exploration Atmospheres studied to reduce EVA prebreathe times? | `NTRS-20080013149-p002-c001`, `NTRS-20080013149-p004-c001` | `NTRS-20080013149-p002-c001` | **1** | 40.42 |

## 3. Out-of-Scope Questions Abstention Evaluation (5 Questions)

Questions with zero grounding in microgravity combustion, spacesuit fire safety, or droplet physics. The retrieval score must fall below threshold or trigger extractive low-evidence fallback.

| ID | Out-of-Scope Question | Top Retrieved Chunk | Top Score | Abstained? |
| :--- | :--- | :--- | :---: | :---: |
| qa-21 | What was the battery chemistry and cell capacity of the Apollo Lunar Roving Vehicle (LRV)? | `PSI-10-ACME-ISRD-p016-c003` | 9.64 | **YES** |
| qa-22 | How often are the primary mirror segments of the James Webb Space Telescope aligned by ground control? | `PSI-10-ACME-ISRD-p031-c003` | 11.04 | **YES** |
| qa-23 | What type of reverse osmosis membrane material is used in the ISS Water Recovery System? | `NTRS-20210011385-p011-c002` | 12.23 | **YES** |
| qa-24 | What is the maximum liquid coolant flow rate in the Extravehicular Mobility Unit (EMU) spacesuit cooling garment? | `NTRS-20210011385-p064-c002` | 17.0 | **YES** |
| qa-25 | What was the cumulative solar proton radiation dosage measured by the Curiosity rover during transit to Mars? | `NTRS-20240002981-p006-c001` | 7.65 | **YES** |

## 4. Untested Condition Environmental Boundary Recognition (5 Questions)

Questions asking about regimes outside the flight-tested record (e.g. Lunar 0.16 g, Mars 0.38 g, high pressure > 101.3 kPa, centrifugal hypergravity, pure oxygen 100%). System must abstain from asserting flammability or boundary values and explicitly report the untested axis.

| ID | Untested Scenario Question | Untested Axes | Guardrail Rationale |
| :--- | :--- | :--- | :--- |
| qa-26 | What is the flame spread rate of PMMA under Lunar partial gravity (0.16 g) at 21% O2? | `gravity (0.16 g)` | Untested condition: All flight combustion experiments in the tested record (BASS-II, Saffire, FLEX) were performed in microgravity (~0 g). Lunar partial gravity (0.16 g) has not been tested in flight solid combustion data. |
| qa-27 | Does cast PMMA extinguish at 15 cm/s flow in a Mars surface habitat (0.38 g, 70 kPa)? | `gravity (0.38 g), pressure (70 kPa)` | Untested condition: Neither Martian partial gravity (0.38 g) nor sub-atmospheric 70 kPa pressure was tested in BASS-II flight runs (which were microgravity ~0 g with assumed 101.3 kPa pressure). |
| qa-28 | How does solid flammability change under hypergravity conditions (2.0 g) in an onboard centrifuge? | `gravity (2.0 g)` | Untested condition: The NASA PSI flight dataset contains exclusively freefall microgravity (~0 g) data; hypergravity (2.0 g) centrifuge combustion data is absent from the flight corpus. |
| qa-29 | What is the flame extinction limit of SIBAL cloth under pure oxygen (100% O2) at 300 kPa pressure in microgravity? | `O2 (100%), pressure (300 kPa)` | Untested condition: Flight tests for SIBAL (Saffire, BASS-II) explored oxygen concentrations up to ~34% at nominal or reduced cabin pressures (56-101.3 kPa); 100% pure oxygen at 300 kPa is outside the tested envelope. |
| qa-30 | What is the natural buoyant upward convection velocity of a laminar diffusion flame in zero gravity? | `gravity (0 g buoyant flow = 0)` | Untested / physical impossibility: In microgravity (~0 g), buoyant convection is suppressed to zero because buoyancy requires a gravitational body force (g = 0); all airflow in the corpus is forced ventilation. |
