import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit,
  Moon,
  Globe2,
  Check,
  Share2,
  GitCompare,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  X,
  FileDown,
  Settings,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { SyncedSliderInput } from '../components/common/SyncedSliderInput';
import { QualitySelector } from '../visuals/QualitySelector';
import { EvidenceGuidedVisualization } from '../components/evidence/EvidenceGuidedVisualization';
import { SimpleNasaResultPanel } from '../components/evidence/SimpleNasaResultPanel';
import { EvidenceBriefModal } from '../components/evidence/EvidenceBriefModal';
import { useAskIgnis, useSetAskContext } from '../hooks/useAskIgnis';

import {
  RealSolidMatcher,
  TESTED_O2_MIN,
  TESTED_O2_MAX,
  TESTED_FLOW_MIN,
  TESTED_FLOW_MAX,
} from '../lib/matcher/real_solid_matcher';
import type { SolidScenarioInput, RawEvidenceSolidRun, MaterialMap } from '../lib/matcher/types';
import solidRunsData from '../data/evidence_solid.json';
import materialMapData from '../data/material_map.json';

import type {
  HabitatPreset,
  ScenarioInput,
  MaterialFamily,
  ScientificObjective,
  GravityEnvironment,
} from '../types/api';

const DEFAULT_PRESETS: HabitatPreset[] = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    slug: 'orbital',
    display_name: 'Orbital Station — 0g',
    destination: 'orbital',
    gravity_class: 'microgravity',
    gravity_value_g: 0.0,
    external_environment_summary: 'Low Earth orbit vacuum, zero buoyancy, thermal extremes',
    default_oxygen_pct: 21.0,
    default_pressure_kpa: 101.3,
    default_airflow_cm_s: 5.0,
    default_material: 'pmma',
    disclaimer: 'Pure microgravity — zero buoyant convection. NASA flight datasets (Saffire, BASS-II) directly match.',
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    slug: 'moon',
    display_name: 'Lunar Habitat — 0.16g',
    destination: 'moon',
    gravity_class: 'partial_gravity_lunar',
    gravity_value_g: 0.16,
    external_environment_summary: 'Lunar vacuum, 1/6th gravity, abrasive regolith exterior',
    default_oxygen_pct: 34.0,
    default_pressure_kpa: 56.0,
    default_airflow_cm_s: 10.0,
    default_material: 'pmma',
    disclaimer: 'Exploration Atmosphere (34% O₂ at 56 kPa). GRAVITY TRANSFER WARNING: All NASA solid flight tests are 0g; partial gravity re-introduces buoyant convection.',
  },
  {
    id: '55555555-5555-5555-5555-555555555503',
    slug: 'mars',
    display_name: 'Mars Habitat — 0.38g',
    destination: 'mars',
    gravity_class: 'partial_gravity_mars',
    gravity_value_g: 0.38,
    external_environment_summary: 'Thin CO₂ exterior (0.6 kPa), 38% Earth gravity, dust storms',
    default_oxygen_pct: 28.0,
    default_pressure_kpa: 70.3,
    default_airflow_cm_s: 10.0,
    default_material: 'fabric_synthetic',
    disclaimer: 'Partial gravity habitat: 28% O₂ at 70.3 kPa. Partial buoyant convection re-emerges in 0.38g.',
  },
];

const MATERIAL_OPTIONS: Array<{ value: MaterialFamily; label: string }> = [
  { value: 'pmma', label: 'Acrylic plastic' },
  { value: 'fabric_cotton', label: 'Cotton fabric' },
  { value: 'fabric_synthetic', label: 'Nomex synthetic fabric' },
  { value: 'cellulose', label: 'Paper' },
  { value: 'polyethylene', label: 'Polyethylene plastic' },
  { value: 'thin_solid', label: 'Thin sheet' },
  { value: 'thick_solid', label: 'Thick plate' },
];

