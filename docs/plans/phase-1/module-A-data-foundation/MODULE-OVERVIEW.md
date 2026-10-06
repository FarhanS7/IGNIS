# Module A — Data Foundation

> **Purpose:** Define every data model, enum, table, mock fixture, seed script, and base API that every other module builds on.
>
> **Reference:** PRD v1.1 §18 (Data Model), §13 (Evidence Layer), §14 (Eligibility), §12 (NASA Sources), §10 (Habitat)
>
> **Decisions:** D-003, D-004, D-006, D-008, D-016, D-017

---

## What Changed in v1.1

| v1.0 | v1.1 |
|:---|:---|
| 6 tables | **10 tables** (+data_sources, habitat_presets, stories, richer provenance) |
| No source registry | `data_sources` table with registry, source_role, provider metadata |
| No habitat presets | `habitat_presets` table with destination, gravity, defaults |
| No stories model | `stories` table with slug, sections, earthdata_context |
| Basic provenance | **Structured provenance objects** with source_type, source_location, normalization |
| 8 tasks | **11 tasks** |

---

## Tasks (11)

| Task | File | Summary |
|:---|:---|:---|
| A.1 | `task-A1-enums-taxonomies.md` | Canonical enums: fuel types, gravity environments, objectives, source roles, registries, evidence levels, destination types, story types |
| A.2 | `task-A2-experiment-models.md` | Pydantic models for experiments and experiment_runs |
| A.3 | `task-A3-source-models.md` | Pydantic models for source_documents and source_chunks |
| A.4 | `task-A4-media-models.md` | Pydantic models for media_assets and cv_measurements |
| A.5 | `task-A5-data-sources-model.md` | Pydantic model for data_sources registry (NEW v1.1) |
| A.6 | `task-A6-habitat-presets-model.md` | Pydantic model for habitat_presets (NEW v1.1) |
| A.7 | `task-A7-stories-model.md` | Pydantic model for stories (NEW v1.1) |
| A.8 | `task-A8-schema-migration.md` | Supabase SQL migration for all 10 tables |
| A.9 | `task-A9-mock-fixtures.md` | Mock data JSON files for all tables |
| A.10 | `task-A10-seed-script.md` | Load fixtures → Supabase script |
| A.11 | `task-A11-experiment-api.md` | GET /experiments, GET /experiments/:id, GET /experiments/:id/runs, GET /experiments/:id/related |

---

## Exit Condition (Gate 1)

- [ ] All 10 Pydantic models compile without errors
- [ ] SQL migration creates all 10 tables with correct foreign keys
- [ ] 30+ experiment/run mock records exist in fixtures
- [ ] At least 3 data_sources entries exist (NASA Open Data, NASA API, Earthdata)
- [ ] At least 3 habitat_presets exist (orbital, moon, mars)
- [ ] At least 2 story records exist in fixtures
- [ ] Seed script successfully loads all fixtures
- [ ] Experiment CRUD endpoints return correct data
