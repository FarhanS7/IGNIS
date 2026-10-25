import React from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { Beat } from '../types';

export interface StoryNavigationDockProps {
  beats: Beat[];
  currentBeatIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectBeat: (index: number) => void;
  onOpenMap: () => void;
  remainingMinutes?: number;
}

export const StoryNavigationDock: React.FC<StoryNavigationDockProps> = ({
  beats,
  currentBeatIndex,
  onPrev,
  onNext,
  onSelectBeat,
  onOpenMap,
  remainingMinutes,
}) => {
  const canGoPrev = currentBeatIndex > 0;
  const canGoNext = currentBeatIndex < beats.length - 1;

  return (
    <nav
      className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-24px)] pointer-events-auto select-none"
      aria-label="Story Beat Navigation"
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-[#061226]/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
        {/* Back Button (min 44x44px touch target) */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all font-mono text-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
            canGoPrev
              ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
          aria-label="Previous beat"
          title="Previous beat (Left Arrow or 'k')"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Chapter Map / Current Beat Button */}
        <button
          type="button"
          onClick={onOpenMap}
          className="min-h-[44px] px-2.5 sm:px-3 flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-cyan-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
          aria-label={`Open chapter map. Currently on beat ${currentBeatIndex + 1} of ${beats.length}`}
          title="Open chapter journey map"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-semibold whitespace-nowrap">
            {currentBeatIndex + 1}/{beats.length}
          </span>
          {typeof remainingMinutes === 'number' && (
            <span className="hidden md:inline text-[11px] text-slate-400 font-normal">
              • ~{remainingMinutes}m left
            </span>
          )}
        </button>

        {/* Beat Dots Indicator (Clickable & Labeled) */}
        <div className="hidden sm:flex items-center gap-1 px-1" role="tablist" aria-label="Beat indicator">
          {beats.map((beat, idx) => {
            const isCurrent = idx === currentBeatIndex;
            return (
              <button
                key={beat.id}
                type="button"
                onClick={() => onSelectBeat(idx)}
                className={`min-w-[32px] min-h-[44px] flex items-center justify-center p-1 rounded-md transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  isCurrent ? 'scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                aria-label={`Beat ${idx + 1}: ${beat.title}`}
                title={`Beat ${idx + 1}: ${beat.title}`}
                role="tab"
                aria-selected={isCurrent}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_8px_#38bdf8]'
                      : 'bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Next Button (min 44x44px touch target) */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`min-w-[44px] min-h-[44px] px-3 flex items-center justify-center gap-1.5 rounded-xl font-bold font-['Space_Grotesk'] text-xs transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
            canGoNext
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
          aria-label="Next beat"
          title="Next beat (Right Arrow or 'j')"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
