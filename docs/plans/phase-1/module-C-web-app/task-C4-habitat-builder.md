# Task C.4 — Habitat Builder Page (/build)

> **Module:** C — Web App | **Branch:** `feat/c4-habitat-builder`
> **Blocked by:** C.2, A.1, A.6 | **References:** PRD v1.1 §10, §16.2, Journey J1

## Objective
Build the destination selector + habitat parameter controls page.

## Layout (PRD v1.1 §17.2)
- Destination selector: visual cards for Orbital, Moon, Mars
- Environment panel (read-only): gravity, external environment
- Habitat panel (editable): oxygen, pressure, airflow, material, objective
- Max 5-6 visible controls in default view
- Every numeric field shows units
- Presets labeled as reference scenario defaults
- Primary CTA: "Analyze with NASA Evidence"

## Data Flow
1. Load presets from GET /habitat-presets
2. User selects destination → populate defaults
3. User edits habitat parameters
4. Submit → POST /analyze → redirect to /evidence

## Subtasks
1. Build destination selector with visual cards
2. Build environment/habitat dual panels
3. Build form controls with validation and units
4. Wire to preset API
5. Add preset disclaimer label
6. Commit: `feat(web): build habitat builder page`
