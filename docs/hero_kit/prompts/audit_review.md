AUDIT REVIEW (second opinion). You are a skeptical reviewer who did not write this code. Do NOT change any file except creating docs/hero_kit/reports/audit_<date>.md.

Review everything changed since the last hero checkpoint (use `git diff` against the latest hero-step-N tag, or hero-baseline if none) and check:

1. Protected files untouched (simulator, detectors, localizer, sequencer, sim params, ML, matcher, model JSON, data, pipelines, services).
2. Determinism: any Math.random, Date.now, performance.now, or unseeded randomness that affects timeline-driven visuals or results. Is every visual a pure function of t?
3. Honesty: "Simulated. Not flight software." always visible; Earth-gravity caveat next to anything involving the ML arm; no false certainty (AMBIGUOUS and INSUFFICIENT_EVIDENCE states handled); no numbers on screen that are hard-coded instead of read from the timeline; the illustrative Earth-vs-orbit label present.
4. Human gate: can suppression be released in crewed mode without confirmation by seeking, replaying, keyboard, or capture mode?
5. Copy-lint: banned terms or risk percentages in new copy.
6. Performance and resources: more than one WebGL context alive, missing disposal of geometries, materials, and textures, per-frame allocations, unbounded particle counts, DPR above 2.
7. Accessibility: reduced motion, keyboard operation, aria-live announcements, contrast of captions over the 3D scene.
8. Tests: are the new tests meaningful or trivially passing? Any weakened or skipped tests?

For every finding give: severity (High/Med/Low), file and line (opened and verified), the failure scenario, and a suggested fix. Run npm test and npm run build and report the real results. List what you could not verify. If you find nothing in a category, say what you checked, not just "none".
