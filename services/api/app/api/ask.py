"""FastAPI router for Ask IGNIS Q&A RAG endpoints (Task D.6 | PRD v1.1 §17.4, §19, §21.5)."""

from fastapi import APIRouter, Depends

from ..db.repository import Repository, get_repository
from ..rag.models import AskRequest, AskResponse
from ..rag.pipeline import RagPipeline

router = APIRouter(prefix="/ask", tags=["ask"])


@router.post(
    "",
    response_model=AskResponse,
    summary="Submit a scientific inquiry to Ask IGNIS",
)
async def ask_ignis(
    request: AskRequest,
    repo: Repository = Depends(get_repository),
) -> AskResponse:
    """Processes a user inquiry against NASA Physical Sciences Informatics literature.
    Returns an evidence-grounded synthesis with verifiable citations and strict separation
    between observed telemetry and hypothetical extrapolations.
    """
    pipeline = RagPipeline(repo=repo)
    return pipeline.execute(request)
