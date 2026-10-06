# IGNIS Product Requirements Document (PRD)

**Product:** IGNIS - Intelligent Guidance from NASA Ignition Studies  
**Challenge:** NASA International Space Apps Challenge 2026 - *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Document version:** 1.0  
**Date:** 25 September 2026  
**Status:** Hackathon build specification  
**Primary platform:** Responsive web application  

---

## 1. Executive Summary

IGNIS is an evidence-grounded AI web application that helps users explore NASA microgravity combustion research in the context of spacecraft fire-safety questions.

A user defines a mission or experimental scenario using parameters such as material/fuel class, oxygen concentration, pressure, airflow, and research objective. IGNIS converts that scenario into a structured query, ranks the most relevant NASA combustion experiments, explains why each experiment is relevant, exposes observed experiment evidence, and supports natural-language questions whose answers are generated from retrieved source material.

The product is explicitly **not** a certified fire-safety calculator, probability model, or physics simulator. It is an evidence intelligence system.

### 1.1 Product thesis

> NASA experiments should be the source of truth. AI should make those experiments easier to find, compare, inspect, and understand.

### 1.2 Hackathon north-star flow

```text
Mission scenario
      ->
Evidence Match Engine
      ->
Ranked NASA experiments
      ->
Experiment Explorer
      ->
Real video / data + derived analysis
      ->
Ask IGNIS
      ->
Evidence-backed answer
```

---

## 2. Background and Challenge Alignment

The Space Apps challenge asks teams to create an interactive, AI-powered dashboard that summarizes, ranks, and interprets microgravity combustion findings to deliver fire-safety insights for human space exploration.

IGNIS satisfies this by providing four connected capabilities:

1. **Summarize** - concise experiment records and AI-generated evidence summaries.
2. **Rank** - scenario-to-experiment similarity ranking.
3. **Interpret** - source-backed natural-language synthesis and comparison.
4. **Interact** - mission builder, experiment explorer, synchronized video/analysis, and optional evidence graph.

The source challenge statement is available at:

`https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall-ai-powered-fire-safety-insights-from-microgravity-combustion-data/`

---

## 3. Product Principles

### P1. Evidence before generation
Scientific claims shown by IGNIS must be grounded in retrieved source records or clearly labeled as interpretation.

### P2. Similarity is not probability
A 92% evidence match means the experiment is similar to the requested conditions according to the configured matching function. It does **not** mean a 92% chance of ignition, fire, injury, or mission failure.

### P3. Show why
Every ranked experiment must expose the factors that increased or decreased its match score.

### P4. Unknown stays unknown
Missing source values remain `null`/unknown. The system must not invent a value to complete a record.

### P5. AI output must be inspectable
Answers must show supporting experiments/passages and allow users to navigate to the evidence.

### P6. One excellent path beats a broad incomplete product
The hackathon MVP prioritizes a stable end-to-end mission-to-evidence journey over comprehensive ingestion.

---

## 4. Goals

### 4.1 Product goals

- Let a user define a spacecraft combustion scenario in less than 30 seconds.
- Return a ranked set of relevant NASA experiment records with transparent scoring reasons.
- Let users inspect the conditions, observations, findings, source references, and media for a selected experiment.
- Provide at least one real computer-vision analysis of NASA experiment video.
- Answer natural-language scientific questions using retrieved source evidence.
- Clearly differentiate source facts, derived metrics, similarity-based inference, and LLM synthesis.
- Deliver a polished, judge-friendly demo that can be understood without specialist training.

### 4.2 Hackathon success criteria

- Core demo path completes without manual data manipulation.
- Top evidence matches are plausible and explainable for the curated dataset.
- Every scientific answer in the demo exposes its evidence.
- At least one video analysis produces a useful time-series metric.
- The UI remains responsive on a standard laptop browser.
- A first-time viewer can explain IGNIS in one sentence after the demo.

---

## 5. Non-Goals

IGNIS v1 will not:

- certify spacecraft materials or mission designs;
- calculate absolute fire probability or mission risk;
- replace combustion experts or formal engineering analysis;
- run computational fluid dynamics or a general fire physics simulation;
- infer missing experiment conditions as if they were sourced facts;
- ingest every NASA combustion dataset during the hackathon;
- make prescriptive operational recommendations such as "this mission is safe";
- guarantee that AI-derived flame measurements are scientifically validated beyond the demonstration dataset.

---

## 6. Target Users and Jobs To Be Done

### 6.1 Mission / safety engineer

**Job:** "Given a set of mission conditions, show me what NASA has experimentally observed under the most comparable conditions."

