"""API tests for Guided Stories endpoints (Task H.6 | PRD v1.1 §11, §21.6)."""

import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
async def test_list_stories():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    slugs = {s["slug"] for s in data}
    assert "microgravity-fire" in slugs
    assert "fire-from-space" in slugs


@pytest.mark.asyncio
async def test_get_story_by_slug():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories/microgravity-fire")
    assert response.status_code == 200
    story = response.json()
    assert story["slug"] == "microgravity-fire"
    assert "Sphere" in story["title"]
    assert len(story["sections"]) >= 3
    first_section = story["sections"][0]
    assert first_section["order"] == 0
    assert "candle" in first_section["content"].lower()
    assert first_section["evidence_card"] is not None


@pytest.mark.asyncio
async def test_get_story_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories/non-existent-story-slug")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "STORY_NOT_FOUND"
