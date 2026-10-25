import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowRight, CheckCircle2, Sparkles, FileText, ChevronRight } from 'lucide-react';

export interface StoryOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryOnboardingModal: React.FC<StoryOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setStep(1);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      nextBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-step-title"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-2xl bg-[#09152a] border border-cyan-500/40 shadow-2xl overflow-hidden text-slate-100 p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-8 bg-cyan-400'
                    : s < step
                    ? 'w-4 bg-cyan-500/40'
                    : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 cursor-pointer"
            aria-label="Skip onboarding intro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Navigation */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
                Step 1 of 3 • Moving Through the Story
              </div>
              <h3 id="onboarding-step-title" className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Scroll, Click, or Use Keys
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-['Hanken_Grotesk']">
              Story Mode unfolds beat by beat. You can naturally scroll down the page, tap the visible <strong>Next</strong> button in the bottom navigation bar, or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Right</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">j</kbd> on your keyboard.
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Ember, your space fire guide, glides alongside as you progress.</span>
            </div>
          </div>
        )}

        {/* Step 2: Evidence Badges */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                Step 2 of 3 • Scientific Integrity
              </div>
              <h3 id="onboarding-step-title" className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Two Evidence Badges
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-['Hanken_Grotesk']">
              IGNIS makes a strict distinction between empirical data and simplified teaching analogies:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Cyan: Measured NASA Telemetry.</strong> Grounded in real flight data from FLEX, Saffire, and ISS missions.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-400/30 text-amber-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Amber: Educational Analogy.</strong> A visual simplification designed to help build mental intuition.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Go Deeper & Show Data */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1">
                Step 3 of 3 • Multi-Layer Learning
              </div>
              <h3 id="onboarding-step-title" className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Unpack Deeper Layers
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-['Hanken_Grotesk']">
              Every beat has expandable deep dives below the story:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Layer 2: Go Deeper into the Physics (real formulas & units)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Layer 3: Show Telemetry Data (interactive NASA flight plots)</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-3 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip Intro
          </button>

          {step < 3 ? (
            <button
              ref={nextBtnRef}
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Space_Grotesk'] text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              ref={nextBtnRef}
              type="button"
              onClick={handleClose}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Space_Grotesk'] text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Start Exploring!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
