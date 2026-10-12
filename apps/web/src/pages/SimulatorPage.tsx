import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit,
  Moon,
  Globe2,
  Sliders,
  Wind,
  Gauge,
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  Share2,
  GitCompare,
  Layers,
  Filter,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  X,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { Term } from '../components/common/Term';
import { FireBehaviorProfileCard } from '../components/evidence/FireBehaviorProfileCard';
import { EvidenceMatchCard } from '../components/evidence/EvidenceMatchCard';
import { EvidenceGuidedVisualization } from '../components/evidence/EvidenceGuidedVisualization';
import { WhyPanel } from '../components/evidence/WhyPanel';
import { ParameterMap } from '../components/ParameterMap';
import { staggerIn } from '../visuals/anime';
import { useAskIgnis, useSetAskContext } from '../hooks/useAskIgnis';
import { api } from '../lib/api';
import type {
  HabitatPreset,
  ScenarioInput,
  MaterialFamily,
  ScientificObjective,
  GravityEnvironment,
  AnalysisResult,
} from '../types/api';

const DEFAULT_PRESETS: HabitatPreset[] = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    slug: 'orbital',
    display_name: 'Orbital Spacecraft (0g Microgravity)',
    destination: 'orbital',
    gravity_class: 'microgravity',
    gravity_value_g: 0.0,
    external_environment_summary: 'Low Earth orbit vacuum, zero buoyancy, thermal extremes',
    default_oxygen_pct: 21.0,
    default_pressure_kpa: 101.3,
    default_airflow_cm_s: 5.0,
    default_material: 'pmma',
    disclaimer: 'Reference scenario defaults based on ISS nominal atmosphere, not universal flight clearance values.',
    provenance: { standard: 'NASA-STD-3001 Volume 2' },
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    slug: 'moon',
    display_name: 'Lunar Base Surface Habitat (0.16g)',
    destination: 'moon',
    gravity_class: 'partial_gravity_lunar',
    gravity_value_g: 0.16,
    external_environment_summary: 'Lunar vacuum, 1/6th gravity, abrasive regolith exterior',
    default_oxygen_pct: 32.0,
    default_pressure_kpa: 56.0,
    default_airflow_cm_s: 8.0,
    default_material: 'fabric_cotton',
    disclaimer: 'Reference scenario defaults. GRAVITY TRANSFER WARNING: Microgravity flight data requires partial-g buoyancy corrections.',
    provenance: { standard: 'NASA Exploration Atmosphere Standards (SP-2013-4402)' },
  },
  {
    id: '55555555-5555-5555-5555-555555555503',
    slug: 'mars',
    display_name: 'Mars Base Surface Habitat (0.38g)',
    destination: 'mars',
    gravity_class: 'partial_gravity_mars',
    gravity_value_g: 0.38,
    external_environment_summary: 'Thin CO₂ atmosphere (~0.6 kPa), 0.38g gravity, dust storms',
    default_oxygen_pct: 28.0,
    default_pressure_kpa: 70.0,
    default_airflow_cm_s: 10.0,
    default_material: 'fabric_synthetic',
    disclaimer: 'Reference scenario defaults. GRAVITY TRANSFER WARNING: Partial buoyant convection re-emerges in 0.38g Martian gravity.',
    provenance: { standard: 'NASA Human Integration Design Handbook (HIDH)' },
  },
];

const MATERIAL_OPTIONS: Array<{ value: MaterialFamily; label: string; group: string; notes: string }> = [
  { value: 'pmma', label: 'PMMA (Acrylic / Plexiglas)', group: 'Rigid Polymers', notes: 'Benchmark NASA flight fuel used in BASS & Saffire' },
  { value: 'fabric_cotton', label: 'Cotton Fabric Blend (SFI)', group: 'Fabrics & Textiles', notes: 'NASA standard flammability sample fabric' },
  { value: 'fabric_synthetic', label: 'Synthetic Polymer Fabric', group: 'Fabrics & Textiles', notes: 'Nomex / Nylon blend spaceflight suit material' },
  { value: 'cellulose', label: 'Cellulose / Paper Sample', group: 'Natural Polymers', notes: 'Thin fuel sheet tested in microgravity drop towers' },
  { value: 'polyethylene', label: 'Polyethylene Polymer Sheet', group: 'Rigid Polymers', notes: 'Common insulation & packaging component' },
  { value: 'thin_solid', label: 'Thin Solid Sample (< 1mm)', group: 'General Solids', notes: 'Thermally thin regime combustion' },
  { value: 'thick_solid', label: 'Thick Solid Plate (> 5mm)', group: 'General Solids', notes: 'Thermally thick boundary layer burning' },
];

