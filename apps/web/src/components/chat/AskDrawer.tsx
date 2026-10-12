import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Maximize2,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useAskIgnis } from '../../hooks/useAskIgnis';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { Button } from '../common/Button';

export const AskDrawer: React.FC = () => {
  const {
    messages,
    inputQuery,
    setInputQuery,
    isLoading,
    sendMessage,
    clearSession,
    isDrawerOpen,
    closeDrawer,
    pageContext,
    suggestedPrompts,
  } = useAskIgnis();

  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});

  const toggleFacts = (msgId: string) => {
    setExpandedFacts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isDrawerOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isDrawerOpen]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (isDrawerOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Focus input on open
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDrawer();
          return;
        }

        if (e.key === 'Tab' && drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const firstEl = focusable[0];
          const lastEl = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isDrawerOpen, closeDrawer]);

  const handleSend = (queryOverride?: string) => {
    const text = (queryOverride || inputQuery).trim();
    if (!text || isLoading) return;
    sendMessage(text);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenFullPage = () => {
    closeDrawer();
    navigate('/ask');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer Slide-over Panel */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ask IGNIS Chat Assistant"
            initial={shouldReduceMotion ? { opacity: 1 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full sm:w-[420px] md:w-[460px] h-full bg-slate-950/95 border-l border-white/15 backdrop-blur-2xl flex flex-col shadow-2xl text-white"
          >
            {/* Drawer Header */}
            <header className="p-4 border-b border-white/10 flex items-center justify-between gap-2 shrink-0 bg-slate-900/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-md">
                  IG
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] truncate">
                      Ask IGNIS
                    </h3>
                    {pageContext && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase shrink-0">
                        {pageContext.type}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    NASA RAG Research Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* 4. Open Full Page link (preserves conversation) */}
                <button
                  type="button"
                  onClick={handleOpenFullPage}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Open full page"
                  aria-label="Open full page"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={clearSession}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Ask IGNIS"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Context Notice Banner */}
            {pageContext && pageContext.title && (
              <div className="px-4 py-2 bg-cyan-950/30 border-b border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between gap-2 shrink-0">
                <span className="truncate font-mono text-[11px]">
                  Context: <strong>{pageContext.title}</strong>
                </span>
                <span className="text-[10px] opacity-75 font-mono shrink-0">Active</span>
              </div>
            )}

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 space-y-2.5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/60 border border-cyan-500/40 text-white ml-4 shadow-md'
                        : msg.isLowEvidence
                        ? 'bg-amber-950/40 border border-amber-500/40 text-slate-200 mr-4 shadow-md'
                        : 'bg-slate-900/80 border border-white/10 text-slate-100 mr-4 shadow-lg'
                    }`}
                  >
                    {/* Assistant Message Header */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">IGNIS Core</span>
                          <EvidenceBadge level={msg.isLowEvidence ? 'D' : 'E'} size="xs" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {msg.confidence && <ConfidenceBadge level={msg.confidence} size="xs" />}
                          <span className="text-slate-400 font-mono text-[10px]">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Content Body */}
                    <div className="leading-relaxed whitespace-pre-line text-xs sm:text-[13px] text-slate-200">
                      {msg.content}
                    </div>

                    {/* 5. Visible note on offline fallback answers */}
                    {msg.isOfflineFallback && (
                      <div className="pt-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-700/80 text-[10px] font-mono text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Answered from offline knowledge base.</span>
                        </div>
                      </div>
                    )}

                    {/* Observed Facts Accordion */}
                    {msg.observedFacts && msg.observedFacts.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleFacts(msg.id)}
                          className="flex items-center justify-between w-full p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3 text-cyan-400" />
                            <span className="font-semibold uppercase tracking-wider">
                              Observed Facts ({msg.observedFacts.length})
                            </span>
                          </div>
                          {expandedFacts[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                        </button>

                        {expandedFacts[msg.id] && (
                          <div className="mt-1.5 p-2.5 rounded-lg bg-black/40 border border-cyan-500/20 text-[11px] space-y-1 font-mono text-slate-300">
                            {msg.observedFacts.map((fact, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-cyan-400 select-none">▸</span>
                                <span>{fact}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Citations Cards */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                          Cited Sources:
                        </span>
                        {msg.citations.map((cite) => (
                          <div
                            key={cite.id}
                            className="p-2 rounded-lg bg-black/40 border border-white/10 text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-white truncate">{cite.title}</span>
                              <EvidenceBadge level={cite.evidenceLevel} size="xs" />
                            </div>
                            <p className="text-[10px] text-slate-400 italic line-clamp-2">
                              "{cite.quote}"
                            </p>
                            {cite.experimentId && (
                              <Link
                                to={`/experiment/${cite.experimentId}`}
                                onClick={closeDrawer}
                                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono pt-0.5"
                              >
                                <span>Telemetry Viewer</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Caveats */}
                    {msg.caveats && msg.caveats.length > 0 && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
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
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/10 max-w-[80%]">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    Retrieving NASA PSI literature...
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggested Context Prompts */}
            {suggestedPrompts.length > 0 && (
              <div className="px-4 py-2 bg-slate-900/40 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>SUGGESTED PROMPTS</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {suggestedPrompts.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(p)}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <footer className="p-3 bg-slate-900/80 border-t border-white/15 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <textarea
                  ref={inputRef}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask a scientific combustion question..."
                  rows={2}
                  className="flex-1 bg-black/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs p-2.5 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!inputQuery.trim() || isLoading}
                  icon={<Send className="w-3.5 h-3.5" />}
                  className="shrink-0 h-10 px-3.5"
                >
                  Send
                </Button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 px-1">
                <span>Enter to submit, Shift+Enter for newline</span>
                <span className="font-mono text-cyan-400/80">PRD §19 Grounded RAG</span>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AskDrawer;
