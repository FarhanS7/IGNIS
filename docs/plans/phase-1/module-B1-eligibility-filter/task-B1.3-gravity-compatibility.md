# Task B1.3 — Gravity Environment Compatibility + Mismatch Warnings

> **Module:** B1 — Eligibility Filter | **Branch:** `feat/b1.3-gravity-compatibility`
> **Blocked by:** A.1 | **References:** PRD v1.1 §14.3, §14.4 | DECISIONS.md D-013

---

## Objective
Check gravity environment compatibility. This is the most critical eligibility check because it prevents Moon/Mars scenarios from appearing fully comparable to microgravity-only evidence.

## File: `services/api/app/eligibility/gravity_check.py`

## Logic (PRD v1.1 §14.3)
- Microgravity scenario + microgravity experiment → eligible
- Lunar/Martian scenario + microgravity experiment → eligible_with_warning (gravity differs, confidence reduced)
- Earth-gravity experiment → eligible only if objective explicitly permits it
- Missing gravity → eligible_with_warning

## Warning Message
`Gravity environment differs from the source experiment; transferability is uncertain.`

## Subtasks
1. Implement `gravity_check.py`
2. Tests for all gravity combinations
3. Commit: `feat(eligibility): implement gravity compatibility with mismatch warnings`
