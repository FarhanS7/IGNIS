"""Unit tests for SourceDocument & SourceChunk Pydantic models (Task A.3)."""

from uuid import uuid4
import pytest
from pydantic import ValidationError

from services.api.app.models.source import (
    SourceDocumentBase,
    SourceDocumentCreate,
    SourceDocumentRead,
    SourceChunkBase,
    SourceChunkCreate,
    SourceChunkRead,
)


def test_source_document_minimal_instantiation():
    """SourceDocument requires title; other fields default to None."""
    doc = SourceDocumentBase(title="Saffire-I Flight Investigation Summary")
    assert doc.title == "Saffire-I Flight Investigation Summary"
    assert doc.source_id is None
    assert doc.experiment_id is None
    assert doc.document_type is None
    assert doc.checksum is None


def test_source_document_round_trip():
    """SourceDocumentRead serializes and deserializes cleanly."""
    doc_id = uuid4()
    source_id = uuid4()
    exp_id = uuid4()

    doc_read = SourceDocumentRead(
        id=doc_id,
        source_id=source_id,
        experiment_id=exp_id,
        title="FLEX Droplet Combustion in Microgravity",
        document_type="NASA TM",
        source_url="https://ntrs.nasa.gov/citations/20150018220",
        citation_label="NASA TM-2015-218820",
        raw_text_location="s3://ignis-archive/sources/flex2.pdf",
        checksum="sha256:abcd1234ef5678",
    )

    data = doc_read.model_dump()
    assert data["id"] == doc_id
    assert data["citation_label"] == "NASA TM-2015-218820"

    json_str = doc_read.model_dump_json()
    reconstructed = SourceDocumentRead.model_validate_json(json_str)
    assert reconstructed.id == doc_id
    assert reconstructed.checksum == "sha256:abcd1234ef5678"


def test_source_chunk_with_768_dim_embedding():
    """SourceChunk accepts 768-dimensional float embedding vector."""
    doc_id = uuid4()
    chunk_id = uuid4()
    embedding_768 = [0.0125 * (i % 10) for i in range(768)]

    chunk = SourceChunkRead(
        id=chunk_id,
        document_id=doc_id,
        chunk_index=0,
        content="In microgravity, oxygen transport occurs almost purely via molecular diffusion...",
        embedding=embedding_768,
        metadata={"section": "Discussion", "page": 4},
    )

    assert len(chunk.embedding) == 768
    assert chunk.metadata["section"] == "Discussion"

    json_str = chunk.model_dump_json()
    reconstructed = SourceChunkRead.model_validate_json(json_str)
    assert reconstructed.id == chunk_id
    assert len(reconstructed.embedding) == 768


def test_source_chunk_negative_index_rejected():
    """chunk_index must be >= 0."""
    with pytest.raises(ValidationError):
        SourceChunkBase(
            document_id=uuid4(),
            chunk_index=-1,
            content="Invalid negative index",
        )
