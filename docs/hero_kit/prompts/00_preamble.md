CONTEXT
You are working in the IGNIS repo (NASA Space Apps project). Read PROJECT_CONTEXT.md first, then docs/hero_kit/DECISION.md if it exists. We are building a cinematic 3D "hero" version of the Fire Response Console (route /response) for a 90-second demo video AND the live app. Story: fire starts, smoke travels the ducts, sensors react, a standard detector races a SAME-R-calibrated detector, the source is localized, power is cut and vents isolated, the crew confirms suppression, the fire goes out. A viewer must understand it with sound OFF and without reading paragraphs.

HARD RULES
1. Do NOT change simulation or ML logic: the fire simulator, detector arms, localizer, response sequencer, sim parameters, anything under lib/fire/ml/, the solid-fuel matcher, bundled model JSON, or anything under data/, pipelines/, services/. We only READ their outputs. If something seems to require a change there, STOP and ask me.
2. Everything stays deterministic: no Math.random() and no wall-clock time in anything that affects results or visuals tied to the timeline. Use a seeded PRNG. The scene is a pure function of timeline time t.
3. Respect the copy-lint tests (copy_lint.test.ts, fire_copy_lint.test.ts). Do not use the banned overclaiming terms listed there, and do not show risk percentages. Categorical states only: NOMINAL / ADVISORY / FIRE_ALARM / INSUFFICIENT_EVIDENCE.
4. Crewed mode: suppression requires explicit human confirmation. Never auto-release.
5. Honesty badges stay visible: "Simulated. Not flight software." Any reference to the ML detector shows "Trained on Earth-gravity data. Not validated in microgravity."
6. Performance: one WebGL canvas alive at a time, DPR capped at 2, instancing or Points for particles, lazy-load the 3D scene, and a 2D fallback for prefers-reduced-motion and weak devices.
7. Verify every file path, function name, and type by opening it before relying on it. PROJECT_CONTEXT.md line citations may be stale.
8. Do NOT run git commit, git push, git reset, or git checkout. I checkpoint myself.
9. Do only the current step. Do not start the next one.
10. Never weaken, skip, or delete a test to make it pass.
11. Before coding, give me a short plan (files to touch, risks) and then implement without waiting.
12. When done, run `npm test` and `npm run build`, and report exactly what passed and failed. Anything you could not verify must be labeled NOT VERIFIED. Do not claim something looks right unless you actually rendered it.
13. Finish by writing docs/hero_kit/reports/step<N>_agent_report.md (N is the step number below) with: files created, files modified, what you verified and how, what you could not verify, open risks, and the exact commands to run the result.
