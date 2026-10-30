import React, { useEffect } from 'react';
import { useTrustLedger } from '../../context/TrustLedgerContext';
import { X, ExternalLink, ShieldCheck, Database, FileSpreadsheet, Tag, Hash, FileCode, CheckCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProvenanceDrawer: React.FC = () => {
  const { activeFact, isDrawerOpen, closeDrawer } = useTrustLedger();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen || !activeFact) {
    return null;
  }

  const investigationUrl = activeFact.investigationId
    ? `https://psi.nasa.gov/physci/repo/data/investigations/${activeFact.investigationId}`
    : null;

  const doiUrl = activeFact.doi
    ? activeFact.doi.startsWith('http')
      ? activeFact.doi
      : `https://doi.org/${activeFact.doi}`
    : null;

  const renderBasisExplanation = () => {
    switch (activeFact.basis) {
      case 'measured':
        return (
          <div className="flex items-start gap-2 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-emerald-200">Directly Measured Physical Sensor Observation</strong>
              This value was recorded in flight by onboard sensors (e.g. calibrated paramagnetics, radiometers, anemometers) and transcribed from official NASA flight tables.
            </div>
          </div>
        );
      case 'converted':
        return (
          <div className="flex items-start gap-2 p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-xs text-cyan-300">
            <RefreshCw className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-cyan-200">Physically Converted / Derived Metric</strong>
              This value was calculated using documented calibration equations (e.g. converting BASS-II fan display dial settings to cm/s flow via duct restriction coefficients).
            </div>
          </div>
        );
      case 'assumed':
        return (
          <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg text-xs text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-amber-200">Assumed Spacecraft Standard Specification</strong>
              No flight sensor measured this parameter for this run. A standard nominal value (e.g. 101.325 kPa cabin 1 atm) is assumed per spacecraft specification. It is excluded from similarity calculations.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl bg-zinc-950 border-l border-zinc-800 shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Epistemic Provenance Audit</h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fact Value Card */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono">
              {activeFact.label || 'Observed Value'}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-zinc-100">
                {String(activeFact.value)}
              </span>
              {activeFact.unit && (
                <span className="text-sm font-mono text-zinc-400">{activeFact.unit}</span>
              )}
            </div>

            {renderBasisExplanation()}
          </div>

          {/* Coordinate Provenance Details */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-semibold">
              Source Coordinates
            </h3>

            <div className="grid grid-cols-1 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 flex items-start gap-3">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <div className="text-zinc-400 text-[11px]">Source Data File</div>
                  <div className="text-zinc-200 font-medium truncate" title={activeFact.sourceFile}>
                    {activeFact.sourceFile}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 flex items-start gap-3">
                  <Tag className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-zinc-400 text-[11px]">Column Name</div>
                    <div className="text-zinc-200 font-medium">{activeFact.sourceColumn}</div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 flex items-start gap-3">
                  <Hash className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-zinc-400 text-[11px]">Source CSV Row</div>
                    <div className="text-zinc-200 font-medium">Line {activeFact.sourceRow}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Verification Links */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-semibold">
              NASA Primary Repository References
            </h3>

            <div className="space-y-2">
              {doiUrl && (
                <a
                  href={doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 rounded-lg transition-colors group text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
                    <div>
                      <span className="text-zinc-200 font-medium">Dataset Digital Object Identifier (DOI)</span>
                      <span className="block text-[11px] text-zinc-400 truncate max-w-sm">{activeFact.doi}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
                </a>
              )}

              {investigationUrl && (
                <a
                  href={investigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 rounded-lg transition-colors group text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
                    <div>
                      <span className="text-zinc-200 font-medium">NASA PSI Investigation Repository</span>
                      <span className="block text-[11px] text-zinc-400">{activeFact.investigationId}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
                </a>
              )}
            </div>
          </div>

          {/* Raw Record Inspector */}
          {activeFact.rawRecord && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                Raw Experimental Record Excerpt
              </h3>
              <pre className="p-3 bg-black/80 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(activeFact.rawRecord, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-zinc-800 text-[11px] text-zinc-400 leading-relaxed font-mono">
          NASA Space Apps Challenge 2026 • Real NASA PSI Microgravity Combustion Ingestion
        </div>
      </motion.div>
    </div>
  );
};
