# Task A.10 — Build Seed Script

> **Module:** A — Data Foundation | **Branch:** `feat/a10-seed-script`
> **Blocked by:** A.8, A.9 | **References:** DECISIONS.md D-004, D-008

---

## Objective
Create a Python script that loads all fixture JSON files into Supabase.

## File: `services/api/scripts/seed.py`

## Behavior
1. Read all JSON files from `data/fixtures/`
2. Insert in correct FK order: data_sources → experiments → experiment_runs → habitat_presets → source_documents → source_chunks → media_assets → cv_measurements → stories
3. Skip existing records (upsert on ID)
4. Log inserted/skipped counts
5. Validate FK integrity before insert

## Subtasks
1. Create seed script with Supabase client
2. Add CLI flag: `--dry-run` (validate without inserting)
3. Test against local/dev Supabase instance
4. Commit: `feat(data): build seed script for v1.1 fixtures`
