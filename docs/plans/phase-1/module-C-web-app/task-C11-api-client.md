# Task C.11 — API Client Layer

> **Module:** C — Web App | **Branch:** `feat/c11-api-client`
> **Blocked by:** C.1 | **References:** DECISIONS.md D-001

## Objective
Build a typed fetch wrapper for all API calls.

## File: `apps/web/src/lib/api.ts`

## Endpoints to Type
- GET /experiments, /experiments/:id, /experiments/:id/runs
- GET /habitat-presets, /habitat-presets/:slug
- POST /analyze
- POST /ask
- GET /stories, /stories/:slug
- GET /media/:id, /media/:id/measurements
- GET /sources, /sources/:id
- GET /health

## Features
- Base URL from VITE_API_BASE_URL env var
- Typed request/response for each endpoint
- Error handling: parse JSON error → typed AppError
- Loading state helpers

## Subtasks
1. Create typed API client
2. Create TypeScript types mirroring all Pydantic models
3. Commit: `feat(web): build typed API client layer`
