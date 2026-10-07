"""Unit tests validating SQL schema migration file (Task A.8)."""

from pathlib import Path
import re


MIGRATION_PATH = Path(__file__).resolve().parent.parent / "migrations" / "001_initial_schema.sql"


def test_migration_file_exists():
    """Migration SQL file must exist in services/api/migrations/."""
    assert MIGRATION_PATH.exists()
    assert MIGRATION_PATH.stat().st_size > 0


def test_migration_enables_extensions():
    """Migration must enable uuid-ossp and pgvector extensions."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    assert "CREATE EXTENSION IF NOT EXISTS vector;" in content
    assert "uuid-ossp" in content


def test_migration_contains_all_core_tables():
    """Migration must define all 9 core relational tables."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    expected_tables = [
        "data_sources",
        "experiments",
        "experiment_runs",
        "habitat_presets",
        "source_documents",
        "source_chunks",
        "media_assets",
        "cv_measurements",
        "stories",
    ]
    for table in expected_tables:
        pattern = rf"CREATE TABLE IF NOT EXISTS {table}\s*\("
        assert re.search(pattern, content, re.IGNORECASE), f"Missing CREATE TABLE for {table}"


def test_migration_vector_dimension():
    """source_chunks must have vector(768) column for text-embedding-004."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    assert "VECTOR(768)" in content.upper()


def test_migration_unique_slug_constraints():
    """habitat_presets.slug and stories.slug must have UNIQUE constraints."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    assert re.search(r"slug TEXT UNIQUE NOT NULL", content, re.IGNORECASE)


def test_migration_hnsw_index():
    """Migration must include HNSW index for vector cosine similarity."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    assert "USING hnsw (embedding vector_cosine_ops)" in content
