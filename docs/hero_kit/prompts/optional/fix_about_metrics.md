FIX STALE VALIDATION NUMBERS. Independent of the hero build. Read PROJECT_CONTEXT.md and AGENTS.md rules first.

Background: the project's own Phase 0 audit retracted earlier cross-validation figures (92.4% accuracy and 84% extinction recall, which were inflated by hardware sample leakage in ungrouped CV). The audited figures reported in PROJECT_CONTEXT.md are 80.30% overall accuracy and 48.00% extinction recall under grouped leave-one-group-out CV (110 hardware groups), with a McNemar test p = 1.0 against a single oxygen-threshold rule. The About page and the simple result panel still appear to show the old figures (about 92.4% and 77.5%).

1. Do NOT trust the numbers above. Find the audit source of truth in the repo (docs, reports, eval outputs, DECISIONS.md) and confirm the exact current figures and what they measure. Quote the file you took them from.
2. Search the whole repo (source, data, docs, tests, e2e) for every occurrence of the old figures (92.4, 92.42, 77.5, 84%, and close variants). List each occurrence with file and line.
3. Update user-facing copy so every displayed validation number matches the audited source, and every such number states what it measures (grouped CV, number of groups) and the limit (no statistically significant gain over a single oxygen threshold; extinction recall is limited). Keep the tone honest, and never present the matcher as a predictor.
4. Do not change model files or evaluation code. Update tests and e2e text assertions that referenced the old numbers, and add a regression test that fails if a retracted figure reappears in user-facing source.
5. Respect the copy-lint tests. Run npm test and npm run build and report real results.
6. Do not run git commit or push.
