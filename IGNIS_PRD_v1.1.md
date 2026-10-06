# IGNIS Product Requirements Document (PRD)

**Product:** IGNIS - Intelligent Guidance from NASA Ignition Studies  
**Challenge:** NASA International Space Apps Challenge 2026 - *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Document version:** 1.1  
**Date:** 26 September 2026  
**Status:** Hackathon build specification  
**Primary platform:** Responsive web application  
**Public-facing tagline:** *Build a habitat. Start a fire. Discover the science.*  
**Technical positioning:** Evidence-grounded AI for microgravity fire-safety research and education

---

## 1. Executive Summary

IGNIS is an evidence-grounded AI web experience that turns NASA microgravity combustion research into an interactive journey that is understandable to non-specialists without sacrificing scientific traceability.

Version 1.1 combines the original evidence-intelligence product with a more playful and accessible experience layer. A visitor enters through one of two modes:

1. **Build a Habitat** - choose a space destination, configure the habitat environment, and explore how comparable NASA experiments change the evidence profile for flame spread, sustained burning, extinction, and other observed combustion behaviors.
2. **Explore Fire** - discover microgravity fire science through guided stories, animations, real NASA experiment media, optional narration, and evidence-backed questions.

The technical backbone remains the same: structured NASA experiment data, a comparable-evidence filter, transparent similarity ranking, an Experiment Explorer, one real computer-vision analysis, and retrieval-augmented AI answers with visible sources.

IGNIS is explicitly **not** a certified fire-safety calculator, probability model, computational fluid-dynamics simulator, or operational mission decision system. It is an evidence intelligence and science-communication system.

### 1.1 Product thesis

> NASA experiments should remain the source of truth. AI should make those experiments easier to find, compare, visualize, explain, and learn from.

### 1.2 North-star experience

```text
                           IGNIS
                             |
                  +----------+----------+
                  |                     |
          BUILD A HABITAT          EXPLORE FIRE
                  |                     |
       destination + habitat       guided fire stories
                  |                     |
                  +----------+----------+
                             |
                 NASA EVIDENCE LAYER
                             |
          comparable-evidence eligibility filter
                             |
               evidence similarity ranking
                             |
                 experiment / media explorer
                             |
            CV-derived analysis + Ask IGNIS
                             |
              source-backed interpretation
```

---

## 2. Background and Challenge Alignment

The Space Apps challenge asks teams to create an interactive, AI-powered dashboard that summarizes, ranks, and interprets microgravity combustion findings to deliver fire-safety insights for human space exploration.

IGNIS addresses the challenge through five connected capabilities:

1. **Summarize** - concise experiment records and source-grounded summaries.
2. **Rank** - scenario-to-experiment similarity ranking after a scientific comparability check.
3. **Interpret** - source-backed natural-language synthesis, comparison, and limitations.
4. **Visualize** - evidence-guided habitat behavior visualization plus real experiment video analysis.
5. **Teach** - guided fire stories that make microgravity combustion understandable to students, judges, and the public.

Primary challenge URL:

`https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall-ai-powered-fire-safety-insights-from-microgravity-combustion-data/`

---

## 3. Product Principles

### P1. Evidence before generation

Scientific claims shown by IGNIS must be grounded in retrieved source records or clearly labeled as interpretation.

### P2. Similarity is not probability

An evidence similarity score describes how closely a source experiment matches selected scenario factors. It is **not** a probability of ignition, injury, mission failure, or safety.

### P3. Comparable before similar

The system must first determine whether an experiment is scientifically eligible for comparison. Only eligible or explicitly caveated records proceed to weighted similarity ranking.

### P4. Show why

Every ranked experiment must expose the factors that increased or decreased its relevance.

### P5. Unknown stays unknown

Missing source values remain unknown. IGNIS must never invent a value simply to complete a record or animation.

### P6. Separate environment from habitat design

Destination properties such as gravity and external environment are different from interior habitat settings such as cabin oxygen, pressure, airflow, and material.

### P7. Visualization is not simulation

Any animated habitat fire or flame response is an **evidence-guided visualization**, not a validated physical simulation, unless a future validated physics model is introduced.

### P8. AI output must be inspectable

Answers must show supporting experiments/passages and allow navigation to the evidence.

### P9. Source roles must stay distinct

NASA sources used for scientific evidence, contextual media, and Earth-observation education must not be silently blended into one scientific score.

### P10. One excellent path beats a broad incomplete product

The hackathon MVP prioritizes one stable, compelling Build-a-Habitat journey and one strong Explore story over comprehensive ingestion or many half-finished features.

---

## 4. Product Positioning

### 4.1 Public-facing statement

**IGNIS lets people build a space habitat, change fire-relevant conditions, and discover what NASA experiments show under comparable conditions.**

### 4.2 Technical statement

**IGNIS is a mission-to-evidence interface for NASA microgravity combustion research, combining scientific comparability, explainable evidence matching, multimodal experiment exploration, and grounded AI synthesis.**

### 4.3 What IGNIS is

- an evidence discovery and comparison system;
- an interactive educational experience;
- a transparent scenario-to-experiment matching engine;
- a visual explorer for real experiment media and derived measurements;
- a source-backed AI research assistant.

### 4.4 What IGNIS is not

- a certified spacecraft fire-safety system;
- a fire probability or mission-risk calculator;
- a claim that a habitat is "safe" or "unsafe";
- a general-purpose physical fire simulator;
- a replacement for combustion scientists or engineering review;
- a chatbot that answers scientific questions from model memory alone.

---

## 5. Goals

### 5.1 Product goals

- Let a first-time user understand the product within 30 seconds.
- Let a user choose a destination and configure a habitat scenario in under 30 seconds.
- Return scientifically eligible NASA experiment matches with transparent scoring reasons.
- Present a clear Fire Behavior Profile rather than a misleading risk percentage.
- Let users inspect experiment conditions, observations, findings, source references, and media.
- Provide at least one real computer-vision analysis of NASA experiment video.
- Answer natural-language questions using retrieved evidence only for scientific claims.
- Provide at least one guided Explore Fire story that combines explanation, visuals, and real NASA sources.
- Integrate required NASA data channels with explicit provenance and source roles.
- Deliver a polished, judge-friendly story that is engaging to non-specialists.

### 5.2 Hackathon success criteria

- Build-a-Habitat path works without manual backend intervention.
- Comparable-evidence filtering prevents obviously invalid matches from appearing as high-confidence evidence.
- Every scientific conclusion shown in the demo exposes its evidence.
- At least one video analysis produces a useful time-series metric.
- At least one Explorer story is complete and source-linked.
- Required NASA Open Data, NASA API, and NASA Earthdata integrations are visible in the product or source registry.
- The core two-minute demo does not rely on live ingestion or fragile external calls.
- A first-time viewer can explain IGNIS in one sentence after the demo.

---

## 6. Non-Goals

IGNIS v1.1 will not:

