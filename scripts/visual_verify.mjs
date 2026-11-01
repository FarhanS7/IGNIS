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
  console.log(`Starting Playwright visual verification on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Capturing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });
    const page = await context.newPage();

    // 1. Landing
    console.log(`Capturing Landing...`);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_landing.png`),
      fullPage: true,
    });

    // 2. Simulator Scenario 1 (ISS nominal: PMMA 21%, 5 cm/s, 0 g)
    console.log(`Capturing Simulator Scenario 1 (ISS)...`);
    await page.goto(`${BASE_URL}/simulator`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_simulator_scenario_1_iss.png`),
      fullPage: true,
    });

    // 3. Simulator Scenario 2 (Exploration Atmosphere: PMMA 34%, 10 cm/s, 0.16 g - outside tested envelope)
    console.log(`Capturing Simulator Scenario 2 (Lunar / Exploration Atmosphere)...`);
    // Click the Lunar preset button containing "Lunar Surface Habitat"
    const lunarBtn = page.locator('button:has-text("Lunar Surface Habitat")');
    if (await lunarBtn.count() > 0) {
      await lunarBtn.click();
    } else {
      // Fallback: set inputs directly
      await page.fill('input[type="number"][value="21"]', '34');
    }
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_simulator_scenario_2_exploration.png`),
      fullPage: true,
    });

    // 4. Simulator Scenario 3 (Mars Nomex: Nomex 28%, 10 cm/s, 0.38 g - different material)
    console.log(`Capturing Simulator Scenario 3 (Mars Surface Habitat / Nomex)...`);
    const marsBtn = page.locator('button:has-text("Mars Surface Habitat")');
    if (await marsBtn.count() > 0) {
      await marsBtn.click();
    }
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_simulator_scenario_3_mars_nomex.png`),
      fullPage: true,
    });

    // 5. Explorer Solid Tab (Habitat)
    console.log(`Capturing Explorer Solid Tab...`);
    await page.goto(`${BASE_URL}/explorer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_explorer_solid.png`),
      fullPage: true,
    });

    // 6. Explorer Fundamental Tab
    console.log(`Capturing Explorer Fundamental Tab...`);
    const fundTab = page.locator('button:has-text("Fundamental Science")');
    if (await fundTab.count() > 0) {
      await fundTab.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_explorer_fundamental.png`),
      fullPage: true,
    });

    // 7. Provenance Drawer Open
    console.log(`Capturing Provenance Drawer Open...`);
    await page.goto(`${BASE_URL}/simulator`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const factBtn = page.locator('button:has-text("Inspect Provenance Row")').first();
    if (await factBtn.count() > 0) {
      await factBtn.click();
      await page.waitForTimeout(1200);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_provenance_drawer_open.png`),
      fullPage: true,
    });

    // 8. About Page
    console.log(`Capturing About Page...`);
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${vp.name}_about.png`),
      fullPage: true,
    });

    await context.close();
  }

  await browser.close();
  console.log(`\nAll screenshots successfully captured in ${SCREENSHOTS_DIR}!`);
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
