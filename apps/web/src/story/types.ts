/**
 * Story Mode v2 - Data Schema & Types
 * Reusable data-driven specification for interactive science chapters.
 */

import type { EvidenceLevel, ScenarioInput } from '../types/api';

export type StoryMode = 'quick' | 'full';

export type BeatType =
  | 'hook'
  | 'predict'
  | 'reveal'
  | 'why'
  | 'check'
  | 'real-world'
  | 'takeaway';

export type AvatarExpression =
  | 'curious'
  | 'surprised'
  | 'thinking'
  | 'proud'
  | 'serious';

export interface AvatarCue {
  expression: AvatarExpression;
  speech: string;
  intensity?: number; // 0.0 (dim/quenched) to 1.0 (flaring/excited)
}

export type EvidenceTagType = 'measured' | 'simplified';

export interface EvidenceRef {
  type: EvidenceTagType;
  /** Primary NASA flight campaign ID (e.g. FLEX-1, Saffire-I) */
  experimentId?: string;
  /** Primary test run ID from fixtures */
  runId?: string;
  /** Linked publication / technical report document ID */
  sourceDocId?: string;
  /** Citation label (e.g., NASA TM-2015-218820) */
  citationLabel?: string;
  /** Provenance tier level A-E */
  provenanceLevel?: EvidenceLevel;
  /** Specific telemetry or experimental detail cited */
  telemetryNote?: string;
  /** Explanatory note if simplified */
  simplificationNote?: string;
}

export interface GlossaryItem {
  term: string;
  pronunciation?: string;
  shortDefinition: string;
  plainAnalogy: string;
  relatedBeatId?: string;
}

export interface PredictChoice {
  id: string;
  label: string;
  shapePreview: 'teardrop' | 'sphere' | 'flat' | 'spark';
  feedbackTitle: string;
  feedbackText: string;
  isAccurate: boolean;
}

export interface PredictInteraction {
  prompt: string;
  question: string;
  choices: PredictChoice[];
}

export interface GravityRegimePoint {
  gravityG: number;
  label: string;
  destinationName: string;
  description: string;
  flameShape: string;
  scenario: ScenarioInput & { gravity_g?: number };
}

export interface RevealInteraction {
  title: string;
  instruction: string;
  regimes: GravityRegimePoint[];
}

export interface CheckChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface CheckInteraction {
  question: string;
  choices: CheckChoice[];
  deeperContext: string;
}

export interface StoryChartKey {
  key: string;
  color: string;
  label: string;
  unit?: string;
}

export interface BeatContentLayer1 {
  headline: string;
  paragraphs: string[];
  keyFact?: string;
}

export interface BeatContentLayer2 {
  headline: string;
  physicsExplanation: string[];
  scientificPrinciples?: string[];
  glossaryTerms?: string[];
  evidenceRefs: EvidenceRef[];
}

export interface BeatContentLayer3 {
  headline: string;
  chartDescription: string;
  data: Array<Record<string, string | number>>;
  xAxisKey: string;
  dataKeys: StoryChartKey[];
  sourceExperimentId?: string;
  sourceRunId?: string;
  citationLabel?: string;
}

export interface Beat {
  id: string;
  type: BeatType;
  title: string;
  subtitle?: string;
  /** Declare which modes include this beat */
  modes: StoryMode[];
  /** Avatar cue displayed for this beat */
  avatar: AvatarCue;
  /** Layer 1: Story layer (default, short, vivid, accessible to 12-year-olds) */
  layer1: BeatContentLayer1;
  /** Layer 2: Go deeper (real physics, units, evidence references) */
  layer2?: BeatContentLayer2;
  /** Layer 3: Show data (Recharts telemetry visualization + Explorer link) */
  layer3?: BeatContentLayer3;
  /** Specialized interactive component configurations */
  predictInteraction?: PredictInteraction;
  revealInteraction?: RevealInteraction;
  checkInteraction?: CheckInteraction;
}

export interface Chapter {
  id: string;
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  estimatedMinutes: {
    quick: number;
    full: number;
  };
  status: 'available' | 'coming-soon';
  heroFlameScenario: ScenarioInput & { gravity_g?: number };
  beats: Beat[];
  takeawayMessage: string;
  limitsOfData: string[];
  glossary: GlossaryItem[];
  nextChapterSlug?: string;
}
