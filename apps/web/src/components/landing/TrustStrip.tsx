import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  return (
    <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              Built on NASA flight experiments (Saffire, BASS, FLEX).
            </p>
            <p className="text-xs text-slate-400">
              1,401 flight runs across 14 NASA PSI investigations • Strict empirical provenance.
            </p>
          </div>
        </div>

        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-cyan-400 hover:text-white transition-colors shrink-0 group"
        >
          <span>Scientific Methodology & Provenance</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default TrustStrip;
