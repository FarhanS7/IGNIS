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
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const holdingRef = useRef<boolean>(false);
  holdingRef.current = holding;

  const startHoldTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const confirmedRef = useRef<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Reset state when isArmed changes
  useEffect(() => {
    if (!isArmed) {
      confirmedRef.current = false;
      setProgress(0);
      setHolding(false);
      startHoldTimeRef.current = null;
      setHintMessage(null);
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
    setHintMessage(null);
    setHolding(true);
    startHoldTimeRef.current = performance.now();
  }, [isArmed, mode]);

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    setHolding(false);
    startHoldTimeRef.current = null;

    // If released prematurely, give immediate visible guidance
    if (progress > 0 && progress < 1.0 && !confirmedRef.current) {
      setHintMessage('Keep holding for 1.2s to confirm');
      setTimeout(() => setHintMessage(null), 2500);
    }
    setProgress(0);
  }, [progress]);

  // Global keyboard listener for Space and Enter (works anywhere on page without prior tab focus)
  useEffect(() => {
    if (!isArmed || mode !== 'CREWED') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
        e.preventDefault();
        if (!e.repeat && !holdingRef.current) {
          startHold();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
        e.preventDefault();
        endHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isArmed, mode, startHold, endHold]);

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
  const remainingSeconds = Math.max(0, ((1 - progress) * (holdDurationMs / 1000))).toFixed(1);

  return (
    <div
      role="region"
      aria-label="Fire suppression confirmation gate"
      className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] select-none animate-in fade-in duration-300"
    >
      {/* Screen reader live updates */}
      <div className="sr-only" role="status" aria-live="assertive">
        {announcement}
      </div>

      {mode === 'CREWED' ? (
        <div className="flex flex-col items-center gap-3 max-w-sm w-full bg-[#070e1a]/95 border border-cyan-500/40 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
          {/* Gate Title */}
          <div className="font-sans font-bold text-base text-white tracking-tight text-center">
            Confirm to release suppression
          </div>

          {/* Circular Hold-to-Confirm Button with Pointer Capture */}
          <button
            ref={buttonRef}
            type="button"
            aria-label="Hold to confirm fire suppression"
            onPointerDown={(e) => {
              e.preventDefault();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Ignore pointer capture errors on older engines
              }
              startHold();
            }}
            onPointerUp={(e) => {
              try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
              } catch {
                // Ignore
              }
              endHold();
            }}
            onPointerCancel={(e) => {
              try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
              } catch {
                // Ignore
              }
              endHold();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              startHold();
            }}
            onMouseUp={endHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold();
            }}
            onTouchEnd={endHold}
            className={`relative w-32 h-32 rounded-full border-0 bg-[#0a1526] text-white cursor-pointer touch-none focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-2xl transition-all ${
              holding
                ? 'scale-105 ring-4 ring-cyan-400 shadow-[0_0_30px_rgba(56,228,164,0.45)]'
                : 'hover:scale-102 hover:border-cyan-400/60'
            }`}
          >
            {/* SVG Progress Ring */}
            <svg viewBox="0 0 118 118" className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
              <circle
                cx="59"
                cy="59"
                r="54"
                fill="none"
                stroke="#1d3350"
                strokeWidth="7"
              />
              <circle
                cx="59"
                cy="59"
                r="54"
                fill="none"
                stroke={progress >= 1.0 ? '#38e4a4' : '#22d3ee'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-75"
              />
            </svg>

            {/* Inner Label & Live Countdown */}
            <div className="relative z-10 flex flex-col items-center justify-center font-sans tracking-wide leading-tight text-center pointer-events-none px-2">
              {holding ? (
                <>
                  <span className="text-cyan-300 font-bold text-xs uppercase tracking-wider">Holding</span>
                  <span className="text-white font-mono font-bold text-lg">{remainingSeconds}s</span>
                </>
              ) : (
                <>
                  <span className="text-white font-bold text-sm">Hold to</span>
                  <span className="text-cyan-300 font-bold text-sm">confirm</span>
                </>
              )}
            </div>
          </button>

          {/* Quick-Release Helper Hint */}
          {hintMessage && (
            <div className="px-3 py-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-sans animate-bounce">
              {hintMessage}
            </div>
          )}

          {/* Instruction & Keyboard Hint */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
            <span className="px-3 py-1 rounded-lg bg-black/80 border border-slate-700 text-xs font-sans text-slate-300">
              Press and hold for 1.2 seconds · Space or Enter
            </span>
            {onStandDown && (
              <button
                type="button"
                onClick={onStandDown}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-sans text-slate-300 transition-colors"
              >
                Stand down
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Uncrewed Auto Mode Badge */
        <div className="px-4 py-3 rounded-xl border border-cyan-500/50 bg-cyan-950/90 backdrop-blur-md flex items-center gap-2.5 text-xs font-sans text-cyan-300 shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">Uncrewed mode:</span>
          <span>Automatic suppression authorized by system</span>
        </div>
      )}

      {/* Mandatory FLEX Droplet Combustion Caveat Chip */}
      <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
        <span className="px-2.5 py-0.5 rounded border border-cyan-800/50 bg-[#06121f]/90 text-cyan-400 text-[10px] font-mono tracking-wide pointer-events-auto">
          Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.
        </span>
      </div>
    </div>
  );
};

export default HoldToConfirmGate;
