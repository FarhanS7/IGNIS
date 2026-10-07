"""Unit tests for the seed script (Task A.10)."""

import json
from pathlib import Path
import pytest
import httpx

from services.api.scripts.seed import (
    load_fixtures,
    validate_foreign_keys,
    run_seed,
    upsert_table_records,
    DEFAULT_FIXTURES_DIR,
)


class TestSeedScript:
    def test_load_fixtures(self):
        fixtures = load_fixtures(DEFAULT_FIXTURES_DIR)
        assert len(fixtures) == 9
        assert "data_sources" in fixtures
        assert "experiments" in fixtures
        assert "experiment_runs" in fixtures
        assert len(fixtures["experiments"]) == 10
        assert len(fixtures["experiment_runs"]) == 32

    def test_validate_foreign_keys_success(self):
        fixtures = load_fixtures(DEFAULT_FIXTURES_DIR)
        assert validate_foreign_keys(fixtures) is True

    def test_validate_foreign_keys_catches_invalid_run_fk(self):
        fixtures = load_fixtures(DEFAULT_FIXTURES_DIR)
        # Deep copy runs
        broken_fixtures = {k: list(v) for k, v in fixtures.items()}
        broken_fixtures["experiment_runs"] = [
            {"id": "00000000-0000-0000-0000-000000000001", "experiment_id": "99999999-9999-9999-9999-999999999999"}
        ]
        assert validate_foreign_keys(broken_fixtures) is False

    def test_run_seed_dry_run(self):
        summary = run_seed(dry_run=True, fixtures_dir=DEFAULT_FIXTURES_DIR)
        assert summary["experiments"] == 10
        assert summary["experiment_runs"] == 32
        assert summary["data_sources"] == 5

    def test_run_seed_requires_credentials_when_not_dry_run(self, monkeypatch):
        monkeypatch.delenv("SUPABASE_URL", raising=False)
        monkeypatch.delenv("SUPABASE_KEY", raising=False)
        monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)

        with pytest.raises(ValueError, match="Supabase credentials missing"):
            run_seed(dry_run=False, fixtures_dir=DEFAULT_FIXTURES_DIR)

    def test_upsert_table_records_mock_client(self):
        # Create a mock transport
        def handler(request: httpx.Request) -> httpx.Response:
            assert request.method == "POST"
            assert "rest/v1/test_table" in str(request.url)
            assert request.headers["apikey"] == "test-key"
            assert request.headers["Prefer"] == "resolution=merge-duplicates,return=representation"
            data = json.loads(request.content)
            return httpx.Response(201, json=data)

        transport = httpx.MockTransport(handler)
        client = httpx.Client(transport=transport)

        test_records = [{"id": "1", "name": "Item 1"}, {"id": "2", "name": "Item 2"}]
        inserted = upsert_table_records(
            table_name="test_table",
            records=test_records,
            supabase_url="https://mock.supabase.co",
            supabase_key="test-key",
            client=client,
        )
        assert inserted == 2
