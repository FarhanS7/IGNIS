# IGNIS — Master Implementation Plan

> **This is the index of everything.** Every phase, every module, every task document lives below. Execute in the order listed. Never skip a phase.
> 
> **Canonical PRD:** `IGNIS_PRD_v1.1.md` | **Canonical Concept:** `IGNIS_Project_Concept_v1.1.md`

---

## Locked Decisions (from clarification round)

| Decision | Value | Rationale |
|:---|:---|:---|
| **Frontend** | React + Vite + TypeScript | Simpler, faster dev server, no SSR overhead for hackathon |
| **CSS** | Tailwind CSS v4 | Utility-first, rapid iteration |
| **Animation** | Framer Motion + CSS | Evidence-guided visualization, story transitions, micro-interactions |
| **Backend** | FastAPI + Python (async, Pydantic v2) | Natural fit for data, ML, typed APIs |
| **Database** | Supabase (PostgreSQL + pgvector) | Free tier, hosted, auth included |
| **LLM** | Google Gemini 2.5 Flash + text-embedding | Provider-agnostic interface for swapping |
| **CV Pipeline** | OpenCV + NumPy | Frame extraction, flame segmentation |
| **Charts** | Recharts | React-native, simple integration |
| **Graph (P2)** | React Flow | Interactive evidence knowledge graph |
| **Deploy (FE)** | Vercel | Free tier, Vite-compatible |
| **Deploy (BE)** | Railway | FastAPI + Python, free/hobby tier |
| **Repo Structure** | Single repo: `apps/web/` + `services/api/` + `pipelines/` + `data/` | Full PRD structure, monorepo |
| **Team** | Solo + AI IDE | All tasks sequential unless AI can parallelize |
| **Data Strategy** | Mock data first, real-data adapter wired later | Swap-ready architecture |
| **API Endpoint** | `POST /analyze` | v1.1 PRD terminology |
| **Eligibility** | Separate module (B1) before matching (B2) | Scientific comparability before numerical similarity |

---

## v1.1 Major Changes from v1.0

| Area | v1.0 | v1.1 |
|:---|:---|:---|
| Entry point | Single "Mission Condition Builder" | Two modes: **Build a Habitat** + **Explore Fire** |
| Landing page | Generic landing | Two-mode selection with tagline |
| Scenario builder | Mission parameter form | Destination presets + separated Environment/Habitat controls |
| Results | Ranked experiments + scores | **Fire Behavior Profile** + ranked experiments + Why? panel |
| Eligibility | None (similarity only) | **Comparable-Evidence Filter** before matching |
| Evidence levels | Implicit | **5-level trust model** (A: Observed → E: AI Synthesis) |
| Stories | Not in v1.0 | **Explore Fire** — guided stories with evidence cards |
| NASA sources | Generic | **Source Registry** with 3 required NASA channels |
| Habitat presets | Not in v1.0 | **Destination presets** (Orbital, Moon, Mars) with defaults |
| Visualization | Not in v1.0 | **Evidence-guided habitat visualization** (not simulation) |
| API naming | `POST /match` | `POST /analyze` |
| Data model | 6 tables | **10 tables** (+data_sources, habitat_presets, stories, provenance) |

---

## Execution Order

