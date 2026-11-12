import type { SoundEffectType } from './narrationTypes.ts';

/**
 * Web Audio API Sound Effects Synthesizer for Spacecraft Emergency Events.
 * Generates subtle, mission-control auditory feedback without external audio files.
 */

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    try {
      globalAudioCtx = new AudioCtxClass();
    } catch {
      return null;
    }
  }
  return globalAudioCtx;
}

export function playSoundEffect(type: SoundEffectType, volume = 0.5): void {
  const ctx = getAudioContext();
  if (!ctx || volume <= 0) return;

  // Auto-resume suspended AudioContext on user interaction
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.4, now);
  masterGain.connect(ctx.destination);

  switch (type) {
    case 'alarm': {
      // Mission-Control Alert: Subtle two-tone frequency chime (880Hz & 660Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(660, now + 0.18);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.35, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.4);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.6);
      break;
    }

    case 'confirm': {
      // Spacecraft Sequencer Action Confirmation: Clean 587Hz chime chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.32);
      break;
    }

    case 'resolved': {
      // Safe Resolution Chime: 3-note ascending major triad (440Hz -> 554.37Hz -> 659.25Hz)
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
      break;
    }
  }
}

