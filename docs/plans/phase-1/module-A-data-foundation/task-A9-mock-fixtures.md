# Task A.9 — Build Mock Data Fixtures

> **Module:** A — Data Foundation | **Branch:** `feat/a9-mock-fixtures`
> **Blocked by:** A.2, A.5, A.6, A.7, A.8 | **References:** PRD v1.1 §28, §18 | DECISIONS.md D-008

---

## Objective
Create JSON fixture files with mock data for all 10 tables. These are the foundation for all development and testing.

## Files: `data/fixtures/`
- `data_sources.json` — 5+ entries (NASA Open Data, NASA API, Earthdata, NASA PSI, derived)
- `experiments.json` — 10+ experiments (Saffire, FLEX, BASS, etc.)
- `experiment_runs.json` — 30+ runs across experiments
- `habitat_presets.json` — 3 presets (orbital, moon, mars)
- `source_documents.json` — 5+ documents
- `source_chunks.json` — 10+ chunks (embeddings can be placeholder arrays)
- `media_assets.json` — 3+ assets (at least one real NASA video URL)
- `cv_measurements.json` — sample time-series data
- `stories.json` — 2 stories (microgravity fire explainer + Fire from Space)

## Requirements
- All records follow exact Pydantic model shapes from A.2–A.7
- UUIDs are stable and cross-referenced correctly
- At least one experiment has `source_id` pointing to a NASA_OPEN_DATA source
- At least one media asset has `source_id` pointing to a NASA_API source
- At least one story has Earthdata context
- Provenance objects follow PRD v1.1 §18.10 format
- experiment_runs cover a range of oxygen (15-30%), pressure (50-101 kPa), airflow (0-25 cm/s), materials, and objectives

## Subtasks
1. Create `data/fixtures/` directory
2. Create each JSON file with correctly cross-referenced UUIDs
3. Validate all fixtures against Pydantic models programmatically
4. Commit: `feat(data): build mock data fixtures for all v1.1 tables`

## Acceptance Criteria
- [ ] 30+ experiment_run records with varied conditions
- [ ] All FKs reference valid IDs within fixture set
- [ ] 3 NASA source registries represented
- [ ] 3 habitat presets with destination-specific disclaimers
- [ ] 2 story fixtures with section arrays
