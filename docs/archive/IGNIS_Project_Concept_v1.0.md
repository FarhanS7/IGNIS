**IGNIS  |  NASA Space Apps Challenge 2026** 

# **IGNIS** 

## **Intelligent Guidance from NASA Ignition Studies Project Concept and Technical Direction** 

**One-line product definition** 

An evidence-grounded AI system that turns NASA microgravity combustion experiments into explorable, comparable, and traceable fire-safety intelligence for human spaceflight. 

**Prepared for:** NASA International Space Apps Challenge 2026 

**Challenge:** Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data 

**Version:** 1.0 - 25 September 2026 

Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

### **1. Executive Summary** 

IGNIS is a web-based research and decision-support experience for exploring NASA microgravity combustion evidence. It is designed around a simple principle: the AI is not the source of truth; NASA experiments are. The system helps users define a spacecraft fire scenario, locate the most relevant NASA experiments, compare the experimental conditions and observations, inspect real evidence, and ask questions whose answers remain traceable to source material. 

The project directly addresses the 2026 Space Apps challenge to create an interactive, AI-powered dashboard that can summarize, rank, and interpret microgravity combustion findings for human space exploration. Our product direction deliberately avoids presenting unsupported fire-risk probabilities or pretending to be a certified simulator. Instead, IGNIS acts as an evidence intelligence layer over experimental data. 

#### **Product thesis** 

NASA has decades of microgravity fire research. IGNIS makes that evidence searchable, comparable, visual, and understandable in the context of a mission scenario - without asking an AI model to invent the physics. 

### **2. The Problem We Are Solving** 

Microgravity combustion research is scientifically rich but difficult to navigate as a coherent body of evidence. A user may need to move between experiment metadata, publications, video, sensor measurements, materials, atmospheric conditions, and findings before they can understand whether a study is relevant to a particular question. 

Traditional search gives documents. Traditional dashboards give charts. A generic chatbot gives fluent text. None of those, by themselves, creates a trustworthy bridge from a mission question to comparable experimental evidence. 

- Fire behavior in microgravity differs from familiar Earth-bound behavior, so intuition alone is not enough. 

- Relevant findings are distributed across multiple experiments, conditions, media types, and publications. 

- Different experiments may study related safety questions at different scales or with different materials and environmental conditions. 

- An LLM can summarize evidence, but its conclusions are only useful if users can see what evidence was retrieved and why it is relevant. 

### **3. What IGNIS Is - and Is Not** 

|**IGNIS IS**|**IGNIS IS NOT**|
|---|---|
|An evidence discovery and comparison system|A certified spacecraft fire-safety system|
|A scenario-to-experiment matching engine|A fire probability calculator|
|A traceable AI research assistant|A generic chatbot that answers from memory|
|A visual explorer for experiments and relationships|A replacement for combustion scientists|
|A platform for inspecting experiment media and derived<br>measurements|A full computational fluid-dynamics simulator|
|**Scientific communication rule**||



Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

Whenever IGNIS moves beyond a directly observed fact, the UI must label the output as similarity-based evidence, AI synthesis, or hypothesis. It must not present inferred conclusions as experimentally proven facts. 

### **4. Product Vision** 

The long-term vision is to make NASA microgravity combustion research navigable as a living evidence network. A mission engineer, researcher, educator, or student should be able to move from a practical question to experiments, from experiments to observations, and from observations to related findings without losing provenance. 

For the hackathon, the vision is reduced to one compelling end-to-end story: configure a mission fire scenario, receive ranked evidence matches, inspect an experiment and its media, and ask a scientific question that is answered with source-backed evidence. 

### **5. Primary Users** 

|**User**|**Primary need**|**What IGNIS provides**|
|---|---|---|
|Mission / safety engineer|Find evidence relevant to a spacecraft<br>condition|Scenario matching, comparison, traceable<br>findings|
|Combustion researcher|Navigate related experiments and<br>observations|Search, knowledge graph, experiment<br>explorer|
|Educator / student|Understand how fire behaves in<br>microgravity|Visual explanations, experiment media,<br>guided exploration|
|Space enthusiast / public|Explore NASA research without specialist<br>interfaces|Accessible UX and evidence-linked AI<br>explanations|



### **6. Core Experience** 

The product is organized around a single evidence journey rather than a collection of unrelated features. 

```
MISSION SCENARIO
      |
      v
EVIDENCE MATCH ENGINE
      |
      v
RANKED NASA EXPERIMENTS
      |
      v
EXPERIMENT EXPLORER + VIDEO / DATA
      |
      v
ASK IGNIS
      |
      v
SOURCE-BACKED INTERPRETATION
```

Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

