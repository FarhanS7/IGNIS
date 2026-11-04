import React, { useState, useMemo } from 'react';
import type { M4ModelExport } from '../../lib/fire/ml/modelTypes.ts';
import { evaluateFLEXExtinction } from '../../lib/fire/ml/extinctionModel.ts';
import m4ModelJson from '../../data/models/m4-extinction-v1.json' with { type: 'json' };

const m4Model: M4ModelExport = m4ModelJson as unknown as M4ModelExport;
import type {
  SequenceStepId,
  SequencerMode,
  SequencerState,
} from '../../lib/fire/types.ts';
import {
  CheckCircle2,
  Clock,
  Flame,
  PowerOff,
  Shield,
  Sliders,
  UserCheck,
  Wind,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ResponseSequencePanelProps {
  sequencerState: SequencerState;
  onConfirmSuppression: () => void;
  onOverrideStep: (stepId: SequenceStepId, reason: string) => void;
  onModeToggle: (mode: SequencerMode) => void;
}

const STEP_LABELS: Record<SequenceStepId, { label: string; desc: string; icon: React.ReactNode }> = {
  ALARM: {
    label: '1. Fire Alarm Declaration',
    desc: 'Multi-sensor detection & confirmation',
    icon: <Flame className="h-4 w-4 text-rose-400" />,
  },
  REMOVE_POWER: {
    label: '2. Remove Electrical Power',
    desc: 'Cold-soak equipment bus to eliminate ignition',
    icon: <PowerOff className="h-4 w-4 text-amber-400" />,
  },
  ISOLATE_VENTILATION: {
    label: '3. Isolate Ventilation',
    desc: 'Close motorized dampers to contain smoke',
    icon: <Wind className="h-4 w-4 text-cyan-400" />,
  },
  INHIBIT_MAKEUP: {
    label: '4. Inhibit Atmosphere Makeup',
    desc: 'Halt O2 and repressurization injection',
    icon: <Shield className="h-4 w-4 text-indigo-400" />,
  },
  SUPPRESSION: {
    label: '5. Fire Suppression Agent',
    desc: 'Discharge extinguishing agent',
    icon: <UserCheck className="h-4 w-4 text-emerald-400" />,
  },
  POST_FIRE_RECOVERY: {
    label: '6. Post-Fire Recovery',
    desc: 'Atmospheric scrubbing and air quality verify',
    icon: <CheckCircle2 className="h-4 w-4 text-teal-400" />,
  },
};

export const ResponseSequencePanel: React.FC<ResponseSequencePanelProps> = ({
  sequencerState,
  onConfirmSuppression,
  onOverrideStep,
  onModeToggle,
}) => {
  const [overrideModalStep, setOverrideModalStep] = useState<SequenceStepId | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');

  const flexExtinctionResult = useMemo(() => {
    const isCO2Agent = sequencerState.suppressionAgentRecommendation === 'CO2';
    return evaluateFLEXExtinction(m4Model, {
      oxygen_mole_fraction: 0.209,
      co2_mole_fraction: isCO2Agent ? 0.35 : 0.005,
      nitrogen_mole_fraction: isCO2Agent ? 0.43 : 0.78,
      helium_mole_fraction: 0.0,
      ambient_pressure_kpa: 101.3,
      droplet_initial_diameter_mm: 2.0,
      is_heptane: 1,
    });
  }, [sequencerState.suppressionAgentRecommendation]);

  const steps = Object.keys(STEP_LABELS) as SequenceStepId[];
  const isCrewed = sequencerState.mode === 'CREWED';

  const handleApplyOverride = () => {
    if (overrideModalStep) {
      onOverrideStep(overrideModalStep, overrideReason || 'Manual crew override engaged');
      setOverrideModalStep(null);
      setOverrideReason('');
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">
            EMERGENCY RESPONSE SEQUENCER
          </h3>
        </div>

        {/* Crewed / Uncrewed Mode Switch */}
        <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => onModeToggle('CREWED')}
            className={`px-2.5 py-1 rounded transition-colors ${
              isCrewed ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crewed Module
          </button>
          <button
            onClick={() => onModeToggle('UNCREWED')}
            className={`px-2.5 py-1 rounded transition-colors ${
              !isCrewed ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Uncrewed Auto
          </button>
        </div>
      </div>

      {/* Crew Safety Alert Banner */}
      {isCrewed && sequencerState.crewSafetyAlerts.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Crew Life-Support & Extinguisher Guidance:</span>
          </div>
          {sequencerState.crewSafetyAlerts.map((alert, idx) => (
            <div key={idx} className="pl-5 text-amber-200/90 text-[11px]">
              • {alert}
            </div>
          ))}
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-2.5">
        {steps.map((sId) => {
          const stepInfo = STEP_LABELS[sId];
          const stepState = sequencerState.steps[sId];
          const isCompleted = stepState.status === 'COMPLETED';
          const isArmed = stepState.status === 'ARMED';
          const isOverridden = stepState.status === 'OVERRIDDEN';

          return (
            <div
              key={sId}
              className={`rounded-lg border p-3 transition-colors ${
                isCompleted
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : isArmed
                  ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : isOverridden
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{stepInfo.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{stepInfo.label}</div>
                    <div className="text-[11px] text-slate-400">{stepInfo.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isArmed
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                        : isOverridden
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {stepState.status}
                  </span>

                  {/* Manual Override Button */}
                  <button
                    onClick={() => setOverrideModalStep(sId)}
                    title="Engage manual override"
                    aria-label={`Engage manual override for ${sId.replace(/_/g, ' ')}`}
                    className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Timestamp & Actor details */}
              {stepState.timestamp_s !== undefined && (
                <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-1.5 text-[10px] font-mono text-slate-400">
                  <span>Actor: {stepState.actor}</span>
                  <span>Time: {stepState.timestamp_s.toFixed(1)}s</span>
                </div>
              )}

              {/* Droplet Extinction Insight Card (NASA FLEX PSI-69) */}
              {sId === 'SUPPRESSION' && (
                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Droplet Extinction Insight (NASA FLEX PSI-69)</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        flexExtinctionResult.category === 'EXTINCTION_REGION'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : flexExtinctionResult.category === 'SUSTAINED_REGION'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {flexExtinctionResult.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.
                  </p>
                  <div className="text-[10px] text-slate-400 italic">
                    Informs crew of physical regime boundaries; never auto-triggers suppression.
                  </div>
                </div>
              )}

              {/* Crew Confirmation Button for SUPPRESSION */}
              {sId === 'SUPPRESSION' && isArmed && isCrewed && (
                <div className="mt-3 border-t border-cyan-800/40 pt-2.5">
                  <button
                    onClick={onConfirmSuppression}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-3 text-xs shadow-lg transition-all"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Crew Confirmation: Authorize {sequencerState.suppressionAgentRecommendation} Discharge</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Override Dialog Modal */}
      {overrideModalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              Manual Override: {overrideModalStep}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter reason for manual override. This action will be logged in the immutable audit event log.
            </p>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Mechanical valve failed to seat; manual clamp applied"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOverrideModalStep(null)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-1.5 text-xs"
              >
                Engage Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Event Log */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Audit Event Log ({sequencerState.eventLog.length} events)</span>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-400 pr-1">
          {sequencerState.eventLog.length === 0 ? (
            <div className="text-slate-600 italic">No events logged yet.</div>
          ) : (
            [...sequencerState.eventLog].reverse().map((ev, i) => (
              <div key={i} className="rounded bg-slate-900/60 p-1.5 border border-slate-800/80">
                <span className="text-cyan-400">[{ev.timestamp_s.toFixed(1)}s]</span>{' '}
                <span className="font-semibold text-slate-200">{ev.action}</span> by{' '}
                <span className="text-amber-300">{ev.actor}</span>: {ev.details}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

