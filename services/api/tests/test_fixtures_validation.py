import json
from pathlib import Path
import pytest

from services.api.app.models.data_source import DataSourceRead
from services.api.app.models.experiment import ExperimentRead, ExperimentRunRead
from services.api.app.models.habitat_preset import HabitatPresetRead
from services.api.app.models.source import SourceDocumentRead, SourceChunkRead
from services.api.app.models.media import MediaAssetRead, CVMeasurementRead
from services.api.app.models.story import StoryRead

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "fixtures"


def load_fixture(filename: str):
    file_path = FIXTURES_DIR / filename
    assert file_path.exists(), f"Fixture file not found: {filename}"
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


class TestFixturesValidation:
    def test_data_sources_fixture(self):
        records = load_fixture("data_sources.json")
        assert len(records) >= 5
        models = [DataSourceRead.model_validate(r) for r in records]
        # Check earth_observation_context is present and does not participate in matching
        eo = next(m for m in models if m.source_role.value == "earth_observation_context")
        assert not eo.participates_in_matching

    def test_experiments_fixture(self):
        records = load_fixture("experiments.json")
        assert len(records) >= 10
        models = [ExperimentRead.model_validate(r) for r in records]
        assert len(models) == 10

    def test_experiment_runs_fixture(self):
        exp_records = load_fixture("experiments.json")
        exp_ids = {r["id"] for r in exp_records}

        records = load_fixture("experiment_runs.json")
        assert len(records) >= 30
        models = [ExperimentRunRead.model_validate(r) for r in records]
        # Foreign key integrity check
        for m in models:
            assert str(m.experiment_id) in exp_ids

    def test_habitat_presets_fixture(self):
        records = load_fixture("habitat_presets.json")
        assert len(records) >= 3
        models = [HabitatPresetRead.model_validate(r) for r in records]
        assert len(models) == 3

    def test_source_documents_fixture(self):
        source_records = load_fixture("data_sources.json")
        source_ids = {r["id"] for r in source_records}

        records = load_fixture("source_documents.json")
        assert len(records) >= 5
        models = [SourceDocumentRead.model_validate(r) for r in records]
        for m in models:
            if m.source_id:
                assert str(m.source_id) in source_ids

    def test_source_chunks_fixture(self):
        doc_records = load_fixture("source_documents.json")
        doc_ids = {r["id"] for r in doc_records}

        records = load_fixture("source_chunks.json")
        assert len(records) >= 10
        models = [SourceChunkRead.model_validate(r) for r in records]
        for m in models:
            assert str(m.document_id) in doc_ids
            assert len(m.embedding) == 768

    def test_media_assets_fixture(self):
        exp_records = load_fixture("experiments.json")
        exp_ids = {r["id"] for r in exp_records}

        records = load_fixture("media_assets.json")
        assert len(records) >= 3
        models = [MediaAssetRead.model_validate(r) for r in records]
        for m in models:
            assert str(m.experiment_id) in exp_ids

    def test_cv_measurements_fixture(self):
        media_records = load_fixture("media_assets.json")
        media_ids = {r["id"] for r in media_records}

        records = load_fixture("cv_measurements.json")
        assert len(records) >= 20
        models = [CVMeasurementRead.model_validate(r) for r in records]
        for m in models:
            assert str(m.media_asset_id) in media_ids

    def test_stories_fixture(self):
        records = load_fixture("stories.json")
        assert len(records) >= 2
        models = [StoryRead.model_validate(r) for r in records]
        assert len(models) == 2
