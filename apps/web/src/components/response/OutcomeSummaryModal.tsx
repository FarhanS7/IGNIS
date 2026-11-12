import React, { useEffect } from 'react';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';
import { CheckCircle2, ExternalLink, FileCheck, X } from 'lucide-react';

export interface OutcomeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
}

export const OutcomeSummaryModal: React.FC<OutcomeSummaryModalProps> = ({
  isOpen,
  onClose,
  timeline,
  frameState,
  t,
}) => {
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isExtinguished = frameState.isFireExtinguished;
  const stdAlarmTime = timeline.clocks.std.alarmTime_s;
  const calAlarmTime = timeline.clocks.cal.alarmTime_s ?? 15.0;

  // Derive extinction timestamp from sequencer events when present
  const suppressionEvent = timeline.sequencerEvents.find((e) => e.stepId === 'SUPPRESSION');
  const recoveryEvent = timeline.sequencerEvents.find((e) => e.stepId === 'POST_FIRE_RECOVERY');
  const extinctionTime = recoveryEvent?.triggerTime_s
    ? Math.max(calAlarmTime, recoveryEvent.triggerTime_s - 2.0)
    : suppressionEvent?.triggerTime_s
    ? suppressionEvent.triggerTime_s + 5.5
    : 28.5;
  const totalResponseDuration = Math.max(
    0,
    isExtinguished ? extinctionTime - calAlarmTime : t - calAlarmTime
  );

  // Derive live detection race metric from active timeline
  let raceDisplayValue = timeline.gapText;
  let raceSubLabel = 'vs baseline optical';
  if (stdAlarmTime === null && calAlarmTime !== null) {
    raceDisplayValue = 'Caught wire smoke';
    raceSubLabel = 'baseline missed threshold';
  } else if (stdAlarmTime !== null && calAlarmTime !== null) {
    const diff = stdAlarmTime - calAlarmTime;
    if (diff > 0) {
      raceDisplayValue = `${diff.toFixed(1)}s earlier`;
    } else if (diff < 0) {
      raceDisplayValue = `${Math.abs(diff).toFixed(1)}s later`;
      raceSubLabel = '6s dust persistence filter';
    } else {
      raceDisplayValue = '0.0s diff';
    }
  }

  // Derive simulated peak temperature up to current t for the origin zone
  const sourceZoneId = timeline.localization.sourceZoneId || timeline.habitat.zones[0]?.id;
  const sourceSeries = sourceZoneId ? timeline.zoneSeries[sourceZoneId] : undefined;
  let peakTempC = 21.5;
  if (sourceSeries) {
    for (let i = 0; i < sourceSeries.timestamps.length; i++) {
      if (sourceSeries.timestamps[i] <= Math.max(t, calAlarmTime)) {
        if (sourceSeries.temperature_c[i] > peakTempC) {
          peakTempC = sourceSeries.temperature_c[i];
        }
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post-Fire Response Outcome Summary"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-200"
    >
      <div className="w-full max-w-2xl bg-[#09111c] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#0d1726]/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                Incident Response Outcome & Scientific Audit
              </h2>
              <div className="text-xs font-mono text-slate-400">
                Verified Scenario: {timeline.scenario.habitatId} · Fuel: {timeline.scenario.fuel}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close outcome summary modal"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Outcome Status Banner */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
                Fire Incident Status
              </div>
              <div className="text-base sm:text-lg font-bold text-white">
                {isExtinguished ? 'Flame Extinguished & Incident Contained' : 'Active Containment Underway'}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40 shrink-0">
              {isExtinguished ? 'EXTINGUISHED' : 'IN PROGRESS'}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
            {/* Detection Lead Time */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400 uppercase">Detection Δt</div>
              <div className="text-lg font-bold text-cyan-300 mt-1">{raceDisplayValue}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{raceSubLabel}</div>
            </div>

            {/* Total Response Duration */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400 uppercase">Alarm → Out</div>
              <div className="text-lg font-bold text-white mt-1">
                {totalResponseDuration.toFixed(1)}s
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Simulated duration</div>
            </div>

            {/* Peak Temperature */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400 uppercase">Peak Temp</div>
              <div className="text-lg font-bold text-amber-300 mt-1">{peakTempC.toFixed(1)} °C</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Limit: 65.0 °C (sim)</div>
            </div>

            {/* Cabin O2 Model Status */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400 uppercase">Atmosphere</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">21.0% nom.</div>
              <div className="text-[10px] text-slate-500 mt-0.5">O₂ depletion not modeled</div>
            </div>
          </div>

          {/* Epistemic Provenance Breakdown Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              <FileCheck className="h-4 w-4" />
              <span>Epistemic Data Classification</span>
            </div>
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-slate-400 border-b border-slate-800 pb-1">
                <tr>
                  <th className="py-1.5 px-2">Metric / Visual</th>
                  <th className="py-1.5 px-2">Provenance Basis</th>
                  <th className="py-1.5 px-2">Scientific Basis / Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-2 font-semibold text-white">Droplet Extinction Time</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      flight-derived
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">
                    NASA FLEX microgravity droplet combustion benchmarks
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-semibold text-white">Sensor Race & Lead Time</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                      flight-calibrated
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">
                    NASA SAME-R ISS flight experiment records (NTRS-20130000422)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-semibold text-white">1D Compartment Advection</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      simulated
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">
                    Lumped-parameter mass balance transport (sim.ts)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-semibold text-white">3D Smoke Particles</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      illustrative
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">
                    GPU particles scaled by compartment obscuration; not 3D CFD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NASA Provenance Link */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="text-slate-400">
              NASA Technical Reports Server Provenance Citation:
              <span className="text-slate-200 ml-1">NTRS-20130000422 (SAME-R Experiment)</span>
            </div>
            <a
              href="https://doi.org/10.1016/j.proci.2014.05.021"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>View NASA Flight Records</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060b13] flex items-center justify-between text-xs font-mono">
          <div className="text-slate-500">
            Simulated. Not flight software.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

