import { test, expect } from 'playwright/test';

test.describe('Additive Integration & Cross-Page Navigation', () => {
  test('navigates to /response via link on Simulator page', async ({ page }) => {
    await page.goto('/simulator');
    await page.waitForLoadState('domcontentloaded');

    const responseLink = page.getByRole('link', { name: /Run Fire Response/i });
    await expect(responseLink).toBeVisible();

    await responseLink.click();
    await page.waitForURL(/\/response/);
    expect(page.url()).toContain('/response');

    const header = page.getByRole('heading', { level: 1, name: /Fire Response Console/i });
    await expect(header).toBeVisible();
  });

  test('research gaps page displays Fire Response Console capability card', async ({ page }) => {
    await page.goto('/gaps');
    await page.waitForLoadState('domcontentloaded');

    const cardTitle = page.getByText(/Spacecraft Fire Response Research & Containment/i);
    await expect(cardTitle).toBeVisible();

    const responseButton = page.getByRole('link', { name: /Open Fire Response Console/i });
    await expect(responseButton).toBeVisible();
  });

  test('about page displays fire detection methodology section', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    const sectionTitle = page.getByText(/Fire Response & Smoke Containment Simulation/i);
    await expect(sectionTitle).toBeVisible();

    const link = page.getByRole('link', { name: /Explore Fire Response Console/i });
    await expect(link).toBeVisible();
  });

  test('navbar maintains all original links without removal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Expected nav routes in Navbar: Simulator, Fire Response, Learn, Ask, What's untested, Data & Sources
    const expectedLabels = ['Simulator', 'Fire Response', 'Learn', 'Ask', "What's untested", 'Data & Sources'];
    for (const label of expectedLabels) {
      const link = page.getByRole('link', { name: new RegExp(label, 'i') }).first();
      await expect(link).toBeAttached();
    }
  });
});