### **7. Module 1 - Mission Condition Builder** 

The Mission Condition Builder turns an abstract question into structured parameters that IGNIS can compare against experiment metadata. Users choose only parameters that can be supported by the curated dataset. The first version should favor a small number of reliable fields over a complex form. 

|**Field**|**Example**|**Purpose**|
|---|---|---|
|Mission context|Mars transit habitat|Gives the user a meaningful scenario label|
|Material / fuel class|Polymer / fabric / solid fuel|Major relevance signal|
|Oxygen|21%|Atmospheric similarity|
|Pressure|70 kPa|Atmospheric similarity|
|Airflow|15 cm/s|Flow-condition similarity|
|Question / objective|Flame spread|Matches experiment intent|



#### **UX goal** 

A judge should be able to configure a meaningful scenario in under 20 seconds without understanding combustion jargon. 

### **8. Module 2 - Evidence Match Engine** 

The Evidence Match Engine is the product backbone. Each curated NASA experiment or experiment run is normalized into a common schema. The user scenario is represented using the same fields. IGNIS computes an interpretable similarity score and shows both the score and the reasons behind it. 

```
Example normalized record
{
  "experiment": "BASS-II",
  "fuel_type": "solid",
  "material": "PMMA",
  "oxygen_pct": 21.0,
  "pressure_kpa": 70.0,
  "airflow_cm_s": 15.0,
  "objectives": ["flame_spread", "extinction"],
  "gravity": "microgravity",
  "source_ids": ["..." ]
}
```

The first scoring model should be deterministic and explainable. Deep learning is unnecessary for the MVP. A weighted combination of categorical similarity, normalized numeric distance, objective overlap, and optional text embedding similarity is enough to produce useful rankings. 

|**Signal**|**Illustrative weight**|**Reason**|
|---|---|---|
|Material / fuel similarity|30%|The combustible material strongly affects<br>relevance|
|Oxygen similarity|20%|Atmospheric composition is central to<br>combustion behavior|



Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

|**Signal**|**Illustrative weight**|**Reason**|
|---|---|---|
|Airflow similarity|20%|Flow conditions materially affect<br>microgravity flames|
|Pressure similarity|15%|Atmospheric pressure changes<br>experiment context|
|Objective overlap|10%|Matches the scientific question being<br>asked|
|Geometry / other metadata|5%|Useful refinement when available|
|**Important**<br>The similarity score measures          i|evidence relevance. It is not a prob   i|ability of ignition, fire, injury, or mission failure.|



### **9. Module 3 - Experiment Explorer** 

The Experiment Explorer is the evidence page. It should make one experiment understandable at a glance while preserving access to the underlying source information. 

- Experiment name, purpose, mission/platform, and research context. 

- Key experimental conditions: material, oxygen, pressure, airflow, geometry, and other available parameters. 

- Observed outcomes and concise findings, separated from AI-generated interpretation. 

- Source documents and data references. 

- Video or imagery when available. 

- AI-derived visual measurements clearly labeled as derived metrics. 

- Related experiments and reasons they are related. 

### **10. Module 4 - AI Flame Vision** 

One real microgravity flame video becomes the ML showcase. The goal is not to solve computer vision for every combustion video. The goal is to demonstrate that IGNIS can extract a simple, transparent time series from actual experiment imagery and synchronize that result with the source video. 

```
NASA experiment video
        |
        v
frame extraction
        |
        v
flame segmentation
        |
        +--> flame area vs time
        +--> flame height / extent
        +--> centroid movement
        +--> growth or decay trend
        +--> approximate extinction timestamp
```

The MVP should start with classical image processing such as HSV/color thresholding, contour detection, masks, and temporal smoothing. A learned segmentation model is a fallback or stretch feature if the footage cannot be handled reliably with simpler methods. 

Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

#### **Demo interaction** 

Scrubbing the experiment video should move the cursor on the derived chart. Scrubbing the chart should move the video. This creates a high-impact visual demonstration with a clear analytical purpose. 

### **11. Module 5 - Ask IGNIS** 

Ask IGNIS is a retrieval-augmented research assistant, not the product by itself. It answers natural-language questions by retrieving curated experiment records, publications, summaries, and source passages before generating a response. 

