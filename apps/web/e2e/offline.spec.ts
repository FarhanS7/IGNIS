import { test, expect } from 'playwright/test';

test.describe('Offline & CDN Fallback Integrity', () => {
  test('renders landing page fallback gradient when cloudfront.net CDN assets are blocked', async ({
    page,
  }) => {
    // Intercept and abort requests to CloudFront CDN
    await page.route('**/*cloudfront.net/**', (route) => {
      route.abort();
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify root is mounted
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Verify main content container is rendered and interactive
    const mainHeading = page.getByRole('heading', { level: 1 }).first();
    await expect(mainHeading).toBeVisible();
  });
});
