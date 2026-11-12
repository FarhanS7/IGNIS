import React from 'react';
import { RotateCcw, FileCheck, CheckCircle2 } from 'lucide-react';

export interface IncidentSummaryCardProps {
  moduleName: string;
  isExtinguished: boolean;
  alarmTime_s: number | null;
  onReplay: () => void;
  onExploreFullSimulation: () => void;
  onOpenAuditModal: () => void;
  className?: string;
}

export const IncidentSummaryCard: React.FC<IncidentSummaryCardProps> = ({
  moduleName,
  isExtinguished: _isExtinguished,
  alarmTime_s,
  onReplay,
  onExploreFullSimulation,
  onOpenAuditModal,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label="Incident Summary Card"
      className={`bg-[#09111c]/95 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-center font-sans animate-in fade-in zoom-in-95 duration-200 max-w-md w-full ${className}`}
    >
      <div className="flex justify-center mb-2">
        <div className="p-2 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white tracking-tight">
        Fire out in {moduleName}
      </h3>

      <p className="text-xs text-slate-300 font-sans mt-1">
        Alarm at {alarmTime_s ? `${alarmTime_s.toFixed(1)}s` : '15.0s'} · Containment sealed · Suppression verified
      </p>

      {/* Honesty badges */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 my-3">
        <span className="px-2 py-0.5 rounded border border-amber-600/40 bg-amber-950/50 text-amber-300 text-[10px] font-mono">
          Simulated. Not flight software.
        </span>
        <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300 text-[10px] font-mono">
          Trained on Earth-gravity data. Not validated in microgravity.
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onReplay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Replay</span>
        </button>

        <button
          onClick={onOpenAuditModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-xs font-sans transition-colors"
        >
          <FileCheck className="h-3.5 w-3.5" />
          <span>View NASA Audit</span>
        </button>

        <button
          onClick={onExploreFullSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-sans transition-colors"
        >
          <span>Explore 100s &rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default IncidentSummaryCard;
