import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Timeline } from '../timeline/types.ts';
import type { HabitatGraph } from '../types.ts';
import type { NarrationCue, NarrationAudioSettings } from './narrationTypes.ts';
import { deriveNarrationCues } from './narrationCues.ts';
import { playSoundEffect } from './synthAudio.ts';

const SETTINGS_STORAGE_KEY = 'ignis_narration_settings_v1';

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
  isPlaying,
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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Save settings on update
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Preload prepared audio files when available
  useEffect(() => {
    if (typeof window === 'undefined') return;
    for (const cue of cues) {
      if (cue.audioUrl && !audioCacheRef.current.has(cue.audioUrl)) {
        try {
          const audio = new Audio(cue.audioUrl);
          audio.preload = 'auto';
          audioCacheRef.current.set(cue.audioUrl, audio);
        } catch {
          // Graceful fallback if Audio constructor fails
        }
      }
    }
  }, [cues]);

  // Stop any active audio or speech
  const stopAllPlayback = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {
        // Ignore errors
      }
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore errors
      }
      currentUtteranceRef.current = null;
    }
  }, []);

  // Preferred natural speech synthesis voice as resilient fallback
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

  // Play narration segment with fallback
  const playCue = useCallback(
    (cue: NarrationCue) => {
      // 1. Play accompanying sound effect if defined
      if (cue.soundEffect && !settings.isMuted) {
        playSoundEffect(cue.soundEffect, settings.volume);
      }

      if (!settings.isVoiceEnabled || settings.isMuted || settings.volume <= 0) {
        return;
      }

      stopAllPlayback();

      // 2. Attempt playing prepared audio file first
      if (cue.audioUrl && typeof window !== 'undefined') {
        try {
          let audio = audioCacheRef.current.get(cue.audioUrl);
          if (!audio) {
            audio = new Audio(cue.audioUrl);
            audioCacheRef.current.set(cue.audioUrl, audio);
          }
          audio.volume = settings.isMuted ? 0 : settings.volume;
          audio.currentTime = 0;

          currentAudioRef.current = audio;

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Audio element play failed (e.g. autoplay policy, file missing)
              // Fallback to browser SpeechSynthesis
              playSpeechSynthesis(cue);
            });
          }
          return;
        } catch {
          // Fallback to speech synthesis
        }
      }

      // 3. Fallback: Browser speech synthesis
      playSpeechSynthesis(cue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, stopAllPlayback, getPreferredVoice]
  );

  const playSpeechSynthesis = useCallback(
    (cue: NarrationCue) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        const utterance = new SpeechSynthesisUtterance(cue.spokenText);
        utterance.rate = 0.95; // Calm, measured speaking speed
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
        // Speech synthesis fallback failed, subtitles continue undisturbed
      }
    },
    [settings, getPreferredVoice]
  );

  // Synchronized Trigger Loop: triggers narration once when entering each segment
  useEffect(() => {
    if (!isPlaying) {
      stopAllPlayback();
      return;
    }

    if (!activeCue) {
      stopAllPlayback();
      return;
    }

    // Trigger segment only once on entry
    if (activeCue.id !== lastTriggeredCueIdRef.current) {
      lastTriggeredCueIdRef.current = activeCue.id;
      playCue(activeCue);
    }
  }, [isPlaying, activeCue, playCue, stopAllPlayback]);

  // Reset trigger ref when seeking backwards
  useEffect(() => {
    if (!activeCue) {
      lastTriggeredCueIdRef.current = null;
    } else if (lastTriggeredCueIdRef.current && activeCue.id !== lastTriggeredCueIdRef.current) {
      const activeIdx = cues.findIndex((c) => c.id === activeCue.id);
      const lastIdx = cues.findIndex((c) => c.id === lastTriggeredCueIdRef.current);
      if (activeIdx < lastIdx) {
        lastTriggeredCueIdRef.current = null;
      }
    }
  }, [activeCue, cues]);

  // Replay current cue on demand
  const replayCurrentCue = useCallback(() => {
    if (!activeCue) return;
    playCue(activeCue);
  }, [activeCue, playCue]);

  // Audio Control Toggles
  const toggleVoice = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.isVoiceEnabled;
      if (!next) {
        stopAllPlayback();
      }
      return { ...prev, isVoiceEnabled: next };
    });
  }, [stopAllPlayback]);

  const toggleSubtitles = useCallback(() => {
    setSettings((prev) => ({ ...prev, areSubtitlesEnabled: !prev.areSubtitlesEnabled }));
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setSettings((prev) => {
      const isMuted = clamped === 0 ? true : prev.isMuted;
      if (currentAudioRef.current) {
        currentAudioRef.current.volume = isMuted ? 0 : clamped;
      }
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
      if (currentAudioRef.current) {
        currentAudioRef.current.volume = nextMuted ? 0 : prev.volume;
      }
      if (nextMuted) {
        stopAllPlayback();
      }
      return { ...prev, isMuted: nextMuted };
    });
  }, [stopAllPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, [stopAllPlayback]);

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
