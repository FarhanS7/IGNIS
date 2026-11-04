# Agent Rules (STRICT). Read fully before EVERY step.

## A. Process
1. Do ONLY the step you were told to do. Do not start, prepare, or "get ahead on" any other step.
2. At the end of the step, write the report (17_REPORT_TEMPLATE.md) and STOP. Do not continue to the next step
   until the human replies exactly `APPROVED STEP <N>`.
3. If an instruction cannot be followed exactly, STOP and report why. Do not improvise a workaround.
4. If any command fails, STOP and show the exact error output. Do not "fix around" git, auth, or network errors.
5. Update docs/agent_plan/PROGRESS.md at the end of each step (checkbox + commit hash + test counts).

## B. Git
1. First command of every step: `git branch --show-current`. If it is not the branch the step requires, STOP.
2. NEVER commit or push to `main`. NEVER force-push. NEVER `git reset --hard`, `git clean`, or rewrite history.
3. Small commits. Format: `feat(fire): ...`, `fix(fire): ...`, `feat(ml): ...`, `test(...): ...`,
   `docs: ...`, `chore: ...`. Push after each commit: `git push` (set upstream if needed).
4. Never commit: raw datasets, `*.parquet`, `*.pkl`, caches, `node_modules`, `.env`, API keys, temporary scripts
   (`temp_*`, `apply_*`, `update_*`). Before every commit run `git status` and confirm only intended files.
5. Never print or store credentials.

## C. Tests (non-negotiable)
1. Run `npm test` at the START of the step and record the passing count. Run it again after every task.
2. NEVER delete, skip, or weaken an existing test to make it pass. Fix the code instead. Adding tests is always OK.
3. New code needs new tests in the same commit group.
4. Before finishing a step run the full verification block in that step file and paste the real output counts.
5. Test counts must never go down compared with the previous step's report.

## D. Honesty (IGNIS core)
1. Never invent a citation, DOI, page number, dataset statistic, or numeric result. If you did not open the source and
   read the passage, you may not cite it. Unknown -> write `UNKNOWN` or `<CONFIRM>` and list it in the report.
2. `literature:` tags are allowed ONLY for ids present in `verified_sources.ts`, and ONLY for qualitative claims.
3. Every numeric simulation parameter is `illustrative` unless a `calibrated:` or `trained:` model with a model card
   backs it.
4. NEVER display a percentage risk or percentage confidence in the UI. Categories only.
5. Report negative results honestly (model does not beat baseline; ranking flips; abstention fails). Never tune on
   the test/held-out set. Never hide a failure.
6. Never describe simulated output as measured, flight, or validated. Required banner on /response:
   "Simulated sensor data. Not flight software."
7. Models trained on Earth-gravity data must say: "Not validated in microgravity."

## E. Code constraints
1. Additive only: do not remove or rename existing features, routes, data, docs, or tests.
2. Never edit: `apps/web/src/lib/matcher/real_solid_matcher.ts`, `data/processed/*.json`, existing golden parity tests.
3. No new heavy dependencies (no ONNX, TensorFlow, PyTorch, or UI frameworks). Python: numpy, pandas, scipy,
   scikit-learn, pytest only (pin versions). TypeScript: no new runtime dependencies.
4. No `Math.random()` in `apps/web/src/lib/fire/`. Use the seeded PRNG.
5. Pin Python deps in `requirements-ml.txt` with exact versions from the installed environment. Fixed seed 42 unless
   a step says otherwise.
6. Never use random train/test splits for data with repeated experiments. Group-aware splits only.

## F. Report discipline
Include real command outputs (test counts, build exit code), the list of changed/new files, every deviation, every
UNKNOWN, and every placeholder needing human input.
