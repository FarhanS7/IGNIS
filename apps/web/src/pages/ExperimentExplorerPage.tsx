import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react';

export const ExperimentExplorerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-8">
      <div>
        <Link to="/evidence" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Evidence Results</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          NASA Experiment Explorer
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Detailed flight mission archive and test run telemetry {id ? `(${id})` : ''}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
          <Database className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Experiment Detail Workspace</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Experimental run parameters, computer vision flame measurements, and original publication citations will be rendered here in Task C.7.
        </p>
      </div>
    </div>
  );
};