Needs:
- fast evidence discovery;
- comparable conditions;
- source traceability;
- limitations and mismatches.

### 6.2 Combustion researcher

**Job:** "Help me discover related experiments, materials, phenomena, and findings without manually traversing many records."

Needs:
- metadata search;
- structured comparison;
- related experiment discovery;
- source navigation.

### 6.3 Educator / student

**Job:** "Help me understand how microgravity combustion research connects conditions to observed behavior."

Needs:
- approachable explanations;
- visual evidence;
- definitions;
- transparent provenance.

### 6.4 Space enthusiast / public user

**Job:** "Let me explore real NASA fire research through a modern interface."

Needs:
- low jargon;
- compelling visuals;
- guided exploration.

---

## 7. Core User Journey

### Journey J1 - Scenario to evidence

1. User opens `/`.
2. User selects or enters scenario parameters.
3. User selects a scientific objective/question.
4. User clicks **Find NASA Evidence**.
5. Frontend sends normalized scenario to `POST /api/v1/match`.
6. Backend computes similarity against eligible experiment records.
7. User receives top matches with scores, confidence, reasons, and mismatch notes.
8. User opens one experiment.
9. Experiment page shows source facts, media, findings, derived analysis, and related records.
10. User asks a question.
11. Ask IGNIS retrieves relevant source passages and experiment records.
12. LLM produces a structured answer with evidence references and limitations.

### Journey J2 - Explore an experiment first

1. User opens a shared experiment URL.
2. User sees a concise evidence summary and source metadata.
3. User explores video/data analysis.
4. User opens related experiments or asks a follow-up question.

---

## 8. Information Architecture

| Route | Purpose | Primary CTA |
|---|---|---|
| `/` | Landing + Mission Condition Builder | Find NASA Evidence |
| `/evidence` | Ranked evidence results | Compare / Open Experiment |
| `/experiment/[id]` | Experiment Explorer | Inspect Evidence / Ask IGNIS |
| `/ask` | Research assistant | Ask Question |
| `/about` | Method, disclaimers, challenge context | Learn how scoring works |

Optional stretch route:

| Route | Purpose |
|---|---|
| `/graph` | Interactive knowledge graph |

---

## 9. Functional Requirements

Priority definitions:
- **P0** - required for demo / MVP.
- **P1** - high-value if core path is stable.
- **P2** - stretch.

### 9.1 Mission Condition Builder

| ID | Priority | Requirement |
|---|---|---|
| FR-MCB-001 | P0 | User can select a mission-context label or use a default context. |
| FR-MCB-002 | P0 | User can select material/fuel class from values supported by the curated data. |
| FR-MCB-003 | P0 | User can set oxygen concentration when supported. |
| FR-MCB-004 | P0 | User can set pressure when supported. |
| FR-MCB-005 | P0 | User can set airflow when supported. |
| FR-MCB-006 | P0 | User can select a target objective such as flame spread, ignition, or extinction. |
| FR-MCB-007 | P0 | Form validates numeric bounds and units before submission. |
| FR-MCB-008 | P0 | User can submit the scenario and navigate to ranked evidence. |
| FR-MCB-009 | P1 | UI offers curated example scenarios for one-click demo setup. |
| FR-MCB-010 | P2 | User can save/share a scenario URL. |

### 9.2 Evidence Match Engine

| ID | Priority | Requirement |
|---|---|---|
| FR-EME-001 | P0 | System normalizes scenario inputs into the matching schema. |
| FR-EME-002 | P0 | System filters out records missing all relevant comparable fields. |
| FR-EME-003 | P0 | System computes a relevance score in `[0,1]`. |
| FR-EME-004 | P0 | System returns top N ranked experiment records. |
| FR-EME-005 | P0 | Every result includes a factor-level score explanation. |
| FR-EME-006 | P0 | Every result includes explicit mismatches / unavailable fields. |
| FR-EME-007 | P0 | Results must label the score as `Evidence Similarity`. |
| FR-EME-008 | P1 | System computes a confidence class based on evidence coverage. |
| FR-EME-009 | P1 | Optional text-embedding similarity can augment structured scoring. |
| FR-EME-010 | P2 | User can adjust factor weights in an advanced view. |

### 9.3 Evidence Results Page

| ID | Priority | Requirement |
|---|---|---|
| FR-ERP-001 | P0 | Display top experiment matches sorted descending by evidence similarity. |
| FR-ERP-002 | P0 | Each card shows experiment name, score, strongest matches, and key mismatch. |
| FR-ERP-003 | P0 | User can open an experiment detail page. |
| FR-ERP-004 | P1 | User can compare up to three experiments side by side. |
| FR-ERP-005 | P1 | User can filter results by experiment family / phenomenon / material. |
| FR-ERP-006 | P2 | User can switch between card and visual-network views. |

