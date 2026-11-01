import { chromium } from '../apps/web/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOTS_DIR = path.resolve(import.meta.dirname, '../docs/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

const BASE_URL = 'http://127.0.0.1:4173';

async function run() {
  console.log(`Starting UX Test screenshots on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });
    const page = await context.newPage();

    // Dismiss tour if open
    await page.addInitScript(() => {
      localStorage.setItem('ignis_simulator_tour_dismissed', 'true');
    });

    // 1. Landing
    console.log(`Capturing 1. Landing...`);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_1_landing.png`),
      fullPage: true,
    });

    // 2. Simulator default
    console.log(`Capturing 2. Simulator Default...`);
    await page.goto(`${BASE_URL}/simulator`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_2_simulator_default.png`),
      fullPage: true,
    });

    // 3. Simulator after changing gravity to Moon
    console.log(`Capturing 3. Simulator Moon...`);
    const moonPreset = page.locator('button:has-text("Lunar Surface Habitat"), button:has-text("Lunar Base Surface")').first();
    if (await moonPreset.count() > 0) {
      await moonPreset.click();
    } else {
      await page.goto(`${BASE_URL}/simulator?destination=moon`, { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_3_simulator_moon.png`),
      fullPage: true,
    });

    // 4. Simulator with O2 34%
    console.log(`Capturing 4. Simulator O2 34%...`);
    await page.goto(`${BASE_URL}/simulator?destination=orbital&oxygen=34`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_4_simulator_o2_34.png`),
      fullPage: true,
    });

    // 5. Learn (Story Mode)
    console.log(`Capturing 5. Learn (Story Mode)...`);
    await page.goto(`${BASE_URL}/explore`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_5_learn.png`),
      fullPage: true,
    });

    // 6. Ask
    console.log(`Capturing 6. Ask...`);
    await page.goto(`${BASE_URL}/ask`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_6_ask.png`),
      fullPage: true,
    });

    // 7. Untested (/gaps)
    console.log(`Capturing 7. Untested (/gaps)...`);
    await page.goto(`${BASE_URL}/gaps`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_7_untested.png`),
      fullPage: true,
    });

    await context.close();
  }

  await browser.close();
  console.log(`\nAll 14 screenshots successfully captured into docs/screenshots/`);
}

run().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
