# Task B1.5 — Data Quality/Provenance Check

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.5-data-quality`
> **Blocked by:** A.5 | **References:** PRD v1.1 §14.2

---

## Objective
Check that the experiment run's data quality meets minimum provenance requirements.

## File: `services/api/app/eligibility/quality_check.py`

## Logic
- data_quality == high or medium → eligible
- data_quality == low → eligible_with_warning
- data_quality == unreviewed → eligible_with_warning
- No data_quality field → eligible_with_warning
- Source has no data_source reference → eligible_with_warning

## Subtasks
1. Implement `quality_check.py`
2. Tests
3. Commit: `feat(eligibility): implement data quality provenance check`
