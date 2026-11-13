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
      className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-500 font-sans"
    >
      <div className="max-w-md space-y-3">
        {/* Line 1: Headline */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Fire in space: early detection and containment
        </h1>

        {/* Line 2: Honesty badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="px-2 py-0.5 rounded border border-amber-600/50 bg-amber-950/60 text-amber-300 text-xs font-mono">
            Simulated. Not flight software.
          </span>
          <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono">
            Trained on Earth-gravity data. Not validated in microgravity.
          </span>
        </div>

        {/* Line 3: Submission link */}
        <div className="pt-1">
          <a
            href={IGNIS_SUBMISSION_URL}
            className="text-sm sm:text-base font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {IGNIS_SUBMISSION_URL}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClosingCardOverlay;
