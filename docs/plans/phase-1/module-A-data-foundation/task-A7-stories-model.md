# Task A.7 — Implement Stories Data Model (NEW v1.1)

> **Module:** A — Data Foundation | **Branch:** `feat/a7-stories-model`
> **Blocked by:** A.1, A.5 | **References:** PRD v1.1 §18.9, §11 | DECISIONS.md D-015

---

## Objective
Create Pydantic v2 model for the `stories` table. Stories are guided narratives for the Explore Fire module.

## File: `services/api/app/models/story.py`

### StoryRead
```python
class StoryBase(BaseModel):
    slug: str                          # e.g. "microgravity-fire", "fire-from-space"
    title: str
    summary: str | None = None
    story_type: StoryType              # science_explainer, earthdata_bridge, etc.
    source_ids: list[UUID] = []        # references data_sources
    experiment_ids: list[UUID] = []    # references experiments
    earthdata_context: dict | None = None  # Earthdata-specific metadata for bridge stories
    sections: list[dict] = []          # Ordered story sections (see below)
    published: bool = False

class StoryRead(StoryBase):
    id: UUID
```

### Story Section Structure (within `sections` JSONB)
```python
class StorySection(BaseModel):
    order: int
    heading: str | None = None
    content: str                       # 20-60 second reading segments
    media_url: str | None = None       # NASA image/video
    media_type: MediaType | None = None
    animation_key: str | None = None   # CSS/Framer Motion animation identifier
    evidence_card: dict | None = None  # Linked experiment evidence
    suggested_question: str | None = None  # Ask IGNIS prompt
    source_links: list[str] = []
```

## Subtasks
1. Create `story.py` with models
2. Create `StorySection` schema for sections JSONB validation
3. Tests verifying section ordering and required fields
4. Commit: `feat(data): implement stories data model`
