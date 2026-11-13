import React, { useEffect } from 'react';
import {
  X,
  Trophy,
  Flame,
  Zap,
  Sliders,
  ShieldAlert,
  Layers,
} from 'lucide-react';

export interface JudgeExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTeflon?: () => void;
  onExploreTimeline?: () => void;
}

export const JudgeExecutiveSummaryModal: React.FC<JudgeExecutiveSummaryModalProps> = ({
  isOpen,
  onClose,
  onJumpToTeflon,
  onExploreTimeline,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Executive Brief for Judges"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#060b14]/95 border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-slate-100 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Executive Brief"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_16px_rgba(58,215,255,0.25)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                IGNIS Executive Brief & Judge Quick-Scan
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] uppercase font-bold">
                30s Overview
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              NASA Space Apps Challenge: Autonomous Microgravity Fire Response System
            </p>
          </div>
        </div>

        {/* Honesty badges */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          <span className="px-2.5 py-0.5 rounded border border-amber-600/40 bg-amber-950/50 text-amber-300 text-[10px] font-mono">
            Simulated. Not flight software.
          </span>
          <span className="px-2.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300 text-[10px] font-mono">
            Trained on Earth-gravity data. Not validated in microgravity.
          </span>
        </div>

        {/* 3-Column Bento Grid: Physics, Breakthrough, Sequencer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
          {/* Card 1: The Space Physics Barrier */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 mb-2">
                <Flame className="h-4 w-4 shrink-0" />
                <span>1. ZERO-G PHYSICS</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                No Buoyancy, Quiet Diffusion
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Without gravity, hot gases do not rise. Flames form silent, spherical diffusion balls with no flickering plume.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-amber-500/20 text-[11px] text-amber-200/90 leading-tight">
                <span className="font-bold">The Sensor Flaw:</span> Traditional optical detectors either false-alarm on floating station dust, or miss sub-micron wire overheat smoke entirely.
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/5 text-[10px] text-slate-400 font-mono">
              Observed in NASA BASS-II & SAME flight data.
            </div>
          </div>

          {/* Card 2: The Multi-Sensor Breakthrough */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 mb-2">
                <Zap className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>2. AI MULTI-SENSOR</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                The 13s vs 15s Mystery Solved
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                IGNIS fuses smoke obscuration with carbon monoxide (CO) and temperature rate over a 6-second persistence window.
              </p>

              <div className="mt-3 space-y-1.5 text-[11px]">
                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 leading-tight">
                  <span className="font-bold text-white">Cellulose (13s vs 15s):</span> Standard alarms at 13s without checking dust. IGNIS confirms CO across 6s, latching at 15s to filter false alarms.
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 leading-tight">
                  <span className="font-bold text-white">Teflon Overheat:</span> Sub-micron particles delay optical scattering by 10s. IGNIS catches CO outgassing and alarms <span className="font-bold text-emerald-300">10s earlier</span>!
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/5 text-[10px] text-cyan-400 font-mono">
              Eliminates station false alarms.
            </div>
          </div>

          {/* Card 3: Autonomous Sequencer & Life Protection */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 mb-2">
                <Sliders className="h-4 w-4 shrink-0" />
                <span>3. LIFE PROTECTION</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                27-Second Auto Containment
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic autonomous sequencing prevents catastrophic station venting while protecting astronaut airways.
              </p>

              <div className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/50">
                  <span className="text-cyan-400 font-bold font-mono">01</span>
                  <span>HVAC duct dampers seal in milliseconds</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/50">
                  <span className="text-cyan-400 font-bold font-mono">02</span>
                  <span>Avionics power severed at origin</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/50">
                  <span className="text-cyan-400 font-bold font-mono">03</span>
                  <span>Fine water mist extinguishes flame</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-white/5 text-[10px] text-emerald-400 font-mono">
              ~45 m³ station atmosphere preserved.
            </div>
          </div>
        </div>

        {/* Human Safety Gate Highlight */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5 my-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">Strict NASA Safety Rule:</span> In Crewed mode, suppression agent release is never autonomous. A human crew confirmation is strictly enforced via the hold-to-confirm safety gate.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            {onJumpToTeflon && (
              <button
                onClick={() => {
                  onJumpToTeflon();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 text-xs font-sans transition-colors cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Test Teflon Wire (AI ~10s faster)</span>
              </button>
            )}

            {onExploreTimeline && (
              <button
                onClick={() => {
                  onExploreTimeline();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-sans transition-colors cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Explore Full 100s Timeline</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-sans font-medium transition-colors shadow-md cursor-pointer ml-auto"
          >
            Got it, Let's Watch Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgeExecutiveSummaryModal;
