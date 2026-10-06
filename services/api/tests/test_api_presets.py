"""API tests for Habitat Preset endpoints (Task A.11 | PRD v1.1 §10, §21.3)."""

import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
async def test_list_habitat_presets():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/habitat-presets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    slugs = {p["slug"] for p in data}
    assert "orbital" in slugs
    assert "moon" in slugs
    assert "mars" in slugs


@pytest.mark.asyncio
async def test_get_habitat_preset_by_slug():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/habitat-presets/orbital")
    assert response.status_code == 200
    preset = response.json()
    assert preset["slug"] == "orbital"
    assert preset["destination"] == "orbital"
    assert preset["gravity_value_g"] == 0.0
    assert preset["default_oxygen_pct"] == 21.0


@pytest.mark.asyncio
async def test_get_habitat_preset_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/habitat-presets/unknown-preset")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "PRESET_NOT_FOUND"
