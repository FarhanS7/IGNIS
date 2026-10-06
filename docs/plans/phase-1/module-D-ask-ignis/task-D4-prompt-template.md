# Task D.4 — Grounded-Answer LLM Prompt Template (v1.1)
> **Branch:** `feat/d4-prompt` | **Blocked by:** Nothing | **Ref:** PRD v1.1 §19.3
## Objective: Create the prompt template for evidence-grounded answer generation.
## File: `services/api/app/rag/prompt.py`
## v1.1 Addition: Scope resolution (scenario/experiment/story/global). The prompt includes active scenario/story context and evidence levels/source roles. Strict instruction to use supplied evidence only for scientific claims.
## Response Contract (PRD v1.1 §19.3):
`json
{ "answer": "...", "evidence": [{"sourceId": "...", "experimentId": "...", "claim": "...", "evidenceLevel": "A"}], "limitations": ["..."], "confidence": "high|medium|low" }
`
## Subtasks: 1. Create prompt template with scope handling 2. Define response schema 3. Add prompt-injection resistance (§19.5) 4. Commit
