import React from 'react';
import { IGNIS_SUBMISSION_URL } from '../../lib/fire/captureConstants.ts';

export interface ClosingCardOverlayProps {
  isVisible: boolean;
}

export const ClosingCardOverlay: React.FC<ClosingCardOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      data-testid="closing-card"
      className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-500"
    >
      <div className="max-w-lg space-y-6">
        {/* Main IGNIS Logo & Title */}
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl tracking-wider text-white">
            IGN<span className="text-cyan-400">IS</span>
          </h1>
          <p className="font-display font-medium text-sm sm:text-base text-slate-300 tracking-widest uppercase">
            Microgravity Fire Early Detection & Containment
          </p>
        </div>

        {/* Epistemic Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <span className="px-3 py-1 rounded-full border border-amber-600/50 bg-amber-950/60 text-amber-300 text-xs font-mono font-medium shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            Simulated. Not flight software.
          </span>
          <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 text-xs font-mono">
            Trained on Earth-gravity data. Not validated in microgravity.
          </span>
        </div>

        {/* Submission URL Placeholder from Constant */}
        <div className="pt-4 space-y-1">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            NASA Space Apps Challenge 2026 Submission
          </div>
          <a
            href={IGNIS_SUBMISSION_URL}
            className="inline-block font-mono text-xl sm:text-2xl font-bold text-cyan-400 hover:text-cyan-300 tracking-tight transition-colors drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]"
          >
            {IGNIS_SUBMISSION_URL}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClosingCardOverlay;

