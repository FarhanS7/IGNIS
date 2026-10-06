# Task H.6 — Story API Endpoints

> **Branch:** `feat/h6-story-api` | **Blocked by:** A.7, A.8 | **Ref:** PRD v1.1 §21.6

## Objective
Build GET /stories and GET /stories/:slug endpoints.

## File: `services/api/app/api/stories.py`

## Endpoints
`
GET  /api/v1/stories          → list published stories
GET  /api/v1/stories/{slug}   → single story with all sections
`

## Subtasks
1. Create stories router
2. Query stories table
3. Filter by published=true
4. Return full section data for single story
5. API tests
6. Commit: `feat(api): build story API endpoints`
