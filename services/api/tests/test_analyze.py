"""Full end-to-end integration tests for POST /api/v1/analyze (Task B2.9 | PRD v1.1 §29 AT-01 through AT-05)."""

import json
import pytest
from httpx import ASGITransport, AsyncClient

from services.api.app.main import app


@pytest.mark.asyncio
class TestAnalyzeEndToEnd:
    async def test_at_01_strong_match_appears_near_top_with_reasons(self):
        """AT-01: Microgravity PMMA flight conditions should yield BASS / Saffire near the top
        with high evidence similarity and explicit factor explanations.
        """
        payload = {
            "scenario": {
                "destination": "orbital",
                "fuelType": "solid",
                "material": "pmma",
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
        assert len(data["results"]) > 0

        top = data["results"][0]
        # Strong match should score > 0.85
        assert top["evidenceSimilarity"] > 0.85
        assert top["experimentFamily"] in ["BASS", "Saffire", "SOFIE"]
        assert len(top["factors"]) > 0
        assert any(f["factor"] == "material_or_fuel" and f["similarity_score"] == 1.0 for f in top["factors"])

    async def test_at_02_incompatible_experiment_excluded_by_eligibility(self):
        """AT-02: Target scenario with cotton fabric tested against database containing droplet fuel (FLEX).
        Incompatible fuel phase runs must be excluded from results.
        """
        payload = {
            "scenario": {
                "destination": "orbital",
                "material": "fabric_cotton",
                "oxygenPct": 21.0,
                "pressureKpa": 101.3,
                "objectives": ["flame_spread"],
            },
            "limit": 20,
        }

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/analyze", json=payload)

        assert response.status_code == 200
        data = response.json()

        # Verify no droplet fuel experiments made it into eligible results
        for item in data["results"]:
            assert item["experimentFamily"] != "FLEX"

        assert data["excludedCount"] > 0

    async def test_at_03_moon_scenario_shows_gravity_mismatch_warning(self):
        """AT-03: Lunar habitat scenario tested against microgravity experiments.
        Must return gravity mismatch warnings and capped confidence.
        """
        payload = {
            "scenario": {
                "destination": "moon",
                "material": "pmma",
                "oxygenPct": 32.0,
                "pressureKpa": 56.0,
                "objectives": ["flame_spread"],
            },
            "limit": 5,
        }

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/analyze", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) > 0

        for item in data["results"]:
            assert item["confidence"] in ["medium", "low"]
            assert any("gravity" in w.lower() for w in item["warnings"])

    async def test_at_04_scenario_outside_dataset_shows_limited_evidence(self):
        """AT-04: Extreme environment outside dataset domain (e.g. 500 kPa pressure, 80% O2).
        Yields limited evidence similarity and lower scores.
        """
        payload = {
            "scenario": {
                "destination": "orbital",
                "material": "pmma",
                "oxygenPct": 80.0,
                "pressureKpa": 500.0,
                "objectives": ["flame_spread"],
            },
            "limit": 5,
        }

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/analyze", json=payload)

        assert response.status_code == 200
        data = response.json()
        if data["results"]:
            top = data["results"][0]
            # Dissimilar environmental values lower the similarity score
            assert top["evidenceSimilarity"] < 0.70

    async def test_at_05_no_safe_or_unsafe_language(self):
        """AT-05 (FR-FBP-005): System output must never claim that an environment or material is
        'safe', 'unsafe', or produce absolute risk safety verdicts.
        """
        payload = {
            "scenario": {
                "destination": "orbital",
                "material": "pmma",
                "oxygenPct": 21.0,
                "pressureKpa": 101.3,
            },
            "limit": 10,
        }

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/analyze", json=payload)

        assert response.status_code == 200
        raw_text = response.text.lower()
        # Ensure absence of definitive hazard claims
        assert "is safe" not in raw_text
        assert "is unsafe" not in raw_text
        assert "risk level" not in raw_text
        assert "safety score" not in raw_text

    async def test_deterministic_ranking(self):
        """Repeated identical requests must return bit-for-bit identical ranking and scores."""
        payload = {
            "scenario": {
                "destination": "orbital",
                "material": "pmma",
                "oxygenPct": 21.0,
                "pressureKpa": 101.3,
                "airflowCmS": 5.0,
            },
            "limit": 10,
        }

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res1 = await ac.post("/api/v1/analyze", json=payload)
            res2 = await ac.post("/api/v1/analyze", json=payload)

        assert res1.status_code == 200
        assert res2.status_code == 200
        data1 = res1.json()
        data2 = res2.json()

        assert data1["results"] == data2["results"]
        assert data1["behaviorProfile"] == data2["behaviorProfile"]

    async def test_missing_values_not_penalized_as_zero(self):
        """Missing parameters (e.g. airflow is None) are renormalized rather than scored as 0.0."""
        payload = {
            "scenario": {
                "destination": "orbital",
                "material": "pmma",
                "oxygenPct": 21.0,
                "pressureKpa": 101.3,
                "airflowCmS": None,  # omitted
            },
            "limit": 5,
        }

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/analyze", json=payload)

        assert response.status_code == 200
        data = response.json()
        top = data["results"][0]

        # Verify active factors renormalize to 1.0
        active_weights = [f["active_weight"] for f in top["factors"] if f["active_weight"] is not None]
        assert pytest.approx(sum(active_weights), 0.001) == 1.0
