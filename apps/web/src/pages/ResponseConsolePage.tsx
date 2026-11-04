import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  FuelType,
  HabitatGraph,
  LocalizationResult,
  SequenceStepId,
  SequencerMode,
  SimStepResult,
} from '../lib/fire/types.ts';
import { SIM_PARAMS } from '../lib/fire/sim_params.ts';
import { getHabitatById, getHabitatPresets } from '../lib/fire/habitat.ts';
import { FireSimulator } from '../lib/fire/sim.ts';
import {
  BaselineSmokeDetector,
  HeuristicFusionDetector,
  createTrainedDetector,
  attachDetectorOutputs,
} from '../lib/fire/detectors.ts';
import { ModelCardModal } from '../components/response/ModelCardModal.tsx';
import { localizeSmokeSource } from '../lib/fire/localizer.ts';
import { ResponseSequencer } from '../lib/fire/responseSequencer.ts';
import { bindActionEvidence } from '../lib/fire/evidenceBinder.ts';
import { HabitatSchematic } from '../components/response/HabitatSchematic.tsx';
import { SensorTimelineChart } from '../components/response/SensorTimelineChart.tsx';
import { ResponseSequencePanel } from '../components/response/ResponseSequencePanel.tsx';
import { EvidenceChipsDrawer } from '../components/response/EvidenceChipsDrawer.tsx';
import { MonteCarloValidationModal } from '../components/response/MonteCarloValidationModal.tsx';
import {
  AlertOctagon,
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sliders,
  Wind,
} from 'lucide-react';

