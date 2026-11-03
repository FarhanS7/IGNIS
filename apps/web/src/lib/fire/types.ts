import type { RealSolidMatch, SolidScenarioInput } from '../matcher/types.ts';

export type ParameterSourceTag =
  | 'illustrative'
  | `literature:${string}`
  | `calibrated:${string}`
  | `trained:${string}`;

export interface SimParam {
  value: number;
  min: number;
  max: number;
  tag: ParameterSourceTag;
  rationale: string;
}

export type HabitatEnvironment = 'microgravity' | 'lunar_partial_g' | 'martian_partial_g';
export type FuelType = 'cellulose' | 'silicone' | 'kapton' | 'teflon';
export type DetectorChannel = 'smoke_obscuration' | 'carbon_monoxide' | 'temperature_rate';
export type DetectorState = 'NOMINAL' | 'ADVISORY' | 'FIRE_ALARM' | 'INSUFFICIENT_EVIDENCE';
export type SequencerMode = 'CREWED' | 'UNCREWED';

export type SuppressionAgent = 'WATER_MIST' | 'CO2' | 'INERT_GAS_FLOOD';

export type SequenceStepId =
  | 'ALARM'
  | 'REMOVE_POWER'
  | 'ISOLATE_VENTILATION'
  | 'INHIBIT_MAKEUP'
  | 'SUPPRESSION'
  | 'POST_FIRE_RECOVERY';

export type StepStatus = 'PENDING' | 'ARMED' | 'EXECUTING' | 'COMPLETED' | 'OVERRIDDEN' | 'ABORTED';

export type LocalizationCategory = 'CLEAR' | 'CLOSE' | 'AMBIGUOUS' | 'INSUFFICIENT_EVIDENCE';

export interface HabitatZone {
  id: string;
  name: string;
  module: string;
  volume_m3: number;
  equipmentPower_kW: number;
  detectorIds: string[];
  powerState: 'ON' | 'SHEDDING' | 'OFF';
  isIsolated: boolean;
}

export interface VentilationEdge {
  id: string;
  fromZone: string;
  toZone: string;
  ductLength_m: number;
  ductDiameter_m: number;
  flowVelocity_m_s: number;
  hasIsolationDamper: boolean;
  damperState: 'OPEN' | 'CLOSING' | 'CLOSED';
}

export interface HabitatGraph {
  id: string;
  name: string;
  environment: HabitatEnvironment;
  gravity_g: number;
  isCrewed: boolean;
  zones: HabitatZone[];
  edges: VentilationEdge[];
}

export interface SensorReading {
  timestamp_s: number;
  obscuration_pct_m: number;
  co_ppm: number;
  temperature_c: number;
  tempRate_c_per_min: number;
}

export interface DetectorOutput {
  detectorId: string;
  state: DetectorState;
  timestamp_s: number;
  triggeredChannels: DetectorChannel[];
  confidenceNotes: string[];
  provenanceTag: ParameterSourceTag;
}

export interface SensorReadingWindow {
  detectorId: string;
  zoneId: string;
  readings: SensorReading[];
  sampleRate_hz: number;
}

export interface DetectorEngine {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly tag: ParameterSourceTag;
  /**
   * Processes a sensor time-series window and produces a categorical detector output.
   * Interface is designed to allow swapping in a trained ML model (via JSON weights)
   * with zero UI changes.
   */
  evaluate(window: SensorReadingWindow): DetectorOutput;
}

export interface FireScenario {
  id: string;
  habitatId: string;
  sourceZoneId: string;
  fuel: FuelType;
  growthRate: number;
  peakHRR_kW: number;
  nuisanceType: 'dust' | 'aerosol' | 'none';
  seed: number;
  scenarioInput?: SolidScenarioInput;
}

export interface SimStepResult {
  timestamp_s: number;
  zoneEmissions: Record<string, { smoke_mass_g: number; co_mass_g: number; heat_kW: number }>;
  detectorReadings: Record<string, SensorReading>;
  detectorOutputs: Record<string, DetectorOutput>;
}

export interface RankedZone {
  zoneId: string;
  zoneName: string;
  onsetDelay_s: number;
  category: LocalizationCategory;
  rationale: string;
}

export interface LocalizationResult {
  status: LocalizationCategory;
  rankedZones: RankedZone[];
  primaryAlarmDetectorId?: string;
  isPartialGravityUnvalidated?: boolean;
  disclaimer?: string;
}

export interface SequencerPolicy {
  powerRemovalAutomatic: boolean;
  powerRemovalNote: string;
  uncrewedSuppressionTimeout_s: number;
}

export interface SequencerEvent {
  timestamp_s: number;
  stepId: SequenceStepId;
  action: string;
  actor: 'SYSTEM' | 'CREW' | 'GROUND';
  automated: boolean;
  overrideActive: boolean;
  details: string;
}

export interface SequencerStepState {
  status: StepStatus;
  timestamp_s?: number;
  actor: string;
}

export interface SequencerState {
  mode: SequencerMode;
  policy: SequencerPolicy;
  currentStep: SequenceStepId;
  steps: Record<SequenceStepId, SequencerStepState>;
  eventLog: SequencerEvent[];
  suppressionAgentRecommendation?: SuppressionAgent;
  crewSafetyAlerts: string[];
}

export interface ActionEvidenceChip {
  stepId: SequenceStepId;
  actionTitle: string;
  matchedFlightRuns: RealSolidMatch[];
  nasaReferences: string[];
  circularityCaveat: string;
  isWithinFlightEnvelope: boolean;
  warnings: string[];
}

export interface MonteCarloMetrics {
  totalRuns: number;
  baseline: {
    meanDetectionDelay_s: number;
    p95DetectionDelay_s: number;
    nuisanceFalseAlarmRate: number;
    top1ClearAccuracy: number;
  };
  fusion: {
    meanDetectionDelay_s: number;
    p95DetectionDelay_s: number;
    nuisanceFalseAlarmRate: number;
    top1ClearAccuracy: number;
  };
  rankingComparison: {
    fusionBeatsBaselineOnDelay: boolean;
    fusionBeatsBaselineOnFalseAlarms: boolean;
    fusionBeatsBaselineOnLocalization: boolean;
    rankingHoldsAcrossSweep: boolean;
    sweepDiscrepancyNotes?: string;
  };
  label: 'design-consistency check, not validation';
  honestyDisclaimer: string;
}

