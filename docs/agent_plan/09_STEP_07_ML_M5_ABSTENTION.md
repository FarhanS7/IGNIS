# STEP 07: M5 Abstention (conformal / margin-based) and Calibration Check

Branch: `feature/fire-response-ml` | Depends on: Steps 04 and 06 | Est: 2-3 h | Approval gate: yes

## Objective
Make M2 and M4 able to say INSUFFICIENT_EVIDENCE, and check that the abstention behaves as claimed on held-out groups.

## Tasks
1. Implement `scripts/ml/m5_abstain/` with two methods: (a) margin-based abstention (abstain if the top-2 class score gap is below a threshold
   chosen on a calibration split), (b) split-conformal prediction sets with a group-aware calibration split. Choose the simpler one that works;
   keep both results in the report.
2. Calibration split must be groups disjoint from both train and test. Document it.
3. Evaluate on held-out groups: empirical coverage vs target (e.g., 90 %), abstention rate, accuracy on non-abstained cases vs overall, and
   how abstention behaves under cross-site shift (D1 -> D2). Exchangeability is violated across sites; state this and report observed coverage anyway.
4. Reliability check: a table (not a percentage shown to users) comparing predicted-score bins to observed frequency on held-out groups; Brier score for M2/M4.
5. Model cards of M2 and M4 get a new section "Abstention". If abstention does not improve non-abstained accuracy, say so.
6. Tests: abstention rule is deterministic; calibration groups disjoint; coverage computation verified on a toy example.

## Verification block
```powershell
python -m pytest scripts/ml/tests -q
python scripts/ml/m5_abstain/evaluate.py
npm test
```

## Acceptance criteria
- [ ] Coverage/abstention/accuracy table for M2 and M4, including cross-site
- [ ] Honest statement of whether abstention helps
- [ ] Cards updated; tests pass

## STOP conditions
No group-disjoint calibration set possible (too few groups): report and use margin-based only.
