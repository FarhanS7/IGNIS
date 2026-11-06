STEP 6: CAPTURE MODE, PROOF SHOT, POLISH (N = 6).

1. Capture mode (?capture=1): hide all UI chrome except captions and the race clocks; disable user camera control; fix the layout to a 16:9 stage (1920x1080); run the full script (intro, reveal, ignite, race, locate, contain, proof, close) on one fixed timeline with scripted camera paths. Every take must be identical. Use the scripted confirm press hook from Step 4.
2. Expose window.__ignis = { duration, setTime(t), ready } in capture mode only, so an external script can set the time frame by frame. setTime must render synchronously enough that a screenshot taken right after reflects that t.
3. Create apps/web/scripts/record_frames.mjs (Playwright, already installed) that opens the page, waits for ready, and for each frame at a given fps calls setTime and saves a PNG named f_00001.png etc. Arguments: --url, --fps (default 30), --out. Document usage in a header comment. Do not add it to the production bundle. If Playwright's headless WebGL is too slow or unavailable, say so and report what you tried.
4. Proof shot: at the end of the run, automatically click the gap number, slide in the existing ProvenanceDrawer showing the NASA investigation, run id, and DOI from the real provenance data, then show the simulator's flight-run matching view for about 3 seconds.
5. Closing card: slowly rotating station, the badge "Simulated. Not flight software.", the logo, and a URL placeholder read from a single constant.
6. Mobile polish at 390x844: stacked clocks, smaller captions, controls reachable. Check the reduced-motion path. No console errors anywhere in the run.
7. Update Playwright specs (response, routes, mobile) and add a smoke test that the hero page autoplays and reaches the "Fire out" state, and that capture mode exposes window.__ignis.
8. Run npm test, npm run build, and npm run test:e2e --prefix apps/web. Report the real counts.

Do not update PROJECT_CONTEXT.md in this step; that is Step 99.

VISUAL REFERENCE: docs/hero_kit/reference/station_live_demo.html is a working demo of the target look and behavior (open it in a browser, click around, read its code). Its simulation, detectors and ML are small stand-ins written for the demo, with made-up parameters. Match its look, layout and interaction, but drive everything from IGNIS's real simulator, detectors and localizer, never from the demo's numbers.
