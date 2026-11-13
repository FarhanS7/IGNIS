import React from 'react';
import type { ActionEvidenceChip } from '../../lib/fire/types.ts';
import { BookOpen, FileText, Info, AlertTriangle } from 'lucide-react';

interface EvidenceChipsDrawerProps {
  evidenceChip: ActionEvidenceChip;
}

export const EvidenceChipsDrawer: React.FC<EvidenceChipsDrawerProps> = ({ evidenceChip }) => {
  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">
            FLIGHT EVIDENCE & SCIENTIFIC PROVENANCE
          </h3>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-semibold ${
            evidenceChip.isWithinFlightEnvelope
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {evidenceChip.isWithinFlightEnvelope ? 'Within Flight Envelope' : 'Envelope Caution'}
        </span>
      </div>

      <div className="text-xs text-slate-300 font-semibold mb-2">
        Action: <span className="text-cyan-300">{evidenceChip.actionTitle}</span>
      </div>

      {/* Warnings Banner if outside envelope */}
      {evidenceChip.warnings.length > 0 && (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Operational & Environmental Boundaries:</span>
          </div>
          {evidenceChip.warnings.map((w, idx) => (
            <div key={idx} className="pl-5 text-[11px] text-amber-200/90">
              • {w}
            </div>
          ))}
        </div>
      )}

      {/* Circularity Caveat */}
      {evidenceChip.circularityCaveat && (
        <div className="mb-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Circularity & Epistemic Caveat:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {evidenceChip.circularityCaveat}
          </p>
        </div>
      )}

      {/* Matched Real NASA Flight Runs */}
      {evidenceChip.matchedFlightRuns.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Matched Microgravity Flight Runs ({evidenceChip.matchedFlightRuns.length})</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            {evidenceChip.matchedFlightRuns.map((run) => (
              <div
                key={run.run_uid}
                className="flex items-center justify-between rounded bg-slate-900/80 p-2 border border-slate-800"
              >
                <div>
                  <span className="font-bold text-slate-200">{run.run_uid}</span>{' '}
                  <span className="text-slate-400">
                    ({run.metadata?.platform || 'BASS-II'}, {run.metadata?.material_family})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Sim: {(run.similarity * 100).toFixed(0)}%</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-bold ${
                      run.outcome_class === 'extinguished'
                        ? 'bg-rose-500/20 text-rose-300'
                        : run.outcome_class === 'no_ignition'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {run.outcome_class.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary NASA Literature References */}
      {evidenceChip.nasaReferences.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1.5">
            Primary NASA Citations & Standards:
          </div>
          <ul className="space-y-1 text-[11px] text-slate-400 font-mono">
            {evidenceChip.nasaReferences.map((ref, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-cyan-400">▸</span>
                <span>{ref}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

