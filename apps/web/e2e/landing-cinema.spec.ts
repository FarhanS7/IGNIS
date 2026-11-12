import { test, expect } from 'playwright/test';

test.describe('Landing Page Post-Hero Cinematic UI & Telemetry', () => {
  test('renders cinematic eyebrows, split outline/warm headings, and live telemetry card', async ({
    page,
  }) => {
    await page.goto('/');

    // Scroll down to how-it-works section
    const howItWorks = page.locator('#how-it-works');
    await howItWorks.scrollIntoViewIfNeeded();

    // Verify cinematic eyebrow and hairline
    const eyebrow = howItWorks.locator('.cinema-eyebrow');
    await expect(eyebrow).toBeVisible();
    await expect(eyebrow).toContainText('01 / THREE-STAGE DISCOVERY');
    await expect(howItWorks.locator('.cinema-hairline')).toBeVisible();

    // Verify split typography lines
    await expect(howItWorks.locator('.cinema-line-outline')).toBeVisible();
    await expect(howItWorks.locator('.cinema-line-warm')).toBeVisible();

    // Verify live signal observation telemetry card
    const signalObservation = page.locator('.signal-observation');
    await expect(signalObservation).toBeVisible();
    await expect(signalObservation.locator('.signal-kicker')).toContainText('NASA PSI FLIGHT TELEMETRY');
    await expect(signalObservation.locator('.signal-wave')).toBeVisible();
    await expect(signalObservation.locator('.wave-live')).toBeVisible();
  });

  test('renders simulator demo with coordinates HUD and journey button', async ({ page }) => {
    await page.goto('/');

    const simulatorDemo = page.locator('#simulator-demo');
    await simulatorDemo.scrollIntoViewIfNeeded();

    await expect(simulatorDemo.locator('.cinema-eyebrow')).toContainText('02 / INTERACTIVE HABITAT SIMULATION');
    await expect(simulatorDemo.locator('.journey-button')).toBeVisible();
    await expect(simulatorDemo.locator('.journey-button')).toContainText('RUN IN THE SIMULATOR');
  });

  test('floating journey HUD appears on scroll with chapter pills', async ({ page }) => {
    await page.goto('/');

    // At top of hero, journey HUD should not be visible
    const journeyHud = page.locator('.bottom-hud-journey');
    await expect(journeyHud).not.toBeVisible();

    // Scroll down past hero stage
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);

    // Journey HUD should now appear
    await expect(journeyHud).toBeVisible();
    await expect(journeyHud.locator('.scroll-mouse')).toBeVisible();

    // Verify chapter pills exist
    const pills = journeyHud.locator('.chapter-pill-btn');
    await expect(pills).toHaveCount(4);
    await expect(pills.nth(0)).toContainText('01');
    await expect(pills.nth(1)).toContainText('02');
  });
});