- certify spacecraft materials or habitat designs;
- calculate absolute fire probability or mission risk;
- tell a user that a habitat is "safe" or "unsafe";
- run CFD or a validated general fire-physics simulation;
- infer missing scientific values as sourced facts;
- claim microgravity experiments directly predict lunar or Martian partial-gravity outcomes;
- ingest every NASA combustion dataset during the hackathon;
- make prescriptive operational recommendations;
- use Earth-observation fire data as if it were microgravity combustion evidence;
- guarantee that AI-derived flame measurements are scientifically validated beyond the demonstration dataset;
- build high-fidelity 3D planetary exploration or a full game engine.

---

## 7. Target Users and Jobs To Be Done

### 7.1 Primary hackathon user - curious mission/research analyst

**Job:** "Given a habitat scenario, show me what NASA has actually observed under the most comparable conditions, and explain the limits of that comparison."

Needs:
- fast evidence discovery;
- scientific comparability;
- transparent similarity;
- source traceability;
- visible limitations and mismatches.

### 7.2 Educator / student

**Job:** "Help me understand why fire behaves differently in space through a visual, interactive story."

Needs:
- low jargon;
- animations and real experiment media;
- clear cause/effect explanations;
- definitions and source links.

### 7.3 Combustion researcher

**Job:** "Help me discover related experiments, media, and findings without manually traversing many records."

Needs:
- metadata search;
- structured comparison;
- provenance;
- related experiment discovery.

### 7.4 Space enthusiast / public visitor

**Job:** "Let me explore real NASA fire research in a way that feels engaging instead of reading technical repositories."

Needs:
- guided exploration;
- visually compelling interactions;
- stories;
- optional Ask IGNIS assistance.

---

## 8. Information Architecture

| Route | Purpose | Primary CTA |
|---|---|---|
| `/` | Landing / mode selection | Build a Habitat / Explore Fire |
| `/build` | Destination + habitat configuration | Analyze with NASA Evidence |
| `/evidence` | Fire Behavior Profile + ranked evidence | Explain / Open Experiment |
| `/experiment/[id]` | Experiment Explorer | Inspect Evidence / Ask IGNIS |
| `/explore` | Fire Stories library | Open Story |
| `/explore/[slug]` | Guided story experience | Continue / See Experiment / Ask IGNIS |
| `/ask` | Optional standalone research assistant | Ask Question |
| `/about` | Method, source policy, disclaimers | Learn how IGNIS works |

Optional stretch route:

| Route | Purpose |
|---|---|
| `/graph` | Interactive evidence knowledge graph |

---

## 9. Core User Journeys

### Journey J1 - Build a Habitat to evidence

1. User opens IGNIS.
2. User selects **Build a Habitat**.
3. User chooses a destination preset such as orbital/deep-space, Moon, or Mars.
4. IGNIS displays destination context separately from habitat controls.
5. User keeps defaults or changes oxygen, pressure, airflow, material, or objective.
6. User clicks **Analyze with NASA Evidence**.
7. Backend applies the comparable-evidence eligibility filter.
8. Eligible records are ranked by evidence similarity.
9. User sees a **Fire Behavior Profile**, evidence coverage, strongest matches, and mismatches.
10. An evidence-guided habitat visualization changes to reflect the evidence category, with a persistent non-simulation label.
11. User clicks **Why?** or opens a top experiment.
12. Experiment Explorer shows sourced conditions, findings, media, and derived analysis.
13. User asks IGNIS a question and receives a source-backed answer with limitations.

### Journey J2 - Explore Fire story

1. User opens IGNIS.
2. User selects **Explore Fire**.
3. User chooses a story, e.g. *Why does fire look different in microgravity?*
4. Story combines short text, illustrations/animation, NASA media, and evidence cards.
5. User can open the source experiment behind a story point.
6. User can ask IGNIS a question scoped to the current story.
7. Optional audio narration reads the story.

### Journey J3 - Fire from Space vs Fire in Space

1. User opens an Explorer story comparing how NASA studies fire at different scales.
2. Earth-observation content uses NASA Earthdata remote-sensing data or imagery.
3. Microgravity content uses NASA combustion experiment evidence.
4. UI explicitly labels these as different evidence domains.
5. Earthdata content does not affect microgravity evidence similarity.

---

## 10. Build-a-Habitat Experience

### 10.1 Destination presets

P0 destination set:

- **Orbital / deep-space habitat** - preferred canonical demo because the evidence base is closest to microgravity.
- **Moon habitat** - partial-gravity destination; must display gravity-transfer limitations where evidence is microgravity-only.
- **Mars habitat** - partial-gravity destination; same limitation rule.

Stretch:

- custom habitat;
- ISS / station context;
- other mission presets only if supported by clear source/context data.

### 10.2 Environment vs habitat fields

**Destination context** (not all manually editable):

- destination;
- gravity class/value;
- external atmospheric/vacuum context where applicable;
- mission-context label.

**Habitat interior** (editable when supported):

- oxygen concentration;
- cabin pressure;
- airflow / ventilation;
- material / fuel class;
- geometry where usable;
- scientific objective: ignition / flame spread / extinction / sustained burning.

### 10.3 Preset rule

Preset habitat values are **reference scenario defaults**, not claims that every real mission uses those exact values. The UI must label them as presets and permit manual editing.

### 10.4 Fire Behavior Profile

The product must not show a generic `Risk = 87%` meter.

Instead show evidence-oriented outputs such as:

```text
FIRE BEHAVIOR PROFILE

Flame-spread evidence       Elevated / Mixed / Limited
Sustained-burning evidence  Elevated / Mixed / Limited
Extinction evidence         Strong / Moderate / Limited
Comparable experiments      8
Evidence coverage           High / Medium / Low
```

The exact behavior dimensions displayed depend on available evidence. Unsupported dimensions remain hidden or labeled insufficient evidence.

### 10.5 Evidence-guided habitat visualization

The habitat may visually show a larger/smaller flame, warning glow, or damage animation for storytelling impact only when mapped to evidence categories.

Persistent label:

> **Illustrative evidence-guided visualization - not a validated physical simulation.**

The visualization must never be used as the sole source of a scientific claim.

### 10.6 Why panel

Every high-level behavior result exposes:

- strongest contributing scenario factors;
- closest experiment(s);
- mismatches;
- evidence coverage;
- source link(s);
- whether the interpretation is observed, derived, similarity-based, or AI synthesis.

---

## 11. Explorer / Fire Stories

### 11.1 Purpose

Explorer transforms technical fire-science concepts into short guided narratives while preserving the ability to inspect real evidence.

### 11.2 Initial story set

P0:

- **Why does fire behave differently in microgravity?**
- **Fire from Space vs Fire in Space** - required bridge to Earthdata context.

P1:

- What happens when airflow changes?
- Why can some microgravity flames look rounder?
- How do NASA experiments study spacecraft fire safely?
- What did Saffire investigate?
- What did FLEX investigate?

### 11.3 Story components

A story may contain:

- 20-60 second reading segments;
- simple animation or interactive diagram;
- real NASA experiment image/video;
- one evidence card;
- optional narration/audio;
- one suggested Ask IGNIS question;
- source links.

