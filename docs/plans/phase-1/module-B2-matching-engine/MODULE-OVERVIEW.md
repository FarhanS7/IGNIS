# Module B2 — Matching Engine

> **Purpose:** Compute evidence similarity scores for eligible experiments, aggregate results into a Fire Behavior Profile, and expose via POST /analyze endpoint.
>
> **Reference:** PRD v1.1 §15 (Matching), §16.4-16.5 (FRs), §21.4 (API) | DECISIONS.md D-014, D-019
>
> **Renamed from Module B (v1.0).** Now runs AFTER Module B1 (eligibility filter). Adds Fire Behavior Profile aggregation (NEW v1.1) and POST /analyze (renamed from /match).

---

## Tasks (9)

| Task | File | Summary |
|:---|:---|:---|
| B2.1 | `task-B2.1-numeric-similarity.md` | `numeric_similarity(x, y, tolerance)` |
| B2.2 | `task-B2.2-categorical-similarity.md` | Material/fuel categorical scoring |
| B2.3 | `task-B2.3-objective-overlap.md` | Objective list overlap scoring |
| B2.4 | `task-B2.4-weight-renormalization.md` | Renormalize weights across available factors |
| B2.5 | `task-B2.5-coverage-confidence.md` | Coverage + confidence with gravity caps (v1.1) |
| B2.6 | `task-B2.6-behavior-profile.md` | Fire Behavior Profile aggregation rules (NEW v1.1) |
| B2.7 | `task-B2.7-match-orchestrator.md` | Full pipeline: eligibility → similarity → behavior |
| B2.8 | `task-B2.8-analyze-endpoint.md` | POST /analyze API endpoint (renamed from /match) |
| B2.9 | `task-B2.9-integration-tests.md` | Deterministic matching + eligibility tests |

## Exit Condition (Gate 2)
- [ ] POST /analyze returns eligible experiments with scores, coverage, confidence, factor explanations, and warnings
- [ ] Fire Behavior Profile returns evidence-oriented dimensions (not risk scores)
- [ ] Ineligible experiments excluded from default results
- [ ] Gravity mismatch caps confidence for Moon/Mars scenarios
- [ ] Same input yields deterministic ranking
