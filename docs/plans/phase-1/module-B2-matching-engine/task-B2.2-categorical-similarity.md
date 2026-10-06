# Task B2.2 — Categorical Similarity Function

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.2-categorical-similarity`
> **Blocked by:** A.1 | **References:** PRD v1.1 §15.2

## Objective
Score categorical fields (material/fuel) using a tiered system.

## File: `services/api/app/matching/categorical.py`

## Scoring (PRD v1.1 §15.2)
- exact match → 1.00
- same parent class → 0.70
- reviewed related class → 0.40
- known mismatch → 0.00
- missing → None

## Subtasks
1. Implement using MATERIAL_FAMILY_COMPATIBILITY from A.1
2. Unit tests
3. Commit: `feat(matching): implement categorical similarity function`
