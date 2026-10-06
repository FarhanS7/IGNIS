# Task D.2 — Vector Retrieval with Source-Role Filter (v1.1)
> **Branch:** `feat/d2-retrieval` | **Blocked by:** D.1, A.8 | **Ref:** PRD v1.1 §19.2
## Objective: Retrieve relevant chunks via pgvector cosine similarity with source-role filtering.
## File: `services/api/app/rag/retrieval.py`
## v1.1 Addition: source-role filter ensures Earthdata context only retrieved when question/story context calls for it. Default: exclude earth_observation_context unless explicitly scoped.
## Subtasks: 1. Implement vector search query 2. Add source_role metadata filter 3. Tests 4. Commit
