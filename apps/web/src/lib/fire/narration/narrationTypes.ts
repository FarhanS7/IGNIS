/**
 * Narration & Guided Audio Types
 *
 * Epistemic rules:
 * - Narration cues are event-driven and synchronized with the underlying simulation.
 * - Distinguishes Observation vs Detector Interpretation vs Alarm vs Command vs Confirmation vs Outcome.
 * - Never claims an action is completed when only a command was issued.
 * - Never announces extinguishment without actual supporting simulation evidence.
 */

export type SoundEffectType = 'alarm' | 'confirm' | 'resolved';

export interface NarrationCue {
  id: string;
  stageNumber: number;
  stageId: 'INCIDENT' | 'DETECTION' | 'ALARM' | 'RESPONSE' | 'OUTCOME' | 'SUMMARY';
  startTime_s: number;
  endTime_s: number;
  title?: string;
  plainSummary?: string;
  audioUrl?: string;
  spokenText: string;
  subtitleText: string;
  highlightWords?: string[];
  soundEffect?: SoundEffectType;
  category: 'OBSERVATION' | 'DETECTOR' | 'ALARM' | 'COMMAND' | 'CONFIRMATION' | 'OUTCOME';
}

export interface NarrationAudioSettings {
  isVoiceEnabled: boolean;
  areSubtitlesEnabled: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
}
