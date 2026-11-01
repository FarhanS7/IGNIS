import React, { useState, useMemo } from 'react';
import {
  Orbit,
  Moon,
  Globe2,
  Sliders,
  Wind,
  Gauge,
  Flame,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TrustLedgerBar } from '../components/common/TrustLedgerBar';
import { EvidenceEnvelopePlot } from '../components/evidence/EvidenceEnvelopePlot';
import { WhatTheRecordSays } from '../components/evidence/WhatTheRecordSays';
import { RealMatchCard } from '../components/evidence/RealMatchCard';

import { RealSolidMatcher } from '../lib/matcher/real_solid_matcher';
import type { SolidScenarioInput, RawEvidenceSolidRun, MaterialMap } from '../lib/matcher/types';

import solidRunsData from '../data/evidence_solid.json';
import materialMapData from '../data/material_map.json';

interface DestinationPreset {
  id: string;
  name: string;
  destination: string;
  gravity_g: number;
  default_o2: number;
  default_pressure: number;
  default_flow: number;
  default_material: string;
  citation: string;
  notes: string;
}

const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    id: 'iss',
    name: 'ISS / Low Earth Orbit (~0 g)',
    destination: 'orbital',
    gravity_g: 0.0,
    default_o2: 21.0,
    default_pressure: 101.3,
    default_flow: 5.0,
    default_material: 'PMMA',
    citation: 'NASA-STD-3001 Vol 2 / ISS MSG nominal flight specifications',
    notes: 'Reference microgravity environment. Zero buoyancy; forced airflow dominates oxidizer transport.',
  },
  {
    id: 'lunar',
    name: 'Lunar Surface Habitat (0.16 g)',
    destination: 'moon',
    gravity_g: 0.16,
    default_o2: 34.0,
    default_pressure: 56.0,
    default_flow: 10.0,
    default_material: 'PMMA',
    citation: 'NASA SP-2013-4402 / NTRS-20080013149 (Piloted Ignition in Exploration Atmospheres)',
    notes: 'Exploration Atmosphere: 34% O₂ at 56.0 kPa (8.2 psia) for EVA prebreathe mitigation.',
  },
  {
    id: 'mars',
    name: 'Mars Surface Habitat (0.38 g)',
    destination: 'mars',
    gravity_g: 0.38,
    default_o2: 28.0,
    default_pressure: 70.3,
    default_flow: 10.0,
    default_material: 'Nomex',
    citation: 'NASA SP-2013-4402 / Human Integration Design Handbook (HIDH)',
    notes: 'Partial gravity habitat: 28% O₂ at 70.3 kPa (10.2 psia). Buoyant convection re-emerges.',
  },
];

const MATERIAL_FAMILIES = ['PMMA', 'SIBAL', 'Nomex', 'Silicone', 'Fabric/Polymer', 'Wax', 'Other'];

