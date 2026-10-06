# Phase 0 — Architecture Document

> **Run once. This becomes the single source of truth for all implementation tasks.**
> **Reference**: PRD_TO_TASKS_FRAMEWORK.md §Phase 0 | DECISIONS.md D-001 through D-019

---

## 1. Architecture Style

- **Style**: Modular monorepo with separated frontend SPA and backend API service
- **Why**: Solo developer, 48-hour hackathon, no microservices overhead needed
- **Module boundaries** (from PRD v1.1 §36 + DECISIONS.md D-006):

| Module | Path | Responsibility |
|:---|:---|:---|
| **apps/web** | `apps/web/` | React SPA — Landing (two-mode), Build-a-Habitat, Evidence Results, Experiment Explorer, Explore Fire stories, Ask IGNIS |
| **services/api** | `services/api/` | FastAPI — eligibility service, matching/behavior service, experiment service, RAG service, media service, story service, source registry service |
| **pipelines** | `pipelines/` | Offline data processing — NASA data ingestion (Open Data, API, Earthdata), normalization, embedding generation, CV analysis |
| **data** | `data/` | Curated datasets, processed fixtures, CV outputs |

---

## 2. System Design

### Request Flow
```
Browser → Vite dev server (dev) / Vercel CDN (prod)
         → FastAPI API at /api/v1/*
         → Supabase PostgreSQL + pgvector
         → Google Gemini API (for /ask endpoint only)
```

### Sync vs Async
- **Sync**: `/health`, `/experiments/*`, `/habitat-presets/*`, `/sources/*`, `/stories/*`, `/analyze` (matching is CPU-bound but fast for <1000 records)
- **Async**: `/ask` (LLM call), embedding generation (batch pipeline)

### Caching
- No caching layer for v1. Demo data is small enough.
- If `/analyze` latency exceeds 750ms, add in-memory experiment cache.
- Demo scenario response is pre-cached (Task F.6).

### CORS
- FastAPI CORS middleware allowing Vite dev origin (`localhost:5173`) and Vercel production domain

### First Likely Bottleneck
- LLM latency on `/ask` endpoint. Mitigation: show loading state immediately, pre-cache demo query response.

---

## 3. Database Design

### Engine
- PostgreSQL 15+ via Supabase with pgvector extension enabled

### Schema (10 tables — v1.1)

#### 3.1 `data_sources` (NEW v1.1)
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | `DEFAULT gen_random_uuid()` |
| registry | text | NOT NULL | NASA_OPEN_DATA, NASA_API, NASA_EARTHDATA, etc. |
| source_role | text | NOT NULL | primary_scientific, contextual, earth_observation_context, etc. |
| provider_name | text | yes | |
| dataset_identifier | text | yes | |
| api_name | text | yes | |
| sensor_name | text | yes | |
| source_url | text | yes | |
| retrieved_at | timestamptz | yes | |
| license_or_access | text | yes | |
| provenance | jsonb | yes | |

#### 3.2 `experiments`
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| external_id | text | yes | |
| source_id | uuid | FK → data_sources | NEW v1.1 |
| experiment_family | text | NOT NULL | |
| title | text | NOT NULL | |
| summary | text | yes | |
| mission_platform | text | yes | |
| gravity_environment | text | yes | |
| objectives | text[] | yes | |
| source_url | text | yes | |
| created_at | timestamptz | yes | |
| updated_at | timestamptz | yes | |

#### 3.3 `experiment_runs`
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| experiment_id | uuid | FK → experiments | |
| run_label | text | yes | |
| fuel_type | text | yes | |
| material | text | yes | |
| geometry | text | yes | |
| gravity_environment | text | yes | |
| oxygen_pct | double precision | yes | |
| pressure_kpa | double precision | yes | |
| airflow_cm_s | double precision | yes | |
| ignition_observed | boolean | yes | |
| extinction_observed | boolean | yes | |
| flame_spread_observed | boolean | yes | |
| observation_summary | text | yes | |
| source_url | text | yes | |
| data_quality | text | yes | |
| provenance | jsonb | yes | PRD v1.1 §18.10 |

#### 3.4 `habitat_presets` (NEW v1.1)
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| slug | text | UNIQUE | e.g. "orbital", "moon", "mars" |
| display_name | text | yes | |
| destination | text | yes | |
| gravity_class | text | yes | |
| gravity_value_g | double precision | yes | |
| external_environment_summary | text | yes | |
| default_oxygen_pct | double precision | yes | |
| default_pressure_kpa | double precision | yes | |
| default_airflow_cm_s | double precision | yes | |
| default_material | text | yes | |
| disclaimer | text | yes | |
| provenance | jsonb | yes | |

