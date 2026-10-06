# Task H.7 — Story Ask IGNIS Integration

> **Branch:** `feat/h7-story-ask` | **Blocked by:** H.2, D.6 | **Ref:** PRD v1.1 §11.3, §16.9 FR-AI-006

## Objective
Wire the suggested Ask IGNIS questions within stories to the /ask endpoint with story scope.

## Features
- Each story section can have a suggested_question
- Clicking it opens inline Ask IGNIS panel scoped to the story
- FR-AI-006 (P1): Questions scoped to story context

## Subtasks
1. Add Ask IGNIS button to story sections with suggested questions
2. Build inline answer panel
3. Pass story scope to POST /ask
4. Commit: `feat(web): wire story Ask IGNIS integration`