### 9.4 Experiment Explorer

| ID | Priority | Requirement |
|---|---|---|
| FR-EXP-001 | P0 | Show source experiment identity and concise purpose. |
| FR-EXP-002 | P0 | Show normalized experimental conditions with units. |
| FR-EXP-003 | P0 | Show observed findings separately from AI synthesis. |
| FR-EXP-004 | P0 | Show source identifiers and source links when available. |
| FR-EXP-005 | P0 | Display at least one supported media asset for the demo experiment. |
| FR-EXP-006 | P0 | Display any CV-derived metrics with a `Derived by IGNIS` label. |
| FR-EXP-007 | P1 | Show related experiments and relationship reasons. |
| FR-EXP-008 | P1 | Allow user to ask a question scoped to the current experiment. |
| FR-EXP-009 | P2 | Show a condition-to-finding mini graph. |

### 9.5 AI Flame Vision

| ID | Priority | Requirement |
|---|---|---|
| FR-CV-001 | P0 | Process at least one real experiment video into frames. |
| FR-CV-002 | P0 | Segment or detect a flame region sufficiently for a stable demo. |
| FR-CV-003 | P0 | Produce at least one metric over time, preferably flame area. |
| FR-CV-004 | P0 | Persist derived measurements as a time series. |
| FR-CV-005 | P0 | Video time and chart cursor are synchronized in the UI. |
| FR-CV-006 | P1 | Produce flame extent/height and centroid movement. |
| FR-CV-007 | P1 | Estimate approximate extinction timestamp when supported. |
| FR-CV-008 | P2 | Support multiple videos / experiment families. |

### 9.6 Ask IGNIS

| ID | Priority | Requirement |
|---|---|---|
| FR-AI-001 | P0 | User can submit a natural-language research question. |
| FR-AI-002 | P0 | Backend retrieves relevant experiment metadata and source chunks before generation. |
| FR-AI-003 | P0 | Response contains a concise answer section. |
| FR-AI-004 | P0 | Response contains an evidence section with retrieved source references. |
| FR-AI-005 | P0 | Response states limitations when evidence is weak, sparse, or conflicting. |
| FR-AI-006 | P0 | UI visually separates source facts from AI synthesis. |
| FR-AI-007 | P1 | User can ask a question scoped to a scenario or experiment. |
| FR-AI-008 | P1 | System performs semantic reranking after retrieval. |
| FR-AI-009 | P2 | Suggested follow-up questions are generated from retrieved evidence. |

### 9.7 Knowledge Graph

| ID | Priority | Requirement |
|---|---|---|
| FR-KG-001 | P2 | Render nodes for experiments, materials, phenomena, and conditions. |
| FR-KG-002 | P2 | Clicking a node filters/highlights related nodes and experiments. |
| FR-KG-003 | P2 | Relationships come from structured metadata or reviewed extraction. |
| FR-KG-004 | P2 | Graph does not create unsupported scientific causal links. |

---

## 10. UX Requirements

### 10.1 Visual hierarchy

Every evidence surface should use a consistent hierarchy:

1. **Observed / sourced** - strongest visual authority.
2. **Derived by IGNIS** - clearly labeled analytics.
3. **Evidence similarity** - relevance and explanation.
4. **AI synthesis** - helpful interpretation, always linked back to evidence.

### 10.2 Mission Builder UX

- Maximum 5-6 visible controls in the default view.
- Every numeric field shows units.
- Advanced/unsupported parameters stay hidden rather than creating false precision.
- Include one preloaded demo scenario.
- Primary CTA: `Find NASA Evidence`.

### 10.3 Evidence result card

Each result card contains:

```text
Experiment name
Evidence Similarity: 0.91
Confidence: High / Medium / Low

Why it matched
+ similar oxygen
+ comparable airflow
+ same fuel class

Important mismatch
- different geometry

[View experiment]
```

### 10.4 Experiment page

Recommended desktop layout:

```text
------------------------------------------------------------
Experiment title                       Evidence/source badge
Purpose / short summary
------------------------------------------------------------
Conditions             |  Observed findings
------------------------------------------------------------
Video / image           |  Synchronized derived chart
------------------------------------------------------------
Sources                 |  Related experiments
------------------------------------------------------------
Ask IGNIS about this experiment
------------------------------------------------------------
```

### 10.5 Empty/error states

The UI must have intentional states for:

- no comparable experiments;
- insufficient metadata;
- source unavailable;
- RAG retrieval below minimum evidence threshold;
- video analysis unavailable;
- backend/network error.

