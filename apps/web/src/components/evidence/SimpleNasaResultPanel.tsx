import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import type { RealSolidMatch, RealSolidMatchResult, SolidScenarioInput } from '../../lib/matcher/types';
import { OUTCOME_FRIENDLY_LABELS, formatHowClose } from '../../content/glossary';
import { EvidenceEnvelopePlot } from './EvidenceEnvelopePlot';
import { useTrustLedger } from '../../context/TrustLedgerContext';

interface Props {
  matchResult: RealSolidMatchResult;
  scenario: SolidScenarioInput;
  activePresetSlug?: string;
  onExportBrief?: () => void;
}

export const SimpleNasaResultPanel: React.FC<Props> = ({
  matchResult,
  scenario,
  activePresetSlug = 'orbital',
  onExportBrief,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { openDrawer } = useTrustLedger();

  const isMoonOrMars = (scenario.gravity_g !== undefined && scenario.gravity_g !== null && scenario.gravity_g > 0) || activePresetSlug === 'moon' || activePresetSlug === 'mars';
  const isO2High = scenario.oxygen_pct > 22.2;
  const isO2Low = scenario.oxygen_pct < 13.6;
  const isFlowOutside = scenario.flow_cm_s > 28.2 || scenario.flow_cm_s < 0;
  const isOutside = matchResult.envelope.outside_tested_range || isMoonOrMars || isO2High || isO2Low || isFlowOutside;

  // Compute plain headline
  let headlineSentence = '';
  let missingReason = '';

  if (isOutside) {
    headlineSentence = "NASA hasn't tested anything close to this yet.";
    if (isMoonOrMars) {
      missingReason = 'All 132 flight tests were in space station freefall (0g). None were conducted on the Moon (0.16g) or Mars (0.38g).';
    } else if (isO2High) {
      missingReason = 'No flight tests exist above 22.2% oxygen in this record (tested flights ranged from 13.6% to 22.2% O₂).';
    } else if (isO2Low) {
      missingReason = 'No flight tests exist below 13.6% oxygen in this record.';
    } else if (isFlowOutside) {
      missingReason = 'Airflow is outside the tested flight range (0.0 to 28.2 cm/s).';
    } else {
      missingReason = 'These conditions are outside the range NASA has tested in orbit.';
    }
  } else {
    // Count matches in range
    const closeMatches = matchResult.matches.filter((m) => m.similarity >= 0.75);
    const pool = closeMatches.length > 0 ? closeMatches : matchResult.matches.slice(0, 5);
    const totalCount = pool.length;
    const burnedCount = pool.filter((m) => m.outcome_class === 'frames_recorded').length;
    const extinguishedCount = pool.filter((m) => m.outcome_class === 'extinguished').length;
    const noIgnCount = pool.filter((m) => m.outcome_class === 'no_ignition').length;

    const parts: string[] = [];
    if (burnedCount > 0) parts.push(`in ${burnedCount} a flame was photographed`);
    if (extinguishedCount > 0) parts.push(`in ${extinguishedCount} the flame went out`);
    if (noIgnCount > 0) parts.push(`in ${noIgnCount} no flame started`);

    headlineSentence = `NASA tested conditions close to this ${totalCount} times. ${parts.length > 0 ? parts.join('; ') + '.' : ''}`;
  }

  // Top 3 closest runs
  const top3 = matchResult.matches.slice(0, 3);

  const getInvestigation = (match: RealSolidMatch): string => {
    return match.metadata?.investigation_id || (match.source_file.includes('BASS') ? 'BASS-II' : 'Saffire');
  };

  const getMaterialFamily = (match: RealSolidMatch): string => {
    return match.metadata?.material_family || match.factors?.material?.experiment_value || 'PMMA';
  };

  const getO2 = (match: RealSolidMatch): number => {
    return match.factors?.oxygen?.experiment_value ?? 21.0;
  };

  const getFlow = (match: RealSolidMatch): number => {
    return match.factors?.flow?.experiment_value ?? 5.0;
  };

  const handleOpenRunSource = (match: RealSolidMatch) => {
    const inv = getInvestigation(match);
    const o2Val = getO2(match);
    const flowVal = getFlow(match);
    openDrawer({
      id: `${match.source_file}:${match.source_row}`,
      label: `${inv} · Row ${match.source_row}`,
      value: match.metadata?.outcome_raw || match.outcome_class,
      basis: 'measured',
      sourceFile: match.source_file,
      sourceColumn: 'Outcome / Nikon frames',
      sourceRow: match.source_row,
      doi: inv === 'BASS-II' ? '10.60555/4qc4-de67' : '10.60555/0t15-1z43',
      investigationId: inv,
      notes: `Recorded in ${inv} flight table. O2=${o2Val}%, Flow=${flowVal} cm/s.`,
    });
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-5 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
            <span>What did NASA actually see?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on 132 real spaceflight tests from BASS-II and Saffire missions.
          </p>
        </div>
        {onExportBrief && (
          <button
            type="button"
            onClick={onExportBrief}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Brief</span>
          </button>
        )}
      </div>

      {/* Top Headline Sentence */}
      <div className={`p-4 rounded-xl border ${isOutside ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-950/60 border-cyan-500/30'}`}>
        <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
          {headlineSentence}
        </p>
        {isOutside && (
          <p className="text-xs text-amber-300/90 mt-1.5 leading-relaxed flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <span>{missingReason}</span>
          </p>
        )}
      </div>

      {/* Closest Real NASA Tests (Up to 3 cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{isOutside ? 'Closest tested conditions in space:' : 'Closest real NASA tests:'}</span>
          <span className="font-mono text-[11px] text-cyan-400">Top {top3.length} tests</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {top3.map((match) => {
            const friendlyOutcome = OUTCOME_FRIENDLY_LABELS[match.outcome_class] || match.outcome_class;
            const outcomeColor =
              match.outcome_class === 'frames_recorded'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : match.outcome_class === 'extinguished'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/30';

            const dotColor =
              match.outcome_class === 'frames_recorded'
                ? 'bg-emerald-400'
                : match.outcome_class === 'extinguished'
                ? 'bg-amber-400'
                : 'bg-purple-400';

            const inv = getInvestigation(match);
            const matFamily = getMaterialFamily(match);
            const o2Val = getO2(match);
            const flowVal = getFlow(match);

            const isDiffMaterial =
              scenario.material &&
              matFamily &&
              scenario.material.toLowerCase() !== matFamily.toLowerCase();

            return (
              <div
                key={match.run_uid}
                className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inv}</span>
                    <span className="text-slate-400 font-mono text-[11px]">Row {match.source_row}</span>
                    {isDiffMaterial && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-950/60 text-amber-300 border border-amber-700/50">
                        diff material
                      </span>
                    )}
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <span className="text-slate-400">Material:</span> {match.metadata?.raw_material || matFamily} ·{' '}
                    <span className="text-slate-400">Oxygen:</span> {o2Val}% ·{' '}
                    <span className="text-slate-400">Airflow:</span> {flowVal} cm/s
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${outcomeColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span>{friendlyOutcome}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenRunSource(match)}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white underline decoration-cyan-500/40 underline-offset-2 cursor-pointer font-medium"
                  >
                    <span>See source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapsible Details (Closed by default) */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Show the details (range plot, factors, assumed pressure notice)</span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="pt-4 space-y-5 text-xs text-slate-300 border-t border-white/5 mt-2">
            {/* Range Scatter Plot */}
            <div className="space-y-1.5">
              <span className="font-semibold text-white block">Range NASA has tested (O₂ vs Airflow)</span>
              <p className="text-[11px] text-slate-400">
                The cyan circle marks your settings. Colored dots show actual spaceflight runs.
              </p>
              <div className="h-64 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                <EvidenceEnvelopePlot
                  envelope={matchResult.envelope}
                  matches={matchResult.matches}
                  scenarioO2={scenario.oxygen_pct}
                  scenarioFlow={scenario.flow_cm_s}
                  scenarioMaterial={scenario.material}
                  scenarioPressure={scenario.pressure_kpa}
                  scenarioGravity={scenario.gravity_g}
                />
              </div>
            </div>

            {/* Factor Comparison Table */}
            <div className="space-y-1.5">
              <span className="font-semibold text-white block">How close the top match is</span>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Factor</th>
                      <th className="p-2.5">Your Setting</th>
                      <th className="p-2.5">Closest Test</th>
                      <th className="p-2.5">Difference</th>
                      <th className="p-2.5">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-2.5 text-white">Oxygen</td>
                      <td className="p-2.5">{scenario.oxygen_pct}%</td>
                      <td className="p-2.5">{top3[0] ? getO2(top3[0]) : '-'}%</td>
                      <td className="p-2.5">Δ {top3[0] ? Math.abs(scenario.oxygen_pct - getO2(top3[0])).toFixed(1) : '-'}%</td>
                      <td className="p-2.5 text-cyan-400">
                        {top3[0] ? formatHowClose(top3[0].factors?.oxygen?.similarity ?? 0.8) : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-white">Airflow</td>
                      <td className="p-2.5">{scenario.flow_cm_s} cm/s</td>
                      <td className="p-2.5">{top3[0] ? getFlow(top3[0]) : '-'} cm/s</td>
                      <td className="p-2.5">Δ {top3[0] ? Math.abs(scenario.flow_cm_s - getFlow(top3[0])).toFixed(1) : '-'} cm/s</td>
                      <td className="p-2.5 text-cyan-400">
                        {top3[0] ? formatHowClose(top3[0].factors?.flow?.similarity ?? 0.8) : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-white">Material</td>
                      <td className="p-2.5">{scenario.material}</td>
                      <td className="p-2.5">{top3[0] ? getMaterialFamily(top3[0]) : '-'}</td>
                      <td className="p-2.5">—</td>
                      <td className="p-2.5 text-cyan-400">
                        {top3[0] && getMaterialFamily(top3[0]).toLowerCase() === scenario.material.toLowerCase() ? 'Exact family' : 'Different'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pressure & Epistemic Notice */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Assumed Pressure Notice</span>
              </span>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                In BASS-II and Saffire solid combustion runs, NASA did not measure chamber pressure during burns;
                standard cabin pressure of 101.3 kPa was assumed. We do not score pressure as a matched factor.
              </p>
            </div>

            {/* Validation Note */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Validation & Accuracy</span>
              <p className="leading-relaxed">
                Evaluated across 132 microgravity flight runs. Leave-one-group-out cross-validation yields 77.5% balanced accuracy and 84.4% extinction recall.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