### 11.4 Audio

Audio narration is **P2** unless core evidence work is complete. Text content must remain fully usable without audio.

---

## 12. NASA Data Source Policy

IGNIS must use data or content from the NASA data channels specified by the project team:

- NASA Earthdata remote sensors: `https://earthdata.nasa.gov/user-resources/remote-sensors`
- NASA Open Data: `https://data.nasa.gov`
- NASA APIs: `https://api.nasa.gov`

The product must preserve source provenance and clearly separate source roles.

### 12.1 Source roles

| Source role | Intended use | May influence microgravity evidence matching? |
|---|---|---|
| Primary scientific combustion evidence | Microgravity experiment metadata, findings, source documents, experiment media | Yes |
| NASA Open Data catalog / dataset registry | Dataset discovery, identifiers, metadata, links to authoritative NASA repositories | Yes, when the linked underlying dataset is scientific evidence |
| NASA API enrichment | Public NASA media, contextual metadata, imagery, or supported developer services | No by default; only if the API response itself is part of a reviewed scientific source |
| NASA Earthdata context | Earth-observation sensor data/imagery for the Explorer story | No |
| IGNIS-derived analytics | CV measurements or normalized transformations | May support exploration, but must be labeled derived |

### 12.2 Required hackathon integrations

P0 evidence of use:

- At least one dataset/source discovered or registered through **NASA Open Data**.
- At least one visible product element enriched by a supported **NASA API**.
- At least one Explorer visualization/story element using **NASA Earthdata remote-sensing data or imagery**.
- All three source families represented in the in-app Source/Provenance view.

### 12.3 Earthdata boundary

Earth-observation fire or thermal data is educational/contextual. It must **not** be combined with spacecraft microgravity experiments into a single evidence-similarity score unless a scientifically reviewed mapping is later created.

---

## 13. Evidence Layer Model

Every visible scientific statement belongs to one evidence level.

| Level | Label | Meaning |
|---|---|---|
| A | **Observed / NASA Source** | Directly reported or measured in a NASA source record |
| B | **Normalized Source Data** | Unit-converted or structured from a source without changing scientific meaning |
| C | **Derived by IGNIS** | Computed by IGNIS, e.g. CV flame area or a deterministic transformation |
| D | **Similarity-Based Interpretation** | Inference based on comparable experiments and explicit match logic |
| E | **AI Synthesis** | LLM-generated explanation constrained by retrieved evidence |

UI hierarchy must make Level A/B evidence visually strongest and Level E synthesis visibly secondary.

---

## 14. Comparable-Evidence Filter

### 14.1 Purpose

Weighted similarity alone is insufficient because numerically similar experiments may be scientifically inappropriate to compare. The filter determines eligibility before ranking.

### 14.2 Eligibility checks

Each check returns `eligible`, `eligible_with_warning`, or `ineligible`.

P0 checks:

- fuel/material family compatibility;
- target phenomenon/objective compatibility;
- gravity-environment compatibility or explicit gravity-mismatch warning;
- experiment/run contains at least one comparable environmental factor;
- data-quality/source record passes minimum provenance requirements.

P1 checks:

- geometry compatibility;
- scale/regime compatibility;
- ignition method compatibility;
- forced-flow vs quiescent condition compatibility.

### 14.3 Gravity handling

- Microgravity scenario + microgravity experiment -> eligible.
- Lunar/Martian scenario + microgravity experiment -> `eligible_with_warning` only if the product clearly states that gravity is not directly matched and confidence is reduced.
- Earth-gravity experiment -> included only if the selected story or scientific objective explicitly permits it.

### 14.4 Filter output

```json
{
  "status": "eligible_with_warning",
  "reasons": ["same fuel family", "same objective"],
  "warnings": ["gravity environment differs"],
  "excludedBecause": []
}
```

---

## 15. Evidence Matching Specification

### 15.1 Scenario schema

```ts
type Scenario = {
  destination?: "orbital" | "moon" | "mars" | "custom";
  gravityClass?: string;
  fuelType?: string;
  material?: string;
  oxygenPct?: number;
  pressureKpa?: number;
  airflowCmS?: number;
  objectives?: string[];
  geometry?: string;
};
```

### 15.2 Factor scoring

Each factor returns:

- score in `[0,1]`; or
- `null` when comparison cannot be made.

Example numeric similarity:

```text
numeric_similarity(x, y, tolerance) = max(0, 1 - abs(x-y)/tolerance)
```

Example categorical similarity:

```text
exact match             -> 1.00
same parent class       -> 0.70
reviewed related class  -> 0.40
known mismatch          -> 0.00
missing                 -> null
```

### 15.3 Default weights

```json
{
  "material_or_fuel": 0.30,
  "oxygen": 0.20,
  "airflow": 0.20,
  "pressure": 0.15,
  "objective": 0.10,
  "geometry": 0.05
}
```

Gravity is handled primarily by the eligibility filter and warning/confidence system rather than silently folded into the same score.

Weights are renormalized across available comparable factors.

### 15.4 Score formula

For available factors `F`:

```text
score = sum(weight_i * similarity_i) / sum(weight_i), for i in F
```

### 15.5 Coverage

```text
coverage = sum(original_weight_i for comparable factors)
```

Illustrative confidence mapping:

```text
coverage >= 0.80 and no major comparability warning -> High
coverage >= 0.55                                  -> Medium
otherwise                                         -> Low
```

A major gravity or regime mismatch can cap confidence even if numeric coverage is high.

### 15.6 Match acceptance criteria

- Same input + dataset/scoring version yields deterministic ranking.
- Ineligible experiments never appear as high-confidence evidence matches.
- Missing values do not become zero.
- Every score can be reconstructed from returned factor scores.
- UI never labels evidence similarity as `risk`, `safety`, or `probability`.
- High similarity with low coverage or a major warning is visibly caveated.

---

## 16. Functional Requirements

Priority definitions:

- **P0** - required for demo/MVP.
- **P1** - high-value after core path is stable.
- **P2** - stretch.

### 16.1 Landing / Mode Selection

| ID | Priority | Requirement |
|---|---|---|
| FR-LND-001 | P0 | Landing page presents two primary options: Build a Habitat and Explore Fire. |
| FR-LND-002 | P0 | Each option has a one-sentence explanation understandable without combustion knowledge. |
| FR-LND-003 | P0 | A visible research/demo disclaimer is accessible from the landing page. |

### 16.2 Build a Habitat

| ID | Priority | Requirement |
|---|---|---|
| FR-HAB-001 | P0 | User can choose at least orbital/deep-space, Moon, and Mars destination presets. |
| FR-HAB-002 | P0 | Destination context is displayed separately from habitat interior settings. |
| FR-HAB-003 | P0 | User can edit only parameters supported by the curated matching schema. |
| FR-HAB-004 | P0 | User can set/select material/fuel class, oxygen, pressure, airflow, and objective where supported. |
| FR-HAB-005 | P0 | Numeric inputs display units and validate bounds. |
| FR-HAB-006 | P0 | Preset values are labeled as reference scenario defaults, not universal mission values. |
| FR-HAB-007 | P0 | User can restore preset defaults. |
| FR-HAB-008 | P0 | Submit action is labeled `Analyze with NASA Evidence`. |
| FR-HAB-009 | P1 | User can create a custom habitat without a destination preset. |
| FR-HAB-010 | P2 | User can save/share a scenario URL. |

