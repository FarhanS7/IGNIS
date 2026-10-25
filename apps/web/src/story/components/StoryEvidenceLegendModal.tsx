import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface StoryEvidenceLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryEvidenceLegendModal: React.FC<StoryEvidenceLegendModalProps> = ({
  isOpen,
  onClose,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
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
      aria-labelledby="legend-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-2xl overflow-hidden text-slate-100 p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 id="legend-modal-title" className="text-base font-bold font-['Space_Grotesk'] text-white">
              Evidence Badges Legend
            </h3>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 cursor-pointer"
            aria-label="Close evidence legend"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          IGNIS upholds transparent scientific provenance. Throughout Story Mode, you will encounter two types of evidence badges:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 font-mono text-[11px] uppercase">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Cyan: Measured NASA Telemetry</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Empirical data recorded directly by cameras, radiometers, and thermocouple arrays during orbital spaceflights (FLEX-1, FLEX-2, Saffire, and BASS). Includes provenance tier and citation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-400/40 text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono text-[11px] uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Amber: Educational Analogy</span>
            </div>
            <p className="text-amber-100/80 text-[11px] leading-relaxed">
              A simplified mental model (such as the "air elevator" or "cork underwater") used to build intuitive understanding before diving into equations.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <Link
            to="/about"
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline underline-offset-2 flex items-center gap-1"
          >
            <span>Learn about NASA 5-Tier Methodology</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
