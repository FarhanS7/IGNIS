# STEP 13: Merge, CI, Release, Deploy

Branches: `fix/phase0-integrity` -> `main`, then `feature/fire-response-ml` -> `main` | Depends on: Step 12 | Est: 2 h | Approval gate: yes
Some actions are HUMAN actions (GitHub UI, Vercel). The agent prepares and verifies; the human clicks merge.

## Preconditions (agent)
```powershell
git fetch origin
git switch feature/fire-response-ml
git status -sb                      # clean and pushed
npm test; npm run build; npm run test:e2e --prefix apps/web
python -m pytest scripts/ml/tests -q
```
All green or STOP.

## Part A: merge Phase 0 into main (human + agent)
1. Agent: confirm CI is green on `fix/phase0-integrity` (GitHub Actions tab or `gh run list --branch fix/phase0-integrity --limit 3` if `gh` is installed).
2. HUMAN: open a PR `fix/phase0-integrity` -> `main` on GitHub. Title: "Phase 0 integrity fixes". Body: paste the Phase 0 report.
   Merge with a MERGE COMMIT (not squash) after CI is green.
3. Agent:
```powershell
git fetch origin
git switch feature/fire-response-ml
git merge origin/main
```
   Resolve conflicts by keeping BOTH sides. Typical files: .gitignore, README.md, package.json, ci.yml. Re-run all tests and the build. Push.

## Part B: merge the feature work into main
1. Agent: `git log --oneline origin/main..HEAD` -> paste. Run the full verification again.
2. HUMAN: open PR `feature/fire-response-ml` -> `main`. Title: "Fire Response Console + real-data ML (simulation, not flight software)".
   Body: summary, honesty table, test counts, link to docs/FIRE_RESPONSE.md and docs/LIMITATIONS.md.
3. CI must be green (node tests, build, e2e, ML pytest, grouped_loocv). Merge with a merge commit.
4. Agent after merge:
```powershell
git switch main
git pull origin main
npm ci --prefix apps/web
npm test
npm run build
```
   Tag and push:
```powershell
git tag -a v1.0.0-spaceapps2026 -m "Space Apps 2026 submission build"
git push origin v1.0.0-spaceapps2026
```
5. Keep the old branches (do not delete them). `docs/BRANCHING.md` stays accurate: update it in the PR if needed.

## Part C: deploy (human)
1. Vercel: import the GitHub repo (or use the existing project). Root = repo root; the committed `vercel.json` already sets the build command and rewrites.
2. Environment variables: none required (LLM endpoint is disabled in the UI). Do NOT add API keys unless the human decides to enable that feature.
3. Production deploy from `main`. Copy the live URL.
4. Agent (separate small PR or direct docs commit if branch protection allows): replace `<ADD LIVE URL>` in README with the real URL (human provides). Commit `docs: add live demo url`.

## Part D: live verification (agent, using the live URL)
Open each route on the live URL and confirm HTTP 200 and no console errors: `/ /simulator /experiments /explore /stories/v2 /ask /gaps /about /response`.
Run `npx playwright test --config=apps/web/playwright.config.ts` with baseURL overridden to the live URL for `routes.spec.ts` and `response.spec.ts` (use an env var; do not hardcode).
Record the results.

## Acceptance criteria
- [ ] PR 1 merged (Phase 0), PR 2 merged (features), CI green on main
- [ ] Tag pushed; main builds from a clean clone (`git clone` into a temp folder, `npm ci`, `npm test`, `npm run build`)
- [ ] Live URL works; e2e smoke passes against it
- [ ] README has the real URL

## STOP conditions
CI red; merge conflict not resolvable by keeping both sides; clean-clone build fails.
