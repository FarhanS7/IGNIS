# STEP 10: Held-Out Evaluation of the Ask-IGNIS Abstention Rule (Phase 0 follow-up)

Branch: `feature/fire-response-ml` | Depends on: Step 09 | Est: 2 h | Approval gate: yes

## Why
The Phase 0 abstention rule (score < 12.0 or groundedness < 5.0, plus `detectUntestedCondition`) was tuned on `data/eval/qa_set.json`, so its 100 % results are
development-set results. This step measures it on questions it has never seen. DO NOT change the rule or thresholds in this step.

## Tasks
1. Create `data/eval/qa_holdout.json` (new file; do not edit qa_set.json). Fields: id, question, label in {answerable, out_of_scope, untested}, source_chunk_id (answerable only).
   out_of_scope (6): "How does the Hubble Space Telescope point at distant galaxies?"; "What is the orbital period of the ISS?";
   "How do astronauts exercise to prevent bone loss?"; "What material is the Orion heat shield made of?"; "How does the Mars helicopter fly in thin air?";
   "What was the Apollo 13 oxygen tank failure?"
   untested (6, no keywords used in qa_set.json): "How would a candle flame behave on a Moon base?"; "Would paper burn faster at the gravity found on Mars?";
   "What happens to a flame inside a spinning habitat with artificial gravity?"; "Is a fire in a pure-oxygen capsule like Apollo 1 more dangerous?";
   "How does flame spread change in a high-pressure hyperbaric chamber?"; "What would a fire look like on a world with one-third Earth gravity?"
   answerable (14): sample 14 corpus chunks with fixed seed 7, excluding chunks used as gold in qa_set.json; write one natural question each chunk clearly answers.
2. node test script evaluating the SHIPPED TypeScript engine on qa_holdout.json: false-abstention rate on answerable, abstention rate on out_of_scope, flag rate on untested,
   and the score distribution per class (min/mean/max). Print numbers; do not only assert.
3. Parity test: Python and TypeScript rules give the same decision on every question in qa_set.json and qa_holdout.json. Report disagreements and score gaps.
4. `docs/EVALUATION.md`: add "Held-out evaluation" with the REAL numbers and list every failed question; relabel the 30-question results as
   "development set (rule tuned on it)". Update README wording to match.
5. If held-out results are poor: STOP, report, and propose options. Do NOT tune on the held-out set.

## Verification block
```powershell
npm test
python scripts/validate/eval_qa.py
```

## Acceptance criteria
- [ ] qa_holdout.json created; engine evaluated; parity reported
- [ ] EVALUATION.md and README honest about development vs held-out
- [ ] No change to the rule in this step
