# Task B2.9 — Integration Tests

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.9-integration-tests`
> **Blocked by:** B2.8, A.9 | **References:** PRD v1.1 §29 AT-01 through AT-05

## Objective
Write end-to-end integration tests for the full analysis pipeline.

## File: `services/api/tests/test_analyze.py`

## Test Cases (from PRD v1.1 §29)
1. AT-01: Strong match appears near top with visible reasons
2. AT-02: Incompatible experiment excluded by eligibility
3. AT-03: Moon scenario shows gravity mismatch warning
4. AT-04: Scenario outside dataset shows limited evidence
5. AT-05: No safe/unsafe language in any response
6. Deterministic: same input → same ranking
7. Missing values → not treated as zero

## Subtasks
1. Write all test cases
2. Verify deterministic behavior
3. Commit: `test(matching): integration tests for full analysis pipeline`
