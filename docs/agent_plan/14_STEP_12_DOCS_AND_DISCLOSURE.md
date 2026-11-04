# STEP 12: Documentation, Attribution, Disclosure

Branch: `feature/fire-response-ml` | Depends on: Step 11 | Est: 2-3 h | Approval gate: yes

## Tasks
1. `docs/FIRE_RESPONSE.md`: what the console does; architecture diagram (text); the honesty table from 00_MASTER_PLAN.md section 5; each model's one-paragraph summary
   with metrics copied from the model cards (copy real numbers only); how to run everything; how to reproduce training (commands, data download, seed).
2. `docs/LIMITATIONS.md`: simulated sensors; Earth-gravity training data; droplet-only extinction evidence; no partial-gravity smoke transport; zone-level localization only;
   not flight software; pre-ignition SAME data; small samples; Monte Carlo is a design-consistency check.
3. README: update the Fire Response section (do not delete existing content): feature summary, link to FIRE_RESPONSE.md and model cards, reproduction commands, test commands.
4. Dataset attribution (README + About page + docs/models/*): authors, titles, DOIs, licenses exactly as recorded in `ml_manifest.json`. If a dataset is CC BY, the credit is mandatory.
5. AI-tool usage disclosure section in README. Draft ONLY from facts evident in the repo. Mark `<CONFIRM: ...>` for anything unknown (which AI IDE and model(s) were used, what
   they were used for, what the humans verified). The HUMAN must fill these before submission. List every `<CONFIRM>` in the report.
6. `CHANGELOG.md` (new): Phase 0 integrity fixes; Fire Response Console; ML models; tests/CI.
7. `docs/DEMO_SCRIPT.md` placeholder is created in Step 14, not here.
8. Update `docs/agent_plan/PROGRESS.md`.
9. Guard: `git grep -n "<CONFIRM" -- README.md docs` lists remaining placeholders for the human.

## Acceptance criteria
- [ ] All numbers in docs match model cards and metrics.json (spot-check 10 numbers and list them)
- [ ] Attributions complete; licenses match manifest
- [ ] Disclosure drafted with explicit placeholders; no invented facts
