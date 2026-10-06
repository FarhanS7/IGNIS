# Task B2.1 — Numeric Similarity Function

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.1-numeric-similarity`
> **Blocked by:** A.1 | **References:** PRD v1.1 §15.2

## Objective
Implement `numeric_similarity(x, y, tolerance) = max(0, 1 - abs(x-y)/tolerance)`

## File: `services/api/app/matching/numeric.py`

## Default Tolerances
- oxygen_pct: 10 (percentage points)
- pressure_kpa: 30
- airflow_cm_s: 15

## Rules
- If either value is None → return None (not 0)
- Score always in [0, 1]

## Subtasks
1. Implement function with configurable tolerance
2. Unit tests for edge cases (None, exact match, out of range)
3. Commit: `feat(matching): implement numeric similarity function`
