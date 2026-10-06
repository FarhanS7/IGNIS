# Task B2.8 — POST /analyze API Endpoint

> **Module:** B2 — Matching Engine | **Branch:** `feat/b2.8-analyze-endpoint`
> **Blocked by:** B2.7, A.11 | **References:** PRD v1.1 §21.4 | DECISIONS.md D-019

## Objective
Build the `POST /api/v1/analyze` endpoint that accepts a scenario and returns ranked evidence.

## File: `services/api/app/api/analyze.py`

## Request (PRD v1.1 §21.4)
`json
{
  "scenario": { "destination": "orbital", "fuelType": "solid", "oxygenPct": 20, "pressureKpa": 75, "airflowCmS": 10, "objectives": ["flame_spread"] },
  "limit": 5
}
`

## Response
`json
{
  "datasetVersion": "2026.09.26",
  "scoringVersion": "1.1",
  "behaviorProfile": [...],
  "results": [{ "runId": "...", "experimentId": "...", "eligibility": "eligible", "eligibilityWarnings": [], "evidenceSimilarity": 0.91, "coverage": 0.85, "confidence": "high", "factors": [...], "warnings": [] }]
}
`

## Subtasks
1. Create Scenario request model
2. Create AnalyzeResponse model
3. Implement endpoint calling orchestrator
4. API tests
5. Commit: `feat(api): build POST /analyze endpoint`
