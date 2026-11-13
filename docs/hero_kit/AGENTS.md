## IGNIS Hero Kit rules (apply to every AI working in this repo)

Goal: build the cinematic 3D Station Demo version of the Fire Response Console (`/response`) and a 90-second Space Apps demo. Kit files live in `docs/hero_kit/`.

1. Read `PROJECT_CONTEXT.md` and `docs/hero_kit/DECISION.md` (if it exists) before working. Line citations in PROJECT_CONTEXT.md may be stale: open every file you rely on and verify names.
2. Protected, read-only logic: the fire simulator, detector arms, localizer, response sequencer, sim parameters, everything under `lib/fire/ml/`, the solid-fuel matcher, bundled model JSON, and anything under `data/`, `pipelines/`, `services/`. You may READ their outputs. If a task seems to need a change there, STOP and ask the owner.
3. Determinism: anything that affects results or the timeline-driven visuals uses a seeded PRNG and time `t` from the timeline. No `Math.random()` and no wall-clock time in render logic.
4. Honesty: keep "Simulated. Not flight software." visible. Any mention of the ML detector carries "Trained on Earth-gravity data. Not validated in microgravity." Use categorical states only (NOMINAL / ADVISORY / FIRE_ALARM / INSUFFICIENT_EVIDENCE). Never show risk percentages or false certainty. Respect the banned-term lists in `copy_lint.test.ts` and `fire_copy_lint.test.ts`; do not paste those terms into new code, copy, or docs.
5. Crewed mode never auto-releases suppression. A human confirmation is required.
6. Performance: one WebGL canvas alive at a time, DPR capped at 2, instancing or Points for particles, lazy-load the 3D scene, and a 2D fallback for reduced motion and weak devices.
7. Do not run `git commit`, `git push`, `git reset`, or `git checkout` on your own. The owner checkpoints with the kit scripts.
8. Before coding, state a short plan (files to touch, risks). After coding, run `npm test` and `npm run build` and report exactly what passed and failed. Never weaken, skip, or delete a test to make it pass.
9. Report honestly. If you could not verify something, say "NOT VERIFIED". Do not claim a visual looks right unless you actually rendered it.
10. Work on one kit step per conversation. Stay inside that step's scope.
