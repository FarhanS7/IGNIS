# Phase 5 — Post-Launch Operations

> **"Deployed" is not "done."**
> **Reference**: PRD_TO_TASKS_FRAMEWORK.md §Phase 5

---

## AI IDE Command

```
Plan post-launch operations for the IGNIS project.

1. MONITORING & ALERTING
   Metrics that matter for IGNIS specifically:
   - /analyze endpoint latency (target: <750ms per PRD v1.1 §25.1)
   - /ask endpoint error rate (LLM failures)
   - Frontend load time (target: <3s for P0 pages per PRD v1.1 §25.1)
   - Story page load time
   - Source API availability
   
   Minimum alert: Railway's built-in health check + Supabase dashboard monitoring.
   No external monitoring service for hackathon (keep it simple).
   
   Backend logging (already built in ARCHITECTURE.md):
   - structlog with request_id, endpoint, latency, error state
   - Dataset/scoring/eligibility-rule version per response
   - Source roles used in generated answers
   - Check Railway logs dashboard for errors

2. DOCUMENTATION
   Required docs (definition of done for hackathon):
   - [ ] README.md: What IGNIS is, how to run locally, how to deploy
   - [ ] docs/plans/DECISIONS.md: All architectural decisions D-001 through D-019 (already done)
   - [ ] docs/demo-script.md: Exact 2-minute demo script matching PRD v1.1 §34
   - [ ] FastAPI auto-generated OpenAPI docs at /docs (built-in)
   
3. DEMO SCRIPT (docs/demo-script.md)
   Write the exact script from PRD v1.1 §34:
   1. Hook: "What if you could build a habitat in space and ask NASA's real fire experiments what would matter there?"
   2. Choose Build a Habitat
   3. Select the canonical orbital/deep-space habitat preset
   4. Change one parameter live, such as oxygen or airflow
   5. Click Analyze with NASA Evidence
   6. Reveal the Fire Behavior Profile — explain it reflects evidence categories, not fire-risk probability
   7. Show the evidence-guided habitat visualization and its non-simulation label
   8. Click Why? to reveal strongest contributing factors and experiment matches
   9. Open the strongest experiment — play real media and show synchronized IGNIS-derived analysis
   10. Ask one prepared question and reveal a source-backed answer
   11. Briefly open Explore Fire and show the "Fire from Space vs Fire in Space" story
   12. Close: "IGNIS does not ask AI to invent fire behavior. It lets NASA's experiments teach us what the evidence actually shows."
   
   Include:
   - Exact scenario parameters to use (canonical orbital preset)
   - Exact question to ask
   - Expected results (what should appear)
   - Backup plan if LLM is slow or fails
   - Fallback if external NASA sources are temporarily unavailable

4. VERSIONING
   - Tag v1.0.0 at first successful demo deployment
   - Changelog in CHANGELOG.md (simple dated entries)
```

---

## Exit Condition

- [ ] README.md is complete and a new developer could set up locally from it
- [ ] Demo script is written and rehearsed
- [ ] API docs are accessible at /docs
- [ ] Team can complete the 2-minute demo without manual intervention
- [ ] Demo does not depend on live ingestion or fragile network-only access
