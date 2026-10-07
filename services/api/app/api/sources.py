"""FastAPI router for NASA Source Registry endpoints (Task I.1 | PRD v1.1 §12, §21.8)."""

from uuid import UUID
from fastapi import APIRouter, Depends

from ..db.repository import Repository, get_repository
from ..errors import ErrorCode, IgnisException
from ..models.data_source import DataSourceRead

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get(
    "",
    response_model=list[DataSourceRead],
    summary="List all registered NASA data sources",
)
async def list_sources(
    repo: Repository = Depends(get_repository),
) -> list[DataSourceRead]:
    """Retrieves all registered multi-channel NASA data sources and provenance."""
    return repo.list_data_sources()


@router.get(
    "/{source_id}",
    response_model=DataSourceRead,
    summary="Get NASA data source details by ID",
)
async def get_source(
    source_id: UUID,
    repo: Repository = Depends(get_repository),
) -> DataSourceRead:
    """Retrieves a single NASA data source record by UUID."""
    source = repo.get_data_source(source_id)
    if not source:
        raise IgnisException(
            code=ErrorCode.SOURCE_NOT_FOUND,
            message=f"Data source with ID '{source_id}' not found.",
            status_code=404,
        )
    return source
