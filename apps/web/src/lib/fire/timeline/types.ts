import type {
  FireScenario,
  HabitatGraph,
  LocalizationCategory,
  RankedZone,
  SequenceStepId,
  SimStepResult,
  StepStatus,
} from '../types.ts';

export interface TimelineZoneSeries {
  zoneId: string;
  zoneName: string;
  timestamps: number[];
  smokeObscuration: number[];
  coPpm: number[];
  temperature_c: number[];
  tempRate_c_per_min: number[];
}

export type ClockEngineId = 'std' | 'cal' | 'ml';

export interface TimelineClockInfo {
  id: ClockEngineId;
  label: string;
  alarmTime_s: number | null;
  state: 'NOMINAL' | 'ADVISORY' | 'FIRE_ALARM' | 'INSUFFICIENT_EVIDENCE';
}

export interface TimelineSequencerEvent {
  stepId: SequenceStepId;
  status: StepStatus;
  triggerTime_s: number;
  description: string;
}

export interface TimelineDuctEdge {
  id: string;
  fromZone: string;
  toZone: string;
  flowVelocity_m_s: number;
  hasIsolationDamper: boolean;
  isClosedAt(t: number): boolean;
}

export interface TimelineCaption {
  tStart_s: number;
  tEnd_s: number;
  text: string;
}

export interface TimelineFrameState {
  t_s: number;
  clocks: {
    std: { time_s: number; isFrozen: boolean; status: string };
    cal: { time_s: number; isFrozen: boolean; status: string };
    ml: { time_s: number; isFrozen: boolean; status: string };
  };
  gapText: string;
  activeCaption: string;
  currentStepData: SimStepResult | undefined;
  activeStageId: SequenceStepId | 'PRE_IGNITION';
  stages: Record<SequenceStepId, StepStatus>;
  isPowerCut: boolean;
  areVentsIsolated: boolean;
  isSuppressionArmed: boolean;
  isSuppressionActive: boolean;
  isFireExtinguished: boolean;
}

export interface Timeline {
  scenario: FireScenario;
  habitat: HabitatGraph;
  duration_s: number;
  dt_s: number;
  steps: SimStepResult[];
  zoneSeries: Record<string, TimelineZoneSeries>;
  clocks: {
    std: TimelineClockInfo;
    cal: TimelineClockInfo;
    ml: TimelineClockInfo;
  };
  gap_s: number | null;
  gapText: string;
  localization: {
    status: LocalizationCategory;
    sourceZoneId?: string;
    rankedZones: RankedZone[];
    availableAt_s: number;
  };
  sequencerEvents: TimelineSequencerEvent[];
  ducts: TimelineDuctEdge[];
  captions: TimelineCaption[];
  getStateAt(t: number): TimelineFrameState;
}

