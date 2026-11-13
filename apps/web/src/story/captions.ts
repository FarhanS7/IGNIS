/**
 * Story Mode - Captions & Subtitles Engine
 *
 * Provides lower-third subtitles over the cinematic stage in place of voice audio.
 * Displays tailored wording for Little Explorer, Explorer, and Scientist levels.
 */

import type { StoryLevel } from './levels';

export interface CaptionEntry {
  text: string;
  speaker?: string;
  level: StoryLevel;
  highlightWords?: string[];
}

export function formatSubtitle(
  text: string,
  level: StoryLevel,
  _maxWords = 25
): string {
  const clean = text.trim();
  if (level === 'little') {
    // For little explorers, strictly keep to 6 words or fewer
    const words = clean.split(/\s+/);
    if (words.length > 6) {
      return words.slice(0, 6).join(' ') + '...';
    }
  }
  return clean;
}

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
