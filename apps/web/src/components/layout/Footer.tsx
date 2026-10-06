import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Database, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070A14] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider">IGNIS</span>
              <span className="text-xs text-slate-400">| NASA Space Apps Challenge</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A scientific microgravity combustion platform built on open datasets from the NASA Physical Sciences Informatics (PSI), NASA Open Data portal, and NASA Earthdata context.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg max-w-md">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Scientific Disclaimer:</strong> Research reference tool. Not certified life-safety hardware or spacecraft flight operational clearance.
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Platform Modes</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><Link to="/build" className="hover:text-orange-400 transition-colors">Habitat Scenario Builder</Link></li>
              <li><Link to="/explore" className="hover:text-orange-400 transition-colors">Explore Fire Science Stories</Link></li>
              <li><Link to="/ask" className="hover:text-orange-400 transition-colors">Ask IGNIS (Grounded RAG)</Link></li>
              <li><Link to="/about" className="hover:text-orange-400 transition-colors">Scientific Methodology</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NASA Data Sources</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-sky-400" /> NASA PSI (Saffire, BASS, FLEX)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-emerald-400" /> NASA Earthdata / FIRMS</li>
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-orange-400" /> NASA Open Science / Data Portal</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 IGNIS Research Project. Open Source under MIT License.</p>
          <div className="flex items-center gap-4">
            <Link to="/about#disclaimers" className="hover:text-slate-400">Disclaimers</Link>
            <Link to="/about#method" className="hover:text-slate-400">Comparable-Evidence Gate</Link>
            <span className="font-mono text-slate-600">v1.1.0-prod</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
