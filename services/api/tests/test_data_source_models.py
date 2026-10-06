"""Unit tests for DataSource registry Pydantic models (Task A.5)."""

from datetime import datetime, timezone
from uuid import uuid4
import pytest
from pydantic import ValidationError

from services.api.app.models.enums import SourceRegistry, SourceRole
from services.api.app.models.data_source import (
    DataSourceBase,
    DataSourceCreate,
    DataSourceRead,
)


def test_data_source_minimal_instantiation():
    """DataSource requires registry and source_role; others default to None."""
    ds = DataSourceBase(
        registry=SourceRegistry.NASA_OPEN_DATA,
        source_role=SourceRole.PRIMARY_SCIENTIFIC,
    )
    assert ds.registry == SourceRegistry.NASA_OPEN_DATA
    assert ds.source_role == SourceRole.PRIMARY_SCIENTIFIC
    assert ds.provider_name is None
    assert ds.dataset_identifier is None
    assert ds.participates_in_matching is True


def test_data_source_missing_required_fields_fails():
    """DataSourceBase must fail if registry or source_role is missing."""
    with pytest.raises(ValidationError):
        DataSourceBase(registry=SourceRegistry.NASA_API)  # missing source_role

    with pytest.raises(ValidationError):
        DataSourceBase(source_role=SourceRole.CONTEXTUAL)  # missing registry


def test_data_source_participates_in_matching_rules():
    """Verify isolation: Earth observation and contextual data must NOT participate in matching."""
    primary = DataSourceBase(
        registry=SourceRegistry.NASA_PSI,
        source_role=SourceRole.PRIMARY_SCIENTIFIC,
    )
    assert primary.participates_in_matching is True

    normalized = DataSourceBase(
        registry=SourceRegistry.NASA_OPEN_DATA,
        source_role=SourceRole.NORMALIZED_SCIENTIFIC,
    )
    assert normalized.participates_in_matching is True

    earthdata = DataSourceBase(
        registry=SourceRegistry.NASA_EARTHDATA,
        source_role=SourceRole.EARTH_OBSERVATION_CONTEXT,
    )
    assert earthdata.participates_in_matching is False

    contextual = DataSourceBase(
        registry=SourceRegistry.NASA_API,
        source_role=SourceRole.CONTEXTUAL,
    )
    assert contextual.participates_in_matching is False


def test_data_source_round_trip():
    """DataSourceRead serializes and deserializes cleanly with provenance metadata."""
    ds_id = uuid4()
    now = datetime.now(timezone.utc)

    ds_read = DataSourceRead(
        id=ds_id,
        registry=SourceRegistry.NASA_EARTHDATA,
        source_role=SourceRole.EARTH_OBSERVATION_CONTEXT,
        provider_name="NASA LANCE / FIRMS",
        dataset_identifier="MODIS_C6_1",
        sensor_name="MODIS Terra/Aqua",
        source_url="https://firms.modaps.eosdis.nasa.gov",
        retrieved_at=now,
        license_or_access="Open Access / Public Domain",
        provenance={"ingest_pipeline": "earthdata_sync_v1"},
    )

    data = ds_read.model_dump()
    assert data["id"] == ds_id
    assert data["registry"] == "NASA_EARTHDATA"

    json_str = ds_read.model_dump_json()
    reconstructed = DataSourceRead.model_validate_json(json_str)
    assert reconstructed.id == ds_id
    assert reconstructed.provider_name == "NASA LANCE / FIRMS"
