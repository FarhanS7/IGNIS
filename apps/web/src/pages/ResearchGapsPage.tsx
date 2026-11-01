import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getDefaultMissions,
  rankMissionsByCoverage,
  type GapAnalysisResult,
} from '../lib/gaps/gap_metrics';
import { MiniEnvelopePlot } from '../components/gaps/MiniEnvelopePlot';
import {
  AlertTriangle,
  Sliders,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

export const ResearchGapsPage: React.FC = () => {
  const [radius, setRadius] = useState<number>(0.25);
  const [paramOverrides] = useState<
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
  const [showHowWeDecide, setShowHowWeDecide] = useState<boolean>(false);
  const [expandedCard, setExpandedCard] = useState<Record<string, boolean>>({});

  const defaultMissions = useMemo(() => getDefaultMissions(), []);

  const rankedResults = useMemo(() => {
    return rankMissionsByCoverage(defaultMissions, radius, paramOverrides);
  }, [defaultMissions, radius, paramOverrides]);

  const toggleExpand = (id: string) => {
    setExpandedCard((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getVerdict = (res: GapAnalysisResult) => {
    const pct = res.evidence_coverage_pct;
    if (pct >= 65) {
      return {
        label: 'Well tested',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        summary: 'NASA has run dozens of flight tests matching these conditions.',
      };
    } else if (pct >= 35) {
      return {
        label: 'Partly tested',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        summary: 'Some factors match, but pressure or oxygen are untested in orbit.',
      };
    } else {
      return {
        label: 'Barely tested',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        summary: 'NASA has never tested fires in this gravity or atmosphere.',
      };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>NASA Flight Record · What’s Untested</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
          Where Are the Blind Spots?
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          NASA has run 132 solid fire experiments in orbit. But future habitats (the Moon, Mars, Gateway) use
          atmospheres and gravities that have never been tested. Here is how well-tested each future destination actually is.
        </p>
      </div>

      {/* 5 Friendly Cards */}
      <div className="space-y-4">
        {rankedResults.map((mission) => {
          const verdict = getVerdict(mission);
          const isExpanded = !!expandedCard[mission.scenario_id];

          return (
            <div
              key={mission.scenario_id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-cyan-500/40 transition-colors shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                      {mission.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${verdict.badgeClass}`}>
                      {verdict.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({mission.evidence_coverage_pct}% coverage)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {verdict.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/simulator?destination=${
                      mission.scenario_id.includes('lunar') || mission.scenario_id.includes('moon')
                        ? 'moon'
                        : mission.scenario_id.includes('mars')
                        ? 'mars'
                        : 'orbital'
                    }&oxygen=${mission.parameters.oxygen_pct}&pressure=${mission.parameters.pressure_kpa}&airflow=${mission.parameters.flow_cm_s}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-medium transition-colors"
                  >
                    <span>Test in simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleExpand(mission.scenario_id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Conditions bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                <div className="p-2 rounded bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Oxygen</span>
                  <span className="text-white font-bold">{mission.parameters.oxygen_pct}%</span>
                </div>
                <div className="p-2 rounded bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Pressure</span>
                  <span className="text-white font-bold">{mission.parameters.pressure_kpa} kPa</span>
                </div>
                <div className="p-2 rounded bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Gravity</span>
                  <span className="text-white font-bold">{mission.parameters.gravity_g}g</span>
                </div>
                <div className="p-2 rounded bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Airflow</span>
                  <span className="text-white font-bold">{mission.parameters.flow_cm_s} cm/s</span>
                </div>
              </div>

              {/* Expandable Technical Details */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-800 space-y-3 text-xs text-slate-300">
                  <p className="leading-relaxed text-slate-300">
                    {mission.description}
                  </p>

                  {/* Recommendations / Blind Spot Warnings */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Missing Flight Data:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90 leading-relaxed">
                      {mission.gap_recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Mini Scatter Plot */}
                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-white block">Where this sits relative to NASA flight tests:</span>
                    <MiniEnvelopePlot
                      scenarioO2={mission.parameters.oxygen_pct}
                      scenarioFlow={mission.parameters.flow_cm_s}
                      radius={mission.radius}
                      isOutside={mission.normalized_distance_to_nearest > 0.3}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsed "How we decide" section */}
      <div className="pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowHowWeDecide(!showHowWeDecide)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>How we decide: Mathematical Evidence Coverage Index</span>
          </div>
          {showHowWeDecide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHowWeDecide && (
          <div className="p-5 mt-2 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-black/60 font-mono text-cyan-300 border border-cyan-900/40 text-xs">
              Coverage = 40% × Proximity + 30% × Density(R) + 15% × PressureRegime + 15% × GravityRegime
            </div>

            <ul className="space-y-2 list-disc list-inside text-slate-400 text-xs leading-relaxed">
              <li>
                <strong className="text-white">Proximity (40%):</strong> Measures how close the scenario’s oxygen and airflow are to the nearest tested NASA flight run.
              </li>
              <li>
                <strong className="text-white">Density (30%):</strong> Counts how many real flight runs exist nearby with the same fuel material.
              </li>
              <li>
                <strong className="text-white">Pressure Regime (15%):</strong> Evaluates if chamber pressure was verified. NASA did not measure chamber pressure during solid burns; all runs assumed 101.3 kPa.
              </li>
              <li>
                <strong className="text-white">Gravity Regime (15%):</strong> 1.0 for space station freefall (0g). Zero flight runs exist in Moon (0.16g) or Mars (0.38g) gravity.
              </li>
            </ul>

            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sensitivity radius:</span>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                className="w-32 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono text-white">{radius}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchGapsPage;
