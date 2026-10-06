"""Pydantic schemas for Matching Engine analysis outputs (PRD v1.1 §15, §21.4)."""

from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from ..behavior.profile import BehaviorProfile
from ..eligibility.models import EligibilityResult, ScenarioInput
from ..models.enums import ConfidenceLevel, CoverageLevel
from ..models.experiment import ExperimentRead, ExperimentRunRead


class FactorExplanation(BaseModel):
    """Detailed breakdown of individual scoring dimensions."""
    model_config = ConfigDict(from_attributes=True)

    factor: str
    scenario_value: str | float | None = None
    experiment_value: str | float | None = None
    similarity_score: float | None = None
    active_weight: float | None = None


class EvidenceMatch(BaseModel):
    """An individual eligible experiment run ranked by scientific similarity."""
    model_config = ConfigDict(from_attributes=True)

    run: ExperimentRunRead
    experiment: ExperimentRead
    similarity_score: float = Field(ge=0.0, le=1.0)
    coverage_score: float = Field(ge=0.0, le=1.0)
    coverage_level: CoverageLevel
    confidence_level: ConfidenceLevel
    eligibility: EligibilityResult
    factor_explanations: list[FactorExplanation] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    """Top-level response payload for POST /api/v1/analyze (PRD v1.1 §21.4)."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    scenario: ScenarioInput
    matches: list[EvidenceMatch]
    behavior_profile: BehaviorProfile
    total_evaluated: int
    eligible_count: int
    excluded_count: int
