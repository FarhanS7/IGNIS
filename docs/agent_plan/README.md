# IGNIS Fire Response: Agent Execution Plan

This folder is a step-by-step, command-driven plan for the IDE agent (Antigravity) to finish,
test, and ship the Fire Response features of IGNIS for NASA Space Apps 2026 ("Flame in Freefall").

Features covered: (1) detect fire, (2) alarm + show where, (3) automatic response sequence,
(4) real-data machine learning that supports (1)-(3), (5) tests, CI, GitHub, deployment.

## Install into the repo (human does this once)

```powershell
cd E:\IGNIS
git switch feature/fire-response-console
# copy the contents of this folder into E:\IGNIS\docs\agent_plan\
git check-ignore -v docs/agent_plan/README.md     # must print NOTHING. If it prints a rule, see Step 00.
git add docs/agent_plan
git commit -m "docs: add agent execution plan"
git push
```

## Run a step (human does this for every step)

Paste this to the agent, replacing `<STEP_FILE>`:

```
You are working in E:\IGNIS. Before doing anything:
1. Read docs/agent_plan/01_AGENT_RULES.md completely.
2. Read docs/agent_plan/<STEP_FILE> completely.
Execute that step EXACTLY as written. Do not start any other step.
When finished, write the report using docs/agent_plan/17_REPORT_TEMPLATE.md and STOP.
Do not continue until I reply "APPROVED STEP <N>".
```

Then paste the agent's report to Claude for review. Reply `APPROVED STEP N` to the agent only after review.

## Order

| Step | File | Branch | Est. | Depends on |
|---|---|---|---|---|
| 00 | 02_STEP_00_SYNC_AND_BASELINE.md | console | 30 min | none |
| 01 | 03_STEP_01_CONSOLE_AUDIT_AND_FIXES.md | console | 3-4 h | 00 |
| 02 | 04_STEP_02_CONSOLE_E2E_AND_MC_HARDENING.md | console | 2-3 h | 01 |
| 03 | 05_STEP_03_ML_DATA_ACQUISITION.md | ml | 3 h | 02 |
| 04 | 06_STEP_04_ML_M2_FUSION_DETECTOR.md | ml | 5-6 h | 03 |
| 05 | 07_STEP_05_ML_M1_SAME_DETECTOR_RESPONSE.md | ml | 3-4 h | 03 |
| 06 | 08_STEP_06_ML_M4_EXTINCTION_THRESHOLD.md | ml | 3 h | 03 |
| 07 | 09_STEP_07_ML_M5_ABSTENTION.md | ml | 2-3 h | 04, 06 |
| 08 | 10_STEP_08_EXPORT_AND_TS_INFERENCE.md | ml | 4 h | 04-07 |
| 09 | 11_STEP_09_INTEGRATE_MODELS_INTO_CONSOLE.md | ml | 4 h | 08 |
| 10 | 12_STEP_10_HELDOUT_ABSTENTION_EVAL.md | ml | 2 h | 09 |
| 11 | 13_STEP_11_QA_AND_HARDENING.md | ml | 3 h | 09 |
| 12 | 14_STEP_12_DOCS_AND_DISCLOSURE.md | ml | 2-3 h | 11 |
| 13 | 15_STEP_13_MERGE_CI_DEPLOY.md | main via PRs | 2 h | 12 |
| 14 | 16_STEP_14_DEMO_AND_SUBMISSION.md | main | 3 h | 13 |

Other files: 00_MASTER_PLAN.md (the full plan), 01_AGENT_RULES.md (strict rules),
17_REPORT_TEMPLATE.md, 18_FINAL_CHECKLIST.md, 19_REVIEW_FINDINGS.md (known problems to fix),
PROGRESS.md (agent keeps this updated).
