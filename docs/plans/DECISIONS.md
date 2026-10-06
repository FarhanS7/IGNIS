# IGNIS — Architectural Decision Log

> Every architectural decision is recorded here **once** and referenced by number everywhere else. Never re-derive a decision inside a task document.
> 
> **Canonical PRD:** `IGNIS_PRD_v1.1.md` | **Canonical Concept:** `IGNIS_Project_Concept_v1.1.md`

---

## Format

Each decision follows:

```
## D-NNN: Title
- **Status**: Accepted | Superseded | Deferred
- **Date**: YYYY-MM-DD
- **Context**: Why this decision was needed
- **Decision**: What was decided
- **Alternatives considered**: What lost and why
- **Consequences**: What this enables or constrains
```

---

## D-001: Frontend Framework — React + Vite + TypeScript

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: The PRD v1.1 suggests Next.js. For a solo hackathon build with no SSR or SEO requirements (the app is a tool, not a content site), the overhead of Next.js's app router, server components, and build complexity is unnecessary.
- **Decision**: Use React 19 + Vite 6 + TypeScript 5.x. Client-side SPA with React Router v7 for routing.
- **Alternatives considered**:
  - **Next.js 15**: Stronger ecosystem for full-stack, but SSR adds complexity with no benefit for a demo app that runs entirely client-side. Build times are slower. API routes would conflict with the separate FastAPI backend.
- **Consequences**: No SSR. API calls go directly to FastAPI. Deployment is a static build on Vercel. React Router handles all client routing. Page structure from PRD v1.1 §8 maps to React Router routes.

---

## D-002: CSS Framework — Tailwind CSS v4

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: Rapid UI development needed for hackathon. Vanilla CSS is too slow for a solo developer building 8+ pages.
- **Decision**: Tailwind CSS v4. Use the Vite plugin (`@tailwindcss/vite`). No `tailwind.config.js` — v4 uses CSS-first configuration via `@theme` in the main CSS file.
- **Alternatives considered**:
  - **Tailwind v3**: Stable but v4 is production-ready and has better performance, native CSS cascade layers, and simplified config.
  - **Vanilla CSS**: Full control but too slow for hackathon pace.
- **Consequences**: All styling via utility classes. Custom design tokens defined in `@theme` block in `index.css`. Component library: shadcn/ui (compatible with Tailwind v4).

---

## D-003: Backend Framework — FastAPI + Python

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: The backend must serve a matching API, eligibility filter, behavior profile rules, RAG pipeline, story service, source registry, and CV pipeline. Python is the natural choice for ML/data work. FastAPI provides typed endpoints with Pydantic validation.
- **Decision**: FastAPI (latest) with Python 3.12+, Pydantic v2 for all models, async endpoints for I/O-bound operations (DB, LLM calls).
- **Alternatives considered**:
  - **Flask**: Simpler but no native async, no built-in validation, no auto-generated OpenAPI docs.
  - **Django REST**: Too heavy for this scope. ORM is unnecessary when using Supabase client.
- **Consequences**: All request/response models are Pydantic v2 classes. OpenAPI docs auto-generated at `/docs`. CORS configured for the Vite dev server origin. New v1.1 services (eligibility, behavior, stories, sources) are FastAPI routers.

---

## D-004: Database — Supabase (PostgreSQL + pgvector)

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: Need structured relational storage for experiments + vector storage for RAG embeddings. Supabase provides both via PostgreSQL + pgvector extension, plus a free tier with hosted management.
- **Decision**: Supabase free tier. Access via `supabase-py` client from FastAPI. Enable pgvector extension for source_chunks embeddings.
- **Alternatives considered**:
  - **Local PostgreSQL via Docker**: No external dependency, but requires manual setup, backup, and pgvector compilation.
  - **SQLite**: Simplest but no vector search, no concurrent access from deployed backend.
- **Consequences**: Schema migrations managed via Supabase dashboard or SQL files in `services/api/migrations/`. Connection string stored in `.env`. All queries use the Supabase Python client or raw SQL via `asyncpg` for performance-critical paths. v1.1 adds `data_sources`, `habitat_presets`, and `stories` tables to the schema.

---