### 16.3 Comparable-Evidence Filter

| ID | Priority | Requirement |
|---|---|---|
| FR-CEF-001 | P0 | Every experiment/run receives an eligibility state before similarity scoring. |
| FR-CEF-002 | P0 | Ineligible records are excluded from default results. |
| FR-CEF-003 | P0 | Warning-eligible records expose the warning in the result card. |
| FR-CEF-004 | P0 | Gravity mismatch must be visible for Moon/Mars scenarios matched to microgravity data. |
| FR-CEF-005 | P1 | Geometry/regime compatibility is included where data supports it. |

### 16.4 Evidence Match Engine

| ID | Priority | Requirement |
|---|---|---|
| FR-EME-001 | P0 | Normalize scenario inputs into matching schema. |
| FR-EME-002 | P0 | Compute evidence similarity for eligible records. |
| FR-EME-003 | P0 | Return top N ranked experiment runs. |
| FR-EME-004 | P0 | Every result includes factor-level score explanation. |
| FR-EME-005 | P0 | Every result includes mismatches/unavailable fields. |
| FR-EME-006 | P0 | Score is labeled `Evidence Similarity`. |
| FR-EME-007 | P0 | Coverage and confidence are returned separately from similarity. |
| FR-EME-008 | P1 | Text-embedding similarity may augment structured scoring. |
| FR-EME-009 | P2 | Advanced users can inspect/adjust factor weights. |

### 16.5 Fire Behavior Profile

| ID | Priority | Requirement |
|---|---|---|
| FR-FBP-001 | P0 | Results page shows evidence-based behavior dimensions rather than a generic risk score. |
| FR-FBP-002 | P0 | Unsupported behavior dimensions are hidden or labeled insufficient evidence. |
| FR-FBP-003 | P0 | Every behavior label links to the evidence used. |
| FR-FBP-004 | P0 | `Why?` opens factor explanation, strongest sources, mismatches, and limitations. |
| FR-FBP-005 | P0 | UI never states `safe`, `unsafe`, or absolute risk. |

### 16.6 Evidence-Guided Visualization

| ID | Priority | Requirement |
|---|---|---|
| FR-EGV-001 | P0 | The habitat visualization can react to selected evidence categories. |
| FR-EGV-002 | P0 | Persistent label states that the visualization is illustrative and not a validated physical simulation. |
| FR-EGV-003 | P0 | Visual state is derived from an auditable category/rule, not free-form LLM output. |
| FR-EGV-004 | P1 | User can toggle visualization off and inspect evidence-only mode. |
| FR-EGV-005 | P2 | Richer 2D/3D animations respond to selected factors. |

### 16.7 Experiment Explorer

| ID | Priority | Requirement |
|---|---|---|
| FR-EXP-001 | P0 | Show experiment identity and concise purpose. |
| FR-EXP-002 | P0 | Show normalized conditions with units and evidence-level labels. |
| FR-EXP-003 | P0 | Show observed findings separately from AI synthesis. |
| FR-EXP-004 | P0 | Show source identifiers and source links. |
| FR-EXP-005 | P0 | Display at least one supported media asset for demo experiment. |
| FR-EXP-006 | P0 | CV-derived metrics carry `Derived by IGNIS` label. |
| FR-EXP-007 | P1 | Show related experiments and reasons. |
| FR-EXP-008 | P1 | Ask a question scoped to current experiment. |

### 16.8 AI Flame Vision

| ID | Priority | Requirement |
|---|---|---|
| FR-CV-001 | P0 | Process at least one real experiment video into frames. |
| FR-CV-002 | P0 | Detect/segment flame region sufficiently for stable demo. |
| FR-CV-003 | P0 | Produce at least one metric over time, preferably flame area ratio. |
| FR-CV-004 | P0 | Persist derived measurements as time series. |
| FR-CV-005 | P0 | Video time and chart cursor are synchronized. |
| FR-CV-006 | P1 | Produce flame extent/height and centroid movement. |
| FR-CV-007 | P1 | Estimate approximate extinction timestamp when supported. |
| FR-CV-008 | P2 | Support multiple videos/families. |

### 16.9 Ask IGNIS

| ID | Priority | Requirement |
|---|---|---|
| FR-AI-001 | P0 | User can submit a natural-language research question. |
| FR-AI-002 | P0 | Backend retrieves relevant source material before generation. |
| FR-AI-003 | P0 | Response contains concise answer, evidence, limitations, and confidence. |
| FR-AI-004 | P0 | Source facts and AI synthesis are visually separated. |
| FR-AI-005 | P0 | If evidence is weak, the answer says so instead of filling gaps from model memory. |
| FR-AI-006 | P1 | Questions can be scoped to scenario, experiment, or story. |
| FR-AI-007 | P1 | Semantic reranking after retrieval. |
| FR-AI-008 | P2 | Suggested follow-up questions based on retrieved evidence. |

### 16.10 Explore Fire

| ID | Priority | Requirement |
|---|---|---|
| FR-EXF-001 | P0 | Explorer has at least one complete microgravity fire story. |
| FR-EXF-002 | P0 | Story includes at least one real NASA source/media link. |
| FR-EXF-003 | P0 | Story content identifies whether a claim is observed evidence or explanation. |
| FR-EXF-004 | P0 | `Fire from Space vs Fire in Space` story uses Earthdata context and clearly separates it from microgravity evidence. |
| FR-EXF-005 | P1 | Story contains interactive animation/diagram. |
| FR-EXF-006 | P2 | Optional audio narration. |

### 16.11 NASA Source Integrations

| ID | Priority | Requirement |
|---|---|---|
| FR-NAS-001 | P0 | Store source registry/provider for every ingested item. |
| FR-NAS-002 | P0 | At least one source/dataset is linked to NASA Open Data. |
| FR-NAS-003 | P0 | At least one visible enrichment uses a NASA API. |
| FR-NAS-004 | P0 | At least one Explorer visual/story uses NASA Earthdata remote-sensing data or imagery. |
| FR-NAS-005 | P0 | Earthdata content is excluded from microgravity matching. |
| FR-NAS-006 | P0 | Source/Provenance view distinguishes primary scientific, contextual, media, and derived content. |

---

## 17. UX Requirements

### 17.1 Evidence hierarchy

1. **Observed / NASA Source** - strongest authority.
2. **Normalized Source Data** - still source-derived, transformed transparently.
3. **Derived by IGNIS** - analytics, clearly labeled.
4. **Evidence Similarity** - relevance, not risk.
5. **AI Synthesis** - helpful interpretation, always linked to evidence.

### 17.2 Build screen

