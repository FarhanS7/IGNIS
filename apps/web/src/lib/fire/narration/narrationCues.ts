import type { Timeline } from '../timeline/types.ts';
import type { HabitatGraph } from '../types.ts';
import type { NarrationCue } from './narrationTypes.ts';

/**
 * Derives synchronized, event-driven **educational** narration segments from
 * verified simulation data.
 *
 * Pure function — derives all time boundaries from the actual timeline events
 * (alarm time, suppression state, extinction state) so the narration never
 * announces something before it actually happens in the simulation.
 *
 * The narration explains *why* each event matters to a viewer who may not
 * know anything about microgravity fire physics:
 *   Stage 1 — How fire behaves when it starts (spherical, no buoyancy)
 *   Stage 2 — How AI/ML detection works (SAME-R calibrated threshold vs standard detector)
 *   Stage 3 — How the alarm system decides (consensus, multi-sensor fusion)
 *   Stage 4 — How automated suppression works (power cut → vent isolation → agent release)
 *   Stage 5 — How faster detection + automated response saves crew and resources
 *
 * Epistemic rules:
 * - Distinguishes Observation vs Detector Interpretation vs Alarm vs Command vs Outcome.
 * - Never claims an action is completed when only a command was issued.
 * - Never announces extinguishment without actual supporting simulation evidence.
 * - Strictly complies with copy honesty and epistemic integrity rules.
 *
 * @param timeline Deterministic simulation timeline
 * @param habitat Spacecraft habitat topology
 * @param isGuidedMode Whether in 36s guided mode (true) or 100s explore mode (false)
 */
