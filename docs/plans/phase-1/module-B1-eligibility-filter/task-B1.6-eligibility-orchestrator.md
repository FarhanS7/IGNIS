# Task B1.6 — Eligibility Orchestrator

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.6-eligibility-orchestrator`
> **Blocked by:** B1.1–B1.5 | **References:** PRD v1.1 §14.4

---

## Objective
Compose all eligibility checks into a single orchestrator that returns a complete eligibility result for a scenario+experiment_run pair.

## File: `services/api/app/eligibility/orchestrator.py`

## Output (PRD v1.1 §14.4)
`json
{
  "status": "eligible_with_warning",
  "reasons": ["same fuel family", "same objective"],
  "warnings": ["gravity environment differs"],
  "excludedBecause": []
}
`

## Logic
- Run all 5 checks
- If ANY check returns ineligible → overall ineligible
- If ANY check returns eligible_with_warning → overall eligible_with_warning
- Otherwise → eligible
- Aggregate all reasons, warnings, and exclusion reasons

## Subtasks
1. Create `EligibilityResult` Pydantic model
2. Implement orchestrator that calls all checks
3. Integration tests with fixture data
4. Commit: `feat(eligibility): implement eligibility orchestrator`