- Destination selection should be visual and playful, but controls remain simple.
- Maximum 5-6 visible habitat controls in default view.
- Every numeric field shows units.
- Unsupported parameters remain hidden rather than creating false precision.
- `Environment` and `Habitat` are visually separated.
- Primary CTA: `Analyze with NASA Evidence`.

### 17.3 Results screen

Recommended order:

```text
Destination / Habitat summary

FIRE BEHAVIOR PROFILE
  behavior labels + evidence coverage

ILLUSTRATIVE HABITAT VISUALIZATION
  non-simulation label

WHY?
  factor contributions + warnings

CLOSEST NASA EVIDENCE
  ranked experiments

[Open Experiment] [Ask IGNIS]
```

### 17.4 Experiment card

```text
Experiment name
Evidence Similarity: 0.91
Coverage: 0.85
Confidence: High
Eligibility: Comparable

Why it matched
+ similar oxygen
+ comparable airflow
+ same fuel family

Important mismatch
- different geometry

[View experiment]
```

### 17.5 Empty/error states

Intentional states required for:

- no comparable experiments;
- gravity mismatch / low transferability;
- insufficient metadata;
- source unavailable;
- RAG evidence below threshold;
- video analysis unavailable;
- Earthdata or API enrichment temporarily unavailable;
- backend/network error.

No empty state may silently fall back to invented content.

---

## 18. Data Model

### 18.1 `data_sources`

```sql
data_sources (
  id uuid primary key,
  registry text not null,
  source_role text not null,
  provider_name text,
  dataset_identifier text,
  api_name text,
  sensor_name text,
  source_url text,
  retrieved_at timestamptz,
  license_or_access text,
  provenance jsonb
)
```

Suggested `registry` values:

- `NASA_OPEN_DATA`
- `NASA_API`
- `NASA_EARTHDATA`
- `NASA_PSI`
- `OTHER_NASA_REPOSITORY`

Suggested `source_role` values:

- `primary_scientific`
- `normalized_scientific`
- `contextual`
- `media`
- `earth_observation_context`
- `derived_by_ignis`

### 18.2 `experiments`

```sql
experiments (
  id uuid primary key,
  external_id text,
  source_id uuid references data_sources(id),
  experiment_family text not null,
  title text not null,
  summary text,
  mission_platform text,
  gravity_environment text,
  objectives text[],
  source_url text,
  created_at timestamptz,
  updated_at timestamptz
)
```

### 18.3 `experiment_runs`

```sql
experiment_runs (
  id uuid primary key,
  experiment_id uuid references experiments(id),
  run_label text,
  fuel_type text,
  material text,
  geometry text,
  gravity_environment text,
  oxygen_pct double precision,
  pressure_kpa double precision,
  airflow_cm_s double precision,
  ignition_observed boolean,
  extinction_observed boolean,
  flame_spread_observed boolean,
  observation_summary text,
  source_url text,
  data_quality text,
  provenance jsonb
)
```

### 18.4 `habitat_presets`

```sql
habitat_presets (
  id uuid primary key,
  slug text unique,
  display_name text,
  destination text,
  gravity_class text,
  gravity_value_g double precision,
  external_environment_summary text,
  default_oxygen_pct double precision,
  default_pressure_kpa double precision,
  default_airflow_cm_s double precision,
  default_material text,
  disclaimer text,
  provenance jsonb
)
```

### 18.5 `source_documents`

```sql
source_documents (
  id uuid primary key,
  source_id uuid references data_sources(id),
  experiment_id uuid references experiments(id),
  title text,
  document_type text,
  source_url text,
  citation_label text,
  raw_text_location text,
  checksum text
)
```

### 18.6 `source_chunks`

```sql
source_chunks (
  id uuid primary key,
  document_id uuid references source_documents(id),
  experiment_id uuid references experiments(id),
  chunk_index integer,
  content text,
  embedding vector,
  metadata jsonb
)
```

### 18.7 `media_assets`

```sql
media_assets (
  id uuid primary key,
  source_id uuid references data_sources(id),
  experiment_id uuid references experiments(id),
  run_id uuid references experiment_runs(id),
  media_type text,
  source_url text,
  local_or_cached_url text,
  duration_seconds double precision,
  metadata jsonb
)
```

### 18.8 `cv_measurements`

```sql
cv_measurements (
  id uuid primary key,
  media_asset_id uuid references media_assets(id),
  timestamp_seconds double precision,
  flame_area_px double precision,
  flame_area_ratio double precision,
  flame_height_px double precision,
  centroid_x double precision,
  centroid_y double precision,
  confidence double precision,
  model_version text
)
```

### 18.9 `stories`

```sql
stories (
  id uuid primary key,
  slug text unique,
  title text,
  summary text,
  story_type text,
  source_ids uuid[],
  experiment_ids uuid[],
  earthdata_context jsonb,
  sections jsonb,
  published boolean
)
```

### 18.10 Provenance object

```json
{
  "field": "oxygen_pct",
  "value": 21.0,
  "source_type": "normalized",
  "source_id": "...",
  "source_document_id": "...",
  "source_location": "table 2 / row 14",
  "normalization": "converted from fraction to percent",
  "reviewed": true
}
```

Allowed `source_type` values:

- `direct`
- `normalized`
- `manual_extraction`
- `ai_extraction_reviewed`
- `derived_by_ignis`

---

## 19. RAG / Ask IGNIS Specification

### 19.1 Retrieval corpus

May contain:

- experiment summaries;
- normalized run metadata;
- source document text;
- publication sections where permitted;
- curated investigator findings;
- approved experiment notes;
- story-specific source notes.

Earthdata educational content may be retrieved only when the question/story context calls for Earth-observation comparison and must remain labeled as such.

### 19.2 Retrieval pipeline

```text
question
  -> scope resolution (scenario / experiment / story / global)
  -> query normalization
  -> source-role filter
  -> metadata filter
  -> vector + optional keyword retrieval
  -> merge
  -> rerank
  -> evidence threshold
  -> generation
```

### 19.3 Generation contract

The LLM receives:

- user question;
- active scenario/story context;
- retrieved source passages;
- experiment metadata;
- evidence levels/source roles;
- strict instruction to use supplied scientific evidence only for factual scientific claims.

Expected response:

```json
{
  "answer": "...",
  "evidence": [
    {
      "sourceId": "...",
      "experimentId": "...",
      "claim": "...",
      "evidenceLevel": "A"
    }
  ],
  "limitations": ["..."],
  "confidence": "high|medium|low"
}
```

### 19.4 Low-evidence behavior

If evidence is below threshold:

> IGNIS does not have enough comparable evidence in the current dataset to support a confident answer. The closest available sources and limitations are shown below.

The product must not substitute model memory for missing evidence in scientific answers.

### 19.5 Prompt-injection resistance

Retrieved source text is untrusted content. The model must not follow instructions embedded in retrieved documents.

---

## 20. Computer Vision Specification

### 20.1 MVP objective

Turn one real experiment video into a transparent time series that demonstrates how unstructured experiment media can become searchable quantitative evidence.

