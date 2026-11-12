import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Globe,
  Compass,
  Orbit,
  Play,
  RotateCcw,
  Wind,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Beat, EvidenceRef, TextSizeSetting } from '../types';
import type { StoryLevel } from '../levels';
import { getLayerPreferences, saveLayerPreferences } from '../storage';
import { SelfDrawingArrow } from './SelfDrawingArrow';
import { PredictCards } from './PredictCards';
import { FlightScatterChart, type FlightScatterRun } from './FlightScatterChart';
import { AtmosphereScatterChart, type BassRun } from './AtmosphereScatterChart';
import { SmokeMaterialChart, type SmokeFlightRun } from './SmokeMaterialChart';
import { ExplorationEnvelopeChart, type EnvelopeEntry } from './ExplorationEnvelopeChart';
import { MissionPatch } from './MissionPatch';
import chapter1DropletData from '../../data/story/chapter1_droplets.json';
import chapter2AtmosphereData from '../../data/story/chapter2_atmosphere.json';
import chapter3SmokeData from '../../data/story/chapter3_smoke.json';
import chapter4GapsData from '../../data/story/chapter4_gaps.json';

export interface BeatRendererProps {
  beat: Beat;
  beatIndex: number;
  totalBeats: number;
  chapterSlug?: string;
  chapterNumber?: number;
  currentLevel?: StoryLevel;
  stageInputs?: Record<string, any>;
  onUpdateStageInputs?: (inputs: Partial<Record<string, any>>) => void;
  onOpenGlossary: (term?: string) => void;
  predictedChoiceId?: string;
  onSelectPrediction?: (choiceId: string) => void;
  checkAnswerId?: string;
  onSelectCheckAnswer?: (choiceId: string) => void;
  onNextBeat?: () => void;
  scrollProgressG?: number;
  textSize?: TextSizeSetting;
  showEmberCaptionsInFlow?: boolean;
  isTheatreMode?: boolean;
}

const REGIME_PRESETS = [
  { g: 1.0, label: 'Earth', badge: '1.00g', icon: Globe, desc: 'Convective Teardrop' },
  { g: 0.38, label: 'Mars', badge: '0.38g', icon: Compass, desc: 'Partial Buoyancy' },
  { g: 0.16, label: 'Moon', badge: '0.16g', icon: Sparkles, desc: 'Weak Buoyancy' },
  { g: 0.0, label: 'Orbit', badge: '0.00g', icon: Orbit, desc: 'Pure Sphere' },
];

