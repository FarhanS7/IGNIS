ALIGN ASK IGNIS ABSTENTION WITH THE BENCHMARK. Independent of the hero build. Read PROJECT_CONTEXT.md and AGENTS.md rules first.

Background: PROJECT_CONTEXT.md reports that the Ask IGNIS client abstains below a score of 0.35 (around AskContext.tsx), while the benchmark script (eval_qa.py) abstains below 18.0, so the documented abstention rate may not describe the shipped app. Those two numbers might be on different score scales, so do NOT just copy one into the other.

1. Open the client retrieval code and the benchmark code. Determine exactly what score each threshold applies to (raw BM25, normalized, per-chunk, per-query) and whether the scales are comparable. Explain in a few lines.
2. Reproduce the benchmark through the same scoring path the web client uses (or add a parity test that proves both paths score identically). Measure the real abstention rate on the out-of-scope questions with the client's actual threshold.
3. If the shipped behavior does not meet the documented claim, propose a threshold and show the measured trade-off (answered in-scope questions lost vs. out-of-scope questions abstained). Choosing the threshold is the owner's decision: present the numbers and a recommendation, and wait for my answer before changing the shipped value.
4. Update docs/EVALUATION.md so its claims describe the shipped behavior, not a different pipeline.
5. Run npm test, the relevant Python tests, and npm run build; report real results. Do not run git commit or push.
