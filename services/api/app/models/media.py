"""Pydantic models for media_assets and cv_measurements (Task A.4).

Reference: PRD v1.1 §18.7, §18.8 | DECISIONS.md D-003, D-009.
"""

from uuid import UUID
from pydantic import BaseModel, ConfigDict

from .enums import MediaType


class MediaAssetBase(BaseModel):
    """Base schema for combustion imagery, videos, and figures."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    source_id: UUID | None = None  # references data_sources (NEW v1.1)
    experiment_id: UUID | None = None  # references experiments
    run_id: UUID | None = None  # references experiment_runs
    media_type: MediaType
    source_url: str | None = None
    local_or_cached_url: str | None = None
    duration_seconds: float | None = None
    metadata: dict | None = None


class MediaAssetCreate(MediaAssetBase):
    """Payload for registering a media asset."""
    pass


class MediaAssetRead(MediaAssetBase):
    """Schema for reading persisted media assets."""
    id: UUID


class CVMeasurementBase(BaseModel):
    """Base schema for computer-vision derived time series metrics."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    media_asset_id: UUID  # references media_assets
    timestamp_seconds: float
    flame_area_px: float | None = None
    flame_area_ratio: float | None = None
    flame_height_px: float | None = None
    centroid_x: float | None = None
    centroid_y: float | None = None
    confidence: float | None = None
    model_version: str | None = None  # tracks CV pipeline version for reproducibility (PRD §25.5)


class CVMeasurementCreate(CVMeasurementBase):
    """Payload for persisting a CV measurement frame."""
    pass


class CVMeasurementRead(CVMeasurementBase):
    """Schema for reading persisted CV measurements."""
    id: UUID
