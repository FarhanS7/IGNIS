import React, { useState } from 'react';
import type { NarrationCue, NarrationAudioSettings } from '../../lib/fire/narration/narrationTypes.ts';
import type { StoryboardSceneInfo } from './sceneStoryboard.ts';
import {
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
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

const ALL_STAGE_DATA = [
  {
    num: 1,
    title: 'Combustion & Zero Buoyancy',
    takeaway: 'Flames form silent, spherical diffusion balls with no upward smoke plume.',
    bullet: 'Traditional optical sensors fail to account for spherical microgravity flame geometry.',
  },
  {
    num: 2,
    title: 'Multi-Sensor AI Surveillance',
    takeaway: 'Cross-checks optical smoke obscuration with carbon monoxide (CO) gas and temperature rise.',
    bullet: 'Eliminates reliance on single optical scatter, which is vulnerable to dust spikes.',
  },
  {
    num: 3,
    title: 'Consensus Alarm & 6s Dust Filter',
    takeaway: 'Enforces a 6-second persistence window to confirm true combustion before alarming.',
    bullet: 'Standard optical alarms blindly at 13s; IGNIS verifies gas at 15s to eliminate false evacuations.',
  },
  {
    num: 4,
    title: 'HVAC Duct Isolation & Power Cut',
    takeaway: 'Seals ventilation duct dampers and severs avionics bus power in milliseconds.',
    bullet: 'Locks toxic combustion gases within origin bay to protect crew living quarters.',
  },
  {
    num: 5,
    title: 'Suppression & Habitat Safeguard',
    takeaway: 'Discharges fine water mist to suffocate flame without venting cabin air to vacuum.',
    bullet: 'Preserves ~45 m³ station atmosphere while requiring strict crew confirmation before release.',
  },
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
  const [isAllStagesOpen, setIsAllStagesOpen] = useState<boolean>(false);

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
      className={`bg-[#060b14]/92 border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-left transition-all overflow-hidden ${className}`}
    >
      {/* 5-Stage Interactive Selector Pills (Approach B Walkthrough) */}
      <div className="px-3 pt-2.5 pb-2 border-b border-white/10 flex items-center justify-between gap-1 overflow-x-auto bg-slate-950/30">
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
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(58,215,255,0.35)] font-bold'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={`Jump to Stage ${s.num}: ${s.label}`}
              >
                {s.num}. {s.short}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAllStagesOpen(!isAllStagesOpen)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans transition-all shrink-0 cursor-pointer flex items-center gap-1 ml-1 ${
              isAllStagesOpen
                ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/80 border border-slate-700/80 text-cyan-300 hover:text-cyan-100 hover:border-cyan-500/50'
            }`}
            title="Instant Scan: Read all 5 stages in 10 seconds without audio"
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span>{isAllStagesOpen ? 'Close Guide' : 'Read All 5 Stages'}</span>
          </button>
        </div>
      </div>

      {/* All 5 Stages Instant Judge Scan Panel */}
      {isAllStagesOpen && (
        <div className="p-3 border-b border-white/10 bg-slate-950/90 space-y-2 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300 pb-1 border-b border-white/5">
            <span className="font-bold">⚡ 10-Second Executive Walkthrough (All 5 Stages)</span>
            <button
              type="button"
              onClick={() => setIsAllStagesOpen(false)}
              className="text-slate-400 hover:text-white text-[10px] font-sans cursor-pointer"
            >
              Close ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {ALL_STAGE_DATA.map((st) => (
              <div
                key={st.num}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  currentStageNumber === st.num
                    ? 'bg-cyan-950/60 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-white font-sans">
                    {st.num}. {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStage?.(st.num);
                      setIsAllStagesOpen(false);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    Jump →
                  </button>
                </div>
                <div className="text-[11px] text-cyan-200/90 mt-1 leading-snug">
                  {st.takeaway}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  • {st.bullet}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtitles Banner (when enabled and active) */}
      {settings.areSubtitlesEnabled && activeCue && (
        <div
          role="region"
          aria-label="Synchronized Emergency Subtitles"
          aria-live="polite"
          className="px-3.5 py-2.5 border-b border-white/10 flex items-center gap-2.5 text-xs sm:text-sm font-sans text-slate-100 bg-slate-950/40"
        >
          <div className="shrink-0 flex items-center gap-1.5 p-1 px-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(58,215,255,0.2)]">
            {settings.isVoiceEnabled && !settings.isMuted ? (
              <div className="flex items-end gap-0.5 h-3.5 px-0.5" title="Flight Operations Voice Active">
                <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-2" />
                <span className="w-0.5 bg-cyan-300 rounded-full animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-2.5" style={{ animationDelay: '300ms' }} />
                <span className="w-0.5 bg-cyan-200 rounded-full animate-pulse h-3" style={{ animationDelay: '75ms' }} />
              </div>
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-slate-400" />
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
