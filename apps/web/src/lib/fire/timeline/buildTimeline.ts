/**
 * Deterministic Timeline Builder.
 * Precomputes multi-detector simulation outputs, race clocks, source localization,
 * containment sequencer progression, and dynamic captions as a pure function of scenario config.
 *
 * Grounded in:
 * - apps/web/src/lib/fire/sim.ts (FireSimulator)
 * - apps/web/src/lib/fire/detectors.ts (BaselineSmokeDetector, HeuristicFusionDetector, TrainedMLDetector)
 * - apps/web/src/lib/fire/localizer.ts (localizeSmokeSource)
 * - apps/web/src/lib/fire/responseSequencer.ts (ResponseSequencer)
 * - docs/hero_kit/DECISION.md & SHOT_LIST.md
 */

import { getHabitatById, getHabitatPresets } from '../habitat.ts';
import { FireSimulator } from '../sim.ts';
import {
  BaselineSmokeDetector,
  HeuristicFusionDetector,
  createTrainedDetector,
  attachDetectorOutputs,
} from '../detectors.ts';
import { localizeSmokeSource } from '../localizer.ts';
import { ResponseSequencer } from '../responseSequencer.ts';
import type {
  FireScenario,
  FuelType,
  HabitatGraph,
  SequenceStepId,
  SequencerMode,
  SimStepResult,
  StepStatus,
} from '../types.ts';
import type {
  Timeline,
  TimelineCaption,
  TimelineClockInfo,
  TimelineDuctEdge,
  TimelineFrameState,
  TimelineSequencerEvent,
  TimelineZoneSeries,
} from './types.ts';

export interface BuildTimelineOptions {
  habitatId?: string;
  fuel?: FuelType;
  sourceZoneId?: string;
  seed?: number;
  mode?: SequencerMode;
  growthRate?: number;
  peakHRR_kW?: number;
  duration_s?: number;
  crewConfirmDelay_s?: number; // Delay in seconds after suppression is armed until crew confirms (default: 8.0s)
}

function getFirstAlarmTimestamp(steps: SimStepResult[]): { time_s: number | null; detectorId: string | null } {
  for (const step of steps) {
    for (const [detId, out] of Object.entries(step.detectorOutputs)) {
      if (out.state === 'FIRE_ALARM') {
        return { time_s: step.timestamp_s, detectorId: detId };
      }
    }
  }
  return { time_s: null, detectorId: null };
}

