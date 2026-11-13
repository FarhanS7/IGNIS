import React, { useEffect } from 'react';
import type { HabitatZone } from '../../lib/fire/types.ts';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';
import { Flame, Info, Power, Wind, X } from 'lucide-react';

export interface ModuleTelemetryDrawerProps {
  zone: HabitatZone | null;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
  onClose: () => void;
}

export const ModuleTelemetryDrawer: React.FC<ModuleTelemetryDrawerProps> = ({
  zone,
  timeline,
  frameState,
  t,
  onClose,
}) => {
  // Handle ESC key to dismiss
  useEffect(() => {
    if (!zone) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zone, onClose]);

  if (!zone) return null;

  const isOrigin = zone.id === timeline.scenario.sourceZoneId;
  const stepIdx = Math.min(timeline.steps.length - 1, Math.floor(t / timeline.dt_s));
  const series = timeline.zoneSeries[zone.id];

  const obscuration = series?.smokeObscuration[stepIdx] ?? 0;
  const co_ppm = series?.coPpm[stepIdx] ?? 0;
  const temp_C = series?.temperature_c[stepIdx] ?? 21.0;

  // Oxygen calculation based on combustion consumption
  const o2_percent = isOrigin
    ? Math.max(18.8, 20.9 - (co_ppm / 50.0) * 0.4)
    : 20.9;

  // Categorical status
  let statusBadge = {
    label: 'NOMINAL',
    bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };
  if (isOrigin && !frameState.isFireExtinguished && t >= (timeline.clocks.cal.alarmTime_s ?? 999)) {
    statusBadge = {
      label: 'FIRE ALARM (ACTIVE INCIDENT)',
      bg: 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_12px_rgba(255,66,88,0.3)]',
    };
  } else if (obscuration > 0.05 || co_ppm > 5.0) {
    statusBadge = {
      label: 'ADVISORY (ELEVATED PARTICULATE)',
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  } else if (frameState.areVentsIsolated) {
    statusBadge = {
      label: 'ISOLATED (DAMPERS CLOSED)',
      bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    };
  }

  const isPowerCut = frameState.isPowerCut && isOrigin;
  const areVentsIsolated = frameState.areVentsIsolated;

  return (
    <aside
      role="dialog"
      aria-label={`Module telemetry inspection for ${zone.name}`}
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#09111c]/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col font-sans text-slate-200 transition-transform duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#0d1726]/70">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 font-bold">
              MODULE INSPECTION
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {zone.id}
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-wide truncate mt-0.5">
            {zone.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close module inspection drawer"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Chip */}
        <div className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${statusBadge.bg}`}>
          <span>Status:</span>
          <span>{statusBadge.label}</span>
        </div>

        {/* Real Sensor Telemetry Grid */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Compartment Sensor Telemetry (t = {t.toFixed(1)}s)
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono">
            {/* Obscuration */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400">SMOKE OBSCURATION</div>
              <div className="text-lg font-bold text-cyan-300 mt-1">
                {obscuration.toFixed(3)}
                <span className="text-xs font-normal text-slate-400 ml-1">% obs/m</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Threshold: 0.150</div>
            </div>

            {/* Carbon Monoxide */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400">CARBON MONOXIDE</div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {co_ppm.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-1">ppm</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Threshold: 15.0 ppm</div>
            </div>

            {/* Temperature */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400">TEMPERATURE</div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {temp_C.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ambient: 21.0 °C</div>
            </div>

            {/* Oxygen Concentration */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-400">OXYGEN (O2)</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {o2_percent.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-1">%</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Safe margin: &gt; 19.5%</div>
            </div>
          </div>
        </div>

        {/* Module Subsystem State */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Subsystem Isolation Telemetry
          </div>
          <div className="space-y-2 text-xs font-mono">
            {/* Ventilation Damper */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className={`h-4 w-4 ${areVentsIsolated ? 'text-red-400' : 'text-cyan-400'}`} />
                <span className="text-slate-300">Ventilation Dampers:</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold ${
                areVentsIsolated
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {areVentsIsolated ? 'CLOSED (ISOLATED)' : 'OPEN (AIRFLOW 0.15 m/s)'}
              </span>
            </div>

            {/* Electrical Power */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Power className={`h-4 w-4 ${isPowerCut ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="text-slate-300">Payload Power:</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold ${
                isPowerCut
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isPowerCut ? 'DE-ENERGIZED' : 'ENERGIZED'}
              </span>
            </div>

            {/* Fire Suppression */}
            {isOrigin && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-cyan-400" />
                  <span className="text-slate-300">Suppression Agent:</span>
                </div>
                <span className="text-cyan-300 font-bold">
                  {frameState.isSuppressionActive
                    ? 'DISCHARGING WATER MIST'
                    : frameState.isSuppressionArmed
                    ? 'ARMED (CREW GATE)'
                    : 'STANDBY'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Spatial Granularity Disclosure */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-400 uppercase">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Spatial Model Granularity</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Telemetry represents <strong>compartment-averaged values</strong> from the 1D advection transport engine. Visual duct and particle flows indicate inter-compartment mass flux, not sub-grid 3D fluid CFD.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#060b13] text-[10px] font-mono text-slate-500 text-center">
        Inspection only. No operational commands issued from this view.
      </div>
    </aside>
  );
};

