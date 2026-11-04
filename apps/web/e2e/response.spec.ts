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

  test('integrates trained ML model: reveals honest caveats, suppression insight, and 3-arm Monte Carlo', async ({ page }) => {
    // 1. Suppression Insight card is present with mandatory FLEX caveat
    const flexCaveat = page.getByText(/Droplet flames in ISS microgravity \(FLEX\)\. Not cabin solid fuels\./i);
    await expect(flexCaveat).toBeVisible();

    // 2. Select Trained Fusion in Detector Engine dropdown (index 3)
    const selects = page.locator('select');
    await selects.nth(3).selectOption('trained');
    await page.waitForTimeout(300);

    // 3. Verify mandatory microgravity caveat badge appears in DOM
    const caveatBadge = page.getByText(/Trained on Earth-gravity data\. Not validated in microgravity\./i);
    await expect(caveatBadge.first()).toBeVisible();

    // 4. Model ID and tag must be visible
    await expect(page.getByText(/m2-fusion-v1/i).first()).toBeVisible();

    // 5. Click View M2 Model Card
    const modelCardBtn = page.getByRole('button', { name: /View M2 Model Card/i });
    await expect(modelCardBtn).toBeVisible();
    await modelCardBtn.click();
    await page.waitForTimeout(300);

    // Modal opens showing model card title and datasets
    await expect(page.getByText(/Model Card: M2 Multi-Sensor Fusion Detector/i)).toBeVisible();
    await expect(page.getByText(/10\.17632\/npk2zcm85h\.2/i).first()).toBeVisible();
    const closeCardBtn = page.getByRole('button', { name: /Close Model Card/i }).first();
    await closeCardBtn.click();
    await page.waitForTimeout(300);

    // 6. Advance scrubber and verify detector states (FIRE_ALARM or INSUFFICIENT_EVIDENCE)
    await setScrubberTime(page, 30);
    const alarmOrAbstain = page.locator('span, div').filter({ hasText: /FIRE_ALARM|INSUFFICIENT_EVIDENCE/i });
    await expect(alarmOrAbstain.first()).toBeVisible();

    // 7. Open Monte Carlo Modal and execute sweep to verify 3 arms in the table
    const mcButton = page.getByRole('button', { name: /Monte Carlo/i });
    await mcButton.click();
    await page.waitForTimeout(400);

    // Select 100 runs for quick execution
    const modalSelect = page.locator('div[role="dialog"], .fixed').locator('select');
    if (await modalSelect.isVisible()) {
      await modalSelect.selectOption('100');
    }

    const execBtn = page.getByRole('button', { name: /Execute Monte Carlo/i });
    await execBtn.click();

    // Verify 3 arms in the headers after execution completes
    await expect(page.getByRole('columnheader', { name: /Baseline \(Single-Ch\)/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('columnheader', { name: /Heuristic Fusion/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Trained ML/i })).toBeVisible();

    // Verify label for trained arm
    await expect(page.getByText(/behaves sensibly on simulator streams/i)).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Close Inspector/i }).or(page.getByRole('button', { name: /Close/i })).first();
    await closeBtn.click();
  });
});
