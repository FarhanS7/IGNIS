# Step 0 Agent Report: Recon and Honest Scenario Scout

**Date:** 2026-11-07  
**Branch:** `feature/hero-station`  
**Step:** Step 0 — Recon and Honest Scenario Scout  

---

## 1. Files Created and Modified
- **Files Created:**
  - `apps/web/scripts/scout_scenarios.ts` (standalone throwaway headless evaluation script; zero app imports)
  - `docs/hero_kit/reports/step0_scout.md` (complete 40-scenario grid table and gap analysis across 3 seeds)
  - `docs/hero_kit/reports/step0_agent_report.md` (this comprehensive reconnaissance report)
- **Files Modified:**
  - Zero existing app source files modified (`.gitignore` updated to track `docs/hero_kit/`).
  - Protected files untouched (`sim.ts`, `detectors.ts`, `localizer.ts`, `responseSequencer.ts`, `sim_params.ts`, and `lib/fire/ml/`).

---

## 2. Headless Scenario Execution Architecture (10 Lines or Fewer)

```typescript
// Verified in apps/web/src/lib/fire/sim.ts, detectors.ts, localizer.ts, responseSequencer.ts
const sim = new FireSimulator({ id: 'scout', habitatId, sourceZoneId, fuel, growthRate: 0.05, peakHRR_kW: 8.0, nuisanceType: 'none', seed }, habitat);
const steps: SimStepResult[] = sim.run(100.0); // (a) per-zone sensor series at dt = 0.5s in steps[i].detectorReadings
attachDetectorOutputs(detector, steps, habitat); // (b) per-detector alarm times in steps[i].detectorOutputs[detId].state === 'FIRE_ALARM'
const locResult: LocalizationResult = localizeSmokeSource(habitat, steps); // (c) localization status in locResult.status ('CLEAR'|'AMBIGUOUS')
const seq = new ResponseSequencer(habitat, 'CREWED'); // (d) sequencer FSM events
if (firstAlarm) seq.triggerAlarm(firstAlarm.zoneId, firstAlarm.time_s);
seq.update(t); // steps['ALARM'|'REMOVE_POWER'|'ISOLATE_VENTILATION'|'INHIBIT_MAKEUP'|'SUPPRESSION'].status
```

*Verified files & functions:*
- `apps/web/src/lib/fire/sim.ts`: `FireSimulator.run(totalTime_s)`
- `apps/web/src/lib/fire/detectors.ts`: `attachDetectorOutputs(detector, steps, habitat)`
- `apps/web/src/lib/fire/localizer.ts`: `localizeSmokeSource(habitat, steps)`
- `apps/web/src/lib/fire/responseSequencer.ts`: `ResponseSequencer.triggerAlarm()`, `ResponseSequencer.update()`

---

## 3. Simulator Data Contracts & Exposed Channels

**Yes**, the simulator exposes duct flow velocities and per-zone sensor series at a fixed time step:
- **Time step:** Fixed $\Delta t = 1.0 / \text{sampleRate\_hz} = 0.5\text{s}$ ($\text{sample\_rate\_hz} = 2.0\text{ Hz}$ in `SIM_PARAMS.sample_rate_hz`).
- **Per-Zone Sensor Series (`SimStepResult` in `apps/web/src/lib/fire/types.ts:118-123`):**
  ```typescript
  export interface SimStepResult {
    timestamp_s: number;
    zoneEmissions: Record<string, { smoke_mass_g: number; co_mass_g: number; heat_kW: number }>;
    detectorReadings: Record<string, SensorReading>;
    detectorOutputs: Record<string, DetectorOutput>;
  }
  ```
  Where `SensorReading` (`types.ts:69-75`) contains:
  - `timestamp_s: number;`
  - `obscuration_pct_m: number;`
  - `co_ppm: number;`
  - `temperature_c: number;`
  - `tempRate_c_per_min: number;`
- **Duct Flow Velocities (`VentilationEdge` in `apps/web/src/lib/fire/types.ts:48-58`):**
  ```typescript
  export interface VentilationEdge {
    id: string;
    fromZone: string;
    toZone: string;
    ductLength_m: number;
    ductDiameter_m: number;
    flowVelocity_m_s: number; // e.g. 0.20 m/s
    hasIsolationDamper: boolean;
    damperState: 'OPEN' | 'CLOSING' | 'CLOSED';
  }
  ```

---

## 4. Honest Gap Findings Across Arms & Fuels

From the 120 headless runs logged in `docs/hero_kit/reports/step0_scout.md`:

1. **Large-Particle Combustion (`cellulose` / `cotton`, `silicone`):**
   - **Baseline Photoelectric:** Alarms at **12.5s – 13.0s**.
   - **Heuristic Fusion:** Alarms at **15.0s – 15.5s**.
   - **Trained ML Fusion:** Alarms at **50.0s**.
   - *Honest Gap:* Baseline is **2.0s – 2.5s FASTER** than Heuristic Fusion because Heuristic Fusion requires a 5.0s persistence window check (`SIM_PARAMS.fusion_persistence_s.value = 5.0`).
   - *Localization:* **`CLEAR`** (100% correct source zone identified with $> 6.0\text{s}$ delay before downstream zone alarms).
