# Task B2.7 — Match Orchestrator

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.7-match-orchestrator`
> **Blocked by:** B1.6, B2.1–B2.6 | **References:** PRD v1.1 §15

## Objective
Compose the full analysis pipeline: eligibility → similarity → behavior profile → response.

## File: `services/api/app/matching/orchestrator.py`

## Pipeline
1. Load all experiment runs from DB
2. Run eligibility filter (B1.6) on each
3. Score eligible runs with weighted similarity (B2.1-B2.5)
4. Sort by score descending
5. Compute Fire Behavior Profile (B2.6) from top results
6. Return structured result with all metadata

## Subtasks
1. Implement orchestrator function
2. Integration test with fixture data
3. Commit: `feat(matching): implement full analysis orchestrator`
