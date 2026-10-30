import React, { useEffect, useId } from 'react';
import { useTrustLedger } from '../../context/TrustLedgerContext';
import type { EpistemicBasis, FactProvenance } from '../../context/TrustLedgerContext';
import { CheckCircle, RefreshCw, HelpCircle, FileText } from 'lucide-react';

export interface FactProps {
  value: React.ReactNode;
  unit?: string | null;
  basis: EpistemicBasis;
  sourceFile: string;
  sourceColumn: string;
  sourceRow: number;
  doi: string;
  investigationId?: string;
  label?: string;
  notes?: string;
  rawRecord?: Record<string, any>;
  className?: string;
  showBasisBadge?: boolean;
  children?: React.ReactNode;
}

export const Fact: React.FC<FactProps> = ({
  value,
  unit,
  basis,
  sourceFile,
  sourceColumn,
  sourceRow,
  doi,
  investigationId,
  label,
  notes,
  rawRecord,
  className = '',
  showBasisBadge = false,
  children,
}) => {
  const { registerFact, unregisterFact, openDrawer } = useTrustLedger();
  const autoId = useId();

  // Validate strict provenance requirement
  if (!sourceFile || !sourceColumn || !sourceRow || !doi) {
    console.error(`[Fact Error] Missing required provenance parameters:`, {
      value,
      sourceFile,
      sourceColumn,
      sourceRow,
      doi,
    });
  }

  const factData: FactProvenance = {
    id: `${sourceFile}:${sourceRow}:${sourceColumn}:${autoId}`,
    label,
    value,
    unit,
    basis,
    sourceFile,
    sourceColumn,
    sourceRow,
    doi,
    investigationId,
    notes,
    rawRecord,
  };

  useEffect(() => {
    registerFact(factData);
    return () => {
      unregisterFact(factData.id);
    };
  }, [factData.id, registerFact, unregisterFact]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer(factData);
  };

  const getBasisBadge = () => {
    switch (basis) {
      case 'measured':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60" title="Directly measured sensor observation">
            <CheckCircle className="w-2.5 h-2.5" /> measured
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60" title="Calculated from physical sensor calibration equation">
            <RefreshCw className="w-2.5 h-2.5" /> converted
          </span>
        );
      case 'assumed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-950/80 text-amber-400 border border-amber-800/60" title="Standard habitat or reference nominal value (not measured)">
            <HelpCircle className="w-2.5 h-2.5" /> assumed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-900 text-zinc-400 border border-zinc-700">
            {basis}
          </span>
        );
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDrawer(factData);
        }
      }}
      className={`inline-flex items-center gap-1.5 group cursor-pointer hover:bg-white/5 px-1 py-0.5 rounded transition-colors text-inherit ${className}`}
      title={`Inspect provenance: ${sourceFile} (Row ${sourceRow}, Col "${sourceColumn}")`}
    >
      <span className="font-medium underline decoration-zinc-600 decoration-dotted underline-offset-4 group-hover:decoration-cyan-400">
        {children || (
          <>
            {value}
            {unit ? ` ${unit}` : ''}
          </>
        )}
      </span>
      {showBasisBadge && getBasisBadge()}
      <FileText className="w-3 h-3 text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-opacity flex-shrink-0" />
    </span>
  );
};
