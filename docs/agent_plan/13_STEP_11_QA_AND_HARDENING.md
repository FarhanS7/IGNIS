# STEP 11: Full QA and Hardening

Branch: `feature/fire-response-ml` | Depends on: Step 09 (10 optional) | Est: 3 h | Approval gate: yes

## Tasks
1. Full test run, record counts: `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e --prefix apps/web`,
   `python -m pytest scripts/ml/tests -q`, `$env:PYTHONPATH="."; python -m pytest services/api/tests -q`, `python scripts/validate/grouped_loocv.py`.
2. Determinism: run the same scenario twice (same seed) in a unit test per detector and assert identical outputs; run Monte Carlo twice and assert identical results.
3. Guard tests (new, additive): fail the build if `apps/web/src` or README contain: "Spacecraft Atmosphere Monitor", "Halon", "92.42", "87.89", "84.4%", "77.5%",
   "flight-certified", "guaranteed", "100% safe", "predicts fire risk". Fail if any `literature:` tag id is missing from the registry; fail if any `trained:`/`calibrated:` tag lacks a model JSON + card.
4. Performance: record `npm run build` bundle sizes (largest chunks). The new models must add < 1 MB total. Monte Carlo (N=200) completes in < 10 s on this machine without freezing the UI. Report numbers.
5. Offline: with network disabled (or CloudFront blocked) the core app, /response, simulator, explorer, and Ask must work. Verify via the e2e offline spec and a manual check.
6. Mobile viewport: run Playwright with a 390x844 viewport on /response and /simulator; no horizontal scroll, controls reachable. Fix minimal CSS issues.
7. Accessibility: keyboard-only walk-through of /response (Tab order, Enter/Space on buttons); check contrast of alarm banner text; add `aria-live="polite"` to the alarm banner and event log if missing.
8. Security hygiene: `git grep -nEi "api[_-]?key|secret|token" -- . ':!node_modules' ':!package-lock.json'` and review each hit; no secrets committed; `.env` ignored.
9. Dependency check: `git diff origin/main -- apps/web/package.json requirements*.txt` contains no unexpected new packages.
10. Fix any defects found; one commit per fix.

## Acceptance criteria
- [ ] All suites green with real counts pasted
- [ ] Guard tests added and passing
- [ ] Performance + bundle numbers reported
- [ ] Offline, mobile, keyboard checks reported
- [ ] No secrets; no unexpected dependencies
