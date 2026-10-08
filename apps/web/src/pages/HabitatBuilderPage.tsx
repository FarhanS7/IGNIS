import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../lib/api';
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

export const HabitatBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [presets, setPresets] = useState<HabitatPreset[]>(DEFAULT_PRESETS);
  const [selectedPresetSlug, setSelectedPresetSlug] = useState<string>('orbital');

  // Habitat parameter state
  const [oxygenPct, setOxygenPct] = useState<number>(21.0);
  const [pressureKpa, setPressureKpa] = useState<number>(101.3);
  const [airflowCmS, setAirflowCmS] = useState<number>(5.0);
  const [material, setMaterial] = useState<MaterialFamily>('pmma');
  const [objective, setObjective] = useState<ScientificObjective>('flame_spread');
  const [gravityEnv, setGravityEnv] = useState<GravityEnvironment>('microgravity');

  // Load presets from API
  useEffect(() => {
    let isMounted = true;
    api.getHabitatPresets()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setPresets(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load live presets from API, using cached reference presets:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activePreset = presets.find((p) => p.slug === selectedPresetSlug) || presets[0];

  // Select destination preset
  const handleSelectPreset = (preset: HabitatPreset) => {
    setSelectedPresetSlug(preset.slug);
    if (preset.default_oxygen_pct !== null && preset.default_oxygen_pct !== undefined) {
      setOxygenPct(preset.default_oxygen_pct);
    }
    if (preset.default_pressure_kpa !== null && preset.default_pressure_kpa !== undefined) {
      setPressureKpa(preset.default_pressure_kpa);
    }
    if (preset.default_airflow_cm_s !== null && preset.default_airflow_cm_s !== undefined) {
      setAirflowCmS(preset.default_airflow_cm_s);
    }
    if (preset.default_material) {
      setMaterial(preset.default_material);
    }

    if (preset.destination === 'orbital') setGravityEnv('microgravity');
    else if (preset.destination === 'moon') setGravityEnv('partial_gravity_lunar');
    else if (preset.destination === 'mars') setGravityEnv('partial_gravity_mars');
    else setGravityEnv('microgravity');
  };

  const handleResetDefaults = () => {
    if (activePreset) {
      handleSelectPreset(activePreset);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const scenario: ScenarioInput = {
      material,
      objective,
      gravity_environment: gravityEnv,
      oxygen_pct: Number(oxygenPct),
      pressure_kpa: Number(pressureKpa),
      airflow_cm_s: Number(airflowCmS),
    };

    // Save in sessionStorage as fallback and pass via router state
    sessionStorage.setItem('ignis_current_scenario', JSON.stringify(scenario));
    navigate('/evidence', { state: { scenario } });
  };

  return (
    <div className="space-y-10 py-2 sm:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-400">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>Mode 01 · Habitat Builder</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PRD v1.1 §10</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
          Configure Habitat Combustion Scenario
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Define space destination environment parameters and cabin atmosphere.
          IGNIS applies NASA physical comparability filters before matching against real flight test runs.
        </p>
      </div>

      {/* Destination Selector (PRD v1.1 §17.2) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs font-mono flex items-center gap-2">
            <Orbit className="w-4 h-4 text-orange-400" />
            <span>Step 1: Select Mission Destination Preset</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Reference baselines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => {
            const isSelected = selectedPresetSlug === preset.slug;
            const icon =
              preset.slug === 'orbital' ? (
                <Orbit className="w-5 h-5" />
              ) : preset.slug === 'moon' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Globe2 className="w-5 h-5" />
              );

            return (
              <motion.div
                key={preset.slug}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between h-full relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-orange-500/80 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/20 to-transparent pointer-events-none" />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {icon}
                      </div>
                      <Badge
                        variant={isSelected ? 'flame' : 'neutral'}
                        size="xs"
                      >
                        {preset.gravity_value_g !== null ? `${preset.gravity_value_g}g` : '0g'}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base font-['Space_Grotesk',sans-serif]">
                        {preset.display_name.split('(')[0].trim()}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {preset.external_environment_summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>O₂: {preset.default_oxygen_pct}%</span>
                    <span>P: {preset.default_pressure_kpa} kPa</span>
                    <span className="text-orange-400/90 font-medium">
                      {isSelected ? 'ACTIVE' : 'SELECT'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Dual Panel Workspace (PRD v1.1 §17.2) */}
      <form onSubmit={handleAnalyze} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Environment & Gravity Context (Read-Only / Contextual) - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass" padding="md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Destination Context</span>
                </CardTitle>
                <Badge variant="plasma" size="xs">
                  READ-ONLY
                </Badge>
              </div>
              <CardDescription>
                Environmental parameters dictated by destination astrophysics and external conditions.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Gravitational Regime:</span>
                  <span className="text-xs font-mono font-bold text-sky-300 uppercase">
                    {activePreset.gravity_class?.replace(/_/g, ' ') || 'Microgravity'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Nominal Acceleration:</span>
                  <span className="text-xs font-mono text-white">
                    {activePreset.gravity_value_g !== null ? `${activePreset.gravity_value_g} g (m/s² scaled)` : '0.0 g'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">External Space Environment:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activePreset.external_environment_summary}
                </p>
              </div>

              {/* Gravity Transfer Warning (PRD v1.1 §14.3) */}
              {activePreset.gravity_value_g && activePreset.gravity_value_g > 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Gravity Transferability Rule</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    Most NASA flight data (Saffire, BASS, FLEX) were conducted in 0g microgravity.
                    Comparing 0g data to {activePreset.destination.toUpperCase()} ({activePreset.gravity_value_g}g) will cap match confidence at <strong>Medium</strong> to reflect unmodeled partial buoyancy.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero-Buoyancy Flight Match</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                    Orbital microgravity directly matches ISS & Cygnus flight datasets without gravitational extrapolation.
                  </p>
                </div>
              )}

              {/* Preset Provenance Notice */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                <span>Standard Baseline:</span>
                <span className="font-mono text-slate-300">
                  {String((activePreset.provenance as Record<string, string>)?.standard || 'NASA-STD-3001')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Habitat Internal Parameters (Editable Controls) - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="default" padding="lg" className="border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sliders className="w-5 h-5 text-orange-400" />
                  <span>Cabin Atmosphere & Test Parameters</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
              <CardDescription>
                Adjust atmospheric composition, pressure, forced ventilation velocity, and sample material.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {/* Oxygen Percentage Control */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label htmlFor="oxygen-input" className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Oxygen Concentration (O₂)</span>
                    <Badge variant="flame" size="xs">
                      {oxygenPct > 21 ? 'Enriched' : oxygenPct < 21 ? 'Depleted' : 'Nominal Earth'}
                    </Badge>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="oxygen-input"
                      type="number"
                      step="0.5"
                      min="15.0"
                      max="40.0"
                      value={oxygenPct}
                      onChange={(e) => setOxygenPct(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-black/60 border border-slate-700 text-right font-mono text-sm text-orange-400 focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-xs font-mono text-slate-400">vol %</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="15.0"
                  max="40.0"
                  step="0.5"
                  value={oxygenPct}
                  onChange={(e) => setOxygenPct(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>15% (Hypoxic)</span>
                  <span className="text-slate-400">21% (Earth/ISS)</span>
                  <span className="text-orange-400">32% (Artemis Cabin)</span>
                  <span>40% (Max)</span>
                </div>
              </div>

              {/* Cabin Pressure Control */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label htmlFor="pressure-input" className="text-sm font-semibold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-sky-400" />
                    <span>Atmospheric Pressure</span>
                    <Badge variant="plasma" size="xs">
                      {pressureKpa < 80 ? 'Hypobaric' : 'Nominal'}
                    </Badge>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="pressure-input"
                      type="number"
                      step="0.5"
                      min="40.0"
                      max="120.0"
                      value={pressureKpa}
                      onChange={(e) => setPressureKpa(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-black/60 border border-slate-700 text-right font-mono text-sm text-sky-400 focus:outline-none focus:border-sky-500"
                    />
                    <span className="text-xs font-mono text-slate-400">kPa</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="40.0"
                  max="120.0"
                  step="0.5"
                  value={pressureKpa}
                  onChange={(e) => setPressureKpa(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>40 kPa (Min EVA)</span>
                  <span className="text-sky-400">56-70 kPa (Exploration)</span>
                  <span className="text-slate-400">101.3 kPa (1 atm)</span>
                  <span>120 kPa</span>
                </div>
              </div>

              {/* Airflow Velocity Control */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label htmlFor="airflow-input" className="text-sm font-semibold text-white flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>Forced Ventilation Airflow</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="airflow-input"
                      type="number"
                      step="0.5"
                      min="0.0"
                      max="30.0"
                      value={airflowCmS}
                      onChange={(e) => setAirflowCmS(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-black/60 border border-slate-700 text-right font-mono text-sm text-cyan-400 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs font-mono text-slate-400">cm/s</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.0"
                  max="30.0"
                  step="0.5"
                  value={airflowCmS}
                  onChange={(e) => setAirflowCmS(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>0 cm/s (Quiescent)</span>
                  <span className="text-cyan-400">5-10 cm/s (Cabin Nominal)</span>
                  <span>30 cm/s (High Ducting)</span>
                </div>
              </div>

              {/* Material Family Dropdown */}
              <div className="space-y-1.5">
                <label htmlFor="material-select" className="text-sm font-semibold text-white block">
                  Combustible Test Material Family
                </label>
                <select
                  id="material-select"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as MaterialFamily)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  {MATERIAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.notes}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scientific Objective Dropdown */}
              <div className="space-y-1.5">
                <label htmlFor="objective-select" className="text-sm font-semibold text-white block">
                  Primary Scientific Investigation Goal
                </label>
                <select
                  id="objective-select"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as ScientificObjective)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  {OBJECTIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.description})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preset Disclaimer Notice (PRD v1.1 §10.3) */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Engineering Reference Notice:</p>
                <p className="text-[11px] leading-relaxed">
                  {activePreset.disclaimer}
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center shadow-lg shadow-orange-500/25"
                  icon={<Search className="w-5 h-5" />}
                >
                  Analyze with NASA Evidence Engine
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};