### 20.2 Pipeline

```text
video
  -> decode frames
  -> crop ROI
  -> convert color space
  -> threshold / segment candidate flame pixels
  -> morphological cleanup
  -> contour or connected-component selection
  -> compute metrics
  -> temporal smoothing
  -> persist measurements
```

### 20.3 Primary metric

`flame area ratio = segmented flame pixels / ROI pixels`

Optional:

- vertical extent;
- centroid position;
- spread-front position;
- approximate extinction timestamp.

### 20.4 Label

`Derived by IGNIS computer vision - not an official NASA measurement unless explicitly sourced as such.`

### 20.5 Acceptance criteria

- obvious non-flame background does not dominate the metric;
- chart duration matches video duration within tolerance;
- scrubbing updates cursor within 250 ms client-side;
- measurement records include pipeline/model version.

---

## 21. API Specification

Base prefix: `/api/v1`

### 21.1 Health

```http
GET /health
```

### 21.2 Habitat presets

```http
GET /habitat-presets
GET /habitat-presets/{slug}
```

### 21.3 Experiments

```http
GET /experiments
GET /experiments/{experimentId}
GET /experiments/{experimentId}/runs
GET /experiments/{experimentId}/related
```

### 21.4 Analyze scenario

```http
POST /analyze
```

Request:

```json
{
  "scenario": {
    "destination": "orbital",
    "fuelType": "solid",
    "oxygenPct": 20,
    "pressureKpa": 75,
    "airflowCmS": 10,
    "objectives": ["flame_spread"]
  },
  "limit": 5
}
```

Response:

```json
{
  "datasetVersion": "2026.09.26",
  "scoringVersion": "1.1",
  "behaviorProfile": [],
  "results": [
    {
      "runId": "...",
      "experimentId": "...",
      "eligibility": "eligible",
      "eligibilityWarnings": [],
      "evidenceSimilarity": 0.91,
      "coverage": 0.85,
      "confidence": "high",
      "factors": [],
      "warnings": []
    }
  ]
}
```

### 21.5 Ask IGNIS

```http
POST /ask
```

### 21.6 Stories

```http
GET /stories
GET /stories/{slug}
```

### 21.7 Media / analysis

```http
GET /media/{mediaId}
GET /media/{mediaId}/measurements
```

CV analysis should be precomputed for the live demo.

### 21.8 Source registry

```http
GET /sources
GET /sources/{sourceId}
```

---

## 22. Technical Architecture

```text
                         NEXT.JS WEB APP
          +----------------+--------------------+
          |                |                    |
   Build a Habitat     Explore Fire      Experiment Explorer
          |                |                    |
          +----------------+----------+---------+
                                      |
                                  FASTAPI
        +---------------+-------------+-------------+---------------+
        |               |             |             |               |
  scenario service  eligibility   matching/RAG  media/CV      story/source
        |               |             |             |               |
        +---------------+-------------+-------------+---------------+
                                      |
                          PostgreSQL + pgvector
                                      |
               +----------------------+----------------------+
               |                      |                      |
       NASA scientific data     NASA API enrichment   Earthdata context
```

Suggested stack:

- Frontend: Next.js, TypeScript, Tailwind CSS.
- Charts: Recharts; D3 only where custom behavior is needed.
- Animation: CSS/Framer Motion or lightweight canvas/SVG; avoid a full game engine for MVP.
- Backend: FastAPI, Python, Pydantic.
- Database: PostgreSQL + pgvector.
- Data: Pandas, NumPy.
- CV: OpenCV; scikit-learn/PyTorch only if required.
- AI: embeddings + RAG + LLM.
- Deployment: simple managed platforms already familiar to the team.

---

## 23. Scientific Integrity Requirements

| ID | Requirement |
|---|---|
| SI-001 | Every sourced scientific fact must have a source record. |
| SI-002 | Missing values are displayed as unknown/not available. |
| SI-003 | Evidence similarity is never described as risk probability. |
| SI-004 | IGNIS never labels a habitat `safe` or `unsafe`. |
| SI-005 | LLM synthesis is labeled as AI synthesis. |
| SI-006 | CV-derived values are labeled as derived by IGNIS. |
| SI-007 | Sparse/conflicting evidence is disclosed. |
| SI-008 | Product includes visible research/demo disclaimer. |
| SI-009 | Normalization transformations retain provenance. |
| SI-010 | Source links are preserved where technically possible. |
| SI-011 | Habitat fire animation is labeled illustrative, not simulation. |
| SI-012 | Earthdata educational context never silently influences microgravity matching. |
| SI-013 | Partial-gravity scenarios disclose when evidence is microgravity-only. |

---

## 24. Content and Copy Rules

Preferred:

- `Evidence Similarity: 91%`
- `Closest experimental evidence`
- `Observed in this experiment`
- `Derived by IGNIS`
- `Illustrative evidence-guided visualization`
- `AI synthesis based on the sources below`
- `The available evidence is insufficient to conclude...`
- `Gravity differs from the source experiment; transferability is uncertain.`

Avoid:

- `91% fire risk`
- `Your habitat is safe`
- `Your habitat is unsafe`
- `IGNIS predicts the fire will...` unless a validated predictive model is introduced
- `NASA says...` unless the specific displayed source supports the statement
- `simulation` for the habitat animation unless it truly is a validated simulation

---

## 25. Non-Functional Requirements

### 25.1 Performance

- P0 pages usable within ~3 seconds on normal broadband for cached demo data.
- `/analyze` target server response <= 750 ms for <= 1,000 curated runs.
- Ask IGNIS may be slower but immediately shows loading/progress state.
- CV metrics are precomputed for live demo.

### 25.2 Reliability

- Demo scenario and required source records cached/local enough to survive temporary external-source outages.
- If LLM fails, habitat analysis/evidence browsing still works.
- If NASA API/Earthdata enrichment fails, core scientific evidence remains usable.
- If media fails, experiment metadata and evidence still render.

### 25.3 Accessibility

- Keyboard-accessible controls.
- Visible focus states.
- Meaning not conveyed by color alone.
- Charts have accessible summaries/labels.
- Story content usable without audio.

### 25.4 Responsive behavior

Desktop is primary demo target. Mobile/tablet remain functional, but complex visualizations may simplify.

### 25.5 Reproducibility

- Matching responses include dataset + scoring version.
- Eligibility rules include rule-set version.
- CV outputs include pipeline/model version.
- RAG responses record source IDs.

---

## 26. Security and Privacy

- No accounts required for core demo.
- Do not collect sensitive personal information.
- Keep API secrets server-side.
- Apply request-size limits.
- Validate/sanitize user inputs.
- Treat retrieved documents as untrusted LLM text.
- Use allowlisted source/media domains where practical.
- Never expose database credentials in frontend code.

---

## 27. Analytics / Observability

Recommended non-sensitive events:

