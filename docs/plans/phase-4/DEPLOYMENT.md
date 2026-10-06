# Phase 4 — Deployment & Release

> **Run when all P0 modules pass quality gates and CI is green.**
> **Reference**: PRD_TO_TASKS_FRAMEWORK.md §Phase 4

---

## AI IDE Command

```
Plan and execute the deployment for the IGNIS project.

Read these files first:
- e:/IGNIS/docs/plans/DECISIONS.md (D-001 through D-019, especially D-007: Vercel + Railway)
- e:/IGNIS/docs/plans/phase-0/TECH-STACK.md (deployment config)

Execute the following:

1. FRONTEND DEPLOYMENT (Vercel)
   - Create apps/web/vercel.json:
     {
       "buildCommand": "npm run build",
       "outputDirectory": "dist",
       "framework": "vite"
     }
   - Set environment variables in Vercel dashboard:
     VITE_API_BASE_URL=https://your-api.railway.app/api/v1
   - Connect Git repo → Vercel project
   - Deploy from dev branch for staging, main for production

2. BACKEND DEPLOYMENT (Railway)
   - Create services/api/Procfile:
     web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   - Create services/api/railway.json (if needed)
   - Set environment variables in Railway dashboard:
     SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
     GEMINI_API_KEY, NASA_API_KEY
     CORS_ORIGINS=https://your-app.vercel.app
   - Connect Git repo → Railway project (root path: services/api)

3. DATABASE (Supabase)
   - Run migration SQL: services/api/migrations/001_initial_schema.sql (10 tables)
   - Run seed script for demo data (all fixtures)
   - Verify pgvector extension is enabled

4. ENVIRONMENT PROMOTION
   - Local: http://localhost:5173 (FE) + http://localhost:8000 (BE) + Supabase dev project
   - Production: Vercel URL (FE) + Railway URL (BE) + Supabase prod project
   - Secrets: different API keys per environment, stored in platform secret managers

5. ROLLBACK PLAN
   - Broken = error rate >10% on /analyze or /ask endpoints, or FE fails to load
   - Rollback: Vercel auto-rollback to previous deployment. Railway rollback via dashboard.
   - What doesn't rollback: Supabase schema changes (10 tables). Use additive-first migration strategy.

6. PRE-DEPLOY CHECKLIST
   - [ ] All 6 P0 quality gates passed (Gates 1-6 from DEPENDENCY-MAP.md)
   - [ ] CI is green on dev branch
   - [ ] Build-a-Habitat → Evidence → Experiment flow works locally
   - [ ] Explore Fire story works locally
   - [ ] Ask IGNIS returns evidence-grounded answers locally
   - [ ] .env vars match between local and deployed (including NASA_API_KEY)
   - [ ] CORS origins updated for production domains
   - [ ] Demo data is seeded in production Supabase (10 tables)
   - [ ] All 3 NASA source families visible in Source/Provenance view

Deploy commands:
git checkout main
git merge dev
git tag v1.0.0
git push origin main --tags
```

---

## Exit Condition

- [ ] Frontend accessible at Vercel URL
- [ ] Backend accessible at Railway URL
- [ ] POST /analyze returns eligible, ranked evidence with Fire Behavior Profile
- [ ] POST /ask returns evidence-grounded answers with sources
- [ ] At least one Explore Fire story works
- [ ] All 3 NASA source families visible
- [ ] Demo scenario completes end-to-end in production in <= 2 minutes
