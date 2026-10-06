# Task I.3 — NASA API Enrichment

> **Branch:** `feat/i3-nasa-api` | **Blocked by:** I.1 | **Ref:** PRD v1.1 §12.2 FR-NAS-003

## Objective
Integrate at least one visible product element from a NASA API (https://api.nasa.gov).

## Options
- NASA Image and Video Library API (images.nasa.gov)
- APOD (Astronomy Picture of the Day) for contextual imagery
- NASA TechPort for mission metadata

## Steps
1. Select API and get API key
2. Create data_sources entry with registry=NASA_API, source_role=contextual or media
3. Fetch and display at least one API element in the product
4. Store as enrichment, not primary scientific evidence

## Subtasks
1. Select NASA API
2. Implement fetch/display
3. Create registry entry
4. Commit: `feat(data): integrate NASA API enrichment`
