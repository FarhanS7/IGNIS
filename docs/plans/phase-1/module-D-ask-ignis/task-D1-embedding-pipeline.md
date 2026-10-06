# Task D.1 — Embedding Generation Pipeline
> **Branch:** `feat/d1-embeddings` | **Blocked by:** A.3, A.8 | **Ref:** PRD v1.1 §19.1
## Objective: Generate text-embedding-004 embeddings for source_chunks and store in pgvector.
## File: `pipelines/embeddings/generate.py`
## Subtasks: 1. Read source_chunks from DB 2. Call text-embedding-004 API 3. Store 768-dim vectors back to source_chunks.embedding 4. Commit
