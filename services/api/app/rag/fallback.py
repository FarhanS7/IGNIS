"""Low-evidence fallback behavior for Ask IGNIS (Task D.5 | PRD v1.1 §19.4)."""

from ..models.enums import ConfidenceLevel, EvidenceLevel
from .models import AskResponse


FALLBACK_MESSAGE = (
    "IGNIS does not have enough comparable evidence in the current flight dataset "
    "to support a confident answer for this query. The NASA Physical Sciences Informatics (PSI) "
    "database currently loaded does not contain directly comparable flight runs for these specific conditions."
)


def create_insufficient_evidence_response(question: str) -> AskResponse:
    """Returns an honest fallback when available evidence is below confidence threshold."""
    return AskResponse(
        answer=FALLBACK_MESSAGE,
        grounded_sources=[],
        confidence=ConfidenceLevel.LOW,
        caveats=[
            "Zero matching flight records found with sufficient confidence.",
            "Consult primary NASA Technical Reports Server (NTRS) or Physical Sciences Informatics directly.",
        ],
        evidence_level=EvidenceLevel.E,
        model_used="ignis-evidence-guard-v1",
        synthesis_mode="insufficient_evidence",
        observed_facts=[],
        hypothetical_implications=[],
    )
