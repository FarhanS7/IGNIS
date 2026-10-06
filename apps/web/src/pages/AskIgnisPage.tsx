import React from 'react';
import { Sparkles } from 'lucide-react';

export const AskIgnisPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
          <span>AI Research Assistant</span>
          <span>·</span>
          <span>Grounded in NASA Literature</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Ask IGNIS
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Inquire about microgravity combustion, flame quenching limits, and spacecraft material flammability with cited NASA publications.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Ask IGNIS RAG Workspace</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The conversational interface with grounded citation chips and low-evidence safety fallbacks will be connected here in Module D.
        </p>
      </div>
    </div>
  );
};
