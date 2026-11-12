import { test, expect } from 'playwright/test';

test.describe('Landing Hero Planet Carousel & Clean Background', () => {
  test('verifies planet switcher buttons have transparent background with no white pill artifact', async ({
    page,
  }) => {
    await page.goto('/');

    const leftPlanet = page.locator('.planet.planet-l');
    const rightPlanet = page.locator('.planet.planet-r');

    await expect(leftPlanet).toBeVisible();
    await expect(rightPlanet).toBeVisible();

    // Verify background is transparent and no white button styling applies to .planet
    const leftBg = await leftPlanet.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const rightBg = await rightPlanet.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    expect(leftBg).toBe('rgba(0, 0, 0, 0)');
    expect(rightBg).toBe('rgba(0, 0, 0, 0)');

    const leftBoxShadow = await leftPlanet.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(leftBoxShadow).toBe('none');
  });

  test('auto-rotates celestial bodies after a few seconds', async ({ page }) => {
    await page.goto('/');

    const presetName = page.locator('.dest-preset-pill .dest-name');
    await expect(presetName).toHaveText('ORBITAL (0g MICROGRAVITY)');

    // Wait for auto-rotation timer (5.5s interval + buffer)
    await page.waitForTimeout(6200);

    // Should have auto-rotated to MARS
    await expect(presetName).toHaveText('MARS (0.38g PARTIAL GRAVITY)');
  });

  test('manual click on side planet switches destination immediately', async ({ page }) => {
    await page.goto('/');

    const leftPlanet = page.locator('.planet.planet-l');
    await leftPlanet.click();

    const presetName = page.locator('.dest-preset-pill .dest-name');
    // Clicking left planet (Mars) switches environment immediately
    await expect(presetName).toHaveText('MARS (0.38g PARTIAL GRAVITY)');
  });

  test('verifies Explore Fire Response button links to /response', async ({ page }) => {
    await page.goto('/');

    const fireResponseBtn = page.getByRole('link', { name: 'Explore Fire Response' });
    await expect(fireResponseBtn).toBeVisible();
    await expect(fireResponseBtn).toHaveAttribute('href', '/response');
  });
});
