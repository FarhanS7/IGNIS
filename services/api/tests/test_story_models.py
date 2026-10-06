"""Unit tests for Story and StorySection Pydantic models (Task A.7)."""

from uuid import uuid4
import pytest
from pydantic import ValidationError

from services.api.app.models.enums import MediaType, StoryType
from services.api.app.models.story import (
    StoryBase,
    StoryCreate,
    StoryRead,
    StorySection,
)


def test_story_section_minimal_instantiation():
    """StorySection requires order and content; other fields default to None or empty."""
    sec = StorySection(order=1, content="In zero gravity, buoyancy vanishes...")
    assert sec.order == 1
    assert sec.content == "In zero gravity, buoyancy vanishes..."
    assert sec.heading is None
    assert sec.media_url is None
    assert sec.source_links == []


def test_story_section_negative_order_fails():
    """StorySection order must be non-negative."""
    with pytest.raises(ValidationError):
        StorySection(order=-1, content="Invalid negative order")


def test_story_minimal_instantiation():
    """Story requires slug, title, and story_type."""
    story = StoryBase(
        slug="microgravity-fire",
        title="Why Does Fire Burn as a Sphere in Space?",
        story_type=StoryType.SCIENCE_EXPLAINER,
    )
    assert story.slug == "microgravity-fire"
    assert story.story_type == StoryType.SCIENCE_EXPLAINER
    assert story.source_ids == []
    assert story.experiment_ids == []
    assert story.published is False


def test_story_full_round_trip_with_sections_and_earthdata():
    """StoryRead serializes and deserializes with nested sections and Earthdata bridge context."""
    story_id = uuid4()
    source_id = uuid4()
    exp_id = uuid4()

    sec1 = StorySection(
        order=0,
        heading="Buoyancy Elimination",
        content="Without gravity, natural convection currents cannot form.",
        media_url="https://images.nasa.gov/details-iss040e089222.html",
        media_type=MediaType.IMAGE,
        animation_key="sphere-glow",
        evidence_card={
            "experiment": "FLEX-2",
            "observation": "Quenched blue spherical flame halo",
        },
        suggested_question="Why do microgravity flames form a sphere?",
        source_links=["NASA TM-2015-218820"],
    )

    story_read = StoryRead(
        id=story_id,
        slug="fire-from-space",
        title="Fire from Space vs Fire in Space",
        summary="Contrasting satellite wildfire remote sensing with spacecraft combustion.",
        story_type=StoryType.EARTHDATA_BRIDGE,
        source_ids=[source_id],
        experiment_ids=[exp_id],
        earthdata_context={
            "sensor": "MODIS/VIIRS",
            "resolution": "375m",
            "firms_product": "Thermal Anomalies",
        },
        sections=[sec1],
        published=True,
    )

    data = story_read.model_dump()
    assert data["id"] == story_id
    assert data["story_type"] == "earthdata_bridge"
    assert len(data["sections"]) == 1
    assert data["sections"][0]["animation_key"] == "sphere-glow"

    json_str = story_read.model_dump_json()
    reconstructed = StoryRead.model_validate_json(json_str)
    assert reconstructed.id == story_id
    assert reconstructed.earthdata_context["sensor"] == "MODIS/VIIRS"
    assert reconstructed.sections[0].heading == "Buoyancy Elimination"
