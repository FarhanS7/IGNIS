"""Pydantic models for the data_sources registry (Task A.5).

Reference: PRD v1.1 §18.1, §12 | DECISIONS.md D-016.
Enforces provenance tracking and explicit multi-channel NASA source roles.
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from .enums import SourceRegistry, SourceRole


class DataSourceBase(BaseModel):
    """Base schema for the NASA Source Registry."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    registry: SourceRegistry          # NASA_OPEN_DATA, NASA_API, NASA_EARTHDATA, etc.
    source_role: SourceRole           # primary_scientific, contextual, earth_observation_context, etc.
    provider_name: str | None = None
    dataset_identifier: str | None = None
    api_name: str | None = None
    sensor_name: str | None = None
    source_url: str | None = None
    retrieved_at: datetime | None = None
    license_or_access: str | None = None
    provenance: dict | None = None

    @property
    def participates_in_matching(self) -> bool:
        """Only primary_scientific and normalized_scientific sources participate in evidence scoring.
        Earth observation data (FIRMS) and general context are strictly excluded (PRD §12.3).
        """
        return self.source_role in {
            SourceRole.PRIMARY_SCIENTIFIC,
            SourceRole.NORMALIZED_SCIENTIFIC,
        }


class DataSourceCreate(DataSourceBase):
    """Payload for registering a new NASA data source."""
    pass


class DataSourceRead(DataSourceBase):
    """Schema for reading persisted data sources."""
    id: UUID
