import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const StoryPlayerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="space-y-8">
      <div>
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Story Index</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Story Player: {slug?.replace(/-/g, ' ').toUpperCase()}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Interactive slide-based narrative with embedded NASA telemetry and observational media.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6 text-sky-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Interactive Story Player Workspace</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Multi-section narrative slides, telemetry chart widgets, and Earthdata FIRMS context bridges will be rendered here.
        </p>
      </div>
    </div>
  );
};
