# Task C.5 — Evidence Results Page (/evidence)

> **Module:** C — Web App | **Branch:** `feat/c5-evidence-results`
> **Blocked by:** C.2, B2.8 | **References:** PRD v1.1 §10.4, §16.4-16.5, §17.3-17.4

## Objective
Build the results page showing Fire Behavior Profile, ranked experiments, and evidence cards.

## Layout (PRD v1.1 §17.3)
1. Destination / Habitat summary
2. FIRE BEHAVIOR PROFILE — behavior labels + evidence coverage
3. ILLUSTRATIVE HABITAT VISUALIZATION — non-simulation label
4. WHY? — factor contributions + warnings
5. CLOSEST NASA EVIDENCE — ranked experiment cards
6. [Open Experiment] [Ask IGNIS]

## Evidence Card (PRD v1.1 §17.4)
- Experiment name
- Evidence Similarity: 0.91
- Coverage: 0.85 | Confidence: High
- Eligibility: Comparable (or warnings)
- Why it matched / Important mismatches
- [View experiment]

## Subtasks
1. Build Fire Behavior Profile component
2. Build evidence card list
3. Build experiment card component
4. Wire to POST /analyze response
5. Commit: `feat(web): build evidence results page with Fire Behavior Profile`
