"""Pydantic models for experiments and experiment_runs (Task A.2).

Reference: PRD v1.1 §18.2, §18.3 | DECISIONS.md D-003, D-004.
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from .enums import (
    DataQuality,
    FuelType,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)


class ExperimentBase(BaseModel):
    """Base schema for experiment metadata."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    external_id: str | None = None
    source_id: UUID | None = None  # references data_sources (NEW v1.1)
    experiment_family: str
    title: str
    summary: str | None = None
    mission_platform: str | None = None
    gravity_environment: GravityEnvironment | None = None
    objectives: list[ScientificObjective] = Field(default_factory=list)
    source_url: str | None = None


class ExperimentCreate(ExperimentBase):
    """Payload for creating a new experiment record."""
    pass


class ExperimentRead(ExperimentBase):
    """Schema for reading persisted experiment records."""
    id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ExperimentRunBase(BaseModel):
    """Base schema for an individual combustion test run within an experiment."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

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


class ExperimentRunCreate(ExperimentRunBase):
    """Payload for creating a new experiment test run."""
    pass


class ExperimentRunRead(ExperimentRunBase):
    """Schema for reading persisted experiment test runs."""
    id: UUID
    created_at: datetime | None = None