export const SimulatorPage: React.FC = () => {
  // Initialize matcher directly in client runtime
  const matcher = useMemo(() => {
    return new RealSolidMatcher(
      solidRunsData as unknown as RawEvidenceSolidRun[],
      materialMapData as unknown as MaterialMap
    );
  }, []);

  // Preset selection state
  const [selectedPreset, setSelectedPreset] = useState<DestinationPreset>(DESTINATION_PRESETS[0]);

  // Operational Scenario Inputs
  const [material, setMaterial] = useState<string>('PMMA');
  const [oxygenPct, setOxygenPct] = useState<number>(21.0);
  const [flowCmS, setFlowCmS] = useState<number>(5.0);
  const [pressureKpa, setPressureKpa] = useState<number>(101.3);
  const [gravityG, setGravityG] = useState<number>(0.0);
  const [geometry, setGeometry] = useState<string>('flat');
  const [thicknessMm, setThicknessMm] = useState<number>(0.4);

  // Apply destination preset
  const handleApplyPreset = (preset: DestinationPreset) => {
    setSelectedPreset(preset);
    setOxygenPct(preset.default_o2);
    setPressureKpa(preset.default_pressure);
    setFlowCmS(preset.default_flow);
    setMaterial(preset.default_material);
    setGravityG(preset.gravity_g);
  };

  // Run client-side TypeScript RealSolidMatcher
  const matchResult = useMemo(() => {
    const scenario: SolidScenarioInput = {
      material,
      oxygen_pct: Number(oxygenPct),
      flow_cm_s: Number(flowCmS),
      pressure_kpa: Number(pressureKpa),
      gravity_g: Number(gravityG),
      geometry,
      thickness_mm: Number(thicknessMm),
    };

    return matcher.match(scenario, null, 5);
  }, [matcher, material, oxygenPct, flowCmS, pressureKpa, gravityG, geometry, thicknessMm]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between">
      {/* Top Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Flame className="w-5 h-5 text-cyan-400" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                IGNIS Spacecraft Fire Safety Evidence Simulator
              </h1>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Empirical grounding on 132 usable NASA PSI microgravity flight runs (BASS-II, Saffire-I, Saffire-II)
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              Active Presets: <strong className="text-cyan-400">{selectedPreset.name.split('(')[0]}</strong>
            </span>
          </div>
        </div>

        {/* Dynamic Trust Ledger Bar */}
        <TrustLedgerBar />
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* Preset Selector Banner */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Exploration Habitat Presets (Atmosphere Defaults from Corpus Documents)
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Presets apply verified atmospheric benchmarks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            {DESTINATION_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/30'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                      {p.id === 'iss' && <Orbit className="w-4 h-4 text-cyan-400" />}
                      {p.id === 'lunar' && <Moon className="w-4 h-4 text-cyan-400" />}
                      {p.id === 'mars' && <Globe2 className="w-4 h-4 text-cyan-400" />}
                      {p.name.split('(')[0]}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-400 text-black">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-300">
                    O₂: <strong className="text-zinc-100">{p.default_o2}%</strong> • Flow:{' '}
                    <strong className="text-zinc-100">{p.default_flow} cm/s</strong> • P:{' '}
                    <strong className="text-zinc-100">{p.default_pressure} kPa</strong>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    Source: {p.citation}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Layout: Controls on Left, Visualizations & Evidence on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter Sliders & Inputs (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-mono">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-semibold text-zinc-100">Scenario Parameters</h2>
                </div>
                <button
                  onClick={() => handleApplyPreset(selectedPreset)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-cyan-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Material Family Dropdown */}
              <div className="space-y-2 font-mono text-xs">
                <label className="text-zinc-300 font-semibold block">Solid Fuel Material Family</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {MATERIAL_FAMILIES.map((fam) => (
                    <option key={fam} value={fam}>
                      {fam}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-400 block">
                  Mapped via standardized material taxonomy (`material_map.json`)
                </span>
              </div>

              {/* Oxygen Concentration Slider */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-semibold">Oxygen Concentration (O₂)</span>
                  <span className="text-sm font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {oxygenPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max="40.0"
                  step="0.5"
                  value={oxygenPct}
                  onChange={(e) => setOxygenPct(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>10% (Hypoxic)</span>
                  <span>21% (ISS)</span>
                  <span>34% (Exploration)</span>
                  <span>40%</span>
                </div>
              </div>

              {/* Forced Airflow Velocity Slider */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    Forced Airflow Velocity
                  </span>
                  <span className="text-sm font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {flowCmS.toFixed(1)} cm/s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="35.0"
                  step="0.5"
                  value={flowCmS}
                  onChange={(e) => setFlowCmS(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>0 cm/s (Quiescent)</span>
                  <span>5 cm/s (Cabin nominal)</span>
                  <span>28 cm/s (Max tested)</span>
                  <span>35 cm/s</span>
                </div>
              </div>

              {/* Cabin Pressure Input */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    Cabin Pressure
                  </span>
                  <span className="text-sm font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {pressureKpa.toFixed(1)} kPa
                  </span>
                </div>
                <input
                  type="range"
                  min="30.0"
                  max="105.0"
                  step="1.0"
                  value={pressureKpa}
                  onChange={(e) => setPressureKpa(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>56 kPa (Lunar Hab)</span>
                  <span>70.3 kPa (Mars Hab)</span>
                  <span>101.3 kPa (1 atm)</span>
                </div>
                <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-[11px] text-amber-300/90 leading-tight">
                  Notice: No solid-fuel flight run measured pressure; this is untested in flight data.
                </div>
              </div>

              {/* Geometry & Thickness Selection */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Geometry</label>
                  <select
                    value={geometry}
                    onChange={(e) => setGeometry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="flat">flat sheet / film</option>
                    <option value="rod">cylindrical rod</option>
                    <option value="sphere">sphere</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Thickness (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="40.0"
                    value={thicknessMm}
                    onChange={(e) => setThicknessMm(parseFloat(e.target.value) || 0.4)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Gravity Regime Display */}
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs font-mono space-y-1">
                <div className="text-zinc-400 text-[11px]">Gravitational Environment:</div>
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>{selectedPreset.name}</span>
                  <span className="text-cyan-400">{gravityG} g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Evidence Visualizations & Match Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Centerpiece: Evidence Envelope Plot */}
            <EvidenceEnvelopePlot
              envelope={matchResult.envelope}
              matches={matchResult.matches}
              scenarioO2={oxygenPct}
              scenarioFlow={flowCmS}
              scenarioMaterial={material}
              scenarioPressure={pressureKpa}
              scenarioGravity={gravityG}
            />

            {/* What the Record Says (replaces Fire Behavior Profile) */}
            <WhatTheRecordSays
              matches={matchResult.matches}
              envelope={matchResult.envelope}
              topK={5}
              scenarioMaterial={material}
              scenarioFamily={
                (materialMapData as Record<string, any>)[material]?.family || material
              }
            />

            {/* Ranked Empirical Flight Match Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-zinc-100">
                    Ranked Flight Evidence Matches (Top 5 of {matchResult.total_evaluated} Usable Runs)
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">Click any value to audit provenance row</span>
              </div>

              <div className="space-y-3">
                {matchResult.matches.map((m, idx) => (
                  <RealMatchCard
                    key={m.run_uid}
                    match={m}
                    rank={idx + 1}
                    scenarioFamily={
                      (materialMapData as Record<string, any>)[material]?.family || material
                    }
                    isOutsideEnvelope={matchResult.envelope.outside_tested_range}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
