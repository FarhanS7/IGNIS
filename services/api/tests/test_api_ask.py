"""API tests for Ask IGNIS Q&A RAG endpoints (Task D.6 | PRD v1.1 §17.4, §19, §21.5)."""

import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
async def test_ask_ignis_spherical_flame_query():
    payload = {
        "question": "Why does fire burn as a sphere in space without buoyancy?",
        "scope": "global",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "spherical" in data["answer"].lower() or "diffusion" in data["answer"].lower()
    assert len(data["grounded_sources"]) > 0
    assert len(data["observed_facts"]) > 0
    assert data["confidence"] in ["high", "medium"]
    assert data["evidence_level"] in ["A", "B"]


@pytest.mark.asyncio
async def test_ask_ignis_ventilation_query():
    payload = {
        "question": "How does ventilation airflow affect flame survival in a spacecraft?",
        "scope": "scenario",
        "scenario_context": {
            "gravity_environment": "microgravity",
            "oxygen_pct": 21.0,
            "pressure_kpa": 101.3,
            "airflow_cm_s": 5.0,
            "material": "pmma",
        },
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "airflow" in data["answer"].lower() or "saffire" in data["answer"].lower()
    assert any("Saffire" in src["title"] for src in data["grounded_sources"])


@pytest.mark.asyncio
async def test_ask_ignis_droplet_combustion_query():
    payload = {
        "question": "What happens during droplet combustion in FLEX-2 cool flame tests?",
        "scope": "experiment",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "droplet" in data["answer"].lower() or "flex" in data["answer"].lower()
    assert any("FLEX" in src["title"] for src in data["grounded_sources"])


@pytest.mark.asyncio
async def test_ask_ignis_insufficient_evidence_fallback():
    payload = {
        "question": "What is the capital of Australia?",
        "scope": "global",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["synthesis_mode"] == "insufficient_evidence"
    assert "not have enough comparable evidence" in data["answer"]
    assert data["confidence"] == "low"
