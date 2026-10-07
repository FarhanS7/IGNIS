"""Unit tests for MediaAsset & CVMeasurement Pydantic models (Task A.4)."""

from uuid import uuid4
import pytest
from pydantic import ValidationError

from services.api.app.models.enums import MediaType
from services.api.app.models.media import (
    MediaAssetBase,
    MediaAssetCreate,
    MediaAssetRead,
    CVMeasurementBase,
    CVMeasurementCreate,
    CVMeasurementRead,
)


def test_media_asset_minimal_instantiation():
    """MediaAsset requires media_type; other fields default to None."""
    asset = MediaAssetBase(media_type=MediaType.VIDEO)
    assert asset.media_type == MediaType.VIDEO
    assert asset.source_id is None
    assert asset.experiment_id is None
    assert asset.run_id is None
    assert asset.duration_seconds is None


def test_media_asset_round_trip():
    """MediaAssetRead serializes and deserializes cleanly."""
    asset_id = uuid4()
    exp_id = uuid4()
    source_id = uuid4()

    asset_read = MediaAssetRead(
        id=asset_id,
        source_id=source_id,
        experiment_id=exp_id,
        media_type=MediaType.VIDEO,
        source_url="https://psi.nasa.gov/saffire/video1.mp4",
        local_or_cached_url="/media/cached/saffire_run1.mp4",
        duration_seconds=12.4,
        metadata={"fps": 30, "resolution": "1920x1080"},
    )

    data = asset_read.model_dump()
    assert data["id"] == asset_id
    assert data["media_type"] == "video"
    assert data["duration_seconds"] == 12.4

    json_str = asset_read.model_dump_json()
    reconstructed = MediaAssetRead.model_validate_json(json_str)
    assert reconstructed.id == asset_id
    assert reconstructed.media_type == MediaType.VIDEO


def test_cv_measurement_minimal_instantiation():
    """CVMeasurement requires media_asset_id and timestamp_seconds; metrics default to None."""
    asset_id = uuid4()
    meas = CVMeasurementBase(
        media_asset_id=asset_id,
        timestamp_seconds=3.5,
    )
    assert meas.media_asset_id == asset_id
    assert meas.timestamp_seconds == 3.5
    assert meas.flame_area_px is None
    assert meas.flame_area_ratio is None
    assert meas.model_version is None


def test_cv_measurement_full_round_trip():
    """CVMeasurementRead serializes and deserializes cleanly with all metrics."""
    meas_id = uuid4()
    asset_id = uuid4()

    meas_read = CVMeasurementRead(
        id=meas_id,
        media_asset_id=asset_id,
        timestamp_seconds=3.52,
        flame_area_px=14520.5,
        flame_area_ratio=1.42,
        flame_height_px=124.0,
        centroid_x=320.5,
        centroid_y=201.2,
        confidence=0.98,
        model_version="cv-contour-v1.0.0",
    )

    assert meas_read.confidence == 0.98
    assert meas_read.model_version == "cv-contour-v1.0.0"

    json_str = meas_read.model_dump_json()
    reconstructed = CVMeasurementRead.model_validate_json(json_str)
    assert reconstructed.id == meas_id
    assert reconstructed.flame_area_ratio == 1.42
    assert reconstructed.model_version == "cv-contour-v1.0.0"


def test_cv_measurement_missing_required_fails():
    """CVMeasurementBase must fail if timestamp_seconds or media_asset_id is missing."""
    with pytest.raises(ValidationError):
        CVMeasurementBase(media_asset_id=uuid4())  # missing timestamp_seconds

    with pytest.raises(ValidationError):
        CVMeasurementBase(timestamp_seconds=1.0)  # missing media_asset_id
