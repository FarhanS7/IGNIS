# Phase 1 — Dependency Map

> **Cross-module dependencies, critical path, and parallelization opportunities for IGNIS v1.1.**

---

## Dependency Table

| Task | Blocked By | Reason |
|:---|:---|:---|
| **Module A — Data Foundation** | | |
| A.1 Enums & taxonomies | Nothing | First task, no dependencies |
| A.2 Experiment models | A.1 | Uses enum types |
| A.3 Source document models | A.1 | Uses enum types |
| A.4 Media & CV models | A.1 | Uses enum types |
| A.5 Data sources registry model | A.1 | Uses source role enums |
| A.6 Habitat presets model | A.1, A.2 | Uses destination/gravity enums + experiment schema knowledge |
| A.7 Stories data model | A.1, A.5 | References data_sources + experiment IDs |
| A.8 Schema migration SQL | A.2–A.7 | Needs all models defined |
| A.9 Mock data fixtures | A.2, A.5, A.6, A.7, A.8 | Needs schema + all models to validate against |
| A.10 Seed script | A.8, A.9 | Needs schema deployed + fixtures created |
| A.11 Experiment CRUD API | A.2, A.8 | Needs models + DB schema |
| **Module B1 — Eligibility Filter** | | |
| B1.1 Fuel/material compatibility | A.1 | Needs fuel taxonomy |
| B1.2 Objective compatibility | A.1 | Needs objective enums |
| B1.3 Gravity compatibility | A.1 | Needs gravity class enums |
| B1.4 Minimum comparable factors | A.2 | Needs experiment run field definitions |
| B1.5 Data quality check | A.5 | Needs data_sources provenance model |
| B1.6 Eligibility orchestrator | B1.1–B1.5 | Composes all checks |
| B1.7 Integration tests | B1.6, A.9 | Needs orchestrator + fixture data |
| **Module B2 — Matching Engine** | | |
| B2.1 Numeric similarity | A.1 | Needs field definitions |
| B2.2 Categorical similarity | A.1 | Needs enum/taxonomy definitions |
| B2.3 Objective overlap | A.1 | Needs objective enum |
| B2.4 Weight renormalization | B2.1, B2.2, B2.3 | Composes factor scores |
| B2.5 Coverage & confidence | B2.4 | Uses renormalized weights, includes gravity caps |
| B2.6 Behavior profile rules | B2.5, B1.6 | Needs scored results + eligibility info |
| B2.7 Match orchestrator | B1.6, B2.1–B2.6 | Composes eligibility → similarity → behavior |
| B2.8 POST /analyze endpoint | B2.7, A.11 | Needs orchestrator + experiment data access |
| B2.9 Integration tests | B2.8, A.9 | Needs endpoint + fixture data |
| **Module C — Web App** | | |
| C.1 Scaffold app | Nothing | Can start immediately |
| C.2 Design system | C.1 | Needs app scaffolded |
| C.3 Landing page (two-mode) | C.2 | Needs design system components |
| C.4 Habitat builder (/build) | C.2, A.1, A.6 | Needs components + enums + preset API |
| C.5 Evidence results (/evidence) | C.2, B2.8 | Needs components + analyze API |
| C.6 Why panel + visualization | C.5 | Extension of evidence results |
| C.7 Experiment explorer | C.2, A.11 | Needs components + experiment API |
| C.8 Ask IGNIS page | C.2, D.6 | Needs components + ask API |
| C.9 About page | C.2 | Needs components only |
| C.10 Error states | C.3–C.8 | Built after core pages exist |
| C.11 API client layer | C.1 | Can build early, before pages |
| **Module D — Ask IGNIS** | | |
| D.1 Embedding pipeline | A.3, A.8 | Needs source documents + schema |
| D.2 Vector retrieval | D.1, A.8 | Needs embeddings in DB |
| D.3 Reranking | D.2 | Needs retrieval results |
| D.4 LLM prompt template | Nothing | Can draft independently |
| D.5 Low-evidence fallback | D.2, D.3 | Needs retrieval pipeline |
| D.6 POST /ask endpoint | D.2–D.5 | Composes full RAG pipeline |
| D.7 Source rendering | D.6, C.8 | Needs ask API response shape + UI |
| **Module E — Flame Vision** | | |
| E.1 Select video + ROI | Nothing | Can start immediately |
| E.2 Frame extraction | E.1 | Needs video selected |
| E.3 Flame segmentation | E.2 | Needs frames extracted |
| E.4 Time series + smoothing | E.3 | Needs segmentation output |
| E.5 Export measurements | E.4, A.4, A.8 | Needs metrics + cv_measurements schema |
| E.6 Synchronized chart | E.5, C.7 | Needs measurements + experiment page |
| **Module F — Landing & Demo** | | |
| F.1 Canonical preset | A.6, C.4 | Needs preset model + habitat builder UI |
| F.2 Demo preset | C.4, B2.8 | Needs Habitat Builder + analyze API |
| F.3 Labels & disclaimers | C.5, C.7 | Needs evidence + experiment pages |
| F.4 Error states | C.10 | Extension of C.10 |
| F.5 Performance | All C tasks | Optimize after building |
| F.6 Cache demo query | B2.8, D.6 | Cache responses from analyze + ask |
| **Module G — Knowledge Graph (P2)** | | |
| G.1 Graph data model | A.2 | Needs experiment models |
| G.2 Graph extraction | G.1, A.9 | Needs model + data |
| G.3 React Flow component | G.2, C.2 | Needs data + design system |
| G.4 Navigation wiring | G.3, C.7 | Needs graph + experiment page |
| **Module H — Explore Fire Stories** | | |
| H.1 Story index page | C.2, A.7 | Needs design system + story model |
| H.2 Story player component | H.1 | Needs story index page |
| H.3 Microgravity fire story | H.2, A.9 | Needs player + experiment fixture data |
| H.4 Fire from Space story | H.2, I.4 | Needs player + Earthdata integration |
| H.5 Evidence card component | C.2, A.11 | Needs design system + experiment API |
| H.6 Story API endpoints | A.7, A.8 | Needs story model + schema |
| H.7 Story Ask IGNIS | H.2, D.6 | Needs story player + ask API |
| **Module I — NASA Sources** | | |
| I.1 Sources CRUD API | A.5, A.8 | Needs data_sources model + schema |
| I.2 NASA Open Data source | I.1 | Needs source API working |
| I.3 NASA API enrichment | I.1 | Needs source API working |
| I.4 Earthdata integration | I.1 | Needs source API working |
| I.5 Source/Provenance UI | I.1, I.2, I.3, I.4, C.2 | Needs all source data + design system |
| I.6 Source-role isolation test | I.4, B2.8 | Needs Earthdata data + matching engine |

