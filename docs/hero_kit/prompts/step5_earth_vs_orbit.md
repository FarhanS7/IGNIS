STEP 5: EARTH VS ORBIT OPENING (N = 5). Build a short opening for the first ~16 seconds.

1. Beat 1 (0-8 s): a single flame. Teardrop at 1 g; a gravity value animates to 0 g and the flame morphs into a quiet sphere. Reuse FlameScene and flameParams.ts. Caption: "Fire in space is different."
2. Beat 2 (8-16 s): split screen, same fire in the same room. Left "Earth": smoke rises to the ceiling and reaches a detector, which turns red. Right "Orbit": smoke hangs near the source and the detector stays green. Caption: "On Earth, smoke rises. Here, it doesn't."
3. This is a stylized illustration, not a simulation. Show a small "illustrative" label. Use a 2D canvas or a lightweight separate canvas, and unmount it before the station scene mounts so only one WebGL context is alive at a time.
4. A visible "Skip intro" button. The intro plays once per session (sessionStorage inside try/catch; the page must work if storage throws). A "Replay intro" control is available from the page menu.
5. Hand off to the station reveal with a smooth camera glide, then auto-run the main timeline.
6. Under prefers-reduced-motion, show static before/after frames instead of animation, with the same captions.
7. All motion is a pure function of an intro clock; no Math.random() (use a seeded PRNG).

Tests: the intro unmounts its canvas before the station mounts (only one canvas in the DOM after handoff); skip works; sessionStorage failure does not break the page.

VISUAL REFERENCE: docs/hero_kit/reference/station_live_demo.html is a working demo of the target look and behavior (open it in a browser, click around, read its code). Its simulation, detectors and ML are small stand-ins written for the demo, with made-up parameters. Match its look, layout and interaction, but drive everything from IGNIS's real simulator, detectors and localizer, never from the demo's numbers.
