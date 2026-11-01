import React from 'react';
import type { RealSolidMatch } from '../../lib/matcher/types';
import { Fact } from '../common/Fact';
import { useTrustLedger } from '../../context/TrustLedgerContext';
import { FileText, ChevronRight } from 'lucide-react';

interface RealMatchCardProps {
  match: RealSolidMatch;
  rank: number;
  scenarioFamily?: string;
  isOutsideEnvelope?: boolean;
}

export const RealMatchCard: React.FC<RealMatchCardProps> = ({
  match,
  rank,
  scenarioFamily,
  isOutsideEnvelope = false,
}) => {
  const { openDrawer } = useTrustLedger();

  const runMaterialFamily = match.metadata?.material_family || 'Unknown';
  const isDifferentMaterial = Boolean(
    scenarioFamily && runMaterialFamily.toLowerCase() !== scenarioFamily.toLowerCase()
  );

  const getOutcomeBadge = () => {
    switch (match.outcome_class) {
      case 'frames_recorded':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
            title="Frame count includes post-burn images (BASS-II ReadMe)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Photographed burn: frames recorded
          </span>
        );
      case 'extinguished':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/80"
            title="Principal Investigator explicitly recorded flame extinction or blowoff in flight notes"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            PI-noted extinction
          </span>
        );
      case 'no_ignition':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-purple-950/80 text-purple-400 border border-purple-800/80"
            title="Principal Investigator explicitly recorded ignition failure"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            PI-noted no ignition
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-zinc-400 rounded-md bg-zinc-900 border border-zinc-800">
            {match.outcome_class}
          </span>
        );
    }
  };

  const getDoi = (invId: string) => {
    if (invId === 'PSI-25') return '10.60555/4qc4-de67';
    if (invId === 'PSI-26') return '10.60555/krc0-v888';
    if (invId === 'PSI-98') return '10.60555/0t15-1z43';
    if (invId === 'PSI-99') return '10.60555/k97e-x930';
    return '10.60555/nasa-psi';
  };

  const investigationId = match.metadata?.investigation_id || 'PSI-25';
  const doi = getDoi(investigationId);

  const handleOpenSource = () => {
    openDrawer({
      id: `${match.source_file}:${match.source_row}:RUN:${match.run_uid}`,
      label: `Flight Run ${match.run_uid}`,
      value: match.run_uid,
      basis: 'measured',
      sourceFile: match.source_file,
      sourceColumn: 'Experimental Table',
      sourceRow: match.source_row,
      doi,
      investigationId,
      rawRecord: {
        run_uid: match.run_uid,
        source_file: match.source_file,
        source_row: match.source_row,
        investigation_id: investigationId,
        platform: match.metadata?.platform,
        similarity: match.similarity,
        outcome_class: match.outcome_class,
        factors: match.factors,
        frames_shot: match.metadata?.frames_shot,
      },
    });
  };

  return (
    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/90 shadow-md space-y-3 font-mono hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            #{rank}
          </span>
          <span className="text-sm font-bold text-zinc-100">{match.run_uid}</span>
          <span className="text-xs text-zinc-400">({investigationId})</span>
          <span className="text-xs text-zinc-500">• {match.metadata?.platform}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-750 text-zinc-300">
            Family: <strong className="text-zinc-200">{runMaterialFamily}</strong>
          </span>
          {isDifferentMaterial && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80">
              ⚠️ different material
            </span>
          )}
          {isOutsideEnvelope && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-950/90 text-blue-300 border border-blue-800/80">
              closest tested conditions
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {getOutcomeBadge()}
          <div className="text-xs text-zinc-300">
            Sim: <strong className="text-cyan-400 font-bold">{match.similarity.toFixed(4)}</strong>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Rows */}
      <div className="space-y-2 text-xs">
        {/* Material Factor */}
        <div className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg border border-zinc-850">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 w-16">Material:</span>
            <Fact
              value={match.factors.material.experiment_value}
              basis={match.factors.material.basis}
              sourceFile={match.source_file}
              sourceColumn="Fuel Sample Material"
              sourceRow={match.source_row}
              doi={doi}
              investigationId={investigationId}
              label="Fuel Sample Material"
              showBasisBadge
            />
          </div>
          <span className="text-[11px] text-zinc-400">{match.factors.material.note}</span>
        </div>

        {/* Oxygen Factor */}
        <div className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg border border-zinc-850">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 w-16">Oxygen:</span>
            <Fact
              value={match.factors.oxygen.experiment_value}
              unit="%"
              basis={match.factors.oxygen.basis}
              sourceFile={match.source_file}
              sourceColumn="Calibrated initial O2"
              sourceRow={match.source_row}
              doi={doi}
              investigationId={investigationId}
              label="Oxygen Concentration"
              showBasisBadge
            />
          </div>
          <span className="text-[11px] text-zinc-400">{match.factors.oxygen.note}</span>
        </div>

        {/* Flow Factor */}
        <div className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg border border-zinc-850">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 w-16">Flow:</span>
            <Fact
              value={match.factors.flow.experiment_value}
              unit="cm/s"
              basis={match.factors.flow.basis}
              sourceFile={match.source_file}
              sourceColumn="Air display / Fan display"
              sourceRow={match.source_row}
              doi={doi}
              investigationId={investigationId}
              label="Forced Flow Velocity"
              showBasisBadge
            />
          </div>
          <span className="text-[11px] text-zinc-400">{match.factors.flow.note}</span>
        </div>

        {/* Geometry Factor (if scored) */}
        {match.factors.geometry && (
          <div className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg border border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 w-16">Geometry:</span>
              <Fact
                value={match.factors.geometry.experiment_value}
                basis={match.factors.geometry.basis}
                sourceFile={match.source_file}
                sourceColumn="Fuel Sample Material Dimensions"
                sourceRow={match.source_row}
                doi={doi}
                investigationId={investigationId}
                label="Geometry and Thickness"
                showBasisBadge
              />
            </div>
            <span className="text-[11px] text-zinc-400">{match.factors.geometry.note}</span>
          </div>
        )}
      </div>

      {/* Footer with Source link */}
      <div className="flex items-center justify-between pt-1 text-[11px]">
        <span className="text-zinc-500">
          Source: {match.source_file} • Row {match.source_row}
        </span>
        <button
          onClick={handleOpenSource}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Inspect Provenance Row</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
