import React from 'react';
import type { RealSolidMatch, SolidEnvelopeData } from '../../lib/matcher/types';
import { BookOpen, MapPin } from 'lucide-react';

interface WhatTheRecordSaysProps {
  matches: RealSolidMatch[];
  envelope: SolidEnvelopeData;
  topK?: number;
}

export const WhatTheRecordSays: React.FC<WhatTheRecordSaysProps> = ({ matches, envelope, topK = 5 }) => {
  const topMatches = matches.slice(0, topK);

  // Plain count of k nearest runs by outcome
  let photographedCount = 0;
  let extinctionCount = 0;
  let noIgnitionCount = 0;
  let unknownCount = 0;

  for (const m of topMatches) {
    if (m.outcome_class === 'frames_recorded') {
      photographedCount++;
    } else if (m.outcome_class === 'extinguished') {
      extinctionCount++;
    } else if (m.outcome_class === 'no_ignition') {
      noIgnitionCount++;
    } else {
      unknownCount++;
    }
  }

  const nearestMatch = topMatches[0];

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-zinc-100">What the Record Says</h3>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          k = {topMatches.length} Nearest Runs
        </span>
      </div>

      {/* Outcome Tally */}
      <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-3 font-mono">
        <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
          Flight Record Distribution (k = {topMatches.length})
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-950/80 rounded-lg border border-emerald-900/40">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Photographed Burn
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {photographedCount} <span className="text-xs font-normal text-zinc-400">of {topMatches.length}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/80 rounded-lg border border-amber-900/40">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              PI-Noted Extinction
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {extinctionCount} <span className="text-xs font-normal text-zinc-400">of {topMatches.length}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/80 rounded-lg border border-purple-900/40">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              PI-Noted No Ignition
            </div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {noIgnitionCount} <span className="text-xs font-normal text-zinc-400">of {topMatches.length}</span>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="text-xs text-zinc-300 leading-relaxed pt-1">
          <strong>Summary of Nearest Evidence:</strong> In the {topMatches.length} microgravity flight runs closest to this scenario,{' '}
          {photographedCount > 0 && <span className="text-emerald-400 font-semibold">{photographedCount} recorded still-camera burns, </span>}
          {extinctionCount > 0 && <span className="text-amber-400 font-semibold">{extinctionCount} were recorded by the Principal Investigator as extinguishing, </span>}
          {noIgnitionCount > 0 && <span className="text-purple-400 font-semibold">{noIgnitionCount} had failed ignition attempts.</span>}
          {extinctionCount === 0 && noIgnitionCount === 0 && <span className="text-zinc-400">none were recorded as extinguishing.</span>}
        </div>
      </div>

      {/* Distance & Nearest Run Coordinates */}
      <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Normalized 2D Distance to Nearest Tested Run:
          </span>
          <strong className="text-zinc-100 font-bold">{envelope.nearest_distance_norm.toFixed(4)}</strong>
        </div>

        {nearestMatch && (
          <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            <span>Nearest Flight Point: <strong className="text-cyan-300">{nearestMatch.run_uid}</strong></span>
            <span>Investigation: <strong className="text-zinc-200">{nearestMatch.metadata.investigation_id}</strong></span>
            <span>Similarity Score: <strong className="text-zinc-200">{nearestMatch.similarity.toFixed(4)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
