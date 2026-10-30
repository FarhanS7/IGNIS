/**
 * Real-Data Solid Fuel Matching Engine Types.
 * Ported from services/api/app/matching/real_solid.py.
 */

export type OutcomeClass = "frames_recorded" | "extinguished" | "no_ignition" | "unknown";

export type FactorBasis = "measured" | "converted" | "assumed" | "missing" | "derived" | "transcribed";

export interface SolidScenarioInput {
  material: string;
  oxygen_pct: number;
  flow_cm_s: number;
  geometry?: string | null;
  thickness_mm?: number | null;
  pressure_kpa?: number | null;
  gravity_g?: number | null;
}

export interface FactorMatchDetail {
  factor: string;
  scenario_value: any;
  experiment_value: any;
  basis: FactorBasis;
  similarity?: number | null;
  weight?: number | null;
  note?: string | null;
}

export interface TestedEnvelopePoint {
  run_uid: string;
  oxygen_pct: number;
  flow_cm_s: number;
  material: string;
  material_family: string;
  outcome_class: OutcomeClass;
}

export interface SolidEnvelopeData {
  scenario_point: {
    oxygen_pct: number;
    flow_cm_s: number;
  };
  tested_range_o2: [number, number];
  tested_range_flow: [number, number];
  nearest_distance_norm: number;
  outside_tested_range: boolean;
  tested_points: TestedEnvelopePoint[];
}

export interface RealSolidMatch {
  run_uid: string;
  source_file: string;
  source_row: number;
  similarity: number;
  outcome_class: OutcomeClass;
  factors: Record<string, FactorMatchDetail>;
  metadata: Record<string, any>;
}

export interface RealSolidMatchResult {
  scenario: SolidScenarioInput;
  matches: RealSolidMatch[];
  total_evaluated: number;
  envelope: SolidEnvelopeData;
  warnings: string[];
}

export interface MaterialMapEntry {
  raw_string: string;
  family: string;
  geometry: string | null;
  thickness_mm: number | null;
  inferred: boolean;
  notes?: string;
}

export type MaterialMap = Record<string, MaterialMapEntry>;

export interface RawEvidenceSolidRun {
  run_uid: string;
  investigation_id: string;
  platform: string;
  sample_series_id?: string;
  fuel_class: string;
  material?: string | null;
  oxygen_pct: {
    value: number;
    basis: FactorBasis;
    source_file: string;
    source_row: number;
  };
  flow_cm_s: {
    value: number;
    basis: FactorBasis;
    source_file: string;
    source_row: number;
  };
  pressure_kpa: {
    value: number;
    basis: FactorBasis;
  };
  gravity_level?: {
    nominal_g: number;
    basis: string;
  };
  outcome_class: OutcomeClass;
  usable_for_matching: boolean;
  frames_shot?: any;
  outcome_source_column?: string;
  [key: string]: any;
}
