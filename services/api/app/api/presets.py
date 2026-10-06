"""FastAPI router for Habitat Presets endpoints (Task A.11 | PRD v1.1 §10, §21.3)."""

from fastapi import APIRouter, Depends

from ..db.repository import Repository, get_repository
from ..errors import ErrorCode, IgnisException
from ..models.habitat_preset import HabitatPresetRead

router = APIRouter(prefix="/habitat-presets", tags=["habitat-presets"])


@router.get(
    "",
    response_model=list[HabitatPresetRead],
    summary="List all canonical habitat presets",
)
async def list_habitat_presets(
    repo: Repository = Depends(get_repository),
) -> list[HabitatPresetRead]:
    """Retrieves all habitat presets (e.g. ISS Destiny, Gateway HALO, Lunar Surface Habitat)."""
    return repo.list_habitat_presets()


@router.get(
    "/{slug}",
    response_model=HabitatPresetRead,
    summary="Get habitat preset details by slug",
)
async def get_habitat_preset(
    slug: str,
    repo: Repository = Depends(get_repository),
) -> HabitatPresetRead:
    """Retrieves a single habitat preset by its unique slug identifier."""
    preset = repo.get_habitat_preset_by_slug(slug)
    if not preset:
        raise IgnisException(
            code=ErrorCode.PRESET_NOT_FOUND,
            message=f"Habitat preset with slug '{slug}' not found.",
            status_code=404,
        )
    return preset
