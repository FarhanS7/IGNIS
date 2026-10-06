# Task B1.7 — Eligibility Integration Tests

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.7-eligibility-tests`
> **Blocked by:** B1.6, A.9 | **References:** PRD v1.1 §29 AT-02, AT-03

---

## Objective
Write integration tests that validate eligibility for real fixture scenarios.

## File: `services/api/tests/test_eligibility.py`

## Test Cases (from PRD v1.1 §29)
1. AT-02: Numerically similar but incompatible fuel → ineligible
2. AT-03: Moon scenario + microgravity experiment → eligible_with_warning with gravity mismatch
3. Exact match scenario → eligible with clear reasons
4. Empty experiment (no comparable factors) → ineligible
5. Low quality data → eligible_with_warning

## Subtasks
1. Write all test cases using fixture data
2. Verify deterministic results
3. Commit: `test(eligibility): integration tests for comparable-evidence filter`
