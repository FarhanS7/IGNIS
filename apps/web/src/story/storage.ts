/**
 * Safe local storage manager with in-memory fallback (R11).
 * Resilient against SSR environments, disabled cookies, or private browsing restrictions.
 */

import type { StoryMode } from './types';

export interface ChapterProgress {
  chapterSlug: string;
  currentBeatIndex: number;
  completedBeatIds: string[];
  predictedChoiceId?: string;
  checkAnswerId?: string;
  mode: StoryMode;
  lastUpdated: number;
}

// In-memory memory fallback storage
const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__ignis_storage_probe__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (isLocalStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback
    }
    return memoryStore[key] ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fallback
    }
    delete memoryStore[key];
  },

  clearMemoryStoreForTesting(): void {
    for (const key of Object.keys(memoryStore)) {
      delete memoryStore[key];
    }
  },
};

const STORAGE_PREFIX = 'ignis_story_v2_';

export function getChapterProgress(chapterSlug: string): ChapterProgress | null {
  try {
    const raw = safeStorage.getItem(`${STORAGE_PREFIX}${chapterSlug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChapterProgress>;
    if (typeof parsed !== 'object' || parsed === null) return null;

    return {
      chapterSlug,
      currentBeatIndex: typeof parsed.currentBeatIndex === 'number' ? parsed.currentBeatIndex : 0,
      completedBeatIds: Array.isArray(parsed.completedBeatIds) ? parsed.completedBeatIds : [],
      predictedChoiceId: typeof parsed.predictedChoiceId === 'string' ? parsed.predictedChoiceId : undefined,
      checkAnswerId: typeof parsed.checkAnswerId === 'string' ? parsed.checkAnswerId : undefined,
      mode: parsed.mode === 'quick' ? 'quick' : 'full',
      lastUpdated: typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveChapterProgress(progress: ChapterProgress): void {
  try {
    const serialized = JSON.stringify({
      ...progress,
      lastUpdated: Date.now(),
    });
    safeStorage.setItem(`${STORAGE_PREFIX}${progress.chapterSlug}`, serialized);
  } catch {
    // Graceful degradation when quota exceeded or storage blocked
  }
}

export function clearChapterProgress(chapterSlug: string): void {
  safeStorage.removeItem(`${STORAGE_PREFIX}${chapterSlug}`);
}
