# Task A.2 — Implement Experiment & Run Pydantic Models

> **Module:** A — Data Foundation | **Branch:** `feat/a2-experiment-models`
> **Blocked by:** A.1 | **References:** PRD v1.1 §18.2, §18.3 | DECISIONS.md D-003, D-004

---

## Objective

Create Pydantic v2 models for `experiments` and `experiment_runs` tables matching PRD v1.1 §18.2-18.3 schema exactly.

## File to Create

`services/api/app/models/experiment.py`

## Models

### ExperimentBase / ExperimentCreate / ExperimentRead
```python
class ExperimentBase(BaseModel):
    external_id: str | None = None
    source_id: UUID | None = None  # references data_sources (NEW v1.1)
    experiment_family: str
    title: str
    summary: str | None = None
    mission_platform: str | None = None
    gravity_environment: GravityEnvironment | None = None
    objectives: list[ScientificObjective] = []
    source_url: str | None = None

class ExperimentRead(ExperimentBase):
    id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None
```

### ExperimentRunBase / ExperimentRunRead
```python
class ExperimentRunBase(BaseModel):
    experiment_id: UUID
    run_label: str | None = None
    fuel_type: FuelType | None = None
    material: MaterialFamily | None = None
    geometry: str | None = None
    gravity_environment: GravityEnvironment | None = None
    oxygen_pct: float | None = None
    pressure_kpa: float | None = None
    airflow_cm_s: float | None = None
    ignition_observed: bool | None = None
    extinction_observed: bool | None = None
    flame_spread_observed: bool | None = None
    observation_summary: str | None = None
    source_url: str | None = None
    data_quality: DataQuality | None = None
    provenance: dict | None = None  # PRD v1.1 §18.10 provenance object
```

## Subtasks

1. Create `experiment.py` with all models above
2. Add model_config for JSON schema compliance
3. Write tests in `services/api/tests/test_experiment_models.py`
4. Commit: `feat(data): implement experiment and run Pydantic models`

## Acceptance Criteria
- [ ] All nullable fields default to None (P5: unknown stays unknown)
- [ ] Enum fields use the enums from A.1
- [ ] source_id references data_sources (v1.1 change)
- [ ] provenance field accepts PRD v1.1 §18.10 structure
- [ ] Tests verify serialization/deserialization round-trip
