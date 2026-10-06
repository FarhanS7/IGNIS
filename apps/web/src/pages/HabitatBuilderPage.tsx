import React from 'react';
import { Link } from 'react-router-dom';
import { Sliders, ArrowRight } from 'lucide-react';

export const HabitatBuilderPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-400">
          <span>Mode 01</span>
          <span>·</span>
          <span>Habitat Builder</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Configure Habitat Combustion Scenario
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Select a destination preset or calibrate independent environmental and material parameters.
          Evaluations run against verified NASA flight test runs.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
          <Sliders className="w-6 h-6 text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Habitat Builder Workspace</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The interactive Destination Preset Selector, dual Environment/Habitat control panels, and live telemetry validation will be rendered here in Task C.4.
        </p>
        <div className="pt-2">
          <Link
            to="/evidence"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 transition-all"
          >
            <span>Preview Evidence Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
