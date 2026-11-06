STEP 0b: LOCK THE RACE DECISION (N = 0b). Do not build UI. Do not change any source file other than creating one document.

Read docs/hero_kit/reports/step0_scout.md. Using the OWNER INPUT below (if it is empty, use your own recommendation from Step 0 and label it "agent recommendation, not confirmed by owner"), write docs/hero_kit/DECISION.md containing:

1. DEFAULT SCENARIO: habitat preset, fuel material, origin zone, operating mode (Crewed), detector settings, seed. Use the exact identifiers the code uses.
2. RACE PAIR: the two detector arms, the exact internal ids, and the two on-screen clock labels (short, plain, accurate to what each arm really is).
3. HONEST NUMBERS: alarm time of each arm and the gap, copied from the scout table, plus the localization category for this scenario.
4. CAPTION TEXT for the gap shot, with {X} filled by the real number, and the rule that the caption must always read the number from the timeline, never hard-code it.
5. FALLBACKS: if the gap in the chosen scenario is small, which second scenario to use, and what honest wording to use.
6. CAVEATS that must appear on screen next to the race (the Earth-gravity training note if the ML arm is involved; "Simulated. Not flight software.").

If the owner input requests something the scout table does not support (for example a gap that does not exist), do not write the document. Explain in two sentences and stop.

OWNER INPUT is appended below this line by the script.
