# Task B1.2 — Objective Compatibility Check

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.2-objective-compatibility`
> **Blocked by:** A.1 | **References:** PRD v1.1 §14.2

---

## Objective
Check whether the experiment's studied phenomenon matches the scenario's scientific objective.

## File: `services/api/app/eligibility/objective_check.py`

## Logic
- Same objective → eligible
- Related objective (e.g., flame_spread + sustained_burning) → eligible_with_warning
- Incompatible objective → ineligible
- Missing objective data → eligible_with_warning

## Subtasks
1. Implement `objective_check.py`
2. Define objective relatedness map
3. Unit tests
4. Commit: `feat(eligibility): implement objective compatibility check`