- `mode_selected`
- `destination_selected`
- `habitat_parameter_changed`
- `scenario_analyzed`
- `behavior_profile_viewed`
- `why_opened`
- `experiment_opened`
- `story_opened`
- `story_completed`
- `earthdata_context_viewed`
- `ask_submitted`
- `ask_answered`
- `ask_low_evidence`
- `video_played`
- `cv_chart_interacted`
- `source_link_opened`

Backend logs:

- request ID;
- endpoint latency;
- dataset/scoring/eligibility-rule version;
- retrieval count;
- source roles used;
- LLM error state;
- source IDs used in generated answers.

---

## 28. MVP Definition of Done

The MVP is complete when:

- [ ] Landing page offers Build a Habitat and Explore Fire.
- [ ] At least one canonical destination/habitat scenario is fully demo-ready.
- [ ] Moon/Mars presets exist only if gravity limitations are correctly surfaced.
- [ ] Habitat parameters submit to the evidence engine.
- [ ] Comparable-evidence filter runs before similarity ranking.
- [ ] Evidence results include score, coverage, confidence, reasons, and warnings.
- [ ] Fire Behavior Profile is derived from evidence and does not use generic risk probability.
- [ ] Habitat visualization is labeled illustrative/non-simulation.
- [ ] At least 30 curated experiment/run records are ingested, or the maximum high-quality set feasible from chosen sources.
- [ ] At least one experiment page is fully populated with real source data/media.
- [ ] At least one real video has synchronized CV-derived time series.
- [ ] Ask IGNIS retrieves evidence before answering and exposes sources/limitations.
- [ ] At least one Explore Fire story is complete.
- [ ] `Fire from Space vs Fire in Space` or equivalent uses Earthdata context.
- [ ] At least one NASA Open Data source/dataset is recorded.
- [ ] At least one NASA API enrichment is visible.
- [ ] All required source families appear in provenance UI.
- [ ] Core demo is deployed and completes in <= 2 minutes.

---

## 29. Acceptance Test Scenarios

### AT-01 - Strong comparable match

**Given** a demo scenario intentionally similar to a curated microgravity experiment  
**When** the user analyzes it  
**Then** the experiment appears near the top  
**And** eligibility is comparable  
**And** factor reasons are visible.

### AT-02 - Scientifically incompatible candidate

**Given** a run with numerically similar conditions but incompatible fuel/regime/objective  
**When** evidence is evaluated  
**Then** the comparable-evidence filter excludes it or visibly marks it with a blocking warning.

### AT-03 - Partial-gravity mismatch

**Given** a Moon or Mars habitat scenario  
**When** only microgravity evidence is available  
**Then** results disclose gravity mismatch  
**And** confidence is not presented as fully comparable.

### AT-04 - Missing evidence

**Given** a scenario outside the curated dataset  
**When** analyzed  
**Then** IGNIS does not fabricate values  
**And** behavior profile shows limited/insufficient evidence.

### AT-05 - No safe/unsafe language

**Given** any habitat configuration  
**Then** UI never labels it safe/unsafe or assigns absolute fire probability.

### AT-06 - Ask with strong sources

**Given** a supported question  
**When** user asks IGNIS  
**Then** response shows retrieved evidence and openable source items.

### AT-07 - Ask with weak sources

**Given** unsupported question  
**Then** IGNIS states evidence is insufficient and does not answer from model memory as fact.

### AT-08 - CV synchronization

**Given** the demo video  
**When** playback reaches timestamp `t`  
**Then** chart cursor matches measurement at `t`.

### AT-09 - NASA source role separation

**Given** a story containing Earthdata context and microgravity experiment evidence  
**Then** source labels differ  
**And** Earthdata content does not contribute to microgravity similarity.

### AT-10 - Visualization disclaimer

**Given** animated habitat fire visualization  
**Then** `Illustrative evidence-guided visualization - not a validated physical simulation` is visible or one click away in a persistent information state.

---

## 30. 48-Hour Delivery Plan

| Time | Focus | Exit condition |
|---|---|---|
| 0-6h | Source registry, curated NASA records, source-role policy, one Earthdata/API proof | Real data from required source channels is represented and provenance works |
| 6-14h | Comparable-evidence filter + similarity engine + API | Scenario returns eligible, explainable ranked evidence |
| 14-24h | Build-a-Habitat UX + Fire Behavior Profile + Experiment Explorer | Core build -> evidence -> experiment flow works |
| 24-30h | Explore Fire story + Earthdata context | One complete story works end-to-end |
| 30-36h | RAG / Ask IGNIS | Questions return evidence-backed answers |
| 36-40h | One video-analysis pipeline | Derived metric chart works on one real video |
| 40-44h | Integration, disclaimers, errors, performance | Demo is stable |
| 44-48h | Visual polish, pitch, rehearsal | Two-minute demo runs reliably |

### Gate 1 - Hour 6

Do real NASA records + required source families exist in the source registry?

If no: stop feature work and fix source integration.

### Gate 2 - Hour 14

Can a habitat scenario produce scientifically eligible, explainable evidence?

If no: stop story/animation work and fix evidence logic.

### Gate 3 - Hour 24

Can a user complete Build -> Evidence -> Experiment?

If no: cut Explorer stretch features.

### Gate 4 - Hour 36

Does Ask IGNIS provide grounded answers and does one Explorer story work?

If no: simplify story/audio/animation.

### Gate 5 - Hour 40

Is one CV demo stable?

If no: use the simplest robust metric and stop model experimentation.

---

## 31. Team Responsibilities

### Frontend / Web

- app shell/routing;
- landing mode selection;
- Build-a-Habitat UI;
- Fire Behavior Profile;
- evidence cards;
- experiment explorer;
- story player;
- video/chart synchronization.

### AI / ML

- comparable-evidence logic;
- similarity scoring;
- retrieval/reranking/RAG;
- behavior-profile aggregation rules;
- CV pipeline;
- evaluation examples.

### Data / Backend

- NASA source registry;
- Open Data / NASA API / Earthdata integrations;
- source ingestion + normalization;
- provenance;
- FastAPI endpoints;
- PostgreSQL/pgvector;
- caching/deployment.

### UI / UX

- mode-selection experience;
- habitat interaction model;
- visual system;
- evidence hierarchy;
- story design;
- animation states;
- disclaimers/error states;
- demo narrative.

---

## 32. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Source data difficult to normalize | High | High | Curate smaller reliable subset; nullable schema + provenance |
| Team overbuilds game/animation | High | High | P0 uses simple 2D evidence-guided states; no game engine |
| Risk score implies false safety | Medium | High | Fire Behavior Profile + explicit copy rules |
| Moon/Mars scenario overclaims transferability | Medium | High | Gravity warning + confidence cap + canonical orbital demo |
| Similarity ignores scientific regime | Medium | High | Comparable-evidence filter before ranking |
| RAG hallucinates | Medium | High | Evidence-only prompt, threshold, visible sources |
| Earthdata mixed into wrong evidence domain | Medium | High | Source-role isolation and score exclusion |
| NASA external service unavailable | Medium | Medium | Cache demo assets/metadata where permitted |
| Video segmentation unstable | Medium | Medium | Choose one suitable clip; ROI + simple metric |
| UI becomes crowded | Medium | Medium | Two-mode IA + progressive disclosure |
| Audio consumes too much time | Medium | Low | P2 only |

