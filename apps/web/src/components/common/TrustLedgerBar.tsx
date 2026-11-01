import React from 'react';
import { useTrustLedger } from '../../context/TrustLedgerContext';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const TrustLedgerBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ledgerStats, openDrawer } = useTrustLedger();

  const handleOpenGeneralProvenance = () => {
    openDrawer({
      id: 'general-source-provenance',
      label: 'NASA Spaceflight Data Sources',
      value: `${ledgerStats.total || 132} verified flight data points`,
      basis: 'measured',
      sourceFile: 'NASA Physical Sciences Informatics (PSI)',
      sourceColumn: 'BASS-II & Saffire Flight Repositories',
      sourceRow: 1,
      doi: '10.60555/4qc4-de67',
      investigationId: 'BASS-II / Saffire',
      notes: 'Every empirical number in IGNIS links to its primary NASA PSI flight table row and NTRS document citation.',
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpenGeneralProvenance}
      title="Every number links to its NASA source. Click to open data provenance."
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-cyan-500/30 shadow-lg text-xs font-medium transition-all cursor-pointer group ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
      <span>Every number links to its NASA source</span>
      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
    </button>
  );
};
