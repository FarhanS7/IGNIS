VERIFY PROJECT_CONTEXT.md. Documentation only. Do not change source code.

1. Extract every `file:line` or `file:Lx-y` citation and every specific claim about a function, constant, route, or number in PROJECT_CONTEXT.md. For each one, open the file and check it. Produce a table: claim, file, result (CONFIRMED / WRONG LINE / WRONG CLAIM / FILE MISSING), and the corrected value.
2. Fix every wrong citation in PROJECT_CONTEXT.md. Use function or constant names as anchors, not only line numbers, so they survive edits.
3. Re-count and correct internal inconsistencies: the number of features listed vs. stated, the number of change playbooks listed vs. stated, test counts (run every suite for real, including Playwright).
4. Replace any "100%" confidence statements with an honest statement of what was verified and how.
5. Write the table to docs/hero_kit/reports/context_audit.md. Do not run git commit or push.
