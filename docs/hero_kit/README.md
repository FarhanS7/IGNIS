# IGNIS Hero Kit

A step-by-step system for building the cinematic 3D "Station Demo" version of the Fire Response Console, plus the 90-second Space Apps video, using Antigravity.

You do not write prompts. The scripts put the right prompt on your clipboard, check the result, and save a checkpoint you can roll back to.

---

## What you get

```
ignis-hero-kit/
  README.md                 this file
  QUICKSTART.md             the commands, in order
  AGENTS.md                 permanent rules for any AI working in the repo
  PROGRESS.md               tracker: tick off each step
  CHECKLISTS.md             what "done" means for each step (you check by eye)
  TROUBLESHOOTING.md        when the AI drifts, breaks tests, or gets stuck
  RECORDING.md              how to record the final video
  SHOT_LIST.md              the 90-second shot list and every caption
  reference/station_live_demo.html  working demo of the target look and behavior (toy engine)
  prompts/
    00_preamble.md          shared context (auto-added by run_step)
    step0_recon.md          find an honest scenario, change nothing
    step0b_lock_decision.md lock the race pairing after Step 0
    step1_timeline_shell.md timeline engine + new page shell + clocks + captions
    step2_station_3d.md     3D station, flame, smoke, sensors
    step3_localize_alarm.md rings, reticle, alarm, camera fly-to, race result
    step4_containment_gate.md power cut, vents, hold-to-confirm, suppression
    step5_earth_vs_orbit.md the opening (flame morph + split screen)
    step6_capture_polish.md capture mode, proof shot, mobile, e2e, docs
    99_finalize.md          update PROJECT_CONTEXT.md with verified facts
    fix_failures.md         paste when tests/build fail
    audit_review.md         skeptical second-opinion review of a step
    optional/
      fix_about_metrics.md        replace stale 92.4% / 77.5% numbers
      fix_abstention_threshold.md align Ask IGNIS abstention with the benchmark
      verify_context_citations.md check PROJECT_CONTEXT.md line citations
      check_llm_endpoint.md       check the Gemini model in api/ask.ts
  scripts/                  PowerShell (Windows)
    install.ps1             one-time setup in your repo
    run_step.ps1            copies a prompt to your clipboard
    verify.ps1              runs tests/build and safety checks, writes a report
    checkpoint.ps1          commits + tags a finished step
    rollback.ps1            returns to an earlier checkpoint
  templates/
    step_report_template.md what to send back to me after each step
```

---

## One-time setup (5 minutes)

