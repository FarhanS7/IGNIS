import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SequencerMode } from '../../lib/fire/types.ts';

export interface HoldToConfirmGateProps {
  isArmed: boolean;
  mode: SequencerMode;
  onConfirm: () => void;
  onStandDown?: () => void;
  autoConfirm?: boolean; // Programmatic hook for capture mode / scripted demos
  holdDurationMs?: number;
}

const CIRCUMFERENCE = 339.3; // 2 * PI * 54

export const HoldToConfirmGate: React.FC<HoldToConfirmGateProps> = ({
  isArmed,
  mode,
  onConfirm,
  onStandDown,
  autoConfirm = false,
  holdDurationMs = 1200,
}) => {
  const [holding, setHolding] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0.0 to 1.0
  const [announcement, setAnnouncement] = useState<string>('');

  const holdingRef = useRef<boolean>(false);
  holdingRef.current = holding;

  const startHoldTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const confirmedRef = useRef<boolean>(false);

  // Reset confirmed flag when isArmed changes
  useEffect(() => {
    if (!isArmed) {
      confirmedRef.current = false;
      setProgress(0);
      setHolding(false);
      startHoldTimeRef.current = null;
    } else {
      setAnnouncement('Suppression armed. Hold to confirm release.');
    }
  }, [isArmed]);

  // Handle programmatic autoConfirm (Capture Mode)
  useEffect(() => {
    if (isArmed && autoConfirm && !confirmedRef.current) {
      const timer = setTimeout(() => {
        confirmedRef.current = true;
        setAnnouncement('Crew confirms. Suppressing fire.');
        onConfirm();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isArmed, autoConfirm, onConfirm]);

  const startHold = useCallback(() => {
    if (!isArmed || confirmedRef.current || mode !== 'CREWED') return;
    setHolding(true);
    startHoldTimeRef.current = performance.now();
  }, [isArmed, mode]);

  const endHold = useCallback(() => {
    setHolding(false);
    startHoldTimeRef.current = null;
    setProgress(0);
  }, []);

  // RAF loop for smooth hold progression
  useEffect(() => {
    if (!holding) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (startHoldTimeRef.current !== null) {
        const elapsed = now - startHoldTimeRef.current;
        const currentProgress = Math.min(1.0, elapsed / holdDurationMs);
        setProgress(currentProgress);

        if (currentProgress >= 1.0 && !confirmedRef.current) {
          confirmedRef.current = true;
          setHolding(false);
          startHoldTimeRef.current = null;
          setAnnouncement('Crew confirms. Suppressing fire.');
          onConfirm();
          return;
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [holding, holdDurationMs, onConfirm]);

  if (!isArmed) return null;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div
      role="region"
      aria-label="Fire suppression confirmation gate"
      className="absolute right-4 sm:right-12 bottom-16 sm:bottom-20 z-20 flex flex-col items-center select-none animate-in fade-in duration-300"
    >
      {/* Screen reader live updates */}
      <div className="sr-only" role="status" aria-live="assertive">
        {announcement}
      </div>

      {mode === 'CREWED' ? (
        <div className="flex flex-col items-center gap-2">
          {/* Circular Hold-to-Confirm Button */}
          <button
            type="button"
            aria-label="Hold to confirm fire suppression"
            onPointerDown={(e) => {
              e.preventDefault();
              startHold();
            }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!e.repeat && !holdingRef.current) startHold();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                endHold();
              }
            }}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-0 bg-[#070e1a]/90 text-white cursor-pointer touch-none focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-2xl backdrop-blur-md active:scale-95 transition-transform"
          >
            {/* SVG Progress Ring */}
            <svg viewBox="0 0 118 118" className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
              <circle
                cx="59"
                cy="59"
                r="54"
                fill="none"
                stroke="#1d3350"
                strokeWidth="6"
              />
              <circle
                cx="59"
                cy="59"
                r="54"
                fill="none"
                stroke="#38e4a4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-75"
              />
            </svg>

            {/* Inner Label */}
            <div className="relative z-10 flex flex-col items-center justify-center font-display font-bold text-xs sm:text-sm tracking-wider uppercase leading-tight text-center pointer-events-none">
              <span className="text-white">Hold to</span>
              <span className="text-cyan-300">Confirm</span>
            </div>
          </button>

          {/* Gate Subtitle / Keyboard Hint */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
            <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[10px] font-mono text-slate-300">
              Hold 1.2s · Space or Enter
            </span>
            {onStandDown && (
              <button
                type="button"
                onClick={onStandDown}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-[10px] font-mono text-slate-300 transition-colors"
              >
                Stand down
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Uncrewed Auto Mode Badge */
        <div className="px-3.5 py-2 rounded-xl border border-cyan-500/50 bg-cyan-950/80 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-cyan-300 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">UNCREWED AUTO:</span>
          <span>Autonomous suppression authorized per flight sequencer</span>
        </div>
      )}

      {/* Mandatory FLEX Droplet Combustion Caveat Chip */}
      <div className="mt-2 text-center">
        <span className="px-2.5 py-0.5 rounded border border-cyan-800/50 bg-[#06121f]/90 text-cyan-400 text-[10px] font-mono tracking-wide">
          Droplet flames only. Not cabin solid fuels.
        </span>
      </div>
    </div>
  );
};

export default HoldToConfirmGate;

