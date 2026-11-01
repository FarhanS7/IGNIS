import React, { useState } from 'react';
import type { RealSolidMatch, SolidEnvelopeData } from '../../lib/matcher/types';
import { BookOpen, MapPin, AlertTriangle, Filter, CheckCircle2 } from 'lucide-react';

interface WhatTheRecordSaysProps {
  matches: RealSolidMatch[];
  envelope: SolidEnvelopeData;
  topK?: number;
  scenarioMaterial?: string;
  scenarioFamily?: string;
}

export const WhatTheRecordSays: React.FC<WhatTheRecordSaysProps> = ({
  matches,
  envelope,
  topK = 5,
  scenarioMaterial = 'PMMA',
  scenarioFamily = 'PMMA',
}) => {
  // Default: exclude mismatched materials from record counts
  const [includeDifferentMaterials, setIncludeDifferentMaterials] = useState<boolean>(false);

  // Envelope boundary calculation
  const scenarioO2 = envelope.scenario_point.oxygen_pct;
  const scenarioFlow = envelope.scenario_point.flow_cm_s;
  const minO2 = envelope.tested_range_o2[0];
  const maxO2 = envelope.tested_range_o2[1];
  const minFlow = envelope.tested_range_flow[0];
  const maxFlow = envelope.tested_range_flow[1];

  const outsideAxes: string[] = [];
  if (scenarioO2 < minO2) {
    outsideAxes.push(`Oxygen is ${(minO2 - scenarioO2).toFixed(1)}% below tested min (${minO2}%)`);
  } else if (scenarioO2 > maxO2) {
    outsideAxes.push(`Oxygen is ${(scenarioO2 - maxO2).toFixed(1)}% above tested max (${maxO2}%)`);
  }
  if (scenarioFlow < minFlow) {
    outsideAxes.push(`Flow is ${(minFlow - scenarioFlow).toFixed(1)} cm/s below tested min (${minFlow} cm/s)`);
  } else if (scenarioFlow > maxFlow) {
    outsideAxes.push(`Flow is ${(scenarioFlow - maxFlow).toFixed(1)} cm/s above tested max (${maxFlow} cm/s)`);
  }

  const isOutsideEnvelope = envelope.outside_tested_range || outsideAxes.length > 0;

  // Material matching and filtering
  const targetFamLower = (scenarioFamily || scenarioMaterial).toLowerCase();
  const sameMaterialMatches = matches.filter((m) => {
    const fam = (m.metadata?.material_family || '').toLowerCase();
    return fam === targetFamLower;
  });

  const hasFewerThanThree = sameMaterialMatches.length < 3;
  const consideredMatches = includeDifferentMaterials
    ? matches.slice(0, topK)
    : sameMaterialMatches.slice(0, topK);

  // Outcome tallying
  let photographedCount = 0;
  let extinctionCount = 0;
  let noIgnitionCount = 0;

  for (const m of consideredMatches) {
    if (m.outcome_class === 'frames_recorded') {
      photographedCount++;
    } else if (m.outcome_class === 'extinguished') {
      extinctionCount++;
    } else if (m.outcome_class === 'no_ignition') {
      noIgnitionCount++;
    }
  }

  const nearestMatch = consideredMatches[0] || matches[0];

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-zinc-100">What the Record Says</h3>
        </div>

        {/* Toggle to include different materials */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIncludeDifferentMaterials((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
              includeDifferentMaterials
                ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Include different materials</span>
            <span
              className={`w-2 h-2 rounded-full ${
                includeDifferentMaterials ? 'bg-amber-400' : 'bg-zinc-600'
              }`}
            />
          </button>

          <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {isOutsideEnvelope
              ? 'Closest tested conditions'
              : `k = ${consideredMatches.length} ${includeDifferentMaterials ? 'evaluated runs' : 'same-material runs'}`}
          </span>
        </div>
      </div>

      {/* CASE 1: Outside tested flight envelope */}
      {isOutsideEnvelope ? (
        <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-800/70 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>No flight run in the tested record is near this scenario</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            The target scenario falls beyond the verified microgravity solid combustion envelope ({outsideAxes.join('; ')}). 
            Headline counts are withheld because direct empirical observation does not exist. The nearest flight runs are shown below strictly as <strong>closest tested conditions</strong>.
          </p>
        </div>
      ) : !includeDifferentMaterials && hasFewerThanThree ? (
        /* CASE 2: Fewer than 3 same-material runs exist within tested range */
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Fewer than 3 same-material ({scenarioFamily}) runs exist within range in the tested record ({sameMaterialMatches.length} found).
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Direct empirical counts for {scenarioFamily} are suppressed to prevent false certainty from small sample sizes. Toggle <strong>"Include different materials"</strong> above to inspect nearest flight evidence across all polymer families.
          </p>
        </div>
      ) : (
        /* CASE 3: Inside envelope with sufficient same-material or cross-material runs */
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-3">
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
            <span>
              Flight Record Distribution (k = {consideredMatches.length}{' '}
              {includeDifferentMaterials ? 'all materials' : `${scenarioFamily} runs`})
            </span>
            {!includeDifferentMaterials && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
                <CheckCircle2 className="w-3 h-3" /> Same material strictly
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-950/80 rounded-lg border border-emerald-900/40">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Photographed Burn
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {photographedCount}{' '}
                <span className="text-xs font-normal text-zinc-400">of {consideredMatches.length}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-lg border border-amber-900/40">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                PI-Noted Extinction
              </div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {extinctionCount}{' '}
                <span className="text-xs font-normal text-zinc-400">of {consideredMatches.length}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-lg border border-purple-900/40">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                PI-Noted No Ignition
              </div>
              <div className="text-xl font-bold text-purple-400 mt-1">
                {noIgnitionCount}{' '}
                <span className="text-xs font-normal text-zinc-400">of {consideredMatches.length}</span>
              </div>
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="text-xs text-zinc-300 leading-relaxed pt-1">
            <strong>Summary of Nearest Evidence:</strong> In the {consideredMatches.length} microgravity flight runs closest to this scenario,{' '}
            {photographedCount > 0 && (
              <span className="text-emerald-400 font-semibold">{photographedCount} recorded still-camera burns, </span>
            )}
            {extinctionCount > 0 && (
              <span className="text-amber-400 font-semibold">{extinctionCount} were recorded by the PI as extinguishing, </span>
            )}
            {noIgnitionCount > 0 && (
              <span className="text-purple-400 font-semibold">{noIgnitionCount} had failed ignition attempts.</span>
            )}
            {extinctionCount === 0 && noIgnitionCount === 0 && (
              <span className="text-zinc-400">none were recorded as extinguishing.</span>
            )}
          </div>
        </div>
      )}

      {/* Distance & Nearest Run Coordinates */}
      <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Normalized 2D Distance to Nearest Tested Run:
          </span>
          <strong className="text-zinc-100 font-bold">{envelope.nearest_distance_norm.toFixed(4)}</strong>
        </div>

        {nearestMatch && (
          <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            <span>
              {isOutsideEnvelope ? 'Closest Tested Point' : 'Nearest Flight Point'}:{' '}
              <strong className="text-cyan-300">{nearestMatch.run_uid}</strong> ({nearestMatch.metadata?.material_family || 'PMMA'})
            </span>
            <span>Investigation: <strong className="text-zinc-200">{nearestMatch.metadata?.investigation_id}</strong></span>
            <span>Similarity Score: <strong className="text-zinc-200">{nearestMatch.similarity.toFixed(4)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