const OBJECTIVE_OPTIONS: Array<{ value: ScientificObjective; label: string }> = [
  { value: 'flame_spread', label: 'Flame spread rate' },
  { value: 'sustained_burning', label: 'Sustained burning' },
  { value: 'extinction', label: 'When does it go out?' },
  { value: 'ignition', label: 'How easily does it catch fire?' },
  { value: 'flammability_limits', label: 'Flammability limits' },
];

interface TourStep {
  title: string;
  description: string;
  targetId: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-step-destination',
    title: '1. Set up the cabin',
    description: 'Pick a location and set the oxygen, air pressure, and fan speed.',
  },
  {
    targetId: 'tour-step-canvas',
    title: '2. See the flame',
    description: 'Watch how gravity, oxygen, and airflow shape the flame in real time.',
  },
  {
    targetId: 'tour-step-evidence',
    title: '3. What NASA has tested',
    description: 'Compare your cabin conditions against 132 real spaceflight combustion tests.',
  },
];

const parseScenarioFromParams = (searchParams: URLSearchParams): { scenario: ScenarioInput; presetSlug: string } => {
  const dest = searchParams.get('destination')?.toLowerCase() || 'orbital';
  const matchedPreset = DEFAULT_PRESETS.find((p) => p.slug === dest) || DEFAULT_PRESETS[0];

  const rawO2 = searchParams.get('oxygen');
  const parsedO2 = rawO2 ? parseFloat(rawO2) : null;
  const oxygen_pct =
    parsedO2 !== null && !isNaN(parsedO2) && parsedO2 >= 15 && parsedO2 <= 40
      ? parsedO2
      : matchedPreset.default_oxygen_pct;

  const rawP = searchParams.get('pressure');
  const parsedP = rawP ? parseFloat(rawP) : null;
  const pressure_kpa =
    parsedP !== null && !isNaN(parsedP) && parsedP >= 30 && parsedP <= 120
      ? parsedP
      : matchedPreset.default_pressure_kpa;

  const rawFlow = searchParams.get('airflow');
  const parsedFlow = rawFlow ? parseFloat(rawFlow) : null;
  const airflow_cm_s =
    parsedFlow !== null && !isNaN(parsedFlow) && parsedFlow >= 0 && parsedFlow <= 30
      ? parsedFlow
      : matchedPreset.default_airflow_cm_s;

  const rawMaterial = searchParams.get('material') as MaterialFamily;
  const validMaterial = MATERIAL_OPTIONS.some((m) => m.value === rawMaterial)
    ? rawMaterial
    : (matchedPreset.default_material as MaterialFamily);

  const rawObjective = searchParams.get('objective') as ScientificObjective;
  const validObjective = OBJECTIVE_OPTIONS.some((o) => o.value === rawObjective)
    ? rawObjective
    : 'flame_spread';

  return {
    presetSlug: matchedPreset.slug,
    scenario: {
      material: validMaterial,
      objective: validObjective,
      gravity_environment: (matchedPreset.gravity_class as GravityEnvironment) || 'microgravity',
      oxygen_pct,
      pressure_kpa,
      airflow_cm_s,
    },
  };
};

