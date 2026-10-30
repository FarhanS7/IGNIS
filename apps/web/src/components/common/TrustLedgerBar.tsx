import React from 'react';
import { useTrustLedger } from '../../context/TrustLedgerContext';
import { ShieldCheck, CheckCircle2, RefreshCw, HelpCircle, AlertCircle } from 'lucide-react';

export const TrustLedgerBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ledgerStats } = useTrustLedger();

  return (
    <div
      className={`w-full bg-zinc-950/90 backdrop-blur border-y border-zinc-800/80 px-4 py-2.5 text-xs font-mono text-zinc-300 flex flex-wrap items-center justify-between gap-4 z-20 ${className}`}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span className="font-semibold text-zinc-200">Trust Ledger:</span>
        <span>
          On this screen: <strong className="text-zinc-100">{ledgerStats.total}</strong> values
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-400" title="Values directly recorded from microgravity flight sensor instruments">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            <strong>{ledgerStats.measured}</strong> measured
          </span>
        </div>

        <span className="text-zinc-700">•</span>

        <div className="flex items-center gap-1.5 text-cyan-400" title="Values converted via verified calibration polynomial equations">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>
            <strong>{ledgerStats.converted}</strong> converted
          </span>
        </div>

        <span className="text-zinc-700">•</span>

        <div className="flex items-center gap-1.5 text-amber-400" title="Standard cabin specifications assumed where flight instrumentation was absent">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>
            <strong>{ledgerStats.assumed}</strong> assumed
          </span>
        </div>

        <span className="text-zinc-700">•</span>

        <div className={`flex items-center gap-1.5 ${ledgerStats.withoutSource > 0 ? 'text-rose-400 font-bold' : 'text-zinc-400'}`}>
          {ledgerStats.withoutSource > 0 ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span>
            <strong>{ledgerStats.withoutSource}</strong> without source
          </span>
        </div>
      </div>
    </div>
  );
};