#### 3.5 `source_documents`
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| source_id | uuid | FK → data_sources | NEW v1.1 |
| experiment_id | uuid | FK → experiments | |
| title | text | yes | |
| document_type | text | yes | |
| source_url | text | yes | |
| citation_label | text | yes | |
| raw_text_location | text | yes | |
| checksum | text | yes | |

#### 3.6 `source_chunks`
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| document_id | uuid | FK → source_documents | |
| experiment_id | uuid | FK → experiments | |
| chunk_index | integer | yes | |
| content | text | yes | |
| embedding | vector(768) | yes | text-embedding-004 output |
| metadata | jsonb | yes | |

#### 3.7 `media_assets`
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| source_id | uuid | FK → data_sources | NEW v1.1 |
| experiment_id | uuid | FK → experiments | |
| run_id | uuid | FK → experiment_runs | |
| media_type | text | yes | |
| source_url | text | yes | |
| local_or_cached_url | text | yes | |
| duration_seconds | double precision | yes | |
| metadata | jsonb | yes | |

#### 3.8 `cv_measurements`
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| media_asset_id | uuid | FK → media_assets | |
| timestamp_seconds | double precision | yes | |
| flame_area_px | double precision | yes | |
| flame_area_ratio | double precision | yes | |
| flame_height_px | double precision | yes | |
| centroid_x | double precision | yes | |
| centroid_y | double precision | yes | |
| confidence | double precision | yes | |
| model_version | text | yes | |

#### 3.9 `stories` (NEW v1.1)
| Column | Type | Nullable | Notes |
|:---|:---|:---|:---|
| id | uuid | PK | |
| slug | text | UNIQUE | |
| title | text | yes | |
| summary | text | yes | |
| story_type | text | yes | |
| source_ids | uuid[] | yes | references data_sources |
| experiment_ids | uuid[] | yes | references experiments |
| earthdata_context | jsonb | yes | |
| sections | jsonb | yes | Ordered story sections |
| published | boolean | DEFAULT false | |

### Indexes
- `source_chunks_embedding_idx` — HNSW or IVFFlat on embedding column
- `experiments_family_idx` — btree on experiment_family
- `experiment_runs_experiment_id_idx` — btree on experiment_id
- `habitat_presets_slug_idx` — unique btree on slug
- `stories_slug_idx` — unique btree on slug
- `data_sources_registry_idx` — btree on registry

### Embedding Dimension
- 768 dimensions (text-embedding-004 output)
- `vector(768)` on `source_chunks.embedding`

### Migration Strategy
- SQL files in `services/api/migrations/` numbered sequentially
- Breaking change rule: additive-first always

---

## 4. Cross-Cutting Conventions

### Error Handling
- **Backend**: All errors return JSON: `{ "error": { "code": "EXPERIMENT_NOT_FOUND", "message": "...", "details": {} } }`
- Error codes are string enums in `services/api/app/errors.py`
- FastAPI global exception handler catches all unhandled exceptions → 500
- **Frontend**: API client wraps fetch with typed error handling → toast or inline error

### Auth
- No authentication for v1 (D-012)
- All endpoints are public

### Logging
- **Backend**: Python structlog with JSON output
- Every request gets a `request_id` (UUID) via middleware
- Log levels: ERROR (unhandled, LLM failures), WARN (low evidence, missing fields), INFO (request start/end, latency)
- **Frontend**: console.error for API failures

### Environment / Config
- All secrets in `.env` files (never committed)
- `.env.example` in each sub-project
- FastAPI validates all required env vars at boot via Pydantic Settings
- **Required**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
- **Optional**: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NASA_API_KEY`

### API Versioning
- All endpoints under `/api/v1/` prefix
- Response includes dataset/scoring/eligibility-rule versions (PRD v1.1 §25.5)

### Naming Conventions
- **Python**: snake_case for variables/functions, PascalCase for classes, UPPER_SNAKE for constants
- **TypeScript**: camelCase for variables/functions, PascalCase for types/components, UPPER_SNAKE for constants
- **API endpoints**: kebab-case for multi-word paths
- **Database**: snake_case for all table and column names

### Type Contracts
- Backend Pydantic models are the source of truth for all data shapes
- Frontend TypeScript types must mirror backend models exactly
- Shared types in `apps/web/src/types/` manually kept in sync

---

## Exit Condition

Phase 0 is complete when:
- [ ] ARCHITECTURE.md is saved and reviewed
- [ ] Database schema covers all 10 PRD v1.1 tables + indexes
- [ ] Error format is defined
- [ ] Environment variables are listed
- [ ] The developer has no open questions about the architecture
