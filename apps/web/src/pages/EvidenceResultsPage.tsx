import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export const EvidenceResultsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/build" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Scenario Builder</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Fire Behavior Profile & Ranked Evidence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Grounded in NASA microgravity combustion flight experiments.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6 text-sky-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Evidence Results Workspace</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The synthesized Fire Behavior Profile, ranked flight experiments with factor breakdown, and Why? explanation panel will be rendered here in Task C.5.
        </p>
      </div>
    </div>
  );
};
