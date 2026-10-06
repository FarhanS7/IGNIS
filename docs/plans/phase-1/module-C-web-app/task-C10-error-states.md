# Task C.10 — Error States and Loading Skeletons

> **Module:** C — Web App | **Branch:** `feat/c10-error-states`
> **Blocked by:** C.3–C.8 | **References:** PRD v1.1 §17.5

## Required States (PRD v1.1 §17.5)
- No comparable experiments
- Gravity mismatch / low transferability
- Insufficient metadata
- Source unavailable
- RAG evidence below threshold
- Video analysis unavailable
- Earthdata/API enrichment temporarily unavailable
- Backend/network error

## Rules
- No state may silently fall back to invented content
- Each state has a clear message explaining what happened
- Loading skeletons for all async data

## Subtasks
1. Build ErrorBoundary component
2. Build loading skeleton components
3. Build empty state components for each case
4. Add to all pages
5. Commit: `feat(web): build error states and loading skeletons`
