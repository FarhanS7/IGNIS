/**
 * Scene Storyboard & Incident Progression Resolver
 *
 * Implements two experience modes:
 * Mode A: Guided Incident (30–40s target duration, default)
 *   Stage 1: Incident (3–4s) — Full spacecraft overview; identify affected module & show fire inside.
 *   Stage 2: Detection (5–6s) — Camera zooms into affected module; sensor evidence & detector interpretation.
 *   Stage 3: Alarm (3–4s) — Clear alarm activation with simple explanation.
 *   Stage 4: Response (10–12s) — Camera pulls back; response actions one at a time (What happened → Why → What changed).
 *   Stage 5: Outcome (5–7s) — Return to affected module; show actual fire condition.
 *   Stage 6: Summary (3–4s) — Final spacecraft view and concise incident summary.
 *
 * Mode B: Explore Full Simulation (100s detailed scientific timeline)
 *   Detailed multi-sensor divergence, 6 sequence steps, full 100s telemetry.
 *
 * Epistemic rules:
 * - Distinguishes Observation vs Detector Decision vs Alarm vs Sequencer vs Outcome.
 * - Never invents flight status, false certainty, or promotional claims.
 */

export interface ResponseActionDetail {
  actionName: string;
  whatHappened: string;
  whyItHappened: string;
  whatChanged: string;
}

export interface StoryboardSceneInfo {
  stageNumber: number;
  totalStages: number;
  stageId: 'INCIDENT' | 'DETECTION' | 'ALARM' | 'RESPONSE' | 'OUTCOME' | 'SUMMARY';
  stageName: string;
  title: string;
  plainSummary: string;
  consequence: string;
  provenance: string;
  category: 'OBSERVATION' | 'DETECTOR' | 'ALARM' | 'SEQUENCER' | 'OUTCOME';
  responseAction?: ResponseActionDetail;
  // Backwards compatibility properties
  sceneNumber: number;
  totalScenes: number;
  sceneId: string;
}

