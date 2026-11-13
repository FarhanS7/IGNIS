# Eye-check checklists

Run `npm run dev`, open the page, and tick each item yourself. Tests do not judge whether it looks good.

## Step 0 / 0b
- [ ] The scout table exists in `docs/hero_kit/reports/step0_scout.md`
- [ ] You read the real gap between the baseline arm and the SAME-R arm, and it is positive and not tiny
- [ ] The agent did not change any simulation or detector code (verify.ps1 confirms)
- [ ] `docs/hero_kit/DECISION.md` names the scenario, the two raced arms, and the clock labels

## Step 1: timeline and shell
- [ ] `/response` opens and starts playing by itself
- [ ] Two big clocks at the top count up and freeze at different times
- [ ] A caption bar changes through the run, six words or fewer each
- [ ] A scrubber with six stage icons works (drag, replay, speed)
- [ ] "Inspect" opens the old console, unchanged
- [ ] "Run your own scenario" is collapsed by default
- [ ] No paragraph of text visible on the first screen

## Step 2: 3D station
- [ ] Modules and glowing ducts look like a place, not a diagram
- [ ] Flame is a sphere, not a teardrop
- [ ] Smoke stays near the source and travels along ducts; it does not rise
- [ ] Sensors pulse when smoke reaches them
- [ ] Drag the scrubber back and forth: the scene follows exactly
- [ ] Reduced-motion or no-WebGL shows the 2D fallback
- [ ] Smooth on your own laptop (note the FPS)

## Step 3: localize and alarm
- [ ] Rings expand from triggered sensors and converge on the source
- [ ] Reticle says "Source found: <zone>" only when localization is clear; otherwise amber "Narrowing down..."
- [ ] Zone turns red, camera flies in smoothly
- [ ] Clocks freeze with a flash; the gap number matches the timeline

## Step 4: containment
- [ ] Lights dim in the zone (power cut)
- [ ] Duct segments visibly close and smoke in them stops
- [ ] Crewed mode: playback pauses at suppression and shows Hold to confirm
- [ ] Holding for about 1.2 seconds releases suppression; releasing early does not
- [ ] Space or Enter works from the keyboard
- [ ] Mist fills the zone, flame shrinks to nothing, station turns cyan
- [ ] Uncrewed mode shows an "Uncrewed" badge and the auto path
- [ ] FLEX caveat chip is visible near suppression

## Step 5: opening
- [ ] Flame morphs from teardrop to sphere as gravity goes to zero
- [ ] Split screen: Earth detector turns red, Orbit detector stays green
- [ ] "illustrative" label is visible
- [ ] Skip intro works; intro plays once per session
- [ ] Only one WebGL canvas exists at a time (check devtools Elements)

## Step 6: capture and polish
- [ ] `/response?capture=1` plays the full script with only captions and clocks
- [ ] Two takes look identical
- [ ] Proof shot opens the provenance drawer with NASA investigation, run id, DOI
- [ ] Closing card shows "Simulated. Not flight software."
- [ ] Phone width (390x844) is clean: stacked clocks, readable captions
- [ ] No console errors

## Before submission
- [ ] About page shows the audited 80.30% grouped LOOCV, not the retracted figures
- [ ] Every claim on screen is a real output or labeled illustrative
- [ ] Video plays muted and still makes sense
