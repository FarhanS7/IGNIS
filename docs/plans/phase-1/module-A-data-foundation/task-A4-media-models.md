# Task A.4 — Implement Media Asset & CV Measurement Models

> **Module:** A — Data Foundation | **Branch:** `feat/a4-media-models`
> **Blocked by:** A.1 | **References:** PRD v1.1 §18.7, §18.8 | DECISIONS.md D-003, D-009

---

## Objective
Create Pydantic v2 models for `media_assets` and `cv_measurements` tables.

## File: `services/api/app/models/media.py`

### MediaAssetRead
- id, source_id (→ data_sources), experiment_id (→ experiments), run_id (→ experiment_runs), media_type (MediaType enum), source_url, local_or_cached_url, duration_seconds, metadata (dict)

### CVMeasurementRead
- id, media_asset_id (→ media_assets), timestamp_seconds, flame_area_px, flame_area_ratio, flame_height_px, centroid_x, centroid_y, confidence, model_version

## Subtasks
1. Create `media.py` with Base/Create/Read variants
2. Tests in `tests/test_media_models.py`
3. Commit: `feat(data): implement media asset and CV measurement models`

## Acceptance Criteria
- [ ] source_id references data_sources (v1.1)
- [ ] All measurement fields nullable (not every frame has every metric)
- [ ] model_version tracks CV pipeline version for reproducibility (PRD v1.1 §25.5)
