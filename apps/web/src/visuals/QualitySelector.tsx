/**
 * QualitySelector.tsx – Compact user settings control for 3D visual quality.
 *
 * Options: Auto / High / Medium / Low
 * Stored in localStorage, accessible via keyboard with visible focus rings.
 */

import React from 'react';
import { Sparkles, Monitor } from 'lucide-react';
import { useQualityTier, type QualityPreference } from './useQualityTier';

interface QualitySelectorProps {
  compact?: boolean;
  className?: string;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { preference, tier, setPreference } = useQualityTier();

  const options: Array<{ id: QualityPreference; label: string; title: string }> = [
    { id: 'auto', label: 'Auto', title: 'Auto-detect based on device capability' },
    { id: 'high', label: 'High', title: 'High: Bloom enabled, 1500 particles, DPR 1.5' },
    { id: 'medium', label: 'Med', title: 'Medium: Balanced performance, 700 particles, DPR 1.25' },
    { id: 'low', label: 'Low', title: 'Low: Maximum speed, 200 particles, DPR 1.0, static backdrop' },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono select-none ${className}`}
      role="group"
      aria-label="3D Visual Quality Setting"
    >
      <span className="text-[11px] text-slate-400 flex items-center gap-1 pr-1 font-sans">
        {compact ? (
          <Sparkles className="w-3 h-3 text-cyan-400" />
        ) : (
          <>
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Visual Quality:</span>
          </>
        )}
      </span>

      <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-md border border-slate-800/80">
        {options.map((opt) => {
          const isActive = preference === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPreference(opt.id)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400 ${
                isActive
                  ? 'bg-orange-500/30 text-orange-300 font-bold border border-orange-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={opt.title}
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {preference === 'auto' && (
        <span className="text-[9px] text-slate-500 font-mono hidden md:inline pl-0.5">
          ({tier})
        </span>
      )}
    </div>
  );
};

export default QualitySelector;
