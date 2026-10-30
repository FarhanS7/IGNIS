/**
 * Unified Evidence Run Type Definitions
 * Strict epistemic provenance for NASA PSI flight combustion data.
 */

export type BasisType = 'measured' | 'converted' | 'assumed' | 'missing';

export type FuelClass = 'solid' | 'droplet' | 'gas';

export type GravityRegime =
  | 'microgravity'
  | 'lunar'
  | 'martian'
  | 'terrestrial'
  | 'hypergravity';

export type OutcomeClass =
  | 'sustained'
  | 'extinguished'
  | 'no_ignition'
  | 'unknown';

export interface EvidenceValue<T = number | boolean | null> {
  value: T;
  unit: string | null;
  basis: BasisType;
  source_file: string;
  source_column: string;
  source_row: number;
}

export interface EvidenceRun {
  run_uid: string;
  investigation_id: string;
  platform: string;
  fuel_class: FuelClass;
  material: string;
  gravity_regime: GravityRegime;
  doi: string;
  ntrs_ids: string[];
  frames_shot?: number | null;
  outcome_class: OutcomeClass;
  outcome_source_column: string;
  usable_for_matching: boolean;
  unusable_reasons: string[];
  oxygen_pct: EvidenceValue<number | null>;
  pressure_kpa: EvidenceValue<number | null>;
  flow_cm_s: EvidenceValue<number | null>;
  ignited: EvidenceValue<boolean | null>;
  extinguished: EvidenceValue<boolean | null>;
  spread_rate_mm_s: EvidenceValue<number | null>;
  burn_time_s: EvidenceValue<number | null>;
  co_ppm?: EvidenceValue<number | null>;
  co2_pct?: EvidenceValue<number | null>;
  metadata?: Record<string, unknown>;
}
