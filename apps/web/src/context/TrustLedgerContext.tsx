import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type EpistemicBasis = 'measured' | 'converted' | 'assumed' | 'derived' | 'missing' | 'transcribed';

export interface FactProvenance {
  id: string;
  label?: string;
  value: any;
  unit?: string | null;
  basis: EpistemicBasis;
  sourceFile: string;
  sourceColumn: string;
  sourceRow: number;
  doi: string;
  investigationId?: string;
  notes?: string;
  rawRecord?: Record<string, any>;
}

interface TrustLedgerContextValue {
  facts: FactProvenance[];
  registerFact: (fact: FactProvenance) => void;
  unregisterFact: (id: string) => void;
  activeFact: FactProvenance | null;
  isDrawerOpen: boolean;
  openDrawer: (fact: FactProvenance) => void;
  closeDrawer: () => void;
  ledgerStats: {
    total: number;
    measured: number;
    converted: number;
    assumed: number;
    withoutSource: number;
  };
}

const TrustLedgerContext = createContext<TrustLedgerContextValue | null>(null);

export const TrustLedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [factsMap, setFactsMap] = useState<Map<string, FactProvenance>>(new Map());
  const [activeFact, setActiveFact] = useState<FactProvenance | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const registerFact = useCallback((fact: FactProvenance) => {
    // Assert provenance integrity
    if (!fact.sourceFile || !fact.sourceColumn || fact.sourceRow <= 0) {
      console.warn(`[TrustLedger] Fact "${fact.label || fact.id}" has incomplete provenance:`, fact);
    }
    setFactsMap((prev) => {
      const next = new Map(prev);
      next.set(fact.id, fact);
      return next;
    });
  }, []);

  const unregisterFact = useCallback((id: string) => {
    setFactsMap((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const openDrawer = useCallback((fact: FactProvenance) => {
    setActiveFact(fact);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const facts = useMemo(() => Array.from(factsMap.values()), [factsMap]);

  const ledgerStats = useMemo(() => {
    let measured = 0;
    let converted = 0;
    let assumed = 0;
    let withoutSource = 0;

    for (const f of facts) {
      if (!f.sourceFile || !f.sourceColumn || f.sourceRow <= 0 || !f.doi) {
        withoutSource++;
      }
      if (f.basis === 'measured' || f.basis === 'transcribed') {
        measured++;
      } else if (f.basis === 'converted' || f.basis === 'derived') {
        converted++;
      } else if (f.basis === 'assumed') {
        assumed++;
      }
    }

    return {
      total: facts.length,
      measured,
      converted,
      assumed,
      withoutSource,
    };
  }, [facts]);

  const value = useMemo(
    () => ({
      facts,
      registerFact,
      unregisterFact,
      activeFact,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      ledgerStats,
    }),
    [facts, registerFact, unregisterFact, activeFact, isDrawerOpen, openDrawer, closeDrawer, ledgerStats]
  );

  return <TrustLedgerContext.Provider value={value}>{children}</TrustLedgerContext.Provider>;
};

export function useTrustLedger(): TrustLedgerContextValue {
  const ctx = useContext(TrustLedgerContext);
  if (!ctx) {
    throw new Error('useTrustLedger must be used within a TrustLedgerProvider');
  }
  return ctx;
}
