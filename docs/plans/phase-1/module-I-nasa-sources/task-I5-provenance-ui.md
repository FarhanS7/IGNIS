# Task I.5 — Source/Provenance UI View

> **Branch:** `feat/i5-provenance-ui` | **Blocked by:** I.1-I.4, C.2 | **Ref:** PRD v1.1 §16.11 FR-NAS-006

## Objective
Build a UI view that shows all registered NASA data sources, their roles, and provenance.

## Requirements (FR-NAS-006)
Source/Provenance view distinguishes:
- Primary scientific sources
- Contextual sources
- Media sources
- Earth-observation context
- Derived by IGNIS

## Location
Could be part of /about page or a dedicated /sources route.

## Subtasks
1. Build source list component
2. Add role badges and icons
3. Wire to GET /sources API
4. Commit: `feat(web): build Source/Provenance UI view`