---

## 33. Stretch Roadmap

### P1

- richer interactive animations;
- side-by-side experiment comparison;
- semantic hybrid matching;
- additional experiment videos;
- scenario-scoped Ask IGNIS;
- related-experiment recommendations;
- more Fire Stories;
- Earthdata layer interaction.

### P2

- audio narration;
- evidence knowledge graph;
- configurable matching weights;
- natural-language habitat construction;
- exportable evidence brief;
- richer multimodal analysis;
- validated physical modeling integration if appropriate in future.

---

## 34. Demo Script Requirements

The product should support this two-minute path:

1. **Hook:** "What if you could build a habitat in space and ask NASA's real fire experiments what would matter there?"
2. Choose **Build a Habitat**.
3. Select the canonical orbital/deep-space habitat preset.
4. Change one parameter live, such as oxygen or airflow.
5. Click **Analyze with NASA Evidence**.
6. Reveal the Fire Behavior Profile and explain that it reflects evidence categories, not a fire-risk probability.
7. Show the evidence-guided habitat visualization and its non-simulation label.
8. Click **Why?** to reveal the strongest contributing factors and experiment matches.
9. Open the strongest experiment; play real media and show synchronized IGNIS-derived analysis.
10. Ask one prepared question and reveal a source-backed answer.
11. Briefly open **Explore Fire** and show the `Fire from Space vs Fire in Space` story to demonstrate Earthdata + NASA source integration.
12. Close: **"IGNIS does not ask AI to invent fire behavior. It lets NASA's experiments teach us what the evidence actually shows."**

The demo must not depend on live ingestion, long typing, live CV inference, or fragile network-only source access.

---

## 35. Open Questions

1. Which exact combustion experiment families have the cleanest metadata for the normalized schema?
2. Which single video is best for robust flame segmentation?
3. Which Earthdata product/layer will be used for the required fire-from-space educational comparison?
4. Which NASA API will provide the most useful visible enrichment for the demo?
5. Which NASA Open Data record(s) will anchor dataset provenance?
6. Which fields are consistently available across selected experiments?
7. What exact eligibility rules should be hard blockers vs warnings?
8. What tolerance ranges should be used for oxygen, pressure, and airflow similarity?
9. What minimum coverage/confidence suppresses a behavior label?
10. Which destination preset will be the canonical demo? Recommended: orbital/deep-space microgravity.
11. What exact scientific statements will be used in the demo, and have they been manually verified against source evidence?

---

## 36. Recommended Repository Structure

```text
ignis/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   ├── build/
│       │   ├── evidence/
│       │   ├── experiment/[id]/
│       │   ├── explore/
│       │   ├── explore/[slug]/
│       │   └── ask/
│       ├── components/
│       │   ├── habitat-builder/
│       │   ├── behavior-profile/
│       │   ├── evidence-card/
│       │   ├── experiment/
│       │   ├── story/
│       │   └── charts/
│       └── lib/
├── services/
│   └── api/
│       ├── app/
│       │   ├── api/
│       │   ├── eligibility/
│       │   ├── matching/
│       │   ├── behavior/
│       │   ├── rag/
│       │   ├── stories/
│       │   ├── sources/
│       │   └── db/
│       └── tests/
├── pipelines/
│   ├── ingest/
│   │   ├── nasa_open_data/
│   │   ├── nasa_api/
│   │   └── earthdata/
│   ├── normalize/
│   ├── embeddings/
│   └── vision/
├── data/
│   ├── curated/
│   ├── processed/
│   └── fixtures/
├── docs/
│   ├── data-dictionary.md
│   ├── source-policy.md
│   ├── eligibility.md
│   ├── scoring.md
│   └── demo-script.md
└── README.md
```

---

## 37. Initial Engineering Backlog

### Epic A - NASA data foundation

- [ ] Implement `data_sources` registry.
- [ ] Register NASA Open Data source(s).
- [ ] Select and integrate one NASA API enrichment.
- [ ] Select and integrate one Earthdata fire/thermal context source.
- [ ] Normalize first 10 combustion records manually.
- [ ] Expand to curated demo dataset.
- [ ] Add provenance validation.

### Epic B - Scientific comparability

- [ ] Define fuel/material taxonomy.
- [ ] Implement objective compatibility rules.
- [ ] Implement gravity compatibility/warnings.
- [ ] Implement eligibility result payload.
- [ ] Write blocker/warning tests.

### Epic C - Evidence matching

- [ ] Implement numeric similarity.
- [ ] Implement categorical similarity.
- [ ] Implement objective overlap.
- [ ] Implement weight renormalization.
- [ ] Implement coverage/confidence.
- [ ] Return factor explanations.
- [ ] Create deterministic tests.

### Epic D - Build-a-Habitat web journey

- [ ] Build two-mode landing.
- [ ] Build destination selector.
- [ ] Build Environment vs Habitat panels.
- [ ] Build editable scenario controls.
- [ ] Build Fire Behavior Profile.
- [ ] Build evidence-guided visualization states.
- [ ] Build Why panel.
- [ ] Build evidence result cards.
- [ ] Build experiment detail page.

### Epic E - Explore Fire

- [ ] Build story index.
- [ ] Build story player.
- [ ] Create one microgravity fire story.
- [ ] Create Fire from Space vs Fire in Space story.
- [ ] Add Earthdata visual/context card.
- [ ] Add NASA media/API enrichment.

### Epic F - Ask IGNIS

- [ ] Parse/index selected documents.
- [ ] Create embeddings.
- [ ] Implement source-role-aware retrieval.
- [ ] Define grounded-answer prompt.
- [ ] Implement low-evidence behavior.
- [ ] Build evidence rendering component.

### Epic G - Flame Vision

- [ ] Select demo video.
- [ ] Define ROI.
- [ ] Prototype segmentation.
- [ ] Compute flame area ratio.
- [ ] Smooth/validate visually.
- [ ] Export measurements.
- [ ] Build synchronized chart.

### Epic H - Demo quality

- [ ] Add canonical habitat preset.
- [ ] Add scientific disclaimers/tooltips.
- [ ] Test gravity mismatch scenario.
- [ ] Test error states.
- [ ] Cache demo queries/assets.
- [ ] Rehearse two-minute script.

---

## 38. Final Product Statement

**IGNIS is an interactive evidence experience for NASA microgravity combustion research. Users can build a space habitat, change fire-relevant conditions, discover the closest comparable NASA experiments, inspect real evidence, and learn the science through guided stories and grounded AI explanations.**

The project wins by combining two strengths:

- **credible evidence intelligence** underneath; and
- **playful, understandable storytelling** on top.

The hackathon strategy remains disciplined: one reliable evidence pipeline, one compelling Build-a-Habitat journey, one strong Explorer story, one real computer-vision analysis, and one grounded AI assistant.
