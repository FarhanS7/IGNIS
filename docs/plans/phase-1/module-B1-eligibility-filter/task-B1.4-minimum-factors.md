# Task B1.4 — Minimum Comparable Factors Check

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.4-minimum-factors`
> **Blocked by:** A.2 | **References:** PRD v1.1 §14.2

---

## Objective
Ensure the experiment run has at least one comparable environmental factor (oxygen, pressure, airflow, or material) before proceeding to similarity scoring.

## File: `services/api/app/eligibility/factors_check.py`

## Logic
- Count how many of [oxygen_pct, pressure_kpa, airflow_cm_s, material, fuel_type] are non-null in the run
- If count >= 1 → eligible
- If count == 0 → ineligible (nothing to compare)

## Subtasks
1. Implement `factors_check.py`
2. Tests
3. Commit: `feat(eligibility): implement minimum comparable factors check`