export const BeatRenderer: React.FC<BeatRendererProps> = ({
  beat,
  beatIndex,
  totalBeats,
  chapterSlug: _chapterSlug = 'why-is-fire-round-in-space',
  chapterNumber = 1,
  currentLevel = 'explorer',
  stageInputs = {},
  onUpdateStageInputs,
  onOpenGlossary,
  predictedChoiceId,
  onSelectPrediction,
  checkAnswerId,
  onSelectCheckAnswer,
  onNextBeat,
  textSize = 'normal',
  showEmberCaptionsInFlow = false,
  isTheatreMode = false,
}) => {
  const initialLayerPrefs = getLayerPreferences();
  const [layer2Open, setLayer2Open] = useState<boolean>(initialLayerPrefs.layer2Open);
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState<boolean>(false);
  const [copiedTakeaway, setCopiedTakeaway] = useState<boolean>(false);
  const [showAdultText, setShowAdultText] = useState<boolean>(false);
  const [isBurningDroplet, setIsBurningDroplet] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const handleToggleLayer2 = () => {
    setLayer2Open((prev) => {
      const next = !prev;
      saveLayerPreferences({ layer2Open: next });
      return next;
    });
  };

  const bodyTextClass =
    textSize === 'xlarge'
      ? 'text-lg sm:text-xl'
      : textSize === 'large'
        ? 'text-base sm:text-lg'
        : 'text-sm sm:text-base';

  const handleCopyTakeaway = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedTakeaway(true);
      setTimeout(() => setCopiedTakeaway(false), 2200);
    } catch {
      // Fallback
    }
  };

  // Droplet burn simulation trigger
  const handleTriggerBurn = (durationSec: number) => {
    if (isBurningDroplet) return;
    setIsBurningDroplet(true);
    let start: number | null = null;
    const anim = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      const progress = Math.min(1.0, elapsed / Math.max(1.0, durationSec));
      onUpdateStageInputs?.({ burn_progress: progress });
      if (progress < 1.0) {
        requestAnimationFrame(anim);
      } else {
        setIsBurningDroplet(false);
      }
    };
    requestAnimationFrame(anim);
  };

  const flightRuns = useMemo<FlightScatterRun[]>(() => {
    if (!chapter1DropletData || !Array.isArray(chapter1DropletData.runs)) return [];
    return (chapter1DropletData.runs as any[])
      .slice(0, 55)
      .map((r) => ({
        runId: r.run_id,
        testNumber: r.test_number,
        fuel: r.fuel,
        initialDiameterMm: r.initial_diameter_mm,
        durationSec: r.burn_time_s,
        csvRow: r.csv_row,
      }));
  }, []);

  const bassRuns = useMemo<BassRun[]>(() => {
    if (!chapter2AtmosphereData || !Array.isArray(chapter2AtmosphereData.runs)) return [];
    return (chapter2AtmosphereData.runs as any[])
      .slice(0, 60)
      .map((r) => ({
        run_uid: r.run_uid,
        source_row: r.source_row,
        oxygen_pct: r.oxygen_pct,
        flow_cm_s: r.flow_cm_s,
        material: r.material,
        extinguished: Boolean(r.extinguished),
        co2_pct: r.co2_pct,
      }));
  }, []);

  const smokeRuns = useMemo<SmokeFlightRun[]>(() => {
    if (!chapter3SmokeData || !Array.isArray(chapter3SmokeData.runs)) return [];
    return (chapter3SmokeData.runs as any[])
      .filter((r) => typeof r.sensor_ratio_rt_r0 === 'number')
      .slice(0, 40)
      .map((r) => ({
        test_id: r.test_id,
        sample_material: r.sample_material,
        sensor_ratio_rt_r0: r.sensor_ratio_rt_r0,
        net_aging_time_sec: r.net_aging_time_sec ?? null,
        inlet_velocity_cm_s: r.inlet_velocity_cm_s ?? 0.0,
        csv_row: r.csv_row,
      }));
  }, []);

  const gapsEntries = useMemo<EnvelopeEntry[]>(() => {
    if (chapter4GapsData && Array.isArray((chapter4GapsData as any).destination_gaps)) {
      return [
        { mission: 'BASS-II Min Tested', oxygen_pct: 13.6, pressure_kpa: 101.3, status: 'Tested' },
        { mission: 'ISS Standard Air', oxygen_pct: 21.0, pressure_kpa: 101.3, status: 'Tested' },
        { mission: 'BASS-II Max Tested', oxygen_pct: 22.2, pressure_kpa: 101.3, status: 'Tested' },
        { mission: 'Mars Transit Habitat', oxygen_pct: 28.0, pressure_kpa: 70.3, status: 'Untested Gap' },
        { mission: 'Artemis Gateway', oxygen_pct: 34.0, pressure_kpa: 56.0, status: 'Untested Gap' },
      ];
    }
    return [
      { mission: 'BASS-II Min Tested', oxygen_pct: 13.6, pressure_kpa: 101.3, status: 'Tested' },
      { mission: 'ISS Standard Air', oxygen_pct: 21.0, pressure_kpa: 101.3, status: 'Tested' },
      { mission: 'BASS-II Max Tested', oxygen_pct: 22.2, pressure_kpa: 101.3, status: 'Tested' },
      { mission: 'Mars Transit Habitat', oxygen_pct: 28.0, pressure_kpa: 70.3, status: 'Untested Gap' },
      { mission: 'Artemis Gateway', oxygen_pct: 34.0, pressure_kpa: 56.0, status: 'Untested Gap' },
    ];
  }, []);

  const currentGravity = typeof stageInputs.gravity_g === 'number' ? stageInputs.gravity_g : 0.0;
  const currentBurnProgress = typeof stageInputs.burn_progress === 'number' ? stageInputs.burn_progress : 0.0;
  const currentAirflow = typeof stageInputs.airflow_cm_s === 'number' ? stageInputs.airflow_cm_s : 5.0;
  const currentOxygen = typeof stageInputs.oxygen_pct === 'number' ? stageInputs.oxygen_pct : 21.0;

  const renderEvidenceBadge = (ref: EvidenceRef, idx: number) => {
    if (ref.type === 'measured') {
      return (
        <div
          key={idx}
          className="flex flex-col gap-1 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-[10px] uppercase tracking-wider font-mono">
              <CheckCircle2 className="w-3 h-3" />
              NASA Flight Telemetry
            </span>
            {ref.provenanceLevel && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px]">
                Tier Level {ref.provenanceLevel}
              </span>
            )}
          </div>

          {ref.citationLabel && (
            <div className="font-medium text-white text-xs mt-1">
              {ref.citationLabel}
            </div>
          )}

          {ref.telemetryNote && (
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {ref.telemetryNote}
            </p>
          )}

          {ref.experimentId && (
            <Link
              to={`/experiment/${ref.experimentId}`}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 mt-1 self-start font-mono"
            >
              <span>View in Flight Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      );
    }

    if (ref.type === 'illustrative') {
      return (
        <div
          key={idx}
          className="flex flex-col gap-1 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-[10px] uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" />
              Illustrative Reference
            </span>
          </div>
          {ref.citationLabel && (
            <div className="font-medium text-white text-xs mt-1">
              {ref.citationLabel}
            </div>
          )}
          {ref.telemetryNote && (
            <p className="text-purple-100/90 text-[11px] leading-relaxed mt-1">
              {ref.telemetryNote}
            </p>
          )}
          {ref.simplificationNote && (
            <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5 italic">
              {ref.simplificationNote}
            </p>
          )}
        </div>
      );
    }

    return (
      <div
        key={idx}
        className="flex flex-col gap-1 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] uppercase tracking-wider font-mono">
            <Sparkles className="w-3 h-3" />
            Educational Analogy
          </span>
        </div>
        {ref.simplificationNote && (
          <p className="text-amber-100/90 text-[11px] leading-relaxed mt-1">
            {ref.simplificationNote}
          </p>
        )}
      </div>
    );
  };

  // Caption tailored by audience level
  const activeLevelLeadText = beat.levelText ? beat.levelText[currentLevel] : beat.layer1.headline;

  return (
    <motion.article
      id={`beat-${beat.id}`}
      initial={isTheatreMode ? false : shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={isTheatreMode ? undefined : shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={isTheatreMode ? undefined : { once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={
        isTheatreMode
          ? 'w-full flex flex-col justify-start space-y-4 pb-4'
          : `min-h-[500px] pt-4 pb-20 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col justify-start border-b border-white/5 last:border-b-0 ${
              shouldReduceMotion ? '' : 'snap-start'
            }`
      }
      aria-label={`Beat ${beatIndex + 1}: ${beat.title}`}
    >
      {/* Beat Header Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
        <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-wider text-cyan-400 font-bold">
          Beat {beatIndex + 1} of {totalBeats} • {beat.act ? beat.act.toUpperCase() : beat.type.toUpperCase()}
        </span>
        <div className="flex items-center gap-3">
          {(beat.provenance || (beat.layer2 && beat.layer2.evidenceRefs && beat.layer2.evidenceRefs.length > 0)) && (
            <button
              type="button"
              onClick={() => setSourceDrawerOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer transition-colors"
              aria-label="Open NASA source provenance"
              aria-expanded={sourceDrawerOpen}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenGlossary()}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer transition-colors"
            aria-label="Open science glossary"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Glossary</span>
          </button>
        </div>
      </div>

      {/* Beat Provenance Drawer (NASA Primary Source) */}
      {sourceDrawerOpen && (
        <div className="mb-6 p-4 rounded-xl bg-[#071329] border border-cyan-500/40 text-xs text-slate-200 animate-fade-in space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              NASA Flight Provenance
            </span>
            <button
              type="button"
              onClick={() => setSourceDrawerOpen(false)}
              className="text-slate-400 hover:text-white font-mono text-[11px] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          {beat.provenance ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <strong className="text-cyan-400">Dataset / Campaign: </strong>
                {beat.provenance.datasetId}
              </div>
              <div>
                <strong className="text-cyan-400">Platform: </strong>
                {beat.provenance.platform}
              </div>
              {beat.provenance.doiOrNtrs && (
                <div>
                  <strong className="text-cyan-400">Publication / NTRS: </strong>
                  {beat.provenance.doiOrNtrs}
                </div>
              )}
              {beat.provenance.runId && (
                <div>
                  <strong className="text-cyan-400">Test Run ID: </strong>
                  {beat.provenance.runId}
                </div>
              )}
              <div className="sm:col-span-2 pt-2 border-t border-white/10 text-slate-200 font-sans text-xs leading-relaxed">
                <strong className="font-mono text-cyan-400">NASA Record / Quote: </strong>
                "{beat.provenance.quoteOrRow}"
              </div>
              {beat.provenance.caveat && (
                <div className="sm:col-span-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans text-[11px] leading-relaxed">
                  <strong>Epistemic Caveat: </strong>
                  {beat.provenance.caveat}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-300 text-xs">
              {beat.layer2?.evidenceRefs?.[0]?.telemetryNote || 'Grounded in NASA flight combustion records.'}
            </div>
          )}
        </div>
      )}

      {/* Main Beat Title & Subtitle */}
      <motion.div
        className="mb-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.08, ease: 'easeOut' }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-white tracking-tight leading-tight">
          {beat.title}
        </h2>
        {beat.subtitle && (
          <p className="text-sm sm:text-base text-slate-300 mt-1 font-['Hanken_Grotesk']">
            {beat.subtitle}
          </p>
        )}
      </motion.div>

      {/* In-flow Ember speech caption */}
      {showEmberCaptionsInFlow && beat.avatar.speech && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#071329]/90 border border-amber-500/30 flex items-start gap-3">
          <span className="text-amber-400 font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
            Ember:
          </span>
          <p className="text-slate-200 text-sm leading-relaxed italic font-sans">
            {beat.avatar.speech}
          </p>
        </div>
      )}

      {/* Audience Level Custom Narrative Card */}
      {currentLevel === 'little' ? (
        /* Little Explorer: Picture-first, max 6 words, friendly big buttons (min 56px touch target) */
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-950/20 border-2 border-amber-400/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Little Explorer</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAdultText((p) => !p)}
              className="text-xs font-mono text-slate-400 hover:text-amber-300 underline cursor-pointer"
            >
              {showAdultText ? 'Hide grown-up text' : 'For grown-ups'}
            </button>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            "{activeLevelLeadText}"
          </div>

          {showAdultText && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 animate-fade-in">
              <div className="font-bold text-cyan-300">Detailed Context:</div>
              <p>{beat.layer1.paragraphs[0]}</p>
            </div>
          )}

          {/* Large Friendly Tap Actions for Little Explorers (>= 56px touch target) */}
          <div className="pt-2">
            {/* Chapter 1: Why fire is round in space */}
            {chapterNumber === 1 && (
              <>
                {beat.id === 'beat-01-cold-open' && (
                  <button
                    type="button"
                    onClick={onNextBeat}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Look at the space flame! 🔥</span>
                  </button>
                )}

                {beat.id === 'beat-02-wonder' && (
                  <button
                    type="button"
                    onClick={() => onSelectCheckAnswer?.('buoyancy_cold_air')}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Heavy cold air pushes it up! 💨</span>
                  </button>
                )}

                {beat.id === 'beat-03-predict' && (
                  <button
                    type="button"
                    onClick={() => onSelectPrediction?.('sphere')}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>It becomes a round ball! ⚽</span>
                  </button>
                )}

                {beat.id === 'beat-04-do' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ gravity_g: 1.0 })}
                      className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-base sm:text-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${currentGravity > 0.5
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-300'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        }`}
                    >
                      <span>Earth Fire 🌍</span>
                      <span className="text-xs font-mono font-normal">Teardrop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ gravity_g: 0.0 })}
                      className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-base sm:text-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${currentGravity === 0.0
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg ring-2 ring-cyan-300'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        }`}
                    >
                      <span>Space Fire 🚀</span>
                      <span className="text-xs font-mono font-normal">Round Ball</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-05-reveal' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStageInputs?.({
                            initial_diameter_mm: 1.61,
                            burn_time_s: 3.2,
                            run_id: 'PSI-69-RUN-0003',
                            burn_progress: 0.0,
                          });
                          handleTriggerBurn(3.2);
                        }}
                        className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${stageInputs.initial_diameter_mm === 1.61
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg'
                            : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                          }`}
                      >
                        <span>Small Drop (1.6 mm)</span>
                        <span className="text-xs font-mono font-normal">Burns 3 seconds</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStageInputs?.({
                            initial_diameter_mm: 2.79,
                            burn_time_s: 12.5,
                            run_id: 'PSI-69-RUN-0226',
                            burn_progress: 0.0,
                          });
                          handleTriggerBurn(12.5);
                        }}
                        className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${stageInputs.initial_diameter_mm === 2.79
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg'
                            : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                          }`}
                      >
                        <span>Big Drop (2.8 mm)</span>
                        <span className="text-xs font-mono font-normal">Burns 12 seconds</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTriggerBurn(stageInputs.burn_time_s || 4.3)}
                      disabled={isBurningDroplet}
                      className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Flame className="w-5 h-5" />
                      <span>{isBurningDroplet ? 'Burning drop in space...' : 'Tap to Burn Droplet! 🔥'}</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-06-takeaway' && (
                  <div className="space-y-3">
                    <MissionPatch
                      chapterNumber={1}
                      chapterTitle="Why fire is round in space"
                      reduceMotion={Boolean(shouldReduceMotion)}
                    />
                    <button
                      type="button"
                      onClick={onNextBeat}
                      className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <span>You are a Space Scientist! 🌟</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Chapter 2: Same fire, different air */}
            {chapterNumber === 2 && (
              <>
                {beat.id === 'beat-01-hook' && (
                  <button
                    type="button"
                    onClick={onNextBeat}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Look at the still air! 💨</span>
                  </button>
                )}

                {beat.id === 'beat-02-predict' && (
                  <button
                    type="button"
                    onClick={() => onSelectPrediction?.('extinguish')}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Fire goes out with no air! 🛑</span>
                  </button>
                )}

                {beat.id === 'beat-03-reveal' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ airflow_cm_s: 0.0 })}
                      className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${currentAirflow === 0.0
                          ? 'bg-rose-500 text-white border-rose-300 shadow-lg ring-2 ring-rose-300'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        }`}
                    >
                      <span>Fans Off 🛑</span>
                      <span className="text-xs font-mono font-normal">Flame Quenches!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ airflow_cm_s: 5.0 })}
                      className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${currentAirflow > 2.0
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg ring-2 ring-cyan-300'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        }`}
                    >
                      <span>Fans On 💨</span>
                      <span className="text-xs font-mono font-normal">Flame Burns!</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-04-why' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ oxygen_pct: 13.6, airflow_cm_s: 5.0 })}
                      className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${currentOxygen < 18.0
                          ? 'bg-blue-500 text-white border-blue-300 shadow-lg ring-2 ring-blue-300'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        }`}
                    >
                      <span>Low O2 (14%) 🔵</span>
                      <span className="text-xs font-mono font-normal">Easier to starve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ oxygen_pct: 22.2, airflow_cm_s: 5.0 })}
                      className={`min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${currentOxygen >= 20.0
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-300'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        }`}
                    >
                      <span>High O2 (22%) 🟡</span>
                      <span className="text-xs font-mono font-normal">Burns bright!</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-05-takeaway' && (
                  <div className="space-y-3">
                    <MissionPatch
                      chapterNumber={2}
                      chapterTitle="Same fire, different air"
                      reduceMotion={Boolean(shouldReduceMotion)}
                    />
                    <button
                      type="button"
                      onClick={onNextBeat}
                      className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <span>Ventilation Master! 🌟</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Chapter 3: Smoke that does not rise */}
            {chapterNumber === 3 && (
              <>
                {beat.id === 'beat-01-hook' && (
                  <button
                    type="button"
                    onClick={onNextBeat}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Look, smoke floats! ☁️</span>
                  </button>
                )}

                {beat.id === 'beat-02-predict' && (
                  <button
                    type="button"
                    onClick={() => onSelectPrediction?.('ducts')}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Put sensors in air vents! 🚪</span>
                  </button>
                )}

                {beat.id === 'beat-03-reveal' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ sample_material: 'Kapton', sensor_ratio_rt_r0: 1.48 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Kapton Wire ⚡</span>
                      <span className="text-xs font-mono font-normal">Ultra-fine particles</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ sample_material: 'Silicone', sensor_ratio_rt_r0: 1.35 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Silicone Seal 🛡️</span>
                      <span className="text-xs font-mono font-normal">Coarse particles</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-04-why' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ test_id: 'SAME-R-101', sample_material: 'Kapton', sensor_ratio_rt_r0: 1.48 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Test #101 (Kapton)</span>
                      <span className="text-xs font-mono font-normal">Rt/R0 = 1.48</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ test_id: 'SAME-R-100', sample_material: 'Teflon', sensor_ratio_rt_r0: 1.45 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Test #100 (Teflon)</span>
                      <span className="text-xs font-mono font-normal">Rt/R0 = 1.45</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-05-takeaway' && (
                  <div className="space-y-3">
                    <MissionPatch
                      chapterNumber={3}
                      chapterTitle="Smoke that does not rise"
                      reduceMotion={Boolean(shouldReduceMotion)}
                    />
                    <button
                      type="button"
                      onClick={onNextBeat}
                      className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <span>Smoke Detective! 🌟</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Chapter 4: What NASA has not tested */}
            {chapterNumber === 4 && (
              <>
                {beat.id === 'beat-01-hook' && (
                  <button
                    type="button"
                    onClick={onNextBeat}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>We only tested near Earth! 🌍</span>
                  </button>
                )}

                {beat.id === 'beat-02-predict' && (
                  <button
                    type="button"
                    onClick={() => onSelectPrediction?.('zero')}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Zero tests on the Moon! 🌕</span>
                  </button>
                )}

                {beat.id === 'beat-03-reveal' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ oxygen_pct: 34.0, pressure_kpa: 56.0, gravity_g: 0.16 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Gateway Air (34% O2) 🚀</span>
                      <span className="text-xs font-mono font-normal">Lunar cabin target</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ oxygen_pct: 21.0, pressure_kpa: 101.3, gravity_g: 0.0 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>ISS Air (21% O2) 🛸</span>
                      <span className="text-xs font-mono font-normal">Tested standard</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-04-why' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ oxygen_pct: 21.0, pressure_kpa: 101.3 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Tested Regimes 🟢</span>
                      <span className="text-xs font-mono font-normal">ISS flight data</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStageInputs?.({ oxygen_pct: 34.0, pressure_kpa: 56.0 })}
                      className="min-h-[56px] px-4 py-3 rounded-2xl font-bold text-sm sm:text-base border-2 bg-white/10 text-white border-white/20 hover:bg-white/15 transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>Exploration Gap 🔴</span>
                      <span className="text-xs font-mono font-normal">Uncharted air</span>
                    </button>
                  </div>
                )}

                {beat.id === 'beat-05-takeaway' && (
                  <div className="space-y-3">
                    <MissionPatch
                      chapterNumber={4}
                      chapterTitle="What NASA has not tested"
                      reduceMotion={Boolean(shouldReduceMotion)}
                    />
                    <button
                      type="button"
                      onClick={onNextBeat}
                      className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-lg font-['Space_Grotesk'] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <span>Mission Pioneer! 🌟</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Explorer & Scientist: Plain words (<= 25 words) or detailed telemetry */
        <div className={`p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-4 ${bodyTextClass} text-slate-200 leading-relaxed font-['Hanken_Grotesk']`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-cyan-300">
              {beat.layer1.headline}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
              {currentLevel === 'scientist' ? 'Scientist Tier' : 'Explorer'}
            </span>
          </div>

          <p className="text-white font-medium text-base sm:text-lg">
            {activeLevelLeadText}
          </p>

          {currentLevel === 'scientist' && beat.layer1.paragraphs.map((p, idx) => (
            <p key={idx} className="text-slate-300 text-sm">{p}</p>
          ))}

          {beat.layer1.keyFact && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 text-sm">
              <Info className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <strong className="text-white">Physical Fact: </strong>
                {beat.layer1.keyFact}
              </div>
            </div>
          )}

          {/* 3Blue1Brown Buoyancy Vectors for Beat 2 */}
          {beat.id === 'beat-02-wonder' && (
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-cyan-500/20 flex flex-col items-center gap-3">
              <div className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                Natural Convection Airflow Vectors
              </div>
              <div className="flex items-center justify-around w-full max-w-sm py-2">
                <SelfDrawingArrow
                  direction="down"
                  color="#38bdf8"
                  label="Cool air sinks"
                  duration={0.5}
                  reduceMotion={Boolean(shouldReduceMotion)}
                />
                <div className="flex flex-col items-center gap-1">
                  <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-400">1g Updraft</span>
                </div>
                <SelfDrawingArrow
                  direction="up"
                  color="#f59e0b"
                  label="Warm air floats"
                  duration={0.3}
                  delay={0.2}
                  reduceMotion={Boolean(shouldReduceMotion)}
                />
              </div>
            </div>
          )}

          {/* Chapter 2 Ventilation Airflow Vectors for Beat 3 */}
          {beat.id === 'beat-03-reveal' && (
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-cyan-500/20 flex flex-col items-center gap-3">
              <div className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                Microgravity Forced Airflow Dynamics
              </div>
              <div className="flex items-center justify-around w-full max-w-md py-2">
                <SelfDrawingArrow
                  direction="right"
                  color="#38bdf8"
                  label="Forced breeze (1 to 5 cm/s)"
                  duration={0.4}
                  reduceMotion={Boolean(shouldReduceMotion)}
                />
                <div className="flex flex-col items-center gap-1">
                  <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-400">Solid Fuel Strip</span>
                </div>
                <SelfDrawingArrow
                  direction="right"
                  color="#0284c7"
                  label="Sweeps CO2 away"
                  duration={0.4}
                  delay={0.2}
                  reduceMotion={Boolean(shouldReduceMotion)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Section for Predict Beat */}
      {beat.type === 'predict' && beat.predictInteraction && currentLevel !== 'little' && (
        <div className="my-6 p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Prediction</span>
          </div>
          <h4 className="text-xl font-bold font-['Space_Grotesk'] text-white">
            {beat.predictInteraction.question}
          </h4>

          <PredictCards
            choices={beat.predictInteraction.choices}
            selectedId={predictedChoiceId || null}
            onSelect={(choice) => onSelectPrediction && onSelectPrediction(choice.id)}
            reduceMotion={Boolean(shouldReduceMotion)}
          />

          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => onSelectPrediction && onSelectPrediction('unsure')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-mono flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Not sure? Reveal hypothesis directly"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Not sure, show me</span>
            </button>
          </div>

          {predictedChoiceId && (
            <div className="p-4 rounded-xl bg-black/40 border border-cyan-400/30 animate-fade-in space-y-2">
              {predictedChoiceId === 'unsure' ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                    <span>Exploring the Unknown</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Science begins with open curiosity! NASA researchers hypothesized that in microgravity, eliminating buoyant upward draft would allow oxygen and fuel diffusion to govern the reaction uniformly in all directions—yielding a symmetrical spherical flame.
                  </p>
                </>
              ) : (() => {
                const selected = beat.predictInteraction.choices.find(
                  (c) => c.id === predictedChoiceId
                );
                if (!selected) return null;
                return (
                  <>
                    <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                      <span>{selected.feedbackTitle}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selected.feedbackText}
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Interactive Section for Beat 4 (DO / Gravity Morph Controls) */}
      {beat.id === 'beat-04-do' && currentLevel !== 'little' && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>Interactive Gravity Control</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
              Illustration
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <label htmlFor="stage-gravity-slider" className="text-slate-200 font-semibold">
                Dial Gravity Field (1.0g → 0.0g):
              </label>
              <span className="text-cyan-300 font-bold">
                {currentGravity === 0.0
                  ? '0.00g (Orbital Freefall)'
                  : `${currentGravity.toFixed(2)}g`}
              </span>
            </div>

            <input
              id="stage-gravity-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentGravity}
              onChange={(e) => onUpdateStageInputs?.({ gravity_g: parseFloat(e.target.value) })}
              className="w-full h-3 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400 focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Gravity slider from 1g to 0g"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>0.0g (Orbit Sphere)</span>
              <span>0.16g (Moon)</span>
              <span>0.38g (Mars)</span>
              <span>1.0g (Earth Teardrop)</span>
            </div>
          </div>

          {/* Planetary Regime Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {REGIME_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = Math.abs(currentGravity - preset.g) < 0.05;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onUpdateStageInputs?.({ gravity_g: preset.g })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-['Space_Grotesk']">
                      {preset.label} <span className="text-[10px] text-cyan-400 font-mono">({preset.badge})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{preset.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Section for Beat 5 (REVEAL / NASA Flight Droplets) */}
      {beat.id === 'beat-05-reveal' && currentLevel !== 'little' && beat.dropletRuns && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>NASA Flight Tests (PSI-69 / ISS CIR)</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
              From NASA flight tests
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-300 font-semibold">
              Select an actual fuel droplet ignited on the Space Station:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {beat.dropletRuns.map((run) => {
                const isSelected = stageInputs.run_id === run.runId;
                return (
                  <button
                    key={run.runId}
                    type="button"
                    onClick={() => {
                      onUpdateStageInputs?.({
                        run_id: run.runId,
                        initial_diameter_mm: run.initialDiameterMm,
                        burn_time_s: run.durationSec,
                        test_number: run.testNumber,
                        csv_row: run.csvRow,
                        burn_progress: 0.0,
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${isSelected
                        ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-['Space_Grotesk'] text-white">
                        Test #{run.testNumber} • {run.fuel}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                        Initial: {run.initialDiameterMm} mm • Burn: {run.durationSec} s
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-1 rounded">
                      Row {run.csvRow}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Droplet Burn Scrubber & Player */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Evaporation Scrubber (D-squared law):
              </span>
              <span className="text-cyan-300 font-bold">
                Burn Progress: {(currentBurnProgress * 100).toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTriggerBurn(stageInputs.burn_time_s || 4.3)}
                disabled={isBurningDroplet}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isBurningDroplet ? 'Burning...' : 'Play Burn'}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateStageInputs?.({ burn_progress: 0.0 })}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                title="Reset droplet to initial size"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentBurnProgress}
                onChange={(e) => onUpdateStageInputs?.({ burn_progress: parseFloat(e.target.value) })}
                className="flex-1 h-2 rounded bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
                aria-label="Droplet burn progress scrubber"
              />
            </div>
          </div>

          {/* Flight Scatter Plot (NASA Flight Data) */}
          <FlightScatterChart
            runs={flightRuns}
            selectedRunId={stageInputs.run_id}
            onSelectRun={(run) => {
              onUpdateStageInputs?.({
                run_id: run.runId,
                initial_diameter_mm: run.initialDiameterMm,
                burn_time_s: run.durationSec,
                test_number: run.testNumber,
                csv_row: run.csvRow,
                burn_progress: 0.0,
              });
            }}
          />
        </div>
      )}

      {/* Interactive Section for Chapter 2 Beat 3 (REVEAL / Ventilation Airflow & Oxygen) */}
      {chapterNumber === 2 && beat.id === 'beat-03-reveal' && currentLevel !== 'little' && beat.revealInteraction && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>{beat.revealInteraction.title}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
              From NASA flight tests
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            {beat.revealInteraction.instruction}
          </p>

          {/* Forced Airflow Slider */}
          <div className="space-y-2.5 p-4 rounded-xl bg-black/40 border border-white/10">
            <div className="flex justify-between items-center text-xs font-mono">
              <label htmlFor="airflow-slider" className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Forced Airflow Speed (cm/s):</span>
              </label>
              <span className="text-cyan-300 font-bold">
                {currentAirflow === 0 ? '0.0 cm/s (Quiescent / Dead air)' : `${currentAirflow.toFixed(2)} cm/s`}
              </span>
            </div>

            <input
              id="airflow-slider"
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={currentAirflow}
              onChange={(e) => onUpdateStageInputs?.({ airflow_cm_s: parseFloat(e.target.value) })}
              className="w-full h-3 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400 focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Airflow speed slider from 0 to 15 cm per second"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>0 cm/s (Quench)</span>
              <span>2.0 cm/s (Critical)</span>
              <span>5.0 cm/s (Cabin Breeze)</span>
              <span>15 cm/s (Strong Fan)</span>
            </div>
          </div>

          {/* Preset Regimes */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-300 font-semibold">
              Select an ISS Ventilation Scenario:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {beat.revealInteraction.regimes.map((regime) => {
                const regimeFlow = regime.scenario.airflow_cm_s ?? 0;
                const isSelected = Math.abs(currentAirflow - regimeFlow) < 0.6;
                return (
                  <button
                    key={regime.label}
                    type="button"
                    onClick={() => {
                      onUpdateStageInputs?.({
                        airflow_cm_s: regimeFlow,
                        oxygen_pct: regime.scenario.oxygen_pct ?? 21.0,
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                        ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-['Space_Grotesk'] text-white">
                        {regime.label}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                        {regime.destinationName}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      {regime.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Flame Status Indicator */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${currentAirflow < 0.5
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : currentAirflow <= 2.2
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
            <span>
              <strong>Combustion State: </strong>
              {currentAirflow < 0.5
                ? 'Suffocating / Quenched (CO2 accumulates)'
                : currentAirflow <= 2.2
                  ? 'Low-speed quenching boundary (fragile blue edge)'
                  : 'Steady burning (ventilation provides oxygen)'}
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-bold uppercase">
              {currentAirflow < 0.5 ? 'Quenched' : currentAirflow <= 2.2 ? 'Critical' : 'Burning'}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Section for Chapter 2 Beat 4 (DATA / BASS-II Atmosphere Scatter Chart) */}
      {chapterNumber === 2 && beat.id === 'beat-04-why' && currentLevel !== 'little' && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>NASA BASS-II Flight Telemetry (PSI-25)</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
              From NASA flight tests
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-300 font-semibold">
              Explore 132 microgravity burns across oxygen and airflow:
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Tap any flight test dot to inspect the exact glovebox run. Airflow speed converted from fan settings via U = 1.0066 * AirDisplay.
            </p>
          </div>

          {/* Atmosphere Scatter Chart */}
          <AtmosphereScatterChart
            runs={bassRuns}
            selectedRunUid={stageInputs.run_uid || stageInputs.run_id}
            onSelectRun={(run) => {
              onUpdateStageInputs?.({
                run_uid: run.run_uid,
                run_id: run.run_uid,
                oxygen_pct: run.oxygen_pct,
                airflow_cm_s: run.flow_cm_s,
                material: run.material,
                extinguished: run.extinguished,
                csv_row: run.source_row,
              });
            }}
          />

          {/* Selected Run Inspection Card */}
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 font-bold">
                Selected Test: {stageInputs.run_uid || stageInputs.run_id || 'PSI-25-RUN-0001'}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${stageInputs.extinguished
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                {stageInputs.extinguished ? 'Quenched / Extinguished' : 'Sustained Burn'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div>
                <span className="text-slate-400">Oxygen: </span>
                <span className="text-white font-bold">{currentOxygen.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-400">Forced Flow: </span>
                <span className="text-white font-bold">{currentAirflow.toFixed(2)} cm/s</span>
              </div>
              <div>
                <span className="text-slate-400">Fuel: </span>
                <span className="text-white font-bold">{stageInputs.material || 'PMMA'}</span>
              </div>
              <div>
                <span className="text-slate-400">CSV Row: </span>
                <span className="text-white font-bold">{stageInputs.csv_row || 2}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10 font-sans">
              Flow calibrated via <span className="font-mono text-cyan-300">U = 1.0066 * AirDisplay</span>. Crews sometimes turned fans off, so flame cessation did not always occur on its own.
            </div>
          </div>
        </div>
      )}

      {/* Chapter 3 Beat 3 (REVEAL / Spacecraft Material Smoke Properties) */}
      {chapterNumber === 3 && beat.id === 'beat-03-reveal' && currentLevel !== 'little' && beat.revealInteraction && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{beat.revealInteraction.title}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
              From NASA flight tests
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            {beat.revealInteraction.instruction}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {beat.revealInteraction.regimes.map((regime) => {
              const isSelected = stageInputs.sample_material === regime.label;
              return (
                <button
                  key={regime.label}
                  type="button"
                  onClick={() => {
                    onUpdateStageInputs?.({
                      sample_material: regime.label,
                    });
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                >
                  <div>
                    <div className="text-xs font-bold font-['Space_Grotesk'] text-white">
                      {regime.label}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                      {regime.destinationName}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    {regime.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapter 3 Beat 4 (DATA / SAME-R Flight Smoke Telemetry Chart) */}
      {chapterNumber === 3 && beat.id === 'beat-04-why' && currentLevel !== 'little' && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>NASA SAME-R Flight Records (PSI-101 / ISS)</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
              From NASA flight tests
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-300 font-semibold">
              Explore 104 microgravity smoke detection tests:
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Tap any flight material bar to inspect sensor ratio Rt/R0. Higher ratios signify greater resistance change when smoke particles enter the detector.
            </p>
          </div>

          <SmokeMaterialChart
            runs={smokeRuns}
            selectedTestId={stageInputs.test_id}
            onSelectRun={(run) => {
              onUpdateStageInputs?.({
                test_id: run.test_id,
                sample_material: run.sample_material,
                sensor_ratio_rt_r0: run.sensor_ratio_rt_r0,
                csv_row: run.csv_row,
              });
            }}
          />

          {/* Selected Test Inspection Card */}
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 font-bold">
                Selected Test: {stageInputs.test_id || 'SAME-R-101'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ISS Microgravity Record
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div>
                <span className="text-slate-400">Material: </span>
                <span className="text-white font-bold">{stageInputs.sample_material || 'Kapton'}</span>
              </div>
              <div>
                <span className="text-slate-400">Sensor Ratio: </span>
                <span className="text-white font-bold">{typeof stageInputs.sensor_ratio_rt_r0 === 'number' ? stageInputs.sensor_ratio_rt_r0.toFixed(2) : '1.48'}</span>
              </div>
              <div>
                <span className="text-slate-400">Aging: </span>
                <span className="text-white font-bold">{stageInputs.net_aging_time_sec ?? 29} s</span>
              </div>
              <div>
                <span className="text-slate-400">CSV Row: </span>
                <span className="text-white font-bold">{stageInputs.csv_row || 24}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10 font-sans">
              Published SAME-R dataset contains 104 valid microgravity run records with complete sensor response data out of the 130 planned flight matrix conditions.
            </div>
          </div>
        </div>
      )}

      {/* Chapter 4 Beat 3 (REVEAL / Exploration Envelope Regimes) */}
      {chapterNumber === 4 && beat.id === 'beat-03-reveal' && currentLevel !== 'little' && beat.revealInteraction && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{beat.revealInteraction.title}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
              Illustration & Flight Bounds
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            {beat.revealInteraction.instruction}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {beat.revealInteraction.regimes.map((regime) => {
              const isSelected = Math.abs(currentOxygen - (regime.scenario.oxygen_pct ?? 21.0)) < 2.0;
              return (
                <button
                  key={regime.label}
                  type="button"
                  onClick={() => {
                    onUpdateStageInputs?.({
                      oxygen_pct: regime.scenario.oxygen_pct,
                      pressure_kpa: regime.scenario.pressure_kpa,
                      gravity_g: regime.scenario.gravity_g,
                    });
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                >
                  <div>
                    <div className="text-xs font-bold font-['Space_Grotesk'] text-white">
                      {regime.label}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                      {regime.destinationName}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    {regime.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapter 4 Beat 4 (DATA / Exploration Frontiers & Research Gaps) */}
      {chapterNumber === 4 && beat.id === 'beat-04-why' && currentLevel !== 'little' && (
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Tested Flight Bounds vs Exploration Gaps (NTRS-20240002981)</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase">
              From NASA Flight Archives
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-300 font-semibold">
              Compare tested flight boundaries against planned exploration missions:
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Blue bars indicate oxygen percentage (%); amber bars indicate cabin pressure (kPa). Notice how Artemis Gateway and Mars Transit push past tested limits.
            </p>
          </div>

          <ExplorationEnvelopeChart
            entries={gapsEntries}
            selectedMission={stageInputs.selected_mission}
            onSelectEntry={(entry) => {
              onUpdateStageInputs?.({
                selected_mission: entry.mission,
                oxygen_pct: entry.oxygen_pct,
                pressure_kpa: entry.pressure_kpa,
              });
            }}
          />

          {/* Research Gap Honest Banner */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase">
              <span>Scientific Honesty Rule:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              Because deep space exploration atmospheres (34% O2, Moon 0.16g, Mars 0.38g) have never been tested in orbit, IGNIS strictly bounds its matcher to verified NASA flight records and flags untested regimes as research gaps.
            </p>
            <div className="pt-2 flex justify-start">
              <Link
                to="/simulator"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Space_Grotesk'] text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Run Fire Response in Simulator</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Section for Check Beat */}
      {beat.type === 'check' && beat.checkInteraction && currentLevel !== 'little' && (
        <div className="my-6 p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Concept Quick Check</span>
          </div>
          <h4 className="text-xl font-bold font-['Space_Grotesk'] text-white">
            {beat.checkInteraction.question}
          </h4>

          <div className="space-y-3">
            {beat.checkInteraction.choices.map((choice) => {
              const isSelected = checkAnswerId === choice.id;
              return (
                <div key={choice.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onSelectCheckAnswer && onSelectCheckAnswer(choice.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${isSelected
                        ? choice.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-amber-950/40 border-amber-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                      }`}
                    aria-pressed={isSelected}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        choice.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-amber-400" />
                        )
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-500" />
                      )}
                    </div>
                    <div className="text-sm sm:text-base font-medium">
                      {choice.label}
                    </div>
                  </button>

                  {isSelected && (
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <strong className={choice.isCorrect ? 'text-emerald-400' : 'text-amber-400'}>
                        {choice.isCorrect ? 'Spot on! ' : 'Great hypothesis! Let’s explore why: '}
                      </strong>
                      {choice.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => {
                const correctChoice = beat.checkInteraction?.choices.find((c) => c.isCorrect);
                if (correctChoice && onSelectCheckAnswer) {
                  onSelectCheckAnswer(correctChoice.id);
                }
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-mono flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Not sure? Show explanation directly"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Not sure, show me</span>
            </button>
          </div>

          {checkAnswerId && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
              <span className="font-semibold text-white">Deeper Physics Insight: </span>
              {beat.checkInteraction.deeperContext}
            </div>
          )}
        </div>
      )}

      {/* Interactive Section for Takeaway Beat */}
      {beat.type === 'takeaway' && currentLevel !== 'little' && (
        <div className="my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#09152a] to-cyan-500/10 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider">
              Shareable Takeaway
            </span>
            <button
              type="button"
              onClick={() => handleCopyTakeaway(beat.layer1.headline)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
              aria-label="Copy takeaway quote"
            >
              {copiedTakeaway ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Quote</span>
                </>
              )}
            </button>
          </div>

          <blockquote className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white leading-snug">
            "{beat.layer1.headline}"
          </blockquote>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {beat.layer1.paragraphs[0]}
          </p>

          {/* Chapter Mission Patch with 8 degree settling stamp */}
          <MissionPatch
            chapterNumber={chapterNumber}
            chapterTitle={
              chapterNumber === 1
                ? 'Why fire is round in space'
                : chapterNumber === 2
                  ? 'Same fire, different air'
                  : chapterNumber === 3
                    ? 'Smoke that does not rise'
                    : 'What NASA has not tested'
            }
            reduceMotion={Boolean(shouldReduceMotion)}
          />
        </div>
      )}

      {/* Layer 2: Go Deeper (Expandable Physics & Evidence) */}
      {beat.layer2 && currentLevel !== 'little' && (
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-slate-900/60 overflow-hidden w-full max-w-full">
          <button
            type="button"
            onClick={handleToggleLayer2}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold font-['Space_Grotesk'] text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
            aria-expanded={layer2Open}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Layer 2: Go Deeper into the Physics</span>
            </div>
            {layer2Open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {layer2Open && (
            <div className="p-5 border-t border-white/10 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fade-in">
              <h4 className="font-bold text-base text-white">
                {beat.layer2.headline}
              </h4>
              {beat.layer2.physicsExplanation.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              {beat.layer2.scientificPrinciples && (
                <div className="space-y-1.5 pt-2">
                  <div className="font-semibold text-cyan-400 text-xs font-mono uppercase">
                    Governing Physical Principles:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {beat.layer2.scientificPrinciples.map((principle, idx) => (
                      <li key={idx}>{principle}</li>
                    ))}
                  </ul>
                </div>
              )}

              {beat.layer2.evidenceRefs && beat.layer2.evidenceRefs.length > 0 && (
                <div className="pt-3 space-y-2">
                  <div className="font-semibold text-slate-400 text-xs font-mono uppercase">
                    NASA Evidence Grounding:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {beat.layer2.evidenceRefs.map(renderEvidenceBadge)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress navigation helper */}
      {onNextBeat && beatIndex < totalBeats - 1 && (
        <div className="mt-6 pt-4 flex justify-end">
          <button
            type="button"
            onClick={onNextBeat}
            className="px-5 py-2.5 text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <span>Next Beat</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.article>
  );
};
