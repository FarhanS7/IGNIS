STEP 3: LOCALIZATION, ALARM, CAMERA FLY-TO, RACE RESULT (N = 3). Use the timeline's localization result; do not change the localizer.

1. When sensors alarm, draw expanding rings from each triggered sensor, timed to the alarm timestamps. The rings must visibly converge on the localized source point or zone.
2. Show a reticle lock on the localized zone with the label "Source found: {zone}". If localization is AMBIGUOUS or INSUFFICIENT_EVIDENCE, show an amber "Narrowing down..." state instead. Never show false certainty.
3. On FIRE_ALARM: the zone outline turns red, a soft screen-edge pulse (disabled under prefers-reduced-motion), and a smooth eased camera fly-to on the alarmed zone, computed as a deterministic function of t (scrubbing back returns the camera exactly).
4. Race clocks: freeze each clock at its alarm time with a brief flash, then show the gap as one big number ("{X} s earlier") using only real timeline values. If the gap is not positive for the chosen scenario, show the true result neutrally and flag it in your report; do not hide or reword it.
5. Keep the Earth-gravity training caveat next to the clocks if the ML arm is raced.

Tests: the reticle zone equals the localizer output for the timeline; the clock freeze times equal the timeline alarm timestamps; the ambiguous state never renders "Source found"; camera position at a given t is identical across two evaluations.

VISUAL REFERENCE: docs/hero_kit/reference/station_live_demo.html is a working demo of the target look and behavior (open it in a browser, click around, read its code). Its simulation, detectors and ML are small stand-ins written for the demo, with made-up parameters. Match its look, layout and interaction, but drive everything from IGNIS's real simulator, detectors and localizer, never from the demo's numbers.