## D-005: LLM Provider — Google Gemini 2.5 Flash

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: Need an LLM for RAG synthesis (Ask IGNIS) and text embeddings for vector search. Gemini 2.5 Flash offers fast inference, large context window, and free API tier.
- **Decision**: Google Gemini 2.5 Flash for generation. `text-embedding-004` for embeddings. Access via `google-genai` Python SDK. Wrap behind a provider-agnostic interface so the LLM can be swapped later.
- **Alternatives considered**:
  - **OpenAI GPT-4o-mini**: Strong but requires paid API key from day one.
  - **Anthropic Claude**: Excellent quality but higher cost per token.
- **Consequences**: LLM calls wrapped in `services/api/app/llm/provider.py` with a `LLMProvider` protocol. Embedding dimension matches pgvector column size. API key stored in `.env`.

---

## D-006: Repository Structure — Monorepo with Full PRD Layout

- **Status**: Accepted (updated for v1.1)
- **Date**: 2026-09-26, updated 2026-09-30
- **Context**: Solo developer needs everything in one repo. PRD v1.1 §36 specifies a structured layout with clear separation including new directories for eligibility, behavior, stories, and sources.
- **Decision**: Single Git repo with:
  ```
  ignis/
  ├── apps/web/              # React + Vite frontend
  │   ├── src/
  │   │   ├── pages/         # Route pages (build, evidence, experiment, explore, ask, about)
  │   │   ├── components/    # habitat-builder, behavior-profile, evidence-card, experiment, story, charts
  │   │   ├── lib/           # API client, utils
  │   │   └── types/         # TypeScript types mirroring Pydantic models
  ├── services/api/          # FastAPI backend
  │   ├── app/
  │   │   ├── api/           # Route handlers
  │   │   ├── eligibility/   # Comparable-evidence filter (NEW v1.1)
  │   │   ├── matching/      # Similarity scoring
  │   │   ├── behavior/      # Fire Behavior Profile rules (NEW v1.1)
  │   │   ├── rag/           # Ask IGNIS RAG pipeline
  │   │   ├── stories/       # Explore Fire story service (NEW v1.1)
  │   │   ├── sources/       # NASA source registry (NEW v1.1)
  │   │   └── db/            # Database client and queries
  │   └── tests/
  ├── pipelines/             # Offline processing
  │   ├── ingest/            # nasa_open_data/, nasa_api/, earthdata/ (NEW v1.1)
  │   ├── normalize/
  │   ├── embeddings/
  │   └── vision/
  ├── data/                  # Curated data, fixtures, processed outputs
  │   ├── curated/
  │   ├── processed/
  │   └── fixtures/
  ├── docs/                  # Architecture, plans, ADRs
  └── README.md
  ```
- **Alternatives considered**:
  - **Simple `web/` + `api/`**: Fewer folders but pipelines and data would clutter root.
- **Consequences**: Each folder has its own `package.json` / `requirements.txt`. No monorepo tooling (turborepo/nx) needed for a solo build.

---

## D-007: Deployment — Vercel (FE) + Railway (BE)

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: Need free-tier hosting for hackathon demo. Frontend is a static Vite build. Backend is a Python FastAPI server.
- **Decision**: Frontend on Vercel (static build). Backend on Railway (Docker container or Nixpacks auto-detect).
- **Alternatives considered**:
  - **Render for backend**: Similar to Railway but Railway has simpler Python deployment and better free tier for short-lived projects.
- **Consequences**: Vercel config in `apps/web/vercel.json`. Railway config via `Procfile` or `railway.json` in `services/api/`. Environment variables set per platform.

---

## D-008: Data Strategy — Mock Data First

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: Real NASA data ingestion is the riskiest part of the project. Building UI and matching logic against mock data that matches the final schema lets the team validate the entire pipeline before data is ready.
- **Decision**: Build all modules against mock data in `data/fixtures/`. Mock data follows the exact Pydantic models and DB schema. A data adapter interface allows swapping mock → real data without changing any service code. v1.1 adds `data_sources`, `habitat_presets`, and `stories` fixture files.
- **Consequences**: `data/fixtures/` contains JSON files matching the schema. Seed script loads fixtures into Supabase. Real data ingestion (Module I) produces the same shape.

---

