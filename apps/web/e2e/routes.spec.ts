import { test, expect } from 'playwright/test';

const ROUTES = [
  '/',
  '/simulator',
  '/build',
  '/evidence',
  '/experiments',
  '/explorer',
  '/explore',
  '/stories/v2',
  '/ask',
  '/gaps',
  '/about',
  '/response',
];

test.describe('All 12 Core Application Routes', () => {
  for (const route of ROUTES) {
    test(`loads route "${route}" with HTTP 200 and no uncaught console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Allow microtasks to settle
      await page.waitForTimeout(500);

      // Verify no uncaught runtime script crashes
      const fatalErrors = consoleErrors.filter(
        (e) => !e.includes('Failed to load resource') && !e.includes('favicon.ico')
      );
      expect(fatalErrors).toEqual([]);

      // Verify page mounted successfully
      const root = page.locator('#root');
      await expect(root).toBeAttached();
    });
  }
});
