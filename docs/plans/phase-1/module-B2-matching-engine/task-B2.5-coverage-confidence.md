# Task B2.5 — Coverage & Confidence Calculation

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.5-coverage-confidence`
> **Blocked by:** B2.4 | **References:** PRD v1.1 §15.5

## File: `services/api/app/matching/coverage.py`

## Coverage
`coverage = sum(original_weight_i for comparable factors)`

## Confidence (PRD v1.1 §15.5)
- coverage >= 0.80 AND no major comparability warning → High
- coverage >= 0.55 → Medium
- otherwise → Low
- **Gravity/regime mismatch caps confidence even if coverage is high** (v1.1 addition)

## Subtasks
1. Implement coverage calculation
2. Implement confidence with gravity cap
3. Unit tests
4. Commit: `feat(matching): implement coverage and confidence with gravity caps`
