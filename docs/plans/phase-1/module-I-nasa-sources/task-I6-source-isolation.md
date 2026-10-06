# Task I.6 — Source-Role Isolation Validation

> **Branch:** `feat/i6-source-isolation` | **Blocked by:** I.4, B2.8 | **Ref:** PRD v1.1 §12.3, §29 AT-09

## Objective
Write tests verifying that Earthdata content does NOT influence microgravity evidence matching scores.

## Test Case (PRD v1.1 §29 AT-09)
Given: A story containing Earthdata context AND microgravity experiment evidence
Then: Source labels differ
And: Earthdata content does not contribute to microgravity similarity

## Subtasks
1. Write integration test: Earthdata source excluded from /analyze results
2. Write test: source labels distinguish scientific vs earth-observation
3. Commit: `test(sources): validate source-role isolation`
