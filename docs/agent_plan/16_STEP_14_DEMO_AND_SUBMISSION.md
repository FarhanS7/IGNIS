# STEP 14: Demo, Freeze, and Submission Package

Branch: `main` (docs only, via small PRs) | Depends on: Step 13 | Est: 3 h | Approval gate: yes

## Human decisions first
- Re-read the official Space Apps 2026 Project Submission Guide and Judging guide on spaceappschallenge.org. Check: submission window (opens Nov 14),
  required fields, video length limits, whether prior work is allowed, AI-use disclosure requirements, repository/licence requirements.
- Fill every `<CONFIRM>` placeholder (AI tools used, Gemini model line, copyright holder).

## Tasks (agent)
1. Create `docs/DEMO_SCRIPT.md` with a timed script (target 90 s, hard max 3 min). Required arc:
   - 0:00 Problem in one line: "NASA flew fire experiments in freefall; mission teams need that evidence turned into action."
   - 0:10 Simulator -> real flight evidence match (existing IGNIS core), provenance drawer (row + DOI).
   - 0:30 Honest limits: switch to lunar gravity; show the "outside NASA's tested range" warning.
   - 0:45 Fire Response Console: start scenario, alarm, zone highlight, response timeline (crewed vs uncrewed), override.
   - 1:05 Evidence chips on a response step (with the circularity caveat); suppression insight with the droplet-flame caveat.
   - 1:15 Trust: model card + held-out metrics + "Not validated in microgravity"; Monte Carlo as design-consistency check.
   - 1:25 Close: "AI is not the source of truth. NASA flight data is."
   Do NOT demo anything that has not been verified (Story v2 telemetry chart is labelled illustrative; avoid dwelling on it).
2. Rehearsal checklist `docs/DEMO_CHECKLIST.md`: browser zoom, seed 42 fixed scenarios, a second browser profile with cache cleared, backup screen recording, offline fallback.
3. `docs/SUBMISSION.md`: one-page project summary (150 words), 5 bullets "what is new this hackathon", links (live URL, repo, video), team members `<CONFIRM>`,
   data sources with DOIs, tools used (including AI tools, `<CONFIRM>`), limitations, and a table mapping the five judging criteria to concrete evidence in the repo.
4. Make a clean clone check: `git clone https://github.com/FarhanS7/IGNIS.git $env:TEMP\ignis-check` then `npm ci --prefix apps/web`, `npm test`, `npm run build` all pass.
5. Final freeze: `git tag -a v1.0.1-freeze -m "Freeze before hackathon"` only after the human approves.

## HUMAN deliverables
- Record the demo video from the live URL (screen recording; narrate the script; show limitations visibly). Upload (YouTube unlisted OK) and add the link to README.
- Submit on the Space Apps site following the official guide.

## Acceptance criteria
- [ ] Demo script + checklist + submission doc exist
- [ ] Clean clone passes tests/build
- [ ] No `<CONFIRM>` left (agent prints the remaining list; human resolves)
- [ ] Video link in README
