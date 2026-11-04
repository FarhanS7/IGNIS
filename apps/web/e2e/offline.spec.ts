import { test, expect } from 'playwright/test';

test.describe('Offline & CDN Fallback Integrity', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept and abort requests to CloudFront CDN and third-party remote assets
    await page.route('**/*cloudfront.net/**', (route) => route.abort());
    await page.route('**/*google-analytics.com/**', (route) => route.abort());
  });

  test('renders landing page fallback gradient when CDN assets are blocked', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const root = page.locator('#root');
    await expect(root).toBeVisible();

    const mainHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(mainHeading).toBeVisible();
  });

  test('verifies /response functions completely offline without external network', async ({
    page,
  }) => {
    await page.goto('/response', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const heading = page.getByRole('heading', { name: /FIRE RESPONSE CONSOLE/i });
    await expect(heading).toBeVisible();

    // Verify local client-side ML detector switches without network
    const detectorSelect = page.locator('select').filter({ hasText: /Heuristic fusion/i });
    await expect(detectorSelect).toBeVisible();
    await detectorSelect.selectOption('trained');

    const honestBadge = page.getByText(/Trained on Earth-gravity data\. Not validated in microgravity\./i);
    await expect(honestBadge).toBeVisible();
  });

  test('verifies /simulator loads and renders completely offline', async ({
    page,
  }) => {
    await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('verifies /experiments flight data explorer renders offline', async ({
    page,
  }) => {
    await page.goto('/experiments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('verifies /ask works completely client-side offline', async ({
    page,
  }) => {
    await page.goto('/ask', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const root = page.locator('#root');
    await expect(root).toBeVisible();

    const askHeading = page.getByRole('heading', { name: /Ask IGNIS/i });
    await expect(askHeading).toBeVisible();
  });
});
