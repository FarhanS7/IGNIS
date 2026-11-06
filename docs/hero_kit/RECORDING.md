# Recording the 90-second video

You need two things: the capture mode from Step 6, and a recorder. Pick one of two routes.

## Route A: screen recording (fast, good enough)

1. `npm run build` then `npm run preview` (or use your Vercel preview URL).
2. Open Chrome at 1920x1080 (full screen, F11). Open `/response?capture=1`.
3. Start OBS (free) with a Display Capture at 1920x1080, 30 fps, mp4 output. Windows Game Bar (Win+G) also works.
4. Reload the page, wait for the first frame, then start recording. Record the whole run, stop at the closing card.
5. Close other tabs and apps first; dropped frames come from a busy machine.
6. Trim in any editor (Clipchamp, DaVinci Resolve free, CapCut).

## Route B: deterministic frame capture (best quality, identical every time)

Step 6 builds `apps/web/scripts/record_frames.mjs`. It sets the timeline time frame by frame, takes a screenshot per frame, and ffmpeg joins them, so a slow machine cannot drop frames.

```powershell
# from E:\IGNIS, with the dev or preview server running
node apps\web\scripts\record_frames.mjs --url http://localhost:5173/response?capture=1 --fps 30 --out recordings\frames
ffmpeg -framerate 30 -i recordings\frames\f_%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 recordings\ignis_demo.mp4
```

If ffmpeg is not installed: `winget install Gyan.FFmpeg`. If the script's arguments differ, read its header comment; the agent was told to document them there.

## Captions and music

- Captions are already rendered in the scene by capture mode. Check each is readable on a phone-size preview.
- Music is optional. Use only music you have the license for (YouTube Audio Library or a CC0 source) and add it in your editor, low volume.
- No voiceover is planned. If you add one later, keep the captions.

## Before you upload

- [ ] Watch it fully, muted. Does the story still land?
- [ ] The gap number on screen matches the simulation (it is read from the timeline, but check it).
- [ ] "Simulated. Not flight software." is visible at the end.
- [ ] Length is 90 seconds or less.
- [ ] Upload as unlisted, open the link in a private window to confirm it plays, then paste it into `docs/SUBMISSION.md`.
