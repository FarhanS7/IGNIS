/**
 * UI-facing display adapter contracts for Fire Response Console Upgrade.
 *
 * Implements the Simulation Integration Contract from docs/upgrade_kit/docs/SIMULATION_INTEGRATION.md.
 * Strictly separates display representations from protected simulation physics.
 */

/**
 * Data provenance classification.
 * Strictly distinguishes measured flight telemetry from 1D compartment simulations,
 * derived indicators, and illustrative/conceptual overlays.
 */
export type Provenance = 'measured' | 'simulated' | 'derived' | 'illustrative' | 'unavailable';

/**
 * DisplayValue wraps any telemetry channel with explicit epistemic provenance,
 * physical units, timestamps, and data quality indicators.
 */
export interface DisplayValue<T> {
  value: T | null;
  unit?: string;
  timestamp_s?: number;
  provenance: Provenance;
  quality?: 'nominal' | 'stale' | 'interpolated' | 'saturated';
  note?: string;
}

/**
 * 3-Level Progressive Explanation Depth
 */
export type ExplanationDepth = 'quick' | 'science' | 'engineering';

/**
 * Trigger event types for contextual explanations
 */
export type ExplanationTrigger =
  | 'SCENARIO_START'
  | 'ALARM_FIRST'
  | 'DETECTOR_DISAGREEMENT'
  | 'LOCALIZATION_ESTABLISHED'
  | 'POWER_CUT'
  | 'VENT_ISOLATION'
  | 'SUPPRESSION_ARMED'
  | 'SUPPRESSION_DISCHARGED'
  | 'FIRE_EXTINGUISHED'
  | 'POST_FIRE_SAFE';

/**
 * Structured explanation content at 3 progressive levels
 */
export interface ProgressiveExplanation {
  id: string;
  trigger: ExplanationTrigger;
  title: string;
  timestamp_s: number;
  quick: string;
  science: {
    mechanism: string;
    quantities: string[];
    limitation: string;
  };
  engineering: {
    sourceFields: string[];
    thresholds: string[];
    stateTransition: string;
    provenance: string;
  };
}

/**
 * Compartment inspection telemetry snapshot
 */
export interface ModuleTelemetrySnapshot {
  zoneId: string;
  zoneName: string;
  status: 'nominal' | 'warning' | 'fire_alarm' | 'isolated';
  temperature_C: DisplayValue<number>;
  obscuration_m1: DisplayValue<number>;
  co_ppm: DisplayValue<number>;
  o2_percent: DisplayValue<number>;
  damperState: DisplayValue<'OPEN' | 'CLOSING' | 'CLOSED'>;
  powerState: DisplayValue<'ENERGIZED' | 'ISOLATING' | 'DEENERGIZED'>;
  isOriginZone: boolean;
  suppressionAgent?: 'WATER_MIST' | 'INERT_GAS' | 'NONE';
}

/**
 * Detector inspection details
 */
export interface DetectorInspectionData {
  id: 'photoelectric' | 'multi_sensor' | 'ml_fusion';
  name: string;
  tag: string;
  description: string;
  provenance: Provenance;
  primaryChannel: string;
  currentReading: string;
  thresholdCitation: string;
  disagreementReason?: string;
  limitations: string;
}

/**
 * Post-fire outcome audit summary
 */
export interface OutcomeSummaryData {
  status: 'EXTINGUISHED' | 'CONTAINED' | 'UNCONTAINED';
  extinctionTime_s: number;
  totalResponseTime_s: number;
  suppressionMethod: string;
  maxTemperature_C: DisplayValue<number>;
  peakCo_ppm: DisplayValue<number>;
  finalO2_percent: DisplayValue<number>;
  provenanceBasis: string;
  nasaFlightReference: string;
}