## D-009: Computer Vision — OpenCV Classical Pipeline

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: The CV goal is one stable flame time-series from one video. Deep learning is overkill and adds deployment complexity.
- **Decision**: OpenCV + NumPy. HSV color thresholding → morphological cleanup → contour detection → metric extraction → temporal smoothing. Results stored as precomputed JSON in `data/processed/cv/`.
- **Alternatives considered**:
  - **PyTorch segmentation model**: Better accuracy on diverse videos but requires GPU, training data, and adds deployment weight.
- **Consequences**: CV pipeline runs offline in `pipelines/vision/`. Outputs are JSON time-series files loaded by the API at runtime. No live CV inference during demo.

---

## D-010: Charts — Recharts

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: Need line charts (CV time series), bar charts (factor scores), and possibly radar charts (multi-factor comparison). Recharts is React-native and simple.
- **Decision**: Recharts for all charts. D3 only if a specific visualization cannot be built with Recharts.
- **Consequences**: Chart components in `apps/web/src/components/charts/`. Recharts is a peer dependency of the web app.

---

## D-011: Knowledge Graph — React Flow (P2 Stretch)

- **Status**: Deferred (P2)
- **Date**: 2026-09-26
- **Context**: Knowledge graph is a strong differentiator but not required for the core demo. Build only after the mission-to-evidence journey works end-to-end.
- **Decision**: React Flow for interactive graph visualization. Nodes generated from structured metadata, not live LLM extraction.
- **Consequences**: Module G is the last module in the task tree. Only built if all P0 modules pass their quality gates.

---

## D-012: No User Authentication for v1

- **Status**: Accepted
- **Date**: 2026-09-26
- **Context**: PRD v1.1 §26 states the hackathon product does not require personal user accounts for the core demo.
- **Decision**: No auth. No user sessions. All API endpoints are public. Supabase auth is available but not wired.
- **Consequences**: No JWT, no guards, no RBAC. If auth is added post-hackathon, it goes through Supabase Auth + RLS policies.

---

## D-013: Comparable-Evidence Eligibility Filter (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §14 introduces a comparable-evidence filter that runs before similarity ranking. Weighted similarity alone is insufficient because numerically similar experiments may be scientifically inappropriate to compare. This is a new concept not in v1.0.
- **Decision**: Implement a separate eligibility service in `services/api/app/eligibility/`. Each experiment/run receives an eligibility state (`eligible`, `eligible_with_warning`, `ineligible`) before entering the similarity scorer. P0 checks: fuel/material compatibility, objective compatibility, gravity-environment compatibility, minimum comparable factors, data quality. P1 checks: geometry, scale/regime, ignition method, flow regime.
- **Alternatives considered**:
  - **Fold into matching weights**: Simpler but would allow scientifically invalid comparisons to surface as high-confidence results.
- **Consequences**: New Module B1 in the task tree. Eligibility runs before Module B2 (matching). API response includes eligibility status, reasons, and warnings per result. Gravity mismatch for Moon/Mars scenarios is surfaced as a warning, not silently ignored.

---

## D-014: Fire Behavior Profile (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §10.4 replaces generic risk scores with evidence-oriented behavior dimensions. The product must never show "Risk = 87%" — instead it shows dimensions like "Flame-spread evidence: Elevated" derived from matched experiments.
- **Decision**: Implement behavior profile aggregation rules in `services/api/app/behavior/`. The profile is computed from eligible+ranked experiments and returns dimensions (flame-spread, sustained-burning, extinction, etc.) with evidence levels (Elevated/Mixed/Limited) and coverage (High/Medium/Low). Unsupported dimensions are hidden or labeled "insufficient evidence."
- **Alternatives considered**:
  - **Single risk score**: Explicitly forbidden by PRD v1.1 P2, P5, SI-003, SI-004.
- **Consequences**: New tasks in Module B2. Results page shows Fire Behavior Profile prominently. Every behavior label links to the evidence used via a "Why?" panel.

---

