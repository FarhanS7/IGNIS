# Task A.6 — Implement Habitat Presets Model (NEW v1.1)

> **Module:** A — Data Foundation | **Branch:** `feat/a6-habitat-presets-model`
> **Blocked by:** A.1, A.2 | **References:** PRD v1.1 §18.4, §10.1-10.3 | DECISIONS.md D-017

---

## Objective
Create Pydantic v2 model for `habitat_presets`. Presets define destination scenarios (Orbital, Moon, Mars) with default habitat parameters.

## File: `services/api/app/models/habitat_preset.py`

### HabitatPresetRead
```python
class HabitatPresetBase(BaseModel):
    slug: str                              # e.g. "orbital", "moon", "mars"
    display_name: str
    destination: DestinationType
    gravity_class: str | None = None       # e.g. "microgravity", "partial_lunar"
    gravity_value_g: float | None = None   # e.g. 0.0, 0.16, 0.38
    external_environment_summary: str | None = None
    default_oxygen_pct: float | None = None
    default_pressure_kpa: float | None = None
    default_airflow_cm_s: float | None = None
    default_material: MaterialFamily | None = None
    disclaimer: str | None = None          # "Reference scenario defaults, not universal mission values"
    provenance: dict | None = None

class HabitatPresetRead(HabitatPresetBase):
    id: UUID
```

## Key Rules (PRD v1.1 §10.3)
- Presets are labeled "reference scenario defaults" — NOT claims about real missions
- Orbital/deep-space is the canonical demo preset
- Moon/Mars presets must carry gravity-transfer limitation disclaimers

## Subtasks
1. Create `habitat_preset.py`
2. Tests verifying default values and disclaimer requirements
3. Commit: `feat(data): implement habitat presets model`
