# Quickstart (copy these, in order)

```powershell
# 1. One-time (from the unzipped kit folder)
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -RepoPath "E:\IGNIS"
cd E:\IGNIS

# 2. Step 0: scout. Paste the clipboard into a NEW Antigravity chat.
.\docs\hero_kit\scripts\run_step.ps1 -Step 0
.\docs\hero_kit\scripts\verify.ps1 -Step 0
.\docs\hero_kit\scripts\checkpoint.ps1 -Step 0 -Message "scout"
#    -> send me docs\hero_kit\reports\step0_scout.md and we pick the race.

# 3. Step 0b: lock the decision (put your choice in the note)
.\docs\hero_kit\scripts\run_step.ps1 -Step 0b -Note "Race Heuristic vs SAME-R on <scenario>"
.\docs\hero_kit\scripts\verify.ps1 -Step 0b
.\docs\hero_kit\scripts\checkpoint.ps1 -Step 0b -Message "race decision"

# 4. Steps 1-6: same three commands each time (new chat per step)
.\docs\hero_kit\scripts\run_step.ps1 -Step 1
.\docs\hero_kit\scripts\verify.ps1 -Step 1 -E2E
.\docs\hero_kit\scripts\checkpoint.ps1 -Step 1 -Message "timeline and shell"
#    steps 3 and 4 also use -E2E; step 6 uses -E2E -Python

# 5. Finish
.\docs\hero_kit\scripts\run_step.ps1 -Step 99
```

If verify says FAIL: `run_step.ps1 -Prompt fix_failures`, paste, then paste the failing output under it.
Go back: `rollback.ps1 -Step 2`. Record the video: see RECORDING.md.
