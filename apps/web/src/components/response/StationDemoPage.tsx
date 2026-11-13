import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FuelType, SequencerMode } from '../../lib/fire/types.ts';
import { getHabitatById, getHabitatPresets } from '../../lib/fire/habitat.ts';
import { useTimeline } from '../../lib/fire/timeline/useTimeline.ts';
import { StationStage } from './StationStage.tsx';
import { HoldToConfirmGate } from './HoldToConfirmGate.tsx';
import { ExplanationDrawer } from './ExplanationDrawer.tsx';
import { ModuleTelemetryDrawer } from './ModuleTelemetryDrawer.tsx';
import { DetectorDetailModal, type DetectorArmId } from './DetectorDetailModal.tsx';
import { OutcomeSummaryModal } from './OutcomeSummaryModal.tsx';
import { ProofDrawerOverlay } from './ProofDrawerOverlay.tsx';
import { ClosingCardOverlay } from './ClosingCardOverlay.tsx';
import { EarthVsOrbitIntro } from './EarthVsOrbitIntro.tsx';
import { markIntroSeen, resetIntroSeen } from './introStorage.ts';
import { resolveActiveExplanation } from '../../lib/fire/upgrade/explanationContent.ts';
import { VisualLayersControl, type VisualLayerPreferences } from './VisualLayersControl.tsx';
import { IncidentSummaryCard } from './IncidentSummaryCard.tsx';
import { resolveStoryboardScene } from './sceneStoryboard.ts';
import { useNarration } from '../../lib/fire/narration/useNarration.ts';
import { UnifiedNarrationDeck } from './UnifiedNarrationDeck.tsx';
import { GuidedProgressSequence } from './GuidedProgressSequence.tsx';
import { DetailsMenuDrawer } from './DetailsMenuDrawer.tsx';
import {
  Pause,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';

export interface StationDemoPageProps {
  onSwitchToInspect?: () => void;
}

export const StationDemoPage: React.FC<StationDemoPageProps> = ({ onSwitchToInspect }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCaptureMode = searchParams.get('capture') === '1';

  // Experience Mode State: 'guided' (Default, 36s) vs 'explore' (Full Simulation, 100s)
  const [experienceMode, setExperienceMode] = useState<'guided' | 'explore'>(() => {
    return searchParams.get('mode') === 'explore' ? 'explore' : 'guided';
  });

  const duration_s = isCaptureMode ? 90.0 : experienceMode === 'guided' ? 36.0 : 100.0;
  const crewConfirmDelay_s = experienceMode === 'guided' ? 5.0 : 8.0;

  // Educational Prologue State (activates via ?intro=1 or details menu)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return searchParams.get('intro') === '1';
  });

  // Scenario configuration state
  const habitatPresets = useMemo(() => getHabitatPresets(), []);
  const [habitatId, setHabitatId] = useState<string>('iss_like_module');
  const [fuel, setFuel] = useState<FuelType>('cellulose');
  const [mode, setMode] = useState<SequencerMode>('CREWED');

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
    play,
    pause,
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
      duration_s,
      crewConfirmDelay_s,
    },
    true
  );

  const handleToggleExperienceMode = (newMode: 'guided' | 'explore') => {
    setExperienceMode(newMode);
    const newParams = new URLSearchParams(searchParams);
    if (newMode === 'explore') {
      newParams.set('mode', 'explore');
    } else {
      newParams.delete('mode');
    }
    setSearchParams(newParams, { replace: true });
    restart();
  };

  // Synchronized Voice Narration & Guided Audio
  const {
    activeCue,
    settings: audioSettings,
    toggleVoice,
    toggleSubtitles,
    setVolume,
    toggleMute,
    replayCurrentCue,
  } = useNarration({
    timeline,
    habitat: currentHabitat,
    t,
    isPlaying,
    isGuidedMode: experienceMode === 'guided',
  });

  // Human Gate State in CREWED Mode
  const [hasConfirmedCrewSuppression, setHasConfirmedCrewSuppression] = useState<boolean>(false);

  // Details Menu & Drawer States
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isExplanationDrawerOpen, setIsExplanationDrawerOpen] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDetectorArm, setSelectedDetectorArm] = useState<DetectorArmId | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState<boolean>(false);
  const [isProofDrawerOpen, setIsProofDrawerOpen] = useState<boolean>(false);

  // Camera Orbit Controls
  const [userAzimuthOffset, setUserAzimuthOffset] = useState<number>(0);
  const [userElevationOffset, setUserElevationOffset] = useState<number>(0);
  const [userZoomOffset, setUserZoomOffset] = useState<number>(0);

  const hasManualCamera = useMemo(() => {
    return (
      Math.abs(userAzimuthOffset) > 0.001 ||
      Math.abs(userElevationOffset) > 0.001 ||
      Math.abs(userZoomOffset) > 0.001
    );
  }, [userAzimuthOffset, userElevationOffset, userZoomOffset]);

  const handleResetCamera = useCallback(() => {
    setUserAzimuthOffset(0);
    setUserElevationOffset(0);
    setUserZoomOffset(0);
  }, []);

  // Scientific Visual Layers Preferences
  const [visualLayers, setVisualLayers] = useState<VisualLayerPreferences>({
    smoke: true,
    thermal: false,
    airflow: true,
    sensors: true,
  });
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState<boolean>(false);

  const handleLayerChange = (key: keyof VisualLayerPreferences, value: boolean) => {
    setVisualLayers((prev) => ({ ...prev, [key]: value }));
  };

  const selectedZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return currentHabitat.zones.find((z) => z.id === selectedZoneId) || null;
  }, [currentHabitat, selectedZoneId]);

  const currentScene = useMemo(() => {
    return resolveStoryboardScene(
      t,
      timeline.clocks.cal.alarmTime_s,
      frameState.isSuppressionArmed,
      frameState.isSuppressionActive,
      frameState.isFireExtinguished,
      experienceMode === 'guided'
    );
  }, [
    t,
    timeline.clocks.cal.alarmTime_s,
    frameState.isSuppressionArmed,
    frameState.isSuppressionActive,
    frameState.isFireExtinguished,
    experienceMode,
  ]);

  const activeExplanation = useMemo(() => {
    return resolveActiveExplanation(
      t,
      frameState.isSuppressionArmed,
      frameState.isSuppressionActive,
      frameState.isFireExtinguished,
      timeline.clocks.cal.alarmTime_s,
      timeline.clocks.std.alarmTime_s
    );
  }, [
    t,
    frameState.isSuppressionArmed,
    frameState.isSuppressionActive,
    frameState.isFireExtinguished,
    timeline.clocks.cal.alarmTime_s,
    timeline.clocks.std.alarmTime_s,
  ]);

  // Auto-pause when reaching suppression armed state in crewed mode
  useEffect(() => {
    if (mode === 'CREWED' && frameState.isSuppressionArmed && !hasConfirmedCrewSuppression && isPlaying) {
      pause();
    }
  }, [mode, frameState.isSuppressionArmed, hasConfirmedCrewSuppression, isPlaying, pause]);

  // Reset confirmed flag whenever scrubbing before suppression discharge
  useEffect(() => {
    if (!frameState.isSuppressionActive && !frameState.isFireExtinguished) {
      setHasConfirmedCrewSuppression(false);
    }
  }, [frameState.isSuppressionActive, frameState.isFireExtinguished]);

  const handleConfirmGate = useCallback(() => {
    setHasConfirmedCrewSuppression(true);
    const armedStep = timeline.sequencerEvents.find((e) => e.stepId === 'SUPPRESSION');
    const confirmTime = armedStep ? armedStep.triggerTime_s : t + 0.5;
    seek(confirmTime);
    play();
  }, [timeline.sequencerEvents, t, seek, play]);

  const handleInspectClick = () => {
    if (onSwitchToInspect) {
      onSwitchToInspect();
    } else {
      setSearchParams({ view: 'inspect' });
    }
  };

  // Educational Stage Walkthrough (Approach B) Handlers
  const handleSelectStage = useCallback(
    (stageNum: number) => {
      pause();
      let targetT = 0.0;
      if (stageNum === 1) targetT = 2.0;
      else if (stageNum === 2) targetT = 7.5;
      else if (stageNum === 3) targetT = timeline.clocks.cal.alarmTime_s ?? 12.0;
      else if (stageNum === 4) targetT = 18.0;
      else if (stageNum === 5) targetT = 28.5;
      seek(targetT);
    },
    [pause, seek, timeline.clocks.cal.alarmTime_s]
  );

  const currentStageNum = activeCue?.stageNumber ?? currentScene.sceneNumber ?? 1;

  const handleNextStage = useCallback(() => {
    const next = Math.min(5, currentStageNum + 1);
    handleSelectStage(next);
  }, [currentStageNum, handleSelectStage]);

  const handlePrevStage = useCallback(() => {
    const prev = Math.max(1, currentStageNum - 1);
    handleSelectStage(prev);
  }, [currentStageNum, handleSelectStage]);

  // Plain-English single-sentence current event caption
  const currentEventCaption = useMemo(() => {
    const originZone = currentHabitat.zones.find((z) => z.id === timeline.scenario.sourceZoneId);
    const originName = originZone?.name.replace(/\(.*\)/, '').trim() || 'the station';

    if (frameState.isFireExtinguished) {
      return `Fire out in ${originName}`;
    }
    if (frameState.isSuppressionActive) {
      return `Releasing suppression into ${originName}`;
    }
    if (frameState.isSuppressionArmed) {
      return mode === 'CREWED'
        ? 'Waiting for crew to confirm'
        : 'Automatic suppression authorized';
    }
    const calAlarm = timeline.clocks.cal.alarmTime_s;
    if (calAlarm !== null && t >= calAlarm) {
      return `Source found: ${originName}`;
    }
    if (t >= 4.0) {
      return `Smoke detected in ${originName}`;
    }
    return 'Smoke begins spreading through the station';
  }, [currentHabitat, timeline.scenario.sourceZoneId, frameState, mode, timeline.clocks.cal.alarmTime_s, t]);

  // Lead time difference calculation (honest comparison from active timeline)
  const stdAlarmTime = timeline.clocks.std.alarmTime_s;
  const calAlarmTime = timeline.clocks.cal.alarmTime_s;
  const detectorComparison = useMemo(() => {
    if (stdAlarmTime === null && calAlarmTime !== null) {
      return {
        beforeAlarm: 'Calibrated catches sub-micron fire — Standard misses threshold',
        afterAlarm: 'Calibrated catches sub-micron fire — Standard still waiting',
        badge: 'SAME-R catches wire smolder',
      };
    }
    if (stdAlarmTime !== null && calAlarmTime !== null) {
      const delta = Math.abs(stdAlarmTime - calAlarmTime);
      const rounded = delta >= 1 ? Math.round(delta).toString() : delta.toFixed(1);
      if (calAlarmTime < stdAlarmTime) {
        return {
          beforeAlarm: `Calibrated detector alarms ~${rounded} s earlier`,
          afterAlarm: `Calibrated alarms ${rounded} s earlier`,
          badge: `${rounded} s earlier`,
        };
      }
      if (calAlarmTime > stdAlarmTime) {
        return {
          beforeAlarm: `Standard alarms ~${rounded} s earlier; Calibrated waits 6 s to filter dust`,
          afterAlarm: `Calibrated alarms ${rounded} s later (6 s multi-sensor dust filter)`,
          badge: `6 s dust-filter lag (+${rounded} s)`,
        };
      }
      return {
        beforeAlarm: 'Both detectors reach alarm simultaneously',
        afterAlarm: 'Both detectors alarmed at the same timestamp',
        badge: 'Synchronous',
      };
    }
    return {
      beforeAlarm: 'Comparing single-channel optical vs SAME-R calibrated fusion',
      afterAlarm: timeline.gapText,
      badge: timeline.gapText,
    };
  }, [stdAlarmTime, calAlarmTime, timeline.gapText]);

  const isStdFlashing = stdAlarmTime !== null && t >= stdAlarmTime && t < stdAlarmTime + 1.2;
  const isCalFlashing = calAlarmTime !== null && t >= calAlarmTime && t < calAlarmTime + 1.2;

  // Handle Intro completion
  const handleIntroComplete = () => {
    markIntroSeen();
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    resetIntroSeen();
    setShowIntro(true);
  };

  // If showing intro prologue, render 2D prologue (strictly 0 WebGL canvases alive)
  if (showIntro) {
    return (
      <EarthVsOrbitIntro
        onComplete={handleIntroComplete}
        onSkip={handleIntroComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#04070d] text-[#e8f0f8] flex flex-col font-sans selection:bg-cyan-500/30 w-full overflow-x-hidden">
      {/* Header (Layout A): Title, 1 Subtitle Line, Honesty Text */}
      <header className="px-4 py-3 border-b border-slate-800/80 bg-[#09111c]/90 flex flex-wrap items-center justify-between gap-3 max-w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Fire in space
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
            Watch how fast two detectors notice a fire, then respond.
          </p>
        </div>

        {/* Required Epistemic Caveats in One Line */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded border border-amber-600/40 bg-amber-950/40 text-amber-300 text-[10px] sm:text-xs font-mono">
            Simulated. Not flight software.
          </span>
          <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300 text-[10px] sm:text-xs font-mono">
            Trained on Earth-gravity data. Not validated in microgravity.
          </span>
        </div>
      </header>

      {/* Scenario Controls (Layout B): Collapsed Single Row */}
      <div className="border-b border-slate-800/80 bg-[#060b13] px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium whitespace-nowrap">Station:</label>
            <select
              value={habitatId}
              onChange={(e) => {
                setHabitatId(e.target.value);
                const hab = getHabitatById(e.target.value);
                if (hab && hab.zones[0]) setSourceZoneId(hab.zones[0].id);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:border-cyan-500 outline-none"
            >
              {habitatPresets.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium whitespace-nowrap">Material that burns:</label>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value as FuelType)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:border-cyan-500 outline-none"
            >
              <option value="cellulose">Cellulose / Cotton</option>
              <option value="teflon">Teflon Wire Overheating</option>
              <option value="pmma">PMMA / Acrylic</option>
              <option value="silicone">Silicone Wire</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium whitespace-nowrap">Who confirms:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SequencerMode)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:border-cyan-500 outline-none"
            >
              <option value="CREWED">Crew</option>
              <option value="UNCREWED">Automatic if uncrewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Visual Stage (Layout C): Station Canvas with ONE Caption Line */}
      <main className="relative flex-1 min-h-[380px] max-h-[580px] bg-[#03060c] border-b border-slate-800/80 overflow-hidden flex flex-col justify-between">
        {/* At most ONE caption line over canvas */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-[#09111c]/90 border border-slate-700/80 text-xs font-sans text-slate-200 shadow-md">
            {currentEventCaption}
          </span>
        </div>

        {/* ONE Details Menu Button at Top Right (Layout H) */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setIsDetailsOpen(true)}
            aria-label="Details"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#09111c]/90 border border-slate-700/90 hover:border-cyan-400 text-xs font-sans text-slate-200 shadow-lg backdrop-blur-md transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span>Details</span>
          </button>
        </div>

        {/* 3D Scene / 2D Fallback Stage */}
        <div className="absolute inset-0 z-0">
          <StationStage
            habitat={currentHabitat}
            timeline={timeline}
            frameState={frameState}
            t={t}
            selectedZoneId={selectedZoneId ?? undefined}
            onSelectZone={(zId) => setSelectedZoneId(zId)}
            userAzimuthOffset={userAzimuthOffset}
            userElevationOffset={userElevationOffset}
            userZoomOffset={userZoomOffset}
            layers={visualLayers}
            isGuidedMode={experienceMode === 'guided'}
            isExploreMode={experienceMode === 'explore'}
          />
        </div>

        {/* Unified Narration Subtitles & Compact Audio (Layout G) */}
        {!(experienceMode === 'guided' && t >= 32.0) && (
          <div className="absolute bottom-3 inset-x-2 sm:inset-x-4 max-w-xl mx-auto z-20 pointer-events-auto">
            <UnifiedNarrationDeck
              scene={currentScene}
              activeCue={activeCue}
              settings={audioSettings}
              onExploreWhy={() => setIsExplanationDrawerOpen(true)}
              onToggleVoice={toggleVoice}
              onToggleSubtitles={toggleSubtitles}
              onToggleMute={toggleMute}
              onVolumeChange={setVolume}
              onReplayCue={replayCurrentCue}
              onSelectStage={handleSelectStage}
              onNextStage={handleNextStage}
              onPrevStage={handlePrevStage}
            />
          </div>
        )}

        {/* Result at End: Incident Summary Card (Layout J) */}
        {experienceMode === 'guided' && t >= 32.0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md">
              <IncidentSummaryCard
                moduleName={currentHabitat.zones.find((z) => z.id === timeline.scenario.sourceZoneId)?.name || 'Module 1'}
                isExtinguished={frameState.isFireExtinguished}
                alarmTime_s={timeline.clocks.cal.alarmTime_s}
                onReplay={restart}
                onExploreFullSimulation={() => handleToggleExperienceMode('explore')}
                onOpenAuditModal={() => setIsOutcomeModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Screen-Edge Alarm Pulse Vignette */}
        {frameState.clocks.cal.isFrozen && !frameState.isFireExtinguished && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              opacity: 0.35 + 0.25 * Math.sin(t * 7),
              boxShadow: 'inset 0 0 140px 24px rgba(255, 66, 88, 0.55)',
            }}
          />
        )}

        {/* Hold to Confirm Gate (Layout F) */}
        <HoldToConfirmGate
          isArmed={
            mode === 'CREWED'
              ? frameState.isSuppressionArmed && !hasConfirmedCrewSuppression
              : frameState.isSuppressionArmed
          }
          mode={mode}
          onConfirm={handleConfirmGate}
          onStandDown={() => restart()}
        />
      </main>

      {/* Clocks Section (Layout D): Exactly Two Clocks + Difference Line */}
      <div className="bg-[#060b13] border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Standard detector */}
            <button
              onClick={() => setSelectedDetectorArm('std')}
              aria-label="Inspect standard baseline detector"
              className={`p-3 rounded-xl border text-left transition-all ${
                isStdFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                  : frameState.clocks.std.isFrozen
                  ? 'border-red-500/60 bg-red-950/40'
                  : 'border-slate-800 bg-[#09111c]/80'
              }`}
              title="Traditional spacecraft smoke obscuration threshold"
            >
              <div className="text-xs font-sans text-slate-400">
                Standard detector
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                {frameState.clocks.std.time_s.toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">s</span>
              </div>
              <div className="text-[11px] font-mono uppercase text-slate-400 mt-0.5">
                {frameState.clocks.std.isFrozen ? 'ALARM' : frameState.clocks.std.status}
              </div>
            </button>

            {/* Calibrated detector */}
            <button
              onClick={() => setSelectedDetectorArm('cal')}
              aria-label="Inspect SAME-R calibrated multi-sensor detector"
              className={`p-3 rounded-xl border text-left transition-all ${
                isCalFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                  : frameState.clocks.cal.isFrozen
                  ? 'border-cyan-500/80 bg-cyan-950/45 shadow-[0_0_15px_rgba(58,215,255,0.25)]'
                  : 'border-slate-800 bg-[#09111c]/80'
              }`}
              title="NASA SAME-R multi-sensor heuristic fusion (smoke + CO + thermal)"
            >
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-400">Calibrated detector</span>
                <span className="text-[10px] text-cyan-400 font-mono">SAME-R calibrated</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
                {frameState.clocks.cal.time_s.toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">s</span>
              </div>
              <div className="text-[11px] font-mono uppercase text-slate-400 mt-0.5">
                {frameState.clocks.cal.isFrozen ? 'ALARM' : frameState.clocks.cal.status}
              </div>
            </button>
          </div>

          {/* Single Difference Line */}
          <div className="text-center text-xs font-sans text-cyan-300 font-medium mt-2">
            {calAlarmTime !== null && t >= calAlarmTime
              ? detectorComparison.afterAlarm
              : detectorComparison.beforeAlarm}
          </div>
        </div>
      </div>

      {/* Progress & Scrubber Footer (Layout E): ONE Stepper */}
      <footer className="bg-[#09111c] p-3 sm:p-4 space-y-3">
        <div className="max-w-4xl mx-auto flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <button
              onClick={restart}
              aria-label="Restart simulation"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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

          {experienceMode === 'explore' && (
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 ml-auto order-2 sm:order-3">
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
                    speed === s ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ONE 5-Beat Progress Stepper */}
        <div className="max-w-4xl mx-auto pt-1">
          <GuidedProgressSequence
            t={t}
            duration_s={timeline.duration_s}
            onSeek={(seekTime) => {
              if (experienceMode === 'guided') {
                pause();
              }
              seek(seekTime);
            }}
          />
        </div>
      </footer>

      {/* Details Menu Drawer (Layout H) */}
      <DetailsMenuDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        habitat={currentHabitat}
        selectedZoneId={selectedZoneId}
        onSelectZone={(zId) => setSelectedZoneId(zId)}
        onSelectDetectorArm={(arm) => setSelectedDetectorArm(arm)}
        onOpenExplanation={() => setIsExplanationDrawerOpen(true)}
        onOpenProof={() => setIsProofDrawerOpen(true)}
        onOpenOutcome={() => setIsOutcomeModalOpen(true)}
        onOpenLayers={() => setIsLayersMenuOpen(true)}
        onSwitchToInspect={handleInspectClick}
        onRotateLeft={() => setUserAzimuthOffset((prev) => prev - 0.25)}
        onRotateRight={() => setUserAzimuthOffset((prev) => prev + 0.25)}
        onZoomIn={() => setUserZoomOffset((prev) => Math.max(-0.6, prev - 0.15))}
        onZoomOut={() => setUserZoomOffset((prev) => Math.min(1.2, prev + 0.15))}
        onResetCamera={handleResetCamera}
        hasManualCamera={hasManualCamera}
        onReturnToGuidedCamera={handleResetCamera}
        onReplayIntro={handleReplayIntro}
        isFireExtinguished={frameState.isFireExtinguished}
      />

      {/* Modals & Drawers */}
      <ExplanationDrawer
        isOpen={isExplanationDrawerOpen}
        onClose={() => setIsExplanationDrawerOpen(false)}
        explanation={activeExplanation}
        t={t}
      />

      <ModuleTelemetryDrawer
        zone={selectedZone}
        timeline={timeline}
        frameState={frameState}
        t={t}
        onClose={() => setSelectedZoneId(null)}
      />

      <DetectorDetailModal
        detectorArm={selectedDetectorArm}
        timeline={timeline}
        frameState={frameState}
        t={t}
        onClose={() => setSelectedDetectorArm(null)}
      />

      <OutcomeSummaryModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        timeline={timeline}
        frameState={frameState}
        t={t}
      />

      <ProofDrawerOverlay
        isOpen={isProofDrawerOpen}
        onClose={() => setIsProofDrawerOpen(false)}
      />

      <VisualLayersControl
        layers={visualLayers}
        onChangeLayer={handleLayerChange}
        isOpen={isLayersMenuOpen}
        onToggleOpen={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
        hideButton={true}
      />

      {/* Closing Card in Capture Mode */}
      {isCaptureMode && (
        <ClosingCardOverlay isVisible={t >= 82.0} />
      )}
    </div>
  );
};

export default StationDemoPage;
