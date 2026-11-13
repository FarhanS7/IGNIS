import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  return (
    <section id="trust-strip" className="py-10 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div className="cinema-eyebrow">
          <span className="cinema-hairline" />
          <span>04 / EMPIRICAL PROVENANCE</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-[9px] tracking-wider text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>NASA PHYSICAL SCIENCES INFORMATICS (PSI)</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl cinema-card border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              Built on NASA flight experiments (Saffire, BASS, FLEX).
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              1,401 flight runs across 14 NASA PSI investigations • Strict empirical provenance.
            </p>
          </div>
        </div>

        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-cyan-400 hover:text-white transition-colors shrink-0 group px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 bg-cyan-950/20"
        >
          <span>Scientific Methodology &amp; Provenance</span>
          <span className="button-arrow">↗</span>
        </Link>
      </div>
    </section>
  );
};

export default TrustStrip;