2. **Sub-Micron Smoldering Combustion (`kapton`, `teflon` wire insulation):**
   - **Baseline Photoelectric:** **NEVER ALARMS** within 100s (`null`)!  
     *Physical Reason:* `FireSimulator` scales optical obscuration by `smallParticlePenalty = 0.257` (`calibrated:m1-same-r`, PMC7918997). Obscuration never reaches the 2.5 %/m alarm threshold.
   - **Heuristic Fusion:** Alarms at **16.5s** (detects toxic CO rise $> 15\text{ ppm}$, unaffected by optical scattering penalty).
   - **Trained ML Fusion:** Alarms at **50.0s**.
   - *Honest Gap:* Heuristic Fusion is **$> 83.5\text{s}$ faster** (Baseline never alarms).
   - *Localization:* Returns **`INSUFFICIENT_EVIDENCE`** because downstream detectors never reach alarm threshold in 100s, failing the 2-alarm gradient requirement.
3. **Lunar Habitat (`lunar_habitat`):**
   - Always returns **`INSUFFICIENT_EVIDENCE`** with an unvalidated partial-gravity disclaimer by design (`ZoneLocalizer` rule 1).

---

## 5. UI Labels & Recommended "Naive Baseline" Race Pairing

### Current Detector Implementations & Exact UI Labels:
1. `BaselineSmokeDetector` (`detectors.ts:28-36`)  
   - Tag: `calibrated:m1-same-r` (carries the NASA SAME-R small-particle response calibration)  
   - UI Select Label: **`Baseline (photoelectric)`** (`ResponseConsolePage.tsx:360`)
2. `HeuristicFusionDetector` (`detectors.ts:109-120`)  
   - Tag: `illustrative` (multi-sensor persistence evaluating obscuration, CO, thermal rate)  
   - UI Select Label: **`Heuristic fusion`** (`ResponseConsolePage.tsx:359`)
3. `TrainedMLDetector` (`ml/trainedDetector.ts:18`)  
   - Tag: `trained:m2-fusion-v1` (L2 logistic regression + conformal abstention)  
   - UI Select Label: **`Trained fusion (Earth-gravity data)`** (`ResponseConsolePage.tsx:361`)

### Recommended Scenarios for the 3D Demo:

#### Recommendation A (Best for High Drama / NASA Physics Story):
- **Scenario:** `iss_like_module`, Fuel: **`teflon`** (or **`kapton`** electrical wire insulation), Origin Zone: **`zone_1` (Avionics Bay)**.
- **The Story:**
  - Standard single-channel photoelectric detector is blinded by the sub-micron particle penalty (NASA SAME-R finding: Teflon smoke particles are $\sim 0.05\,\mu\text{m}$, scattering too little light to trigger optical obscuration). It **never alarms**.
  - Multi-sensor fusion alarms at **t = 16.5s** via Carbon Monoxide detection.
  - Demonstrates the life-critical value of multi-sensor fusion in microgravity.

#### Recommendation B (Best for Complete Localization Gradient & Predictable Clocks):
- **Scenario:** `iss_like_module`, Fuel: **`cellulose`**, Origin Zone: **`zone_1` (Avionics Bay)**.
- **The Story:**
  - Baseline (photoelectric) alarms at **t = 13.0s**.
  - Heuristic Fusion alarms at **t = 15.0s** (confirming multi-channel persistence).
  - Localization is **`CLEAR`** (identifies `zone_1` Avionics Bay with 9.5s separation before `zone_2` alarms at t = 22.5s).
  - Both clocks freeze deterministically within 15 seconds.

---

## 6. Verification and Test Results
- Ran `.\docs\hero_kit\scripts\verify.ps1 -Step 0`:
  - `[PASS] protected files untouched (vs hero-baseline)`
  - `[PASS] banned claim terms in new code`
  - `[PASS] non-determinism (Math.random / Date.now)`
  - `[PASS] unit tests pass=211 fail=0`
  - `[PASS] build`
- Report generated at: `docs/hero_kit/reports/step0_verify.txt`.

---

## 7. What Was Verified vs What Could Not Be Verified
- **VERIFIED:** Full simulation execution across 120 parameter permutations, deterministic alarm timestamps, localization status, and lack of code breakage in `npm test` and `npm run build`.
- **NOT VERIFIED:** Visual 3D WebGL rendering (intentionally out of scope for Step 0 recon).

---

## 8. Exact Commands to Reproduce Result
```powershell
# 1. Run the headless scenario scout
node --experimental-strip-types apps/web/scripts/scout_scenarios.ts

# 2. Run the Step 0 verification suite
powershell -ExecutionPolicy Bypass -File .\docs\hero_kit\scripts\verify.ps1 -Step 0
```

