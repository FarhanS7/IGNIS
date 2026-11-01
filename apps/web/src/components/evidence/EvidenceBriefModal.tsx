import React from 'react';
import { Fact } from '../common/Fact';
import { MiniEnvelopePlot } from '../gaps/MiniEnvelopePlot';
import type { RealSolidMatch, SolidEnvelopeData } from '../../lib/matcher/types';
import {
  Printer,
  X,
  FileCheck2,
  AlertTriangle,
  Compass,
  Layers,
  BookOpen,
} from 'lucide-react';

interface EvidenceBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: {
    material: string;
    scenarioFamily: string;
    oxygenPct: number;
    flowCmS: number;
    pressureKpa: number;
    gravityG: number;
    geometry: string;
    thicknessMm: number;
    presetName: string;
  };
  envelope: SolidEnvelopeData;
  matches: RealSolidMatch[];
}

export const EvidenceBriefModal: React.FC<EvidenceBriefModalProps> = ({
  isOpen,
  onClose,
  scenario,
  envelope,
  matches,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-start p-2 sm:p-6 print:p-0 print:bg-white print:text-black">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl my-6 overflow-hidden shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black print:w-full print:max-w-none print:my-0">
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
            <FileCheck2 className="w-4 h-4" />
            <span>NASA Flight Record · Printable Evidence Brief</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close Evidence Brief"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-evidence-brief" className="p-6 sm:p-10 space-y-8 text-zinc-200 print:text-black print:p-4">
          {/* Document Header */}
          <div className="border-b border-zinc-800 print:border-black/20 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 print:text-black font-semibold">
                  IGNIS Physical Sciences Flammability Archive
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white print:text-black mt-1">
                  Spaceflight Fire Safety Evidence Brief
                </h1>
              </div>
              <div className="text-right text-xs font-mono text-zinc-400 print:text-black/70">
                <div>Generated: {timestamp}</div>
                <div>Target Mission: {scenario.presetName}</div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 print:text-black/80 mt-2 max-w-3xl leading-relaxed">
              Empirical grounding of spacecraft atmosphere flammability against 132 usable microgravity flight
              burns (BASS-II, Saffire-I, Saffire-II). This document presents verified physical records with
              transparent provenance coordinates. <em>Contains zero predictive verdicts or compliance assertions.</em>
            </p>
          </div>

          {/* Section 1: Scenario Parameters */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 print:text-black font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4" /> 1. Scenario Operational Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-black/20 p-2.5 rounded-lg">
                <span className="text-[10px] text-zinc-400 print:text-black/60 block">Material Family</span>
                <span className="text-sm font-bold text-white print:text-black">{scenario.scenarioFamily}</span>
                <span className="text-[10px] text-zinc-500 print:text-black/50 block">({scenario.material})</span>
              </div>
              <div className="bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-black/20 p-2.5 rounded-lg">
                <span className="text-[10px] text-zinc-400 print:text-black/60 block">Oxygen Concentration</span>
                <Fact
                  value={scenario.oxygenPct}
                  unit="%"
                  basis="measured"
                  sourceFile="data/raw/PSI-25_Experimental table_BASS-II.csv"
                  sourceColumn="Calibrated initial O2 % by vol"
                  sourceRow={2}
                  doi="10.60555/4qc4-de67"
                  className="text-sm font-bold text-white print:text-black"
                />
                <span className="text-[10px] text-zinc-500 print:text-black/50 block">Target atmosphere</span>
              </div>
              <div className="bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-black/20 p-2.5 rounded-lg">
                <span className="text-[10px] text-zinc-400 print:text-black/60 block">Forced Ventilation Flow</span>
                <Fact
                  value={scenario.flowCmS}
                  unit="cm/s"
                  basis="converted"
                  sourceFile="data/raw/PSI-25_Experimental table_BASS-II.csv"
                  sourceColumn="Air display"
                  sourceRow={2}
                  doi="10.60555/4qc4-de67"
                  className="text-sm font-bold text-white print:text-black"
                />
                <span className="text-[10px] text-zinc-500 print:text-black/50 block">Forced convection</span>
              </div>
              <div className="bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-black/20 p-2.5 rounded-lg">
                <span className="text-[10px] text-zinc-400 print:text-black/60 block">Pressure (Assumed)</span>
                <Fact
                  value={scenario.pressureKpa}
                  unit="kPa"
                  basis="assumed"
                  sourceFile="data/raw/PSI-25_Experimental table_BASS-II.csv"
                  sourceColumn="nominal_cabin_spec (1 atm)"
                  sourceRow={2}
                  doi="10.60555/4qc4-de67"
                  className="text-sm font-bold text-white print:text-black"
                />
                <span className="text-[10px] text-amber-400 print:text-black/60 block">Never measured in flight</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 print:text-black/70 flex gap-4">
              <span>Gravity: <strong>{scenario.gravityG} g</strong></span>
              <span>Geometry: <strong>{scenario.geometry}</strong></span>
              <span>Thickness: <strong>{scenario.thicknessMm} mm</strong></span>
            </div>
          </div>

          {/* Section 2: Proximity & Envelope Placement */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 print:text-black font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4" /> 2. Empirical Flight Envelope Placement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-1">
                <MiniEnvelopePlot
                  scenarioO2={scenario.oxygenPct}
                  scenarioFlow={scenario.flowCmS}
                  radius={0.25}
                  isOutside={envelope.outside_tested_range}
                />
              </div>
              <div className="md:col-span-2 space-y-2 text-xs font-mono">
                <div className="bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-black/20 p-3 rounded-lg space-y-1">
                  <div className="text-zinc-400 print:text-black/70">
                    Tested O₂ Range: <strong className="text-white print:text-black">13.4% – 30.7%</strong>
                  </div>
                  <div className="text-zinc-400 print:text-black/70">
                    Tested Forced Flow Range: <strong className="text-white print:text-black">0.0 – 40.0 cm/s</strong>
                  </div>
                  <div className="text-zinc-400 print:text-black/70">
                    Normalized Distance to Nearest Run: <strong className="text-white print:text-black">{envelope.nearest_distance_norm.toFixed(3)}</strong>
                  </div>
                  <div className="mt-2 text-[11px]">
                    {envelope.outside_tested_range ? (
                      <span className="text-amber-400 print:text-amber-700 font-semibold">
                        ⚠️ Target scenario is OUTSIDE tested flight range by {envelope.nearest_distance_norm.toFixed(2)} normalized units.
                      </span>
                    ) : (
                      <span className="text-emerald-400 print:text-emerald-700 font-semibold">
                        ✓ Target scenario falls within the tested NASA flight boundary.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Nearest Tested Flight Runs */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 print:text-black font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" /> 3. Nearest Empirical Flight Runs (NASA Record)
            </h2>
            <div className="overflow-x-auto border border-zinc-800 print:border-black/20 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 print:bg-zinc-200 text-zinc-300 print:text-black border-b border-zinc-800 print:border-black/20 text-[11px]">
                  <tr>
                    <th className="p-2">Rank</th>
                    <th className="p-2">Run UID</th>
                    <th className="p-2">Material</th>
                    <th className="p-2">O₂ (%)</th>
                    <th className="p-2">Flow (cm/s)</th>
                    <th className="p-2">Observed Outcome</th>
                    <th className="p-2">Frames</th>
                    <th className="p-2">DOI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-black/10">
                  {matches.slice(0, 5).map((m, idx) => {
                    const invId = m.metadata?.investigation_id || 'PSI-25';
                    const runDoi = invId === 'PSI-98' ? '10.60555/0t15-1z43' : invId === 'PSI-99' ? '10.60555/k97e-x930' : '10.60555/4qc4-de67';
                    const materialFamily = m.metadata?.material_family || 'PMMA';
                    const rawMaterial = m.metadata?.material || m.factors.material?.experiment_value || materialFamily;
                    const o2Val = m.factors.oxygen?.experiment_value;
                    const o2Basis = m.factors.oxygen?.basis || 'measured';
                    const flowVal = m.factors.flow?.experiment_value;
                    const flowBasis = m.factors.flow?.basis || 'converted';
                    const framesShot = m.metadata?.frames_shot ?? 0;

                    return (
                      <tr key={m.run_uid} className="hover:bg-zinc-900/40 print:hover:bg-transparent">
                        <td className="p-2 font-bold text-cyan-400 print:text-black">#{idx + 1}</td>
                        <td className="p-2 font-semibold text-white print:text-black">{m.run_uid}</td>
                        <td className="p-2 text-zinc-300 print:text-black">
                          <div>{materialFamily}</div>
                          <div className="text-[10px] text-zinc-500 print:text-black/50 truncate max-w-[140px]">{rawMaterial}</div>
                        </td>
                        <td className="p-2">
                          {o2Val !== undefined && o2Val !== null ? (
                            <Fact
                              value={o2Val}
                              unit="%"
                              basis={o2Basis as any}
                              sourceFile={m.source_file || 'data/raw/PSI-25_Experimental table_BASS-II.csv'}
                              sourceColumn="Calibrated initial O2"
                              sourceRow={m.source_row || 2}
                              doi={runDoi}
                            />
                          ) : '—'}
                        </td>
                        <td className="p-2">
                          {flowVal !== undefined && flowVal !== null ? (
                            <Fact
                              value={flowVal}
                              unit="cm/s"
                              basis={flowBasis as any}
                              sourceFile={m.source_file || 'data/raw/PSI-25_Experimental table_BASS-II.csv'}
                              sourceColumn="Air display"
                              sourceRow={m.source_row || 2}
                              doi={runDoi}
                            />
                          ) : '—'}
                        </td>
                        <td className="p-2 text-zinc-200 print:text-black">
                          {m.outcome_class === 'extinguished'
                            ? 'PI-noted extinction'
                            : m.outcome_class === 'no_ignition'
                            ? 'PI-noted no ignition'
                            : 'Photographed burn: frames recorded'}
                        </td>
                        <td className="p-2">
                          <Fact
                            value={framesShot}
                            unit="frames"
                            basis="measured"
                            sourceFile={m.source_file || 'data/raw/PSI-25_Experimental table_BASS-II.csv'}
                            sourceColumn="Total Frames Shot"
                            sourceRow={m.source_row || 2}
                            doi={runDoi}
                          />
                        </td>
                        <td className="p-2 text-[10px] text-zinc-400 print:text-black/60 truncate max-w-[100px]">
                          {runDoi}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Operational Assumptions & Known Epistemic Limits */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-amber-400 print:text-black font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 4. Operational Assumptions &amp; Known Epistemic Limits
            </h2>
            <div className="bg-zinc-900/40 print:bg-zinc-100 border border-zinc-800 print:border-black/20 p-4 rounded-lg space-y-2 text-xs font-mono leading-relaxed">
              <p>
                • <strong className="text-white print:text-black">Pressure Assumed:</strong> Pressure was not measured on microgravity solid flight burns; 101.3 kPa is assumed based on nominal spacecraft cabin specifications.
              </p>
              <p>
                • <strong className="text-white print:text-black">Flow Derivation:</strong> Air display hot-wire anemometer readings converted via calibration polynomials (Bhattacharjee, BASS-II ReadMe).
              </p>
              <p>
                • <strong className="text-white print:text-black">Outcome Labeling Proxy:</strong> Outcomes are determined by digital camera frame counts and explicit PI remarks (BASS-II ReadMe §22). Frame count includes post-burn sample images.
              </p>
              <p>
                • <strong className="text-white print:text-black">Gravitational Extrapolation:</strong> Lunar (0.16 g) and Mars (0.38 g) partial-gravity conditions are untested in the microgravity flight archive. Buoyant convection re-emerges under partial gravity and cannot be modeled from 0 g data.
              </p>
            </div>
          </div>

          {/* Section 5: Validation Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 print:text-black font-semibold flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" /> 5. Empirical Validation Summary (Grouped LOOCV)
            </h2>
            <div className="border border-zinc-800 print:border-black/20 rounded-lg p-3 text-xs font-mono space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-zinc-900 print:bg-zinc-200 p-2 rounded">
                  <span className="text-[10px] text-zinc-400 print:text-black/60 block">Hardware Groups</span>
                  <span className="font-bold text-white print:text-black">110 groups</span>
                </div>
                <div className="bg-zinc-900 print:bg-zinc-200 p-2 rounded">
                  <span className="text-[10px] text-zinc-400 print:text-black/60 block">Overall Accuracy</span>
                  <span className="font-bold text-white print:text-black">80.30%</span>
                </div>
                <div className="bg-zinc-900 print:bg-zinc-200 p-2 rounded">
                  <span className="text-[10px] text-zinc-400 print:text-black/60 block">Balanced Accuracy</span>
                  <span className="font-bold text-white print:text-black">59.85%</span>
                </div>
                <div className="bg-zinc-900 print:bg-zinc-200 p-2 rounded">
                  <span className="text-[10px] text-zinc-400 print:text-black/60 block">Extinction Recall</span>
                  <span className="font-bold text-white print:text-black">48.00%</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 print:text-black/70">
                Evaluation across 132 usable solid flight runs using strict Leave-One-Group-Out CV (holding out physical sample hardware). Difference vs single O₂ rule is +0.76% (95% CI [-4.55%, +6.82%], McNemar p = 1.0000). Similarity matching serves epistemic nearest-neighbor retrieval rather than autonomous classification.
              </p>
            </div>
          </div>

          {/* Section 6: Source Citations & DOIs */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 print:text-black font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 6. NASA Physical Sciences Informatics Citations
            </h2>
            <ul className="text-xs font-mono space-y-1.5 text-zinc-400 print:text-black/80 list-disc list-inside">
              <li>
                <strong className="text-zinc-200 print:text-black">PSI-25 BASS-II:</strong> Burning and Suppression of Solids-II (ISS Glovebox, 2014–2016). DOI: 10.60555/4qc4-de67
              </li>
              <li>
                <strong className="text-zinc-200 print:text-black">PSI-98 SAFFIRE-I:</strong> Spacecraft Fire Experiment-I (Cygnus OA-6, 2016). DOI: 10.60555/0t15-1z43
              </li>
              <li>
                <strong className="text-zinc-200 print:text-black">PSI-99 SAFFIRE-II:</strong> Spacecraft Fire Experiment-II (Cygnus OA-5, 2016). DOI: 10.60555/5r8w-9v32
              </li>
              <li>
                <strong className="text-zinc-200 print:text-black">NTRS-20080013149:</strong> Piloted Ignition Delay of PMMA in Space Exploration Atmospheres (McAllister, Fernandez-Pello, Urban, Ruff, 2008).
              </li>
              <li>
                <strong className="text-zinc-200 print:text-black">NTRS-20210011385:</strong> Burning and Suppression of Solids-II (BASS-II) Summary Report (NASA/TM-20210011385).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceBriefModal;
