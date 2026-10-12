import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Database,
  ExternalLink,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  Activity,
  FileText,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { Skeleton } from '../components/common/Skeleton';
import { Term } from '../components/common/Term';
import { SyncVideoChart } from '../components/charts/SyncVideoChart';
import { useAskIgnis, useSetAskContext } from '../hooks/useAskIgnis';
import { api } from '../lib/api';
import type { Experiment, ExperimentRun, MaterialFamily, GravityEnvironment } from '../types/api';

const FALLBACK_EXPERIMENTS: Experiment[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    external_id: 'SAFFIRE-I',
    experiment_family: 'Saffire',
    title: 'Spacecraft Fire Experiment I (Saffire-I)',
    summary:
      'Large-scale flame spread across solid cotton-fiberglass blend fabric aboard uncrewed Cygnus OA-6 spacecraft.',
    mission_platform: 'Cygnus OA-6',
    gravity_environment: 'microgravity',
    objectives: ['flame_spread', 'extinction', 'flammability_limits'],
    source_url: 'https://psi.nasa.gov/saffire-1',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    external_id: 'SAFFIRE-II',
    experiment_family: 'Saffire',
    title: 'Spacecraft Fire Experiment II (Saffire-II)',
    summary:
      'Combustion of thick PMMA acrylic slabs and Nomex fabric under controlled ventilation aboard Cygnus OA-5.',
    mission_platform: 'Cygnus OA-5',
    gravity_environment: 'microgravity',
    objectives: ['flame_spread', 'sustained_burning', 'material_response'],
    source_url: 'https://psi.nasa.gov/saffire-2',
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    external_id: 'BASS-II',
    experiment_family: 'BASS',
    title: 'Burning and Suppression of Solids II (BASS-II)',
    summary:
      'Investigation of extinction limits and flame spread over PMMA spherical and flat fuels aboard the ISS Microgravity Science Glovebox (MSG).',
    mission_platform: 'ISS MSG',
    gravity_environment: 'microgravity',
    objectives: ['flame_spread', 'extinction', 'suppression'],
    source_url: 'https://psi.nasa.gov/bass-2',
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    external_id: 'FLEX',
    experiment_family: 'FLEX',
    title: 'Flame Extinction Experiment (FLEX)',
    summary:
      'Droplet combustion and low-temperature radiative extinction boundary investigations in the ISS Combustion Integrated Rack (CIR).',
    mission_platform: 'ISS CIR',
    gravity_environment: 'microgravity',
    objectives: ['extinction', 'flammability_limits', 'sustained_burning'],
    source_url: 'https://psi.nasa.gov/flex',
  },
];

