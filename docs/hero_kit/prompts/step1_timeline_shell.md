STEP 1: TIMELINE PRECOMPUTE AND PAGE SHELL (N = 1). No 3D yet. A placeholder stage is fine.

Use the scenario and race pair in docs/hero_kit/DECISION.md.

1. Create lib/fire/timeline/buildTimeline.ts (match the existing folder conventions). Given a scenario config, run the existing deterministic simulator headlessly and return one serializable Timeline object: per-zone smoke/CO/temperature series; per-detector alarm timestamps; the localization result and the time it becomes available; sequencer events (alarm declared, power off, vents isolated, atmosphere makeup inhibited, suppression confirmed, flame out, recovery); and the duct flow data if the simulator exposes it. Sample at a fixed dt. Do not modify the simulator. If something the scene needs is not exposed, derive it from what is exposed and say so in your report.
2. Create a useTimeline hook: play, pause, seek, speed, with t as the single source of truth, driven by requestAnimationFrame (no setInterval drift) and clamped to the timeline length.
3. Create StationDemoPage.tsx as the new hero view for the /response route. Move the existing console, completely unchanged, behind an "Inspect" button (drawer or /response?view=inspect). Update affected e2e specs and any route tests accordingly, without weakening them.
4. Layout, large and visual: a big stage area (placeholder), two large race clocks on top using the labels from DECISION.md (each counts up from ignition and freezes at its alarm time; when both are frozen show the gap as one big number computed from the timeline), a caption bar, and a bottom scrubber with six stage icons (alarm, power, vents, inhibit, suppress, recover).
5. Auto-play on load. Controls: replay, scrub, speed, and a collapsed "Run your own scenario" panel that reuses the existing selectors.
6. Build a Caption component driven by a list of {tStart, tEnd, text}, max 6 words each, following docs/hero_kit/SHOT_LIST.md for the run section: "t = 0", "Smoke drifts. It does not rise.", "Sensors react", "Alarm. Locating the source.", "Source found: {zone}", "Power cut. Vents closed.", "Standard detector still waiting", "{X} seconds earlier" (only after the standard clock has frozen), "Crew decides. Hold to confirm.", "Crew confirms. Suppressing.", "Fire out." Caption times must come from timeline events, not hard-coded seconds.
7. Keep the honesty badge "Simulated. Not flight software." visible on the page.
8. The first screen must not contain paragraphs of text.

Tests to add: building the same timeline twice gives bit-identical output; clock freeze times equal the timeline alarm timestamps; the gap equals the difference of those timestamps; seeking to the same t twice gives the same state.
