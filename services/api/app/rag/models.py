"""Pydantic schemas for the Ask IGNIS RAG pipeline (Module D | PRD v1.1 §17.4, §19, §21.5)."""

from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from ..models.enums import ConfidenceLevel, EvidenceLevel


class GroundedSourceReference(BaseModel):
    """Citation linking an answer directly to empirical NASA flight telemetry or literature."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    experiment_id: str | None = None
    title: str
    doi: str | None = None
    evidence_level: EvidenceLevel = EvidenceLevel.A
    quote: str | None = None
    source_url: str | None = None


class AskRequest(BaseModel):
    """Payload for submitting a question to Ask IGNIS."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    question: str = Field(min_length=3, max_length=1000)
    scope: str = Field(default="global")  # "global", "scenario", "experiment", "story"
    experiment_id: UUID | None = None
    story_slug: str | None = None
    scenario_context: dict | None = None
    conversation_history: list[dict] = Field(default_factory=list)


class AskResponse(BaseModel):
    """Response contract for evidence-grounded Ask IGNIS answers."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    answer: str
    grounded_sources: list[GroundedSourceReference] = Field(default_factory=list)
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    caveats: list[str] = Field(default_factory=list)
    evidence_level: EvidenceLevel = EvidenceLevel.B
    model_used: str = "ignis-rag-grounded-v1"
    synthesis_mode: str = "empirical_grounded"  # "empirical_grounded" | "extrapolated" | "insufficient_evidence"
    observed_facts: list[str] = Field(default_factory=list)
    hypothetical_implications: list[str] = Field(default_factory=list)