export const SimulatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDrawer } = useAskIgnis();

  // Initialize matcher directly in client runtime (100% synchronous, instantaneous)
  const matcher = useMemo(() => {
    return new RealSolidMatcher(
      solidRunsData as unknown as RawEvidenceSolidRun[],
      materialMapData as unknown as MaterialMap
    );
  }, []);

  // Initialize scenario A from URL search params
  const initialData = useMemo(() => parseScenarioFromParams(searchParams), [searchParams]);
  const [selectedPresetSlug, setSelectedPresetSlug] = useState<string>(initialData.presetSlug);
  const [scenarioA, setScenarioA] = useState<ScenarioInput>(initialData.scenario);

  const activePresetA = useMemo(
    () => DEFAULT_PRESETS.find((p) => p.slug === selectedPresetSlug) || DEFAULT_PRESETS[0],
    [selectedPresetSlug]
  );

  // Set AskContext for contextual research assistant inquiries
  useSetAskContext(
    useMemo(
      () => ({
        type: 'simulator',
        title: `${selectedPresetSlug.toUpperCase()} (${scenarioA.gravity_environment})`,
        scenario: scenarioA,
        suggestedPrompts: [
          'Why does this flame look the way it does?',
          'What would change if oxygen were 30%?',
          'Which NASA run is closest to this and why?',
          'How does forced airflow prevent flame self-extinction in this habitat?',
        ],
      }),
      [selectedPresetSlug, scenarioA]
    )
  );

  // Compare mode state & Scenario B
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [scenarioB, setScenarioB] = useState<ScenarioInput>({
    material: 'pmma',
    objective: 'flame_spread',
    gravity_environment: 'partial_gravity_lunar',
    oxygen_pct: 34.0,
    pressure_kpa: 56.0,
    airflow_cm_s: 10.0,
  });
  const [selectedPresetSlugB, setSelectedPresetSlugB] = useState<string>('moon');
  const [showScenarioBDetails, setShowScenarioBDetails] = useState<boolean>(false);

  // Brief modal state
  const [isBriefOpen, setIsBriefOpen] = useState<boolean>(false);

  // Share link feedback
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Toolbar dropdown menus
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  useEffect(() => {
    if (!showSettingsMenu && !showShareMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#settings-menu-container') && !target.closest('#share-menu-container')) {
        setShowSettingsMenu(false);
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu, showShareMenu]);

  // Interactive Coachmark Tour State
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Progressive disclosure: hide complex fuel & scientific settings by default
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // First-run tour trigger
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('ignis_simulator_tour_dismissed');
      if (dismissed !== 'true') {
        const timer = setTimeout(() => {
          setTourStep(0);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleDismissTour = useCallback(() => {
    setTourStep(null);
    try {
      localStorage.setItem('ignis_simulator_tour_dismissed', 'true');
    } catch {
      // Ignore
    }
  }, []);

  const handleNextTourStep = useCallback(() => {
    if (tourStep === null) return;
    if (tourStep < TOUR_STEPS.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      setTimeout(() => {
        const el = document.getElementById(TOUR_STEPS[nextStep].targetId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } else {
      handleDismissTour();
    }
  }, [tourStep, handleDismissTour]);

  const handlePrevTourStep = useCallback(() => {
    if (tourStep === null || tourStep <= 0) return;
    const prevStep = tourStep - 1;
    setTourStep(prevStep);
    setTimeout(() => {
      const el = document.getElementById(TOUR_STEPS[prevStep].targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, [tourStep]);

  const handleReplayTour = useCallback(() => {
    setTourStep(0);
    setTimeout(() => {
      const el = document.getElementById(TOUR_STEPS[0].targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, []);

  useEffect(() => {
    if (tourStep === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismissTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tourStep, handleDismissTour]);

  // URL synchronization
  const urlTimerRef = useRef<number | null>(null);
  const updateUrlParams = useCallback(
    (scenario: ScenarioInput, destination: string, immediate = false) => {
      if (urlTimerRef.current) {
        clearTimeout(urlTimerRef.current);
        urlTimerRef.current = null;
      }

      const apply = () => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('destination', destination);
        nextParams.set('oxygen', String(scenario.oxygen_pct));
        nextParams.set('pressure', String(scenario.pressure_kpa));
        nextParams.set('airflow', String(scenario.airflow_cm_s));
        nextParams.set('material', scenario.material);
        nextParams.set('objective', scenario.objective || 'flame_spread');
        setSearchParams(nextParams, { replace: true });
      };

      if (immediate) {
        apply();
      } else {
        urlTimerRef.current = window.setTimeout(apply, 400);
      }
    },
    [searchParams, setSearchParams]
  );

  // Presets selector handler
  const handleSelectPresetA = (preset: HabitatPreset) => {
    setSelectedPresetSlug(preset.slug);
    const updated: ScenarioInput = {
      material: preset.default_material as MaterialFamily,
      objective: scenarioA.objective,
      gravity_environment: (preset.gravity_class as GravityEnvironment) || 'microgravity',
      oxygen_pct: preset.default_oxygen_pct,
      pressure_kpa: preset.default_pressure_kpa,
      airflow_cm_s: preset.default_airflow_cm_s,
    };
    setScenarioA(updated);
    updateUrlParams(updated, preset.slug, true);
  };

  const handleSelectPresetB = (presetSlug: string) => {
    setSelectedPresetSlugB(presetSlug);
    const p = DEFAULT_PRESETS.find((item) => item.slug === presetSlug) || DEFAULT_PRESETS[1];
    setScenarioB((prev) => ({
      ...prev,
      material: p.default_material as MaterialFamily,
      gravity_environment: (p.gravity_class as GravityEnvironment) || 'partial_gravity_lunar',
      oxygen_pct: p.default_oxygen_pct,
      pressure_kpa: p.default_pressure_kpa,
      airflow_cm_s: p.default_airflow_cm_s,
    }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Convert ScenarioInput to SolidScenarioInput for the RealSolidMatcher
  const solidScenarioA: SolidScenarioInput = useMemo(() => {
    return {
      material: scenarioA.material,
      oxygen_pct: scenarioA.oxygen_pct ?? 21.0,
      flow_cm_s: scenarioA.airflow_cm_s ?? 5.0,
      pressure_kpa: scenarioA.pressure_kpa ?? 101.3,
      gravity_g: activePresetA.gravity_value_g ?? 0.0,
      geometry: 'flat',
      thickness_mm: 0.4,
    };
  }, [scenarioA, activePresetA]);

  // Run client-side RealSolidMatcher (sync, instant, no mock backend)
  const matchResult = useMemo(() => {
    return matcher.match(solidScenarioA, null, 5);
  }, [matcher, solidScenarioA]);

  // Derived behavior difference summary for Compare Mode
  const behaviorDifferenceSummary = useMemo(() => {
    if (!isCompareMode) return '';
    const notes: string[] = [];
    if (scenarioA.gravity_environment !== scenarioB.gravity_environment) {
      if (scenarioB.gravity_environment === 'microgravity') {
        notes.push('Scenario B has 0g microgravity (pure spherical diffusion, no upward buoyancy draft).');
      } else if (scenarioB.gravity_environment === 'partial_gravity_lunar') {
        notes.push('Scenario B has 0.16g lunar gravity, introducing weak buoyant natural convection.');
      } else {
        notes.push('Scenario B has 0.38g Martian gravity, forming an elongated convective reaction plume.');
      }
    }

    const o2A = scenarioA.oxygen_pct ?? 21.0;
    const o2B = scenarioB.oxygen_pct ?? 21.0;
    const o2Diff = Number((o2B - o2A).toFixed(1));
    if (Math.abs(o2Diff) >= 0.5) {
      if (o2Diff > 0) {
        notes.push(`Scenario B provides +${o2Diff}% higher O₂, enhancing flame temperatures and propagation speed.`);
      } else {
        notes.push(`Scenario B has ${o2Diff}% lower O₂, increasing radiative extinction and flame quenching vulnerability.`);
      }
    }

    const flowA = scenarioA.airflow_cm_s ?? 5.0;
    const flowB = scenarioB.airflow_cm_s ?? 5.0;
    const flowDiff = Number((flowB - flowA).toFixed(1));
    if (Math.abs(flowDiff) >= 0.5) {
      if (flowDiff > 0) {
        notes.push(`Scenario B delivers +${flowDiff} cm/s higher forced ventilation, tilting the flame downwind.`);
      } else {
        notes.push(`Scenario B approaches stagnant flow (${flowB} cm/s), trapping CO₂ exhaust.`);
      }
    }

    if (notes.length === 0) {
      return 'Scenarios A and B have matching parameters.';
    }
    return notes.join(' ');
  }, [isCompareMode, scenarioA, scenarioB]);

  // Dynamic one-sentence physical summary of what the flame shows (max 20 words, built from templates)
  const plainFlameSummary = useMemo(() => {
    const o2 = scenarioA.oxygen_pct ?? 21.0;
    const flow = scenarioA.airflow_cm_s ?? 5.0;
    const grav = activePresetA.gravity_value_g ?? 0.0;

    let clause1 = 'No gravity: the flame is a round ball.';
    if (selectedPresetSlug === 'moon' || (grav > 0 && grav <= 0.2)) {
      clause1 = 'Moon gravity: the flame starts to stretch upward.';
    } else if (selectedPresetSlug === 'mars' || grav > 0.2) {
      clause1 = 'Mars gravity: the flame stretches upward.';
    }

    let clause2 = '';
    if (o2 > TESTED_O2_MAX) {
      clause2 = 'More oxygen: it burns hotter and faster.';
    } else if (o2 < 19) {
      clause2 = 'Less oxygen: it burns weaker.';
    } else if (flow >= 15) {
      clause2 = 'A strong fan makes it lean sideways.';
    }

    return clause2 ? `${clause1} ${clause2}` : clause1;
  }, [scenarioA, activePresetA, selectedPresetSlug]);

  const o2A = scenarioA.oxygen_pct ?? 21.0;
  const flowA = scenarioA.airflow_cm_s ?? 5.0;
  const isO2OutsideA = o2A < TESTED_O2_MIN || o2A > TESTED_O2_MAX;
  const isFlowOutsideA = flowA < TESTED_FLOW_MIN || flowA > TESTED_FLOW_MAX;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-sans">
            How does fire behave in space?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 font-sans">
            Pick a place, set the air, see the flame, then see what NASA has tested.
          </p>
        </div>

        {/* Quiet Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* 1. Tour */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReplayTour}
            icon={<HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
            title="Replay walkthrough"
          >
            Tour
          </Button>

          {/* 2. Compare */}
          <Button
            variant={isCompareMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsCompareMode(!isCompareMode)}
            icon={<GitCompare className="w-3.5 h-3.5 text-slate-400" />}
          >
            Compare
          </Button>

          {/* 3. Share / Export */}
          <div id="share-menu-container" className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowShareMenu((prev) => !prev);
                setShowSettingsMenu(false);
              }}
              icon={<Share2 className="w-3.5 h-3.5 text-slate-400" />}
              title="Share and export options"
            >
              <span>Share / Export</span>
              <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
            </Button>
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-30 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl min-w-[160px] space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    handleCopyLink();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedLink ? 'Link copied!' : 'Copy link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBriefOpen(true);
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export brief</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Display Quality Popover */}
          <div id="settings-menu-container" className="relative">
            <button
              type="button"
              aria-label="Display quality"
              onClick={() => {
                setShowSettingsMenu((prev) => !prev);
                setShowShareMenu(false);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Display quality"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-30 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl min-w-[200px] space-y-2">
                <div className="text-[11px] font-sans font-medium text-slate-400 pb-1 border-b border-slate-800">
                  Display quality
                </div>
                <QualitySelector compact />
              </div>
            )}
          </div>

          {/* 5. Calm plain text transition link */}
          <Link
            to="/response"
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-sans shrink-0 ml-1 py-1 px-1.5"
            title="Launch Fire Response Console"
          >
            <span>Run Fire Response →</span>
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* =================================================================== */}
        {/* SECTION 1: Set up the cabin (Left col on Desktop)                    */}
        {/* =================================================================== */}
        <div id="stage-1" className="lg:col-span-5 space-y-5">
          <h2 className="text-xl font-semibold text-white font-sans">
            1. Set up the cabin
          </h2>

          {/* Place picker: 3 cards */}
          <section id="tour-step-destination" className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_PRESETS.map((preset) => {
                const isSelected = selectedPresetSlug === preset.slug;
                const icon =
                  preset.slug === 'orbital' ? (
                    <Orbit className="w-4 h-4" />
                  ) : preset.slug === 'moon' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Globe2 className="w-4 h-4" />
                  );

                const placeLabel =
                  preset.slug === 'orbital'
                    ? 'Space station'
                    : preset.slug === 'moon'
                    ? 'Moon base'
                    : 'Mars base';

                const gravSub =
                  preset.slug === 'orbital'
                    ? 'No gravity'
                    : preset.slug === 'moon'
                    ? '1/6 gravity'
                    : '1/3 gravity';

                return (
                  <button
                    key={preset.slug}
                    type="button"
                    onClick={() => handleSelectPresetA(preset)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-orange-500/80 shadow-md shadow-orange-500/10 ring-1 ring-orange-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`mb-1.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`}>
                      {icon}
                    </div>
                    <span className="text-xs font-semibold leading-snug text-white">
                      {placeLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {gravSub}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sliders */}
          <section id="tour-step-conditions" className="space-y-2.5">
            <SyncedSliderInput
              id="oxygen-slider-a"
              label={isCompareMode ? 'Oxygen (A)' : 'Oxygen'}
              unit="%"
              min={15.0}
              max={40.0}
              step={0.1}
              value={scenarioA.oxygen_pct ?? 21.0}
              hint="Oxygen must be 15–40%"
              statusText={
                isO2OutsideA
                  ? `Beyond NASA tests (tested ${TESTED_O2_MIN.toFixed(1)}–${TESTED_O2_MAX.toFixed(1)}%)`
                  : 'Within NASA tests'
              }
              statusType={isO2OutsideA ? 'amber' : 'cyan'}
              tooltip="Normal cabin: 21–34%"
              onChange={(val) => {
                const updated = { ...scenarioA, oxygen_pct: val };
                setScenarioA(updated);
                updateUrlParams(updated, selectedPresetSlug);
              }}
            />

            <SyncedSliderInput
              id="pressure-slider-a"
              label={isCompareMode ? 'Air pressure (A)' : 'Air pressure'}
              unit="kPa"
              min={30.0}
              max={120.0}
              step={0.5}
              value={scenarioA.pressure_kpa ?? 101.3}
              hint="Pressure must be 30–120 kPa"
              statusText="Only changes how the flame looks. NASA didn't record it."
              statusType="slate"
              tooltip="Normal cabin: 56–101.3 kPa"
              onChange={(val) => {
                const updated = { ...scenarioA, pressure_kpa: val };
                setScenarioA(updated);
                updateUrlParams(updated, selectedPresetSlug);
              }}
            />

            <SyncedSliderInput
              id="airflow-slider-a"
              label={isCompareMode ? 'Fan speed (A)' : 'Fan speed'}
              unit="cm/s"
              min={0.0}
              max={30.0}
              step={0.5}
              value={scenarioA.airflow_cm_s ?? 5.0}
              hint="Airflow must be 0–30 cm/s"
              statusText={
                isFlowOutsideA
                  ? `Beyond NASA tests (tested ${TESTED_FLOW_MIN.toFixed(1)}–${TESTED_FLOW_MAX.toFixed(1)} cm/s)`
                  : 'Within NASA tests'
              }
              statusType={isFlowOutsideA ? 'amber' : 'cyan'}
              tooltip="Normal cabin: 5–20 cm/s"
              onChange={(val) => {
                const updated = { ...scenarioA, airflow_cm_s: val };
                setScenarioA(updated);
                updateUrlParams(updated, selectedPresetSlug);
              }}
            />
          </section>

          {/* More options accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <span>More options</span>
              {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showAdvancedSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 pt-2 overflow-hidden"
                >
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                    <div className="space-y-1">
                      <label htmlFor="material-select" className="text-xs font-semibold text-white block">
                        Material
                      </label>
                      <select
                        id="material-select"
                        value={scenarioA.material}
                        onChange={(e) => {
                          const updated = { ...scenarioA, material: e.target.value as MaterialFamily };
                          setScenarioA(updated);
                          updateUrlParams(updated, selectedPresetSlug);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-400"
                      >
                        {MATERIAL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="objective-select" className="text-xs font-semibold text-white block">
                        Goal
                      </label>
                      <select
                        id="objective-select"
                        value={scenarioA.objective}
                        onChange={(e) => {
                          const updated = { ...scenarioA, objective: e.target.value as ScientificObjective };
                          setScenarioA(updated);
                          updateUrlParams(updated, selectedPresetSlug);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-400"
                      >
                        {OBJECTIVE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Setup B (when Compare Mode is active) */}
          <AnimatePresence>
            {isCompareMode && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300 font-sans">
                    Setup B
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowScenarioBDetails(!showScenarioBDetails)}
                    className="text-xs text-cyan-400 hover:text-white flex items-center gap-1 font-sans cursor-pointer"
                  >
                    <span>{showScenarioBDetails ? 'Hide sliders' : 'Show sliders'}</span>
                    {showScenarioBDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="destination-b-select" className="text-xs font-medium text-slate-300 block">
                    Setup B Location
                  </label>
                  <select
                    id="destination-b-select"
                    value={selectedPresetSlugB}
                    onChange={(e) => handleSelectPresetB(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    {DEFAULT_PRESETS.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                {showScenarioBDetails && (
                  <div className="space-y-2.5 pt-2 border-t border-cyan-900/50">
                    <SyncedSliderInput
                      id="oxygen-slider-b"
                      label="Oxygen (B)"
                      unit="%"
                      min={15.0}
                      max={40.0}
                      step={0.1}
                      value={scenarioB.oxygen_pct ?? 21.0}
                      hint="Oxygen must be 15–40%"
                      statusText={
                        (scenarioB.oxygen_pct ?? 21.0) < TESTED_O2_MIN || (scenarioB.oxygen_pct ?? 21.0) > TESTED_O2_MAX
                          ? `Beyond NASA tests (tested ${TESTED_O2_MIN.toFixed(1)}–${TESTED_O2_MAX.toFixed(1)}%)`
                          : 'Within NASA tests'
                      }
                      statusType={
                        (scenarioB.oxygen_pct ?? 21.0) < TESTED_O2_MIN || (scenarioB.oxygen_pct ?? 21.0) > TESTED_O2_MAX
                          ? 'amber'
                          : 'cyan'
                      }
                      tooltip="Normal cabin: 21–34%"
                      onChange={(val) => setScenarioB((prev) => ({ ...prev, oxygen_pct: val }))}
                    />
                    <SyncedSliderInput
                      id="pressure-slider-b"
                      label="Air pressure (B)"
                      unit="kPa"
                      min={30.0}
                      max={120.0}
                      step={0.5}
                      value={scenarioB.pressure_kpa ?? 101.3}
                      hint="Pressure must be 30–120 kPa"
                      statusText="Only changes how the flame looks. NASA didn't record it."
                      statusType="slate"
                      tooltip="Normal cabin: 56–101.3 kPa"
                      onChange={(val) => setScenarioB((prev) => ({ ...prev, pressure_kpa: val }))}
                    />
                    <SyncedSliderInput
                      id="airflow-slider-b"
                      label="Fan speed (B)"
                      unit="cm/s"
                      min={0.0}
                      max={30.0}
                      step={0.5}
                      value={scenarioB.airflow_cm_s ?? 5.0}
                      hint="Airflow must be 0–30 cm/s"
                      statusText={
                        (scenarioB.airflow_cm_s ?? 5.0) < TESTED_FLOW_MIN || (scenarioB.airflow_cm_s ?? 5.0) > TESTED_FLOW_MAX
                          ? `Beyond NASA tests (tested ${TESTED_FLOW_MIN.toFixed(1)}–${TESTED_FLOW_MAX.toFixed(1)} cm/s)`
                          : 'Within NASA tests'
                      }
                      statusType={
                        (scenarioB.airflow_cm_s ?? 5.0) < TESTED_FLOW_MIN || (scenarioB.airflow_cm_s ?? 5.0) > TESTED_FLOW_MAX
                          ? 'amber'
                          : 'cyan'
                      }
                      tooltip="Normal cabin: 5–20 cm/s"
                      onChange={(val) => setScenarioB((prev) => ({ ...prev, airflow_cm_s: val }))}
                    />
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Section 2 & Section 3 (7 cols on Desktop)             */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 2: See the flame */}
          <div id="stage-2" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-semibold text-white font-sans">
              2. See the flame
            </h2>

            <div id="tour-step-canvas" className="space-y-2">
              <div className="sticky top-[68px] lg:static z-20">
                <EvidenceGuidedVisualization
                  scenario={scenarioA}
                  label={isCompareMode ? 'Setup A vs Setup B' : undefined}
                  destination={selectedPresetSlug}
                  compareScenario={isCompareMode ? scenarioB : undefined}
                  compareDestination={isCompareMode ? selectedPresetSlugB : undefined}
                />
              </div>

              {/* Compare Mode Side-by-Side Summary */}
              {isCompareMode && (
                <Card variant="glass" padding="md" className="border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                      <GitCompare className="w-4 h-4 text-cyan-400" />
                      <span>Setup difference</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {behaviorDifferenceSummary}
                  </p>
                </Card>
              )}

              {/* Flame summary sentence (max 20 words) */}
              <p className="text-sm font-medium text-slate-200 font-sans leading-relaxed pt-1">
                {plainFlameSummary}
              </p>

              {/* Small caption below that */}
              <p className="text-xs text-slate-400 font-sans">
                Illustration, not a prediction.
              </p>
            </div>
          </div>

          {/* SECTION 3: What NASA has tested */}
          <div id="stage-3" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-semibold text-white font-sans">
              3. What NASA has tested
            </h2>

            <section id="tour-step-evidence">
              <SimpleNasaResultPanel
                matchResult={matchResult}
                scenario={solidScenarioA}
                activePresetSlug={selectedPresetSlug}
              />
            </section>

            {/* Plain links: Ask a question · Browse all NASA tests */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-sans">
              <button
                type="button"
                onClick={() => openDrawer()}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer font-medium"
              >
                Ask a question
              </button>
              <span>·</span>
              <Link
                to="/experiments"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
              >
                Browse all NASA tests
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive First-Run Coachmark Tour */}
      <AnimatePresence>
        {tourStep !== null && TOUR_STEPS[tourStep] && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl text-left"
            role="dialog"
            aria-labelledby="tour-step-title"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Step {tourStep + 1} of 3
              </span>
              <button
                type="button"
                onClick={handleDismissTour}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 mb-4">
              <h3 id="tour-step-title" className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                {TOUR_STEPS[tourStep].title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {TOUR_STEPS[tourStep].description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleDismissTour}
                className="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevTourStep}
                    className="text-xs py-1 px-2.5 h-auto"
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextTourStep}
                  className="text-xs py-1 px-3 h-auto"
                >
                  {tourStep === TOUR_STEPS.length - 1 ? 'Got it!' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable / Exportable Evidence Brief Modal */}
      <EvidenceBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        scenario={{
          material: scenarioA.material,
          scenarioFamily: (materialMapData as Record<string, any>)[scenarioA.material]?.family || scenarioA.material,
          oxygenPct: Number(scenarioA.oxygen_pct ?? 21.0),
          flowCmS: Number(scenarioA.airflow_cm_s ?? 5.0),
          pressureKpa: Number(scenarioA.pressure_kpa ?? 101.3),
          gravityG: activePresetA.gravity_value_g ?? 0.0,
          geometry: 'flat',
          thicknessMm: 0.4,
          presetName: activePresetA.display_name,
        }}
        envelope={matchResult.envelope}
        matches={matchResult.matches}
      />
    </div>
  );
};

export default SimulatorPage;
