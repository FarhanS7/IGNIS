import React, { useState, useMemo } from 'react';
import {
  getDefaultMissions,
  rankMissionsByCoverage,
} from '../lib/gaps/gap_metrics';
import { MiniEnvelopePlot } from '../components/gaps/MiniEnvelopePlot';
import {
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ResearchGapsPage: React.FC = () => {
  const [radius, setRadius] = useState<number>(0.25);
  const [paramOverrides, setParamOverrides] = useState<
    Record<
      string,
      Partial<{
        oxygen_pct: number;
        pressure_kpa: number;
        flow_cm_s: number;
        gravity_g: number;
        material_family: string;
      }>
    >
  >({});
  const [expandedProvenance, setExpandedProvenance] = useState<Record<string, boolean>>({});

  const defaultMissions = useMemo(() => getDefaultMissions(), []);

  const rankedResults = useMemo(() => {
    return rankMissionsByCoverage(defaultMissions, radius, paramOverrides);
  }, [defaultMissions, radius, paramOverrides]);

  const toggleProvenance = (id: string) => {
    setExpandedProvenance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateParam = (scenarioId: string, param: string, val: any) => {
    setParamOverrides((prev) => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        [param]: val,
      },
    }));
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-3 text-amber-400 mb-2">
          <Compass className="w-6 h-6" />
          <span className="text-xs font-mono tracking-widest uppercase">
            NASA Flight Record Knowledge Gaps
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Exploration Mission Research Gap Ranking
        </h1>
        <p className="text-white/70 max-w-3xl text-sm sm:text-base leading-relaxed">
          Quantitative ranking of exploration operational atmospheres by empirical coverage in the
          tested NASA microgravity flight record (BASS-II, Saffire-I, Saffire-II). Scenarios are
          evaluated strictly against flight data without synthetic extrapolation.
        </p>
      </div>

      {/* Formula & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/[0.03] border border-white/10 rounded-xl p-5 backdrop-blur-md">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Transparent Evidence Coverage Formula</span>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-amber-200/90 overflow-x-auto">
            Coverage = 40% × Proximity + 30% × Density(R) + 15% × PressureRegime + 15% × GravityRegime
          </div>
          <ul className="text-xs text-white/60 space-y-1.5 list-disc list-inside">
            <li>
              <strong className="text-white/80">Proximity (40%):</strong> max(0, 1 − d<sub>min</sub>)
              where d = √[(ΔO₂/20%)² + (Δflow/40 cm/s)²] to nearest usable flight run.
            </li>
            <li>
              <strong className="text-white/80">Density (30%):</strong> min(1, N<sub>same</sub>(R) /
              5) count of same-material flight runs within radius R.
            </li>
            <li>
              <strong className="text-white/80">Pressure Regime (15%):</strong> 1.0 if nominal 1
              atm (101.3 kPa). <em>Pressure was never measured on microgravity solid flight runs</em>;
              hypobaric atmospheres (56–70 kPa) represent an unmeasured pressure gap.
            </li>
            <li>
              <strong className="text-white/80">Gravity Regime (15%):</strong> 1.0 if microgravity (0
              g). Partial-gravity missions (Moon 0.16 g, Mars 0.38 g) have 0 flight runs in the
              record.
            </li>
          </ul>
        </div>

        {/* Configurable Radius */}
        <div className="flex flex-col justify-between bg-black/40 border border-white/10 rounded-lg p-4">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-white mb-1">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Configurable Match Radius (R)
              </span>
              <span className="font-mono text-amber-400 text-sm font-bold">{radius.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-white/50 mb-3">
              Modulates local density threshold. Corresponds to ±{(radius * 20).toFixed(1)}% O₂ and
              ±{(radius * 40).toFixed(1)} cm/s flow.
            </p>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
              aria-label="Configurable Match Radius Slider"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40 flex justify-between">
            <span>Narrow (0.05)</span>
            <span>Nominal (0.25)</span>
            <span>Wide (0.50)</span>
          </div>
        </div>
      </div>

      {/* Ranked Scenario List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Ranked Exploration Scenarios ({rankedResults.length})
          </h2>
          <span className="text-xs font-mono text-white/50">Sorted by Evidence Coverage</span>
        </div>

        <div className="space-y-6">
          {rankedResults.map((result) => {
            const rawScenario = defaultMissions.find((m) => m.id === result.scenario_id)!;
            const isOutside =
              result.parameters.oxygen_pct > 30.7 ||
              result.parameters.oxygen_pct < 13.4 ||
              result.parameters.flow_cm_s > 40.0;
            const isExpanded = !!expandedProvenance[result.scenario_id];

            // Coverage badge color
            const badgeColor =
              result.evidence_coverage_pct >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : result.evidence_coverage_pct >= 40
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

            return (
              <div
                key={result.scenario_id}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all rounded-xl p-5 sm:p-6 space-y-5"
              >
                {/* Header row: Rank, Title, Coverage Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-sm">
                      #{result.rank}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{result.title}</h3>
                      <p className="text-xs text-white/60">{result.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-white/50">
                        Evidence Coverage
                      </div>
                      <div className="text-2xl font-mono font-bold text-white">
                        {result.evidence_coverage_pct.toFixed(1)}%
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-mono font-semibold ${badgeColor}`}
                    >
                      {result.evidence_coverage_pct >= 80
                        ? 'High Coverage'
                        : result.evidence_coverage_pct >= 40
                        ? 'Moderate Gap'
                        : 'Critical Gap'}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid: Mini Plot + 4 Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  {/* Mini-Envelope Plot */}
                  <div className="md:col-span-1">
                    <MiniEnvelopePlot
                      scenarioO2={result.parameters.oxygen_pct}
                      scenarioFlow={result.parameters.flow_cm_s}
                      radius={radius}
                      isOutside={isOutside}
                    />
                  </div>

                  {/* 4 Core Metrics */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    {/* Proximity / Nearest */}
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-[10px] text-white/50 uppercase font-mono mb-1">
                        Nearest Tested Flight Run
                      </div>
                      <div className="font-mono text-sm text-white font-semibold">
                        {result.nearest_run ? (
                          <span>
                            {result.nearest_run.run_uid} (dist {result.normalized_distance_to_nearest})
                          </span>
                        ) : (
                          'None'
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        {result.nearest_run
                          ? `${result.nearest_run.oxygen_pct}% O₂, ${result.nearest_run.flow_cm_s} cm/s (${result.nearest_run.material_family})`
                          : ''}
                      </div>
                    </div>

                    {/* Same Material Count */}
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-[10px] text-white/50 uppercase font-mono mb-1">
                        Same-Material Runs (R = {radius.toFixed(2)})
                      </div>
                      <div className="font-mono text-sm text-white font-semibold flex items-center gap-2">
                        <span>{result.same_material_runs_in_radius} runs</span>
                        {result.same_material_runs_in_radius < 3 ? (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                            Sparse
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/30">
                            Dense
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        Material: {result.parameters.material_family}
                      </div>
                    </div>

                    {/* Pressure Regime */}
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-[10px] text-white/50 uppercase font-mono mb-1">
                        Pressure Measurement
                      </div>
                      <div className="font-mono text-sm font-semibold flex items-center gap-1.5">
                        <span className="text-amber-400">Always No</span>
                        <span className="text-[10px] text-white/50 font-sans font-normal">
                          (assumed 1 atm)
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        {result.pressure_extrapolation ? (
                          <span className="text-rose-400">
                            Hypobaric extrapolation ({result.parameters.pressure_kpa} kPa)
                          </span>
                        ) : (
                          <span className="text-emerald-400">Nominal cabin baseline (101.3 kPa)</span>
                        )}
                      </div>
                    </div>

                    {/* Gravity Regime */}
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-[10px] text-white/50 uppercase font-mono mb-1">
                        Gravity Regime
                      </div>
                      <div className="font-mono text-sm font-semibold flex items-center gap-1.5">
                        {result.gravity_matches ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Microgravity (0 g)
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Partial ({result.parameters.gravity_g} g)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        {result.gravity_matches ? 'Matches flight archive' : '0 flight runs in record'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Templated Gap Closing Recommendation Box */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>What Experiment Would Close This Gap</span>
                  </div>
                  <ul className="text-xs text-amber-100/80 space-y-1 list-disc list-inside font-mono">
                    {result.gap_recommendations.map((rec, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Collapsible Parameter Provenance & Live Adjuster */}
                <div className="border-t border-white/10 pt-3">
                  <button
                    onClick={() => toggleProvenance(result.scenario_id)}
                    className="flex items-center justify-between w-full text-xs text-white/60 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Parameter Provenance &amp; Live Scenario Assumptions
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 pt-3 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Oxygen */}
                        <div className="bg-black/40 border border-white/10 rounded p-2.5 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-white/50">
                            <span>Oxygen Conc. (% O₂)</span>
                            <span className="font-mono text-amber-400">
                              {rawScenario.parameters.oxygen_pct.source_type}
                            </span>
                          </div>
                          <input
                            type="number"
                            step="0.5"
                            value={result.parameters.oxygen_pct}
                            onChange={(e) =>
                              updateParam(
                                result.scenario_id,
                                'oxygen_pct',
                                parseFloat(e.target.value) || 21.0
                              )
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                          />
                          <p className="text-[10px] text-white/60 italic leading-snug">
                            "{rawScenario.parameters.oxygen_pct.citation_text}"
                          </p>
                        </div>

                        {/* Pressure */}
                        <div className="bg-black/40 border border-white/10 rounded p-2.5 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-white/50">
                            <span>Pressure (kPa)</span>
                            <span className="font-mono text-amber-400">
                              {rawScenario.parameters.pressure_kpa.source_type}
                            </span>
                          </div>
                          <input
                            type="number"
                            step="1.0"
                            value={result.parameters.pressure_kpa}
                            onChange={(e) =>
                              updateParam(
                                result.scenario_id,
                                'pressure_kpa',
                                parseFloat(e.target.value) || 101.3
                              )
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                          />
                          <p className="text-[10px] text-white/60 italic leading-snug">
                            "{rawScenario.parameters.pressure_kpa.citation_text}"
                          </p>
                        </div>

                        {/* Flow */}
                        <div className="bg-black/40 border border-white/10 rounded p-2.5 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-white/50">
                            <span>Forced Flow (cm/s)</span>
                            <span className="font-mono text-amber-400">
                              {rawScenario.parameters.flow_cm_s.source_type}
                            </span>
                          </div>
                          <input
                            type="number"
                            step="0.5"
                            value={result.parameters.flow_cm_s}
                            onChange={(e) =>
                              updateParam(
                                result.scenario_id,
                                'flow_cm_s',
                                parseFloat(e.target.value) || 5.0
                              )
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                          />
                          <p className="text-[10px] text-white/60 italic leading-snug">
                            "{rawScenario.parameters.flow_cm_s.citation_text}"
                          </p>
                        </div>

                        {/* Gravity */}
                        <div className="bg-black/40 border border-white/10 rounded p-2.5 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-white/50">
                            <span>Gravity Regime (g)</span>
                            <span className="font-mono text-amber-400">
                              {rawScenario.parameters.gravity_g.source_type}
                            </span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={result.parameters.gravity_g}
                            onChange={(e) =>
                              updateParam(
                                result.scenario_id,
                                'gravity_g',
                                parseFloat(e.target.value) || 0.0
                              )
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                          />
                          <p className="text-[10px] text-white/60 italic leading-snug">
                            "{rawScenario.parameters.gravity_g.citation_text}"
                          </p>
                        </div>

                        {/* Material Family */}
                        <div className="bg-black/40 border border-white/10 rounded p-2.5 space-y-1 sm:col-span-2">
                          <div className="flex justify-between items-center text-[10px] text-white/50">
                            <span>Reference Fuel Family</span>
                            <span className="font-mono text-amber-400">
                              {rawScenario.parameters.material_family.source_type}
                            </span>
                          </div>
                          <select
                            value={result.parameters.material_family}
                            onChange={(e) =>
                              updateParam(result.scenario_id, 'material_family', e.target.value)
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                          >
                            <option value="PMMA">PMMA (Polymethylmethacrylate)</option>
                            <option value="Nomex">Nomex (Aramid Fabric)</option>
                            <option value="SIBAL">SIBAL (Cotton/Fiberglass blend)</option>
                            <option value="Wax">Wax / Candle</option>
                            <option value="Silicone">Silicone</option>
                          </select>
                          <p className="text-[10px] text-white/60 italic leading-snug">
                            "{rawScenario.parameters.material_family.citation_text}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResearchGapsPage;
