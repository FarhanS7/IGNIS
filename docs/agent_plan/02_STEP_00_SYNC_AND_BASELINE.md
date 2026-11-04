# STEP 00: Sync and Baseline

Branch: `feature/fire-response-console` | Depends on: nothing | Est: 30 min | Approval gate: yes

## Objective
Confirm repository state, record baselines, make the plan folder trackable, and install the progress log.

## HUMAN ACTIONS (agent must not do these)
- H1. Ask your Space Apps local lead / read the 2026 Participant Terms: is work done before Nov 14 allowed, and what
  must be built during the event? Write the answer in PROGRESS.md. If building must happen during the event, tell Claude:
  Steps 08-11 are then reserved for Nov 14-15.
- H2. Check the GitHub Actions tab: is the latest run on `fix/phase0-integrity` green? If not, tell Claude.

## Tasks (agent)
1. `git branch --show-current` -> must print `feature/fire-response-console`.
2. `git fetch origin` then `git status -sb`. Working tree must be clean and in sync with origin. If not, STOP.
3. `git log --oneline -12` and paste it in the report.
4. `git branch -a` and `git tag` and paste them.
5. Run `npm test` -> record passing/failing counts. Run `npm run build` -> record exit code.
   Run `npm run lint` -> record result (do not fix lint in this step).
6. Run `python scripts/validate/grouped_loocv.py` -> must print 80.30 / 46.72 / 48.00. Record.
7. Run `$env:PYTHONPATH="."; python -m pytest services/api/tests -q` -> record counts.
8. Reconcile the test count: Phase 0 reported 96 passing; the console branch reported 98 after merging it. Run
   `git diff --stat origin/fix/phase0-integrity..HEAD -- apps/web/src` and explain the +2 difference. If unexplained, STOP.
9. Check ignore rules for the plan and model docs folders:
   `git check-ignore -v docs/agent_plan/README.md docs/models/x.md docs/FIRE_RESPONSE.md`
   If ANY prints a rule, add narrow negations NEXT TO the existing docs rule in `.gitignore`
   (not at end of file): `!docs/agent_plan/` `!docs/agent_plan/*.md` `!docs/models/` `!docs/models/*.md`,
   then re-run the check until it prints nothing.
10. Confirm `docs/agent_plan/` contains this plan (README.md ... PROGRESS.md). Commit if untracked:
    `git add docs/agent_plan .gitignore` then `git commit -m "docs: add agent execution plan"` then `git push`.
11. Fill the "Baseline" table at the top of docs/agent_plan/PROGRESS.md with the numbers from tasks 5-8.

## Verification block
```powershell
git status
npm test
npm run build
```

## Acceptance criteria
- [ ] Branch correct, tree clean, synced with origin
- [ ] Baseline numbers recorded in PROGRESS.md
- [ ] Plan folder tracked by git
- [ ] +2 test discrepancy explained
- [ ] Human actions H1/H2 answered in PROGRESS.md (agent lists them as "needs human")

## STOP conditions
Dirty tree; test failures; LOOCV numbers differ; build fails; unexplained test discrepancy.
