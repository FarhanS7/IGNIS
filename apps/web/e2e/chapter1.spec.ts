import { test, expect } from 'playwright/test';

test.describe('Chapter 1 StoryShell Design E2E Verification', () => {
  test('loads /stories/why-is-fire-round-in-space using the unified StoryShell design, renders beats, Ember companion, and scrolls smoothly', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // Dismiss onboarding dialog in localStorage so tests interact directly with the story beats
    await page.addInitScript(() => {
      localStorage.setItem('ignis_story_onboarding_dismissed', 'true');
    });

    // 1. Visit Chapter 1 URL
    const response = await page.goto('/stories/why-is-fire-round-in-space', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(200);

    // 2. Verify Unified Header & Chapter Info
    const headerTitle = page.locator('header').filter({ hasText: 'Chapter 1' });
    await expect(headerTitle).toBeVisible({ timeout: 10000 });

    // 3. Verify Beat 1 (Cold Open) is rendered
    const beat1 = page.locator('#beat-beat-01-cold-open');
    await expect(beat1).toBeVisible({ timeout: 10000 });

    // 4. Verify Ember Companion is mounted and visible
    const emberCompanion = page.locator('text=Ember');
    await expect(emberCompanion.first()).toBeVisible({ timeout: 10000 });

    // 5. Verify Bottom Navigation Dock is visible
    const nextBtn = page.getByRole('button', { name: 'Next beat', exact: true });
    await expect(nextBtn).toBeVisible({ timeout: 10000 });

    // 6. Test scrolling / clicking to next beat
    await nextBtn.click();
    await page.waitForTimeout(500);

    // 7. Verify Beat 2 (Wonder / Chimney Check)
    const beat2 = page.locator('#beat-beat-02-wonder');
    await expect(beat2).toBeVisible({ timeout: 5000 });

    // 8. Verify no unhandled fatal runtime script errors
    const fatalErrors = consoleErrors.filter(
      (e) => !e.includes('Failed to load resource') && !e.includes('favicon.ico')
    );
    expect(fatalErrors).toEqual([]);
  });
});