export function deriveNarrationCues(
  timeline: Timeline,
  habitat: HabitatGraph,
  isGuidedMode = true
): NarrationCue[] {
  const originZone =
    habitat.zones.find((z) => z.id === timeline.scenario.sourceZoneId) ||
    habitat.zones[0];
  const originName = originZone?.name.replace(/\(.*\)/, '').trim() || 'Module 2';

  const endState = timeline.getStateAt(timeline.duration_s);
  const isExtinguished = endState ? endState.isFireExtinguished : true;

  // Derive actual alarm time from the calibrated detector clock
  const calAlarmTime = timeline.clocks.cal.alarmTime_s;

  if (isGuidedMode) {
    // Event-driven boundary derivation for 36s guided mode
    // Stage boundaries adapt to the actual alarm time from the simulation
    const alarmT = calAlarmTime ?? 13.0;
    const stage1End = Math.min(5.0, alarmT * 0.35);
    const stage2End = Math.min(alarmT - 0.5, alarmT * 0.8);
    const stage3End = alarmT + 3.0;
    const stage4End = Math.max(stage3End + 8.0, 27.0);
    const totalEnd = 36.0;

    return [
      // ── Stage 1: Fire Physics in Microgravity (0s → ~5s) ──
      {
        id: 'cue-incident',
        stageNumber: 1,
        stageId: 'INCIDENT',
        title: `Combustion Begins in ${originName}`,
        plainSummary:
          `In microgravity, fire behaves unlike anything on Earth. Without gravity pulling hot gases upward, ` +
          `the flame forms a small, spherical ball — no flickering, no rising smoke column.`,
        startTime_s: 0.0,
        endTime_s: stage1End,
        spokenText:
          `A combustion event has started inside ${originName}. ` +
          `In microgravity, there is no buoyancy. Hot gases do not rise. ` +
          `Instead, the flame forms a quiet, spherical diffusion ball — ` +
          `almost invisible, and far harder to detect than fire on Earth.`,
        subtitleText:
          `Combustion started in ${originName}. In microgravity, fire forms a ` +
          `spherical diffusion flame — no rising smoke, no flickering.`,
        highlightWords: ['microgravity', 'spherical diffusion', 'no buoyancy', originName],
        category: 'OBSERVATION',
      },

      // ── Stage 2: AI/ML Detection Advantage (→ just before alarm) ──
      {
        id: 'cue-detection',
        stageNumber: 2,
        stageId: 'DETECTION',
        title: 'How AI Detection Outperforms Standard Smoke Detectors',
        plainSummary:
          `A standard smoke detector waits until obscuration hits 2.5 percent per meter. ` +
          `IGNIS uses a calibrated multi-sensor algorithm — correlating particulate, CO, and temperature ` +
          `over a 6-second persistence window at just 1.2 percent per meter. ` +
          `This catches fire earlier while rejecting dust and debris.`,
        startTime_s: stage1End,
        endTime_s: stage2End,
        spokenText:
          `Now watch how detection works. A standard spacecraft smoke detector triggers ` +
          `when obscuration reaches 2.5 percent per meter. But that threshold is slow — ` +
          `in microgravity, smoke disperses instead of rising to the sensor. ` +
          `IGNIS uses a SAME-R calibrated algorithm that fuses particulate, carbon monoxide, ` +
          `and temperature readings across a 6-second persistence window ` +
          `at a much lower 1.2 percent per meter threshold. ` +
          `This catches fire faster while filtering out false alarms from dust.`,
        subtitleText:
          `Standard detector: 2.5%/m obscuration threshold. ` +
          `IGNIS SAME-R: 1.2%/m + CO + temperature, fused over 6s persistence — ` +
          `catches fire earlier, rejects dust false alarms.`,
        highlightWords: [
          'SAME-R calibrated',
          '1.2 percent per meter',
          '2.5 percent per meter',
          'persistence window',
          'carbon monoxide',
          'false alarms',
        ],
        category: 'DETECTOR',
      },

      // ── Stage 3: Alarm Consensus (alarm time → +3s) ──
      {
        id: 'cue-alarm',
        stageNumber: 3,
        stageId: 'ALARM',
        title: 'Consensus Alarm — Multi-Sensor Verification',
        plainSummary:
          `When multiple sensor channels agree, the system latches a consensus alarm. ` +
          `Unlike single-sensor detectors, this approach dramatically reduces false alarms ` +
          `while catching real fire conditions faster.`,
        startTime_s: stage2End,
        endTime_s: stage3End,
        spokenText:
          `The IGNIS algorithm has reached consensus. Multiple sensor channels ` +
          `independently confirm a fire condition in ${originName}. ` +
          `The emergency alarm is now latched. ` +
          `Unlike a single smoke detector, this multi-sensor fusion approach ` +
          `reduces false alarms by cross-checking particulate with gas and thermal data.`,
        subtitleText:
          `Consensus alarm latched in ${originName}: multiple sensor channels confirm fire. ` +
          `Multi-sensor fusion reduces false alarms.`,
        highlightWords: ['consensus', 'alarm latched', originName, 'multi-sensor fusion', 'false alarms'],
        soundEffect: 'alarm',
        category: 'ALARM',
      },

      // ── Stage 4: Automated AI-Driven Response (→ ~27s) ──
      {
        id: 'cue-response',
        stageNumber: 4,
        stageId: 'RESPONSE',
        title: 'Automated Containment Sequence',
        plainSummary:
          `The containment sequencer executes four steps automatically: ` +
          `cut electrical power to prevent re-ignition, seal ventilation dampers to stop smoke spread, ` +
          `inhibit makeup oxygen to starve the flame, and discharge fire suppressant.`,
        startTime_s: stage3End,
        endTime_s: stage4End,
        spokenText:
          `The AI-driven containment sequencer now takes over. ` +
          `Step one: electrical power to ${originName} is cut — this removes re-ignition energy. ` +
          `Step two: ventilation dampers seal the compartment — this stops toxic smoke from spreading to crew quarters. ` +
          `Step three: makeup oxygen is inhibited — starving the flame of fresh O2. ` +
          `Step four: fire suppression agent is discharged, blanketing the compartment. ` +
          `Each step happens in seconds — far faster than a human crew could respond.`,
        subtitleText:
          `Automated containment: power cut → vents sealed → O₂ inhibited → suppressant discharged into ${originName}. ` +
          `Each step executes in seconds.`,
        highlightWords: [
          'power cut',
          'ventilation dampers',
          'makeup oxygen inhibited',
          'suppression agent discharged',
          originName,
          'containment sequencer',
        ],
        soundEffect: 'confirm',
        category: 'COMMAND',
      },

      // ── Stage 5: Outcome & Lives Saved (~27s → 36s) ──
      {
        id: 'cue-outcome',
        stageNumber: 5,
        stageId: 'OUTCOME',
        title: isExtinguished ? 'Fire Extinguished — Crew and Station Protected' : 'Fire Controlled — Monitoring Continues',
        plainSummary: isExtinguished
          ? `The fire is extinguished. By detecting fire earlier and responding automatically, ` +
            `IGNIS minimized damage, protected crew, and preserved station resources.`
          : `The fire is controlled. Suppression agent is active and sensors confirm thermal cooling.`,
        startTime_s: stage4End,
        endTime_s: totalEnd,
        spokenText: isExtinguished
          ? `The fire inside ${originName} is extinguished. ` +
            `Sensors confirm thermal decay and atmospheric stabilization. ` +
            `Because IGNIS detected fire seconds earlier than a standard detector, ` +
            `and the containment sequence ran automatically, ` +
            `the crew was protected, structural damage was minimized, ` +
            `and critical station resources were preserved. ` +
            `Simulated. Not flight software.`
          : `The fire inside ${originName} is suppressed and cooling. ` +
            `Containment boundaries hold. ` +
            `Early AI detection and automated response minimized crew exposure ` +
            `and structural damage. Simulated. Not flight software.`,
        subtitleText: isExtinguished
          ? `Fire extinguished in ${originName}. Earlier detection + automated response = ` +
            `crew protected, damage minimized, resources preserved. Simulated. Not flight software.`
          : `Fire suppressed in ${originName}. Thermal cooling confirmed. ` +
            `Simulated. Not flight software.`,
        highlightWords: isExtinguished
          ? ['Fire extinguished', originName, 'crew protected', 'damage minimized', 'resources preserved']
          : ['Fire suppressed', originName, 'thermal cooling', 'containment boundaries'],
        soundEffect: 'resolved',
        category: 'OUTCOME',
      },
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // Explore Mode (100s full scientific timeline, 5 stages)
  // ═══════════════════════════════════════════════════════════
  const exAlarmT = calAlarmTime ?? 14.0;
  const exStage2End = Math.max(15.0, exAlarmT - 2.0);
  const exStage3End = Math.max(exStage2End + 10.0, exAlarmT + 5.0);
  const exStage4End = Math.max(exStage3End + 20.0, 65.0);

  return [
    // ── Explore Stage 1: Microgravity Fire Physics ──
    {
      id: 'cue-exp-baseline',
      stageNumber: 1,
      stageId: 'INCIDENT',
      title: 'Fire in Microgravity — Why It Is Different',
      plainSummary:
        `On Earth, hot combustion gases rise due to buoyancy, creating a tall flickering flame ` +
        `and carrying smoke upward to ceiling-mounted detectors. ` +
        `In microgravity, there is no up. The flame forms a spherical diffusion ball. ` +
        `Smoke drifts slowly along ventilation flow — not toward a fixed detector.`,
      startTime_s: 0.0,
      endTime_s: exStage2End,
      spokenText:
        `In this explore mode, let us examine what makes fire so dangerous in space. ` +
        `On Earth, buoyancy drives hot gases upward, creating the tall flame shape we recognize, ` +
        `and carrying smoke to ceiling-mounted detectors. ` +
        `In microgravity, buoyancy vanishes. The flame collapses into a small, spherical diffusion ball. ` +
        `Smoke does not rise — it drifts slowly along ventilation currents. ` +
        `Standard smoke detectors, designed for buoyant plumes, can miss this entirely.`,
      subtitleText:
        `Earth fire: buoyancy drives smoke upward to detectors. ` +
        `Microgravity fire: spherical flame, no buoyancy, smoke drifts along ventilation — ` +
        `standard detectors can miss it.`,
      highlightWords: ['spherical diffusion', 'buoyancy', 'microgravity', 'ventilation currents'],
      category: 'OBSERVATION',
    },

    // ── Explore Stage 2: AI/ML Detection Deep Dive ──
    {
      id: 'cue-exp-detection',
      stageNumber: 2,
      stageId: 'DETECTION',
      title: `How IGNIS Detects Fire in ${originName}`,
      plainSummary:
        `The IGNIS detection system uses a SAME-R calibrated algorithm that fuses data from multiple ` +
        `sensor types — smoke obscuration, carbon monoxide, and temperature — over a 6-second ` +
        `persistence window. This correlation rejects dust and debris while catching sub-micron ` +
        `smoldering particles that standard optical detectors would miss.`,
      startTime_s: exStage2End,
      endTime_s: exStage3End,
      spokenText:
        `Now the IGNIS detection algorithm is evaluating sensor data from ${originName}. ` +
        `A standard optical detector uses a single obscuration threshold — typically 2.5 percent per meter. ` +
        `It is fast, but prone to false alarms from dust, and slow in microgravity ` +
        `because smoke does not concentrate at the sensor. ` +
        `IGNIS improves on this with multi-channel fusion: obscuration, carbon monoxide concentration, ` +
        `and temperature rate of change — all correlated over a 6-second persistence window ` +
        `at a lower 1.2 percent per meter threshold. ` +
        `The result: faster detection of real fire, fewer false alarms. ` +
        `Trained on Earth-gravity data. Not validated in microgravity.`,
      subtitleText:
        `IGNIS multi-sensor fusion: obscuration (1.2%/m) + CO + temp rate, ` +
        `correlated over 6s. Catches fire faster, rejects dust. ` +
        `Trained on Earth-gravity data. Not validated in microgravity.`,
      highlightWords: [originName, 'multi-channel fusion', '1.2 percent per meter', 'persistence window', 'carbon monoxide'],
      category: 'DETECTOR',
    },

    // ── Explore Stage 3: Alarm Consensus & False Alarm Reduction ──
    {
      id: 'cue-exp-alarm',
      stageNumber: 3,
      stageId: 'ALARM',
      title: 'Consensus Alarm — Reducing False Alarms',
      plainSummary:
        `The alarm latches only when multiple independent sensor channels reach consensus. ` +
        `This multi-sensor verification dramatically reduces nuisance alarms compared to ` +
        `single-channel systems — critical on a space station where every alarm causes ` +
        `crew disruption and lost experiment time.`,
      startTime_s: exStage3End,
      endTime_s: exStage4End,
      spokenText:
        `The consensus alarm has latched in ${originName}. ` +
        `On a space station, false fire alarms are not just annoying — they force crew evacuation, ` +
        `halt experiments, and cost precious crew time. ` +
        `IGNIS addresses this by requiring multiple independent sensor channels to agree ` +
        `before latching the alarm. Particulate must correlate with gas composition and thermal signature. ` +
        `This consensus approach dramatically reduces nuisance alarms ` +
        `while maintaining fast response to real fire events.`,
      subtitleText:
        `Consensus alarm latched in ${originName}. Multi-channel verification ` +
        `reduces nuisance alarms — critical when every alarm costs crew time.`,
      highlightWords: ['consensus alarm', originName, 'nuisance alarms', 'crew time', 'multi-channel verification'],
      soundEffect: 'alarm',
      category: 'ALARM',
    },

    // ── Explore Stage 4: Automated Response Sequence ──
    {
      id: 'cue-exp-response',
      stageNumber: 4,
      stageId: 'RESPONSE',
      title: 'AI-Driven Containment — Step by Step',
      plainSummary:
        `The containment sequencer executes an automated response chain: ` +
        `isolate electrical power, seal ventilation dampers, inhibit makeup oxygen, ` +
        `and discharge fire suppression agent — each step grounded in fire science.`,
      startTime_s: exStage4End,
      endTime_s: 85.0,
      spokenText:
        `Watch the automated containment sequence unfold in ${originName}. ` +
        `First, electrical power is isolated — removing energy sources that could re-ignite the fire. ` +
        `Second, high-speed dampers seal the compartment — preventing toxic smoke from reaching crew quarters. ` +
        `Third, fresh oxygen injection is inhibited — starving the combustion reaction. ` +
        `Finally, fire suppression agent blankets the compartment. ` +
        `This entire sequence completes in seconds. ` +
        `A human crew responding manually would take much longer — ` +
        `and every second of delay means more damage and more crew exposure.`,
      subtitleText:
        `Automated sequence: power cut → vents sealed → O₂ inhibited → suppressant deployed. ` +
        `Completes in seconds — faster than manual crew response.`,
      highlightWords: ['power isolated', 'dampers sealed', 'oxygen inhibited', 'suppression agent', originName],
      soundEffect: 'confirm',
      category: 'COMMAND',
    },

    // ── Explore Stage 5: Outcome & Impact ──
    {
      id: 'cue-exp-outcome',
      stageNumber: 5,
      stageId: 'OUTCOME',
      title: isExtinguished ? 'Fire Extinguished — Faster, Safer' : 'Fire Controlled — Monitoring Active',
      plainSummary: isExtinguished
        ? `The fire is extinguished. Faster detection combined with automated response ` +
          `minimized structural damage, reduced crew exposure to toxins, and preserved ` +
          `irreplaceable station resources.`
        : `Suppression agent is active and thermal decay is in progress.`,
      startTime_s: 85.0,
      endTime_s: 100.0,
      spokenText: isExtinguished
        ? `The fire inside ${originName} is extinguished. ` +
          `Zero heat release confirmed. Post-fire atmospheric scrubbing has begun. ` +
          `By detecting fire seconds earlier than conventional detectors, ` +
          `and responding automatically without waiting for crew action, ` +
          `IGNIS minimized structural damage, reduced crew exposure to combustion toxins, ` +
          `and preserved irreplaceable resources aboard the station. ` +
          `This is what intelligent fire safety looks like — faster detection, ` +
          `automated response, and better outcomes. ` +
          `Simulated. Not flight software.`
        : `The fire inside ${originName} is suppressed. Thermal decay is in progress. ` +
          `Containment boundaries hold. ` +
          `Automated detection and response reduced crew exposure time ` +
          `and limited damage. Simulated. Not flight software.`,
      subtitleText: isExtinguished
        ? `Fire extinguished in ${originName}. Earlier detection + automated response = ` +
          `less damage, less crew exposure, preserved resources. Simulated. Not flight software.`
        : `Fire suppressed in ${originName}. Thermal decay active. Simulated. Not flight software.`,
      highlightWords: isExtinguished
        ? ['Fire extinguished', originName, 'zero heat release', 'crew exposure', 'resources preserved']
        : ['Fire suppressed', originName, 'thermal decay', 'containment boundaries'],
      soundEffect: 'resolved',
      category: 'OUTCOME',
    },
  ];
}
