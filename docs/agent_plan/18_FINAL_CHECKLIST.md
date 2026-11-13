# Final Checklist (Definition of Done)

## Code and tests
- [ ] `npm test` green (count recorded; >= 157 + new tests)
- [ ] `npm run lint` clean
- [ ] `npm run build` exit 0
- [ ] `npm run test:e2e --prefix apps/web` green (routes, response, integration, offline)
- [ ] `python -m pytest scripts/ml/tests -q` green; `PYTHONPATH=. pytest services/api/tests` green; `python scripts/validate/grouped_loocv.py` -> 80.30 / 46.72 / 48.00
- [ ] TS/Python parity <= 1e-6 for every shipped model (max error recorded)
- [ ] CI green on main (node, build, e2e, ml, loocv)
- [ ] Clean-clone build passes

## Honesty
- [ ] No percentage risk/confidence in the UI; categories only
- [ ] Banner "Simulated sensor data. Not flight software." always visible on /response
- [ ] Every parameter tagged; every `literature:` id verified in the registry with real page refs
- [ ] Every trained/calibrated element shows its datasets and "Not validated in microgravity"
- [ ] M4 shows "Droplet flames ... Not cabin solid fuels."
- [ ] Monte Carlo labelled "design-consistency check, not validation"; flips shown
- [ ] Story v2 chart labelled illustrative; stale 92.42 / 87.89 / 84.4 / 77.5 numbers gone
- [ ] Negative results documented (models/abstention that did not beat baselines)

## Data and legal
- [ ] ml_manifest.json: source URL, DOI, license, access date, SHA-256 for every dataset
- [ ] Attribution in README and About; no raw data committed; no synthetic data presented as real
- [ ] LICENSE present; copyright holder confirmed; AI-tool disclosure completed by the human

## Delivery
- [ ] PRs merged; tag v1.0.0-spaceapps2026 pushed
- [ ] Vercel live URL works on all routes; README links it
- [ ] Demo video recorded and linked; docs/SUBMISSION.md complete
- [ ] Human confirmed Space Apps 2026 terms about pre-event work and submission fields