export function resolveStoryboardScene(
  t: number,
  alarmTime_s: number | null,
  isSuppressionArmed: boolean,
  isSuppressionActive: boolean,
  isFireExtinguished: boolean,
  isGuidedMode = false
): StoryboardSceneInfo {
  const totalStages = 6;
  const primaryAlarm = alarmTime_s ?? 14.0;

  // --- MODE A: GUIDED INCIDENT STORYBOARD (36s Target Duration) ---
  if (isGuidedMode) {
    // Stage 6: Summary (32s – 36s)
    if (t >= 32.0) {
      return {
        stageNumber: 6,
        totalStages,
        stageId: 'SUMMARY',
        stageName: 'Summary',
        title: 'Incident Summary & Debrief',
        plainSummary: 'The fire emergency was detected, isolated, and extinguished within 36 seconds.',
        consequence: 'The spacecraft emergency is resolved; atmospheric cleanup is in progress.',
        provenance: 'SIMULATED SUMMARY',
        category: 'OUTCOME',
        sceneNumber: 6,
        totalScenes: 6,
        sceneId: 'SUMMARY',
      };
    }

    // Stage 5: Outcome (26s – 32s)
    if (t >= 26.0) {
      const outcomeTitle = isFireExtinguished
        ? 'Fire Extinguished'
        : isSuppressionActive
        ? 'Fire Suppressed & Collapsing'
        : 'Fire Controlled';

      const outcomeSummary = isFireExtinguished
        ? 'The fire is extinguished inside the affected compartment.'
        : 'Suppression agent is active and the flame reaction has collapsed.';

      return {
        stageNumber: 5,
        totalStages,
        stageId: 'OUTCOME',
        stageName: 'Outcome',
        title: outcomeTitle,
        plainSummary: outcomeSummary,
        consequence: 'Atmospheric sensors verify thermal cooling and particulate stabilization.',
        provenance: 'SIMULATED OUTCOME',
        category: 'OUTCOME',
        sceneNumber: 5,
        totalScenes: 6,
        sceneId: 'OUTCOME',
      };
    }

    // Stage 4: Response (14s – 26s) — Presenting actions one at a time
    if (t >= 14.0) {
      let actionDetail: ResponseActionDetail;

      if (t < 16.0) {
        actionDetail = {
          actionName: 'Power Cut',
          whatHappened: 'Electrical power was cut to the affected module.',
          whyItHappened: 'Eliminates potential electrical short-circuits and re-ignition energy.',
          whatChanged: 'Non-essential avionics and equipment racks switched off.',
        };
      } else if (t < 17.5) {
        actionDetail = {
          actionName: 'Ventilation Sealed',
          whatHappened: 'High-speed isolation dampers closed on all module air ducts.',
          whyItHappened: 'Stops smoke and toxic gases from spreading into crew quarters.',
          whatChanged: 'Module airflow isolated; particulate transport blocked.',
        };
      } else if (t < 19.0) {
        actionDetail = {
          actionName: 'Inhibit Makeup Gas',
          whatHappened: 'Fresh cabin oxygen and nitrogen replenishment was inhibited.',
          whyItHappened: 'Prevents fresh oxygen from feeding the combustion reaction.',
          whatChanged: 'Gas injection valves sealed; cabin atmosphere locked.',
        };
      } else {
        actionDetail = {
          actionName: 'Fire Suppression Released',
          whatHappened: 'Fire suppression system armed and confirmed.',
          whyItHappened: 'Discharges extinguishing agent to starve and cool the flame.',
          whatChanged: 'Agent blankets the compartment; flame visibly shrinks.',
        };
      }

      return {
        stageNumber: 4,
        totalStages,
        stageId: 'RESPONSE',
        stageName: 'Response',
        title: `Response: ${actionDetail.actionName}`,
        plainSummary: actionDetail.whatHappened,
        consequence: actionDetail.whyItHappened,
        provenance: 'SEQUENCER ACTION',
        category: 'SEQUENCER',
        responseAction: actionDetail,
        sceneNumber: 4,
        totalScenes: 6,
        sceneId: 'RESPONSE',
      };
    }

    // Stage 3: Alarm (10s – 14s)
    if (t >= 10.0 || (alarmTime_s !== null && t >= alarmTime_s - 1.0)) {
      return {
        stageNumber: 3,
        totalStages,
        stageId: 'ALARM',
        stageName: 'Alarm',
        title: 'Fire Alarm Activated',
        plainSummary: 'Fire alarm activated because the detector identified a fire condition.',
        consequence: 'The system locks the alarm state and initiates the automated containment sequence.',
        provenance: 'ALARM STATE TRANSITION',
        category: 'ALARM',
        sceneNumber: 3,
        totalScenes: 6,
        sceneId: 'ALARM',
      };
    }

    // Stage 2: Detection (4s – 10s)
    if (t >= 4.0) {
      return {
        stageNumber: 2,
        totalStages,
        stageId: 'DETECTION',
        stageName: 'Detection',
        title: 'Sensor Detection & Evaluation',
        plainSummary: 'Smoke obscuration and gas sensors detect changes in the affected compartment.',
        consequence: 'The detection system evaluates incoming sensor data to verify a fire condition.',
        provenance: 'DETECTOR INTERPRETATION',
        category: 'DETECTOR',
        sceneNumber: 2,
        totalScenes: 6,
        sceneId: 'DETECTION',
      };
    }

    // Stage 1: Incident (0s – 4s)
    return {
      stageNumber: 1,
      totalStages,
      stageId: 'INCIDENT',
      stageName: 'Incident',
      title: 'Normal Spacecraft Operations — Fire Starts',
      plainSummary: 'A combustion incident begins inside the monitored spacecraft compartment.',
      consequence: 'In zero gravity, smoke forms a localized spherical diffusion flame without rising.',
      provenance: 'MONITORED BASELINE',
      category: 'OBSERVATION',
      sceneNumber: 1,
      totalScenes: 6,
      sceneId: 'INCIDENT',
    };
  }

  // --- MODE B: EXPLORE FULL SIMULATION STORYBOARD (100s Timeline) ---
  // Scene 6: Extinction and Recovery (When fire is extinguished or late scenario)
  if (isFireExtinguished || t >= 40.0) {
    return {
      stageNumber: 6,
      totalStages,
      stageId: 'SUMMARY',
      stageName: 'Recovery',
      title: 'Flame Extinguished & Atmosphere Recovery',
      plainSummary: 'The fire is extinguished inside the affected compartment.',
      consequence: 'Atmospheric scrubbers filter residual smoke; life support returns to nominal recirc.',
      provenance: 'SIMULATED OUTCOME',
      category: 'OUTCOME',
      sceneNumber: 6,
      totalScenes: 6,
      sceneId: 'EXTINCTION',
    };
  }

  // Scene 5: Containment Sequencer (Suppression Armed / Active)
  if (isSuppressionActive) {
    return {
      stageNumber: 5,
      totalStages,
      stageId: 'RESPONSE',
      stageName: 'Suppression',
      title: 'Active Suppression Discharge',
      plainSummary: 'Suppression agent discharged into the affected compartment.',
      consequence: 'Extinguishing agent floods the module; reaction rate diminishes rapidly.',
      provenance: 'CONTAINMENT SEQUENCER',
      category: 'SEQUENCER',
      sceneNumber: 5,
      totalScenes: 6,
      sceneId: 'SUPPRESSION',
    };
  }

  if (isSuppressionArmed) {
    return {
      stageNumber: 5,
      totalStages,
      stageId: 'RESPONSE',
      stageName: 'Armed',
      title: 'Suppression Armed — Human Gate',
      plainSummary: 'Duct dampers sealed and electrical power cut; suppression agent armed.',
      consequence: 'Crewed mode requires manual human confirmation before discharging suppression agent.',
      provenance: 'CONTAINMENT SEQUENCER',
      category: 'SEQUENCER',
      sceneNumber: 5,
      totalScenes: 6,
      sceneId: 'ARMED',
    };
  }

  // Scene 4: Alarm State Latched
  if (t >= primaryAlarm) {
    return {
      stageNumber: 4,
      totalStages,
      stageId: 'ALARM',
      stageName: 'Alarm',
      title: 'Fire Alarm Latched',
      plainSummary: 'Calibrated detector confirmed fire condition and triggered cabin-wide alarm.',
      consequence: 'Containment sequencer initiates automatic ventilation shutdown and power isolation.',
      provenance: 'ALARM STATE TRANSITION',
      category: 'ALARM',
      sceneNumber: 4,
      totalScenes: 6,
      sceneId: 'ALARM',
    };
  }

  // Scene 3: Detection Divergence (Pre-alarm evaluation)
  if (t >= 10.0) {
    return {
      stageNumber: 3,
      totalStages,
      stageId: 'DETECTION',
      stageName: 'Detection',
      title: 'Multi-Sensor Detection Divergence',
      plainSummary: 'Standard optical vs multi-sensor fusion trade threshold speed against dust-rejection persistence.',
      consequence: 'SAME-R calibrated fusion correlates CO and obscuration over 6 s, rejecting dust and catching sub-micron wire smolder.',
      provenance: 'DETECTOR INTERPRETATION',
      category: 'DETECTOR',
      sceneNumber: 3,
      totalScenes: 6,
      sceneId: 'DETECTION',
    };
  }

  // Scene 2: Incipient Ignition & Transport
  if (t >= 4.0) {
    return {
      stageNumber: 2,
      totalStages,
      stageId: 'INCIDENT',
      stageName: 'Ignition',
      title: 'Incipient Ignition & Transport',
      plainSummary: 'Incipient combustion begins within the origin compartment.',
      consequence: 'Without buoyancy, spherical smoke slowly disperses along mechanical ventilation lines.',
      provenance: 'SIMULATED SENSORS',
      category: 'OBSERVATION',
      sceneNumber: 2,
      totalScenes: 6,
      sceneId: 'IGNITION',
    };
  }

  // Scene 1: Normal Spacecraft Operations
  return {
    stageNumber: 1,
    totalStages,
    stageId: 'INCIDENT',
    stageName: 'Baseline',
    title: 'Normal Spacecraft Operations',
    plainSummary: 'Atmospheric telemetry across all compartments is nominal.',
    consequence: 'Background particle counters and air velocity sensors operate at baseline values.',
    provenance: 'MONITORED BASELINE',
    category: 'OBSERVATION',
    sceneNumber: 1,
    totalScenes: 6,
    sceneId: 'NORMAL',
  };
}
