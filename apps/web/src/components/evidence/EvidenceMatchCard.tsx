import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { CoverageBadge } from '../common/CoverageBadge';
import { EvidenceBadge } from '../common/EvidenceBadge';
import type { EvidenceMatch } from '../../types/api';

interface Props {
  match: EvidenceMatch;
  rank: number;
}

export const EvidenceMatchCard: React.FC<Props> = ({ match, rank }) => {
  const [showFactors, setShowFactors] = useState(false);
  const { experiment, run, similarity_score, coverage_level, confidence_level, eligibility, factor_explanations } = match;

  const simPercent = Math.round(similarity_score * 100);

  return (
    <Card
      variant="default"
      padding="none"
      className="border-slate-800 hover:border-slate-700/80 transition-all duration-200 overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header row: Rank, Experiment Title, and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-mono font-bold text-sm shrink-0">
              #{rank}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-orange-400 font-semibold uppercase">
                  {experiment.experiment_family || 'NASA Flight Campaign'}
                </span>
                {experiment.mission_platform && (
                  <span className="text-xs text-slate-400 border-l border-slate-700 pl-2">
                    {experiment.mission_platform}
                  </span>
                )}
                <EvidenceBadge level="A" size="xs" />
              </div>
              <h3 className="text-lg font-bold text-white mt-1 font-['Space_Grotesk',sans-serif]">
                {experiment.title}
              </h3>
              {run.run_label && (
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Test Run: <span className="text-slate-300">{run.run_label}</span>
                </p>
              )}
            </div>
          </div>

          {/* Similarity Score Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Similarity</span>
              <span className="text-xl font-mono font-bold text-orange-400">{simPercent}%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-400 flex items-center justify-center font-mono text-[10px] text-white"
                style={{ transform: `rotate(${simPercent * 3.6}deg)` }}
              >
                <div style={{ transform: `rotate(-${simPercent * 3.6}deg)` }}>
                  {simPercent}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status badges row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <CoverageBadge tier={coverage_level} size="xs" />
          <ConfidenceBadge level={confidence_level} size="xs" />
          {eligibility.status === 'eligible' ? (
            <Badge variant="success" size="xs" dot>
              Scientifically Comparable
            </Badge>
          ) : eligibility.status === 'eligible_with_warning' ? (
            <Badge variant="warning" size="xs" dot>
              Comparable with Caveats
            </Badge>
          ) : (
            <Badge variant="danger" size="xs" dot>
              Non-Comparable Excluded
            </Badge>
          )}
          {run.gravity_environment && (
            <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
              {run.gravity_environment}
            </span>
          )}
        </div>

        {/* Warnings list if any */}
        {eligibility.warnings && eligibility.warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
            {eligibility.warnings.map((w, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Run telemetry grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">Material</span>
            <span className="text-white font-semibold truncate block">
              {run.material || 'Standard sample'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Oxygen (O₂)</span>
            <span className="text-orange-400 font-semibold">
              {run.oxygen_pct !== null && run.oxygen_pct !== undefined ? `${run.oxygen_pct}%` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Pressure</span>
            <span className="text-sky-400 font-semibold">
              {run.pressure_kpa !== null && run.pressure_kpa !== undefined ? `${run.pressure_kpa} kPa` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Forced Airflow</span>
            <span className="text-cyan-400 font-semibold">
              {run.airflow_cm_s !== null && run.airflow_cm_s !== undefined ? `${run.airflow_cm_s} cm/s` : '—'}
            </span>
          </div>
        </div>

        {/* Observed combustion behavior outcomes */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <span className="text-slate-400 text-[11px] font-mono">Observed:</span>

          <div className="flex items-center gap-1.5">
            {run.ignition_observed === true ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : run.ignition_observed === false ? (
              <XCircle className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className={run.ignition_observed ? 'text-white' : 'text-slate-400'}>Ignition</span>
          </div>

          <div className="flex items-center gap-1.5">
            {run.flame_spread_observed === true ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
            ) : run.flame_spread_observed === false ? (
              <XCircle className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className={run.flame_spread_observed ? 'text-white' : 'text-slate-400'}>Flame Spread</span>
          </div>

          <div className="flex items-center gap-1.5">
            {run.extinction_observed === true ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            ) : run.extinction_observed === false ? (
              <XCircle className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className={run.extinction_observed ? 'text-white' : 'text-slate-400'}>Extinction</span>
          </div>
        </div>

        {/* Action Buttons: Why Drawer Toggle, Details Link, Ask Link */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowFactors(!showFactors)}
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer transition-colors"
          >
            <span>{showFactors ? 'Hide Factor Breakdown' : 'Why this matched? (Factor Breakdown)'}</span>
            {showFactors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <Link
              to={`/ask?q=How does ${experiment.title} relate to my habitat?`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <MessageSquare className="w-3 h-3 text-amber-400" />
              <span>Ask IGNIS</span>
            </Link>
            <Link
              to={`/experiment/${experiment.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-xs text-orange-300 font-semibold transition-colors border border-orange-500/30"
            >
              <span>View Experiment</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Expanded Factor Breakdown Drawer (PRD v1.1 §17.3 Why? panel) */}
      {showFactors && (
        <div className="bg-[#05070E]/80 border-t border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Scoring Dimension Decomposition (Module B2)</span>
            </span>
            <span className="text-[11px] text-slate-400">Dynamic weight renormalization</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-normal">Factor</th>
                  <th className="pb-2 font-normal">Your Scenario</th>
                  <th className="pb-2 font-normal">NASA Test Run</th>
                  <th className="pb-2 font-normal">Sub-Score</th>
                  <th className="pb-2 font-normal">Active Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {factor_explanations.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2 text-white font-medium capitalize">
                      {f.factor.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2 text-orange-400/90">
                      {String(f.scenario_value ?? '—')}
                    </td>
                    <td className="py-2 text-sky-400/90">
                      {String(f.experiment_value ?? '—')}
                    </td>
                    <td className="py-2 text-slate-200">
                      {f.similarity_score !== null && f.similarity_score !== undefined
                        ? `${Math.round(f.similarity_score * 100)}%`
                        : '—'}
                    </td>
                    <td className="py-2 text-slate-400">
                      {f.active_weight !== null && f.active_weight !== undefined
                        ? `${(f.active_weight * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};
