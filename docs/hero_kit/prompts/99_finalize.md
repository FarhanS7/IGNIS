STEP 99: UPDATE THE PROJECT CONTEXT WITH VERIFIED FACTS (N = 99). Documentation only. Do not change source code.

1. Run npm test, npm run build, and npm run test:e2e --prefix apps/web. Record the real pass counts. Do not copy counts from older docs.
2. Update PROJECT_CONTEXT.md: Feature Catalog (add the Station Demo hero view, the timeline engine, capture mode, the intro; mark the old console as the Inspect view), Frontend/UI (new routes, query params view=inspect and capture=1, components), Testing Strategy (new tests and real counts), Architecture (timeline precompute and the pure-function-of-t rendering rule), and Change Playbooks (how to add a new scenario to the demo; how to change a caption).
3. Fix the internal inconsistencies you find: the number of playbooks and features stated in summaries must match what is in the file. Count them.
4. Add a short "Volatile facts" section (test counts, commit hash, date, bundle size if available) so future updates touch one place.
5. For any citation of a file and line you touch, open the file and confirm it. Mark anything you could not confirm as UNVERIFIED.
6. Do not claim 100% confidence anywhere. Add a "Known unverified" list.