const OBJECTIVE_OPTIONS: Array<{ value: ScientificObjective; label: string; description: string }> = [
  { value: 'flame_spread', label: 'Flame Spread Rate & Propagation', description: 'Analyze flame velocity along fuel surface' },
  { value: 'sustained_burning', label: 'Sustained Burning & Soot Formation', description: 'Evaluate duration and self-sustaining combustion' },
  { value: 'extinction', label: 'Flame Extinction & Quenching Limits', description: 'Investigate low-oxygen and radiative extinction' },
  { value: 'ignition', label: 'Ignition Delay & Sensitivity', description: 'Analyze energy required for radiant ignition' },
  { value: 'flammability_limits', label: 'Flammability Boundary Limits', description: 'Map minimum oxygen index and pressure boundaries' },
];

const MATERIAL_JUSTIFICATIONS: Partial<Record<MaterialFamily, string>> = {
  pmma: 'Benchmark rigid acrylic fuel tested across NASA BASS & Saffire missions due to consistent, well-characterized chemical breakdown.',
  fabric_cotton: 'NASA standard flammability sample textile representing astronaut crew clothing and cotton-blend cabin surfaces.',
  fabric_synthetic: 'Flame-resistant polymer blend (Nomex / Nylon) evaluated for spaceflight suits and protective equipment liners.',
  cellulose: 'Thermally thin natural paper sample tested in drop towers to isolate pure two-dimensional flame spread without bulk heat sinks.',
  polyethylene: 'Ubiquitous spaceflight electrical wire insulator and payload packaging material prone to melting and rapid dripping.',
  thin_solid: 'Thermally thin test specimen (< 1mm) where heat transfers rapidly through the entire sample thickness without temperature gradients.',
  thick_solid: 'Thermally thick specimen (> 5mm) where burning is governed by slower internal thermal conduction and surface charring.',
};

interface TourStep {
  title: string;
  description: string;
  targetId: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-step-destination',
    title: '1. Pick a Destination',
    description: 'Select an orbital spacecraft (0g microgravity), Lunar base (0.16g), or Mars base (0.38g). Gravity directly governs whether buoyant hot air rises or flames form quiet spheres.',
  },
  {
    targetId: 'tour-step-conditions',
    title: '2. Adjust Conditions & Watch the Flame Change',
    description: 'Tweak oxygen concentration, cabin pressure, and ventilation airflow. The live flame visualization updates immediately to reflect the physical combustion regime.',
  },
  {
    targetId: 'tour-step-evidence',
    title: '3. See Which Real NASA Experiments Match',
    description: 'IGNIS compares your atmosphere against real NASA spaceflight missions (Saffire, BASS, FLEX) to show verified behavior profiles and closest flight runs.',
  },
];

/**
 * Validates and parses scenario from URL search params with fallback to Orbital preset
 */
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

/**
 * Synced Slider + Clamped Number Input with Real-time Inline Hint
 */
interface SyncedInputProps {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  hint: string;
  helperText?: string;
  icon?: React.ReactNode;
  onChange: (val: number) => void;
}

