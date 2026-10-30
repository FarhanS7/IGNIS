"""Pydantic v2 models for unified NASA flight combustion evidence runs.
Strict epistemic provenance: every numeric or boolean observation requires
value, unit, basis (measured | converted | assumed | missing), and source coordinates.
"""

from typing import Any, Generic, Literal, Optional, TypeVar, Union
from pydantic import BaseModel, Field

BasisType = Literal["measured", "converted", "assumed", "missing"]
FuelClass = Literal["solid", "droplet", "gas"]
GravityRegime = Literal["microgravity", "lunar", "martian", "terrestrial", "hypergravity"]
OutcomeClass = Literal["frames_recorded", "extinguished", "no_ignition", "unknown"]

T = TypeVar("T", bound=Optional[Union[float, int, bool, str]])


class EvidenceValue(BaseModel, Generic[T]):
    """An empirical observation with full epistemic provenance."""
    value: T = Field(..., description="Observed numeric value, boolean flag, or null if missing")
    unit: Optional[str] = Field(default=None, description="Physical unit of measure (e.g. kPa, %, cm/s)")
    basis: BasisType = Field(..., description="Epistemic basis: measured | converted | assumed | missing")
    source_file: str = Field(..., description="Relative path to data source file")
    source_column: str = Field(..., description="Source column header or nominal spec reference")
    source_row: int = Field(..., description="1-indexed line number in source file")


class EvidenceRun(BaseModel):
    """A standardized experimental run from real NASA microgravity combustion flight data."""
    run_uid: str = Field(..., description="Globally unique run identifier (e.g. PSI-25-RUN-001)")
    investigation_id: str = Field(..., description="NASA Physical Sciences Informatics investigation ID")
    platform: str = Field(..., description="Flight platform (e.g. ISS (MSG), ISS (CIR), Cygnus OA-5)")
    fuel_class: FuelClass = Field(..., description="Physical state of fuel: solid | droplet | gas")
    material: str = Field(..., description="Fuel chemical composition or material specification")
    gravity_regime: GravityRegime = Field(..., description="Verified gravitational regime")
    doi: str = Field(..., description="Dataset Digital Object Identifier")
    ntrs_ids: list[str] = Field(default_factory=list, description="NASA Technical Reports Server document IDs")
    
    # Explicit outcomes and usability
    frames_shot: Optional[int] = Field(default=None, description="Raw Nikon frames shot without unit conversion")
    outcome_class: OutcomeClass = Field(default="unknown", description="Categorical outcome: sustained | extinguished | no_ignition | unknown")
    outcome_source_column: str = Field(default="none", description="Raw column from which outcome was derived")
    usable_for_matching: bool = Field(default=False, description="True only if run has explicit outcome and >=2 measured env factors")
    unusable_reasons: list[str] = Field(default_factory=list, description="Reasons disqualifying run from matching")

    # 3 core atmospheric factors
    oxygen_pct: EvidenceValue[Optional[float]] = Field(..., description="Oxygen concentration in %")
    pressure_kpa: EvidenceValue[Optional[float]] = Field(..., description="Absolute pressure in kPa")
    flow_cm_s: EvidenceValue[Optional[float]] = Field(..., description="Oxidizer flow velocity in cm/s")
    
    # Core combustion outcomes
    ignited: EvidenceValue[Optional[bool]] = Field(..., description="Ignition success outcome")
    extinguished: EvidenceValue[Optional[bool]] = Field(..., description="Flame extinction outcome")
    spread_rate_mm_s: EvidenceValue[Optional[float]] = Field(..., description="Flame spread rate in mm/s")
    burn_time_s: EvidenceValue[Optional[float]] = Field(..., description="Combustion duration in seconds")
    
    # Secondary combustion products
    co_ppm: Optional[EvidenceValue[Optional[float]]] = Field(default=None, description="Carbon monoxide concentration in ppm")
    co2_pct: Optional[EvidenceValue[Optional[float]]] = Field(default=None, description="Carbon dioxide concentration in %")
    
    # Investigation specific metadata
    metadata: Optional[dict[str, Any]] = Field(default=None, description="Investigation-specific raw fields and annotations")
