#!/usr/bin/env node

/**
 * record_frames.mjs - Frame-by-Frame Deterministic Capture Script for Space Apps 90s Video.
 *
 * Uses Playwright to drive IGNIS capture mode (?capture=1) via window.__ignis.setTime(t).
 * Guarantees zero dropped frames, bit-identical rendering, and 1920x1080 16:9 output.
 *
 * USAGE:
 *   1. Start the dev server in one terminal:
 *        npm run dev
 *   2. Run this script in another terminal:
 *        node apps/web/scripts/record_frames.mjs --url http://localhost:5173/response?capture=1 --fps 30 --out ./frames
 *   3. Assemble video with ffmpeg:
 *        ffmpeg -framerate 30 -i frames/f_%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4
 *
 * ARGUMENTS:
 *   --url       Target URL (default: http://localhost:5173/response?capture=1)
 *   --fps       Frames per second (default: 30)
 *   --out       Output directory for captured PNG frames (default: ./frames)
 *   --max-time  Maximum duration in seconds to capture (default: 90)
 *
 * NOTE ON HEADLESS WEBGL:
 *   If running headless on systems without hardware acceleration (e.g. CI Linux),
 *   pass `--headless=false` or configure SwiftShader / ANGLE flags:
 *   args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader']
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: 'http://localhost:5173/response?capture=1',
    fps: 30,
    out: './frames',
    maxTime: 90,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      options.url = args[++i];
    } else if (arg === '--fps' && args[i + 1]) {
      options.fps = parseInt(args[++i], 10);
    } else if (arg === '--out' && args[i + 1]) {
      options.out = args[++i];
    } else if (arg === '--max-time' && args[i + 1]) {
      options.maxTime = parseFloat(args[++i]);
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  console.log('--- IGNIS Frame Recorder ---');
  console.log(`URL:      ${options.url}`);
  console.log(`FPS:      ${options.fps}`);
  console.log(`Output:   ${options.out}`);
  console.log(`Max Time: ${options.maxTime}s`);

  if (!fs.existsSync(options.out)) {
    fs.mkdirSync(options.out, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--ignore-gpu-blocklist',
      '--window-size=1920,1080',
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  console.log('Navigating to capture mode page...');
  await page.goto(options.url, { waitUntil: 'domcontentloaded' });

  // Wait for window.__ignis to be exposed and ready
  console.log('Waiting for window.__ignis interface...');
  await page.waitForFunction(() => {
    return (
      typeof window !== 'undefined' &&
      window.__ignis &&
      window.__ignis.ready === true
    );
  }, { timeout: 30000 });

  const duration = await page.evaluate(() => window.__ignis.duration);
  const totalDuration = Math.min(duration, options.maxTime);
  const totalFrames = Math.floor(totalDuration * options.fps);

  console.log(`Capture ready. Duration: ${totalDuration}s. Total frames to render: ${totalFrames}`);

  const dt = 1.0 / options.fps;
  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame * dt;
    await page.evaluate((time) => {
      window.__ignis.setTime(time);
    }, t);

    // Allow single frame paint cycle
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    const filename = `f_${String(frame + 1).padStart(5, '0')}.png`;
    const framePath = path.join(options.out, filename);

    await page.screenshot({ path: framePath, type: 'png' });

    if ((frame + 1) % 60 === 0 || frame === totalFrames - 1) {
      console.log(`Rendered frame ${frame + 1}/${totalFrames} (t = ${t.toFixed(2)}s)`);
    }
  }

  console.log(`\nCapture complete! ${totalFrames} frames saved to ${options.out}`);
  await browser.close();
}

main().catch((err) => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});