---

## Critical Path

The longest dependency chain determines the minimum build time:

```
A.1 → A.2 → A.5 → A.8 → A.9 → B1.1 → B1.6 → B2.7 → B2.8 → B2.9 → C.5 → C.6 → C.10 → F.3 → F.5
 ↑                                                                       ↑
 Start                                                                  Gate 3
```

**Critical path length: 15 tasks**

---

## Parallelizable Work

These task groups have no shared dependencies and can be built in parallel:

| Parallel Track | Tasks |
|:---|:---|
| **Track 1: Backend data** | A.1 → A.2 → A.3 → A.4 → A.5 → A.6 → A.7 → A.8 → A.9 → A.10 → A.11 |
| **Track 2: Frontend scaffold** | C.1 → C.2 → C.11 (can start while Module A is in progress) |
| **Track 3: CV pipeline** | E.1 → E.2 → E.3 → E.4 (independent of backend until E.5) |
| **Track 4: RAG prompt** | D.4 (LLM prompt template — no dependencies) |
| **Track 5: Story drafts** | Can draft story content (H.3, H.4 text) while backend is being built |

Since this is a **solo developer**, parallelization means: work on Track 1 first, then Track 2 (quick scaffold), then back to Track 1 to finish Module A, then Module I, then Module B1, then Module B2, then integrate.

