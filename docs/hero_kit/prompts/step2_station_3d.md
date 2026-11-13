STEP 2: THE 3D STATION: FLAME, SMOKE, SENSORS (N = 2). Replace the stage placeholder from Step 1 with a react-three-fiber scene.

1. Station: a cutaway of the active habitat (read the habitat data for zones, ducts, volumes). Each zone is a translucent module with a dark interior and a thin glowing outline; ducts are glowing tubes between modules. Dark space background. Colors: cyan nominal, amber advisory, red alarm. Zone labels as small floating text, max 2 words.
2. Flame: reuse the existing FlameScene shader and flameParams.ts for a small spherical microgravity flame at the origin zone, scaled by the simulated heat release over t (use whichever timeline quantity corresponds to it; say which in your report).
3. Smoke: a GPU Points system (single draw call, seeded) whose density per zone follows the timeline smoke series. Particles drift along ducts using the flow data from the timeline. They must NOT rise. Smoke must visibly stay near the source and travel mainly through ducts. If duct flow is not available, derive drift direction from the difference in smoke between neighboring zones and say so.
4. Sensors: small nodes on each zone wall that pulse (scale and glow) when the timeline value crosses the advisory or alarm level, plus a small flag at the moment each detector arm alarms (one per raced arm, matching the race clocks).
5. Camera: slow idle orbit with limited user control. Everything is a pure function of t, so scrubbing backward and forward is exact.
6. Fallback: a lightweight 2D SVG version of the same animation when WebGL is unavailable or prefers-reduced-motion is set.
7. Lazy-load the scene (React.lazy or dynamic import) and measure FPS with the existing PerfOverlay. Cap DPR at 2. Report the particle count and measured FPS and on what device; if you cannot measure, say NOT VERIFIED.

Tests: a unit test that the particle seed produces identical positions for identical t; a smoke test that the page mounts the lazy scene and the fallback path renders without WebGL.

VISUAL REFERENCE: docs/hero_kit/reference/station_live_demo.html is a working demo of the target look and behavior (open it in a browser, click around, read its code). Its simulation, detectors and ML are small stand-ins written for the demo, with made-up parameters. Match its look, layout and interaction, but drive everything from IGNIS's real simulator, detectors and localizer, never from the demo's numbers.
