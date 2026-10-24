import React from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import type { GlossaryItem } from '../types';

export interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GlossaryItem[];
  highlightTerm?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  items,
  highlightTerm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#071020]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="glossary-title" className="text-lg font-bold font-['Space_Grotesk'] text-white">
                Space Science Glossary
              </h2>
              <p className="text-xs text-slate-400">
                Key microgravity combustion terms explained simply
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
            aria-label="Close glossary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-white/5">
          {items.map((item) => {
            const isHighlighted = highlightTerm && item.term.toLowerCase() === highlightTerm.toLowerCase();
            return (
              <div
                key={item.term}
                className={`pt-4 first:pt-0 transition-colors rounded-xl p-3 ${
                  isHighlighted ? 'bg-cyan-500/10 border border-cyan-500/30' : ''
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="font-bold text-base text-cyan-300 font-['Space_Grotesk']">
                    {item.term}
                  </h3>
                  {item.pronunciation && (
                    <span className="text-xs text-slate-400 font-mono">
                      /{item.pronunciation}/
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-200 leading-relaxed mb-2 font-sans">
                  {item.shortDefinition}
                </p>

                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-black/30 border border-amber-500/15 text-xs text-amber-200/90">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-400">Analogy: </span>
                    {item.plainAnalogy}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#071020] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
