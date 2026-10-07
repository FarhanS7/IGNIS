"""API tests for NASA Sources endpoints (Task I.1 | PRD v1.1 §12, §21.8)."""

from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
async def test_list_data_sources():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    registries = {s["registry"] for s in data}
    assert "NASA_OPEN_DATA" in registries
    assert "NASA_EARTHDATA" in registries


@pytest.mark.asyncio
async def test_get_data_source_by_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/sources")
        assert list_res.status_code == 200
        first_id = list_res.json()[0]["id"]

        response = await ac.get(f"/api/v1/sources/{first_id}")
    assert response.status_code == 200
    source = response.json()
    assert source["id"] == first_id
    assert "provider_name" in source


@pytest.mark.asyncio
async def test_get_data_source_not_found():
    unknown_id = "00000000-0000-0000-0000-000000000000"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"/api/v1/sources/{unknown_id}")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "SOURCE_NOT_FOUND"