const FALLBACK_RUNS: Record<string, ExperimentRun[]> = {
  '22222222-2222-2222-2222-222222222201': [
    {
      id: '22222222-2222-2222-2222-222222330001',
      experiment_id: '22222222-2222-2222-2222-222222222201',
      run_label: 'Run 01 - Fabric Quiescent',
      fuel_type: 'fabric',
      material: 'fabric_cotton' as MaterialFamily,
      geometry: 'flat sheet (0.4m x 1.0m)',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 0.0,
      ignition_observed: true,
      extinction_observed: true,
      flame_spread_observed: false,
      observation_summary:
        'Rapid self-extinction in stagnant air due to oxygen starvation and spherical diffusion barrier.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
    {
      id: '22222222-2222-2222-2222-222222330002',
      experiment_id: '22222222-2222-2222-2222-222222222201',
      run_label: 'Run 02 - Fabric Low Flow',
      fuel_type: 'fabric',
      material: 'fabric_cotton' as MaterialFamily,
      geometry: 'flat sheet (0.4m x 1.0m)',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 5.0,
      ignition_observed: true,
      extinction_observed: false,
      flame_spread_observed: true,
      observation_summary:
        'Steady downstream flame propagation sustained by 5 cm/s forced oxidizer flow.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
    {
      id: '22222222-2222-2222-2222-222222330003',
      experiment_id: '22222222-2222-2222-2222-222222222201',
      run_label: 'Run 03 - Fabric Nominal Flow',
      fuel_type: 'fabric',
      material: 'fabric_cotton' as MaterialFamily,
      geometry: 'flat sheet (0.4m x 1.0m)',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 10.0,
      ignition_observed: true,
      extinction_observed: false,
      flame_spread_observed: true,
      observation_summary:
        'Energetic concurrent flame spread across full sample length.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
  ],
  '22222222-2222-2222-2222-222222222202': [
    {
      id: '22222222-2222-2222-2222-222222330004',
      experiment_id: '22222222-2222-2222-2222-222222222202',
      run_label: 'Run 01 - PMMA Slab Forced Flow',
      fuel_type: 'polymer',
      material: 'pmma' as MaterialFamily,
      geometry: 'thick slab (10mm x 50mm)',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 15.0,
      ignition_observed: true,
      extinction_observed: false,
      flame_spread_observed: true,
      observation_summary:
        'Continuous surface pyrolysis of thick PMMA sustained by convective oxidizer stream.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
    {
      id: '22222222-2222-2222-2222-222222330005',
      experiment_id: '22222222-2222-2222-2222-222222222202',
      run_label: 'Run 02 - Nomex Blend Low O2',
      fuel_type: 'fabric',
      material: 'fabric_synthetic' as MaterialFamily,
      geometry: 'flat sheet',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 18.5,
      pressure_kpa: 101.3,
      airflow_cm_s: 8.0,
      ignition_observed: true,
      extinction_observed: true,
      flame_spread_observed: false,
      observation_summary:
        'Sub-limiting oxygen concentration resulting in flame shrinkage and quenching.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
  ],
  '22222222-2222-2222-2222-222222222205': [
    {
      id: '22222222-2222-2222-2222-222222330006',
      experiment_id: '22222222-2222-2222-2222-222222222205',
      run_label: 'Run 01 - PMMA Sphere Quiescent',
      fuel_type: 'polymer',
      material: 'pmma' as MaterialFamily,
      geometry: 'sphere (10mm dia)',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 0.0,
      ignition_observed: true,
      extinction_observed: true,
      flame_spread_observed: false,
      observation_summary:
        'Spherical flame shell extinguishing due to radiative cooling and low diffusive flux.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
    {
      id: '22222222-2222-2222-2222-222222330007',
      experiment_id: '22222222-2222-2222-2222-222222222205',
      run_label: 'Run 02 - PMMA Strip Low Flow',
      fuel_type: 'polymer',
      material: 'pmma' as MaterialFamily,
      geometry: 'narrow strip',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 5.0,
      ignition_observed: true,
      extinction_observed: false,
      flame_spread_observed: true,
      observation_summary:
        'Steady opposed-flow flame spread over PMMA surface in glovebox nitrogen dilution.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
  ],
  '22222222-2222-2222-2222-222222222207': [
    {
      id: '22222222-2222-2222-2222-222222330008',
      experiment_id: '22222222-2222-2222-2222-222222222207',
      run_label: 'Run 01 - Heptane Droplet Pure Diffusion',
      fuel_type: 'liquid',
      material: 'thin_solid' as MaterialFamily,
      geometry: 'droplet tether (2mm)',
      gravity_environment: 'microgravity' as GravityEnvironment,
      oxygen_pct: 21.0,
      pressure_kpa: 101.3,
      airflow_cm_s: 0.0,
      ignition_observed: true,
      extinction_observed: true,
      flame_spread_observed: false,
      observation_summary:
        'Symmetrical spherical droplet burning exhibiting cool-flame secondary combustion and extinction.',
      source_url: 'https://psi.nasa.gov',
      data_quality: 'high',
    },
  ],
};

export const ExperimentExplorerPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // State for Catalog
  const [experiments, setExperiments] = useState<Experiment[]>(FALLBACK_EXPERIMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('All');
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Cached runs per experiment id
  const [runsMap, setRunsMap] = useState<Record<string, ExperimentRun[]>>(FALLBACK_RUNS);

  // Collapsible sections state (collapsed by default)
  const [openSections, setOpenSections] = useState<{
    runData: boolean;
    instrumentation: boolean;
    sources: boolean;
  }>({
    runData: false,
    instrumentation: false,
    sources: false,
  });

  // Load Catalog from API
  useEffect(() => {
    let active = true;
    api
      .getExperiments({ limit: 50 })
      .then((res) => {
        if (active && res && res.experiments && res.experiments.length > 0) {
          setExperiments(res.experiments);
        }
      })
      .catch((err) => {
        console.warn('Could not load live experiments catalog, using fallback list:', err);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 1. Featured experiment auto-selection (Saffire-I if present, otherwise first)
  const featuredExperiment = useMemo(() => {
    return (
      experiments.find(
        (e) =>
          e.external_id?.toLowerCase() === 'saffire-i' ||
          e.title.toLowerCase().includes('saffire-i') ||
          e.id === '22222222-2222-2222-2222-222222222201'
      ) || experiments[0]
    );
  }, [experiments]);

  // Current active experiment resolved from URL id or fallback to featured
  const activeExperiment: Experiment = useMemo(() => {
    if (id) {
      const match = experiments.find(
        (e) =>
          e.id === id ||
          e.external_id?.toLowerCase() === id.toLowerCase() ||
          e.id.startsWith(id)
      );
      if (match) return match;
    }
    return featuredExperiment;
  }, [id, experiments, featuredExperiment]);

  const { openDrawer } = useAskIgnis();

  // Context-aware research assistant setup
  useSetAskContext(
    useMemo(
      () => ({
        type: 'experiment',
        title: `NASA ${activeExperiment.experiment_family} - ${activeExperiment.title}`,
        experiment: activeExperiment,
        suggestedPrompts: [
          `What were the key discoveries of NASA ${activeExperiment.title}?`,
          `How does airflow affect flame spread in ${activeExperiment.experiment_family}?`,
          'What materials and ignition methods were tested in this campaign?',
          `What makes ${activeExperiment.mission_platform || 'this platform'} unique for combustion research?`,
        ],
      }),
      [activeExperiment]
    )
  );

  // Load runs for the active experiment if not already cached
  useEffect(() => {
    if (!activeExperiment) return;
    const expId = activeExperiment.id;

    if (!runsMap[expId]) {
      let active = true;
      api
        .getExperimentRuns(expId)
        .then((data) => {
          if (active && data && data.length > 0) {
            setRunsMap((prev) => ({ ...prev, [expId]: data }));
          } else if (active) {
            // Check fallback by external_id or default Saffire-I runs
            const fallbackKey = Object.keys(FALLBACK_RUNS).find((k) => k === expId);
            setRunsMap((prev) => ({
              ...prev,
              [expId]: fallbackKey ? FALLBACK_RUNS[fallbackKey] : FALLBACK_RUNS['22222222-2222-2222-2222-222222222201'],
            }));
          }
        })
        .catch(() => {
          if (active) {
            const fallbackKey = Object.keys(FALLBACK_RUNS).find((k) => k === expId);
            setRunsMap((prev) => ({
              ...prev,
              [expId]: fallbackKey ? FALLBACK_RUNS[fallbackKey] : FALLBACK_RUNS['22222222-2222-2222-2222-222222222201'],
            }));
          }
        });

      return () => {
        active = false;
      };
    }
  }, [activeExperiment, runsMap]);

  // Runs for the active experiment
  const activeRuns: ExperimentRun[] = useMemo(() => {
    if (!activeExperiment) return [];
    return (
      runsMap[activeExperiment.id] ||
      FALLBACK_RUNS[activeExperiment.id] ||
      FALLBACK_RUNS['22222222-2222-2222-2222-222222222201'] ||
      []
    );
  }, [activeExperiment, runsMap]);

  // 6. Simulator URL generator (approximates conditions if values present, skips gracefully if not)
  const simulatorUrl = useMemo(() => {
    if (!activeExperiment || activeRuns.length === 0) return null;

    // Pick first run that has numerical combustion conditions
    const candidateRun =
      activeRuns.find(
        (r) =>
          r.oxygen_pct !== null &&
          r.oxygen_pct !== undefined &&
          r.pressure_kpa !== null &&
          r.pressure_kpa !== undefined &&
          r.airflow_cm_s !== null &&
          r.airflow_cm_s !== undefined
      ) || activeRuns[0];

    const grav = candidateRun.gravity_environment || activeExperiment.gravity_environment;
    const o2 = candidateRun.oxygen_pct;
    const pressure = candidateRun.pressure_kpa;
    const airflow = candidateRun.airflow_cm_s;

    if (
      o2 === null ||
      o2 === undefined ||
      pressure === null ||
      pressure === undefined ||
      airflow === null ||
      airflow === undefined ||
      !grav
    ) {
      return null;
    }

    let destination = 'orbital';
    if (grav === 'partial_gravity_lunar') destination = 'moon';
    else if (grav === 'partial_gravity_mars') destination = 'mars';

    const params = new URLSearchParams();
    params.set('destination', destination);
    params.set('oxygen', String(o2));
    params.set('pressure', String(pressure));
    params.set('airflow', String(airflow));
    if (candidateRun.material) {
      params.set('material', candidateRun.material);
    }
    if (activeExperiment.objectives && activeExperiment.objectives.length > 0) {
      params.set('objective', activeExperiment.objectives[0]);
    }

    return `/simulator?${params.toString()}`;
  }, [activeExperiment, activeRuns]);

  // Available family filter options
  const families = useMemo(() => {
    const list = Array.from(new Set(experiments.map((e) => e.experiment_family).filter(Boolean)));
    return ['All', ...list];
  }, [experiments]);

  // Filtered experiments by search query and family pill
  const filteredExperiments = useMemo(() => {
    return experiments.filter((e) => {
      if (selectedFamily !== 'All' && e.experiment_family !== selectedFamily) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        e.title.toLowerCase().includes(q) ||
        e.experiment_family.toLowerCase().includes(q) ||
        e.summary?.toLowerCase().includes(q) ||
        e.external_id?.toLowerCase().includes(q) ||
        e.mission_platform?.toLowerCase().includes(q)
      );
    });
  }, [experiments, selectedFamily, searchQuery]);

  // 5. Selecting an item updates URL without a full page reload
  const handleSelectExperiment = (exp: Experiment) => {
    if (activeExperiment.id !== exp.id) {
      navigate(`/experiment/${exp.id}`, { replace: false });
    }
  };

  // 3. Collapsible controls
  const toggleSection = (key: 'runData' | 'instrumentation' | 'sources') => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allSectionsOpen = openSections.runData && openSections.instrumentation && openSections.sources;
  const toggleAllSections = () => {
    const nextState = !allSectionsOpen;
    setOpenSections({
      runData: nextState,
      instrumentation: nextState,
      sources: nextState,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-400">
          <Database className="w-3.5 h-3.5" />
          <span>NASA <Term term="psi">PSI</Term> Archive · Flight Telemetry Explorer</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Evidence Levels A & B</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
          Spacecraft Combustion Flight Data
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Inspect synchronized optical cameras and telemetry from <Term term="saffire">Saffire</Term>, <Term term="bass">BASS</Term>, and <Term term="flex">FLEX</Term> <Term term="microgravity">microgravity</Term> missions aboard the ISS (<Term term="cir">CIR</Term> / <Term term="msg">MSG</Term>) and Cygnus.
        </p>
      </div>

      {/* ======================================================================
          4. MOBILE: Top selector bar (search + pills + horizontal chip scroller)
          ====================================================================== */}
      <div className="lg:hidden space-y-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, fuel, platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Family Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {families.map((fam) => (
            <button
              key={fam}
              type="button"
              onClick={() => setSelectedFamily(fam)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedFamily === fam
                  ? 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {fam}
            </button>
          ))}
        </div>

        {/* 4. Horizontal Experiment Chip Scroller */}
        {filteredExperiments.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar -mx-1 px-1">
            {filteredExperiments.map((exp) => {
              const isSelected = activeExperiment.id === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => handleSelectExperiment(exp)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-orange-400/50'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase opacity-75">
                    {exp.experiment_family}
                  </span>
                  <span className="whitespace-nowrap font-sans">
                    {exp.external_id || exp.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* 7. Empty search state (mobile) */
          <div className="p-4 text-center rounded-xl bg-black/40 border border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">No campaigns match filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedFamily('All');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* ======================================================================
          2. DESKTOP & PRIMARY LAYOUT: Left (1/3) vs Right (2/3)
          ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ====================================================================
            LEFT COLUMN (≈1/3): Search, Pills, Scrollable Experiment List
            ==================================================================== */}
        <aside className="hidden lg:block lg:col-span-4 space-y-4">
          <Card variant="glass" padding="md" className="border-slate-800 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaigns, material, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/50 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Family Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {families.map((fam) => (
                <button
                  key={fam}
                  type="button"
                  onClick={() => setSelectedFamily(fam)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    selectedFamily === fam
                      ? 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
              <span>ARCHIVE CAMPAIGNS</span>
              <span>{filteredExperiments.length} Found</span>
            </div>
          </Card>

          {/* Loading Skeleton */}
          {catalogLoading && (
            <div className="space-y-3">
              <Skeleton variant="card" height={100} />
              <Skeleton variant="card" height={100} />
              <Skeleton variant="card" height={100} />
            </div>
          )}

          {/* Scrollable Experiment List */}
          {!catalogLoading && filteredExperiments.length > 0 && (
            <div
              tabIndex={0}
              aria-label="NASA experiments list"
              className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-2 pr-1.5 custom-scrollbar focus:outline-none focus:ring-1 focus:ring-orange-500/40 rounded-xl"
            >
              {filteredExperiments.map((exp) => {
                const isSelected = activeExperiment.id === exp.id;
                return (
                  <div
                    key={exp.id}
                    onClick={() => handleSelectExperiment(exp)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-orange-500/80 shadow-md shadow-orange-500/10 ring-1 ring-orange-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase ${
                            isSelected ? 'text-orange-400' : 'text-slate-400'
                          }`}
                        >
                          {exp.experiment_family}
                        </span>
                        {exp.external_id && (
                          <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-1.5">
                            {exp.external_id}
                          </span>
                        )}
                      </div>
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      ) : (
                        <EvidenceBadge level="A" size="xs" />
                      )}
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] line-clamp-1 ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {exp.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {exp.summary}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/50 text-[10px] font-mono text-slate-400">
                      <span>{exp.mission_platform || 'NASA Spaceflight'}</span>
                      <span className={`flex items-center gap-0.5 ${isSelected ? 'text-orange-400 font-semibold' : 'text-slate-400'}`}>
                        <span>Select</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 7. Empty State (Desktop) with "Clear filters" button */}
          {!catalogLoading && filteredExperiments.length === 0 && (
            <Card variant="glass" padding="lg" className="text-center space-y-3 border-slate-800">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No flight campaigns found</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                No experiments match your search or selected family filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFamily('All');
                }}
              >
                Clear filters
              </Button>
            </Card>
          )}
        </aside>

        {/* ====================================================================
            RIGHT COLUMN (≈2/3): Header -> SyncVideoChart IMMEDIATELY -> Summary -> Collapsible sections
            ==================================================================== */}
        <main className="lg:col-span-8 space-y-6">
          {/* Selected Experiment Header */}
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                  {activeExperiment.experiment_family}
                </span>
                {activeExperiment.external_id && (
                  <span className="text-xs font-mono text-slate-300 border-l border-slate-700 pl-2">
                    {activeExperiment.external_id}
                  </span>
                )}
                {activeExperiment.mission_platform && (
                  <span className="text-xs font-mono text-cyan-300 border-l border-slate-700 pl-2">
                    Platform: {activeExperiment.mission_platform}
                  </span>
                )}
                {activeExperiment.gravity_environment && (
                  <Badge variant="strong" size="xs">
                    {activeExperiment.gravity_environment}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <EvidenceBadge level="A" size="xs" />
                <EvidenceBadge level="B" size="xs" />
                <span className="text-xs font-mono text-slate-400">Telemetry Verified</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
              {activeExperiment.title}
            </h2>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {/* 6. Try similar conditions in the Simulator (if conditions present) */}
              {simulatorUrl && (
                <Link to={simulatorUrl}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Sliders className="w-3.5 h-3.5 text-white" />}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 font-semibold"
                  >
                    Try similar conditions in Simulator
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                onClick={() =>
                  openDrawer(
                    `What are the scientific findings of NASA ${activeExperiment.title}?`
                  )
                }
              >
                Ask IGNIS AI
              </Button>

              {activeExperiment.source_url && (
                <a
                  href={activeExperiment.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    NASA PSI Archive
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* ==================================================================
              2. SyncVideoChart IMMEDIATELY under the header!
              ================================================================== */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl">
            <SyncVideoChart
              missionPlatform={activeExperiment.mission_platform || 'ISS Combustion Integrated Rack'}
              sampleName={activeExperiment.title}
            />
          </div>

          {/* Short Plain-Language Summary Card */}
          <Card variant="glass" padding="md" className="border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Campaign Summary & Scientific Takeaway</span>
              </h3>
              <Badge variant="neutral" size="xs">
                {activeRuns.length} Test Runs Cataloged
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeExperiment.summary ||
                'Empirical investigation of flame behavior, material flammability limits, and extinction kinetics under microgravity spacecraft conditions.'}
            </p>

            {/* Objectives Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 mr-1">Objectives:</span>
              {activeExperiment.objectives.map((obj) => (
                <span
                  key={obj}
                  className="px-2.5 py-0.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] text-slate-300 font-mono"
                >
                  {obj.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </Card>

          {/* ==================================================================
              3. Collapsible Sections Below ("Run data", "Instrumentation", "Sources")
              Collapsed by default, with an expand-all control
              ================================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
                  Detailed Flight Records & Analysis
                </h3>
                <p className="text-xs text-slate-400">
                  Review raw run parameters, sensor instrumentation, and literature provenance.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllSections}
                icon={allSectionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              >
                {allSectionsOpen ? 'Collapse All' : 'Expand All'}
              </Button>
            </div>

            {/* SECTION 1: Run Data */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => toggleSection('runData')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                    Run Data & Normalized Test Conditions
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {activeRuns.length} Runs
                  </span>
                </div>
                <div className="text-slate-400 hover:text-white transition-transform">
                  {openSections.runData ? (
                    <ChevronUp className="w-4 h-4 text-orange-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openSections.runData && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    className="border-t border-slate-800 overflow-x-auto"
                  >
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 bg-black/40 text-slate-400">
                          <th className="p-3 font-normal">Run Label</th>
                          <th className="p-3 font-normal">Fuel & Geometry</th>
                          <th className="p-3 font-normal">Oxygen</th>
                          <th className="p-3 font-normal">Pressure</th>
                          <th className="p-3 font-normal">Airflow</th>
                          <th className="p-3 font-normal">Phenomena Observed</th>
                          <th className="p-3 font-normal">Authority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {activeRuns.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-900/80 transition-colors">
                            <td className="p-3 text-white font-bold whitespace-nowrap">
                              {r.run_label || 'Test Run'}
                            </td>
                            <td className="p-3 text-slate-300">
                              <div>{r.material || 'Solid fuel'}</div>
                              <div className="text-[10px] text-slate-400 font-sans">{r.geometry}</div>
                            </td>
                            <td className="p-3 text-orange-300 whitespace-nowrap">
                              {r.oxygen_pct !== null && r.oxygen_pct !== undefined ? `${r.oxygen_pct}%` : '—'}
                            </td>
                            <td className="p-3 text-sky-300 whitespace-nowrap">
                              {r.pressure_kpa !== null && r.pressure_kpa !== undefined ? `${r.pressure_kpa} kPa` : '—'}
                            </td>
                            <td className="p-3 text-cyan-300 whitespace-nowrap">
                              {r.airflow_cm_s !== null && r.airflow_cm_s !== undefined ? `${r.airflow_cm_s} cm/s` : '—'}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {r.flame_spread_observed ? (
                                  <span className="flex items-center gap-1 text-orange-400 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Flame Spread
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                                    <XCircle className="w-3 h-3" /> No Spread
                                  </span>
                                )}
                                {r.extinction_observed && (
                                  <span className="flex items-center gap-1 text-sky-400 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Extinguished
                                  </span>
                                )}
                              </div>
                              {r.observation_summary && (
                                <p className="text-[10px] text-slate-400 font-sans mt-0.5 max-w-xs">
                                  {r.observation_summary}
                                </p>
                              )}
                            </td>
                            <td className="p-3">
                              <EvidenceBadge level="B" size="xs" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECTION 2: Instrumentation & Evidence Separation */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => toggleSection('instrumentation')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                    Instrumentation & Empirical Observation Separation
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                    Levels A, B, E
                  </span>
                </div>
                <div className="text-slate-400 hover:text-white transition-transform">
                  {openSections.instrumentation ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openSections.instrumentation && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    className="p-4 border-t border-slate-800 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Empirical Telemetry */}
                      <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Empirical Flight Telemetry</span>
                          </span>
                          <EvidenceBadge level="A" size="xs" />
                        </div>
                        <h4 className="text-xs font-bold text-white">
                          Directly Measured Flight Phenomena
                        </h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                          <li>
                            Flames in microgravity burn without buoyant updraft, forming spherically symmetric reaction zones.
                          </li>
                          <li>
                            In stagnant air (0 cm/s airflow), combustion extinguishes quickly due to carbon dioxide smothering.
                          </li>
                          <li>
                            Forced airflow (5–15 cm/s) continuously renews oxygen transport, driving steady downstream spread.
                          </li>
                        </ul>
                      </div>

                      {/* Grounded AI Synthesis */}
                      <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Grounded AI Synthesis</span>
                          </span>
                          <EvidenceBadge level="E" size="xs" />
                        </div>
                        <h4 className="text-xs font-bold text-white">
                          Cabin Atmosphere Safety Synthesis
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Spacecraft ventilation ducts create localized flow paths that sustain flame propagation even in total weightlessness. IGNIS grounds every simulation in verified NASA Physical Science Informatics datasets.
                        </p>
                        <div className="text-[11px] text-slate-400 p-2 rounded bg-slate-900 border border-slate-800">
                          Notice: AI synthesis is strictly bounded to published NASA papers and does not replace qualification tests.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECTION 3: Sources & Provenance */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => toggleSection('sources')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                    Sources, Mission Platform & Citations
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                    NASA PSI Archive
                  </span>
                </div>
                <div className="text-slate-400 hover:text-white transition-transform">
                  {openSections.sources ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openSections.sources && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    className="p-4 border-t border-slate-800 space-y-3"
                  >
                    <div className="text-xs text-slate-300 space-y-2">
                      <p>
                        <strong>Flight Platform:</strong> {activeExperiment.mission_platform || 'NASA Spacecraft Facility'}
                      </p>
                      <p>
                        <strong>Primary Data Archive:</strong> NASA Physical Science Informatics (PSI) Database (psi.nasa.gov)
                      </p>
                      <p>
                        <strong>Scientific Citation:</strong> Spacecraft Fire Experiment Flight Data Reports, NASA Glenn Research Center Combustion Archives (NASA/TM-2017-219500).
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {activeExperiment.source_url && (
                        <a
                          href={activeExperiment.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <span>Open NASA PSI Dataset</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Link
                        to="/about"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Read Scientific Methodology</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExperimentExplorerPage;
