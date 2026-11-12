import React from 'react';
import type { NarrationAudioSettings } from '../../lib/fire/narration/narrationTypes.ts';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Subtitles,
  RotateCcw,
} from 'lucide-react';

export interface NarrationAudioControlsProps {
  settings: NarrationAudioSettings;
  onToggleVoice: () => void;
  onToggleSubtitles: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onReplayCue: () => void;
  className?: string;
}

export const NarrationAudioControls: React.FC<NarrationAudioControlsProps> = ({
  settings,
  onToggleVoice,
  onToggleSubtitles,
  onToggleMute,
  onVolumeChange,
  onReplayCue,
  className = '',
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Narration and Audio Controls"
      className={`flex items-center gap-1 sm:gap-1.5 bg-[#060b13]/90 border border-slate-700/80 rounded-lg p-1 backdrop-blur-md text-xs font-mono shadow-sm ${className}`}
    >
      {/* 1. Voice Narration Toggle */}
      <button
        type="button"
        onClick={onToggleVoice}
        aria-pressed={settings.isVoiceEnabled}
        title={settings.isVoiceEnabled ? 'Mute voice narration' : 'Enable voice narration'}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          settings.isVoiceEnabled
            ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300'
            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
        }`}
      >
        {settings.isVoiceEnabled ? (
          <Mic className="h-3.5 w-3.5 text-cyan-400" />
        ) : (
          <MicOff className="h-3.5 w-3.5 text-slate-500" />
        )}
        <span className="hidden md:inline font-semibold">Voice</span>
      </button>

      {/* 2. Subtitles (CC) Toggle */}
      <button
        type="button"
        onClick={onToggleSubtitles}
        aria-pressed={settings.areSubtitlesEnabled}
        title={settings.areSubtitlesEnabled ? 'Hide subtitles' : 'Show subtitles'}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          settings.areSubtitlesEnabled
            ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300'
            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
        }`}
      >
        <Subtitles className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden md:inline font-semibold">CC</span>
      </button>

      {/* 3. Mute / Unmute Button */}
      <button
        type="button"
        onClick={onToggleMute}
        title={settings.isMuted ? 'Unmute audio' : 'Mute audio'}
        aria-label={settings.isMuted ? 'Unmute audio' : 'Mute audio'}
        className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
      >
        {settings.isMuted || settings.volume === 0 ? (
          <VolumeX className="h-3.5 w-3.5 text-amber-400" />
        ) : (
          <Volume2 className="h-3.5 w-3.5 text-slate-300" />
        )}
      </button>

      {/* 4. Volume Level Selector */}
      <div className="hidden lg:flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded p-0.5">
        {[
          { label: 'Low', val: 0.35 },
          { label: 'Med', val: 0.7 },
          { label: 'Max', val: 1.0 },
        ].map(({ label, val }) => {
          const isActive = !settings.isMuted && Math.abs(settings.volume - val) < 0.2;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onVolumeChange(val)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Set voice and chime volume to ${label}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 5. Replay Current Cue Audio Button */}
      <button
        type="button"
        onClick={onReplayCue}
        title="Replay current voice narration"
        aria-label="Replay current voice narration"
        className="flex items-center gap-1 px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
      >
        <RotateCcw className="h-3 w-3 text-cyan-400" />
        <span className="hidden xl:inline text-[10px]">Repeat</span>
      </button>
    </div>
  );
};
