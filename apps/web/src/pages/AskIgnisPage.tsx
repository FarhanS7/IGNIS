import React, { useRef, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAskIgnis } from '../hooks/useAskIgnis';
import {
  Sparkles,
  Send,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Compass,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';

export const AskIgnisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');
  const scopeParam = searchParams.get('scope');

  const {
    messages,
    inputQuery,
    setInputQuery,
    isLoading,
    sendMessage,
    clearSession,
    suggestedPrompts,
  } = useAskIgnis();

  const [selectedScope, setSelectedScope] = useState<string>(scopeParam || 'global');
  const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const initialSearchTriggered = useRef<boolean>(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleFacts = (msgId: string) => {
    setExpandedFacts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Handle URL prefilled query parameter (e.g. from /simulator or /experiments)
  useEffect(() => {
    if (!initialSearchTriggered.current && queryParam) {
      initialSearchTriggered.current = true;
      sendMessage(queryParam);
    }
  }, [queryParam, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputQuery.trim() && !isLoading) {
        sendMessage(inputQuery);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill mb-2">
            <span>NASA Space Apps 2026 • Traceable RAG Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
            Ask IGNIS
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Inquire about microgravity combustion, material quenching limits, and spacecraft fire safety. Every response is grounded in published NASA Physical Sciences Informatics (PSI) research.
          </p>
        </div>

        {/* Clear chat action */}
        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={clearSession}
        >
          Reset Session
        </Button>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
        <span className="text-slate-400 font-mono px-3 py-1 font-semibold">EVIDENCE SCOPE:</span>
        {[
          { id: 'global', label: 'All NASA PSI Records' },
          { id: 'saffire', label: 'Saffire Spacecraft Burns' },
          { id: 'glovebox', label: 'BASS & FLEX Microgravity' },
          { id: 'earthdata', label: 'NASA Earthdata FIRMS' },
        ].map((scope) => (
          <button
            key={scope.id}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedScope === scope.id
                ? 'bg-cyan-500/20 text-[#79dce8] border border-cyan-400/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setSelectedScope(scope.id)}
          >
            {scope.label}
          </button>
        ))}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Curated Scientific Queries</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-[#79dce8]/50 hover:bg-[#79dce8]/10 transition-all text-left cursor-pointer"
              onClick={() => sendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Stream Window */}
      <div className="glass-card space-y-6 min-h-[420px] max-h-[680px] overflow-y-auto p-4 sm:p-6 rounded-2xl border border-white/15">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-6 space-y-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/50 border border-cyan-500/30 text-white ml-8 shadow-lg'
                  : msg.isLowEvidence
                  ? 'bg-amber-950/30 border border-amber-500/40 text-slate-200 mr-8 shadow-lg'
                  : 'bg-slate-950/70 border border-white/10 text-slate-100 mr-8 shadow-xl'
              }`}
            >
              {/* Header Meta for Assistant */}
              {msg.role === 'assistant' && (
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                      IG
                    </div>
                    <span className="font-semibold text-white">IGNIS Intelligence Core</span>
                    <EvidenceBadge level={msg.isLowEvidence ? 'D' : 'E'} size="xs" />
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.confidence && <ConfidenceBadge level={msg.confidence} size="xs" />}
                    <span className="text-slate-400 font-mono text-[11px]">{msg.timestamp}</span>
                  </div>
                </div>
              )}

              {/* Verified Badge */}
              {msg.verifiedBadge && (
                <div className="pb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {msg.verifiedBadge}
                  </span>
                  {msg.mode && (
                    <span className="text-xs font-mono uppercase text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                      {msg.mode} mode
                    </span>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className="text-sm leading-relaxed whitespace-pre-line space-y-2">
                {msg.content}
              </div>

              {/* Structured Matcher Tool Output */}
              {msg.structuredMatch?.matches?.[0] && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 font-mono text-xs space-y-1.5">
                  <div className="text-cyan-300 font-semibold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Structured Flight Matcher Tool Output:</span>
                  </div>
                  <div className="text-zinc-200">
                    Nearest Tested Flight Run: <strong className="text-white">{msg.structuredMatch.matches[0].run_uid}</strong> ({msg.structuredMatch.matches[0].material_family || msg.structuredMatch.matches[0].material})
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Tested Conditions: {msg.structuredMatch.matches[0].factors?.oxygen?.experiment_value}% O₂, {msg.structuredMatch.matches[0].factors?.flow?.experiment_value} cm/s • Observed Outcome: <span className="text-amber-300 font-semibold">{msg.structuredMatch.matches[0].outcome_class}</span>
                  </div>
                </div>
              )}

              {/* Retrieved Corpus Passages */}
              {msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Retrieved NASA PSI / NTRS Passages ({msg.retrievedChunks.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.retrievedChunks.map((chunk) => (
                      <div key={chunk.chunk_id} className="p-3 rounded-xl bg-black/50 border border-zinc-800 text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-zinc-300">
                          <span className="font-bold text-white truncate max-w-md" title={chunk.title}>{chunk.title}</span>
                          <span className="text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">Page {chunk.page}</span>
                        </div>
                        <p className="text-zinc-300 text-xs leading-relaxed italic">
                          "{chunk.highlighted_snippets?.[0] || chunk.text.slice(0, 220) + '...'}"
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                          <span>Chunk ID: {chunk.chunk_id}</span>
                          {chunk.source_url && (
                            <a href={chunk.source_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                              <span>View Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observed NASA Empirical Facts vs Synthesis */}
              {msg.observedFacts && msg.observedFacts.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toggleFacts(msg.id)}
                    className="flex items-center justify-between w-full p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold uppercase tracking-wider">
                        Direct Observed NASA Empirical Facts ({msg.observedFacts.length})
                      </span>
                    </div>
                    {expandedFacts[msg.id] ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>

                  {expandedFacts[msg.id] && (
                    <div className="mt-2 p-3 rounded-lg bg-black/40 border border-cyan-500/20 text-xs space-y-1.5 font-mono text-slate-300">
                      {msg.observedFacts.map((fact, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 select-none">▸</span>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Grounded Citation Evidence Cards */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                    <span>CITED PRIMARY EVIDENCE SOURCES:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((cite) => (
                      <div
                        key={cite.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <EvidenceBadge level={cite.evidenceLevel} size="xs" />
                            <span className="font-semibold text-xs text-white">
                              {cite.title}
                            </span>
                          </div>
                          {cite.experimentId && (
                            <Link
                              to={`/experiment/${cite.experimentId}`}
                              className="text-[11px] text-cyan-400 hover:text-white flex items-center gap-1 font-mono"
                            >
                              Telemetry Viewer →
                            </Link>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 italic">"{cite.quote}"</p>
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>{cite.documentTitle}</span>
                          {cite.doi && <span className="text-cyan-400/80">DOI: {cite.doi}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Environmental Limitations & Caveats */}
              {msg.caveats && msg.caveats.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-0.5">
                    {msg.caveats.map((c, i) => (
                      <p key={i}>{c}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/10 max-w-sm">
            <div className="flex space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            </div>
            <span className="text-xs font-mono text-cyan-300">
              Retrieving NASA PSI literature chunks...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="glass-card p-3 rounded-2xl border border-white/15 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputQuery.trim() && !isLoading) {
              sendMessage(inputQuery);
            }
          }}
          className="flex items-center gap-2"
        >
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a scientific microgravity combustion question (e.g. 'Why do flames form a sphere in 0g?')..."
            rows={2}
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none resize-none text-sm p-2"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isLoading}
            icon={<Send className="w-4 h-4" />}
          >
            Inquire
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-2 pt-1 border-t border-white/5">
          <span>Press <strong>Enter</strong> to submit, <strong>Shift+Enter</strong> for newline</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono">Grounded RAG Guardrails Active</span>
          </div>
        </div>
      </div>

      {/* Disclaimers & Next steps footer links */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>NASA Challenge Non-Operational Scope: Educational & research exploration tool.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/experiments" className="text-cyan-400 hover:text-white flex items-center gap-1 font-mono">
            Browse Flight Data <ArrowRight className="w-3 h-3" />
          </Link>
          <Link to="/explore" className="text-amber-400 hover:text-white flex items-center gap-1 font-mono">
            Stories <Compass className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AskIgnisPage;