```
Question
   |
   v
retrieve experiment metadata + source passages
   |
   v
rerank for relevance
   |
   v
LLM synthesis
   |
   +--> concise answer
   +--> evidence used
   +--> experimental conditions
   +--> uncertainty / limitations
   +--> source links / citations
```

The answer UI should visually separate observed evidence from synthesis. If the retrieved evidence is weak, mixed, or not directly comparable, IGNIS should say so rather than forcing a conclusion. 

### **12. Knowledge Graph - High-Value Stretch Feature** 

The knowledge graph turns NASA combustion research into an explorable network. It is a strong UX differentiator, but it is not required for the first end-to-end demo. Build it only after the mission-to-evidence journey works. 

```
               OXYGEN
                  |
                  v
BASS-II ---> FLAME SPREAD <--- AIRFLOW
   |              |
   v              v
 PMMA          EXTINCTION
                  |
                  v
                 FLEX
```

- Node types: experiments, materials, fuel classes, oxygen ranges, airflow, pressure, phenomena, findings, publications. 

- Clicking a node filters the visible evidence and exposes relationships. 

Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

- The graph should be generated from structured metadata, not from unconstrained LLM extraction during the live demo. 

### **13. Information Architecture** 

|**Route**|**Purpose**|**Primary action**|
|---|---|---|
|/|Landing + Mission Builder|Define scenario and run evidence search|
|/evidence|Ranked evidence matches|Compare and select an experiment|
|/experiment/:id|Experiment Explorer|Inspect conditions, findings, video,|
|||sources|
|/ask|Ask IGNIS|Ask source-backed research questions|



The website should behave like a guided investigation. A user can enter through search, but the hackathon demo should move through these screens in one continuous story. 

### **14. Technical Architecture** 

- `NEXT.JS WEB APP |-- Mission Builder` 

- `|-- Evidence Ranking |-- Experiment Explorer |-- Ask IGNIS | v FASTAPI SERVICE |-- /match |-- /experiments |-- /ask |-- /analysis | +--> PostgreSQL / pgvector` 

- `+--> Curated NASA metadata` 

- `+--> Source documents / chunks` 

- `+--> CV-derived time series` 

- `+--> LLM + embeddings` 

|**Layer**|**Suggested technology**|**Why**|
|---|---|---|
|Frontend|Next.js + TypeScript + Tailwind|Fast product development and strong UI<br>ecosystem|
|Visualization|Recharts / D3 / React Flow|Charts and optional knowledge graph|
|Backend|FastAPI + Python|Natural fit for data, ML, and typed APIs|
|Database|PostgreSQL + pgvector|Structured experiment data plus semantic<br>retrieval|
|ML / CV|OpenCV + scikit-learn|Enough for similarity and first video<br>analysis|
|AI|Embeddings + RAG + LLM|Grounded natural-language synthesis|
|Data|Pandas + NumPy|Ingestion and normalization|



Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

### **15. Data Strategy** 

The hackathon version should not attempt to ingest every available NASA record. Curate a focused dataset of highquality experiment records with reliable metadata, source references, and at least one media-rich example. Thirty to one hundred normalized records is enough to prove the product concept. 

- Start with a small set of relevant combustion investigations such as BASS/BASS-II, Saffire, FLEX/FLEX-2, or other records that fit the available source material. 

- Preserve original source identifiers and URLs in the normalized record. 

- Keep raw source fields separate from normalized fields. 

- Do not fabricate missing values. Missing data remains null / unknown. 

- Record whether a field is directly sourced, manually normalized, or AI-extracted. 

### **16. Scientific Integrity and Safety Guardrails** 

|**Risk**|**Guardrail**|
|---|---|
|AI hallucinates a finding|RAG-only answer mode for scientific claims; show evidence used|
|Similarity score is mistaken for risk|Label as Evidence Similarity; never display as fire probability|
|Incomparable experiments are merged|Expose conditions and mismatch reasons; allow low confidence /<br>insufficient evidence|
|Derived CV metrics appear authoritative|Label as AI-derived / computer-vision-derived; show source video|
|Missing data silently becomes assumptions|Use null / unknown and disclose missing parameters|
|User treats demo as operational guidance|Display research/demo disclaimer; avoid prescriptive mission-<br>safety instructions|



### **17. MVP Scope** 

#### **Definition of done** 

A user can define one scenario, receive meaningful ranked experiment matches, open a real experiment record, inspect at least one real media/data example, and ask one scientific question whose answer shows its evidence. 

