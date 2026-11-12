import React, { useState } from 'react';
import type { NarrationCue, NarrationAudioSettings } from '../../lib/fire/narration/narrationTypes.ts';
import type { StoryboardSceneInfo } from './sceneStoryboard.ts';
import {
  HelpCircle,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export interface UnifiedNarrationDeckProps {
  scene: StoryboardSceneInfo;
  activeCue: NarrationCue | null;
  settings: NarrationAudioSettings;
  onExploreWhy: () => void;
  onToggleVoice: () => void;
  onToggleSubtitles: () => void;
  onToggleMute: () => void;
  onVolumeChange?: (vol: number) => void;
  onReplayCue: () => void;
  className?: string;
}

export const UnifiedNarrationDeck: React.FC<UnifiedNarrationDeckProps> = ({
  scene,
  activeCue,
  settings,
  onExploreWhy,
  onToggleVoice,
  onToggleSubtitles,
  onToggleMute,
  onReplayCue,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Highlight key terms in subtitles without changing spoken wording
  const renderHighlightedSubtitles = () => {
    if (!activeCue) return null;
    if (!activeCue.highlightWords || activeCue.highlightWords.length === 0) {
      return <span>{activeCue.subtitleText}</span>;
    }

    const escapedWords = activeCue.highlightWords.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    const parts = activeCue.subtitleText.split(regex);

    return parts.map((part, i) => {
      const isMatch = activeCue.highlightWords?.some(
        (w) => w.toLowerCase() === part.toLowerCase()
      );
      if (isMatch) {
        let highlightClass = 'text-cyan-300 font-semibold';
        if (/alarm|fire/i.test(part)) {
          highlightClass = 'text-red-400 font-semibold';
        } else if (/extinction|extinguished|safe|resolved|collapsed/i.test(part)) {
          highlightClass = 'text-emerald-300 font-semibold';
        } else if (/power|isolated|sealed|inhibited|suppression/i.test(part)) {
          highlightClass = 'text-amber-300 font-semibold';
        }
        return (
          <span key={i} className={highlightClass}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const currentStageNumber = activeCue?.stageNumber ?? scene.sceneNumber ?? 1;

  return (
    <section
      role="region"
      aria-label="Event Explanation Card"
      className={`bg-[#060b14]/92 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md text-left transition-all ${className}`}
    >
      {/* Subtitles Banner (when enabled and active) */}
      {settings.areSubtitlesEnabled && activeCue && (
        <div
          role="region"
          aria-label="Synchronized Emergency Subtitles"
          aria-live="polite"
          className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-2 text-xs sm:text-sm font-sans text-slate-100"
        >
          <div className="shrink-0 p-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            {settings.isVoiceEnabled && !settings.isMuted ? (
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
            ) : (
              <Volume2 className="h-3 w-3 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex items-baseline gap-2 truncate">
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 font-bold shrink-0">
              Flight Operations Voice
            </span>
            <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">
              Stage {currentStageNumber}
            </span>
            <span className="text-slate-200 truncate">
              {renderHighlightedSubtitles()}
            </span>
          </div>
        </div>
      )}

      {/* Expanded Storyboard Details (collapsible on demand) */}
      {isExpanded && (
        <div className="p-3 border-b border-slate-800/80 space-y-1.5 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
              Scene {scene.sceneNumber}/{scene.totalScenes}
            </span>
            {scene.provenance && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {scene.provenance}
              </span>
            )}
            <span className="font-mono text-[10px] text-slate-400 uppercase">
              {scene.category}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
            {scene.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {scene.plainSummary}
          </p>
        </div>
      )}

      {/* Compact Audio Toolbar & Actions */}
      <div className="px-2.5 py-1.5 flex items-center justify-between gap-2">
        <div
          role="toolbar"
          aria-label="Narration and Audio Controls"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {/* Voice Toggle */}
          <button
            type="button"
            role="button"
            aria-pressed={settings.isVoiceEnabled}
            onClick={onToggleVoice}
            className={`px-2 py-0.5 rounded text-xs font-sans transition-colors ${
              settings.isVoiceEnabled
                ? 'bg-cyan-600/30 border border-cyan-500/60 text-cyan-200'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={settings.isVoiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
          >
            Voice
          </button>

          {/* Subtitles (CC) Toggle */}
          <button
            type="button"
            role="button"
            aria-pressed={settings.areSubtitlesEnabled}
            onClick={onToggleSubtitles}
            className={`px-2 py-0.5 rounded text-xs font-sans transition-colors ${
              settings.areSubtitlesEnabled
                ? 'bg-cyan-600/30 border border-cyan-500/60 text-cyan-200'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={settings.areSubtitlesEnabled ? 'Hide subtitles' : 'Show subtitles'}
          >
            CC
          </button>

          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={settings.isMuted ? 'Unmute voice narration' : 'Mute voice narration'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title={settings.isMuted ? 'Unmute' : 'Mute'}
          >
            {settings.isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-slate-300" />
            )}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            onClick={onReplayCue}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
            title="Replay current voice narration"
            aria-label="Replay current voice narration"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Explore Why Progressive Depth Link */}
          <button
            onClick={onExploreWhy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-sans text-cyan-300 hover:text-cyan-200 transition-colors"
            title="Open progressive depth explanation (Quick, Science, Engineering)"
          >
            <HelpCircle className="h-3 w-3" />
            <span>Explore why</span>
          </button>

          {/* Optional Expand / Collapse Details Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={isExpanded ? 'Collapse explanation card' : 'Expand explanation card'}
            title={isExpanded ? 'Collapse explanation card' : 'Expand explanation card'}
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default UnifiedNarrationDeck;