export const ResponseConsolePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Presets & Selection
  const habitatPresets = useMemo(() => getHabitatPresets(), []);
  const initialHabitatId = searchParams.get('habitat') || 'iss_like_module';
  const initialFuel = (searchParams.get('fuel') as FuelType) || 'cellulose';

  const [habitatId, setHabitatId] = useState<string>(initialHabitatId);
  const [fuel, setFuel] = useState<FuelType>(initialFuel);
  const [hasNuisanceDust, setHasNuisanceDust] = useState<boolean>(false);
  const [detectorType, setDetectorType] = useState<'fusion' | 'baseline' | 'trained'>('fusion');
  const [mode, setMode] = useState<SequencerMode>('CREWED');
  const [isModelCardOpen, setIsModelCardOpen] = useState<boolean>(false);

  const currentHabitat = useMemo<HabitatGraph>(() => {
    return getHabitatById(habitatId) || habitatPresets[0];
  }, [habitatId, habitatPresets]);

  const [sourceZoneId, setSourceZoneId] = useState<string>(
    currentHabitat.zones[0]?.id || 'zone_1'
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string>(sourceZoneId);


  // Simulation execution state
  const [currentTime_s, setCurrentTime_s] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState<boolean>(false);
  const [showSimParams, setShowSimParams] = useState<boolean>(false);

  // Compute full simulation results timeline (100 seconds)
  const fullSimulationSteps = useMemo<SimStepResult[]>(() => {
    const sim = new FireSimulator(
      {
        id: `sim_${habitatId}_${fuel}`,
        habitatId,
        sourceZoneId,
        fuel,
        growthRate: 0.05,
        peakHRR_kW: 8.0,
        nuisanceType: hasNuisanceDust ? 'dust' : 'none',
        seed: 42,
      },
      currentHabitat
    );

    const steps = sim.run(100.0);
    const detector =
      detectorType === 'trained'
        ? createTrainedDetector()
        : detectorType === 'baseline'
        ? new BaselineSmokeDetector()
        : new HeuristicFusionDetector();
    attachDetectorOutputs(detector, steps, currentHabitat);
    return steps;
  }, [habitatId, fuel, sourceZoneId, hasNuisanceDust, detectorType, currentHabitat]);

  // Sliced steps up to currentTime_s for interactive timeline
  const activeSteps = useMemo<SimStepResult[]>(() => {
    return fullSimulationSteps.filter((s) => s.timestamp_s <= currentTime_s);
  }, [fullSimulationSteps, currentTime_s]);

  const currentStepData = useMemo<SimStepResult | undefined>(() => {
    if (activeSteps.length === 0) return fullSimulationSteps[0];
    return activeSteps[activeSteps.length - 1];
  }, [activeSteps, fullSimulationSteps]);

  // Smoke localization inference over current timeline
  const localizationResult = useMemo<LocalizationResult>(() => {
    return localizeSmokeSource(currentHabitat, activeSteps);
  }, [currentHabitat, activeSteps]);

  // Response Sequencer State
  const sequencerRef = useRef<ResponseSequencer | null>(null);
  const [sequencerState, setSequencerState] = useState<
    ReturnType<ResponseSequencer['getState']> | null
  >(null);

  // Re-initialize sequencer when habitat, mode, or simulation resets
  const initSequencer = useCallback(() => {
    const seq = new ResponseSequencer(currentHabitat, mode);
    sequencerRef.current = seq;
    setSequencerState(seq.getState());
  }, [currentHabitat, mode]);

  useEffect(() => {
    initSequencer();
  }, [initSequencer]);

  // Track sequencer progression as currentTime_s advances
  useEffect(() => {
    if (!sequencerRef.current) return;
    const seq = sequencerRef.current;

    // Check if any detector fired an alarm at or before current time
    let firstAlarm: { zoneId: string; time_s: number } | undefined;
    for (const step of activeSteps) {
      for (const [detId, out] of Object.entries(step.detectorOutputs)) {
        if (out.state === 'FIRE_ALARM') {
          const zone = currentHabitat.zones.find((z) => z.detectorIds.includes(detId));
          if (zone) {
            firstAlarm = { zoneId: zone.id, time_s: step.timestamp_s };
            break;
          }
        }
      }
      if (firstAlarm) break;
    }

    const state = seq.getState();
    if (firstAlarm && state.steps.ALARM.status === 'PENDING') {
      seq.triggerAlarm(firstAlarm.zoneId, firstAlarm.time_s);
    }

    // Update sequencer for uncrewed timeouts
    seq.update(currentTime_s);
    setSequencerState(seq.getState());
  }, [currentTime_s, activeSteps, currentHabitat]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime_s((prev) => {
        if (prev >= 99.5) {
          setIsPlaying(false);
          return 100.0;
        }
        return Math.round((prev + 0.5) * 10) / 10;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime_s(0);
    initSequencer();
  };

  const handleConfirmSuppression = () => {
    if (sequencerRef.current) {
      sequencerRef.current.confirmSuppression(currentTime_s, 'CREW');
      setSequencerState(sequencerRef.current.getState());
    }
  };

  const handleOverrideStep = (stepId: SequenceStepId, reason: string) => {
    if (sequencerRef.current) {
      sequencerRef.current.overrideStep(stepId, currentTime_s, reason, 'CREW');
      setSequencerState(sequencerRef.current.getState());
    }
  };

  // Active evidence chip for the current response step
  const activeStepId = sequencerState?.currentStep || 'ALARM';
  const evidenceChip = useMemo(() => {
    return bindActionEvidence(activeStepId, fuel, currentHabitat);
  }, [activeStepId, fuel, currentHabitat]);

  const allDetectorIds = useMemo(() => {
    const list: string[] = [];
    for (const z of currentHabitat.zones) {
      list.push(...z.detectorIds);
    }
    return list;
  }, [currentHabitat]);

  return (
    <div className="min-h-screen bg-[#04101f] text-slate-100 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Persistent Honesty Banner */}
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 shadow-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-300 font-semibold tracking-wide">
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Simulated sensor data. Not flight software.</span>
          </div>
          <div className="text-[11px] font-mono text-rose-200/80 hidden sm:block">
            Flame extinction outcomes derived from NASA flight experiments. The simulator does not model or forecast flame extinction.
          </div>
        </div>

        {/* Console Header & Scenario Controls */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <Shield className="h-6 w-6 text-cyan-400" />
                Fire Response Console
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Detect → Locate → Contain → Isolate → Suppress microgravity cabin fires
              </p>
            </div>

            {/* Simulation Playback Bar */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-lg font-semibold transition-all ${
                  isPlaying
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
                title={isPlaying ? 'Pause' : 'Play Simulation'}
                aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Reset simulation to t=0"
                aria-label="Reset simulation to t=0"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <div className="text-xs font-mono font-bold text-cyan-300 min-w-[70px]">
                t = {currentTime_s.toFixed(1)}s
              </div>

              {/* Scrubber Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={currentTime_s}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentTime_s(Number(e.target.value));
                }}
                className="w-32 md:w-48 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Scenario Configuration Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            {/* Habitat Selector */}
            <div>
              <label className="text-slate-400 block mb-1">Habitat Preset:</label>
              <select
                value={habitatId}
                onChange={(e) => {
                  const newHabId = e.target.value;
                  setHabitatId(newHabId);
                  const newHab = getHabitatById(newHabId);
                  if (newHab && newHab.zones.length > 0) {
                    setSourceZoneId(newHab.zones[0].id);
                    setSelectedZoneId(newHab.zones[0].id);
                  }
                  handleReset();
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                {habitatPresets.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Selector */}
            <div>
              <label className="text-slate-400 block mb-1">Fuel Material:</label>
              <select
                value={fuel}
                onChange={(e) => {
                  setFuel(e.target.value as FuelType);
                  handleReset();
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                <option value="cellulose">Cellulose (Cotton/SIBAL)</option>
                <option value="silicone">Silicone Rubber</option>
                <option value="kapton">Kapton (Polyimide)</option>
                <option value="teflon">Teflon (PTFE)</option>
              </select>
            </div>

            {/* Fire Origin Zone */}
            <div>
              <label className="text-slate-400 block mb-1">Fire Origin Zone:</label>
              <select
                value={sourceZoneId}
                onChange={(e) => {
                  setSourceZoneId(e.target.value);
                  setSelectedZoneId(e.target.value);
                  handleReset();
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                {currentHabitat.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name.split(' (')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Detector Engine */}
            <div>
              <label className="text-slate-400 block mb-1">Detector Engine:</label>
              <select
                value={detectorType}
                onChange={(e) => {
                  setDetectorType(e.target.value as 'fusion' | 'baseline' | 'trained');
                  handleReset();
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                <option value="fusion">Heuristic fusion</option>
                <option value="baseline">Baseline (photoelectric)</option>
                <option value="trained">Trained fusion (Earth-gravity data)</option>
              </select>
            </div>

            {/* Response Mode */}
            <div>
              <label className="text-slate-400 block mb-1">Operating Mode:</label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as SequencerMode);
                  handleReset();
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                <option value="CREWED">Crewed Module</option>
                <option value="UNCREWED">Uncrewed Autonomous</option>
              </select>
            </div>

            {/* Nuisance Dust Injection Toggle */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => {
                  setHasNuisanceDust(!hasNuisanceDust);
                  handleReset();
                }}
                className={`w-full py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                  hasNuisanceDust
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Dust Nuisance: {hasNuisanceDust ? 'INJECTED' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Trained Model Info Banner (Visible when Trained Fusion is active) */}
          {detectorType === 'trained' && (
            <div role="status"
              aria-live="polite"
              className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    Trained on Earth-gravity data. Not validated in microgravity.
                  </span>
                  <span className="font-mono text-[11px] text-cyan-300">
                    Model ID: <code className="text-white">m2-fusion-v1</code> | Tag: <code className="text-white">trained:m2-fusion-v1</code>
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Datasets: D1 EN54 Room (<a href="https://doi.org/10.17632/npk2zcm85h.2" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">DOI 10.17632/npk2zcm85h.2</a>) • D2 Industrial Hall (<a href="https://doi.org/10.17632/yghykzm4km.1" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">DOI 10.17632/yghykzm4km.1</a>)
                </div>
              </div>
              <button
                onClick={() => setIsModelCardOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors shadow-sm cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>View M2 Model Card</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Grid: Left = Schematic & Timeline; Right = Response Sequencer & Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Habitat Schematic, Localization Card, Sensor Timeline */}
          <div className="lg:col-span-7 space-y-5">
            <HabitatSchematic
              habitat={currentHabitat}
              currentStepData={currentStepData}
              localizationResult={localizationResult}
              selectedZoneId={selectedZoneId}
              onSelectZone={(zId) => setSelectedZoneId(zId)}
            />

            {/* Localization Result Card */}
            <div role="region"
              aria-live="polite"
              aria-label="Smoke source localization results"
              className="rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold tracking-wide text-slate-200">
                    SMOKE SOURCE LOCALIZATION
                  </h3>
                </div>

                {/* Categorical Status Badge (Honesty: No percentages) */}
                <span
                  className={`rounded px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${
                    localizationResult.status === 'CLEAR'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : localizationResult.status === 'CLOSE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : localizationResult.status === 'AMBIGUOUS'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Status: {localizationResult.status}
                </span>
              </div>

              {/* Disclaimer if single detector or partial g */}
              {localizationResult.disclaimer && (
                <div className="text-xs text-amber-300/90 font-mono mb-2">
                  ℹ {localizationResult.disclaimer}
                </div>
              )}

              {/* Ranked Zones List */}
              {localizationResult.rankedZones.length > 0 && (
                <div className="space-y-1.5 font-mono text-xs">
                  {localizationResult.rankedZones.map((rz, idx) => (
                    <div
                      key={rz.zoneId}
                      className="flex items-start justify-between rounded bg-slate-900/60 p-2 border border-slate-800"
                    >
                      <div>
                        <span className="font-bold text-cyan-300">#{idx + 1} {rz.zoneName}:</span>{' '}
                        <span className="text-slate-300">{rz.rationale}</span>
                      </div>
                      <span className="shrink-0 text-slate-400 ml-2">
                        +{rz.onsetDelay_s.toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sensor Timeline Chart */}
            <SensorTimelineChart
              steps={fullSimulationSteps}
              currentTime_s={currentTime_s}
              onTimeSeek={(t) => {
                setIsPlaying(false);
                setCurrentTime_s(t);
              }}
              availableDetectorIds={allDetectorIds}
            />
          </div>

          {/* Right Column (5 cols): Sequencer Panel & Evidence Chips Drawer */}
          <div className="lg:col-span-5 space-y-5">
            {sequencerState && (
              <ResponseSequencePanel
                sequencerState={sequencerState}
                onConfirmSuppression={handleConfirmSuppression}
                onOverrideStep={handleOverrideStep}
                onModeToggle={(newMode) => {
                  setMode(newMode);
                  handleReset();
                }}
              />
            )}

            <EvidenceChipsDrawer evidenceChip={evidenceChip} />
          </div>
        </div>

        {/* Footer Actions: Monte Carlo Validation & Simulation Parameters Inspector */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMonteCarloOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Open Monte Carlo Sweep (Design-Consistency Check)</span>
            </button>

            <button
              onClick={() => setShowSimParams(!showSimParams)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 text-xs font-mono transition-colors"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Sim Parameters Registry ({Object.keys(SIM_PARAMS).length})</span>
              {showSimParams ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            IGNIS Fire Response Module · NASA Space Apps Challenge
          </div>
        </div>

        {/* Expandable Parameters Table */}
        {showSimParams && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto shadow-2xl">
            <div className="text-xs font-bold text-slate-200 mb-2 font-mono flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Registered Simulation Parameters (sim_params.ts)</span>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Parameter Key</th>
                  <th className="py-2 px-3">Nominal Value</th>
                  <th className="py-2 px-3">Sweep Range [Min, Max]</th>
                  <th className="py-2 px-3">Provenance Tag</th>
                  <th className="py-2 px-3">Engineering Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {Object.entries(SIM_PARAMS).map(([key, p]) => (
                  <tr key={key}>
                    <td className="py-2 px-3 font-semibold text-cyan-300">{key}</td>
                    <td className="py-2 px-3">{p.value}</td>
                    <td className="py-2 px-3 text-slate-400">[{p.min}, {p.max}]</td>
                    <td className="py-2 px-3">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        p.tag.startsWith('literature:')
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.tag}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 max-w-xs">{p.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Monte Carlo Validation Modal */}
        <MonteCarloValidationModal
          isOpen={isMonteCarloOpen}
          onClose={() => setIsMonteCarloOpen(false)}
          habitatId={habitatId}
        />

        {/* M2 Model Card Modal */}
        <ModelCardModal
          isOpen={isModelCardOpen}
          onClose={() => setIsModelCardOpen(false)}
        />
      </div>
    </div>
  );
};

export default ResponseConsolePage;
