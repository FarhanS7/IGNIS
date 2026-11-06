/**
 * Safe Session Storage Handler for Earth vs Orbit Intro.
 * Completely immune to disabled cookies, browser private modes, or quota limits.
 */

const STORAGE_KEY = 'ignis_hero_intro_seen';

export function hasSeenIntro(storage?: Storage): boolean {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.sessionStorage : undefined);
    return s ? s.getItem(STORAGE_KEY) === 'true' : false;
  } catch {
    return false;
  }
}

export function markIntroSeen(storage?: Storage): void {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.sessionStorage : undefined);
    if (s) {
      s.setItem(STORAGE_KEY, 'true');
    }
  } catch {
    // Graceful no-op when sessionStorage is blocked or full
  }
}

export function resetIntroSeen(storage?: Storage): void {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.sessionStorage : undefined);
    if (s) {
      s.removeItem(STORAGE_KEY);
    }
  } catch {
    // Graceful no-op
  }
}

