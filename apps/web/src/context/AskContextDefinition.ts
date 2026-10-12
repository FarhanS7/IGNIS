import { createContext } from 'react';
import type { ConfidenceLevel, EvidenceLevel, ScenarioInput, Experiment } from '../types/api';

export interface GroundedCitation {
  id: string;
  experimentId?: string;
  title: string;
  documentTitle: string;
  doi?: string;
  evidenceLevel: EvidenceLevel;
  quote: string;
  telemetryMetrics?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: ConfidenceLevel;
  isLowEvidence?: boolean;
  citations?: GroundedCitation[];
  observedFacts?: string[];
  caveats?: string[];
  isOfflineFallback?: boolean;
}

export type AskContextType = 'general' | 'simulator' | 'experiment' | 'story';

export interface AskPageContext {
  type: AskContextType;
  title?: string;
  scenario?: ScenarioInput | null;
  experiment?: Experiment | null;
  storySlug?: string | null;
  suggestedPrompts?: string[];
}

export interface AskContextValue {
  messages: ChatMessage[];
  inputQuery: string;
  setInputQuery: (q: string) => void;
  isLoading: boolean;
  sendMessage: (queryToSend?: string) => Promise<void>;
  clearSession: () => void;
  isDrawerOpen: boolean;
  openDrawer: (initialQuery?: string) => void;
  closeDrawer: () => void;
  pageContext: AskPageContext | null;
  setPageContext: (ctx: AskPageContext | null) => void;
  suggestedPrompts: string[];
}

export const AskContext = createContext<AskContextValue | null>(null);
