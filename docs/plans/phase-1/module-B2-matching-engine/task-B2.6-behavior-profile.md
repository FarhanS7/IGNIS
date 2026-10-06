# Task B2.6 — Fire Behavior Profile Aggregation Rules (NEW v1.1)

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.6-behavior-profile`
> **Blocked by:** B2.5, B1.6 | **References:** PRD v1.1 §10.4, §16.5 | DECISIONS.md D-014

## Objective
Aggregate eligible+ranked experiment evidence into Fire Behavior Profile dimensions.

## File: `services/api/app/behavior/profile.py`

## Behavior Dimensions
- Flame-spread evidence: Elevated / Mixed / Limited / Insufficient
- Sustained-burning evidence: Elevated / Mixed / Limited / Insufficient
- Extinction evidence: Strong / Moderate / Limited / Insufficient
- Comparable experiments: count
- Evidence coverage: High / Medium / Low

## Logic
For each dimension:
1. Filter eligible experiments that have relevant observations (e.g., flame_spread_observed)
2. Count positive/negative observations
3. Map to behavior level based on ratio and count thresholds
4. If no experiments have data for dimension → `insufficient`

## Key Rules (PRD v1.1 §16.5)
- FR-FBP-001: Evidence-based dimensions, NOT generic risk score
- FR-FBP-002: Unsupported dimensions hidden or labeled insufficient
- FR-FBP-003: Every label links to evidence used
- FR-FBP-005: UI never states safe/unsafe or absolute risk

## Subtasks
1. Define `BehaviorDimension` and `BehaviorProfile` Pydantic models
2. Implement aggregation rules for each dimension
3. Tests with varied experiment sets
4. Commit: `feat(behavior): implement Fire Behavior Profile aggregation`
