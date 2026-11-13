# Review Findings to Resolve (from Claude's review of the agent reports)

Each item must be answered in the Step 01 report as: FIXED (commit) / NOT AN ISSUE (evidence) / NEEDS HUMAN.

1. **Approval gate skipped.** Only Stage 2 was approved; the agent also built Stages 3-5 (sequencer, binder, UI, integrations) in one run. Everything built after Stage 2 is unreviewed.
2. **Possible mis-attributed literature tag.** `photoelectric_small_particle_penalty` is tagged `literature:NTRS-20130000422` (SAME-2 particle size/morphology). The detector-response claim (ISS photoelectric detector responds poorly to small Kapton/Teflon particles) may come from PMC7918997 or NTRS 20205008167. Verify by reading; re-point or retag `illustrative`.
3. **Other literature tags**: `nuisance_dust_peak_obscuration` (NTRS-20210022143) and the comment "pp. 1-8". Verify real pages or remove.
4. **Registry may contain claims not opened by the agent.** The log shows web searches, not evidence the PDFs were read. Verify each entry.
5. **Baseline alarm threshold.** `baseline_smoke_alarm_threshold` is illustrative (2.5 %/m). One patent describes an ISS spec as 1 %/ft (about 3.3 %/m); unverified. Keep `illustrative` and add a note; do not tag literature without reading a NASA source.
6. **No SMAC-as-alarm language.** Confirm no rationale text uses toxicity limits (SMAC / NASA-STD-3001) as fire-alarm thresholds.
7. **Test runner brittleness.** `package.json` was edited file by file to add each test. Add the registry test (Step 01.2).
8. **Test count discrepancy.** Phase 0 reported 96; the merged console branch reported 98. Explain.
9. **Monte Carlo**: default N and UI blocking; circularity (baseline weak on small particles by construction; nuisance without CO by construction). Needs robustness sweep with "holds in X of Y" and visible flips.
10. **Evidence chips**: verify run ids exist; verify the circularity caveat is displayed; verify no general claim that shutting off ventilation extinguishes fires.
11. **Partial gravity**: lunar preset must show the unvalidated banner and abstain (INSUFFICIENT_EVIDENCE).
12. **Temporary scripts** (`update_simulator.cjs`, `update_gaps.cjs`, `update_about.cjs`, `update_readme.cjs`, `apply_*`): confirm none were committed.
13. **Units / cadence mismatch (design risk for ML)**: simulator emits obscuration %/m, CO ppm, temperature at 2 Hz; the Earth datasets use particulate mass concentration at ~10 s cadence. Models must use unit-free, background-normalized features and the TS detector must resample (Step 04, 08).
14. **Phase 0 follow-up**: the abstention rule was tuned and tested on the same 30 questions; a held-out test is required (Step 10) before claiming 100 %.
15. **CI/environment**: confirm CI is green on `fix/phase0-integrity` (pinned requirements came from local Python 3.13 / numpy 2.3.3).
16. **Placeholders**: `<ADD LIVE URL>`, `<CONFIRM API MODEL>`, LICENSE copyright line, AI-tool disclosure facts. Human must resolve.
17. **Dataset licenses for the Mendeley Fire datasets** were not confirmed; attribution is mandatory if CC BY.
18. **Eligibility**: human must confirm the 2026 Terms on pre-event work.
