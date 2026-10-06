# Phase 1.5 — Environment & CI Setup

> **Run after Module A is complete (first 1-2 modules landed).**
> **Reference**: PRD_TO_TASKS_FRAMEWORK.md §Phase 1.5

---

## AI IDE Command

```
Set up the development environment and CI for the IGNIS project.

Read these files first:
- e:/IGNIS/docs/plans/phase-0/TECH-STACK.md (exact packages and versions)
- e:/IGNIS/docs/plans/DECISIONS.md (all locked decisions)

Produce the following:

1. LOCAL DEVELOPMENT
   - apps/web/.env.example with VITE_API_BASE_URL
   - services/api/.env.example with all required env vars (SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, etc.)
   - services/api/app/config.py — Pydantic Settings class that validates all env vars at boot
   - If SUPABASE_URL is missing → crash with: "Missing required env var: SUPABASE_URL"
   - Document startup commands in root README.md:
     Backend: cd services/api && pip install -r requirements.txt && uvicorn app.main:app --reload
     Frontend: cd apps/web && npm install && npm run dev

2. CONTINUOUS INTEGRATION (GitHub Actions or similar)
   Create .github/workflows/ci.yml that runs on every push:
   - Backend: lint (ruff), typecheck (mypy), unit tests (pytest)
   - Frontend: lint (eslint), typecheck (tsc --noEmit), build (vite build)
   Failure blocks merge.

3. SEED + VALIDATE
   - Make the seed script runnable: python -m app.db.seed
   - Add a validate command: python -m data.fixtures.validate_fixtures
   - Document both in README.md

Git commits:
- chore(env): add .env.example files and config validation
- chore(ci): add GitHub Actions lint + typecheck + test pipeline
- docs(root): add development setup instructions to README.md
```

---

## Exit Condition

- [ ] Both .env.example files exist with all required variables documented
- [ ] FastAPI crashes with clear message if env vars are missing
- [ ] CI pipeline runs and passes (or is ready to run once tests exist)
- [ ] README.md has working startup instructions
