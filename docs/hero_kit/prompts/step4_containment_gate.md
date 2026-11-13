STEP 4: CONTAINMENT AND THE HUMAN GATE (N = 4). Visualize the sequencer events from the timeline. Do not change the sequencer.

1. Power cut: the alarmed zone's interior lights fade to dark and equipment icons dim.
2. Vent isolation: duct segments between that zone and its neighbors visibly snap shut; smoke particles in those ducts stop flowing.
3. Hold-to-confirm (crewed mode): when the sequencer reaches the suppression step, playback pauses and a large circular "Hold to confirm" control appears. A 1.2 second hold fills the ring, then suppression is released and playback resumes. Releasing early resets the ring. Keyboard accessible (hold Space or Enter), with an aria-live announcement. In Uncrewed Auto mode show the auto path with an "Uncrewed" badge instead.
4. Suppression: a mist volume fills the zone, the flame shrinks to zero following the timeline, smoke density decays per the timeline, and the station returns to cyan.
5. Add the FLEX droplet caveat chip near the suppression step: "Droplet flames only. Not cabin solid fuels."
6. Provide a hook for Step 6's capture mode: an exported function or prop that performs the confirm press programmatically in a scripted way, off by default.
7. Reduced motion: no flashing; use static state changes.

Tests: suppression never starts without confirmation in crewed mode (state-machine unit test, including seeking past the gate and replaying); an early release does not confirm; the determinism tests from Step 1 still pass; the confirm control is reachable and operable by keyboard (e2e).

VISUAL REFERENCE: docs/hero_kit/reference/station_live_demo.html is a working demo of the target look and behavior (open it in a browser, click around, read its code). Its simulation, detectors and ML are small stand-ins written for the demo, with made-up parameters. Match its look, layout and interaction, but drive everything from IGNIS's real simulator, detectors and localizer, never from the demo's numbers.
