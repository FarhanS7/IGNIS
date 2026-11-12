import React, { useEffect } from 'react';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';
import { AlertTriangle, Shield, X } from 'lucide-react';

export type DetectorArmId = 'std' | 'cal' | 'ml';

export interface DetectorDetailModalProps {
  detectorArm: DetectorArmId | null;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
  onClose: () => void;
}

export const DetectorDetailModal: React.FC<DetectorDetailModalProps> = ({
  detectorArm,
  timeline,
  frameState,
  t,
  onClose,
}) => {
  // ESC key handler
  useEffect(() => {
    if (!detectorArm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detectorArm, onClose]);

  if (!detectorArm) return null;

  const clock = frameState.clocks[detectorArm];
  const alarmTime_s = timeline.clocks[detectorArm].alarmTime_s;
  const isAlarmed = clock.isFrozen;

  const detailsByArm = {
    std: {
      name: 'Baseline Photoelectric Smoke Detector',
      shortName: 'Standard Optical',
      provenanceTag: 'photoelectric_baseline',
      primaryChannels: ['Optical Obscuration (% obs/m)'],
      algorithm:
        'Single-channel threshold detector. Measures particulate light scattering inside an optical chamber and triggers FIRE_ALARM at ≥ 2.5 %/m obscuration (ADVISORY at ≥ 1.2 %/m).',
      thresholdCriteria: 'Obscuration ≥ 2.5 %/m (FIRE_ALARM), ≥ 1.2 %/m (ADVISORY)',
      disagreementNotes:
        'Reacts rapidly to soot-heavy smoldering or flaming polymers (often ~2.0–2.5 s before persistent fusion), but small particles (< 0.3 µm) from overheated wire insulation scatter weakly (SAME-R factor 0.257) and can miss the optical alarm threshold.',
      strengths: 'Fast initial response on soot-rich plumes; simple flight heritage since Space Shuttle era.',
      limitations:
        'High false-alarm rate on non-fire aerosols (dust, cleaning spray). Misses low-soot sub-micron wire overheating (Teflon/Kapton).',
    },
    cal: {
      name: 'SAME-R Calibrated Heuristic Multi-Sensor Detector',
      shortName: 'SAME-R Calibrated Fusion',
      provenanceTag: 'nasa_same_r_calibrated',
      primaryChannels: [
        'Optical Obscuration (%/m)',
        'Carbon Monoxide (CO ppm)',
        'Temperature Rise Rate (°C/min)',
      ],
      algorithm:
        'Multi-channel heuristic fusion. Evaluates coincident optical obscuration, carbon monoxide concentration, and thermal rate-of-rise across a 6.0 s persistence window to reject non-fire dust.',
      thresholdCriteria:
        'Coincident channels (smoke ≥ 1.2 %/m, CO ≥ 15/35 ppm, or dT/dt ≥ 5.0 °C/min) sustained over 6.0 s persistence window',
      disagreementNotes:
        'On low-soot wire fires (Teflon/Kapton), CO detection triggers an alarm where single-channel optical sensors miss threshold. On sootier cellulose/PMMA fires, the 6.0 s dust-rejection window adds ~2.0–2.5 s of confirmation lag after baseline optical threshold.',
      strengths:
        'Cuts nuisance-dust false alarms (1.000 → 0.388 in N=100 sweep) and catches sub-micron wire overheating missed by optical-only detectors.',
      limitations:
        'Electrochemical CO cells undergo sensor drift over long multi-year missions; requires periodic cross-calibration.',
    },
    ml: {
      name: 'Machine Learning Logistic Regression Fusion',
      shortName: 'ML Fusion Detector',
      provenanceTag: 'trained_logistic_regression',
      primaryChannels: [
        'Optical Obscuration (% obs/m)',
        'Carbon Monoxide (CO ppm)',
        'Temperature (°C)',
      ],
      algorithm:
        'Supervised logistic regression classifier trained on Earth-gravity test fixtures (Datasets D1 EN54 Room & D2 Industrial Hall). Evaluates sliding 3-sensor vector window.',
      thresholdCriteria: 'Logistic sigmoid output probability threshold ≥ 0.50 (Categorical: FIRE_ALARM)',
      disagreementNotes:
        'Fast response on laboratory combustion signatures. However, zero-gravity particulate agglomeration differs from Earth gravity, creating unvalidated boundary conditions.',
      strengths: 'Learns multivariate correlation boundaries from high-volume combustion data.',
      limitations:
        'Trained on Earth-gravity data. Not validated in microgravity. Natural convection absent in space.',
    },
  };

  const info = detailsByArm[detectorArm];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${info.shortName} Details`}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-200"
    >
      <div className="w-full max-w-xl bg-[#09111c] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#0d1726]/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                {info.shortName}
              </h2>
              <div className="text-xs font-mono text-slate-400 truncate">
                {info.name}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close detector modal"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Current State & Race Status */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="text-[10px] text-slate-400 uppercase">Detection Clock (t = {t.toFixed(1)}s)</div>
              <div className="text-xl font-bold text-cyan-300 mt-1">
                {clock.time_s.toFixed(1)}s
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {isAlarmed ? 'ALARM CONFIRMED' : 'MONITORING'}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="text-[10px] text-slate-400 uppercase">Alarm Timestamp</div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {alarmTime_s !== null ? `t = ${alarmTime_s.toFixed(1)}s` : 'NONE'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {alarmTime_s !== null ? 'Clock Frozen' : 'Awaiting Threshold'}
              </div>
            </div>
          </div>

          {/* ML Honesty Notice (if ML arm) */}
          {detectorArm === 'ml' && (
            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs font-mono text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block font-bold">Epistemic Caveat:</strong>
                Trained on Earth-gravity data. Not validated in microgravity. Particle distribution in microgravity lacks buoyant stratification.
              </div>
            </div>
          )}

          {/* Algorithm & Logic */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-1.5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Detection Algorithm & Logic
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {info.algorithm}
            </p>
          </div>

          {/* Threshold Criteria */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-1.5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Trigger Threshold
            </div>
            <div className="font-mono text-xs text-slate-200 bg-slate-950 p-2 rounded border border-slate-800">
              <code>{info.thresholdCriteria}</code>
            </div>
          </div>

          {/* Monitored Sensor Channels */}
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Primary Sensor Channels
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {info.primaryChannels.map((ch, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* Disagreement & Performance Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-1.5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Sensor Disagreement & Benchmark Notes
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {info.disagreementNotes}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#060b13] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Tag: {info.provenanceTag}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