```
Phase -1   →  PRD Sanity Check              docs/plans/phase-neg1/PRD-SANITY-CHECK.md
Phase 0    →  Project Foundation            docs/plans/phase-0/ARCHITECTURE.md
                                            docs/plans/phase-0/TECH-STACK.md
Phase 0.5  →  Git + Repo Setup              docs/plans/phase-0.5/GIT-SETUP.md
Phase 1    →  Modules → Tasks               docs/plans/phase-1/TASK-TREE.md
                                            docs/plans/phase-1/DEPENDENCY-MAP.md
             Per-module task files:
               Module A — Data Foundation   docs/plans/phase-1/module-A-data-foundation/
               Module B1 — Eligibility      docs/plans/phase-1/module-B1-eligibility-filter/
               Module B2 — Matching Engine  docs/plans/phase-1/module-B2-matching-engine/
               Module C — Web App           docs/plans/phase-1/module-C-web-app/
               Module D — Ask IGNIS (RAG)   docs/plans/phase-1/module-D-ask-ignis/
               Module E — Flame Vision      docs/plans/phase-1/module-E-flame-vision/
               Module F — Landing & Demo    docs/plans/phase-1/module-F-landing-demo/
               Module G — Knowledge Graph   docs/plans/phase-1/module-G-knowledge-graph/
               Module H — Explore Fire      docs/plans/phase-1/module-H-explore-fire/
               Module I — NASA Sources      docs/plans/phase-1/module-I-nasa-sources/
Phase 1.5  →  Environment & CI              docs/plans/phase-1.5/ENVIRONMENT.md
Phase 2    →  AI Code Loop                  (per task — use Phase 1 task files as prompts)
Phase 2.5  →  AI Adversarial Review         (per task — use PRD_TO_TASKS_FRAMEWORK.md §Phase 2.5)
Phase 3    →  Walkthrough & Learning        (per task — use PRD_TO_TASKS_FRAMEWORK.md §Phase 3)
Phase 4    →  Deployment & Release          docs/plans/phase-4/DEPLOYMENT.md
Phase 5    →  Post-Launch Ops               docs/plans/phase-5/POST-LAUNCH.md
```

---

## Decision Log

All architectural decisions are recorded once in:

```
docs/plans/DECISIONS.md
```

Every task document references DECISIONS.md by decision number. Never re-derive a decision inside a task.

---

## How to Use These Documents

1. **Each task file is a complete AI IDE command.** Paste it into a new chat session. The AI knows exactly what to build, what types to use, what tests to write, and when to commit.
2. **One task = one feature branch.** Branch naming is specified in each task file.
3. **One subtask = one commit.** Never bundle multiple subtasks.
4. **After Phase 2 (implement), always run Phase 2.5 (review) before Phase 3 (walkthrough).**
5. **The writer model never reviews its own code in the same session.** Switch to a different model or open a new session for review.

---

## Quality Gates

| Gate | Trigger | Action if Failed |
|:---|:---|:---|
| Gate 1 | After Module A + Module I | Do we have structured mock records in the normalized schema with source registry entries? If no → stop and fix data. |
| Gate 2 | After Module B1 + Module B2 | Can a scenario produce scientifically eligible, explainable ranked evidence with a Fire Behavior Profile? If no → stop and fix matching. |
| Gate 3 | After Module C (core pages) | Can a user complete Build → Evidence → Experiment in the UI? If no → cut stretch features. |
| Gate 4 | After Module E | Is one real CV demo stable? If no → use simplest robust metric. |
| Gate 5 | After Module D | Does Ask IGNIS retrieve evidence and cite sources? If no → simplify RAG pipeline. |
| Gate 6 | After Module H | Does at least one Explore Fire story work end-to-end with Earthdata context? If no → simplify story content. |

---

## Related Documents

- [IGNIS_PRD_v1.1.md](file:///e:/IGNIS/IGNIS_PRD_v1.1.md) — Full product requirements (canonical)
- [IGNIS_Project_Concept_v1.1.md](file:///e:/IGNIS/IGNIS_Project_Concept_v1.1.md) — Vision and concept (canonical)
- [PRD_TO_TASKS_FRAMEWORK.md](file:///e:/IGNIS/PRD_TO_TASKS_FRAMEWORK.md) — Phase execution framework
- [DECISIONS.md](file:///e:/IGNIS/docs/plans/DECISIONS.md) — All architectural decisions (D-001 through D-019)
- [docs/archive/](file:///e:/IGNIS/docs/archive/) — Superseded v1.0 documents
