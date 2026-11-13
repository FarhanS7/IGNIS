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
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
  onSelectStage?: (stageNumber: number) => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  className?: string;
}

const STAGES = [
  { num: 1, label: 'Fire Physics', short: 'Physics' },
  { num: 2, label: 'AI Detection', short: 'AI Detection' },
  { num: 3, label: 'Alarm', short: 'Alarm' },
  { num: 4, label: 'Containment', short: 'Containment' },
  { num: 5, label: 'Protection', short: 'Protection' },
];

export const UnifiedNarrationDeck: React.FC<UnifiedNarrationDeckProps> = ({
  scene,
  activeCue,
  settings,
  onExploreWhy,
  onToggleVoice,
  onToggleSubtitles,
  onToggleMute,
  onReplayCue,
  onSelectStage,
  onNextStage,
  onPrevStage,
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
      className={`bg-[#060b14]/94 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md text-left transition-all ${className}`}
    >
      {/* 5-Stage Interactive Selector Pills (Approach B Walkthrough) */}
      <div className="px-3 pt-2 pb-1.5 border-b border-slate-800/60 flex items-center justify-between gap-1 overflow-x-auto">
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
          <span>Stage:</span>
        </span>
        <div className="flex items-center gap-1 min-w-0">
          {STAGES.map((s) => {
            const isCurrent = currentStageNumber === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => onSelectStage?.(s.num)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(58,215,255,0.3)] font-bold'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={`Jump to Stage ${s.num}: ${s.label}`}
              >
                {s.num}. {s.short}
              </button>
            );
          })}
        </div>
      </div>

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

      {/* Expanded Storyboard & Science Breakdown Details */}
      {isExpanded && (
        <div className="p-3.5 border-b border-slate-800/80 space-y-2.5 font-sans bg-slate-950/70">
          <div className="flex items-center justify-between gap-2 flex-wrap">
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

            {/* Stepper buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onPrevStage}
                disabled={currentStageNumber <= 1}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous stage"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={onNextStage}
                disabled={currentStageNumber >= 5}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 border border-cyan-500/50 text-cyan-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next stage"
              >
                Next →
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {scene.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              {scene.plainSummary}
            </p>
          </div>

          {/* Key Takeaway Box */}
          {activeCue?.keyTakeaway && (
            <div className="text-xs text-cyan-200/90 font-medium bg-cyan-950/40 border border-cyan-800/40 p-2 rounded-lg leading-relaxed">
              <span className="font-bold text-cyan-400 mr-1">Key Insight:</span>
              <span>{activeCue.keyTakeaway}</span>
            </div>
          )}

          {/* Structured Educational Bullets */}
          {activeCue?.bullets && activeCue.bullets.length > 0 && (
            <ul className="space-y-1.5 text-xs text-slate-300 pt-0.5">
              {activeCue.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 bg-slate-900/70 p-2 rounded-md border border-slate-800/70"
                >
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Compact Audio Toolbar & Actions */}
      <div className="px-2.5 py-1.5 flex items-center justify-between gap-2">
        <div
          role="toolbar"
          aria-label="Narration and Audio Controls"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {/* Previous Stage Quick Step */}
          {onPrevStage && (
            <button
              type="button"
              onClick={onPrevStage}
              disabled={currentStageNumber <= 1}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Previous stage"
              aria-label="Previous educational stage"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Next Stage Quick Step */}
          {onNextStage && (
            <button
              type="button"
              onClick={onNextStage}
              disabled={currentStageNumber >= 5}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Next stage"
              aria-label="Next educational stage"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

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

          {/* Expand / Collapse Details Button */}
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
