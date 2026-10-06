# Task A.11 — Build Experiment CRUD API Endpoints

> **Module:** A — Data Foundation | **Branch:** `feat/a11-experiment-api`
> **Blocked by:** A.2, A.8 | **References:** PRD v1.1 §21.2, §21.3 | DECISIONS.md D-003

---

## Objective
Create FastAPI router with experiment CRUD endpoints + habitat preset endpoints.

## Files
- `services/api/app/api/experiments.py`
- `services/api/app/api/presets.py`

## Endpoints

### Experiments
```
GET  /api/v1/experiments                    → list experiments
GET  /api/v1/experiments/{experimentId}     → single experiment
GET  /api/v1/experiments/{experimentId}/runs → runs for experiment
GET  /api/v1/experiments/{experimentId}/related → related experiments (P1)
```

### Habitat Presets (NEW v1.1)
```
GET  /api/v1/habitat-presets                → list all presets
GET  /api/v1/habitat-presets/{slug}         → single preset by slug
```

## Subtasks
1. Create experiments router with all 4 endpoints
2. Create presets router with 2 endpoints
3. Register routers in `app/main.py`
4. Write API tests with httpx AsyncClient
5. Commit: `feat(api): build experiment and preset CRUD endpoints`

## Acceptance Criteria
- [ ] All endpoints return correct Pydantic response models
- [ ] 404 for unknown experiment/preset IDs
- [ ] Presets returned by slug, not UUID
- [ ] Tests cover happy path and error cases
