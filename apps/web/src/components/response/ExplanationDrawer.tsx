import React, { useState, useEffect, useCallback } from 'react';
import type { ExplanationDepth, ProgressiveExplanation } from '../../lib/fire/upgrade/types.ts';
import {
  getStoredExplanationDepth,
  setStoredExplanationDepth,
} from '../../lib/fire/upgrade/explanationContent.ts';
import { BookOpen, Check, ChevronRight, HelpCircle, Info, Sparkles, Wrench, X } from 'lucide-react';

export interface ExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: ProgressiveExplanation;
  t: number;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  isOpen,
  onClose,
  explanation,
  t,
}) => {
  const [depth, setDepth] = useState<ExplanationDepth>(() => getStoredExplanationDepth());

  const handleDepthChange = useCallback((newDepth: ExplanationDepth) => {
    setDepth(newDepth);
    setStoredExplanationDepth(newDepth);
  }, []);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <aside
      role="region"
      aria-label="Contextual Explanation Drawer"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-[#09111c]/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col font-sans text-slate-200 transition-transform duration-300 ease-out"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-[#0d1726]/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-wide text-white truncate">
              {explanation.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold">
                t = {t.toFixed(1)}s
              </span>
              <span className="uppercase text-slate-400 tracking-wider">
                {explanation.trigger.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close explanation drawer"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 3-Level Progressive Depth Switcher */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-[#060b13]/40">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => handleDepthChange('quick')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              depth === 'quick'
                ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Quick</span>
          </button>

          <button
            onClick={() => handleDepthChange('science')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              depth === 'science'
                ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>Science</span>
          </button>

          <button
            onClick={() => handleDepthChange('engineering')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              depth === 'engineering'
                ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="h-3 w-3" />
            <span>Engineering</span>
          </button>
        </div>
      </div>

      {/* Explanation Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm leading-relaxed">
        {depth === 'quick' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider font-mono">
                <Info className="h-3.5 w-3.5" />
                <span>Plain Language Summary</span>
              </div>
              <p className="text-slate-100 text-sm leading-relaxed">
                {explanation.quick}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Why does this matter?</div>
              <p>
                In spaceflight, human senses and conventional Earth detectors cannot reliably detect smoldering fires without forced airflow. Understanding the timeline prevents false alarms and ensures rapid containment.
              </p>
            </div>
          </div>
        )}

        {depth === 'science' && (
          <div className="space-y-4">
            {/* Physical Mechanism */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Physical Transport Mechanism
              </div>
              <p className="text-slate-200 leading-relaxed">
                {explanation.science.mechanism}
              </p>
            </div>

            {/* Key Quantities */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2.5">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Measurable Quantities & Units
              </div>
              <ul className="space-y-1.5 font-mono text-xs">
                {explanation.science.quantities.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Limitations */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-amber-400" />
                <span>Model Limitations</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
                {explanation.science.limitation}
              </p>
            </div>
          </div>
        )}

        {depth === 'engineering' && (
          <div className="space-y-4 font-mono text-xs">
            {/* State Transition */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                Authoritative State Transition
              </div>
              <div className="text-cyan-300 font-bold text-sm">
                {explanation.engineering.stateTransition}
              </div>
            </div>

            {/* Source Fields */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                Underlying Telemetry Fields
              </div>
              <div className="space-y-1">
                {explanation.engineering.sourceFields.map((f, idx) => (
                  <div key={idx} className="px-2 py-1 rounded bg-slate-950 text-slate-300 text-[11px] border border-slate-800/80">
                    <code>{f}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Threshold Citations */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                Engineering Thresholds & Criteria
              </div>
              <ul className="space-y-1.5">
                {explanation.engineering.thresholds.map((th, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-1.5 text-[11px]">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{th}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Provenance */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5 text-[11px]">
              <div className="text-slate-400 uppercase tracking-wider">
                Provenance Basis
              </div>
              <p className="text-slate-300 leading-relaxed">
                {explanation.engineering.provenance}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-3 border-t border-slate-800 bg-[#060b13] text-[10px] font-mono text-slate-500 text-center">
        Simulated. Not flight software. NASA Space Apps Challenge.
      </div>
    </aside>
  );
};

