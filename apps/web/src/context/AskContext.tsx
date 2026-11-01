import React, { useState, useCallback, useMemo } from 'react';
import {
  AskContext,
  type AskContextValue,
  type ChatMessage,
  type GroundedCitation,
  type AskPageContext,
} from './AskContextDefinition';
import {
  BM25Retriever,
  extractScenarioFromQuestion,
  type CorpusChunk,
  type RetrievedChunk,
} from '../lib/assistant/bm25_retriever';
import { verifyAnswer } from '../lib/assistant/client_verifier';
import { RealSolidMatcher } from '../lib/matcher/real_solid_matcher';
import type { RawEvidenceSolidRun, MaterialMap, RealSolidMatchResult } from '../lib/matcher/types';

import rawChunks from '../data/corpus/chunks.json';
import solidRunsData from '../data/evidence_solid.json';
import materialMapData from '../data/material_map.json';

export type { ChatMessage, GroundedCitation, AskPageContext, AskContextValue };

export const DEFAULT_CORPUS_PROMPTS = [
  'Why was the BASS-II O2 sensor recalibrated using ISS MCA data?',
  'How did SIBAL fabric burn in Saffire-I compared to normal gravity?',
  'What was the flammability limit of PMMA rods in BASS-II?',
  'What happened during flow step-down quenching tests?',
  'Can current flight data verify fire safety in Lunar 0.16 g partial gravity?',
  'What did FLEX experiments discover about methanol droplet extinction in microgravity?',
];

export const AskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [pageContext, setPageContext] = useState<AskPageContext | null>(null);

  // Initialize BM25 retriever in client memory over 930 corpus chunks
  const retriever = useMemo(() => {
    return new BM25Retriever(rawChunks as unknown as CorpusChunk[]);
  }, []);

  // Initialize RealSolidMatcher in client memory
  const matcher = useMemo(() => {
    return new RealSolidMatcher(
      solidRunsData as unknown as RawEvidenceSolidRun[],
      materialMapData as unknown as MaterialMap
    );
  }, []);

  const openDrawer = useCallback((initialQuery?: string) => {
    setIsDrawerOpen(true);
    if (initialQuery) {
      setInputQuery(initialQuery);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const clearSession = useCallback(() => {
    setMessages([]);
    setInputQuery('');
  }, []);

  const sendMessage = useCallback(
    async (queryToSend?: string, useLLM = false) => {
      const q = (queryToSend ?? inputQuery).trim();
      if (!q) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputQuery('');
      setIsLoading(true);

      try {
        // Step 1: Client-Side BM25 Retrieval over Corpus Chunks
        const topChunks: RetrievedChunk[] = retriever.search(q, 5);

        // Step 2: Structured Scenario Parameter Extraction & Matcher Tool
        const extractedScenario = extractScenarioFromQuestion(q);
        let matcherResult: RealSolidMatchResult | null = null;
        if (extractedScenario) {
          try {
            matcherResult = matcher.match(
              {
                material: extractedScenario.material || 'PMMA',
                oxygen_pct: extractedScenario.oxygen_pct ?? 21.0,
                flow_cm_s: extractedScenario.flow_cm_s ?? 5.0,
                pressure_kpa: extractedScenario.pressure_kpa ?? 101.3,
                gravity_g: extractedScenario.gravity_g ?? 0.0,
                geometry: 'flat',
                thickness_mm: 0.4,
              },
              null,
              3
            );
          } catch (e) {
            console.warn('[Matcher Tool] Failed to run on extracted scenario:', e);
          }
        }

        // Step 3: Handle LLM Mode vs Extractive Fallback Mode
        let isLlmSuccess = false;
        let llmAnswerSentences: Array<{ text: string; cites: string[] }> = [];
        let llmAbstain = false;

        if (useLLM) {
          try {
            const res = await fetch('/api/ask', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: q,
                chunks: topChunks.map((c) => ({
                  chunk_id: c.chunk_id,
                  title: c.title,
                  page: c.page,
                  text: c.text,
                })),
                matcher_result: matcherResult,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (!data.error && Array.isArray(data.answer_sentences) && data.answer_sentences.length > 0) {
                isLlmSuccess = true;
                llmAnswerSentences = data.answer_sentences;
                llmAbstain = Boolean(data.abstain);
              }
            }
          } catch (e) {
            console.warn('[LLM Mode] /api/ask unavailable or offline, defaulting to extractive mode:', e);
          }
        }

        // Step 4: Verification or Extractive Synthesis
        let assistantMessage: ChatMessage;

        if (isLlmSuccess && !llmAbstain) {
          // Client-side Verifier runs AFTER the model:
          const verification = verifyAnswer(
            { answer_sentences: llmAnswerSentences, abstain: false },
            topChunks,
            matcherResult?.matches || []
          );

          if (verification.abstain || verification.verified_sentences.length === 0) {
            assistantMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content:
                'Not enough evidence in the NASA corpus to support a verified claim for this scenario. Consult the closest retrieved flight passages below:',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              verifiedBadge: verification.badge,
              abstain: true,
              mode: 'llm',
              retrievedChunks: topChunks,
              structuredMatch: matcherResult,
            };
          } else {
            const combinedText = verification.verified_sentences.map((s) => s.text).join(' ');
            assistantMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: combinedText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              verifiedBadge: verification.badge,
              verifiedSentences: verification.verified_sentences,
              mode: 'llm',
              retrievedChunks: topChunks,
              structuredMatch: matcherResult,
            };
          }
        } else {
          // Default Extractive Mode (No LLM required, 100% deterministic & verifiable)
          const primaryChunk = topChunks[0];
          let extractiveContent = '';

          if (topChunks.length === 0 || (primaryChunk && primaryChunk.score < 0.5)) {
            extractiveContent =
              'Not enough evidence in the corpus. The physical science flammability archive does not contain matching test runs for this specific query.';
          } else {
            extractiveContent = primaryChunk.highlighted_snippets.join(' ');
          }

          assistantMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: extractiveContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            verifiedBadge: primaryChunk
              ? `Passage from ${primaryChunk.title} (Page ${primaryChunk.page})`
              : '0 matching chunks',
            mode: 'extractive',
            retrievedChunks: topChunks,
            structuredMatch: matcherResult,
            abstain: topChunks.length === 0,
          };
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error('Ask error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: 'An error occurred while querying the physical sciences corpus. Please retry.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            abstain: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputQuery, retriever, matcher]
  );

  const suggestedPrompts = useMemo(() => {
    return DEFAULT_CORPUS_PROMPTS;
  }, []);

  return (
    <AskContext.Provider
      value={{
        messages,
        inputQuery,
        setInputQuery,
        isLoading,
        sendMessage,
        clearSession,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        pageContext,
        setPageContext,
        suggestedPrompts,
      }}
    >
      {children}
    </AskContext.Provider>
  );
};

export default AskProvider;
