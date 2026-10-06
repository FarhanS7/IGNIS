# Task B2.3 — Objective Overlap Scoring

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.3-objective-overlap`
> **Blocked by:** A.1 | **References:** PRD v1.1 §15.3

## File: `services/api/app/matching/objective.py`

## Logic
- Jaccard-like overlap between scenario objectives and experiment objectives
- Full overlap → 1.0
- Partial → proportional
- No overlap → 0.0
- Empty on either side → None

## Subtasks
1. Implement objective overlap function
2. Unit tests
3. Commit: `feat(matching): implement objective overlap scoring`
