# Task I.1 — Sources CRUD API Endpoints

> **Branch:** `feat/i1-sources-api` | **Blocked by:** A.5, A.8 | **Ref:** PRD v1.1 §21.8

## Objective
Build GET /sources and GET /sources/:id endpoints for the data sources registry.

## File: `services/api/app/api/sources.py`

## Endpoints
`
GET  /api/v1/sources              -> list all registered sources
GET  /api/v1/sources/{sourceId}   -> single source details
`

## Response includes registry type, source_role, provider metadata, and provenance info.

## Subtasks
1. Create sources router
2. Implement queries
3. API tests
4. Commit: `feat(api): build sources CRUD endpoints`
