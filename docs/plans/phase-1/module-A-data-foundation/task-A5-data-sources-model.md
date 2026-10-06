# Task A.5 — Implement Data Sources Registry Model (NEW v1.1)

> **Module:** A — Data Foundation | **Branch:** `feat/a5-data-sources-model`
> **Blocked by:** A.1 | **References:** PRD v1.1 §18.1, §12 | DECISIONS.md D-016

---

## Objective
Create Pydantic v2 model for the `data_sources` registry table. This is new in v1.1 — every ingested item must reference its source registry entry to enable provenance tracking and NASA channel proof.

## File: `services/api/app/models/data_source.py`

### DataSourceRead
```python
class DataSourceBase(BaseModel):
    registry: SourceRegistry          # NASA_OPEN_DATA, NASA_API, NASA_EARTHDATA, etc.
    source_role: SourceRole           # primary_scientific, contextual, earth_observation_context, etc.
    provider_name: str | None = None
    dataset_identifier: str | None = None
    api_name: str | None = None
    sensor_name: str | None = None
    source_url: str | None = None
    retrieved_at: datetime | None = None
    license_or_access: str | None = None
    provenance: dict | None = None

class DataSourceRead(DataSourceBase):
    id: UUID
```

## Key Design Rules (from PRD v1.1 §12)
- `source_role` determines whether this source can influence microgravity matching
- Only `primary_scientific` and `normalized_scientific` roles participate in evidence scoring
- `earth_observation_context` is explicitly excluded from matching (D-016, §12.3)
- Every experiment, source_document, and media_asset references a data_source

## Subtasks
1. Create `data_source.py` with Base/Create/Read
2. Tests verifying enum constraints
3. Commit: `feat(data): implement data sources registry model`

## Acceptance Criteria
- [ ] registry and source_role are required fields using enums from A.1
- [ ] Model supports all 5 suggested registry values and 6 source_role values from PRD
- [ ] Provenance field accepts freeform dict for flexible metadata
