-- =============================================================================
-- IGNIS Database Schema Migration 001_initial_schema.sql
-- Reference: PRD v1.1 §18, DECISIONS.md D-004, Task A.8
-- Targets PostgreSQL 15+ / Supabase with pgvector extension enabled.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. DATA_SOURCES (NASA Source Registry - NEW v1.1)
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry TEXT NOT NULL,
    source_role TEXT NOT NULL,
    provider_name TEXT,
    dataset_identifier TEXT,
    api_name TEXT,
    sensor_name TEXT,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ,
    license_or_access TEXT,
    provenance JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EXPERIMENTS (Experiment Metadata)
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT,
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    experiment_family TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    mission_platform TEXT,
    gravity_environment TEXT,
    objectives TEXT[] DEFAULT '{}',
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EXPERIMENT_RUNS (Individual Runs with Test Conditions & Observations)
CREATE TABLE IF NOT EXISTS experiment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    run_label TEXT,
    fuel_type TEXT,
    material TEXT,
    geometry TEXT,
    gravity_environment TEXT,
    oxygen_pct DOUBLE PRECISION,
    pressure_kpa DOUBLE PRECISION,
    airflow_cm_s DOUBLE PRECISION,
    ignition_observed BOOLEAN,
    extinction_observed BOOLEAN,
    flame_spread_observed BOOLEAN,
    observation_summary TEXT,
    source_url TEXT,
    data_quality TEXT,
    provenance JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. HABITAT_PRESETS (Destination Scenario Defaults - NEW v1.1)
CREATE TABLE IF NOT EXISTS habitat_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    gravity_class TEXT,
    gravity_value_g DOUBLE PRECISION,
    external_environment_summary TEXT,
    default_oxygen_pct DOUBLE PRECISION,
    default_pressure_kpa DOUBLE PRECISION,
    default_airflow_cm_s DOUBLE PRECISION,
    default_material TEXT,
    disclaimer TEXT,
    provenance JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SOURCE_DOCUMENTS (Linked Technical Reports & Publications)
CREATE TABLE IF NOT EXISTS source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT,
    source_url TEXT,
    citation_label TEXT,
    raw_text_location TEXT,
    checksum TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SOURCE_CHUNKS (Passages with pgvector Embeddings for Ask IGNIS RAG)
CREATE TABLE IF NOT EXISTS source_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MEDIA_ASSETS (Images, Videos, and Figures)
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    run_id UUID REFERENCES experiment_runs(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL,
    source_url TEXT,
    local_or_cached_url TEXT,
    duration_seconds DOUBLE PRECISION,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CV_MEASUREMENTS (Computer Vision Derived Flame Time-Series)
CREATE TABLE IF NOT EXISTS cv_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    timestamp_seconds DOUBLE PRECISION NOT NULL,
    flame_area_px DOUBLE PRECISION,
    flame_area_ratio DOUBLE PRECISION,
    flame_height_px DOUBLE PRECISION,
    centroid_x DOUBLE PRECISION,
    centroid_y DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. STORIES (Explore Fire Guided Science Stories - NEW v1.1)
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    story_type TEXT NOT NULL,
    source_ids UUID[] DEFAULT '{}',
    experiment_ids UUID[] DEFAULT '{}',
    earthdata_context JSONB,
    sections JSONB DEFAULT '[]'::jsonb,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATION
-- =============================================================================

CREATE INDEX IF NOT EXISTS experiments_family_idx ON experiments(experiment_family);
CREATE INDEX IF NOT EXISTS experiments_source_id_idx ON experiments(source_id);
CREATE INDEX IF NOT EXISTS experiment_runs_experiment_id_idx ON experiment_runs(experiment_id);
CREATE INDEX IF NOT EXISTS experiment_runs_material_idx ON experiment_runs(material);
CREATE INDEX IF NOT EXISTS source_documents_experiment_id_idx ON source_documents(experiment_id);
CREATE INDEX IF NOT EXISTS source_chunks_document_id_idx ON source_chunks(document_id);
CREATE INDEX IF NOT EXISTS cv_measurements_media_asset_id_idx ON cv_measurements(media_asset_id);

-- HNSW Vector Cosine Distance Index for pgvector
CREATE INDEX IF NOT EXISTS source_chunks_embedding_idx 
ON source_chunks USING hnsw (embedding vector_cosine_ops);
