# Task A.3 — Implement Source Document & Chunk Models

> **Module:** A — Data Foundation | **Branch:** `feat/a3-source-models`
> **Blocked by:** A.1 | **References:** PRD v1.1 §18.5, §18.6 | DECISIONS.md D-003

---

## Objective
Create Pydantic v2 models for `source_documents` and `source_chunks` tables.

## File: `services/api/app/models/source.py`

### SourceDocumentRead
- id, source_id (→ data_sources), experiment_id (→ experiments), title, document_type, source_url, citation_label, raw_text_location, checksum

### SourceChunkRead
- id, document_id (→ source_documents), experiment_id (→ experiments), chunk_index, content, embedding (vector — represented as list[float] in Pydantic), metadata (dict)

## Subtasks
1. Create `source.py` with Base/Create/Read variants
2. Tests in `tests/test_source_models.py`
3. Commit: `feat(data): implement source document and chunk models`

## Acceptance Criteria
- [ ] source_id references data_sources (v1.1)
- [ ] embedding field accepts list[float] of length 768
- [ ] metadata field is optional dict
