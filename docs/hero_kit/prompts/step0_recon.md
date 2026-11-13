STEP 0: RECON AND HONEST SCENARIO SCOUT (N = 0). Do not build UI. Do not change any existing source file.

1. Read how ResponseConsolePage.tsx (or the current equivalent) wires the simulator, detector arms, localizer, and sequencer. Summarize in 10 lines or fewer how to run a scenario headlessly and get: (a) per-zone sensor series, (b) per-detector alarm times, (c) the localization result, (d) sequencer events. Name the exact files and functions you verified by opening them.
2. Write a throwaway script (apps/web/scripts/scout_scenarios.ts or similar; it must not be imported by the app) that runs the deterministic simulator over every combination of habitat preset x fuel material x origin zone, for every detector arm that exists (Heuristic, SAME-R calibrated photoelectric, Trained ML). If the simulator has seeds or noise, run a small fixed set of seeds and report the spread.
3. Output a table to docs/hero_kit/reports/step0_scout.md with: scenario, alarm time per arm (or "no alarm"), gap between each pair of arms in seconds, and localization category (CLEAR / AMBIGUOUS / INSUFFICIENT_EVIDENCE or whatever the localizer actually returns).
4. Recommend 1 or 2 scenarios where the gap between a standard baseline arm and the SAME-R calibrated arm is clearly visible AND localization is CLEAR. Do NOT tune any parameter to create a gap. If the honest gap is small or negative in every scenario, say so plainly in the first line of your report.
5. State which arm is the best "naive baseline" to race against SAME-R, based on what detectors.ts actually implements, and the exact labels the UI currently uses for each arm.
6. Also report: does the simulator expose duct flow velocities and per-zone smoke/CO/temperature series at a fixed time step? Quote the type names and their fields.

Deliver: the script, step0_scout.md, and the step0 agent report.