const SyncedSliderInput: React.FC<SyncedInputProps> = ({
  id,
  label,
  unit,
  min,
  max,
  step,
  value,
  hint,
  helperText,
  icon,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [typedValue, setTypedValue] = useState<string>('');
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const displayValue = isFocused ? typedValue : String(value);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    setTypedValue(String(num));
    setErrorHint(null);
    onChange(num);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setTypedValue(String(value));
    setErrorHint(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedValue(raw);

    const num = parseFloat(raw);
    if (isNaN(num)) {
      setErrorHint(hint);
      return;
    }

    if (num < min || num > max) {
      setErrorHint(hint);
    } else {
      setErrorHint(null);
      onChange(num);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(typedValue);
    if (isNaN(num)) {
      setErrorHint(null);
      return;
    }

    const clamped = Math.min(max, Math.max(min, num));
    setErrorHint(null);
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  return (
    <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-white flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1">
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onFocus={handleFocus}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-20 px-2 py-0.5 text-right font-mono text-xs rounded bg-black/60 border ${
              errorHint ? 'border-amber-400 text-amber-300' : 'border-slate-700 text-white'
            } focus:outline-none focus:border-cyan-400`}
          />
          <span className="text-xs font-mono text-slate-400 min-w-[2.2rem]">{unit}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        aria-label={`${label} slider`}
      />

      {helperText && (
        <p className="text-[11px] text-slate-400 font-sans leading-normal">
          {helperText}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>{min} {unit}</span>
        {errorHint ? (
          <span className="text-amber-400 font-semibold">{errorHint}</span>
        ) : (
          <span className="text-slate-400">Target Range</span>
        )}
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

export const SimulatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDrawer } = useAskIgnis();

  // Initialize scenario A from URL search params
  const initialData = useMemo(() => parseScenarioFromParams(searchParams), [searchParams]);
  const [selectedPresetSlug, setSelectedPresetSlug] = useState<string>(initialData.presetSlug);
  const [scenarioA, setScenarioA] = useState<ScenarioInput>(initialData.scenario);

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
    material: 'fabric_cotton',
    objective: 'flame_spread',
    gravity_environment: 'partial_gravity_lunar',
    oxygen_pct: 32.0,
    pressure_kpa: 56.0,
    airflow_cm_s: 8.0,
  });
  const [selectedPresetSlugB, setSelectedPresetSlugB] = useState<string>('moon');
  const [showScenarioBDetails, setShowScenarioBDetails] = useState<boolean>(false);

  // Analysis result & loading states
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Share link feedback
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Interactive Coachmark Tour State
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Result cards container ref for anime.js stagger entrance
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsContainerRef.current) return;
    const cards = Array.from(cardsContainerRef.current.children) as HTMLElement[];
    if (cards.length === 0) return;
    return staggerIn(cards, {
      delay: 70,
      duration: 550,
      translateY: 16,
    });
  }, [analysis?.matches]);

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

  // Active preset details
  const activePresetA = useMemo(
    () => DEFAULT_PRESETS.find((p) => p.slug === selectedPresetSlug) || DEFAULT_PRESETS[0],
    [selectedPresetSlug]
  );

  // Sync scenario A changes to URL search params
  const updateUrlParams = useCallback(
    (scenario: ScenarioInput, destination: string) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('destination', destination);
      nextParams.set('oxygen', String(scenario.oxygen_pct));
      nextParams.set('pressure', String(scenario.pressure_kpa));
      nextParams.set('airflow', String(scenario.airflow_cm_s));
      nextParams.set('material', scenario.material);
      nextParams.set('objective', scenario.objective || 'flame_spread');
      setSearchParams(nextParams, { replace: true });
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
    updateUrlParams(updated, preset.slug);
  };

  const handleResetPresetA = () => {
    handleSelectPresetA(activePresetA);
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

  const isInitialMountRef = useRef<boolean>(true);

  // Debounced API Analysis with AbortController
  useEffect(() => {
    const abortController = new AbortController();
    const isFirst = isInitialMountRef.current;
    isInitialMountRef.current = false;
    const debounceDelay = isFirst ? 0 : 250;

    const timer = setTimeout(() => {
      setIsUpdating(true);
      api
        .analyzeHabitat(scenarioA, { signal: abortController.signal })
        .then((data) => {
          setAnalysis(data);
          setError(null);
          setIsUpdating(false);
          setIsInitialLoading(false);
        })
        .catch((err) => {
          if (err instanceof Error && err.name === 'AbortError') {
            return; // Ignore aborted stale requests
          }
          console.error('Error in habitat analysis:', err);
          setError(
            err instanceof Error
              ? err.message
              : 'Could not connect to the IGNIS Analysis Engine. Ensure the backend service is running.'
          );
          setIsUpdating(false);
          setIsInitialLoading(false);
        });
    }, debounceDelay);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [scenarioA, retryCount]);

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

  return (
    <div className="space-y-8 py-2 sm:py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-400">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Mode 01 · Simulator</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">PRD v1.1 §10, §16</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
            Habitat Simulator & Live Evidence
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Interactively configure space destination atmosphere parameters. The physical flame responds
            instantly while IGNIS continuously evaluates comparable NASA <Term term="microgravity">microgravity</Term> flight datasets.
          </p>
        </div>

        {/* Global Toolbar: Share link, Tour replay, & Compare toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReplayTour}
            icon={<HelpCircle className="w-3.5 h-3.5 text-cyan-400" />}
            title="Replay interactive walkthrough"
          >
            Tour
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            icon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          >
            {copiedLink ? 'Copied Link!' : 'Share'}
          </Button>

          <Button
            variant={isCompareMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsCompareMode(!isCompareMode)}
            icon={<GitCompare className="w-3.5 h-3.5" />}
          >
            {isCompareMode ? 'Compare Active' : 'Compare'}
          </Button>
        </div>
      </div>

      {/* MOBILE ONLY: Sticky Compact Flame Canvas */}
      <div className="lg:hidden sticky top-[68px] z-20 pb-3 bg-[#060813]/95 backdrop-blur-md border-b border-slate-800/80 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Flame Reaction</span>
            </span>
            {isUpdating && (
              <span className="text-[11px] text-cyan-300 animate-pulse flex items-center gap-1">
                <RotateCcw className="w-3 h-3 animate-spin" /> Updating...
              </span>
            )}
          </div>
          <EvidenceGuidedVisualization
            scenario={scenarioA}
            comparableCount={analysis?.eligible_count ?? 0}
            compact
            label="Live Physical Reaction"
            destination={selectedPresetSlug}
          />
        </div>
      </div>

      {/* Main Two-Column Layout (Desktop ≥1024px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Controls & Presets (Sticky on Desktop)                 */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
          {/* Destination Preset Selector Cards */}
          <section
            id="tour-step-destination"
            className={`space-y-3 transition-all duration-300 ${
              tourStep === 0 ? 'ring-2 ring-cyan-400/80 rounded-2xl p-2.5 bg-cyan-950/20' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-orange-400" />
                  <span>Destination Preset</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-sans leading-normal mt-0.5">
                  Selects the gravity field and baseline atmosphere parameters for the simulated habitat.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetPresetA}
                icon={<RotateCcw className="w-3 h-3" />}
              >
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
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
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className={isSelected ? 'text-orange-400' : 'text-slate-400'}>{icon}</div>
                      <Badge variant={isSelected ? 'strong' : 'neutral'} size="xs">
                        {preset.gravity_value_g !== null ? `${preset.gravity_value_g}g` : '0g'}
                      </Badge>
                    </div>
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {preset.display_name.split('(')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Atmosphere Parameter Sliders + Synced Clamped Inputs */}
          <section
            id="tour-step-conditions"
            className={`space-y-3 transition-all duration-300 ${
              tourStep === 1 ? 'ring-2 ring-cyan-400/80 rounded-2xl p-2.5 bg-cyan-950/20' : ''
            }`}
          >
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Atmosphere Sliders (Scenario A)</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans leading-normal mt-0.5">
                Adjust life-support parameters to see how physical fire behaves in space.
              </p>
            </div>

            <div className="space-y-2.5">
              <SyncedSliderInput
                id="oxygen-slider-a"
                label="Oxygen Concentration"
                unit="%"
                min={15.0}
                max={40.0}
                step={0.1}
                value={scenarioA.oxygen_pct ?? 21.0}
                hint="Oxygen must be 15–40%"
                helperText="Controls chemical reaction rate and flame intensity (typical space habitat: 21–34% O₂)."
                icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
                onChange={(val) => {
                  const updated = { ...scenarioA, oxygen_pct: val };
                  setScenarioA(updated);
                  updateUrlParams(updated, selectedPresetSlug);
                }}
              />

              <SyncedSliderInput
                id="pressure-slider-a"
                label="Cabin Total Pressure"
                unit="kPa"
                min={30.0}
                max={120.0}
                step={0.5}
                value={scenarioA.pressure_kpa ?? 101.3}
                hint="Pressure must be 30–120 kPa"
                helperText="Sets cabin gas density and heat transfer (typical space habitat: 56.0–101.3 kPa)."
                icon={<Gauge className="w-3.5 h-3.5 text-sky-400" />}
                onChange={(val) => {
                  const updated = { ...scenarioA, pressure_kpa: val };
                  setScenarioA(updated);
                  updateUrlParams(updated, selectedPresetSlug);
                }}
              />

              <SyncedSliderInput
                id="airflow-slider-a"
                label="Forced Ventilation Airflow"
                unit="cm/s"
                min={0.0}
                max={30.0}
                step={0.5}
                value={scenarioA.airflow_cm_s ?? 5.0}
                hint="Airflow must be 0–30 cm/s"
                helperText="Supplies fresh oxygen and sweeps exhaust away (typical cabin ventilation: 5.0–20.0 cm/s)."
                icon={<Wind className="w-3.5 h-3.5 text-emerald-400" />}
                onChange={(val) => {
                  const updated = { ...scenarioA, airflow_cm_s: val };
                  setScenarioA(updated);
                  updateUrlParams(updated, selectedPresetSlug);
                }}
              />
            </div>
          </section>

          {/* Material & Objective Selectors */}
          <section className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="material-select" className="text-xs font-semibold text-white block">
                  Combustible Material Family
                </label>
                <span className="text-[10px] font-mono text-cyan-400">7 Spaceflight Materials</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-normal">
                Selects the fuel family tested in microgravity combustion chambers.
              </p>
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
                    {opt.label} — {opt.notes}
                  </option>
                ))}
              </select>

              {/* Material Justification Callout */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">Why Offered: </span>
                  <span className="text-slate-300">{MATERIAL_JUSTIFICATIONS[scenarioA.material]}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="objective-select" className="text-xs font-semibold text-white block">
                Primary Scientific Investigation Goal
              </label>
              <p className="text-[11px] text-slate-400 font-sans leading-normal">
                Specifies the primary research question used to weight and filter NASA flight matches.
              </p>
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
                    {opt.label} ({opt.description})
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Scenario B Controls Panel (When Compare Mode is Active) */}
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
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Scenario B (Comparison)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowScenarioBDetails(!showScenarioBDetails)}
                    className="text-xs text-cyan-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>{showScenarioBDetails ? 'Collapse Sliders' : 'Expand Sliders'}</span>
                    {showScenarioBDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="destination-b-select" className="text-xs font-medium text-slate-300 block">
                    Scenario B Destination
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
                  <div className="space-y-2 pt-2 border-t border-cyan-900/50">
                    <SyncedSliderInput
                      id="oxygen-slider-b"
                      label="O₂ (Scenario B)"
                      unit="%"
                      min={15.0}
                      max={40.0}
                      step={0.1}
                      value={scenarioB.oxygen_pct ?? 21.0}
                      hint="Oxygen must be 15–40%"
                      onChange={(val) => setScenarioB((prev) => ({ ...prev, oxygen_pct: val }))}
                    />
                    <SyncedSliderInput
                      id="pressure-slider-b"
                      label="Pressure (Scenario B)"
                      unit="kPa"
                      min={30.0}
                      max={120.0}
                      step={0.5}
                      value={scenarioB.pressure_kpa ?? 101.3}
                      hint="Pressure must be 30–120 kPa"
                      onChange={(val) => setScenarioB((prev) => ({ ...prev, pressure_kpa: val }))}
                    />
                    <SyncedSliderInput
                      id="airflow-slider-b"
                      label="Airflow (Scenario B)"
                      unit="cm/s"
                      min={0.0}
                      max={30.0}
                      step={0.5}
                      value={scenarioB.airflow_cm_s ?? 5.0}
                      hint="Airflow must be 0–30 cm/s"
                      onChange={(val) => setScenarioB((prev) => ({ ...prev, airflow_cm_s: val }))}
                    />
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Contextual Gravity Transfer Warning & Engineering Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
            {activePresetA.gravity_value_g && activePresetA.gravity_value_g > 0 ? (
              <div className="flex items-start gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Gravity Transfer Warning:</strong> NASA flight datasets (Saffire, BASS) are 0g <Term term="microgravity">microgravity</Term>.
                  Comparing to {activePresetA.display_name.split('(')[0]} ({activePresetA.gravity_value_g}g) caps match <Term term="confidence">confidence</Term> to reflect partial <Term term="buoyancy">buoyant convection</Term>.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Zero-Buoyancy Flight Match:</strong> Orbital conditions directly match ISS and Cygnus <Term term="microgravity">microgravity</Term> telemetry without <Term term="buoyancy">buoyancy</Term> extrapolation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Visualizations & Analysis Evidence Results            */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Status & Updating Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="strong" size="xs">
                EVIDENCE ENGINE v1.1
              </Badge>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Real-Time Physical Feedback
              </span>
            </div>

            {isUpdating && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono animate-pulse">
                <RotateCcw className="w-3 h-3 animate-spin" />
                Updating evidence...
              </span>
            )}
          </div>

          {/* a) EvidenceGuidedVisualization (flame) at the top, always visible */}
          {/* Desktop Single or Dual Flames (Hidden on mobile since sticky above) */}
          <div className="hidden lg:block space-y-4">
            {!isCompareMode ? (
              <EvidenceGuidedVisualization
                scenario={scenarioA}
                comparableCount={analysis?.eligible_count ?? 0}
                label="Scenario A · Physical Flame Regime"
                destination={selectedPresetSlug}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EvidenceGuidedVisualization
                    scenario={scenarioA}
                    comparableCount={analysis?.eligible_count ?? 0}
                    compact
                    label="Scenario A (Primary)"
                    destination={selectedPresetSlug}
                  />
                  <EvidenceGuidedVisualization
                    scenario={scenarioB}
                    comparableCount={0}
                    compact
                    label="Scenario B (Comparison)"
                    destination={selectedPresetSlugB}
                  />
                </div>

                {/* Compare Mode Side-by-Side Delta Summary */}
                <Card variant="glass" padding="md" className="border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                      <GitCompare className="w-4 h-4 text-cyan-400" />
                      <span>Behavior Difference Summary</span>
                    </span>
                    <Badge variant="strong" size="xs">
                      A vs B Comparison
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {behaviorDifferenceSummary}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div className="p-2 rounded bg-black/40">
                      <span className="text-slate-400 block text-[10px]">O₂ Concentration</span>
                      <span className="text-white font-bold">{scenarioA.oxygen_pct}%</span>
                      <span className="text-cyan-400 ml-1.5">vs {scenarioB.oxygen_pct}%</span>
                    </div>
                    <div className="p-2 rounded bg-black/40">
                      <span className="text-slate-400 block text-[10px]">Gravity Field</span>
                      <span className="text-white font-bold">{activePresetA.gravity_value_g ?? '0'}g</span>
                      <span className="text-cyan-400 ml-1.5">vs {scenarioB.gravity_environment?.replace(/partial_gravity_/g, '') || '0g'}</span>
                    </div>
                    <div className="p-2 rounded bg-black/40">
                      <span className="text-slate-400 block text-[10px]">Ventilation Flow</span>
                      <span className="text-white font-bold">{scenarioA.airflow_cm_s} cm/s</span>
                      <span className="text-cyan-400 ml-1.5">vs {scenarioB.airflow_cm_s} cm/s</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Initial First-Load Skeleton (Only shown before first request completes) */}
          {isInitialLoading && !analysis && !error && (
            <div className="space-y-6">
              <Card variant="default" padding="lg">
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="70%" height={16} className="mt-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Skeleton variant="card" height={130} />
                  <Skeleton variant="card" height={130} />
                  <Skeleton variant="card" height={130} />
                </div>
              </Card>
              <div className="space-y-4">
                <Skeleton variant="text" width="30%" height={22} />
                <Skeleton variant="card" height={180} />
                <Skeleton variant="card" height={180} />
              </div>
            </div>
          )}

          {/* Error Card with Retry Button (Results column only, flame & controls remain usable) */}
          {error && (
            <Card variant="default" padding="lg" className="border-rose-500/30 text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Analysis Pipeline Interrupted</h3>
                <p className="text-xs text-rose-300 max-w-lg mx-auto">{error}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setRetryCount((prev) => prev + 1)}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Retry Analysis
                </Button>
                <Link to="/experiments">
                  <Button variant="outline" size="sm">
                    View Flight Archive
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Results Panels (Preserved during in-flight updates without flashing) */}
          {analysis && (
            <div className="space-y-8">
              {/* b) Fire Behavior Profile Card */}
              <section className="space-y-3">
                <FireBehaviorProfileCard
                  profile={analysis.behavior_profile}
                  onAskAboutThis={() =>
                    openDrawer(
                      `Why does the simulation predict this fire behavior profile under these cabin conditions?`
                    )
                  }
                />
              </section>

              {/* c) "Why?" Factor Breakdown Panel */}
              {analysis.matches.length > 0 && (
                <section className="space-y-3">
                  <WhyPanel
                    topMatch={analysis.matches[0]}
                    scenario={scenarioA}
                    comparableCount={analysis.eligible_count}
                  />
                </section>
              )}

              {/* Gate Statistics & Filter Results */}
              <section className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Filter className="w-4 h-4 text-orange-400" />
                  <span>Comparable-Evidence Gate Evaluation:</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">Evaluated:</span>
                    <span className="text-white font-bold">{analysis.total_evaluated}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{analysis.eligible_count} Eligible</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-400">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{analysis.excluded_count} Gated</span>
                  </div>
                </div>
              </section>

              {/* d) Closest NASA Flight Evidence Runs & Parameter Distribution Map */}
              <section
                id="tour-step-evidence"
                className={`space-y-4 transition-all duration-300 ${
                  tourStep === 2 ? 'ring-2 ring-cyan-400/80 rounded-2xl p-3 bg-cyan-950/20' : ''
                }`}
              >
                {/* 2D Flight Evidence Parameter Distribution Map */}
                <ParameterMap matches={analysis.matches} scenario={scenarioA} />

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                      <Layers className="w-5 h-5 text-orange-400" />
                      <span>Closest NASA Flight Evidence</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ranked by <Term term="evidence similarity">multi-dimensional similarity</Term> to your configured habitat atmosphere.
                    </p>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {analysis.matches.length} RUNS RANKED
                  </Badge>
                </div>

                {analysis.matches.length === 0 ? (
                  <Card variant="glass" padding="lg" className="text-center py-10 space-y-2">
                    <p className="text-sm text-slate-300 font-medium">
                      No directly comparable flight runs; showing nearest matches.
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      The Comparable-Evidence Filter gated all candidate experiments due to fundamental physical incompatibilities. Adjust oxygen or flow parameters above.
                    </p>
                  </Card>
                ) : (
                  <div ref={cardsContainerRef} className="space-y-3.5">
                    {analysis.matches.map((match, idx) => (
                      <EvidenceMatchCard key={match.run.id || idx} match={match} rank={idx + 1} />
                    ))}
                  </div>
                )}
              </section>

              {/* Exploration Actions */}
              <section className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F1626] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                    Deepen Your Investigation
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ask targeted questions with citations or explore full flight experiment datasets.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => openDrawer()}
                  >
                    Ask IGNIS AI
                  </Button>
                  <Link to="/experiments">
                    <Button variant="outline" size="sm">
                      Flight Data
                    </Button>
                  </Link>
                </div>
              </section>
            </div>
          )}
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
    </div>
  );
};

export default SimulatorPage;
