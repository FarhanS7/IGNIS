# 90-second shot list (captions only, no voiceover)

Story in one line: fire in space behaves differently, a standard detector is slow, a NASA-calibrated one is faster, IGNIS locates the source and contains it, and every number traces back to NASA.

| Time | Shot | On screen | Caption (max 6 words) |
|------|------|-----------|-----------------------|
| 0:00-0:08 | Hook | Black screen. Teardrop flame flickers. Gravity slider drops to 0 and the flame becomes a quiet blue sphere. | Fire in space is different. |
| 0:08-0:16 | Why it matters | Split screen, same room, same fire. Earth: smoke rises to the ceiling and reaches the detector. Orbit: smoke hangs near the source, detector stays green. Small label: illustrative. | On Earth, smoke rises. Here, it doesn't. |
| 0:16-0:24 | Station reveal | Camera glides around the 3D cutaway station (4 modules, glowing ducts). Logo fades in. | IGNIS: fire safety from NASA flight data |
| 0:24-0:34 | Ignite | A small sphere flame appears in one module. Smoke drifts slowly into the ducts. Timer starts. | t = 0 |
| 0:34-0:46 | The race | Two clocks: Standard vs SAME-R calibrated. Sensors pulse as smoke arrives. The calibrated clock stops and flashes. The standard clock keeps counting. | Sensors react |
| 0:46-0:56 | Locate | Rings expand from triggered sensors and converge. Reticle locks on the module. Camera flies in. | Source found: {zone} |
| 0:56-1:10 | Contain | Power cut (lights go dark). Duct segments snap shut. The standard clock finally freezes and the gap appears. Hold-to-confirm ring, pressed. Mist fills module. Flame shrinks to nothing. Station turns cyan. | {X} seconds earlier, then Crew confirms. Fire out. |
| 1:10-1:20 | Proof | Gap number clicked, provenance drawer slides in: NASA investigation, run id, DOI. Quick cut to simulator matching real flight runs. | Every number traces to NASA. |
| 1:20-1:30 | Honest close | Station rotates slowly. Badge: Simulated. Not flight software. End card with logo and URL. | (URL) |

## Rules for the video

- The gap number must be the real simulation output. If it is small, show it as it is and pick a better scenario. Never tune parameters to create a gap.
- Show "Trained on Earth-gravity data. Not validated in microgravity." whenever the ML detector is on screen.
- The Earth vs orbit split is an illustration, and it is labeled that way.
- A judge should understand the whole thing with the sound off and without reading anything longer than six words.

## Ordering note (found while building the visual preview)

The gap number cannot appear until the slower detector actually alarms. So the order on screen is: calibrated clock freezes, locate, contain, then the standard clock freezes and the gap number appears. Showing "{X} seconds earlier" before the standard clock stops would be a spoiler and looks staged. A working demo is in `reference/station_live_demo.html` (open it in a browser). It runs a toy simulation, so its numbers are not IGNIS results.

Caption sequence used in the preview: t = 0 / Smoke drifts. It does not rise. / Sensors react / Alarm. Locating the source. / Source found: {zone} / Power cut. Vents closed. / Standard detector still waiting / {X} seconds earlier / Crew decides. Hold to confirm. / Crew confirms. Suppressing. / Fire out. / Every number traces to NASA.
