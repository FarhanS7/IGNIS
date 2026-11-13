import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import type { RealSolidMatch, RealSolidMatchResult, SolidScenarioInput } from '../../lib/matcher/types';
import {
  TESTED_O2_MIN,
  TESTED_O2_MAX,
  TESTED_FLOW_MIN,
  TESTED_FLOW_MAX,
} from '../../lib/matcher/real_solid_matcher';
import { getInvestigationDoi } from '../../lib/matcher/investigationDoi';
import { formatHowClose } from '../../content/glossary';
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
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { openDrawer } = useTrustLedger();

  const isMoonOrMars = (scenario.gravity_g !== undefined && scenario.gravity_g !== null && scenario.gravity_g > 0) || activePresetSlug === 'moon' || activePresetSlug === 'mars';
  const isO2Outside = scenario.oxygen_pct < TESTED_O2_MIN || scenario.oxygen_pct > TESTED_O2_MAX;
  const isFlowOutside = scenario.flow_cm_s < TESTED_FLOW_MIN || scenario.flow_cm_s > TESTED_FLOW_MAX;
  const isOutside = matchResult.envelope.outside_tested_range || isMoonOrMars || isO2Outside || isFlowOutside;

  const outReasons: string[] = [];
  if (isO2Outside) {
    if (scenario.oxygen_pct > TESTED_O2_MAX) {
      outReasons.push(`Oxygen ${scenario.oxygen_pct}% is above the tested ${TESTED_O2_MIN.toFixed(1)}–${TESTED_O2_MAX.toFixed(1)}%.`);
    } else {
      outReasons.push(`Oxygen ${scenario.oxygen_pct}% is below the tested ${TESTED_O2_MIN.toFixed(1)}–${TESTED_O2_MAX.toFixed(1)}%.`);
    }
  }
  if (isMoonOrMars) {
    outReasons.push('All NASA tests were in zero gravity.');
  }
  if (isFlowOutside) {
    if (scenario.flow_cm_s > TESTED_FLOW_MAX) {
      outReasons.push(`Fan speed ${scenario.flow_cm_s} cm/s is above the tested ${TESTED_FLOW_MIN.toFixed(1)}–${TESTED_FLOW_MAX.toFixed(1)} cm/s.`);
    } else {
      outReasons.push(`Fan speed ${scenario.flow_cm_s} cm/s is below the tested ${TESTED_FLOW_MIN.toFixed(1)}–${TESTED_FLOW_MAX.toFixed(1)} cm/s.`);
    }
  }

  const headlineSentence = isOutside
    ? "NASA hasn't tested this setup."
    : 'NASA tested something close to this.';

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
      doi: getInvestigationDoi(inv),
      investigationId: inv,
      notes: `Recorded in ${inv} flight table. O2=${o2Val}%, Flow=${flowVal} cm/s.`,
    });
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 text-slate-100 shadow-xl">
      {/* Top Headline Sentence & Out-of-range reason */}
      <div className={`p-4 rounded-xl border ${isOutside ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-950/60 border-cyan-500/30'}`}>
        <p className="text-base sm:text-lg font-semibold text-white leading-snug">
          {headlineSentence}
        </p>
        {isOutside && outReasons.length > 0 && (
          <p className="text-xs text-amber-300/90 mt-1.5 leading-relaxed flex items-start gap-1.5 font-sans">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <span>{outReasons.join(' ')}</span>
          </p>
        )}
      </div>

      {/* Closest NASA tests (Up to 3 cards) */}
      <div className="space-y-2.5">
        <div className="text-xs text-slate-400 font-medium">
          <span>Closest NASA tests</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {top3.map((match) => {
            const outcomeText =
              match.outcome_class === 'frames_recorded'
                ? 'Flame recorded on camera'
                : match.outcome_class === 'extinguished'
                  ? 'Went out'
                  : "Didn't light";

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

            const matFamily = getMaterialFamily(match);
            const o2Val = getO2(match);
            const flowVal = getFlow(match);

            const isDiffMaterial =
              scenario.material &&
              matFamily &&
              scenario.material.toLowerCase() !== matFamily.toLowerCase();

            const whyDetails: string[] = [];
            if (isDiffMaterial) {
              whyDetails.push('Different material');
            } else {
              whyDetails.push('Same material');
            }
            if (Math.abs(o2Val - scenario.oxygen_pct) <= 1.0) whyDetails.push(`Near-identical O₂ (${o2Val}%)`);
            else whyDetails.push(`O₂ ${o2Val}%`);
            if (Math.abs(flowVal - scenario.flow_cm_s) <= 2.0) whyDetails.push(`Similar fan speed (${flowVal} cm/s)`);

            return (
              <div
                key={match.run_uid}
                className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="text-white font-medium">
                    <span>{match.metadata?.raw_material || matFamily}</span>
                    <span className="text-slate-400 font-normal"> · {o2Val}% O₂ · Fan: {flowVal} cm/s</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    <span>Why similar: </span>
                    <span className="text-slate-300">{whyDetails.join(' · ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${outcomeColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span>{outcomeText}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenRunSource(match)}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white underline decoration-cyan-500/40 underline-offset-2 cursor-pointer font-medium"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small Caption */}
        <p className="text-xs text-slate-400 pt-1 font-sans">
          Shows what NASA tested, not what will happen.
        </p>
      </div>

      {/* Collapsible Details (Closed by default) */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Show the numbers behind this</span>
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
              <span className="font-semibold text-slate-300">Validation & Epistemic Boundaries</span>
              <p className="leading-relaxed">
                Evaluated across 132 microgravity flight runs in 110 independent hardware groups. Grouped leave-one-group-out cross-validation yields 80.30% overall accuracy (106/132), 46.72% balanced accuracy, and 48.00% extinction recall (12/25). Multi-factor matching demonstrates no statistically significant advantage over a single O₂-threshold rule (p = 1.0000; earlier higher figures from ungrouped CV had sample leakage and were retracted). The engine operates strictly as an empirical evidence locator to inspect real flight records, not an autonomous outcome predictor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
