/**
 * TypeScript API Types mirroring IGNIS v1.1 Pydantic backend models.
 * Reference: PRD v1.1 §18, §14, §15, §10, §8 | DECISIONS D-001, D-003, D-013, D-016.
 */

// =============================================================================
// ENUMS & TAXONOMIES
// =============================================================================

export type GravityEnvironment =
  | 'microgravity'
  | 'partial_gravity_lunar'
  | 'partial_gravity_mars'
  | 'earth_gravity'
  | 'variable'
  | 'unknown';

export type FuelType =
  | 'solid'
  | 'liquid'
  | 'gas'
  | 'polymer'
  | 'fabric'
  | 'composite'
  | 'unknown';

export type MaterialFamily =
  | 'pmma'
  | 'cellulose'
  | 'polyethylene'
  | 'fabric_cotton'
  | 'fabric_synthetic'
  | 'thin_solid'
  | 'thick_solid'
  | 'droplet_fuel'
  | 'gas_fuel'
  | 'composite'
  | 'other'
  | 'unknown';

export type ScientificObjective =
  | 'ignition'
  | 'flame_spread'
  | 'extinction'
  | 'sustained_burning'
  | 'flammability_limits'
  | 'smoke_detection'
  | 'material_response'
  | 'suppression'
  | 'general_combustion';

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';

export type DestinationType = 'orbital' | 'moon' | 'mars' | 'custom';

export type EligibilityStatus = 'eligible' | 'eligible_with_warning' | 'ineligible';

export type BehaviorLevel = 'elevated' | 'mixed' | 'limited' | 'insufficient';

export type CoverageLevel = 'high' | 'medium' | 'low';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DataQuality = 'high' | 'medium' | 'low' | 'unreviewed';

export type StoryType =
  | 'science_explainer'
  | 'experiment_story'
  | 'comparison'
  | 'earthdata_bridge';

export type MediaType = 'video' | 'image' | 'diagram' | 'data_visualization';

export type SourceRole =
  | 'primary_scientific'
  | 'normalized_scientific'
  | 'contextual'
  | 'media'
  | 'earth_observation_context'
  | 'derived_by_ignis';

export type SourceRegistry =
  | 'NASA_OPEN_DATA'
  | 'NASA_API'
  | 'NASA_EARTHDATA'
  | 'NASA_PSI'
  | 'OTHER_NASA_REPOSITORY';

// =============================================================================
// ENTITY MODELS
// =============================================================================

export interface Experiment {
  id: string;
  external_id?: string | null;
  source_id?: string | null;
  experiment_family: string;
  title: string;
  summary?: string | null;
  mission_platform?: string | null;
  gravity_environment?: GravityEnvironment | null;
  objectives: ScientificObjective[];
  source_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ExperimentRun {
  id: string;
  experiment_id: string;
  run_label?: string | null;
  fuel_type?: FuelType | null;
  material?: MaterialFamily | null;
  geometry?: string | null;
  gravity_environment?: GravityEnvironment | null;
  oxygen_pct?: number | null;
  pressure_kpa?: number | null;
  airflow_cm_s?: number | null;
  ignition_observed?: boolean | null;
  extinction_observed?: boolean | null;
  flame_spread_observed?: boolean | null;
  observation_summary?: string | null;
  source_url?: string | null;
  data_quality?: DataQuality | null;
  provenance?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface HabitatPreset {
  id: string;
  slug: string;
  display_name: string;
  destination: DestinationType;
  gravity_class?: string | null;
  gravity_value_g?: number | null;
  external_environment_summary?: string | null;
  default_oxygen_pct?: number | null;
  default_pressure_kpa?: number | null;
  default_airflow_cm_s?: number | null;
  default_material?: MaterialFamily | null;
  disclaimer?: string | null;
  provenance?: Record<string, unknown> | null;
}

// =============================================================================
// ELIGIBILITY & MATCHING MODELS
// =============================================================================

export interface ScenarioInput {
  material: MaterialFamily;
  objective?: ScientificObjective;
  gravity_environment?: GravityEnvironment;
  oxygen_pct?: number | null;
  pressure_kpa?: number | null;
  airflow_cm_s?: number | null;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: string[];
  warnings: string[];
  excludedBecause?: string[];
  excluded_because?: string[];
}

export interface FactorExplanation {
  factor: string;
  scenario_value?: string | number | null;
  experiment_value?: string | number | null;
  similarity_score?: number | null;
  active_weight?: number | null;
}

export interface EvidenceMatch {
  run: ExperimentRun;
  experiment: Experiment;
  similarity_score: number;
  coverage_score: number;
  coverage_level: CoverageLevel;
  confidence_level: ConfidenceLevel;
  eligibility: EligibilityResult;
  factor_explanations: FactorExplanation[];
}

export interface BehaviorDimension {
  level: BehaviorLevel;
  description: string;
  supporting_runs_count: number;
  positive_observations: number;
  negative_observations: number;
}

export interface BehaviorProfile {
  flame_spread: BehaviorDimension;
  sustained_burning: BehaviorDimension;
  extinction: BehaviorDimension;
  comparable_experiments_count: number;
  coverage: CoverageLevel;
  confidence: ConfidenceLevel;
  summary: string;
}

export interface AnalysisResult {
  scenario: ScenarioInput;
  matches: EvidenceMatch[];
  behavior_profile: BehaviorProfile;
  total_evaluated: number;
  eligible_count: number;
  excluded_count: number;
}

// =============================================================================
// EXPLORE STORIES & KNOWLEDGE
// =============================================================================

export interface StorySection {
  order: number;
  heading?: string | null;
  content: string;
  media_url?: string | null;
  media_type?: MediaType | null;
  animation_key?: string | null;
  evidence_card?: Record<string, unknown> | null;
  suggested_question?: string | null;
  source_links: string[];
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  story_type: StoryType;
  source_ids: string[];
  experiment_ids: string[];
  earthdata_context?: Record<string, unknown> | null;
  sections: StorySection[];
  published: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  source_role: SourceRole;
  registry: SourceRegistry;
  doi?: string | null;
  url?: string | null;
  description?: string | null;
  retrieved_at?: string | null;
}

// =============================================================================
// ASK IGNIS / CHAT
// =============================================================================

export interface AskRequest {
  question: string;
  scenario_context?: ScenarioInput | null;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface GroundedSourceReference {
  experiment_id?: string;
  title: string;
  doi?: string;
  evidence_level: EvidenceLevel;
  quote?: string;
}

export interface AskResponse {
  answer: string;
  grounded_sources: GroundedSourceReference[];
  confidence: ConfidenceLevel;
  caveats: string[];
}

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

export interface PaginatedExperiments {
  experiments: Experiment[];
  total: number;
  limit: number;
  offset: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
}
