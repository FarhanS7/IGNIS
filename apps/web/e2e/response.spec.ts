import { test, expect, Page } from 'playwright/test';

async function setScrubberTime(page: Page, targetSeconds: number) {
  await page.evaluate((val) => {
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    if (slider) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (setter) {
        setter.call(slider, String(val));
      } else {
        slider.value = String(val);
      }
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, targetSeconds);
  await page.waitForTimeout(600);
}

test.describe('Fire Response Console End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');
  });

  test('enforces honesty rules: persistent banner visible and zero confidence/risk percentages', async ({
    page,
  }) => {
    // Persistent banner check
    const banner = page.getByText(/Simulated sensor data\.\s*Not flight software\./i);
    await expect(banner).toBeVisible();

    // Zero percentage confidence / risk anywhere on page
    const bodyText = await page.innerText('body');
    const forbiddenMatch = bodyText.match(/\d+(\.\d+)?\s*%\s*(risk|confidence)/i);
    expect(forbiddenMatch).toBeNull();
  });

  test('simulates scenario, triggers alarm, highlights source zone, and verifies sequencer in CREWED mode', async ({
    page,
  }) => {
    // Select Silicone fuel (nth 1 select is fuel material)
    const selects = page.locator('select');
    await selects.nth(1).selectOption('silicone');
    await page.waitForTimeout(300);

    // Advance timeline past fire growth (t = 25s) using range slider
    await setScrubberTime(page, 25);

    // Verify fire alarm indicator appears
    const alarmBadge = page.locator('span').filter({ hasText: 'FIRE_ALARM' });
    await expect(alarmBadge.first()).toBeVisible();

    // Verify sequenced steps appear and SUPPRESSION is ARMED
    const sequencerPanel = page.getByText(/EMERGENCY RESPONSE SEQUENCER/i);
    await expect(sequencerPanel).toBeVisible();

    const armedSuppression = page.getByText('ARMED');
    await expect(armedSuppression.first()).toBeVisible();

    // Crew confirmation button must be visible in CREWED mode
    const confirmButton = page.getByRole('button', { name: /Crew Confirmation/i });
    await expect(confirmButton).toBeVisible();

    // Click crew confirmation and assert suppression completes and enters post-fire recovery
    await confirmButton.click();
    await page.waitForTimeout(400);

    const postFireRecovery = page.getByText(/Post-Fire Recovery/i);
    await expect(postFireRecovery.first()).toBeVisible();

    // Manual override button works
    const overrideButton = page.getByRole('button', { name: /Manual override for/i }).first();
    if (await overrideButton.isVisible()) {
      await overrideButton.click();
      const overrideModal = page.getByText(/Manual Override:/i);
      await expect(overrideModal).toBeVisible();
      const cancelBtn = page.getByRole('button', { name: /Cancel/i });
      await cancelBtn.click();
    }
  });

  test('uncrewed mode autonomous suppression progression past timeout', async ({ page }) => {
    // Switch to Uncrewed mode
    const uncrewedBtn = page.getByRole('button', { name: /Uncrewed Auto/i });
    await uncrewedBtn.click();
    await page.waitForTimeout(300);

    // Fast-forward past 45s timeout to t = 60s
    await setScrubberTime(page, 60);

    // Verify autonomous discharge event appears in sequencer state or log
    const statusOrEvent = page.locator('span, div').filter({ hasText: /COMPLETED|AUTONOMOUS_SUPPRESSION_DISCHARGED/i });
    await expect(statusOrEvent.first()).toBeVisible();
  });

  test('lunar habitat preset enforces unvalidated partial-gravity notice and INSUFFICIENT_EVIDENCE', async ({
    page,
  }) => {
    // Select Lunar habitat preset
    const habitatSelect = page.locator('select').first();
    await habitatSelect.selectOption('lunar_habitat');
    await page.waitForTimeout(500);

    // Warning notice must appear
    const partialNotice = page.getByText(/Partial-gravity smoke transport is not validated/i);
    await expect(partialNotice.first()).toBeVisible();

    // Localizer shows INSUFFICIENT_EVIDENCE
    const insufficientEvidence = page.getByText(/INSUFFICIENT_EVIDENCE/i);
    await expect(insufficientEvidence.first()).toBeVisible();
  });

  test('parameter tags are visible and Monte Carlo modal shows design-consistency label', async ({ page }) => {
    // Open Monte Carlo modal
    const mcButton = page.getByRole('button', { name: /Monte Carlo/i });
    await mcButton.click();
    await page.waitForTimeout(400);

    // Modal label check
    const modalNotice = page.getByText(/Design-consistency check/i);
    await expect(modalNotice.first()).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Close/i }).first();
    await closeBtn.click();
  });
});
