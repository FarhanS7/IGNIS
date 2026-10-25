import React, { useEffect, useRef } from 'react';
import { X, MapPin, CheckCircle2 } from 'lucide-react';
import type { Beat } from '../types';

export interface StoryChapterMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  beats: Beat[];
  currentBeatIndex: number;
  completedBeatIds: string[];
  onSelectBeat: (index: number) => void;
}

export const StoryChapterMapModal: React.FC<StoryChapterMapModalProps> = ({
  isOpen,
  onClose,
  beats,
  currentBeatIndex,
  completedBeatIds,
  onSelectBeat,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Esc listener
  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-map-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-[#081225] border border-cyan-500/30 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#060e1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="chapter-map-title" className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-white">
                Chapter Journey Map
              </h2>
              <p className="text-xs text-slate-400">
                Jump directly to any beat in this chapter
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
            aria-label="Close chapter map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Beats List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {beats.map((beat, idx) => {
            const isCurrent = idx === currentBeatIndex;
            const isCompleted = completedBeatIds.includes(beat.id);

            return (
              <button
                key={beat.id}
                type="button"
                onClick={() => {
                  onSelectBeat(idx);
                  onClose();
                }}
                className={`w-full min-h-[48px] p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-400 text-black'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                      Beat {idx + 1} • {beat.type}
                    </div>
                    <div className="text-sm font-semibold font-['Space_Grotesk'] text-white truncate">
                      {beat.title}
                    </div>
                  </div>
                </div>

                {isCompleted && !isCurrent && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-label="Completed" />
                )}
                {isCurrent && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#060e1d] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Esc closes</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
