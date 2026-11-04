import { test, expect } from 'playwright/test';

test.describe('Mobile Viewport (390x844) Responsiveness', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('verifies /response page renders without horizontal overflow and controls remain accessible', async ({
    page,
  }) => {
    await page.goto('/response', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify no unexpected horizontal document overflow (allow max 1px rounding margin)
    const isNoHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth + 1;
    });
    expect(isNoHorizontalScroll).toBe(true);

    // Verify main title
    const heading = page.getByRole('heading', { name: /FIRE RESPONSE CONSOLE/i });
    await expect(heading).toBeVisible();

    // Verify playback controls are reachable
    const playBtn = page.getByRole('button', { name: /Play/i });
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toBeEnabled();

    const resetBtn = page.getByRole('button', { name: /Reset/i });
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toBeEnabled();

    // Verify timeline slider is reachable
    const timelineScrubber = page.locator('input[type="range"]');
    await expect(timelineScrubber).toBeVisible();

    // Verify detector engine selector is reachable and can switch arms
    const detectorSelect = page.locator('select').filter({ hasText: /Heuristic fusion/i });
    await expect(detectorSelect).toBeVisible();
    await detectorSelect.selectOption('trained');

    // Verify honesty badge renders
    const honestBadge = page.getByText(/Trained on Earth-gravity data\. Not validated in microgravity\./i);
    await expect(honestBadge).toBeVisible();

    // Verify Monte Carlo launch button is reachable
    const mcButton = page.getByRole('button', { name: /Open Monte Carlo Sweep/i });
    await expect(mcButton).toBeVisible();

    // Scroll down to check Sequencer Panel is visible and reachable
    const sequencerHeading = page.getByRole('heading', { name: /EMERGENCY RESPONSE SEQUENCER/i });
    await expect(sequencerHeading).toBeVisible();
  });

  test('verifies /simulator page renders without horizontal overflow and controls remain accessible', async ({
    page,
  }) => {
    await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify no unexpected horizontal document overflow
    const isNoHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth + 1;
    });
    expect(isNoHorizontalScroll).toBe(true);

    // Verify root is mounted and responsive
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});
