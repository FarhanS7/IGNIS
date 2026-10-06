import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

export const StoryIndexPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400">
          <span>Mode 02</span>
          <span>·</span>
          <span>Explore Fire</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          NASA Microgravity Combustion Stories
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Interactive science narratives explaining real spacecraft fires, cold flames, and extraterrestrial habitat safety.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6 text-sky-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Story Explorer Workspace</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The curated story catalog (Saffire spacecraft burns, cold flame dynamics, Earthdata fire bridges) will be rendered here.
        </p>
        <div className="pt-2">
          <Link
            to="/explore/saffire-spacecraft-burns"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-sm font-semibold transition-all"
          >
            <span>Preview Saffire Story Player</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
