"""Pydantic models for habitat_presets (Task A.6).

Reference: PRD v1.1 §18.4, §10.1-10.3 | DECISIONS.md D-017.
Enforces destination presets with explicit gravity transfer disclaimers.
"""

from uuid import UUID
from pydantic import BaseModel, ConfigDict

from .enums import DestinationType, MaterialFamily


class HabitatPresetBase(BaseModel):
    """Base schema for destination scenarios with reference defaults."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

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


class HabitatPresetCreate(HabitatPresetBase):
    """Payload for registering a habitat preset."""
    pass


class HabitatPresetRead(HabitatPresetBase):
    """Schema for reading persisted habitat presets."""
    id: UUID
