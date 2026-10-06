# Task A.8 — Create Supabase Schema Migration SQL

> **Module:** A — Data Foundation | **Branch:** `feat/a8-schema-migration`
> **Blocked by:** A.2–A.7 | **References:** PRD v1.1 §18 (all tables) | DECISIONS.md D-004

---

## Objective
Create the SQL migration file that creates all 10 tables in Supabase PostgreSQL with pgvector extension.

## File: `services/api/migrations/001_initial_schema.sql`

## Tables (10 total — v1.0 had 6)

1. **data_sources** (NEW v1.1) — NASA source registry
2. **experiments** — experiment metadata
3. **experiment_runs** — individual runs with conditions/observations
4. **habitat_presets** (NEW v1.1) — destination scenario defaults
5. **source_documents** — linked publications/records
6. **source_chunks** — text chunks with embeddings (pgvector)
7. **media_assets** — video/image references
8. **cv_measurements** — CV-derived time series
9. **stories** (NEW v1.1) — guided fire stories

Plus: enable pgvector extension at top of migration.

## Key Schema Details
- All IDs are `uuid DEFAULT gen_random_uuid()`
- `source_chunks.embedding` is `vector(768)` (text-embedding-004)
- Foreign keys: experiments.source_id → data_sources, source_documents.source_id → data_sources, media_assets.source_id → data_sources
- `habitat_presets.slug` and `stories.slug` have UNIQUE constraints
- Indexes: `source_chunks_embedding_idx` using ivfflat or hnsw, `experiments_family_idx`, `experiment_runs_experiment_id_idx`
- All `provenance` columns are `jsonb`

## Subtasks
1. Create migrations directory
2. Write `001_initial_schema.sql` with all 10 tables
3. Add indexes and constraints
4. Test by running against a fresh Supabase instance or local PostgreSQL
5. Commit: `feat(data): create Supabase schema migration for v1.1 (10 tables)`

## Acceptance Criteria
- [ ] pgvector extension enabled
- [ ] All 10 tables created with correct types and FKs
- [ ] slug columns have UNIQUE constraints
- [ ] embedding column is vector(768)
- [ ] Migration is idempotent (uses IF NOT EXISTS where possible)
