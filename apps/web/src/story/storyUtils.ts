/**
 * Story Mode v2 - Mathematical & Validation Utilities
 */

import type { Chapter } from './types';

/**
 * Maps normalized scroll progress [0, 1] to physical gravity [1.0g, 0.0g].
 *
 * Requirements (DELIVERABLE 6):
 * - Bounds: Clamps progress strictly to [0, 1]. Output strictly within [0.0, 1.0].
 * - Monotonicity: Monotonically non-increasing (higher scroll -> lower gravity towards orbital 0g).
 * - Endpoints: At progress 0.0 -> returns 1.0g. At progress 1.0 -> returns 0.0g.
 * - Smooth cubic ease-in-out transition between planetary regimes:
 *   Progress 0.00 -> 1.00g (Earth)
 *   Progress 0.35 -> ~0.38g (Mars)
 *   Progress 0.65 -> ~0.16g (Moon)
 *   Progress 1.00 -> 0.00g (Orbit / Microgravity)
 */
export function mapScrollProgressToGravity(scrollProgress: number): number {
  if (Number.isNaN(scrollProgress)) return 1.0;
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Piecewise monotonic mapping ensuring exact planetary benchmarks:
  // Segment 1: [0.0, 0.35] maps 1.0g -> 0.38g (Earth to Mars)
  // Segment 2: [0.35, 0.65] maps 0.38g -> 0.16g (Mars to Moon)
  // Segment 3: [0.65, 1.00] maps 0.16g -> 0.00g (Moon to Microgravity)
  if (p <= 0.35) {
    const t = p / 0.35;
    // Smooth cosine interpolation
    const ease = 0.5 * (1 - Math.cos(Math.PI * t));
    return Number((1.0 - ease * (1.0 - 0.38)).toFixed(4));
  } else if (p <= 0.65) {
    const t = (p - 0.35) / 0.30;
    const ease = 0.5 * (1 - Math.cos(Math.PI * t));
    return Number((0.38 - ease * (0.38 - 0.16)).toFixed(4));
  } else {
    const t = (p - 0.65) / 0.35;
    const ease = 0.5 * (1 - Math.cos(Math.PI * t));
    return Number((0.16 - ease * 0.16).toFixed(4));
  }
}

export interface ValidationFixtures {
  experiments: Set<string>;
  runs: Set<string>;
  sourceDocs: Set<string>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates chapter integrity against schema and NASA fixture IDs.
 */
export function validateChapterConfig(
  chapter: Chapter,
  fixtures?: ValidationFixtures
): ValidationResult {
  const errors: string[] = [];

  if (!chapter.id || !chapter.slug || !chapter.title) {
    errors.push(`Chapter has missing id, slug, or title.`);
  }

  if (!Array.isArray(chapter.beats) || chapter.beats.length === 0) {
    errors.push(`Chapter "${chapter.slug}" contains no beats.`);
    return { valid: false, errors };
  }

  const validExpressions = new Set(['curious', 'surprised', 'thinking', 'proud', 'serious']);
  const validModes = new Set(['quick', 'full']);

  chapter.beats.forEach((beat, index) => {
    // 1. Check beat identity and type
    if (!beat.id) errors.push(`Beat at index ${index} lacks an ID.`);
    if (!beat.type) errors.push(`Beat "${beat.id || index}" lacks a type.`);

    // 2. Avatar verification
    if (!beat.avatar || !validExpressions.has(beat.avatar.expression)) {
      errors.push(`Beat "${beat.id}" avatar expression "${beat.avatar?.expression}" is invalid.`);
    }
    if (!beat.avatar?.speech || beat.avatar.speech.trim().length === 0) {
      errors.push(`Beat "${beat.id}" lacks avatar speech dialogue.`);
    }

    // 3. Mode membership verification
    if (!Array.isArray(beat.modes) || beat.modes.length === 0) {
      errors.push(`Beat "${beat.id}" must declare at least one mode.`);
    } else {
      beat.modes.forEach((m) => {
        if (!validModes.has(m)) {
          errors.push(`Beat "${beat.id}" declares unrecognized mode "${m}".`);
        }
      });
    }

    // 4. Content layer verification
    if (!beat.layer1 || !beat.layer1.headline || !Array.isArray(beat.layer1.paragraphs) || beat.layer1.paragraphs.length === 0) {
      errors.push(`Beat "${beat.id}" is missing required Layer 1 story content.`);
    }

    // 5. Evidence reference verification
    if (beat.layer2 && Array.isArray(beat.layer2.evidenceRefs)) {
      beat.layer2.evidenceRefs.forEach((ref, refIdx) => {
        if (ref.type === 'measured') {
          if (!ref.experimentId && !ref.runId && !ref.sourceDocId) {
            errors.push(`Beat "${beat.id}" measured evidence ref #${refIdx} has no target ID.`);
          }
          if (fixtures) {
            if (ref.experimentId && !fixtures.experiments.has(ref.experimentId)) {
              errors.push(`Beat "${beat.id}" cites non-existent experiment ID: "${ref.experimentId}".`);
            }
            if (ref.runId && !fixtures.runs.has(ref.runId)) {
              errors.push(`Beat "${beat.id}" cites non-existent run ID: "${ref.runId}".`);
            }
            if (ref.sourceDocId && !fixtures.sourceDocs.has(ref.sourceDocId)) {
              errors.push(`Beat "${beat.id}" cites non-existent source document ID: "${ref.sourceDocId}".`);
            }
          }
        }
      });
    }

    // 6. Interaction checks
    if (beat.type === 'predict' && !beat.predictInteraction) {
      errors.push(`Beat "${beat.id}" of type "predict" is missing predictInteraction config.`);
    }
    if (beat.type === 'reveal' && !beat.revealInteraction) {
      errors.push(`Beat "${beat.id}" of type "reveal" is missing revealInteraction config.`);
    }
    if (beat.type === 'check' && !beat.checkInteraction) {
      errors.push(`Beat "${beat.id}" of type "check" is missing checkInteraction config.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
