import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Timeline } from '../timeline/types.ts';
import type { HabitatGraph } from '../types.ts';
import type { NarrationCue, NarrationAudioSettings } from './narrationTypes.ts';
import { deriveNarrationCues } from './narrationCues.ts';
import { playSoundEffect } from './synthAudio.ts';

const SETTINGS_STORAGE_KEY = 'ignis_narration_settings_v1';

/** Delay (ms) between sound effect and voice start to prevent audio collision */
const SOUND_EFFECT_VOICE_STAGGER_MS = 500;

function loadStoredSettings(): NarrationAudioSettings {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {
    // Ignore storage errors
  }
  return {
    isVoiceEnabled: true,
    areSubtitlesEnabled: true,
    volume: 0.85,
    isMuted: false,
  };
}

function saveStoredSettings(settings: NarrationAudioSettings): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  } catch {
    // Ignore storage errors
  }
}

export interface UseNarrationOptions {
  timeline: Timeline;
  habitat: HabitatGraph;
  t: number;
  isPlaying: boolean;
  isGuidedMode?: boolean;
}

export function useNarration({
  timeline,
  habitat,
  t,
  isPlaying: _isPlaying,
  isGuidedMode = true,
}: UseNarrationOptions) {
  const [settings, setSettings] = useState<NarrationAudioSettings>(() => loadStoredSettings());

  // Derive deterministic 5 coherent segments
  const cues = useMemo(() => {
    return deriveNarrationCues(timeline, habitat, isGuidedMode);
  }, [timeline, habitat, isGuidedMode]);

  // Current active cue based on simulation time t
  const activeCue = useMemo<NarrationCue | null>(() => {
    return cues.find((c) => t >= c.startTime_s && t < c.endTime_s) || null;
  }, [cues, t]);

  const lastTriggeredCueIdRef = useRef<string | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const staggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save settings on update
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Cancel speech synthesis gracefully (let current utterance finish naturally
  // unless we are seeking backward or pausing)
  const cancelSpeech = useCallback((force = false) => {
    if (staggerTimerRef.current) {
      clearTimeout(staggerTimerRef.current);
      staggerTimerRef.current = null;
    }
    if (force && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore errors
      }
      currentUtteranceRef.current = null;
    }
  }, []);

  // Preferred natural speech synthesis voice
  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const preferredNames = [
      'Samantha',
      'Google US English',
      'Microsoft Zira',
      'Microsoft Jenny',
      'Daniel',
      'Alex',
      'Karen',
    ];

    for (const name of preferredNames) {
      const match = voices.find((v) => v.name.includes(name) && v.lang.startsWith('en'));
      if (match) return match;
    }

    return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }, []);

  // Speak a cue using Web Speech API (primary voice engine)
  const speakCue = useCallback(
    (cue: NarrationCue) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        // Cancel any in-progress speech before starting new cue
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cue.spokenText);
        utterance.rate = 0.92; // Calm, educational pacing
        utterance.pitch = 1.0; // Neutral calm pitch
        utterance.volume = settings.isMuted ? 0 : settings.volume;

        const voice = getPreferredVoice();
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => {
          currentUtteranceRef.current = null;
        };

        utterance.onerror = () => {
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis failed — subtitles continue undisturbed
      }
    },
    [settings, getPreferredVoice]
  );

  // Play narration with staggered sound effect
  const playCue = useCallback(
    (cue: NarrationCue) => {
      // Clear any pending stagger timer
      if (staggerTimerRef.current) {
        clearTimeout(staggerTimerRef.current);
        staggerTimerRef.current = null;
      }

      const shouldSpeak = settings.isVoiceEnabled && !settings.isMuted && settings.volume > 0;

      // Play sound effect first (if any)
      if (cue.soundEffect && !settings.isMuted) {
        playSoundEffect(cue.soundEffect, settings.volume);

        // Stagger voice start so effect and voice don't collide
        if (shouldSpeak) {
          staggerTimerRef.current = setTimeout(() => {
            staggerTimerRef.current = null;
            speakCue(cue);
          }, SOUND_EFFECT_VOICE_STAGGER_MS);
        }
        return;
      }

      // No sound effect — start voice immediately
      if (shouldSpeak) {
        speakCue(cue);
      }
    },
    [settings, speakCue]
  );

  // Synchronized Trigger Loop: triggers narration once when entering each segment (whether playing or paused)
  useEffect(() => {
    if (!activeCue) {
      return;
    }

    // Trigger segment once on entry to new cue
    if (activeCue.id !== lastTriggeredCueIdRef.current) {
      lastTriggeredCueIdRef.current = activeCue.id;
      playCue(activeCue);
    }
  }, [activeCue, playCue]);

  // Reset trigger ref when seeking backwards
  useEffect(() => {
    if (!activeCue) {
      lastTriggeredCueIdRef.current = null;
    } else if (lastTriggeredCueIdRef.current && activeCue.id !== lastTriggeredCueIdRef.current) {
      const activeIdx = cues.findIndex((c) => c.id === activeCue.id);
      const lastIdx = cues.findIndex((c) => c.id === lastTriggeredCueIdRef.current);
      if (activeIdx < lastIdx) {
        // User seeked backward — force-cancel current speech and reset
        cancelSpeech(true);
        lastTriggeredCueIdRef.current = null;
      }
    }
  }, [activeCue, cues, cancelSpeech]);

  // Replay current cue on demand
  const replayCurrentCue = useCallback(() => {
    if (!activeCue) return;
    cancelSpeech(true);
    playCue(activeCue);
  }, [activeCue, playCue, cancelSpeech]);

  // Audio Control Toggles
  const toggleVoice = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.isVoiceEnabled;
      if (!next) {
        cancelSpeech(true);
      }
      return { ...prev, isVoiceEnabled: next };
    });
  }, [cancelSpeech]);

  const toggleSubtitles = useCallback(() => {
    setSettings((prev) => ({ ...prev, areSubtitlesEnabled: !prev.areSubtitlesEnabled }));
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setSettings((prev) => {
      const isMuted = clamped === 0 ? true : prev.isMuted;
      return {
        ...prev,
        volume: clamped,
        isMuted,
      };
    });
  }, []);

  const toggleMute = useCallback(() => {
    setSettings((prev) => {
      const nextMuted = !prev.isMuted;
      if (nextMuted) {
        cancelSpeech(true);
      }
      return { ...prev, isMuted: nextMuted };
    });
  }, [cancelSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSpeech(true);
    };
  }, [cancelSpeech]);

  return {
    cues,
    activeCue,
    settings,
    toggleVoice,
    toggleSubtitles,
    setVolume,
    toggleMute,
    replayCurrentCue,
  };
}
