import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FuelType, SequencerMode, SequenceStepId, StepStatus } from '../../lib/fire/types.ts';
import { getHabitatById, getHabitatPresets } from '../../lib/fire/habitat.ts';
import { useTimeline } from '../../lib/fire/timeline/useTimeline.ts';
import { Caption } from './Caption.tsx';
import { StationStage } from './StationStage.tsx';
import { LocalizationOverlay } from './LocalizationOverlay.tsx';
import {
  AlertOctagon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Wind,
  ZapOff,
} from 'lucide-react';

export interface StationDemoPageProps {
  onSwitchToInspect?: () => void;
}

export const StationDemoPage: React.FC<StationDemoPageProps> = ({ onSwitchToInspect }) => {
  const [, setSearchParams] = useSearchParams();

  // Scenario configuration state
  const habitatPresets = useMemo(() => getHabitatPresets(), []);
  const [habitatId, setHabitatId] = useState<string>('iss_like_module');
  const [fuel, setFuel] = useState<FuelType>('cellulose');
  const [mode, setMode] = useState<SequencerMode>('CREWED');
  const [showScenarioPanel, setShowScenarioPanel] = useState<boolean>(false);

  const currentHabitat = useMemo(() => {
    return getHabitatById(habitatId) || habitatPresets[0];
  }, [habitatId, habitatPresets]);

  const [sourceZoneId, setSourceZoneId] = useState<string>(
    currentHabitat.zones[0]?.id || 'zone_1'
  );

  // Precomputed deterministic timeline hook
  const {
    timeline,
    t,
    isPlaying,
    speed,
    frameState,
    togglePlay,
    seek,
    setSpeed,
    restart,
  } = useTimeline(
    {
      habitatId,
      fuel,
      sourceZoneId,
      mode,
      duration_s: 100.0,
      crewConfirmDelay_s: 8.0,
    },
    true
  );

  const handleInspectClick = () => {
    if (onSwitchToInspect) {
      onSwitchToInspect();
    } else {
      setSearchParams({ view: 'inspect' });
    }
  };

  const stageIcons: Record<SequenceStepId, React.ReactNode> = {
    ALARM: <AlertOctagon className="h-4 w-4" />,
    REMOVE_POWER: <ZapOff className="h-4 w-4" />,
    ISOLATE_VENTILATION: <Wind className="h-4 w-4" />,
    INHIBIT_MAKEUP: <ShieldAlert className="h-4 w-4" />,
    SUPPRESSION: <Flame className="h-4 w-4" />,
    POST_FIRE_RECOVERY: <CheckCircle2 className="h-4 w-4" />,
  };

  const stageLabels: Record<SequenceStepId, string> = {
    ALARM: 'Alarm',
    REMOVE_POWER: 'Power Cut',
    ISOLATE_VENTILATION: 'Vents Closed',
    INHIBIT_MAKEUP: 'Inhibit Makeup',
    SUPPRESSION: 'Suppression',
    POST_FIRE_RECOVERY: 'Recovery',
  };

  const stageSequence: SequenceStepId[] = [
    'ALARM',
    'REMOVE_POWER',
    'ISOLATE_VENTILATION',
    'INHIBIT_MAKEUP',
    'SUPPRESSION',
    'POST_FIRE_RECOVERY',
  ];

  // Clock flash triggers at moment of alarm
  const stdAlarmTime = timeline.clocks.std.alarmTime_s;
  const calAlarmTime = timeline.clocks.cal.alarmTime_s;
  const mlAlarmTime = timeline.clocks.ml.alarmTime_s;

  const isStdFlashing = stdAlarmTime !== null && t >= stdAlarmTime && t < stdAlarmTime + 1.2;
  const isCalFlashing = calAlarmTime !== null && t >= calAlarmTime && t < calAlarmTime + 1.2;
  const isMlFlashing = mlAlarmTime !== null && t >= mlAlarmTime && t < mlAlarmTime + 1.2;

  return (
    <div className="min-h-screen bg-[#04070d] text-[#e8f0f8] flex flex-col font-sans selection:bg-cyan-500/30 w-full overflow-x-hidden">
      {/* Top Bar: Brand, Badges, View Toggle */}
      <header className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800/80 bg-[#09111c]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 sm:gap-3 max-w-full">
        <div className="flex items-center gap-3">
          <h1 className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl sm:text-2xl tracking-wider text-white">
              IGN<span className="text-cyan-400">IS</span>
            </span>
            <span className="font-display font-medium text-[11px] sm:text-xs tracking-widest uppercase text-slate-400">
              Fire Response Console
            </span>
          </h1>
        </div>

        {/* Persistent Honesty Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-left">
          <span className="px-2 py-0.5 sm:py-1 rounded border border-amber-600/40 bg-amber-950/40 text-amber-300 text-[10px] sm:text-xs font-mono font-medium">
            Simulated. Not flight software.
          </span>
          <span className="px-2 py-0.5 sm:py-1 rounded border border-slate-700 bg-slate-900 text-slate-300 text-[10px] sm:text-xs font-mono break-words max-w-[280px] sm:max-w-none">
            Trained on Earth-gravity data. Not validated in microgravity.
          </span>
          <span className="px-2 py-0.5 sm:py-1 rounded border border-cyan-800 bg-cyan-950/50 text-cyan-300 text-[10px] sm:text-xs font-mono uppercase">
            {mode} Mode
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScenarioPanel(!showScenarioPanel)}
            className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Scenario</span> Controls
            {showScenarioPanel ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleInspectClick}
            className="px-3 py-1 sm:py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold tracking-wide transition-colors"
          >
            Inspect Console &rarr;
          </button>
        </div>
      </header>

      {/* Collapsible "Run your own scenario" panel */}
      {showScenarioPanel && (
        <div className="border-b border-slate-800 bg-[#0d1726] p-3 sm:p-4 transition-all">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Habitat Preset
              </label>
              <select
                value={habitatId}
                onChange={(e) => {
                  setHabitatId(e.target.value);
                  const hab = getHabitatById(e.target.value);
                  if (hab && hab.zones[0]) setSourceZoneId(hab.zones[0].id);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
              >
                {habitatPresets.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Fuel Material
              </label>
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value as FuelType)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
              >
                <option value="cellulose">Cellulose / Cotton (Primary)</option>
                <option value="teflon">Teflon Wire Overheating (NASA SAME-R)</option>
                <option value="pmma">PMMA / Acrylic Plexiglas</option>
                <option value="silicone">Silicone Wire Insulation</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Ignition Origin Zone
              </label>
              <select
                value={sourceZoneId}
                onChange={(e) => setSourceZoneId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
              >
                {currentHabitat.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Operating Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('CREWED')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-medium border transition-colors ${
                    mode === 'CREWED'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Crewed (Hold)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('UNCREWED')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-medium border transition-colors ${
                    mode === 'UNCREWED'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Uncrewed Auto
                </button>
              </div>
            </div>
          </div>

          {habitatId === 'lunar_habitat' && (
            <div className="mt-3 text-xs text-amber-400 font-mono bg-amber-950/30 border border-amber-800/50 rounded p-2">
              Partial-gravity smoke transport is not validated; results are indicative only.
            </div>
          )}
        </div>
      )}

      {/* Main Visual Stage (3D Scene with 2D Fallback) */}
      <main className="relative flex-1 min-h-[440px] max-h-[660px] bg-[#03060c] border-b border-slate-800/80 overflow-hidden flex flex-col justify-between">
        {/* Race Clocks HUD (Top Centered Over Canvas) */}
        <div className="absolute top-0 inset-x-0 z-10 w-full max-w-2xl mx-auto pt-2 px-2 pointer-events-none">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 pointer-events-auto">
            {/* Arm 1: Standard Detector */}
            <div
              className={`min-w-0 p-2 sm:p-3 rounded-lg border backdrop-blur-md transition-all ${
                isStdFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white/90 shadow-[0_0_35px_rgba(255,255,255,0.7)]'
                  : frameState.clocks.std.isFrozen
                  ? 'border-red-500/60 bg-red-950/40 shadow-[0_0_20px_rgba(255,66,88,0.25)]'
                  : 'border-slate-800 bg-[#09111c]/85'
              }`}
            >
              <div className="text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-slate-400 truncate">
                Standard
              </div>
              <div className="font-mono text-lg sm:text-3xl font-semibold text-amber-400 tracking-tight mt-0.5 truncate">
                {frameState.clocks.std.time_s.toFixed(1)}
                <span className="text-xs font-sans text-slate-400 ml-1">s</span>
              </div>
              <div className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 sm:mt-1 flex items-center justify-between">
                <span className="truncate">{frameState.clocks.std.isFrozen ? 'ALARM' : frameState.clocks.std.status}</span>
                {frameState.clocks.std.isFrozen && (
                  <span className="text-red-400 font-semibold hidden sm:inline ml-1">FROZEN</span>
                )}
              </div>
            </div>

            {/* Arm 2: SAME-R Calibrated Fusion */}
            <div
              className={`min-w-0 p-2 sm:p-3 rounded-lg border backdrop-blur-md transition-all ${
                isCalFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white/90 shadow-[0_0_35px_rgba(255,255,255,0.7)]'
                  : frameState.clocks.cal.isFrozen
                  ? 'border-cyan-500/80 bg-cyan-950/45 shadow-[0_0_24px_rgba(58,215,255,0.3)]'
                  : 'border-slate-800 bg-[#09111c]/85'
              }`}
            >
              <div className="text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-slate-400 truncate">
                SAME-R calibrated
              </div>
              <div className="font-mono text-lg sm:text-3xl font-semibold text-cyan-400 tracking-tight mt-0.5 truncate">
                {frameState.clocks.cal.time_s.toFixed(1)}
                <span className="text-xs font-sans text-slate-400 ml-1">s</span>
              </div>
              <div className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 sm:mt-1 flex items-center justify-between">
                <span className="truncate">{frameState.clocks.cal.isFrozen ? 'ALARM' : frameState.clocks.cal.status}</span>
                {frameState.clocks.cal.isFrozen && (
                  <span className="text-cyan-300 font-semibold hidden sm:inline ml-1">FROZEN</span>
                )}
              </div>
            </div>

            {/* Arm 3: ML Fusion */}
            <div
              className={`min-w-0 p-2 sm:p-3 rounded-lg border backdrop-blur-md transition-all ${
                isMlFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white/90 shadow-[0_0_35px_rgba(255,255,255,0.7)]'
                  : frameState.clocks.ml.isFrozen
                  ? 'border-fuchsia-500/60 bg-fuchsia-950/40'
                  : 'border-slate-800 bg-[#09111c]/85'
              }`}
            >
              <div className="text-[9px] sm:text-[11px] font-mono tracking-wider uppercase text-slate-400 truncate">
                ML fusion
              </div>
              <div className="font-mono text-lg sm:text-3xl font-semibold text-fuchsia-400 tracking-tight mt-0.5 truncate">
                {frameState.clocks.ml.time_s.toFixed(1)}
                <span className="text-xs font-sans text-slate-400 ml-1">s</span>
              </div>
              <div className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 sm:mt-1 flex items-center justify-between">
                <span className="truncate">{frameState.clocks.ml.isFrozen ? 'ALARM' : frameState.clocks.ml.status}</span>
                {frameState.clocks.ml.isFrozen && (
                  <span className="text-fuchsia-300 font-semibold hidden sm:inline ml-1">FROZEN</span>
                )}
              </div>
            </div>
          </div>

          {/* ML Disclosure Banner */}
          <div className="w-full flex justify-center mt-1">
            <span className="text-[10px] font-mono text-slate-400/90 text-center">
              ML arm: Trained on Earth-gravity data. Not validated in microgravity.
            </span>
          </div>

          {/* Big Computed Gap Banner (When Available) */}
          {frameState.gapText && (
            <div className="w-full flex justify-center mt-1.5 pointer-events-auto">
              <span className="px-3.5 py-1 rounded-full border border-emerald-500/50 bg-emerald-950/70 text-emerald-300 text-xs sm:text-sm font-mono font-bold tracking-wide shadow-[0_0_15px_rgba(56,228,164,0.3)]">
                {frameState.gapText}
              </span>
            </div>
          )}
        </div>

        {/* 3D Scene / 2D Fallback Stage */}
        <div className="absolute inset-0 z-0">
          <StationStage
            habitat={currentHabitat}
            timeline={timeline}
            frameState={frameState}
            t={t}
          />
        </div>

        {/* Soft Screen-Edge Alarm Pulse Vignette */}
        {frameState.clocks.cal.isFrozen && !frameState.isFireExtinguished && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              opacity: 0.35 + 0.25 * Math.sin(t * 7),
              boxShadow: 'inset 0 0 140px 24px rgba(255, 66, 88, 0.55)',
            }}
          />
        )}

        {/* Localization Rings & Reticle Overlay */}
        <LocalizationOverlay
          habitat={currentHabitat}
          timeline={timeline}
          frameState={frameState}
          t={t}
        />

        {/* Dynamic Caption Display (Bottom of Stage Over Canvas) */}
        <div className="absolute bottom-2 inset-x-0 z-10 pb-1 sm:pb-2 pointer-events-none">
          <Caption text={frameState.activeCaption} />
        </div>
      </main>

      {/* Bottom Scrubber & 6 Containment Stages */}
      <footer className="bg-[#09111c] border-t border-slate-800/90 p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        {/* Playback Controls & Range Scrubber */}
        <div className="max-w-5xl mx-auto flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
              className="p-1.5 sm:p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <button
              onClick={restart}
              aria-label="Restart simulation"
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-2 min-w-0 order-3 sm:order-2 w-full sm:w-auto">
            <span className="font-mono text-xs text-cyan-300 min-w-[36px]">
              {t.toFixed(1)}s
            </span>
            <input
              type="range"
              min={0}
              max={timeline.duration_s}
              step={0.1}
              value={t}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 min-w-0 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <span className="font-mono text-xs text-slate-400 min-w-[36px]">
              {timeline.duration_s.toFixed(0)}s
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 ml-auto order-2 sm:order-3">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
                  speed === s
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* 6 Stage Emergency Containment Progression */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 pt-1">
          {stageSequence.map((stepId) => {
            const status: StepStatus = frameState.stages[stepId] || 'PENDING';
            const isCompleted = status === 'COMPLETED';
            const isArmed = status === 'ARMED' || status === 'EXECUTING';

            return (
              <div
                key={stepId}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono transition-all ${
                  isCompleted
                    ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300'
                    : isArmed
                    ? 'border-amber-500/80 bg-amber-950/40 text-amber-300'
                    : 'border-slate-800 bg-slate-900/30 text-slate-500'
                }`}
              >
                <span
                  className={
                    isCompleted
                      ? 'text-cyan-400'
                      : isArmed
                      ? 'text-amber-400'
                      : 'text-slate-600'
                  }
                >
                  {stageIcons[stepId]}
                </span>
                <span className="truncate">{stageLabels[stepId]}</span>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
};

export default StationDemoPage;
