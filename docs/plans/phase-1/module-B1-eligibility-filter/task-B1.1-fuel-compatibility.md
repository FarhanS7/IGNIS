# Task B1.1 — Fuel/Material Family Compatibility Check

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.1-fuel-compatibility`
> **Blocked by:** A.1 | **References:** PRD v1.1 §14.2 | DECISIONS.md D-013

---

## Objective
Implement a function that checks whether an experiment's fuel/material family is compatible with the scenario's material for scientific comparison.

## File: `services/api/app/eligibility/fuel_check.py`

## Logic
- Use `MATERIAL_FAMILY_COMPATIBILITY` map from A.1
- Exact match → eligible
- Same parent family → eligible
- Known incompatible family → ineligible
- Unknown/missing → eligible_with_warning (insufficient data)

## Function Signature
`python
def check_fuel_compatibility(scenario_material: MaterialFamily, run_material: MaterialFamily | None) -> EligibilityCheckResult
`

## Subtasks
1. Create `eligibility/` package with `__init__.py`
2. Implement `fuel_check.py`
3. Unit tests with all compatibility cases
4. Commit: `feat(eligibility): implement fuel/material compatibility check`