export function buildTimeline(options: BuildTimelineOptions = {}): Timeline {
  const habitatPresets = getHabitatPresets();
  const habitatId = options.habitatId || 'iss_like_module';
  const habitat: HabitatGraph = getHabitatById(habitatId) || habitatPresets[0];

  const fuel: FuelType = options.fuel || 'cellulose';
  const sourceZoneId = options.sourceZoneId || habitat.zones[0]?.id || 'zone_1';
  const seed = options.seed ?? 42;
  const mode: SequencerMode = options.mode || 'CREWED';
  const growthRate = options.growthRate ?? 0.05;
  const peakHRR_kW = options.peakHRR_kW ?? 8.0;
  const duration_s = options.duration_s ?? 100.0;
  const crewConfirmDelay_s = options.crewConfirmDelay_s ?? 8.0;

  const scenario: FireScenario = {
    id: `timeline_${habitatId}_${fuel}_${sourceZoneId}`,
    habitatId,
    sourceZoneId,
    fuel,
    growthRate,
    peakHRR_kW,
    nuisanceType: 'none',
    seed,
  };

  // 1. Run deterministic headless simulation
  const sim = new FireSimulator(scenario, habitat);
  const rawSteps = sim.run(duration_s);
  const dt_s = rawSteps.length > 1 ? rawSteps[1].timestamp_s - rawSteps[0].timestamp_s : 0.5;

  // 2. Evaluate all 3 detector arms over step copies
  // Arm 1: Baseline Photoelectric (Standard)
  const baseSteps: SimStepResult[] = JSON.parse(JSON.stringify(rawSteps));
  const baseDetector = new BaselineSmokeDetector();
  attachDetectorOutputs(baseDetector, baseSteps, habitat);
  const baseAlarm = getFirstAlarmTimestamp(baseSteps).time_s;

  // Arm 2: Heuristic Fusion (SAME-R Calibrated / Multi-Sensor)
  const calSteps: SimStepResult[] = JSON.parse(JSON.stringify(rawSteps));
  const calDetector = new HeuristicFusionDetector();
  attachDetectorOutputs(calDetector, calSteps, habitat);
  const calAlarm = getFirstAlarmTimestamp(calSteps).time_s;

  // Arm 3: Trained ML Fusion
  const mlSteps: SimStepResult[] = JSON.parse(JSON.stringify(rawSteps));
  const mlDetector = createTrainedDetector();
  attachDetectorOutputs(mlDetector, mlSteps, habitat);
  const mlAlarm = getFirstAlarmTimestamp(mlSteps).time_s;

  // Merged steps for the timeline: use calSteps (primary multi-sensor reference)
  const steps = calSteps;

  // 3. Extract per-zone time series
  const zoneSeries: Record<string, TimelineZoneSeries> = {};
  for (const zone of habitat.zones) {
    const primaryDetId = zone.detectorIds[0] || `det_${zone.id}`;
    const series: TimelineZoneSeries = {
      zoneId: zone.id,
      zoneName: zone.name,
      timestamps: [],
      smokeObscuration: [],
      coPpm: [],
      temperature_c: [],
      tempRate_c_per_min: [],
    };
    for (const step of steps) {
      series.timestamps.push(step.timestamp_s);
      const r = step.detectorReadings[primaryDetId];
      if (r) {
        series.smokeObscuration.push(r.obscuration_pct_m);
        series.coPpm.push(r.co_ppm);
        series.temperature_c.push(r.temperature_c);
        series.tempRate_c_per_min.push(r.tempRate_c_per_min);
      } else {
        series.smokeObscuration.push(0);
        series.coPpm.push(0);
        series.temperature_c.push(21.5);
        series.tempRate_c_per_min.push(0);
      }
    }
    zoneSeries[zone.id] = series;
  }

  // 4. Clocks configuration
  const clocks: { std: TimelineClockInfo; cal: TimelineClockInfo; ml: TimelineClockInfo } = {
    std: {
      id: 'std',
      label: 'Standard',
      alarmTime_s: baseAlarm,
      state: baseAlarm !== null ? 'FIRE_ALARM' : 'NOMINAL',
    },
    cal: {
      id: 'cal',
      label: 'SAME-R calibrated',
      alarmTime_s: calAlarm,
      state: calAlarm !== null ? 'FIRE_ALARM' : 'NOMINAL',
    },
    ml: {
      id: 'ml',
      label: 'ML fusion',
      alarmTime_s: mlAlarm,
      state: mlAlarm !== null ? 'FIRE_ALARM' : 'NOMINAL',
    },
  };

  // Gap computation
  let gap_s: number | null = null;
  let gapText = 'Standard waiting';
  if (baseAlarm !== null && calAlarm !== null) {
    gap_s = Math.round(Math.abs(baseAlarm - calAlarm) * 10) / 10;
    if (calAlarm < baseAlarm) {
      gapText = `${gap_s.toFixed(0)} s earlier`;
    } else if (calAlarm > baseAlarm) {
      gapText = `${gap_s.toFixed(0)} s later`;
    } else {
      gapText = 'Synchronous';
    }
  } else if (calAlarm !== null && baseAlarm === null) {
    gapText = 'Standard detector still waiting';
  }

  // 5. Localization inference
  const fullLoc = localizeSmokeSource(habitat, steps);
  const sourceZoneObj = habitat.zones.find((z) => z.id === sourceZoneId);
  const sourceZoneName = sourceZoneObj ? sourceZoneObj.name : sourceZoneId;

  // Determine when localization becomes available
  // It requires at least 2 zones alarmed for microgravity, or first alarm
  let locAvailableAt_s = calAlarm ?? 20.0;
  for (let idx = 1; idx < steps.length; idx++) {
    const subSteps = steps.slice(0, idx);
    const subLoc = localizeSmokeSource(habitat, subSteps);
    if (subLoc.status === 'CLEAR' || subLoc.status === 'CLOSE') {
      locAvailableAt_s = steps[idx - 1].timestamp_s;
      break;
    }
  }

  const localization = {
    status: fullLoc.status,
    sourceZoneId: fullLoc.rankedZones[0]?.zoneId || sourceZoneId,
    rankedZones: fullLoc.rankedZones,
    availableAt_s: locAvailableAt_s,
  };

  // 6. Response Sequencer Progression
  const seq = new ResponseSequencer(habitat, mode);
  const primaryAlarmTime = calAlarm ?? 15.0;
  seq.triggerAlarm(sourceZoneId, primaryAlarmTime);

  // Auto-actions triggered immediately at alarm
  const powerCutTime_s = primaryAlarmTime;
  const ventsIsolatedTime_s = primaryAlarmTime + 1.0;
  const makeupInhibitedTime_s = primaryAlarmTime + 1.5;
  const suppressionArmedTime_s = primaryAlarmTime + 2.0;

  let suppressionConfirmTime_s = suppressionArmedTime_s + crewConfirmDelay_s;
  if (mode === 'UNCREWED') {
    // Uncrewed timeout from SIM_PARAMS
    suppressionConfirmTime_s = suppressionArmedTime_s + 5.0;
  }
  const suppressionDischargedTime_s = suppressionConfirmTime_s + 1.5;
  const flameExtinguishedTime_s = suppressionDischargedTime_s + 4.0;
  const postFireRecoveryTime_s = flameExtinguishedTime_s + 2.0;

  const sequencerEvents: TimelineSequencerEvent[] = [
    {
      stepId: 'ALARM',
      status: 'COMPLETED',
      triggerTime_s: primaryAlarmTime,
      description: `Fire alarm confirmed in source zone "${sourceZoneId}".`,
    },
    {
      stepId: 'REMOVE_POWER',
      status: 'COMPLETED',
      triggerTime_s: powerCutTime_s,
      description: 'Equipment power cut to prevent electrical re-ignition.',
    },
    {
      stepId: 'ISOLATE_VENTILATION',
      status: 'COMPLETED',
      triggerTime_s: ventsIsolatedTime_s,
      description: 'Ventilation isolation dampers closed across ducts.',
    },
    {
      stepId: 'INHIBIT_MAKEUP',
      status: 'COMPLETED',
      triggerTime_s: makeupInhibitedTime_s,
      description: 'Habitat atmospheric makeup gas supply inhibited.',
    },
    {
      stepId: 'SUPPRESSION',
      status: 'COMPLETED',
      triggerTime_s: suppressionConfirmTime_s,
      description: 'Fire suppression agent discharged after confirmation.',
    },
    {
      stepId: 'POST_FIRE_RECOVERY',
      status: 'COMPLETED',
      triggerTime_s: postFireRecoveryTime_s,
      description: 'Atmospheric scrubbers activated for post-fire recovery.',
    },
  ];

  // 7. Ventilation Duct Edges
  const ducts: TimelineDuctEdge[] = habitat.edges.map((edge) => ({
    id: edge.id,
    fromZone: edge.fromZone,
    toZone: edge.toZone,
    flowVelocity_m_s: edge.flowVelocity_m_s,
    hasIsolationDamper: edge.hasIsolationDamper,
    isClosedAt: (t: number) => t >= ventsIsolatedTime_s,
  }));

  // 8. Dynamic Captions (Following docs/hero_kit/SHOT_LIST.md)
  // Max 6 words per caption; strictly driven by timeline event timestamps
  const captions: TimelineCaption[] = [
    {
      tStart_s: 0.0,
      tEnd_s: Math.max(3.0, primaryAlarmTime * 0.25),
      text: 't = 0',
    },
    {
      tStart_s: Math.max(3.0, primaryAlarmTime * 0.25),
      tEnd_s: Math.max(6.0, primaryAlarmTime * 0.6),
      text: 'Smoke drifts. It does not rise.',
    },
    {
      tStart_s: Math.max(6.0, primaryAlarmTime * 0.6),
      tEnd_s: primaryAlarmTime,
      text: 'Sensors react',
    },
    {
      tStart_s: primaryAlarmTime,
      tEnd_s: locAvailableAt_s,
      text: 'Alarm. Locating the source.',
    },
    {
      tStart_s: locAvailableAt_s,
      tEnd_s: ventsIsolatedTime_s + 1.0,
      text: `Source found: ${sourceZoneName.split(' ')[0]}`,
    },
    {
      tStart_s: ventsIsolatedTime_s + 1.0,
      tEnd_s: suppressionArmedTime_s + 1.0,
      text: 'Power cut. Vents closed.',
    },
  ];

  if (baseAlarm === null || baseAlarm > suppressionArmedTime_s) {
    captions.push({
      tStart_s: suppressionArmedTime_s + 1.0,
      tEnd_s: suppressionConfirmTime_s,
      text: 'Standard detector still waiting',
    });
  } else if (gap_s !== null && gap_s > 0) {
    captions.push({
      tStart_s: suppressionArmedTime_s + 1.0,
      tEnd_s: suppressionConfirmTime_s,
      text: `${gap_s.toFixed(0)} seconds earlier`,
    });
  }

  captions.push(
    {
      tStart_s: suppressionConfirmTime_s,
      tEnd_s: suppressionDischargedTime_s + 1.0,
      text: mode === 'CREWED' ? 'Crew decides. Hold to confirm.' : 'Autonomous suppression authorized.',
    },
    {
      tStart_s: suppressionDischargedTime_s + 1.0,
      tEnd_s: flameExtinguishedTime_s,
      text: mode === 'CREWED' ? 'Crew confirms. Suppressing.' : 'Suppression agent discharged.',
    },
    {
      tStart_s: flameExtinguishedTime_s,
      tEnd_s: postFireRecoveryTime_s + 4.0,
      text: 'Fire out.',
    },
    {
      tStart_s: postFireRecoveryTime_s + 4.0,
      tEnd_s: duration_s,
      text: 'Every number traces to NASA.',
    }
  );

  // 9. State evaluation function
  function getStateAt(t: number): TimelineFrameState {
    const clampedT = Math.max(0, Math.min(duration_s, t));

    // Clock freeze calculations
    const stdFrozen = clocks.std.alarmTime_s !== null && clampedT >= clocks.std.alarmTime_s;
    const stdTime = stdFrozen ? (clocks.std.alarmTime_s as number) : clampedT;

    const calFrozen = clocks.cal.alarmTime_s !== null && clampedT >= clocks.cal.alarmTime_s;
    const calTime = calFrozen ? (clocks.cal.alarmTime_s as number) : clampedT;

    const mlFrozen = clocks.ml.alarmTime_s !== null && clampedT >= clocks.ml.alarmTime_s;
    const mlTime = mlFrozen ? (clocks.ml.alarmTime_s as number) : clampedT;

    // Caption lookup
    let activeCap = captions[0]?.text || '';
    for (const c of captions) {
      if (clampedT >= c.tStart_s && clampedT < c.tEnd_s) {
        activeCap = c.text;
        break;
      }
    }
    if (clampedT >= (captions[captions.length - 1]?.tStart_s || 0)) {
      activeCap = captions[captions.length - 1]?.text || '';
    }

    // Step index
    const stepIdx = Math.min(steps.length - 1, Math.floor(clampedT / dt_s));
    const currentStepData = steps[stepIdx];

    // Stage progression
    const stages: Record<SequenceStepId, StepStatus> = {
      ALARM: clampedT >= primaryAlarmTime ? 'COMPLETED' : 'PENDING',
      REMOVE_POWER: clampedT >= powerCutTime_s ? 'COMPLETED' : 'PENDING',
      ISOLATE_VENTILATION: clampedT >= ventsIsolatedTime_s ? 'COMPLETED' : 'PENDING',
      INHIBIT_MAKEUP: clampedT >= makeupInhibitedTime_s ? 'COMPLETED' : 'PENDING',
      SUPPRESSION:
        clampedT >= suppressionDischargedTime_s
          ? 'COMPLETED'
          : clampedT >= suppressionConfirmTime_s
          ? 'EXECUTING'
          : clampedT >= suppressionArmedTime_s
          ? 'ARMED'
          : 'PENDING',
      POST_FIRE_RECOVERY: clampedT >= postFireRecoveryTime_s ? 'COMPLETED' : 'PENDING',
    };

    let activeStageId: SequenceStepId | 'PRE_IGNITION' = 'PRE_IGNITION';
    if (clampedT >= postFireRecoveryTime_s) activeStageId = 'POST_FIRE_RECOVERY';
    else if (clampedT >= suppressionConfirmTime_s) activeStageId = 'SUPPRESSION';
    else if (clampedT >= makeupInhibitedTime_s) activeStageId = 'INHIBIT_MAKEUP';
    else if (clampedT >= ventsIsolatedTime_s) activeStageId = 'ISOLATE_VENTILATION';
    else if (clampedT >= powerCutTime_s) activeStageId = 'REMOVE_POWER';
    else if (clampedT >= primaryAlarmTime) activeStageId = 'ALARM';

    return {
      t_s: clampedT,
      clocks: {
        std: {
          time_s: stdTime,
          isFrozen: stdFrozen,
          status: stdFrozen ? 'alarm' : clampedT > 0 ? 'counting' : 'ready',
        },
        cal: {
          time_s: calTime,
          isFrozen: calFrozen,
          status: calFrozen ? 'alarm' : clampedT > 0 ? 'counting' : 'ready',
        },
        ml: {
          time_s: mlTime,
          isFrozen: mlFrozen,
          status: mlFrozen ? 'alarm' : clampedT > 0 ? 'counting' : 'ready',
        },
      },
      gapText: stdFrozen && calFrozen ? gapText : calFrozen ? 'Standard detector still waiting' : '',
      activeCaption: activeCap,
      currentStepData,
      activeStageId,
      stages,
      isPowerCut: clampedT >= powerCutTime_s,
      areVentsIsolated: clampedT >= ventsIsolatedTime_s,
      isSuppressionArmed: clampedT >= suppressionArmedTime_s && clampedT < suppressionConfirmTime_s,
      isSuppressionActive: clampedT >= suppressionConfirmTime_s && clampedT < flameExtinguishedTime_s,
      isFireExtinguished: clampedT >= flameExtinguishedTime_s,
    };
  }

  return {
    scenario,
    habitat,
    duration_s,
    dt_s,
    steps,
    zoneSeries,
    clocks,
    gap_s,
    gapText,
    localization,
    sequencerEvents,
    ducts,
    captions,
    getStateAt,
  };
}

