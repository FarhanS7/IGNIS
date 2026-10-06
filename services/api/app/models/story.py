"""Pydantic models for stories and story sections (Task A.7).

Reference: PRD v1.1 §18.9, §11 | DECISIONS.md D-015.
Enforces guided fire science stories with structured sections and evidence cards.
"""

from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from .enums import MediaType, StoryType


class StorySection(BaseModel):
    """Schema for an individual narrative beat/section within a story."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    order: int = Field(ge=0)
    heading: str | None = None
    content: str                       # 20-60 second reading segments
    media_url: str | None = None       # NASA image/video
    media_type: MediaType | None = None
    animation_key: str | None = None   # CSS/Framer Motion animation identifier
    evidence_card: dict | None = None  # Linked experiment evidence
    suggested_question: str | None = None  # Ask IGNIS prompt
    source_links: list[str] = Field(default_factory=list)


class StoryBase(BaseModel):
    """Base schema for guided fire stories."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    slug: str                          # e.g. "microgravity-fire", "fire-from-space"
    title: str
    summary: str | None = None
    story_type: StoryType              # science_explainer, earthdata_bridge, etc.
    source_ids: list[UUID] = Field(default_factory=list)        # references data_sources
    experiment_ids: list[UUID] = Field(default_factory=list)    # references experiments
    earthdata_context: dict | None = None  # Earthdata-specific metadata for bridge stories
    sections: list[StorySection] = Field(default_factory=list)  # Ordered story sections
    published: bool = False


class StoryCreate(StoryBase):
    """Payload for creating a new story."""
    pass


class StoryRead(StoryBase):
    """Schema for reading persisted stories."""
    id: UUID