---

## Recommended Build Order (Solo Developer)

```
 1.  A.1   — Enums & taxonomies
 2.  A.2   — Experiment Pydantic models
 3.  A.3   — Source document models
 4.  A.4   — Media & CV models
 5.  A.5   — Data sources registry model (NEW)
 6.  A.6   — Habitat presets model (NEW)
 7.  A.7   — Stories data model (NEW)
 8.  A.8   — Schema migration SQL (10 tables)
 9.  C.1   — Scaffold React app (quick break from backend)
10.  C.2   — Design system tokens
11.  C.11  — API client layer
12.  A.9   — Mock data fixtures (all tables)
13.  A.10  — Seed script
14.  A.11  — Experiment CRUD API
         ← GATE 1: Do structured mock records + source registry entries exist? →
15.  I.1   — Sources CRUD API
16.  I.2   — NASA Open Data source
17.  I.3   — NASA API enrichment
18.  I.4   — Earthdata integration
19.  B1.1  — Fuel/material compatibility
20.  B1.2  — Objective compatibility
21.  B1.3  — Gravity compatibility
22.  B1.4  — Minimum comparable factors
23.  B1.5  — Data quality check
24.  B1.6  — Eligibility orchestrator
25.  B1.7  — Eligibility tests
26.  B2.1  — Numeric similarity
27.  B2.2  — Categorical similarity
28.  B2.3  — Objective overlap
29.  B2.4  — Weight renormalization
30.  B2.5  — Coverage & confidence
31.  B2.6  — Behavior profile rules (NEW)
32.  B2.7  — Match orchestrator (eligibility → similarity → behavior)
33.  B2.8  — POST /analyze endpoint
34.  B2.9  — Matching + eligibility integration tests
         ← GATE 2: Can scenario produce eligible, explainable ranked evidence + Fire Behavior Profile? →
35.  C.3   — Landing page (two-mode)
36.  C.4   — Habitat builder page (/build)
37.  C.5   — Evidence results page (/evidence)
38.  C.6   — Why panel + evidence-guided visualization
39.  C.7   — Experiment explorer page
         ← GATE 3: Can user complete Build → Evidence → Experiment? →
40.  E.1   — Select demo video + ROI
41.  E.2   — Frame extraction
42.  E.3   — Flame segmentation
43.  E.4   — Time series + smoothing
44.  E.5   — Export measurements
45.  E.6   — Synchronized chart component
         ← GATE 4: Is CV demo stable? →
46.  D.1   — Embedding pipeline
47.  D.2   — Vector retrieval (with source-role filter)
48.  D.3   — Reranking
49.  D.4   — LLM prompt template (with scope resolution)
50.  D.5   — Low-evidence fallback
51.  D.6   — POST /ask endpoint
52.  D.7   — Source rendering
         ← GATE 5: Does Ask IGNIS work? →
53.  C.8   — Ask IGNIS page
54.  H.6   — Story API endpoints
55.  H.1   — Story index page
56.  H.2   — Story player component
57.  H.5   — Evidence card for stories
58.  H.3   — P0 story: microgravity fire
59.  H.4   — P0 story: Fire from Space vs Fire in Space
60.  H.7   — Story Ask IGNIS integration
         ← GATE 6: Does Explore Fire story work end-to-end? →
61.  I.5   — Source/Provenance UI
62.  I.6   — Source-role isolation test
63.  C.9   — About page
64.  C.10  — Error states & loading
65.  F.1   — Canonical habitat preset
66.  F.2   — Demo preset
67.  F.3   — Labels & disclaimers
68.  F.4   — Error states polish
69.  F.5   — Performance
70.  F.6   — Cache demo query
         ← READY FOR DEPLOYMENT →
71-74. G.1–G.4 — Knowledge Graph (P2, only if time)
```
