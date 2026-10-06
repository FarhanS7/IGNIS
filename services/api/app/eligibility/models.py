"""Pydantic models for the Comparable-Evidence Filter (Module B1 | PRD v1.1 §14)."""

from pydantic import BaseModel, ConfigDict, Field
from ..models.enums import (
    EligibilityStatus,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)


class EligibilityCheckResult(BaseModel):
    """Result of an individual eligibility gate check."""
    model_config = ConfigDict(from_attributes=True)

    status: EligibilityStatus
    reason: str | None = None
    warning: str | None = None
    exclusion_reason: str | None = None


class EligibilityResult(BaseModel):
    """Aggregated eligibility decision for a scenario + experiment pair (PRD v1.1 §14.4)."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    status: EligibilityStatus
    reasons: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    excluded_because: list[str] = Field(default_factory=list, alias="excludedBecause")


class ScenarioInput(BaseModel):
    """Scenario parameters provided by the user or preset for comparison."""
    model_config = ConfigDict(from_attributes=True)

    material: MaterialFamily
    objective: ScientificObjective = ScientificObjective.FLAME_SPREAD
    gravity_environment: GravityEnvironment = GravityEnvironment.MICROGRAVITY
    oxygen_pct: float | None = 21.0
    pressure_kpa: float | None = 101.3
    airflow_cm_s: float | None = 5.0

