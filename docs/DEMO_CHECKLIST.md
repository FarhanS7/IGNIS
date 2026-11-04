# IGNIS Demo Video Recording & Rehearsal Checklist

Use this checklist before recording the final submission video for NASA Space Apps Challenge 2026.

---

## 1. Browser & Visual Setup
- [ ] **Window Dimensions**: Set browser viewport to exactly 1920x1080 (16:9 aspect ratio).
- [ ] **Browser Profile**: Use an Incognito or dedicated Clean Profile without personal bookmarks, extensions, or third-party icons in the toolbar.
- [ ] **Display Zoom**: Reset browser zoom to exactly **100%** (`Ctrl + 0`).
- [ ] **Dark Mode Integrity**: Ensure dark mode styling renders properly without operating system color inversion artifacts.
- [ ] **Local or Production URL**: Run recording against the live production deployment URL (or clean local `npm run preview` on `http://localhost:4173/`).

---

## 2. Fixed Scenario Pre-Checks
- [ ] **Default Scenario**: Habitat = `ISS-Like Module (US Lab / Node 1)`, Fuel = `Cellulose (Cotton/SIBAL)`, Origin = `Zone 1 (Forward Lab)`, Mode = `Crewed Module`.
- [ ] **Timeline Playback**: Click Play and verify smooth timeline progression up to $t = 60\,\text{s}$.
- [ ] **Detector Arm Switching**: Test switching between `Heuristic fusion`, `Baseline (photoelectric)`, and `Trained fusion (Earth-gravity data)` to ensure the honest caveat badge appears instantly without layout shifts.
- [ ] **Monte Carlo Sweep**: Open the Monte Carlo modal, select **100 runs**, execute, and confirm table populates in under 2 seconds.
- [ ] **Droplet Extinction Insight**: Advance past Step 5 to ensure the NASA FLEX insight card displays with the label *"Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."*

---

## 3. Audio & Narration Timing
- [ ] **Microphone Quality**: Test microphone levels; minimize room echo and background noise.
- [ ] **Pacing Check**: Rehearse with a stopwatch against [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md). Ensure the 7 sections hit their timestamps within $\pm 2$ seconds:
  - [0:00 - 0:10] The Problem
  - [0:10 - 0:30] Simulator & Flight Provenance
  - [0:30 - 0:45] Honest Scientific Boundaries
  - [0:45 - 1:05] Fire Response Console
  - [1:05 - 1:15] Droplet Extinction Insight
  - [1:15 - 1:25] Three Detector Arms & Monte Carlo
  - [1:25 - 1:30] Closing Statement
- [ ] **Pronunciation Guide**:
  - **BASS-II**: *"Bass-two"* (Burning and Suppression of Solids)
  - **SAME-R**: *"Same-are"* (Smoke Aerosol Measurement Experiment - Reflight)
  - **FLEX**: *"Flex"* (Flame Extinguishment Experiment)
  - **CIR**: *"See-eye-are"* (Combustion Integrated Rack)

---

## 4. Submission Video Encoding
- [ ] **Format**: MP4 (H.264 video, AAC audio).
- [ ] **Duration**: 90 seconds target; **hard limit < 3 minutes** (Space Apps rules strictly enforce the 3-minute cap).
- [ ] **Resolution**: 1080p (1920x1080).
- [ ] **Hosting**: Upload as an Unlisted or Public YouTube video and paste the URL into `README.md` and `docs/SUBMISSION.md`.
