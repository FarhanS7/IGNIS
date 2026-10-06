"""FastAPI router for POST /api/v1/analyze endpoint (Task B2.8 | PRD v1.1 §15, §21.4)."""

from uuid import UUID
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict, Field

from ..behavior.profile import BehaviorProfile
from ..db.repository import Repository, get_repository
from ..eligibility.models import ScenarioInput
from ..matching.models import FactorExplanation
from ..matching.orchestrator import run_scenario_analysis
from ..models.enums import (
    ConfidenceLevel,
    DestinationType,
    EligibilityStatus,
    FuelType,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)

router = APIRouter(prefix="/analyze", tags=["matching"])

DESTINATION_GRAVITY_MAP: dict[DestinationType, GravityEnvironment] = {
    DestinationType.ORBITAL: GravityEnvironment.MICROGRAVITY,
    DestinationType.MOON: GravityEnvironment.PARTIAL_GRAVITY_LUNAR,
    DestinationType.MARS: GravityEnvironment.PARTIAL_GRAVITY_MARS,
    DestinationType.CUSTOM: GravityEnvironment.VARIABLE,
}

FUEL_TO_DEFAULT_MATERIAL: dict[FuelType, MaterialFamily] = {
    FuelType.SOLID: MaterialFamily.PMMA,
    FuelType.POLYMER: MaterialFamily.PMMA,
    FuelType.FABRIC: MaterialFamily.FABRIC_COTTON,
    FuelType.COMPOSITE: MaterialFamily.COMPOSITE,
    FuelType.LIQUID: MaterialFamily.DROPLET_FUEL,
    FuelType.GAS: MaterialFamily.GAS_FUEL,
    FuelType.UNKNOWN: MaterialFamily.PMMA,
}


class ScenarioRequest(BaseModel):
    """User-specified combustion scenario payload."""
    model_config = ConfigDict(populate_by_name=True)

    destination: DestinationType | None = None
    gravity_environment: GravityEnvironment | None = Field(default=None, alias="gravityEnvironment")
    material: MaterialFamily | None = None
    fuel_type: FuelType | None = Field(default=None, alias="fuelType")
    oxygen_pct: float | None = Field(default=21.0, alias="oxygenPct")
    pressure_kpa: float | None = Field(default=101.3, alias="pressureKpa")
    airflow_cm_s: float | None = Field(default=5.0, alias="airflowCmS")
    objectives: list[ScientificObjective] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    """Payload for initiating scenario matching and behavior profile generation."""
    model_config = ConfigDict(populate_by_name=True)

    scenario: ScenarioRequest
    limit: int = Field(default=10, ge=1, le=50)


class AnalyzeResultItem(BaseModel):
    """Ranked evidence record matching the target scenario."""
    model_config = ConfigDict(populate_by_name=True)

    run_id: UUID = Field(alias="runId")
    experiment_id: UUID = Field(alias="experimentId")
    experiment_family: str = Field(alias="experimentFamily")
    title: str
    eligibility: EligibilityStatus
    eligibility_warnings: list[str] = Field(default_factory=list, alias="eligibilityWarnings")
    evidence_similarity: float = Field(alias="evidenceSimilarity")
    coverage: float
    confidence: ConfidenceLevel
    factors: list[FactorExplanation]
    warnings: list[str] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    """Top-level response payload for POST /api/v1/analyze."""
    model_config = ConfigDict(populate_by_name=True)

    dataset_version: str = Field(default="2026.09.26", alias="datasetVersion")
    scoring_version: str = Field(default="1.1", alias="scoringVersion")
    behavior_profile: BehaviorProfile = Field(alias="behaviorProfile")
    results: list[AnalyzeResultItem]
    total_evaluated: int = Field(alias="totalEvaluated")
    eligible_count: int = Field(alias="eligibleCount")
    excluded_count: int = Field(alias="excludedCount")


@router.post(
    "",
    response_model=AnalyzeResponse,
    response_model_by_alias=True,
    summary="Analyze scenario against microgravity combustion evidence",
)
async def analyze_scenario(
    payload: AnalyzeRequest,
    repo: Repository = Depends(get_repository),
) -> AnalyzeResponse:
    """Evaluates scenario against NASA experiments via Comparable-Evidence Filter,

    weighted similarity scoring, and Fire Behavior Profile synthesis.
    """
    req_scenario = payload.scenario

    # Resolve gravity environment from destination or direct gravity
    if req_scenario.gravity_environment is not None:
        gravity = req_scenario.gravity_environment
    elif req_scenario.destination is not None:
        gravity = DESTINATION_GRAVITY_MAP.get(req_scenario.destination, GravityEnvironment.MICROGRAVITY)
    else:
        gravity = GravityEnvironment.MICROGRAVITY

    # Resolve material family
    if req_scenario.material is not None:
        material = req_scenario.material
    elif req_scenario.fuel_type is not None:
        material = FUEL_TO_DEFAULT_MATERIAL.get(req_scenario.fuel_type, MaterialFamily.PMMA)
    else:
        material = MaterialFamily.PMMA

    # Resolve objective
    objective = req_scenario.objectives[0] if req_scenario.objectives else ScientificObjective.FLAME_SPREAD

    scenario_input = ScenarioInput(
        material=material,
        objective=objective,
        gravity_environment=gravity,
        oxygen_pct=req_scenario.oxygen_pct,
        pressure_kpa=req_scenario.pressure_kpa,
        airflow_cm_s=req_scenario.airflow_cm_s,
    )

    analysis = run_scenario_analysis(scenario_input, repo=repo)

    limited_matches = analysis.matches[: payload.limit]
    formatted_results = [
        AnalyzeResultItem(
            run_id=m.run.id,
            experiment_id=m.experiment.id,
            experiment_family=m.experiment.experiment_family,
            title=m.experiment.title,
            eligibility=m.eligibility.status,
            eligibility_warnings=m.eligibility.warnings,
            evidence_similarity=m.similarity_score,
            coverage=m.coverage_score,
            confidence=m.confidence_level,
            factors=m.factor_explanations,
            warnings=m.eligibility.warnings,
        )
        for m in limited_matches
    ]

    return AnalyzeResponse(
        dataset_version="2026.09.26",
        scoring_version="1.1",
        behavior_profile=analysis.behavior_profile,
        results=formatted_results,
        total_evaluated=analysis.total_evaluated,
        eligible_count=analysis.eligible_count,
        excluded_count=analysis.excluded_count,
    )
