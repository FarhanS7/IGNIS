"""API tests for POST /api/v1/analyze endpoint (Task B2.8 | PRD v1.1 §21.4)."""

import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
async def test_analyze_orbital_solid_scenario():
    payload = {
        "scenario": {
            "destination": "orbital",
            "fuelType": "solid",
            "oxygenPct": 21.0,
            "pressureKpa": 101.3,
            "airflowCmS": 5.0,
            "objectives": ["flame_spread"],
        },
        "limit": 5,
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["datasetVersion"] == "2026.09.26"
    assert data["scoringVersion"] == "1.1"
    assert "behaviorProfile" in data
    assert "results" in data
    assert len(data["results"]) <= 5
    assert data["totalEvaluated"] > 0
    assert data["eligibleCount"] > 0

    top_result = data["results"][0]
    assert "runId" in top_result
    assert "experimentId" in top_result
    assert "evidenceSimilarity" in top_result
    assert "factors" in top_result
    assert top_result["evidenceSimilarity"] > 0.5


@pytest.mark.asyncio
async def test_analyze_lunar_scenario_gravity_capping():
    payload = {
        "scenario": {
            "destination": "moon",
            "material": "pmma",
            "oxygenPct": 32.0,
            "pressureKpa": 56.0,
        },
        "limit": 5,
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0

    # Lunar scenario matching microgravity runs must produce gravity warnings and capped confidence
    for item in data["results"]:
        assert item["confidence"] in ["medium", "low"]
        assert any("gravity" in w.lower() for w in item["warnings"])


@pytest.mark.asyncio
async def test_analyze_validation_error():
    payload = {
        "scenario": {
            "destination": "orbital",
        },
        "limit": 0,  # invalid limit (must be ge=1)
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/analyze", json=payload)

    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
