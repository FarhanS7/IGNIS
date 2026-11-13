import React from 'react';
import type { NarrationCue } from '../../lib/fire/narration/narrationTypes.ts';
import { Volume2, Radio } from 'lucide-react';

export interface NarrationSubtitlesOverlayProps {
  cue: NarrationCue | null;
  isVisible: boolean;
  isVoiceActive?: boolean;
}

export const NarrationSubtitlesOverlay: React.FC<NarrationSubtitlesOverlayProps> = ({
  cue,
  isVisible,
  isVoiceActive = true,
}) => {
  if (!isVisible || !cue) return null;

  // Highlight key terms in subtitle text
  const renderHighlightedText = () => {
    if (!cue.highlightWords || cue.highlightWords.length === 0) {
      return <span>{cue.subtitleText}</span>;
    }

    // Build regex pattern matching any highlight word
    const escapedWords = cue.highlightWords.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    const parts = cue.subtitleText.split(regex);

    return parts.map((part, i) => {
      const isMatch = cue.highlightWords?.some(
        (w) => w.toLowerCase() === part.toLowerCase()
      );
      if (isMatch) {
        let highlightClass = 'text-cyan-300 font-bold';
        if (/alarm|fire/i.test(part)) {
          highlightClass = 'text-red-400 font-bold';
        } else if (/extinction|safe|resolved|collapsed/i.test(part)) {
          highlightClass = 'text-emerald-300 font-bold';
        } else if (/power cut|sealed|inhibited|suppression/i.test(part)) {
          highlightClass = 'text-amber-300 font-bold';
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

  return (
    <div
      role="region"
      aria-label="Synchronized Emergency Subtitles"
      aria-live="polite"
      className="w-full max-w-2xl mx-auto px-3 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="bg-[#040810]/90 border border-cyan-500/30 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 text-left">
        {/* Voice status indicator */}
        <div className="shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          {isVoiceActive ? (
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
          ) : (
            <Volume2 className="h-4 w-4 text-slate-400" />
          )}
        </div>

        {/* Subtitle Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
              Flight Operations Voice
            </span>
            <span className="font-mono text-[9px] uppercase text-slate-500">
              Stage {cue.stageNumber} ({cue.stageId})
            </span>
          </div>

          <p className="text-xs sm:text-sm font-sans font-medium text-slate-100 leading-snug tracking-normal">
            {renderHighlightedText()}
          </p>
        </div>
      </div>
    </div>
  );
};

