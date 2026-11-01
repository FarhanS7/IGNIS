const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../../apps/web/node_modules/playwright'));
const fs = require('fs');

async function main() {
  const browser = await chromium.launch();
  const outDir = path.resolve(__dirname, '../../docs/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Desktop Ask Page
  console.log('Capturing Desktop Ask Page...');
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:4173/ask', { waitUntil: 'networkidle' });
  
  // Click a curated query button
  const firstPromptBtn = await desktopPage.$('button:has-text("Why was the BASS-II O2 sensor")');
  if (firstPromptBtn) {
    console.log('Clicking query prompt button...');
    await firstPromptBtn.click();
    await desktopPage.waitForTimeout(2500);
  }
  
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_ask_page.png'), fullPage: true });

  // 2. Mobile Ask Page
  console.log('Capturing Mobile Ask Page...');
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:4173/ask', { waitUntil: 'networkidle' });
  const mobilePromptBtn = await mobilePage.$('button:has-text("Why was the BASS-II O2 sensor")');
  if (mobilePromptBtn) {
    await mobilePromptBtn.click();
    await mobilePage.waitForTimeout(2500);
  }
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_ask_page.png'), fullPage: true });

  // 3. Desktop Simulator with Ask Drawer open
  console.log('Capturing Simulator Ask Drawer...');
  await desktopPage.goto('http://localhost:4173/simulator', { waitUntil: 'networkidle' });
  const askBtn = await desktopPage.$('button:has-text("Ask IGNIS")');
  if (askBtn) {
    await askBtn.click();
    await desktopPage.waitForTimeout(1000);
  }
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_simulator_ask_drawer.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots captured successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
