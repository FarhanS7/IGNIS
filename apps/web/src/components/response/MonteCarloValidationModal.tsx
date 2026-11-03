import React, { useState } from 'react';
import type { MonteCarloMetrics } from '../../lib/fire/types.ts';
import { runMonteCarloValidationSweep } from '../../lib/fire/validate.ts';
import { AlertTriangle, BarChart3, CheckCircle2, Play, RefreshCw, X } from 'lucide-react';

interface MonteCarloValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitatId: string;
}

export const MonteCarloValidationModal: React.FC<MonteCarloValidationModalProps> = ({
  isOpen,
  onClose,
  habitatId,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runCount, setRunCount] = useState<number>(100);
  const [metrics, setMetrics] = useState<MonteCarloMetrics | null>(null);

  if (!isOpen) return null;

  const handleRunSweep = () => {
    setIsRunning(true);
    // Allow UI to update before compute
    setTimeout(() => {
      const res = runMonteCarloValidationSweep(runCount, habitatId);
      setMetrics(res);
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Monte Carlo Sweep
              </h3>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300 uppercase tracking-wide">
                Design-consistency check, not validation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mandatory Honesty Alert Banner */}
        <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-950/25 p-3 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-300">Methodological Transparency Notice:</span>{' '}
            Design-consistency check, not flight validation. Evaluates internal consistency of multi-channel fusion rules against simulated transport models; does not substitute for physical microgravity test qualification.
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Iterations (N):</span>
            <select
              value={runCount}
              onChange={(e) => setRunCount(Number(e.target.value))}
              className="rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200"
            >
              <option value={50}>50 runs (rapid)</option>
              <option value={100}>100 runs (standard)</option>
              <option value={200}>200 runs (deep)</option>
            </select>
          </div>

          <button
            onClick={handleRunSweep}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-medium py-1.5 px-4 text-xs transition-colors shadow-md"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Simulating Runs...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Execute Monte Carlo Check</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        {metrics && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3">Baseline (Single-Ch)</th>
                    <th className="py-2.5 px-3">Fusion (Multi-Sensor)</th>
                    <th className="py-2.5 px-3">Relative Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Mean Detection Delay</td>
                    <td className="py-2.5 px-3">{metrics.baseline.meanDetectionDelay_s}s</td>
                    <td className="py-2.5 px-3">{metrics.fusion.meanDetectionDelay_s}s</td>
                    <td className="py-2.5 px-3 text-cyan-300">
                      {metrics.fusion.meanDetectionDelay_s <= metrics.baseline.meanDetectionDelay_s
                        ? 'Equal / Faster'
                        : `+${(metrics.fusion.meanDetectionDelay_s - metrics.baseline.meanDetectionDelay_s).toFixed(1)}s (persistence lag)`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">P95 Detection Delay</td>
                    <td className="py-2.5 px-3">{metrics.baseline.p95DetectionDelay_s}s</td>
                    <td className="py-2.5 px-3">{metrics.fusion.p95DetectionDelay_s}s</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      Tail delay comparison
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Nuisance Dust False Alarm Rate</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">
                      {(metrics.baseline.nuisanceFalseAlarmRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {(metrics.fusion.nuisanceFalseAlarmRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                      {metrics.rankingComparison.fusionBeatsBaselineOnFalseAlarms
                        ? 'Superior rejection'
                        : 'Comparable'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Top-1 Localization Rate</td>
                    <td className="py-2.5 px-3">
                      {(metrics.baseline.top1ClearAccuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      {(metrics.fusion.top1ClearAccuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">
                      {metrics.rankingComparison.fusionBeatsBaselineOnLocalization
                        ? 'Maintained / Improved'
                        : 'Comparable'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Consistency Assessment */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Design-Consistency Result:</span>{' '}
                <span className="text-slate-300 font-mono">
                  {metrics.rankingComparison.sweepDiscrepancyNotes}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

