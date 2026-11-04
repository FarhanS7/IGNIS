import React from 'react';
import { AlertTriangle, BookOpen, ExternalLink, FileText, X } from 'lucide-react';

interface ModelCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelCardModal: React.FC<ModelCardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Model Card: M2 Multi-Sensor Fusion Detector
              </h3>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                model_id: m2-fusion-v1 • tag: trained:m2-fusion-v1
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Model Card"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mandatory Warning Banner */}
        <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-950/25 p-3.5 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Trained on Earth-gravity data. Not validated in microgravity.</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            Simulated sensor data. Not flight software. Ground-based multi-sensor training data does not exhibit microgravity boundary-layer thickening or altered smoke particle transport. Evaluates behavioral consistency on simulated streams; not a superiority claim.
          </p>
        </div>

        <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Executive Summary */}
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 mb-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              Executive Summary & Benchmark Comparison
            </h4>
            <p className="text-slate-400 mb-3">
              On held-out fire scenarios (Split S1), the <strong>M2 Learned Fusion Detector</strong> achieves 100.0% fire detection with 71.4% nuisance rejection and 200.0 s median delay. It reduces detection latency by 100 seconds compared to baseline single-channel thresholding (200 s vs 300 s), but does not outperform particulate thresholding on unseen aerosol rejection (71.4% vs 85.7% on aerosol sprays).
            </p>
          </div>

          {/* Training Datasets */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2">
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-200">
              Training Datasets & Open Provenance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-cyan-400 font-bold">Training Dataset D1</div>
                <div className="text-slate-300 text-[11px] mt-1">Indoor Fire Dataset (EN54 Room)</div>
                <div className="text-slate-500 text-[10px] mt-1">DOI: 10.17632/npk2zcm85h.2</div>
                <div className="text-slate-500 text-[10px]">License: CC BY 4.0</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-cyan-400 font-bold">Cross-Site Dataset D2</div>
                <div className="text-slate-300 text-[11px] mt-1">Indoor Fire Dataset (Industrial Hall)</div>
                <div className="text-slate-500 text-[10px] mt-1">DOI: 10.17632/yghykzm4km.1</div>
                <div className="text-slate-500 text-[10px]">License: CC BY 4.0</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
              <span>Reference: Pascal Vorwerk et al., MDPI Fire 2023, 6(8), 323.</span>
              <a
                href="https://doi.org/10.3390/fire6080323"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>[Paper]</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* Model Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-200 mb-2">
              Model Architecture & Features
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
              <li><strong>Model:</strong> L2-regularized Logistic Regression with balanced class weighting.</li>
              <li><strong>Inputs:</strong> 10 unit-free features (Normalized baseline levels, window slopes, window maxima, and cross-channel agreement fraction).</li>
              <li><strong>Temporal Window:</strong> 6 samples (60.0 s history at 10.0 s native cadence).</li>
              <li><strong>Abstention:</strong> Split-conformal prediction sets (q-hat = 0.671 at 90% target coverage) yield <code className="text-amber-300">INSUFFICIENT_EVIDENCE</code> when probability falls in the ambiguity interval [0.329, 0.671].</li>
              <li><strong>Outputs:</strong> Discrete states only (<code className="text-emerald-400">NOMINAL</code>, <code className="text-amber-400">ADVISORY</code>, <code className="text-rose-400">FIRE_ALARM</code>, <code className="text-cyan-400">INSUFFICIENT_EVIDENCE</code>). No continuous risk percentages.</li>
            </ul>
          </div>

          {/* Validation Performance Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="bg-slate-900 px-3 py-2 text-xs font-mono font-semibold text-slate-300 border-b border-slate-800">
              Benchmark Results Across Scenarios (Split S1: Leave-One-Scenario-Out)
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Detector</th>
                  <th className="py-2 px-3">Detection Rate</th>
                  <th className="py-2 px-3">Nuisance Rejection</th>
                  <th className="py-2 px-3">Median Delay</th>
                  <th className="py-2 px-3">False Alarms/hr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-200">B1 Particulate (Baseline)</td>
                  <td className="py-2 px-3 text-emerald-400">100.0%</td>
                  <td className="py-2 px-3 text-emerald-400">85.7%</td>
                  <td className="py-2 px-3">300.0s</td>
                  <td className="py-2 px-3">0.000</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-200">B2 CO Single-Ch</td>
                  <td className="py-2 px-3 text-rose-400">7.7%</td>
                  <td className="py-2 px-3">85.7%</td>
                  <td className="py-2 px-3">1160.0s</td>
                  <td className="py-2 px-3">0.000</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-200">B3 Rule-Based Fusion</td>
                  <td className="py-2 px-3 text-amber-400">30.8%</td>
                  <td className="py-2 px-3">85.7%</td>
                  <td className="py-2 px-3">2515.0s</td>
                  <td className="py-2 px-3">0.000</td>
                </tr>
                <tr className="bg-cyan-950/20">
                  <td className="py-2 px-3 font-bold text-cyan-300">M2 Learned Fusion</td>
                  <td className="py-2 px-3 font-bold text-emerald-400">100.0%</td>
                  <td className="py-2 px-3 text-amber-300">71.4%</td>
                  <td className="py-2 px-3 font-bold text-cyan-300">200.0s</td>
                  <td className="py-2 px-3">0.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Close Model Card
          </button>
        </div>
      </div>
    </div>
  );
};
