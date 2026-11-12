/**
 * Story Mode - Three Audience Levels
 *
 * 1. Little Explorer (Ages 4-7 / pre-readers):
 *    - Max 6 words per beat.
 *    - Picture-first, one big tap target per beat (>= 56px).
 *    - Animated glowing pointer, Ember reacts.
 *    - No numbers except one big friendly number where unavoidable.
 *    - "For grown-ups" disclosure opens Explorer text.
 *
 * 2. Explorer (Default, teens and adults):
 *    - Max 25 words per beat.
 *    - Plain words, interactive sliders, one-line chart takeaways, Source links.
 *
 * 3. Scientist (Researchers and engineers):
 *    - Explorer plus exact flight values, run IDs, CSV rows, DOIs, basis tiers.
 *    - Epistemic caveats and validation notes.
 */

export type StoryLevel = 'little' | 'explorer' | 'scientist';

export interface LevelConfig {
  id: StoryLevel;
  label: string;
  badge: string;
  ageRange: string;
  tagline: string;
  description: string;
  maxWords: number;
  minTouchTargetPx: number;
  showSourcesByDefault: boolean;
  simplifiedControls: boolean;
}

export const LEVEL_CONFIGS: Record<StoryLevel, LevelConfig> = {
  little: {
    id: 'little',
    label: 'Little Explorer',
    badge: 'Ages 4–7',
    ageRange: 'Ages 4–7',
    tagline: 'Tap, explore, and wonder',
    description: 'Big buttons, picture-first, friendly flame reactions. Perfect with a parent!',
    maxWords: 6,
    minTouchTargetPx: 56,
    showSourcesByDefault: false,
    simplifiedControls: true,
  },
  explorer: {
    id: 'explorer',
    label: 'Explorer',
    badge: 'General',
    ageRange: 'Teens & Adults',
    tagline: 'Real science in plain words',
    description: 'Hands-on controls, flight charts, and 2-minute interactive science chapters.',
    maxWords: 25,
    minTouchTargetPx: 44,
    showSourcesByDefault: true,
    simplifiedControls: false,
  },
  scientist: {
    id: 'scientist',
    label: 'Scientist',
    badge: 'Deep Dive',
    ageRange: 'Research & Engineering',
    tagline: 'Raw telemetry, CSVs, and DOIs',
    description: 'Exact run numbers, flight hardware archives, measurement methods, and caveats.',
    maxWords: 120,
    minTouchTargetPx: 44,
    showSourcesByDefault: true,
    simplifiedControls: false,
  },
};

const STORAGE_KEY_LEVEL = 'ignis_story_level';
const STORAGE_KEY_CHOSEN = 'ignis_story_level_chosen';

export function getStoryLevel(): StoryLevel {
  if (typeof window === 'undefined') return 'explorer';
  try {
    const val = localStorage.getItem(STORAGE_KEY_LEVEL) || sessionStorage.getItem(STORAGE_KEY_LEVEL);
    if (val === 'little' || val === 'explorer' || val === 'scientist') {
      return val;
    }
  } catch {
    // Fallback on restricted storage
  }
  return 'explorer';
}

export function setStoryLevel(level: StoryLevel): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LEVEL, level);
    sessionStorage.setItem(STORAGE_KEY_LEVEL, level);
  } catch {
    // Graceful fallback
  }
}

export function isLevelChosen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY_CHOSEN) === 'true';
  } catch {
    return true;
  }
}

export function setLevelChosen(chosen = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHOSEN, chosen ? 'true' : 'false');
  } catch {
    // Graceful fallback
  }
}