**MUST HAVE SHOULD / STRETCH** Mission Condition Builder Knowledge graph Evidence Match Engine Advanced semantic matching Ranked result explanations Multiple CV pipelines Experiment Detail Page Experiment comparison matrix Ask IGNIS with citations Shareable reports One working video analysis Additional visualization modes NASA source traceability 

Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

### **18. 48-Hour Hackathon Plan** 

|**Window**|**Focus**|**Exit condition**|
|---|---|---|
|0-6h|Data curation + schema + one real<br>experiment path|Structured records exist and source links<br>are preserved|
|6-14h|Match engine + basic API|Scenario produces ranked experiment<br>results|
|14-24h|Mission Builder + Evidence UI +<br>experiment page|Core journey works end to end|
|24-32h|RAG / Ask IGNIS|Questions return evidence-backed<br>answers|
|32-38h|One video-analysis pipeline|Derived metric chart works on one real<br>video|
|38-44h|Integration + scientific guardrails + error<br>states|Demo is stable|
|44-48h|Polish, deployment, pitch rehearsal|Two-minute demo runs reliably|



### **19. Team Split** 

|**Role**|**Primary ownership**|
|---|---|
|Frontend / web|Next.js, routing, API integration, charts, interaction polish|
|AI / ML|Matching logic, retrieval, RAG, video analysis|
|Data / backend|NASA ingestion, normalization, FastAPI, database, deployment|
|UI / UX|User flow, visual system, evidence hierarchy, demo storytelling|



If the team has three members, combine frontend + visualization, AI/ML + retrieval, and backend/data + deployment. Everyone contributes to testing and pitch rehearsal. 

### **20. Demo Narrative** 

The strongest demo is a story, not a feature tour. 

1. Open with the scenario: a fire starts during a long-duration mission, where evacuation is not an option and microgravity changes combustion behavior. 

2. Configure a representative mission environment in the Mission Builder. 

3. Run Evidence Match and show the top NASA experiments with transparent match reasons. 

4. Open the strongest match and inspect its conditions, observed findings, and source material. 

5. Play the real flame video while the AI-derived chart follows the flame over time. 

6. Ask IGNIS one carefully selected scientific question and reveal the source-backed answer. 

7. Close with the product principle: IGNIS does not ask AI to invent fire behavior; it lets NASA experiments answer. 

### **21. Success Criteria** 

|**Dimension**|**Hackathon success signal**|
|---|---|
|Clarity|A first-time user understands what IGNIS does within 30 seconds|



Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

|**Dimension**|**Hackathon success signal**|
|---|---|
|Evidence|Every key scientific conclusion links to a source record or<br>passage|
|Technical depth|At least one non-trivial matching pipeline and one real CV-derived<br>metric work|
|UX|Scenario -> evidence -> experiment -> question feels like one<br>coherent investigation|
|Trust|The UI clearly separates observed facts, similarity, derived<br>metrics, and AI synthesis|
|Demo reliability|The core two-minute path works without manual intervention or<br>fragile steps|



### **22. First Development Milestone** 

Before building the complete visual experience, prove the core evidence loop with a minimal backend script or endpoint: 

```
INPUT
O2:        20%
Pressure:  75 kPa
Airflow:   10 cm/s
Fuel:      solid
Objective: flame spread
OUTPUT
Experiment A        0.91
Experiment B        0.87
Experiment C        0.74
For each result:
- why it matched
- what did not match
- source identifier
```

Once this is reliable, the team has the product backbone. Everything else - visual design, RAG, video analysis, graph exploration - attaches to this evidence layer. 

### **23. Closing Statement** 

#### **IGNIS in one sentence** 

A mission-to-evidence interface that helps people understand spacecraft fire research by finding, comparing, visualizing, and explaining the NASA experiments most relevant to their question. 

The project wins by being disciplined: one credible evidence pipeline, one excellent visual experiment analysis, one grounded AI assistant, and one polished story. The objective is not to simulate every fire in space. It is to make NASA's existing experimental evidence dramatically easier to use and understand. 

Project Concept  |  v1.0  |  25 September 2026 

**IGNIS  |  NASA Space Apps Challenge 2026** 

### **Source Context** 

Primary challenge context: NASA International Space Apps Challenge 2026 - "Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data." Challenge statement supplied by the project team from the official Space Apps challenge page: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall-aipowered-fire-safety-insights-from-microgravity-combustion-data/ 

This document is a product concept and hackathon implementation plan. Dataset availability and specific experiment fields must be verified during ingestion; no missing scientific values should be inferred merely to satisfy the proposed schema. 

Project Concept  |  v1.0  |  25 September 2026 

