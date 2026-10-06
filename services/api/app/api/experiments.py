"""FastAPI router for Experiment CRUD endpoints (Task A.11 | PRD v1.1 §21.2)."""

from uuid import UUID
from fastapi import APIRouter, Depends, Query

from ..db.repository import Repository, get_repository
from ..errors import ErrorCode, IgnisException
from ..models.enums import FuelType, GravityEnvironment, MaterialFamily
from ..models.experiment import ExperimentRead, ExperimentRunRead

router = APIRouter(prefix="/experiments", tags=["experiments"])


@router.get(
    "",
    response_model=list[ExperimentRead],
    summary="List all experiments with optional filters",
)
async def list_experiments(
    gravity_environment: GravityEnvironment | None = Query(None, description="Filter by gravity environment"),
    fuel_type: FuelType | None = Query(None, description="Filter by fuel type"),
    material_family: MaterialFamily | None = Query(None, description="Filter by material family"),
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    repo: Repository = Depends(get_repository),
) -> list[ExperimentRead]:
    """Retrieves a list of microgravity combustion experiments."""
    return repo.list_experiments(
        gravity_environment=gravity_environment,
        fuel_type=fuel_type,
        material_family=material_family,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{experiment_id}",
    response_model=ExperimentRead,
    summary="Get single experiment details by ID",
)
async def get_experiment(
    experiment_id: UUID,
    repo: Repository = Depends(get_repository),
) -> ExperimentRead:
    """Retrieves metadata and parameters for a single experiment."""
    exp = repo.get_experiment(experiment_id)
    if not exp:
        raise IgnisException(
            code=ErrorCode.EXPERIMENT_NOT_FOUND,
            message=f"Experiment with ID '{experiment_id}' not found.",
            status_code=404,
        )
    return exp


@router.get(
    "/{experiment_id}/runs",
    response_model=list[ExperimentRunRead],
    summary="Get all test runs for an experiment",
)
async def get_experiment_runs(
    experiment_id: UUID,
    repo: Repository = Depends(get_repository),
) -> list[ExperimentRunRead]:
    """Retrieves all experimental test runs associated with the specified experiment."""
    exp = repo.get_experiment(experiment_id)
    if not exp:
        raise IgnisException(
            code=ErrorCode.EXPERIMENT_NOT_FOUND,
            message=f"Experiment with ID '{experiment_id}' not found.",
            status_code=404,
        )
    return repo.list_experiment_runs(experiment_id)


@router.get(
    "/{experiment_id}/related",
    response_model=list[ExperimentRead],
    summary="Get related experiments based on fuel, material, and gravity",
)
async def get_related_experiments(
    experiment_id: UUID,
    limit: int = Query(5, ge=1, le=20, description="Max related experiments to return"),
    repo: Repository = Depends(get_repository),
) -> list[ExperimentRead]:
    """Finds related experiments sharing fuel type, material family, or gravity."""
    exp = repo.get_experiment(experiment_id)
    if not exp:
        raise IgnisException(
            code=ErrorCode.EXPERIMENT_NOT_FOUND,
            message=f"Experiment with ID '{experiment_id}' not found.",
            status_code=404,
        )
    return repo.get_related_experiments(experiment_id, limit=limit)
