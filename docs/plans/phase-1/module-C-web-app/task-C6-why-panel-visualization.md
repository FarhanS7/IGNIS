# Task C.6 — Why Panel + Evidence-Guided Visualization

> **Module:** C — Web App | **Branch:** `feat/c6-why-panel`
> **Blocked by:** C.5 | **References:** PRD v1.1 §10.5-10.6, §16.6

## Objective
Build the expandable Why? panel and the evidence-guided habitat visualization.

## Why? Panel (PRD v1.1 §10.6)
- Strongest contributing factors (bar chart)
- Closest experiment(s)
- Mismatches
- Evidence coverage
- Source links
- Evidence level labels (observed/derived/similarity/AI)

## Visualization (PRD v1.1 §16.6)
- FR-EGV-001: Reacts to evidence categories (Framer Motion states)
- FR-EGV-002: Persistent label: "Illustrative evidence-guided visualization - not a validated physical simulation"
- FR-EGV-003: Visual state from auditable rules, not LLM output
- FR-EGV-004 (P1): Toggle visualization off

## Subtasks
1. Build collapsible Why? panel
2. Build factor contribution chart (Recharts bar)
3. Build habitat visualization component with Framer Motion states
4. Add persistent non-simulation label
5. Commit: `feat(web): build Why panel and evidence-guided visualization`
