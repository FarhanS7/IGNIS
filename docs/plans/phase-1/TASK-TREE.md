# Phase 1 — Full Task Tree

> **The complete module → task hierarchy for IGNIS v1.1.**
> **Every leaf task becomes one feature branch, one AI Code Loop prompt, and one set of commits.**

---

## Task Tree

```
IGNIS v1.1
├── Module A — Data Foundation
│   ├── A.1  — Define canonical enums and taxonomies (updated for v1.1)
│   ├── A.2  — Implement experiment & run Pydantic models (updated for v1.1)
│   ├── A.3  — Implement source document & chunk models
│   ├── A.4  — Implement media asset & CV measurement models
│   ├── A.5  — Implement data_sources registry model (NEW v1.1)
│   ├── A.6  — Implement habitat_presets model (NEW v1.1)
│   ├── A.7  — Implement stories data model (NEW v1.1)
│   ├── A.8  — Create Supabase schema migration SQL (updated: 10 tables)
│   ├── A.9  — Build mock data fixtures (30+ records + presets + stories + sources)
│   ├── A.10 — Build seed script (load fixtures → Supabase)
│   └── A.11 — Build experiment CRUD API endpoints
│
├── Module B1 — Comparable-Evidence Filter (NEW v1.1)
│   ├── B1.1 — Implement fuel/material compatibility check
│   ├── B1.2 — Implement objective compatibility check
│   ├── B1.3 — Implement gravity-environment compatibility + mismatch warnings
│   ├── B1.4 — Implement minimum-comparable-factors check
│   ├── B1.5 — Implement data-quality/provenance check
│   ├── B1.6 — Implement eligibility orchestrator (compose all checks)
│   └── B1.7 — Write eligibility integration tests
│
├── Module B2 — Matching Engine (renamed from B)
│   ├── B2.1 — Implement numeric similarity function
│   ├── B2.2 — Implement categorical similarity function
│   ├── B2.3 — Implement objective-overlap scoring
│   ├── B2.4 — Implement weight renormalization over available factors
│   ├── B2.5 — Implement coverage & confidence calculation (updated: gravity caps)
│   ├── B2.6 — Implement Fire Behavior Profile aggregation rules (NEW v1.1)
│   ├── B2.7 — Implement match orchestrator (eligibility → similarity → behavior)
│   ├── B2.8 — Build POST /analyze API endpoint (renamed from /match)
│   └── B2.9 — Write deterministic matching + eligibility integration tests
│
├── Module C — Web App (Frontend) (REWRITTEN for v1.1)
│   ├── C.1  — Scaffold React+Vite app with Tailwind v4 + routing + Framer Motion
│   ├── C.2  — Build design system (theme tokens, shared components, evidence hierarchy)
│   ├── C.3  — Build two-mode Landing page (/)
│   ├── C.4  — Build destination selector + habitat parameter controls (/build)
│   ├── C.5  — Build Fire Behavior Profile + evidence results page (/evidence)
│   ├── C.6  — Build Why? panel + evidence-guided habitat visualization
│   ├── C.7  — Build Experiment Explorer page (/experiment/:id)
│   ├── C.8  — Build Ask IGNIS page (/ask)
│   ├── C.9  — Build About page (/about)
│   ├── C.10 — Build error states, loading skeletons, empty states
│   └── C.11 — Build API client layer (typed fetch wrapper)
│
├── Module D — Ask IGNIS (RAG)
│   ├── D.1 — Build embedding generation pipeline
│   ├── D.2 — Implement vector retrieval from pgvector (updated: source-role filter)
│   ├── D.3 — Implement reranking logic
│   ├── D.4 — Build grounded-answer LLM prompt template (updated: scope resolution)
│   ├── D.5 — Implement low-evidence fallback behavior
│   ├── D.6 — Build POST /ask API endpoint (updated: scope parameter)
│   └── D.7 — Build source-rendering contract (response → UI)
│
├── Module E — Flame Vision (CV)
│   ├── E.1 — Select and prepare demo video + define ROI
│   ├── E.2 — Build frame extraction pipeline
│   ├── E.3 — Build flame segmentation (HSV threshold + contours)
│   ├── E.4 — Compute flame area time series + temporal smoothing
│   ├── E.5 — Export measurements as JSON + persist to DB
│   └── E.6 — Build synchronized video + chart component
│
├── Module F — Landing & Demo Polish
│   ├── F.1 — Build canonical habitat preset (orbital/deep-space demo)
│   ├── F.2 — Add demo preset scenario (one-click)
│   ├── F.3 — Add scientific integrity labels and disclaimers
│   ├── F.4 — Add error states, empty states, tooltips
│   ├── F.5 — Performance optimization and loading
│   └── F.6 — Cache demo query response
│
├── Module G — Knowledge Graph (P2 Stretch)
│   ├── G.1 — Define graph data model (nodes, edges from metadata)
│   ├── G.2 — Build graph data extraction from experiment records
│   ├── G.3 — Build interactive React Flow graph component
│   └── G.4 — Wire graph to experiment explorer navigation
│
├── Module H — Explore Fire Stories (NEW v1.1)
│   ├── H.1 — Build story index page (/explore)
│   ├── H.2 — Build story player component (/explore/:slug)
│   ├── H.3 — Create P0 story: "Why does fire behave differently in microgravity?"
│   ├── H.4 — Create P0 story: "Fire from Space vs Fire in Space" (Earthdata bridge)
│   ├── H.5 — Build evidence card component for stories
│   ├── H.6 — Build GET /stories and GET /stories/:slug API endpoints
│   └── H.7 — Wire story Ask IGNIS integration (scoped questions)
│
└── Module I — NASA Source Registry & Integrations (NEW v1.1)
    ├── I.1 — Implement data_sources CRUD API (GET /sources, GET /sources/:id)
    ├── I.2 — Register at least one NASA Open Data source/dataset
    ├── I.3 — Integrate at least one NASA API enrichment (visible in product)
    ├── I.4 — Integrate NASA Earthdata remote-sensing context for Explorer story
    ├── I.5 — Build Source/Provenance UI view
    └── I.6 — Validate source-role isolation (Earthdata excluded from matching)
```

---

## Task Count Summary

| Module | Tasks | Priority |
|:---|:---:|:---|
| A — Data Foundation | 11 | P0 — build first |
| B1 — Eligibility Filter | 7 | P0 — build second |
| B2 — Matching Engine | 9 | P0 — build third |
| C — Web App | 11 | P0 — build after B2 (scaffold early in parallel) |
| D — Ask IGNIS | 7 | P0 — build after A |
| E — Flame Vision | 6 | P0 — build after A |
| F — Landing & Demo | 6 | P0/P1 — build last before demo |
| G — Knowledge Graph | 4 | P2 — only if gates pass |
| H — Explore Fire | 7 | P0 — build after C + I |
| I — NASA Sources | 6 | P0 — build alongside/after A |
| **Total** | **74** | |

---

## Notes

- Each task has its own detailed command file in `docs/plans/phase-1/module-X-name/task-XX-name.md`
- Tasks within a module are ordered by dependency — build them sequentially
- Cross-module dependencies are documented in DEPENDENCY-MAP.md
- v1.1 added 26 new tasks over v1.0's 48 (total: 74)
