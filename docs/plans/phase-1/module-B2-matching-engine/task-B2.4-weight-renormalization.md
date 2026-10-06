# Task B2.4 — Weight Renormalization

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.4-weight-renormalization`
> **Blocked by:** B2.1–B2.3 | **References:** PRD v1.1 §15.3, §15.4

## File: `services/api/app/matching/weights.py`

## Default Weights (PRD v1.1 §15.3)
`json
{ "material_or_fuel": 0.30, "oxygen": 0.20, "airflow": 0.20, "pressure": 0.15, "objective": 0.10, "geometry": 0.05 }
`

## Logic
- For each factor: if score is None (missing data), exclude from calculation
- Renormalize remaining weights to sum to 1.0
- score = sum(weight_i * similarity_i) / sum(weight_i) for available factors

## Subtasks
1. Implement renormalization logic
2. Unit tests with various missing factor combinations
3. Commit: `feat(matching): implement weight renormalization`
