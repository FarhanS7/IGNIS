import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { JudgeExecutiveSummaryModal } from './JudgeExecutiveSummaryModal.tsx';
import {
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Zap,
  Trophy,
  Info,
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

  // Auto-Pace: Pauses simulation during voice narration so speech finishes naturally, then smoothly resumes
  const wasPlayingBeforeSpeechRef = useRef<boolean>(false);

  const handleAutoPacePause = useCallback(() => {
    if (isPlaying) {
      wasPlayingBeforeSpeechRef.current = true;
      pause();
    }
  }, [isPlaying, pause]);

  const handleAutoPaceResume = useCallback(() => {
    if (wasPlayingBeforeSpeechRef.current) {
      wasPlayingBeforeSpeechRef.current = false;
      play();
    }
  }, [play]);

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
    onAutoPacePause: handleAutoPacePause,
    onAutoPaceResume: handleAutoPaceResume,
  });

  // Human Gate State in CREWED Mode
  const [hasConfirmedCrewSuppression, setHasConfirmedCrewSuppression] = useState<boolean>(false);

  // Executive Judge Modal & Info Drawer States
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState<boolean>(false);
  const [isWhy13sOpen, setIsWhy13sOpen] = useState<boolean>(false);

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

  // Origin zone and live sensor telemetry (deterministic timeline slice)
  const originZone = useMemo(() => {
    return currentHabitat.zones.find((z) => z.id === timeline.scenario.sourceZoneId);
  }, [currentHabitat.zones, timeline.scenario.sourceZoneId]);

  const stepIdx = Math.min(
    timeline.steps.length - 1,
    Math.max(0, Math.floor(t / timeline.dt_s))
  );
  const originSeries = timeline.zoneSeries[timeline.scenario.sourceZoneId];
  const liveObscuration = originSeries?.smokeObscuration[stepIdx] ?? 0;
  const liveCoPpm = originSeries?.coPpm[stepIdx] ?? 0;
  const liveTempC = originSeries?.temperature_c[stepIdx] ?? 21.0;

  // Plain-English single-sentence current event caption
  const currentEventCaption = useMemo(() => {
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
  }, [originZone, frameState, mode, timeline.clocks.cal.alarmTime_s, t]);

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

            {/* "See AI Win" Material Switcher (Feature 3) */}
            {fuel !== 'teflon' ? (
              <button
                type="button"
                onClick={() => {
                  setFuel('teflon');
                  restart();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 text-[11px] font-sans transition-all shadow-[0_0_12px_rgba(58,215,255,0.15)] hover:shadow-[0_0_16px_rgba(58,215,255,0.3)] active:scale-95 cursor-pointer"
                title="Switch to Teflon wire overheating to see SAME-R multi-sensor alarm ~10s faster than optical detector"
              >
                <Zap className="h-3 w-3 text-cyan-400 fill-cyan-400/20" />
                <span>See AI Win: Test Teflon Wire</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFuel('cellulose');
                  restart();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 text-[11px] font-sans transition-all active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer"
                title="Teflon wire active (sub-micron smoke). Click to revert to Cellulose."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Teflon Active (AI ~10s faster) · Revert</span>
              </button>
            )}
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
          <span className="px-3 py-1 rounded-full bg-[#060b14]/85 backdrop-blur-xl border border-white/10 text-xs font-sans text-slate-200 shadow-md">
            {currentEventCaption}
          </span>
        </div>

        {/* Floating Atmospheric Telemetry HUD (Feature 2) */}
        <div className="absolute top-3 inset-x-0 hidden md:flex justify-center pointer-events-none z-10 px-4">
          <div className="flex items-center gap-3 px-3.5 py-1 rounded-full bg-[#060b14]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-xs font-sans text-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">{originZone?.name.replace(/\(.*\)/, '').trim() || 'Origin'}:</span>
            </div>
            <div className="flex items-center gap-2.5 font-mono text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-slate-500">Smoke</span>
                <span className={liveObscuration >= 0.012 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {(liveObscuration * 100).toFixed(2)}%/m
                </span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-slate-500">CO</span>
                <span className={liveCoPpm >= 15 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {liveCoPpm.toFixed(0)} ppm
                </span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-slate-500">Temp</span>
                <span className="text-slate-300">{liveTempC.toFixed(1)}°C</span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1">
                <span className="text-slate-500">Ducts</span>
                <span className={frameState.areVentsIsolated ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {frameState.areVentsIsolated ? 'SEALED' : 'OPEN'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Action Cluster: Judge Brief & Details (Layout H) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsJudgeModalOpen(true)}
            aria-label="Judge Brief"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/85 border border-cyan-500/50 hover:border-cyan-400 text-xs font-sans text-cyan-200 hover:text-white shadow-[0_0_14px_rgba(58,215,255,0.25)] hover:shadow-[0_0_20px_rgba(58,215,255,0.4)] backdrop-blur-xl transition-all cursor-pointer font-medium active:scale-95"
            title="Executive Brief for Judges & Visitors: 30-second breakdown of microgravity physics, multi-sensor breakthrough, and sequencer"
          >
            <Trophy className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Judge Brief (30s)</span>
            <span className="sm:hidden">Brief</span>
          </button>

          <button
            onClick={() => setIsDetailsOpen(true)}
            aria-label="Details"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#060b14]/85 border border-white/10 hover:border-cyan-400 text-xs font-sans text-slate-200 shadow-lg backdrop-blur-xl transition-colors cursor-pointer"
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
      <div className="bg-[#030712]/90 border-b border-white/10 px-4 py-3 backdrop-blur-xl">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Standard detector */}
            <button
              onClick={() => setSelectedDetectorArm('std')}
              aria-label="Inspect standard baseline detector"
              className={`p-3 rounded-2xl border text-left transition-all ${
                isStdFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                  : frameState.clocks.std.isFrozen
                  ? 'border-red-500/60 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'border-white/10 bg-[#09111c]/80 hover:border-white/20'
              }`}
              title="Traditional spacecraft smoke obscuration threshold"
            >
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-400">Standard detector</span>
                <span className="text-[10px] text-slate-500 font-mono">Single optical</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                {frameState.clocks.std.time_s.toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">s</span>
              </div>
              <div className="text-[11px] font-mono uppercase text-slate-400 mt-0.5">
                {frameState.clocks.std.isFrozen ? 'ALARM' : frameState.clocks.std.status}
              </div>

              {/* Live Single-Channel Obscuration Bar (Feature 1) */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Obscuration</span>
                  <span className={liveObscuration >= 0.025 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {(liveObscuration * 100).toFixed(2)}% / 2.50%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-150 rounded-full ${
                      liveObscuration >= 0.025
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                        : 'bg-amber-500/70'
                    }`}
                    style={{ width: `${Math.min(100, (liveObscuration / 0.025) * 100)}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-500 flex items-center justify-between pt-0.5 font-mono">
                  <span>Fixed threshold</span>
                  <span className="text-amber-500/80">No dust filter</span>
                </div>
              </div>
            </button>

            {/* Calibrated detector */}
            <button
              onClick={() => setSelectedDetectorArm('cal')}
              aria-label="Inspect SAME-R calibrated multi-sensor detector"
              className={`p-3 rounded-2xl border text-left transition-all ${
                isCalFlashing
                  ? 'border-white bg-white/30 ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                  : frameState.clocks.cal.isFrozen
                  ? 'border-cyan-500/80 bg-cyan-950/45 shadow-[0_0_15px_rgba(58,215,255,0.25)]'
                  : 'border-white/10 bg-[#09111c]/80 hover:border-white/20'
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

              {/* Live Multi-Sensor Bars + 6s Dust Filter Countdown (Feature 1) */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Smoke + CO Fusion</span>
                  <span className={liveObscuration >= 0.012 && liveCoPpm >= 15 ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                    {(liveObscuration * 100).toFixed(2)}% · {liveCoPpm.toFixed(0)}ppm
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-150 rounded-full ${
                      calAlarmTime !== null && t >= calAlarmTime
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(58,215,255,0.7)]'
                        : liveObscuration >= 0.012
                        ? 'bg-cyan-500/70'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      width: `${
                        calAlarmTime !== null && t >= calAlarmTime
                          ? 100
                          : liveObscuration >= 0.012
                          ? Math.min(100, 50 + (t - (calAlarmTime ? calAlarmTime - 6.0 : 9.0)) * 8.3)
                          : Math.min(50, (liveObscuration / 0.012) * 50)
                      }%`,
                    }}
                  />
                </div>

                {/* Dynamic 6s Dust Verification Pill */}
                <div className="pt-0.5">
                  {calAlarmTime !== null && t >= calAlarmTime ? (
                    <div className="text-[9px] font-mono text-cyan-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>True fire verified</span>
                      </span>
                      <span className="text-cyan-400 font-bold">Dust filtered</span>
                    </div>
                  ) : calAlarmTime !== null && t < calAlarmTime && liveObscuration >= 0.012 ? (
                    <div className="text-[9px] font-mono text-amber-300 flex items-center justify-between animate-pulse">
                      <span>⏳ Checking CO & temp:</span>
                      <span className="font-bold">{(calAlarmTime - t).toFixed(1)}s dust filter</span>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-500 flex items-center justify-between font-mono">
                      <span>Nominal surveillance</span>
                      <span className="text-cyan-500/80">6s filter ready</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Single Difference Line & Explanatory Pill */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md text-center">
            <div className="text-xs font-sans text-cyan-300 font-medium">
              {calAlarmTime !== null && t >= calAlarmTime
                ? detectorComparison.afterAlarm
                : detectorComparison.beforeAlarm}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              {calAlarmTime !== null && calAlarmTime > (stdAlarmTime ?? 0)
                ? 'Standard triggers at 13s on optical threshold alone. Calibrated waits 6s to cross-verify CO & temperature, preventing station dust false alarms.'
                : 'In wire overheating, sub-micron smoke particles delay optical scattering. SAME-R multi-sensor catches combustion gas ~10s earlier.'}
            </div>

            {/* 13s vs 15s Explainer Pill (Component 3) */}
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setIsWhy13sOpen(!isWhy13sOpen)}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 hover:text-cyan-100 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <Info className="h-3 w-3 text-cyan-400" />
                <span>Why 13s vs 15s? {isWhy13sOpen ? 'Hide Analysis' : 'Show Analysis'}</span>
              </button>
            </div>

            {isWhy13sOpen && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/30 text-left text-xs font-sans text-slate-200 animate-in fade-in space-y-2 shadow-2xl">
                <div className="font-bold font-mono text-[10px] text-cyan-300 flex items-center justify-between border-b border-white/5 pb-1">
                  <span>Physics Breakdown: False Alarm Rejection vs Optical Delay</span>
                  <span className="text-[9px] text-slate-400">NASA SAME-R</span>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  <strong className="text-amber-400">Standard Optical (13.0s):</strong> Fixed 2.5%/m obscuration threshold with zero gas cross-check. Ambient station lint or dust triggers emergency alarms and costly crew sleep disruptions.
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  <strong className="text-cyan-400">Calibrated Multi-Sensor (15.0s):</strong> Detects early smoke at 1.2%/m, then enforces a 6-second persistence window confirming concurrent CO rise (&gt;15 ppm). Latching at 15.0s eliminates false alarms.
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  <strong className="text-emerald-400">Teflon Wire Overheat:</strong> Invisible sub-micron smoke delays optical scatter detection to 25.0s. IGNIS detects CO outgassing early at 15.2s — <span className="font-bold text-emerald-300">alarming nearly 10s earlier</span>!
                </div>
              </div>
            )}
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

      <JudgeExecutiveSummaryModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onJumpToTeflon={() => {
          setFuel('teflon');
          restart();
        }}
        onExploreTimeline={() => handleToggleExperienceMode('explore')}
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
