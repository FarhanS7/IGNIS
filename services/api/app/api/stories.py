"""FastAPI router for Guided Fire Stories endpoints (Task H.6 | PRD v1.1 §11, §21.6)."""

from fastapi import APIRouter, Depends

from ..db.repository import Repository, get_repository
from ..errors import ErrorCode, IgnisException
from ..models.story import StoryRead

router = APIRouter(prefix="/stories", tags=["stories"])


@router.get(
    "",
    response_model=list[StoryRead],
    summary="List all published fire stories",
)
async def list_stories(
    repo: Repository = Depends(get_repository),
) -> list[StoryRead]:
    """Retrieves all published guided stories (e.g. Microgravity Fire, Fire from Space)."""
    return repo.list_stories(published_only=True)


@router.get(
    "/{slug}",
    response_model=StoryRead,
    summary="Get story narrative and sections by slug",
)
async def get_story(
    slug: str,
    repo: Repository = Depends(get_repository),
) -> StoryRead:
    """Retrieves a single story with all narrative beats, animations, and evidence cards."""
    story = repo.get_story_by_slug(slug)
    if not story:
        raise IgnisException(
            code=ErrorCode.STORY_NOT_FOUND,
            message=f"Story with slug '{slug}' not found.",
            status_code=404,
        )
    return story