## D-015: Explore Fire Stories (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §11 introduces guided fire stories as a major new entry point. Stories are not disconnected content — each connects to real source evidence. P0 requires two stories: "Why does fire look different in microgravity?" and "Fire from Space vs Fire in Space" (Earthdata bridge). Audio narration is P2.
- **Decision**: Implement stories as a new Module H with story data model (`stories` table), story service, story index page, and story player component. Stories reference `data_sources` and `experiment` records. The "Fire from Space vs Fire in Space" story integrates NASA Earthdata content.
- **Alternatives considered**:
  - **Static markdown pages**: Simpler but cannot reference experiment records or embed dynamic evidence cards.
- **Consequences**: New `stories` table in DB schema. New `/explore` and `/explore/[slug]` routes. Story content includes text segments, animations, NASA media, evidence cards, and suggested Ask IGNIS questions. Earthdata content is labeled separately from microgravity evidence.

---

## D-016: NASA Source Registry (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §12 requires explicit integration with three NASA data channels: NASA Open Data, NASA APIs, and NASA Earthdata remote sensors. Each has a distinct source role and must not be blended. The hackathon requires proof of use of all three.
- **Decision**: Implement a `data_sources` registry table and source service in `services/api/app/sources/`. Every ingested item references its source registry entry. Source roles: `primary_scientific`, `normalized_scientific`, `contextual`, `media`, `earth_observation_context`, `derived_by_ignis`. A Source/Provenance view in the UI shows all three NASA families.
- **Alternatives considered**:
  - **Implicit provenance**: Simpler but fails hackathon judging requirements for visible NASA integration.
- **Consequences**: New Module I in the task tree. New `data_sources` table. New API endpoints: `GET /sources`, `GET /sources/{sourceId}`. Pipeline directories for each NASA channel: `pipelines/ingest/nasa_open_data/`, `pipelines/ingest/nasa_api/`, `pipelines/ingest/earthdata/`. Earthdata content excluded from microgravity matching.

---

## D-017: Habitat Presets (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §10.1-10.3 introduces destination presets (Orbital, Moon, Mars) with default habitat values. The Build-a-Habitat experience separates destination context from interior habitat settings.
- **Decision**: Implement `habitat_presets` table and API endpoints: `GET /habitat-presets`, `GET /habitat-presets/{slug}`. Presets include destination, gravity class, default oxygen/pressure/airflow/material values, and disclaimers. Preset values are labeled "reference scenario defaults" not universal mission values.
- **Alternatives considered**:
  - **Hardcoded in frontend**: Simpler but prevents backend-driven preset updates and breaks the mock-data-first strategy.
- **Consequences**: New tasks in Module A (data foundation). New API endpoints. Frontend destination selector loads presets from API.

---

## D-018: Animation — Framer Motion (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §22 suggests CSS/Framer Motion for animations. The Build-a-Habitat experience needs evidence-guided visualization states, story transitions, and micro-interactions that CSS alone handles awkwardly.
- **Decision**: Add Framer Motion to the frontend stack for page transitions, habitat visualization states, story player animations, and micro-interactions. CSS animations for simple hover/focus states. No full game engine.
- **Alternatives considered**:
  - **CSS-only animations**: Sufficient for basic transitions but verbose for orchestrated multi-element sequences.
  - **Three.js / game engine**: Too heavy for the MVP.
- **Consequences**: `framer-motion` added to `apps/web/` dependencies. Evidence-guided visualization component uses Framer Motion for state transitions. Persistent "illustrative visualization — not simulation" label required.

---

## D-019: API Endpoint Rename — POST /analyze (NEW v1.1)

- **Status**: Accepted
- **Date**: 2026-09-30
- **Context**: PRD v1.1 §21.4 specifies `POST /analyze` instead of the v1.0 `POST /match`. The response is richer: includes eligibility, behaviorProfile, confidence, and factor explanations alongside ranked results.
- **Decision**: Rename the main scenario analysis endpoint from `POST /match` to `POST /analyze`. The endpoint orchestrates eligibility filtering → similarity matching → behavior profile aggregation → response assembly.
- **Alternatives considered**:
  - **Keep `/match`**: Simpler but diverges from the PRD v1.1 specification.
- **Consequences**: All task files, API client code, and tests reference `/analyze` instead of `/match`. The response schema includes `behaviorProfile`, `results` (with eligibility, evidenceSimilarity, coverage, confidence, factors, warnings), and version metadata.
