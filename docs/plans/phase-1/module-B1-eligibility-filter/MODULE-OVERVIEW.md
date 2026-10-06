# Module B1 — Comparable-Evidence Filter (NEW v1.1)

> **Purpose:** Determine whether an experiment is scientifically eligible for comparison before similarity ranking. Weighted similarity alone is insufficient because numerically similar experiments may be scientifically inappropriate to compare.
>
> **Reference:** PRD v1.1 §14 (Comparable-Evidence Filter) | DECISIONS.md D-013
>
> **This module is entirely new in v1.1.** v1.0 had no eligibility concept.

---

## Why This Exists

Without an eligibility filter, a gaseous fuel droplet experiment could rank as "90% similar" to a solid fabric scenario purely because oxygen/pressure numbers align. The filter catches this before it confuses users.

## Eligibility States
- `eligible` — can be ranked normally
- `eligible_with_warning` — ranked but with visible caveat (e.g., gravity mismatch)
- `ineligible` — excluded from default results

## P0 Checks
1. Fuel/material family compatibility
2. Target phenomenon/objective compatibility
3. Gravity-environment compatibility (or explicit mismatch warning)
4. Minimum comparable environmental factors
5. Data quality/provenance minimum

## Tasks (7)

| Task | File | Summary |
|:---|:---|:---|
| B1.1 | `task-B1.1-fuel-compatibility.md` | Fuel/material family compatibility check |
| B1.2 | `task-B1.2-objective-compatibility.md` | Objective compatibility check |
| B1.3 | `task-B1.3-gravity-compatibility.md` | Gravity environment check with mismatch warnings |
| B1.4 | `task-B1.4-minimum-factors.md` | Minimum comparable factors check |
| B1.5 | `task-B1.5-data-quality.md` | Data quality/provenance check |
| B1.6 | `task-B1.6-eligibility-orchestrator.md` | Compose all checks into eligibility result |
| B1.7 | `task-B1.7-eligibility-tests.md` | Integration tests for eligibility |

## Exit Condition
- [ ] Eligibility orchestrator returns `eligible`, `eligible_with_warning`, or `ineligible` for any scenario+experiment pair
- [ ] Moon/Mars scenarios matched to microgravity data produce `eligible_with_warning` with gravity mismatch reason
- [ ] Incompatible fuel families produce `ineligible`
- [ ] All tests pass
