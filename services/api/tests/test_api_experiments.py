"""API tests for Experiment endpoints (Task A.11 | PRD v1.1 §21.2)."""

import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "x-request-id" in response.headers


@pytest.mark.asyncio
async def test_list_experiments_default():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/experiments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 10
    assert any(exp["experiment_family"] == "BASS" for exp in data)


@pytest.mark.asyncio
async def test_list_experiments_filtering():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Filter by gravity
        res_micro = await ac.get("/api/v1/experiments?gravity_environment=microgravity")
        assert res_micro.status_code == 200
        for exp in res_micro.json():
            assert exp["gravity_environment"] == "microgravity"

        # Filter by fuel_type
        res_fuel = await ac.get("/api/v1/experiments?fuel_type=polymer")
        assert res_fuel.status_code == 200
        assert len(res_fuel.json()) > 0

        # Pagination
        res_page = await ac.get("/api/v1/experiments?limit=2&offset=0")
        assert res_page.status_code == 200
        assert len(res_page.json()) == 2


@pytest.mark.asyncio
async def test_get_single_experiment_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/experiments")
        exp_id = list_res.json()[0]["id"]

        response = await ac.get(f"/api/v1/experiments/{exp_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == exp_id
    assert "experiment_family" in data


@pytest.mark.asyncio
async def test_get_single_experiment_not_found():
    random_id = "00000000-0000-0000-0000-000000000099"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"/api/v1/experiments/{random_id}")
    assert response.status_code == 404
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "EXPERIMENT_NOT_FOUND"


@pytest.mark.asyncio
async def test_get_experiment_runs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/experiments")
        bass_exp = next(e for e in list_res.json() if e["experiment_family"] == "BASS")
        bass_id = bass_exp["id"]

        response = await ac.get(f"/api/v1/experiments/{bass_id}/runs")
    assert response.status_code == 200
    runs = response.json()
    assert isinstance(runs, list)
    assert len(runs) > 0
    for run in runs:
        assert run["experiment_id"] == bass_id


@pytest.mark.asyncio
async def test_get_experiment_runs_not_found():
    random_id = "00000000-0000-0000-0000-000000000099"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"/api/v1/experiments/{random_id}/runs")
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "EXPERIMENT_NOT_FOUND"


@pytest.mark.asyncio
async def test_get_related_experiments():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        list_res = await ac.get("/api/v1/experiments")
        bass_exp = next(e for e in list_res.json() if e["experiment_family"] == "BASS")
        bass_id = bass_exp["id"]

        response = await ac.get(f"/api/v1/experiments/{bass_id}/related?limit=3")
    assert response.status_code == 200
    related = response.json()
    assert isinstance(related, list)
    assert len(related) <= 3
    # Target experiment must not be in related list
    assert not any(r["id"] == bass_id for r in related)
