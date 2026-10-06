# Task I.4 — NASA Earthdata Integration

> **Branch:** `feat/i4-earthdata` | **Blocked by:** I.1 | **Ref:** PRD v1.1 §12.2 FR-NAS-004, §12.3

## Objective
Integrate at least one Earth-observation element from NASA Earthdata (https://earthdata.nasa.gov/user-resources/remote-sensors) for the "Fire from Space vs Fire in Space" story.

## Options
- MODIS/VIIRS active fire data
- Landsat thermal imagery
- FIRMS (Fire Information for Resource Management System)

## Critical Rule (PRD v1.1 §12.3)
Earthdata content is educational/contextual. It must NOT be combined with microgravity experiments into a single evidence-similarity score.

## Steps
1. Select Earthdata product/sensor
2. Create data_sources entry with registry=NASA_EARTHDATA, source_role=earth_observation_context
3. Prepare visual/data for the Fire from Space story
4. Ensure source labels clearly separate this from microgravity evidence

## Subtasks
1. Select Earthdata product
2. Prepare imagery/data
3. Create registry entry
4. Test source-role isolation
5. Commit: `feat(data): integrate NASA Earthdata context`