No empty state should silently fall back to invented content.

---

## 11. Data Model

### 11.1 `experiments`

```sql
experiments (
  id uuid primary key,
  external_id text,
  experiment_family text not null,
  title text not null,
  summary text,
  mission_platform text,
  gravity_environment text,
  objectives text[],
  source_url text,
  source_provider text,
  created_at timestamptz,
  updated_at timestamptz
)
```

### 11.2 `experiment_runs`

```sql
experiment_runs (
  id uuid primary key,
  experiment_id uuid references experiments(id),
  run_label text,
  fuel_type text,
  material text,
  geometry text,
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

### 11.3 `source_documents`

```sql
source_documents (
  id uuid primary key,
  experiment_id uuid references experiments(id),
  title text,
  document_type text,
  source_url text,
  citation_label text,
  raw_text_location text,
  checksum text
)
```

### 11.4 `source_chunks`

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

### 11.5 `media_assets`

```sql
media_assets (
  id uuid primary key,
  experiment_id uuid references experiments(id),
  run_id uuid references experiment_runs(id),
  media_type text,
  source_url text,
  local_or_cached_url text,
  duration_seconds double precision,
  metadata jsonb
)
```

### 11.6 `cv_measurements`

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

### 11.7 Provenance object

Every normalized field that may be transformed from source data should support provenance:

```json
{
  "field": "oxygen_pct",
  "value": 21.0,
  "source_type": "direct",
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

## 12. Evidence Matching Specification

### 12.1 Inputs

```ts
type Scenario = {
  fuelType?: string;
  material?: string;
  oxygenPct?: number;
  pressureKpa?: number;
  airflowCmS?: number;
  objectives?: string[];
  geometry?: string;
};
```

### 12.2 Factor scoring

Each factor returns either:

- score in `[0,1]`; or
- `null` when the comparison cannot be made.

Example numeric similarity:

```text
numeric_similarity(x, y, tolerance) = max(0, 1 - abs(x-y)/tolerance)
```

Example categorical logic:

```text
exact category match     -> 1.00
same parent class        -> 0.70
related / mapped class   -> 0.40
known mismatch           -> 0.00
missing                  -> null
```

### 12.3 Default weights

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

Weights are renormalized over available comparable factors so missing values do not automatically become zero.

### 12.4 Score formula

For available factors `F`:

```text
score = sum(weight_i * similarity_i) / sum(weight_i), for i in F
```

### 12.5 Coverage

```text
coverage = sum(original_weight_i for comparable factors)
```

Illustrative confidence mapping:

```text
coverage >= 0.80 -> High
coverage >= 0.55 -> Medium
otherwise        -> Low
```

The result must return both `score` and `coverage`.

### 12.6 Match explanation payload

```json
{
  "experimentRunId": "run-123",
  "evidenceSimilarity": 0.91,
  "coverage": 0.85,
  "confidence": "high",
  "factors": [
    {
      "field": "oxygen_pct",
      "scenario": 20.0,
      "experiment": 20.9,
      "similarity": 0.94,
      "weight": 0.20,
      "status": "strong_match"
    }
  ],
  "missing": ["geometry"],
  "warnings": []
}
```

### 12.7 Matching acceptance criteria

- Same scenario input produces deterministic ranking for the same dataset/version.
- Missing values do not silently become zero.
- Every score can be reconstructed from returned factor scores.
- UI never labels score as `risk`, `safety`, or `probability`.
- A low-coverage high-score result must visibly display low/medium confidence as applicable.

---

## 13. RAG / Ask IGNIS Specification

### 13.1 Retrieval corpus

The corpus may contain:

- experiment summaries;
- normalized run metadata;
- source document text;
- publication abstracts/sections where permitted;
- curated investigator findings;
- approved experiment notes.

### 13.2 Retrieval pipeline

```text
question
  -> query normalization
  -> metadata filters (optional scenario / experiment scope)
  -> vector retrieval
  -> keyword retrieval (optional)
  -> merge
  -> rerank
  -> evidence threshold
  -> generation
```

### 13.3 Generation contract

The LLM receives:

- the user question;
- scenario context, if any;
- retrieved source passages;
- experiment metadata;
- strict instruction to use only supplied scientific evidence for factual claims.

Expected structured response:

```json
{
  "answer": "...",
  "evidence": [
    {
      "sourceId": "...",
      "experimentId": "...",
      "claim": "..."
    }
  ],
  "limitations": ["..."],
  "confidence": "high|medium|low"
}
```

### 13.4 Low-evidence behavior

If retrieval evidence is below the configured threshold, the product should answer in the form:

> IGNIS does not have enough comparable evidence in the current dataset to support a confident answer. The closest available sources are shown below.

It must not substitute model memory for missing evidence in the scientific answer.

### 13.5 Prompt-injection resistance

Retrieved source text is untrusted content. The generation prompt must instruct the model not to follow instructions found inside retrieved documents. Only application/system instructions define behavior.

---

## 14. Computer Vision Specification

### 14.1 MVP objective

Derive a stable, visually meaningful flame time series from at least one selected NASA experiment video.

### 14.2 Preferred MVP pipeline

```text
video
  -> decode frames
  -> crop region of interest
  -> convert color space
  -> threshold candidate flame pixels
  -> morphological cleanup
  -> contour / connected-component selection
  -> compute metrics
  -> temporal smoothing
  -> persist measurements
```

### 14.3 MVP metric

Primary:
- flame area ratio = segmented flame pixels / ROI pixels.

Optional:
- flame vertical extent;
- centroid position;
- spread-front position;
- approximate extinction time.

### 14.4 CV output labeling

The UI must label the chart:

`Derived by IGNIS computer vision - not an official NASA measurement unless explicitly sourced as such.`

### 14.5 CV acceptance criteria

- The segmentation is visually stable enough that obvious non-flame background does not dominate the metric.
- Chart length matches video duration within frame/time conversion tolerance.
- Scrubbing video updates chart cursor within 250 ms client-side.
- Derived metric data includes pipeline/model version.

---

## 15. API Specification

Base prefix:

`/api/v1`

### 15.1 Health

```http
GET /health
```

Response:

```json
{ "status": "ok", "datasetVersion": "2026.09.25" }
```

### 15.2 Experiments

```http
GET /experiments
GET /experiments/{experimentId}
GET /experiments/{experimentId}/runs
GET /experiments/{experimentId}/related
```

### 15.3 Match

```http
POST /match
Content-Type: application/json
```

Request:

```json
{
  "scenario": {
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
  "datasetVersion": "2026.09.25",
  "results": [
    {
      "runId": "...",
      "experimentId": "...",
      "evidenceSimilarity": 0.91,
      "coverage": 0.85,
      "confidence": "high",
      "factors": [],
      "warnings": []
    }
  ]
}
```

### 15.4 Ask IGNIS

```http
POST /ask
```

Request:

```json
{
  "question": "How does airflow affect flame spread in the retrieved evidence?",
  "experimentIds": ["..."],
  "scenario": {},
  "topK": 8
}
```

Response:

```json
{
  "answer": "...",
  "evidence": [],
  "limitations": [],
  "confidence": "medium"
}
```

### 15.5 Media / analysis

```http
GET /media/{mediaId}
GET /media/{mediaId}/measurements
```

Optional offline/admin processing:

```http
POST /admin/media/{mediaId}/analyze
```

This endpoint should not be required during the live demo; analysis should be precomputed.

---

## 16. Technical Architecture

```text
                          +----------------------+
                          |      Next.js UI      |
                          |----------------------|
                          | Mission Builder      |
                          | Evidence Results     |
                          | Experiment Explorer  |
                          | Ask IGNIS            |
                          +----------+-----------+
                                     |
                                     v
                          +----------------------+
                          |       FastAPI        |
                          |----------------------|
                          | Matching service     |
                          | Experiment service   |
                          | RAG service          |
                          | Media service        |
                          +---+-------------+----+
                              |             |
                 +------------+             +-------------+
                 v                                          v
        +-------------------+                    +-------------------+
        | PostgreSQL        |                    | AI / ML           |
        | + pgvector        |                    | embeddings + LLM  |
        |-------------------|                    | OpenCV / sklearn  |
        | experiments       |                    +-------------------+
        | runs              |
        | sources/chunks    |
        | CV measurements   |
        +-------------------+
```

Suggested implementation:

- Frontend: Next.js, TypeScript, Tailwind CSS.
- Charts: Recharts; D3 only where custom behavior is needed.
- Graph stretch: React Flow.
- Backend: FastAPI, Python, Pydantic.
- Database: PostgreSQL + pgvector.
- Data: Pandas, NumPy.
- CV: OpenCV; scikit-learn or PyTorch only if required.
- Deployment: frontend and API can be deployed separately; prefer simple managed platforms that the team already knows.

---

## 17. Non-Functional Requirements

### 17.1 Performance

- P0 pages reach usable content within 3 seconds on normal broadband for cached demo data.
- `POST /match` target server response: <= 750 ms for <= 1,000 curated runs.
- `POST /ask` may be slower but should provide a visible loading state immediately.
- Precompute CV metrics; do not perform full video analysis during the live demo.

### 17.2 Reliability

- Demo scenario and source records must be cached/local enough to survive temporary external-source outages.
- If LLM service fails, evidence search and experiment exploration must still work.
- If a media asset fails, the experiment page must still render evidence metadata.

### 17.3 Accessibility

- Keyboard-accessible form controls.
- Visible focus state.
- Meaning is not conveyed by color alone.
- Charts have text summaries or accessible labels.
- Minimum readable contrast consistent with modern WCAG guidance.

### 17.4 Responsive behavior

- Desktop is the primary demo target.
- Tablet/mobile should remain functional, but complex graph layouts may be desktop-only for v1.

### 17.5 Reproducibility

- Matching responses include dataset version and scoring version.
- CV results include pipeline/model version.
- RAG responses record source IDs used for generation.

---

## 18. Scientific Integrity Requirements

| ID | Requirement |
|---|---|
| SI-001 | Every scientific fact shown as a sourced fact must have a source record. |
| SI-002 | Missing values are displayed as unknown/not available. |
| SI-003 | Evidence similarity is never described as a risk probability. |
| SI-004 | LLM-generated synthesis is labeled as AI synthesis. |
| SI-005 | CV-derived values are labeled as derived by IGNIS. |
| SI-006 | Conflicting or sparse evidence is disclosed. |
| SI-007 | The product includes a visible research/demo disclaimer. |
| SI-008 | The system avoids prescriptive mission-safety decisions. |
| SI-009 | Normalization transformations retain provenance. |
| SI-010 | Source links are preserved wherever technically possible. |

---

## 19. Security and Privacy

The hackathon product does not require personal user accounts for the core demo.

Requirements:

- Do not collect sensitive personal information.
- Keep API secrets server-side.
- Apply request-size limits to `/ask` and matching inputs.
- Sanitize/validate user inputs.
- Treat retrieved documents as untrusted text for LLM prompting.
- Use allowlisted media/source domains where practical.
- Do not expose internal database credentials in frontend code.

---

## 20. Analytics / Observability

For hackathon debugging, record non-sensitive product events:

- `scenario_submitted`
- `evidence_results_viewed`
- `experiment_opened`
- `ask_submitted`
- `ask_answered`
- `ask_low_evidence`
- `video_played`
- `cv_chart_interacted`
- `source_link_opened`

Backend logs should include:

- request ID;
- endpoint latency;
- dataset version;
- matching/scoring version;
- retrieval count;
- LLM error state;
- source IDs used by generated answers.

---

## 21. Content and Copy Rules

Preferred language:

- "Evidence Similarity: 91%"
- "Closest experimental evidence"
- "Observed in this experiment"
- "Derived by IGNIS"
- "AI synthesis based on the sources below"
- "The available evidence is insufficient to conclude..."

Avoid:

- "91% fire risk"
- "This spacecraft is safe/unsafe"
- "IGNIS predicts the fire will..." unless an actual validated predictive model is later introduced
- "NASA says..." unless the displayed source directly supports the statement

---

## 22. MVP Definition of Done

The MVP is complete when all of the following are true:

- [ ] At least 30 curated experiment/run records are ingested **or** the team has the maximum high-quality set feasible from the chosen source material.
- [ ] Records preserve source provenance.
- [ ] Mission Builder submits a valid scenario.
- [ ] Match API returns ranked evidence with factor explanations.
- [ ] Evidence page renders top matches and mismatches.
- [ ] At least one experiment detail page is fully populated with real source data.
- [ ] At least one real experiment video/media item is shown.
- [ ] At least one CV-derived time series is displayed and synchronized with media playback.
- [ ] Ask IGNIS retrieves evidence before answering.
- [ ] Answers expose source evidence and limitations.
- [ ] Scientific integrity labels are present.
- [ ] Core demo path is deployed and tested in the presentation environment.
- [ ] Team can complete the main demo in <= 2 minutes.

---

## 23. Acceptance Test Scenarios

### AT-01 - Strong evidence match

**Given** a demo scenario intentionally similar to a curated experiment  
**When** the user submits it  
**Then** that experiment appears near the top  
**And** the factors responsible for the match are visible.

### AT-02 - Missing evidence

**Given** a scenario with parameters not represented in the dataset  
**When** the user submits it  
**Then** IGNIS does not fabricate matching values  
**And** coverage/confidence reflects missing comparisons.

### AT-03 - Ask with strong sources

**Given** a question supported by the curated corpus  
**When** the user asks IGNIS  
**Then** the response cites/references the retrieved evidence  
**And** source items can be opened.

### AT-04 - Ask with weak sources

**Given** a question outside the curated corpus  
**When** the user asks IGNIS  
**Then** the system states that evidence is insufficient  
**And** it does not present model memory as a sourced answer.

### AT-05 - CV synchronization

**Given** the demo experiment video  
**When** playback reaches timestamp `t`  
**Then** the derived chart cursor represents the corresponding measurement at `t`.

### AT-06 - Terminology

**Given** any match result  
**Then** the score is labeled Evidence Similarity  
**And** no UI copy calls it risk probability.

---

## 24. Test Plan

### Unit tests

- numeric similarity function;
- categorical similarity maps;
- weight renormalization;
- coverage calculation;
- confidence mapping;
- input validation;
- provenance serialization.

### Integration tests

- scenario -> match API -> ranked UI;
- experiment API -> experiment page;
- retrieval -> generation -> source rendering;
- media measurement API -> synchronized chart.

### Manual scientific review

For every demo record:

- verify source ID;
- verify normalized units;
- verify summary does not exceed source support;
- verify match explanation is logically consistent;
- verify generated demo answer against its retrieved evidence.

### Demo resilience tests

- LLM timeout;
- external source link unavailable;
- media playback failure;
- browser refresh on result page;
- slow network;
- missing field in an experiment record.

---

## 25. 48-Hour Delivery Plan

| Time | Deliverable | Owner focus |
|---|---|---|
| 0-6h | Data schema + curated records + provenance | Data/backend + science review |
| 6-14h | Matching engine + API | AI/ML + backend |
| 14-24h | Mission Builder + results + experiment page | Frontend + UX |
| 24-32h | RAG retrieval + Ask IGNIS | AI/ML |
| 32-38h | Video analysis + synchronized chart | ML + frontend |
| 38-44h | Integration, error states, labels, deployment | Whole team |
| 44-48h | Visual polish, testing, pitch, rehearsal | Whole team |

### Gate 1 - Hour 6

Do we have real source records in the normalized schema?

If no: stop feature work and fix ingestion.

### Gate 2 - Hour 14

Can a scenario produce explainable ranked evidence?

If no: stop graph/chat work and fix matching.

### Gate 3 - Hour 24

Can a user complete scenario -> result -> experiment in the UI?

If no: cut stretch features.

### Gate 4 - Hour 38

Is one real CV demo stable?

If no: use the simplest robust metric and stop model experimentation.

---

## 26. Team Responsibilities

### Frontend / Web

- Next.js app shell and routes;
- Mission Builder;
- evidence result cards;
- experiment explorer;
- chart/video synchronization;
- responsive and accessible interactions.

### AI / ML

- similarity functions and scoring;
- retrieval and reranking;
- RAG generation contract;
- CV pipeline;
- evaluation examples.

### Data / Backend

- source ingestion;
- normalization;
- provenance;
- FastAPI endpoints;
- PostgreSQL/pgvector;
- deployment and caching.

### UI / UX

- information hierarchy;
- interaction flow;
- component visual system;
- evidence vs AI labeling;
- empty/error states;
- demo narrative and usability review.

---

## 27. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Source data is difficult to normalize | High | High | Curate a smaller reliable subset; do not chase full coverage |
| Dataset fields vary by experiment | High | Medium | Nullable schema + provenance + coverage-aware matching |
| RAG hallucinates | Medium | High | Evidence-only prompt, threshold, visible sources, low-evidence response |
| Video segmentation is unstable | Medium | Medium | Pick one suitable video; use ROI + simple robust metric |
| Team spends too long on knowledge graph | Medium | High | Graph is P2 until core journey is finished |
| Similarity looks like a safety score | Medium | High | Explicit naming, tooltips, disclaimer, separate coverage confidence |
| Live external source is unavailable | Medium | Medium | Cache required demo metadata/media where permitted |
| LLM latency/failure hurts demo | Medium | Medium | Prewarm/cache demo query; core evidence UI works without LLM |
| UI becomes a dense dashboard | Medium | Medium | Enforce guided journey and progressive disclosure |

---

## 28. Stretch Roadmap

Only pursue after MVP gates pass.

### P1

- side-by-side experiment comparison;
- semantic hybrid matching;
- additional experiment videos;
- scenario-scoped Ask IGNIS;
- related-experiment recommendations;
- polished onboarding/demo presets.

### P2

- interactive evidence knowledge graph;
- configurable matching weights;
- multi-experiment visual comparison;
- natural-language scenario construction;
- exportable evidence brief;
- investigator/research timeline views;
- richer multimodal analysis.

---

## 29. Demo Script Requirements

The product should support this exact two-minute path:

1. **Hook:** "A fire starts halfway to Mars. There is no fire department, and fire in microgravity does not behave the way we expect on Earth."
2. Open IGNIS with a preconfigured mission scenario.
3. Change one condition live to prove interactivity.
4. Click **Find NASA Evidence**.
5. Reveal ranked experiments and explain that the score is evidence similarity, not risk.
6. Open the strongest result.
7. Play real experiment media and show synchronized IGNIS-derived analysis.
8. Ask one prepared research question.
9. Show the answer and its evidence.
10. Close: "IGNIS does not ask AI to invent fire behavior. It lets NASA's experiments answer."

The demo should not depend on typing long prompts, waiting for data ingestion, or running CV inference live.

---

## 30. Open Questions

These must be resolved during implementation based on the actual source material:

1. Which experiment families have the cleanest metadata for the initial normalized schema?
2. Which single video provides the most reliable flame segmentation for the demo?
3. Which fields are consistently available across chosen experiment families?
4. Which source documents can be parsed and indexed cleanly for RAG?
5. What tolerance ranges should be used for oxygen, pressure, and airflow similarity?
6. Should material matching use a controlled taxonomy, embeddings, or both?
7. What minimum coverage should suppress a match from the default result set?
8. What evidence threshold should cause Ask IGNIS to return an insufficient-evidence response?
9. What exact scientific statements will be used in the demo, and have they been manually verified against the source?

---

## 31. Recommended Repository Structure

```text
ignis/
├── apps/
│   └── web/                       # Next.js
│       ├── app/
│       │   ├── page.tsx
│       │   ├── evidence/
│       │   ├── experiment/[id]/
│       │   └── ask/
│       ├── components/
│       │   ├── mission-builder/
│       │   ├── evidence-card/
│       │   ├── experiment/
│       │   └── charts/
│       └── lib/
├── services/
│   └── api/                       # FastAPI
│       ├── app/
│       │   ├── api/
│       │   ├── matching/
│       │   ├── rag/
│       │   ├── models/
│       │   └── db/
│       └── tests/
├── pipelines/
│   ├── ingest/
│   ├── normalize/
│   ├── embeddings/
│   └── vision/
├── data/
│   ├── curated/
│   ├── processed/
│   └── fixtures/
├── docs/
│   ├── data-dictionary.md
│   ├── scoring.md
│   └── demo-script.md
└── README.md
```

---

## 32. Initial Engineering Backlog

### Epic A - Data foundation

- [ ] Define canonical enums/taxonomies.
- [ ] Implement experiment/run Pydantic models.
- [ ] Create source-provenance structure.
- [ ] Normalize first 10 records manually.
- [ ] Add import validation.
- [ ] Expand to selected demo dataset.

### Epic B - Matching

- [ ] Implement numeric similarity.
- [ ] Implement categorical similarity.
- [ ] Implement objective-overlap score.
- [ ] Implement weight renormalization.
- [ ] Implement coverage/confidence.
- [ ] Return factor explanations.
- [ ] Write deterministic tests.

### Epic C - Web journey

- [ ] Build app shell and navigation.
- [ ] Build Mission Builder.
- [ ] Build loading state.
- [ ] Build evidence result card.
- [ ] Build result page.
- [ ] Build experiment detail page.
- [ ] Build source evidence component.

### Epic D - Ask IGNIS

- [ ] Parse/index selected documents.
- [ ] Create embeddings.
- [ ] Implement vector retrieval.
- [ ] Add reranking if needed.
- [ ] Define grounded-answer prompt.
- [ ] Create source rendering contract.
- [ ] Implement low-evidence behavior.

### Epic E - Flame Vision

- [ ] Select demonstration video.
- [ ] Define ROI.
- [ ] Prototype segmentation.
- [ ] Compute flame area time series.
- [ ] Smooth and validate visually.
- [ ] Export measurements.
- [ ] Build synchronized chart component.

### Epic F - Demo quality

- [ ] Add example scenario.
- [ ] Add disclaimers/tooltips.
- [ ] Test error states.
- [ ] Optimize loading/performance.
- [ ] Cache demo query.
- [ ] Rehearse two-minute script.

---

## 33. Final Product Statement

**IGNIS is a mission-to-evidence interface for NASA microgravity combustion research. It helps users find the most relevant experiments, understand why they are relevant, inspect what was actually observed, and use AI to synthesize the evidence without hiding where that evidence came from.**

The hackathon strategy is intentionally narrow: build one reliable evidence pipeline, one strong experiment experience, one real computer-vision analysis, and one grounded AI assistant. The result should feel like a coherent scientific product rather than a collection of AI features.
