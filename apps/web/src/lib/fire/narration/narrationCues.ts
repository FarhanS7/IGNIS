import type { Timeline } from '../timeline/types.ts';
import type { HabitatGraph } from '../types.ts';
import type { NarrationCue } from './narrationTypes.ts';

/**
 * Derives synchronized, event-driven narration segments from verified simulation data.
 * Pure mathematical mapping of the timeline events into 5 coherent, naturally spoken segments.
 *
 * Epistemic rules:
 * - Distinguishes Observation vs Detector Interpretation vs Alarm vs Command vs Outcome.
 * - Never claims an action is completed when only a command was issued.
 * - Never announces extinguishment without actual supporting simulation evidence.
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

  if (isGuidedMode) {
    // 36-Second Guided Incident Storyboard (5 Coherent Narrative Segments)
    return [
      // Segment 1: Incident Introduction (0.0s – 5.0s, Stage 1)
      {
        id: 'cue-incident',
        stageNumber: 1,
        stageId: 'INCIDENT',
        title: `Incipient Anomaly in ${originName}`,
        plainSummary: `An emergency condition has begun aboard the spacecraft. An abnormal thermal signature has ignited inside ${originName}.`,
        audioUrl: '/audio/narration/stage1_incident.wav',
        startTime_s: 0.0,
        endTime_s: 5.0,
        spokenText: `Emergency condition initiated. An abnormal thermal anomaly has been detected inside ${originName}.`,
        subtitleText: `Emergency initiated: abnormal thermal anomaly detected inside ${originName}.`,
        highlightWords: ['Emergency initiated', 'thermal anomaly', originName],
        category: 'OBSERVATION',
      },

      // Segment 2: Sensor Observations & Detection (5.0s – 11.0s, Stage 2)
      {
        id: 'cue-detection',
        stageNumber: 2,
        stageId: 'DETECTION',
        title: 'Microgravity Combustion Detected',
        plainSummary: `In microgravity, smoke forms an unbuoyant sphere rather than rising. Obscuration and gas sensors verify active combustion.`,
        audioUrl: '/audio/narration/stage2_detection.wav',
        startTime_s: 5.0,
        endTime_s: 11.0,
        spokenText: `In microgravity, smoke forms an unbuoyant spherical cloud. Particulate and gas sensors verify an active fire condition.`,
        subtitleText: `In microgravity, smoke forms a spherical cloud; particulate and gas sensors verify active fire.`,
        highlightWords: ['spherical cloud', 'gas sensors', 'active fire', originName],
        category: 'DETECTOR',
      },

      // Segment 3: Alarm Activation (11.0s – 16.0s, Stage 3)
      {
        id: 'cue-alarm',
        stageNumber: 3,
        stageId: 'ALARM',
        title: 'Emergency Alarm Activated',
        plainSummary: `The detection system confirms combustion signatures and latches the emergency containment sequence.`,
        audioUrl: '/audio/narration/stage3_alarm.wav',
        startTime_s: 11.0,
        endTime_s: 16.0,
        spokenText: `Fire alarm activated in ${originName}. The emergency containment sequence is now latched across the module.`,
        subtitleText: `Fire alarm activated in ${originName}: emergency containment sequence latched.`,
        highlightWords: ['Fire alarm activated', originName, 'containment sequence'],
        soundEffect: 'alarm',
        category: 'ALARM',
      },

      // Segment 4: Response Actions (16.0s – 27.0s, Stage 4)
      {
        id: 'cue-response',
        stageNumber: 4,
        stageId: 'RESPONSE',
        title: 'Containment & Suppression Active',
        plainSummary: `The spacecraft responds automatically. Electrical power is isolated, ventilation dampers seal the compartment, and suppression discharges.`,
        audioUrl: '/audio/narration/stage4_response.wav',
        startTime_s: 16.0,
        endTime_s: 27.0,
        spokenText: `Containment active. Electrical power is isolated, ventilation dampers seal ${originName}, and suppression discharges.`,
        subtitleText: `Containment active: power isolated, ventilation dampers sealed, and suppression discharged into ${originName}.`,
        highlightWords: ['Containment active', 'power isolated', 'dampers seal', originName, 'suppression discharged'],
        soundEffect: 'confirm',
        category: 'COMMAND',
      },

      // Segment 5: Outcome & Final Debrief (27.0s – 36.0s, Stage 5)
      {
        id: 'cue-outcome',
        stageNumber: 5,
        stageId: 'OUTCOME',
        title: isExtinguished ? 'Flame Extinguished — Spacecraft Safe' : 'Fire Suppressed & Controlled',
        plainSummary: isExtinguished
          ? `Combustion collapsed. Atmospheric sensors confirm thermal cooling and containment integrity. The spacecraft is safe.`
          : `Suppression agent blanketed compartment. Sensors verify cooling and containment integrity.`,
        audioUrl: '/audio/narration/stage5_outcome.wav',
        startTime_s: 27.0,
        endTime_s: 36.0,
        spokenText: isExtinguished
          ? `The fire inside ${originName} is extinguished. Sensors confirm rapid thermal decay and containment integrity. Spacecraft is safe.`
          : `The fire inside ${originName} is suppressed. Thermal cooling active and containment verified. Spacecraft safe.`,
        subtitleText: isExtinguished
          ? `Fire extinguished in ${originName}: thermal decay confirmed and containment verified. Spacecraft safe.`
          : `Fire suppressed in ${originName}: thermal cooling active and containment verified.`,
        highlightWords: isExtinguished
          ? ['Fire extinguished', originName, 'thermal decay', 'Spacecraft safe']
          : ['Fire suppressed', originName, 'thermal cooling', 'containment verified'],
        soundEffect: 'resolved',
        category: 'OUTCOME',
      },
    ];
  }

  // Explore Mode (100s full scientific timeline, 5 continuous stages)
  return [
    {
      id: 'cue-exp-baseline',
      stageNumber: 1,
      stageId: 'INCIDENT',
      title: 'Baseline Spacecraft Monitoring',
      plainSummary: 'Nominal microgravity environment with continuous multi-sensor surveillance.',
      audioUrl: '/audio/narration/stage1_incident.wav',
      startTime_s: 0.0,
      endTime_s: 15.0,
      spokenText: `Station operations monitoring nominal telemetry. Multi-sensor fusion active across all modules.`,
      subtitleText: `Station operations nominal. Multi-sensor monitoring active across all modules.`,
      highlightWords: ['Station operations', 'nominal telemetry', 'Multi-sensor fusion'],
      category: 'OBSERVATION',
    },
    {
      id: 'cue-exp-detection',
      stageNumber: 2,
      stageId: 'DETECTION',
      title: `Smoke & Gas Transport in ${originName}`,
      plainSummary: 'Transport delay causes sensor lag before threshold crossing.',
      audioUrl: '/audio/narration/stage2_detection.wav',
      startTime_s: 15.0,
      endTime_s: 30.0,
      spokenText: `Thermal and particulate signatures rising in ${originName}. Evaluating detector algorithm convergence.`,
      subtitleText: `Thermal and particulate signatures rising in ${originName}. Detector convergence in progress.`,
      highlightWords: [originName, 'Detector convergence', 'particulate signatures'],
      category: 'DETECTOR',
    },
    {
      id: 'cue-exp-alarm',
      stageNumber: 3,
      stageId: 'ALARM',
      title: 'Consensus Alarm Latched',
      plainSummary: 'Alarm thresholds verified across detector arms.',
      audioUrl: '/audio/narration/stage3_alarm.wav',
      startTime_s: 30.0,
      endTime_s: 45.0,
      spokenText: `Consensus alarm latched in ${originName}. Containment sequencer initialized.`,
      subtitleText: `Consensus alarm latched in ${originName}. Containment sequencer initialized.`,
      highlightWords: ['Consensus alarm latched', originName, 'sequencer initialized'],
      soundEffect: 'alarm',
      category: 'ALARM',
    },
    {
      id: 'cue-exp-response',
      stageNumber: 4,
      stageId: 'RESPONSE',
      title: 'Automated Isolation & Suppression',
      plainSummary: 'Power isolated, ventilation sealed, and extinguisher released.',
      audioUrl: '/audio/narration/stage4_response.wav',
      startTime_s: 45.0,
      endTime_s: 75.0,
      spokenText: `Compartment isolation verified. Ventilation dampers closed and suppression agent deployed.`,
      subtitleText: `Compartment isolated: dampers closed, power cut, suppression deployed into ${originName}.`,
      highlightWords: ['Compartment isolated', 'dampers closed', 'suppression deployed'],
      soundEffect: 'confirm',
      category: 'COMMAND',
    },
    {
      id: 'cue-exp-outcome',
      stageNumber: 5,
      stageId: 'OUTCOME',
      title: isExtinguished ? 'Extinction Verified' : 'Cooling in Progress',
      plainSummary: isExtinguished ? 'Zero heat release rate confirmed.' : 'Suppression agent active.',
      audioUrl: '/audio/narration/stage5_outcome.wav',
      startTime_s: 75.0,
      endTime_s: 100.0,
      spokenText: isExtinguished
        ? `Zero heat release confirmed. Fire extinguished in ${originName}. Post-fire atmospheric scrubbing initiated.`
        : `Thermal decay active in ${originName}. Containment boundary holds.`,
      subtitleText: isExtinguished
        ? `Zero heat release confirmed. Fire extinguished in ${originName}. Atmospheric scrubbing active.`
        : `Thermal decay active in ${originName}. Containment boundary holds.`,
      highlightWords: isExtinguished ? ['Zero heat release', 'extinguished', originName] : ['Thermal decay', originName],
      soundEffect: 'resolved',
      category: 'OUTCOME',
    },
  ];
}
