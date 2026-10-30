# Legacy Mock Fixtures Notice

> [!WARNING]
> **LEGACY SYNTHETIC / MOCK DATA ONLY**: The fixture files in this directory (`experiment_runs.json`, `experiments.json`, `source_chunks.json`, `stories.json`, etc.) were generated as synthetic placeholder fixtures during preliminary Phase 0 prototyping.
> 
> They do **NOT** represent verified NASA flight combustion data. They are preserved here strictly for legacy unit test compatibility and demo fixtures.

### Real Flight Data Location:
The authentic, cryptographic-provenance NASA Physical Sciences Informatics (PSI) flight combustion dataset is located at:
- `data/processed/evidence_runs.json`: All 1,401 verified NASA flight combustion runs across 14 investigations (solid, droplet, and gas).
- `data/processed/evidence_solid.json`: The solid-fuel evidence tier (BASS-I, BASS-II, Saffire-I, Saffire-II, Saffire-III) engineered for the Habitat Builder.
- Schema definition: `schema/evidence_run.schema.json`.
- Types: `apps/web/src/types/evidence_run.ts` and `services/api/app/models/evidence_run.py`.
- Epistemic Quality Audit: `docs/DATA_QUALITY.md`.
- Tabular Facts Audit: `docs/VERIFIED_FACTS.md`.
