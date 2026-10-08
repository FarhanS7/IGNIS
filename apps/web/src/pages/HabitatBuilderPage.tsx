import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EvidenceGuidedVisualization } from '../components/evidence/EvidenceGuidedVisualization';
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
    external_environment_summary: 'Low Earth orbit vacuum, zero buoyancy, pure molecular diffusion transport',
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
    display_name: 'Lunar Base Habitat (0.16g)',
    destination: 'moon',
    gravity_class: 'partial_gravity_lunar',
    gravity_value_g: 0.16,
    external_environment_summary: 'Lunar surface vacuum, 1/6th gravity, weak buoyancy convection re-emerges',
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
    display_name: 'Mars Base Habitat (0.38g)',
    destination: 'mars',
    gravity_class: 'partial_gravity_mars',
    gravity_value_g: 0.38,
    external_environment_summary: 'Thin CO₂ exterior (~0.6 kPa), 0.38g gravity, moderate buoyant convection',
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

  // Current real-time scenario input
  const currentScenario: ScenarioInput = useMemo(() => ({
    material,
    objective,
    gravity_environment: gravityEnv,
    oxygen_pct: Number(oxygenPct),
    pressure_kpa: Number(pressureKpa),
    airflow_cm_s: Number(airflowCmS),
  }), [material, objective, gravityEnv, oxygenPct, pressureKpa, airflowCmS]);

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
    sessionStorage.setItem('ignis_current_scenario', JSON.stringify(currentScenario));
    navigate('/evidence', { state: { scenario: currentScenario } });
  };

  return (
    <div className="space-y-8 py-2 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="space-y-2 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-400">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>Interactive Simulator · Habitat Fire Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
          Habitat Combustion Simulator
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
          Tweak cabin atmosphere, destination gravity, and material samples. Watch how zero-gravity eliminates buoyant convection and alters flame physics in real time.
        </p>
      </div>

      {/* Step 1: Destination Preset Tabs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Orbit className="w-4 h-4 text-orange-400" />
            <span>Select Destination & Gravity Field</span>
          </span>
          <span>Click a destination to apply baseline atmosphere</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <button
                key={preset.slug}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border text-left flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {preset.display_name.split('(')[0].trim()}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {preset.gravity_value_g !== null ? `${preset.gravity_value_g}g Gravity` : '0g Microgravity'}
                    </span>
                  </div>
                </div>

                <Badge variant={isSelected ? 'flame' : 'neutral'} size="xs">
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </Badge>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Dual Workspace: Left Controls (6 cols) + Right Live Visualizer (6 cols) */}
      <form onSubmit={handleAnalyze} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Atmospheric & Material Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card variant="glass" padding="md" className="border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Atmosphere & Fuel Parameters
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Oxygen Percentage Control */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label htmlFor="oxygen-input" className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>Oxygen (O₂)</span>
                  <Badge variant={oxygenPct > 28 ? 'flame' : 'plasma'} size="xs">
                    {oxygenPct > 28 ? 'Enriched' : oxygenPct < 20 ? 'Hypoxic' : 'Nominal'}
                  </Badge>
                </label>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <input
                    id="oxygen-input"
                    type="number"
                    step="0.5"
                    min="15.0"
                    max="40.0"
                    value={oxygenPct}
                    onChange={(e) => setOxygenPct(parseFloat(e.target.value) || 0)}
                    className="w-14 px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-right text-orange-400 font-bold"
                  />
                  <span className="text-slate-400">%</span>
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

              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                <span>15% (Low)</span>
                <span className="text-slate-300">21% (Earth/ISS)</span>
                <span className="text-orange-400">32% (Artemis)</span>
                <span>40% (Max)</span>
              </div>
            </div>

            {/* Cabin Pressure Control */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label htmlFor="pressure-input" className="text-xs font-semibold text-white flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cabin Pressure</span>
                  <Badge variant="plasma" size="xs">
                    {pressureKpa < 80 ? 'Low Pressure' : 'Sea-Level'}
                  </Badge>
                </label>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <input
                    id="pressure-input"
                    type="number"
                    step="0.5"
                    min="40.0"
                    max="120.0"
                    value={pressureKpa}
                    onChange={(e) => setPressureKpa(parseFloat(e.target.value) || 0)}
                    className="w-14 px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-right text-sky-400 font-bold"
                  />
                  <span className="text-slate-400">kPa</span>
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

              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                <span>40 kPa (Min)</span>
                <span className="text-sky-400">56-70 kPa (Exploration)</span>
                <span className="text-slate-300">101.3 kPa (1 atm)</span>
                <span>120 kPa</span>
              </div>
            </div>

            {/* Airflow Velocity Control */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label htmlFor="airflow-input" className="text-xs font-semibold text-white flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Forced Ventilation Airflow</span>
                  {airflowCmS === 0 && (
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                      O₂ Starvation Risk
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <input
                    id="airflow-input"
                    type="number"
                    step="0.5"
                    min="0.0"
                    max="30.0"
                    value={airflowCmS}
                    onChange={(e) => setAirflowCmS(parseFloat(e.target.value) || 0)}
                    className="w-14 px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-right text-cyan-400 font-bold"
                  />
                  <span className="text-slate-400">cm/s</span>
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

              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                <span>0 cm/s (Stagnant)</span>
                <span className="text-cyan-400">5-10 cm/s (ISS Cabin Nominal)</span>
                <span>30 cm/s (High Duct)</span>
              </div>
            </div>

            {/* Material Selection */}
            <div className="space-y-1.5">
              <label htmlFor="material-select" className="text-xs font-semibold text-white block">
                Combustible Fuel Sample
              </label>
              <select
                id="material-select"
                value={material}
                onChange={(e) => setMaterial(e.target.value as MaterialFamily)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-orange-500"
              >
                {MATERIAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.notes}
                  </option>
                ))}
              </select>
            </div>

            {/* Scientific Objective */}
            <div className="space-y-1.5">
              <label htmlFor="objective-select" className="text-xs font-semibold text-white block">
                Scientific Focus
              </label>
              <select
                id="objective-select"
                value={objective}
                onChange={(e) => setObjective(e.target.value as ScientificObjective)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-orange-500"
              >
                {OBJECTIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Simulated Flame Reaction + Real-Time Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Live Dynamic Flame Chamber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Simulated Flame Chamber</span>
              </span>
              <span className="text-cyan-400 text-[11px]">Reacts live to sliders</span>
            </div>

            {/* Visual Flame Canvas Component */}
            <EvidenceGuidedVisualization
              scenario={currentScenario}
              comparableCount={10}
            />
          </div>

          {/* Real-time Physical Insights Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">CONVECTIVE TRANSPORT</span>
              <span className="text-white font-bold block truncate">
                {gravityEnv === 'microgravity'
                  ? 'Pure Molecular Diffusion'
                  : gravityEnv === 'partial_gravity_lunar'
                  ? 'Weak Lunar Buoyancy (0.16g)'
                  : 'Moderate Martian Buoyancy (0.38g)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">EXTINCTION BEHAVIOR</span>
              <span className={airflowCmS === 0 ? 'text-rose-400 font-bold block truncate' : 'text-emerald-400 font-bold block truncate'}>
                {airflowCmS === 0
                  ? 'Self-Suffocating (0 flow)'
                  : oxygenPct < 18
                  ? 'Flammability Boundary'
                  : 'Sustained Reaction'}
              </span>
            </div>
          </div>

          {/* Gravity Transfer Warning Card if Lunar / Mars */}
          {activePreset.gravity_value_g && activePreset.gravity_value_g > 0 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Gravity Transfer Warning:</strong> NASA flight experiments were conducted in 0g. Partial gravity ({activePreset.gravity_value_g}g) creates weak buoyancy that will cap match confidence at Medium.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Direct Zero-g Match:</strong> 100% compatible with NASA Saffire, BASS, and FLEX flight datasets.
              </p>
            </div>
          )}

          {/* Dual Action CTAs: Full Evidence Report & Ask AI */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-between shadow-lg shadow-orange-500/25"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              <span>Synthesize NASA Evidence Match</span>
            </Button>

            <Link
              to={`/ask?q=What+happens+to+${material}+flame+spread+at+${oxygenPct}%25+oxygen+and+${airflowCmS}+cm%2Fs+airflow+in+${gravityEnv}%3F`}
              className="w-full block"
            >
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full justify-center gap-2"
                icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              >
                <span>Ask IGNIS AI About This Scenario</span>
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HabitatBuilderPage;
