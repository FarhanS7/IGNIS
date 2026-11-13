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
    await page.goto('/response?view=inspect');
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

  test('verifies StationDemoPage hero view at /response with race clocks and view toggle', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // 1. Honesty badges visible
    const honestyBadge = page.getByText(/Simulated\.\s*Not flight software\./i);
    await expect(honestyBadge).toBeVisible();

    const mlBadge = page.getByText(/Trained on Earth-gravity data\.\s*Not validated in microgravity\./i).first();
    await expect(mlBadge).toBeVisible();

    // 2. Race clocks visible
    await expect(page.getByText(/Standard detector/i)).toBeVisible();
    await expect(page.getByText(/Calibrated detector/i).first()).toBeVisible();
    await expect(page.getByText(/SAME-R calibrated/i)).toBeVisible();

    // 3. Playback scrubber reachable
    const scrubber = page.locator('input[type="range"]');
    await expect(scrubber).toBeVisible();

    // 4. View toggle to inspect console via Details menu
    await page.getByRole('button', { name: /Details/i }).click();
    const inspectBtn = page.getByRole('button', { name: /Inspect Console/i });
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    // 5. Inspect console loads
    await page.waitForURL(/view=inspect/);
    const consoleHeading = page.getByRole('heading', { name: /FIRE RESPONSE CONSOLE/i });
    await expect(consoleHeading).toBeVisible();
  });

  test('verifies crewed hold-to-confirm suppression gate at /response', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Seek scrubber forward to suppression armed state (t = 18s)
    const scrubber = page.locator('input[type="range"]');
    await scrubber.fill('18');
    await page.waitForTimeout(300);

    // Verify hold to confirm button appears
    const gateBtn = page.getByRole('button', { name: /Hold to confirm fire suppression/i });
    await expect(gateBtn).toBeVisible();

    // Verify keyboard hint is visible
    await expect(page.getByText(/Press and hold for 1\.2 seconds/i)).toBeVisible();

    // Verify FLEX droplet caveat chip is visible
    await expect(page.getByText(/Droplet flames in ISS microgravity \(FLEX\)\. Not cabin solid fuels\./i)).toBeVisible();

    // Press and hold Space key for 1.3s to confirm
    await gateBtn.focus();
    await page.keyboard.down('Space');
    await page.waitForTimeout(1350);
    await page.keyboard.up('Space');
    await page.waitForTimeout(400);

    // Gate should close after confirmation
    await expect(gateBtn).not.toBeVisible();
  });

  test('verifies progressive explanation drawer with 3 depth tabs (quick, science, engineering)', async ({
    page,
  }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // 1. Open explanation drawer via details menu
    await page.getByRole('button', { name: /Details/i }).click();
    const explainBtn = page.getByRole('button', { name: /Explain/i });
    await expect(explainBtn).toBeVisible();
    await explainBtn.click();

    const drawer = page.getByRole('region', { name: /Contextual Explanation Drawer/i });
    await expect(drawer).toBeVisible();

    // 2. Default Quick depth is selected
    await expect(page.getByText(/Plain Language Summary/i)).toBeVisible();

    // 3. Switch to Science depth tab
    const scienceTab = page.getByRole('button', { name: /^Science$/i });
    await scienceTab.click();
    await expect(page.getByText(/Physical Transport Mechanism/i)).toBeVisible();
    await expect(page.getByText(/Model Limitations/i)).toBeVisible();

    // 4. Switch to Engineering depth tab
    const engTab = page.getByRole('button', { name: /^Engineering$/i });
    await engTab.click();
    await expect(page.getByText(/Authoritative State Transition/i)).toBeVisible();
    await expect(page.getByText(/Underlying Telemetry Fields/i)).toBeVisible();
    await expect(page.getByText(/Engineering Thresholds & Criteria/i)).toBeVisible();

    // 5. Close drawer via close button
    const closeBtn = page.getByRole('button', { name: /Close explanation drawer/i });
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test('verifies interactive module telemetry inspection and granularity disclosure', async ({
    page,
  }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Click module button in details menu
    await page.getByRole('button', { name: /Details/i }).click();
    const compBtn = page.getByRole('button', { name: /Inspect compartment/i }).first();
    await expect(compBtn).toBeVisible();
    await compBtn.click();

    // Verify module telemetry drawer appears
    const moduleDrawer = page.getByRole('dialog', { name: /Module telemetry inspection/i });
    await expect(moduleDrawer).toBeVisible();

    // Verify telemetry channels
    await expect(moduleDrawer.getByText(/SMOKE OBSCURATION/i)).toBeVisible();
    await expect(moduleDrawer.getByText(/CARBON MONOXIDE/i)).toBeVisible();
    await expect(moduleDrawer.getByText(/TEMPERATURE/i)).toBeVisible();
    await expect(moduleDrawer.getByText(/OXYGEN \(O2\)/i)).toBeVisible();
    await expect(moduleDrawer.getByText(/Ventilation Dampers/i)).toBeVisible();
    await expect(moduleDrawer.getByText(/Payload Power/i)).toBeVisible();

    // Verify spatial granularity disclosure
    await expect(moduleDrawer.getByText(/Spatial Model Granularity/i)).toBeVisible();
    await expect(moduleDrawer.getByText(/compartment-averaged values/i)).toBeVisible();

    // Close drawer
    const closeBtn = page.getByRole('button', { name: /Close module inspection drawer/i });
    await closeBtn.click();
    await expect(moduleDrawer).not.toBeVisible();
  });

  test('verifies detector card inspection and disagreement modal', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Click SAME-R calibrated detector card
    const calArmBtn = page.getByRole('button', { name: /Inspect SAME-R calibrated/i });
    await expect(calArmBtn).toBeVisible();
    await calArmBtn.click();

    // Modal opens
    const modal = page.getByRole('dialog', { name: /SAME-R Calibrated/i });
    await expect(modal).toBeVisible();

    // Verifies algorithm, thresholds, channels, and disagreement
    await expect(page.getByText(/Detection Algorithm & Logic/i)).toBeVisible();
    await expect(page.getByText(/Trigger Threshold/i)).toBeVisible();
    await expect(page.getByText(/Primary Sensor Channels/i)).toBeVisible();
    await expect(page.getByText(/Sensor Disagreement & Benchmark Notes/i)).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Close detector modal/i });
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    // Click ML detector card in details menu and verify honest Earth-gravity caveat
    await page.getByRole('button', { name: /Details/i }).click();
    const mlArmBtn = page.getByRole('button', { name: /Inspect machine learning fusion/i });
    await mlArmBtn.click();
    const mlModal = page.getByRole('dialog', { name: /ML Fusion|Machine Learning/i });
    await expect(mlModal.getByText(/Trained on Earth-gravity data\. Not validated in microgravity\./i)).toBeVisible();

    const mlCloseBtn = page.getByRole('button', { name: /Close detector modal/i });
    await mlCloseBtn.click();
  });

  test('verifies camera controls toolbar buttons', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Camera toolbar buttons in details menu
    await page.getByRole('button', { name: /Details/i }).click();
    const rotateLeft = page.getByRole('button', { name: /Rotate camera left/i });
    const rotateRight = page.getByRole('button', { name: /Rotate camera right/i });
    const zoomIn = page.getByRole('button', { name: /Zoom camera in/i });
    const zoomOut = page.getByRole('button', { name: /Zoom camera out/i });
    const resetCamera = page.getByRole('button', { name: /Reset camera view/i });

    await expect(rotateLeft).toBeVisible();
    await expect(rotateRight).toBeVisible();
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    await expect(resetCamera).toBeVisible();

    // Click each control
    await rotateLeft.click();
    await rotateRight.click();
    await zoomIn.click();
    await zoomOut.click();
    await resetCamera.click();
  });

  test('verifies post-fire outcome audit modal upon flame extinction', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Advance scrubber to t = 35s where fire is extinguished
    const scrubber = page.locator('input[type="range"]');
    await scrubber.fill('35');
    await page.waitForTimeout(300);

    // Outcome audit button becomes visible
    const auditBtn = page.getByRole('button', { name: /View NASA Audit|Flame Extinguished — View Audit/i });
    await expect(auditBtn).toBeVisible();
    await auditBtn.click();

    // Outcome modal opens
    const modal = page.getByRole('dialog', { name: /Post-Fire Response Outcome Summary/i });
    await expect(modal).toBeVisible();

    // Epistemic provenance breakdown table
    await expect(page.getByText(/Epistemic Data Classification/i)).toBeVisible();
    await expect(page.getByText(/Droplet Extinction Time/i)).toBeVisible();
    await expect(page.getByText(/Sensor Race & Lead Time/i)).toBeVisible();
    await expect(page.getByText(/1D Compartment Advection/i)).toBeVisible();
    await expect(page.getByText(/3D Smoke Particles/i)).toBeVisible();

    // Close audit
    const closeBtn = page.getByRole('button', { name: /Close Audit/i });
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('verifies floating contextual explanation card and explore why action', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Contextual explanation card is visible
    const card = page.getByRole('region', { name: /Event Explanation Card/i });
    await expect(card).toBeVisible();

    // Expand card to view scene indicator and summary
    const expandBtn = page.getByRole('button', { name: /Expand explanation card/i });
    await expandBtn.click();

    // Scene indicator is visible
    await expect(card.getByText(/Scene 1\/6/i)).toBeVisible();
    await expect(card.getByText(/Normal Spacecraft Operations/i)).toBeVisible();

    // Provenance badge
    await expect(card.getByText(/MONITORED BASELINE/i)).toBeVisible();

    // Collapse card
    const toggleBtn = page.getByRole('button', { name: /Collapse explanation card/i });
    await toggleBtn.click();
    await expect(card.getByText(/Normal Spacecraft Operations/i)).not.toBeVisible();

    // Click "Explore why" action to open progressive explanation drawer
    const exploreBtn = card.getByRole('button', { name: /Explore why/i });
    await exploreBtn.click();

    const drawer = page.getByRole('region', { name: /Contextual Explanation Drawer/i });
    await expect(drawer).toBeVisible();

    const closeDrawerBtn = page.getByRole('button', { name: /Close explanation drawer/i });
    await closeDrawerBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test('verifies scientific visual layers menu and truth labels', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Open layers menu via details menu
    await page.getByRole('button', { name: /Details/i }).click();
    const layersBtn = page.getByRole('button', { name: /Toggle visual layers controls/i });
    await expect(layersBtn).toBeVisible();
    await layersBtn.click();

    // Dialog appears with truth labels
    const layersDialog = page.getByRole('dialog', { name: /Visual Layers and Truth Labels/i });
    await expect(layersDialog).toBeVisible();

    await expect(page.getByText(/COMPARTMENT-AVERAGED TRANSPORT/i)).toBeVisible();
    await expect(page.getByText(/COMPARTMENT-AVERAGED VALUE/i)).toBeVisible();
    await expect(page.getByText(/SIMULATED INTER-ZONE FLOW/i)).toBeVisible();
    await expect(page.getByText(/SENSOR HARDWARE LOCATION/i)).toBeVisible();

    // Toggle Thermal layer checkbox
    const thermalCheckbox = page.getByRole('checkbox', { name: /Toggle Thermal Heat Field/i });
    await expect(thermalCheckbox).toBeVisible();
    await thermalCheckbox.click();

    // Close layers dialog
    const closeBtn = page.getByRole('button', { name: /Close layers menu/i });
    await closeBtn.click();
    await expect(layersDialog).not.toBeVisible();
  });

  test('verifies return to guided camera pill on manual camera interaction', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // Return to guided pill should NOT be visible initially
    const returnPill = page.getByRole('button', { name: /Return to guided camera/i });
    await expect(returnPill).not.toBeVisible();

    // Rotate camera right using toolbar button in details menu
    await page.getByRole('button', { name: /Details/i }).click();
    const rotateRight = page.getByRole('button', { name: /Rotate camera right/i });
    await rotateRight.click();

    // Return to guided camera button now appears in details menu
    await expect(returnPill).toBeVisible();

    // Click return to guided view
    await returnPill.click();

    // Pill hides again
    await expect(returnPill).not.toBeVisible();
  });

  test('verifies voice narration audio controls, subtitles overlay, and term highlighting', async ({ page }) => {
    await page.goto('/response');
    await page.waitForLoadState('domcontentloaded');

    // 1. Audio controls toolbar is visible
    const audioToolbar = page.getByRole('toolbar', { name: /Narration and Audio Controls/i });
    await expect(audioToolbar).toBeVisible();

    // 2. Voice toggle is pressed/enabled by default
    const voiceBtn = page.getByRole('button', { name: /^Voice$/i });
    await expect(voiceBtn).toBeVisible();
    await expect(voiceBtn).toHaveAttribute('aria-pressed', 'true');

    // 3. Subtitles (CC) toggle is enabled by default
    const ccBtn = page.getByRole('button', { name: /^CC$/i });
    await expect(ccBtn).toBeVisible();
    await expect(ccBtn).toHaveAttribute('aria-pressed', 'true');

    // 4. Subtitles overlay region is rendered with mission-control speaker badge
    const subtitlesRegion = page.getByRole('region', { name: /Synchronized Emergency Subtitles/i });
    await expect(subtitlesRegion).toBeVisible();
    await expect(subtitlesRegion.getByText(/Flight Operations Voice/i)).toBeVisible();
    await expect(subtitlesRegion.getByText(/Stage 1/i)).toBeVisible();

    // 5. Toggle subtitles OFF hides the overlay
    await ccBtn.click();
    await expect(subtitlesRegion).not.toBeVisible();

    // 6. Toggle subtitles back ON restores the overlay
    await ccBtn.click();
    await expect(subtitlesRegion).toBeVisible();

    // 7. Toggle voice OFF
    await voiceBtn.click();
    await expect(voiceBtn).toHaveAttribute('aria-pressed', 'false');

    // 8. Replay audio button is present and clickable
    const replayBtn = page.getByRole('button', { name: /Replay current voice narration/i });
    await expect(replayBtn).toBeVisible();
    await replayBtn.click();
  });
});
