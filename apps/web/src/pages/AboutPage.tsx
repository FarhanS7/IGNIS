import React from 'react';
import { ShieldAlert, Database, Scale } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <span>Documentation</span>
          <span>·</span>
          <span>Scientific Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          About IGNIS & Scientific Method
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Transparency in data provenance, mathematical matching rules, and strict non-certification disclaimers.
        </p>
      </div>

      {/* Safety & Certification Disclaimer */}
      <section id="disclaimers" className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <ShieldAlert className="w-5 h-5" />
          <span>Non-Certification & Operational Safety Notice</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          IGNIS is a scientific research and educational platform developed for the NASA Space Apps Challenge.
          Calculations, similarity scores, and behavior profiles provided by IGNIS do <strong>not</strong> constitute official flight qualification, mission safety clearance, or certified life-support engineering compliance under NASA-STD-6001. All mission-critical decisions must adhere to designated agency review boards.
        </p>
      </section>

      {/* Comparable-Evidence Gate */}
      <section id="method" className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Scale className="w-5 h-5 text-orange-400" />
          <span>The Comparable-Evidence Filter</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Traditional numerical matching can generate scientifically misleading results (e.g. ranking a liquid droplet test as 90% similar to cotton fabrics because oxygen and pressure values happen to coincide).
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          IGNIS enforces a mandatory scientific comparability gate prior to scoring:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm text-slate-400 space-y-2 pl-2">
          <li><strong>Fuel & Material Family Compatibility:</strong> Gaseous, droplet, and solid fuels are separated into non-transferable classes.</li>
          <li><strong>Gravity Environment Disparity Flags:</strong> Lunar (0.16g) or Martian (0.38g) scenarios matched against microgravity flight tests automatically receive a warning and confidence is capped at Medium.</li>
          <li><strong>Dynamic Weight Renormalization:</strong> Telemetry factors with unrecorded experimental data are not penalized as zero; remaining weights dynamically sum to 1.0.</li>
        </ul>
      </section>

      {/* Source Registries */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Database className="w-5 h-5 text-sky-400" />
          <span>Multi-Channel NASA Source Registry</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          IGNIS indexes telemetry and publications across distinct NASA archives:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="text-xs font-semibold text-white">NASA PSI</h4>
            <p className="text-xs text-slate-400">Microgravity test runs from Saffire, BASS, FLEX, and SOFIE.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="text-xs font-semibold text-white">NASA Open Data</h4>
            <p className="text-xs text-slate-400">Technical reports, publications, and open science datasets.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <h4 className="text-xs font-semibold text-white">NASA Earthdata</h4>
            <p className="text-xs text-slate-400">FIRMS terrestrial fire observations used for comparative context.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
