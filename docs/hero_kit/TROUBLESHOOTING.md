# Troubleshooting

## verify.ps1 says FAIL on protected files
The agent edited simulation, detector, localizer, sequencer, ML, matcher, or data files. Do not accept it.
1. Run `git diff hero-baseline -- <file>` to see the change.
2. If it was accidental: `git checkout hero-baseline -- <file>` and ask the agent to continue without touching it.
3. If it is a tiny export or type addition you approve: re-run `verify.ps1 -AllowProtected` and write the reason in PROGRESS.md.

## Tests or build fail
Run `run_step.ps1 -Prompt fix_failures`, paste into the same chat, then paste the failing output under it. If it fails twice, run `audit_review` in a fresh chat for a second opinion.

## The agent invents file names or functions
Tell it: "Open the file and verify the name before using it. Show me the path." The prompts already say this, but agents drift on long tasks.

## The agent tries to do two steps at once
Stop it: "Only do the current step. Revert anything outside its scope." Then re-run verify.

## The agent says it is done but nothing changed visually
Ask for the exact URL and a description of what appears at t=0, t=30s, and at the alarm. If it cannot describe them from an actual render, it did not verify. Do your own eye-check.

## The 3D scene is slow
- Check DPR is capped at 2.
- Particle count: ask the agent to halve it and measure with the PerfOverlay.
- Confirm only one canvas is mounted.
- Test on your weakest device; the 2D fallback must still tell the story.

## The race gap is tiny or negative
This is a finding, not a bug. Do not tune parameters. Send me the Step 0 table and we decide: a different scenario, a different pair of arms, or a different pitch.

## copy-lint tests fail on a kit file
The project lint may scan markdown under docs. Do not paste banned terms into kit files. If it still fails, move `docs/hero_kit` out of the scanned folder or add it to the lint ignore list, and tell the agent exactly why.

## PowerShell blocks the scripts
Run them as `powershell -ExecutionPolicy Bypass -File .\docs\hero_kit\scripts\run_step.ps1 -Step 1`.

## Clipboard prompt is huge or the chat rejects it
Run `run_step.ps1 -Step N -Print` to write the prompt to `docs/hero_kit/reports/last_prompt.md` and attach or open that file in the chat with "Follow the instructions in this file."

## Antigravity forgets rules mid-way
Start a fresh chat for each step. The prompt carries the rules each time.

## Something broke and you want to go back
`rollback.ps1 -Step 2` returns to the step 2 checkpoint (and saves a backup branch of where you were).
