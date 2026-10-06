"""Pydantic models for source_documents and source_chunks (Task A.3).

Reference: PRD v1.1 §18.5, §18.6 | DECISIONS.md D-003, D-004.
"""

from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SourceDocumentBase(BaseModel):
    """Base schema for primary publications and technical reports."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    source_id: UUID | None = None  # references data_sources (NEW v1.1)
    experiment_id: UUID | None = None  # references experiments
    title: str
    document_type: str | None = None
    source_url: str | None = None
    citation_label: str | None = None
    raw_text_location: str | None = None
    checksum: str | None = None


class SourceDocumentCreate(SourceDocumentBase):
    """Payload for creating a new source document."""
    pass


class SourceDocumentRead(SourceDocumentBase):
    """Schema for reading persisted source documents."""
    id: UUID


class SourceChunkBase(BaseModel):
    """Base schema for extracted text passages and vector embeddings."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    document_id: UUID  # references source_documents
    experiment_id: UUID | None = None  # references experiments
    chunk_index: int = Field(ge=0)
    content: str
    embedding: list[float] | None = None  # 768-dim vector from text-embedding-004
    metadata: dict | None = None


class SourceChunkCreate(SourceChunkBase):
    """Payload for creating a new source text chunk."""
    pass


class SourceChunkRead(SourceChunkBase):
    """Schema for reading persisted source text chunks."""
    id: UUID
