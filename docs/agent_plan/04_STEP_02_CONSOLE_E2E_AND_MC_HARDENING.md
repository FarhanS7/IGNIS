# STEP 02: Console E2E Tests and Monte Carlo Hardening

Branch: `feature/fire-response-console` | Depends on: Step 01 approved | Est: 2-3 h | Approval gate: yes

## Objective
Add browser-level tests for the new page, make the Monte Carlo validation non-blocking and honest, then merge the
console branch into the ML branch.

## Tasks
### 2.1 Playwright setup (Playwright is already installed per the original audit; no config existed)
- `npx playwright install chromium`
- Create `apps/web/playwright.config.ts`: baseURL `http://localhost:4173`, `webServer` = `npm run build && npm run preview -- --port 4173`
  (use the repo's real preview script), chromium only, retries 1, trace on first retry.
- Add npm script `test:e2e` in apps/web/package.json. Do NOT add e2e to `npm test`.

### 2.2 E2E tests (`apps/web/e2e/`)
1. `routes.spec.ts`: all 12 routes load with HTTP 200 and no uncaught console errors: `/ /simulator /build /evidence /experiments /explorer /explore /stories/v2 /ask /gaps /about /response`.
2. `response.spec.ts` (all with fixed seed 42):
   - banner text present; no element text matches /\d+(\.\d+)?\s*%\s*(risk|confidence)/i.
   - start scenario (ISS-like, silicone, fusion detector, CREWED) -> alarm state appears; a zone is highlighted.
   - sequencer shows steps; suppression step in CREWED mode requires clicking confirm; override button works; event log updates.
   - switch to UNCREWED -> autonomous suppression happens only after the timeout (use the fast-forward control).
   - lunar habitat -> banner about unvalidated partial gravity visible; localizer shows INSUFFICIENT_EVIDENCE.
   - parameter tags visible; Monte Carlo opens and shows the "design-consistency check, not validation" label.
3. `integration.spec.ts`: Simulator page shows "Run fire response" link and it navigates to /response with the scenario;
   Research Gaps page shows the response-gaps card; About page shows the methodology section; no existing nav item was removed.
4. `offline.spec.ts`: block requests to `*.cloudfront.net` and assert the landing page still renders the fallback gradient.

### 2.3 Monte Carlo hardening
- Move the Monte Carlo run off the main thread (Web Worker via Vite `new Worker(new URL(...), { type: 'module' })`) OR run in
  async chunks of <= 20 runs with `await` between chunks and a progress bar. UI must stay responsive.
- Default N = 200; selectable 100 / 200 / 500. Fixed seed; same seed -> identical output (test it).
- Robustness sweep: for each param with min/max, sample 5 values; report whether fusion beats baseline on (a) mean detection
  delay (b) nuisance false-alarm rate (c) localization top-1 EACH across the sweep, as "holds in X of Y settings".
  If the ranking flips anywhere, the UI must say so in plain words. Add a unit test constructing a case where it flips.
- Label stays: "Design-consistency check on simulated data. Not validation. Parameters illustrative."

### 2.4 CI
Extend `.github/workflows/ci.yml` (do not remove existing steps): add a job `e2e` that runs
`npx playwright install --with-deps chromium` and `npm run test:e2e --prefix apps/web`. Upload the Playwright report as an artifact on failure.

### 2.5 Merge into the ML branch
```powershell
git push
git switch feature/fire-response-ml
git merge --no-ff feature/fire-response-console -m "merge: bring fire response console into ml branch"
npm test
npm run build
git push
```
Resolve conflicts by keeping BOTH sides. Report any conflict.

## Verification block
```powershell
npm test
npm run build
npm run test:e2e --prefix apps/web
git status
```

## Acceptance criteria
- [ ] 4 e2e spec files pass locally (paste counts)
- [ ] Monte Carlo does not freeze the UI (describe how verified)
- [ ] Sweep reports "holds in X of Y" and flips are shown
- [ ] CI e2e job added
- [ ] Console merged into ml branch, tests + build green there
- [ ] Unit test count >= previous

## STOP conditions
Playwright cannot launch; any existing route fails; merge conflict you cannot resolve by keeping both sides.