1. Unzip this folder anywhere (for example `Downloads\ignis-hero-kit`).
2. Open PowerShell in that folder.
3. Make sure your repo has no uncommitted work you care about (`git status`). Commit or stash it first.
4. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -RepoPath "E:\IGNIS"
```

This will:
- copy the kit into `E:\IGNIS\docs\hero_kit\`
- add the kit rules to `E:\IGNIS\AGENTS.md` (appends if the file exists; never overwrites) and to `.agent\rules\` as a workspace rule (extra safety; the pasted prompt is what we rely on)
- commit the kit as "chore: add IGNIS hero kit"
- create the branch `feature/hero-station`
- create the tag `hero-baseline` (the verify script compares against this tag)

From now on, work from the repo:

```powershell
cd E:\IGNIS
```

---

## The loop (repeat for each step)

For every step N from 0 to 6:

1. **Open a NEW Antigravity chat/conversation** with `E:\IGNIS` as the workspace. One step per chat. If your Antigravity has a planning mode, use it.
2. **Copy the prompt:**
   ```powershell
   .\docs\hero_kit\scripts\run_step.ps1 -Step 1
   ```
   The prompt (preamble plus step) is now on your clipboard. Paste it into the chat and send.
3. **Let the agent finish.** If it asks a question you cannot answer, reply "use your best judgment and tell me what you chose."
4. **Verify:**
   ```powershell
   .\docs\hero_kit\scripts\verify.ps1 -Step 1
   ```
   Add `-E2E` for steps 1, 3, 4 and 6, and `-Python` for step 6. It prints PASS or FAIL for each check and writes `docs\hero_kit\reports\step1_verify.txt`.
5. **If anything FAILS:** run `.\docs\hero_kit\scripts\run_step.ps1 -Prompt fix_failures`, paste it into the same chat, then paste the failing output underneath.
6. **Look at it in the browser** (`npm run dev`, open `/response`) and tick the step in `CHECKLISTS.md`. Do not skip this. Tests do not tell you whether it looks good.
7. **Checkpoint:**
   ```powershell
   .\docs\hero_kit\scripts\checkpoint.ps1 -Step 1 -Message "timeline engine and page shell"
   ```
8. **Send me the report** (see `templates/step_report_template.md`). I will read it and tell you whether to proceed or fix something first.

Then move on to the next step in a fresh chat.

---

## The order

| # | Prompt | Verify flags | What you should see afterwards |
|---|--------|--------------|--------------------------------|
| 0 | step0_recon | none | A table of scenarios and an honest answer about the race gap. No UI change. |
| 0b | step0b_lock_decision (use `-Note "your choice"`) | none | The race pairing and default scenario written to `docs/hero_kit/DECISION.md`. |
| 1 | step1_timeline_shell | `-E2E` | New hero page that autoplays with clocks, captions, scrubber. Old console behind "Inspect". |
| 2 | step2_station_3d | none | 3D station with flame, smoke in ducts, pulsing sensors. |
| 3 | step3_localize_alarm | `-E2E` | Rings converge, reticle locks, red alarm, camera flies in, race gap number. |
| 4 | step4_containment_gate | `-E2E` | Power cut, vents snap shut, hold-to-confirm, flame dies. |
| 5 | step5_earth_vs_orbit | none | The opening: flame morph and the Earth vs orbit split. |
| 6 | step6_capture_polish | `-E2E -Python` | Capture mode, proof shot, mobile, e2e specs. |
| 99 | 99_finalize | none | PROJECT_CONTEXT.md updated with verified counts. |

**Do Step 0 and 0b first, and do not start Step 1 until the race decision is made.** If Step 0 shows the honest gap is small, the pitch changes, and I would rather we find out before building.

You can stop after any step and still have a working app, because each step is committed on its own.

---

## Optional fixes (recommended before submission)

These are bugs your own audit found. They are small and independent, so run them in their own chats any time, using `run_step.ps1 -Prompt <name>`:

- `fix_about_metrics`: the About page still shows the retracted 92.4% and 77.5% figures. This contradicts your own audit and is the most damaging inconsistency for a project built on honesty.
- `fix_abstention_threshold`: the web client abstains at 0.35 while the benchmark used 18.0, so the claimed abstention rate does not describe the shipped app.
- `verify_context_citations`: confirms the line citations in PROJECT_CONTEXT.md are real.
- `check_llm_endpoint`: checks whether the Gemini model name in `api/ask.ts` is still valid.

---

## Safety nets built into this system

- **Protected files:** `verify.ps1` fails if the simulation, detectors, localizer, sequencer, ML models, matcher, or processed data have changed since `hero-baseline`.
- **Banned words and non-determinism:** it scans new code for the overclaiming terms the project bans, and flags `Math.random` and `Date.now` for review.
- **Checkpoints:** every finished step is tagged `hero-step-N`. `rollback.ps1 -Step N` returns you there.
- **No auto-commits by the AI:** the rules tell the agent not to run git commit, push or reset. You decide what is saved.

## Honest limits of this kit

- The scripts are written for Windows PowerShell 5.1 or PowerShell 7. They were not run against your machine, so if one errors, read the message, fix the path, and tell me; do not work around the verification.
- The kit does not know your exact file names. Every prompt tells the agent to open files and verify names before using them.
- Antigravity can still drift. `TROUBLESHOOTING.md` covers the usual cases.
- Passing tests does not mean it looks good. Your eyes are the real check at every step.
