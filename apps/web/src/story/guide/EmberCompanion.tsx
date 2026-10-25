import React, { useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import { Minimize2, MessageSquare } from 'lucide-react';
import type { Beat, AvatarDock } from '../types';
import { resolveDock, velocityToTilt } from '../storyUtils';
import { GuideOrb } from './GuideOrb';

export interface EmberCompanionProps {
  activeBeat?: Beat;
  onSkip?: () => void;
  gravityG?: number;
  emberEnabled?: boolean;
  reduceMotionOverride?: 'system' | 'true' | 'false';
}

export const EmberCompanion: React.FC<EmberCompanionProps> = ({
  activeBeat,
  onSkip,
  gravityG,
  emberEnabled = true,
  reduceMotionOverride = 'system',
}) => {
  const systemReducedMotion = useReducedMotion();
  const shouldReduceMotion =
    reduceMotionOverride === 'true'
      ? true
      : reduceMotionOverride === 'false'
      ? false
      : systemReducedMotion;

  // Viewport tracking for mobile/desktop layout
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll velocity reaction (tilt Ember clamped to +/-8 deg, returns to 0 when still)
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 280,
    damping: 35,
  });

  const tiltDeg = useTransform(smoothVelocity, (latest) => {
    if (shouldReduceMotion) return 0;
    return velocityToTilt(latest);
  });

  if (!emberEnabled || !activeBeat) {
    return null;
  }

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  // Scaled avatar size: 64px on mobile, 80px on tablet, 108px on desktop
  const avatarSize = isMobile ? 64 : isTablet ? 80 : 108;

  // Resolve dock for active beat
  const targetDock: AvatarDock = resolveDock(activeBeat, isMobile);

  if (targetDock === 'hidden') {
    return null;
  }

  // Minimized Floating Chip (collapses into a small chip that expands on tap)
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 sm:right-6 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#071329]/95 border border-amber-500/40 text-amber-300 shadow-2xl backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer text-xs font-mono font-semibold focus-visible:outline-2 focus-visible:outline-amber-400"
          aria-label="Expand Ember guide companion dialogue"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Ember</span>
          <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded-full bg-white/5 border border-white/10 capitalize">
            {activeBeat.avatar.expression}
          </span>
        </button>
      </div>
    );
  }

  const isRightDocked = (targetDock === 'right' || isTablet) && !isMobile;
  const isLeftDocked = targetDock === 'left' && !isMobile && !isTablet;

  // Viewport-anchored positioning ensures Ember is never clipped off-screen
  const containerClasses = isMobile
    ? 'fixed bottom-22 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col-reverse items-center gap-2 w-full max-w-[calc(100vw-24px)]'
    : isRightDocked
    ? 'fixed bottom-20 sm:bottom-24 right-4 sm:right-6 lg:right-8 z-30 pointer-events-none flex flex-row-reverse items-end gap-3 max-w-[calc(100vw-32px)] sm:max-w-md md:max-w-lg'
    : isLeftDocked
    ? 'fixed bottom-20 sm:bottom-24 left-4 sm:left-6 lg:left-8 z-30 pointer-events-none flex flex-row items-end gap-3 max-w-[calc(100vw-32px)] sm:max-w-md md:max-w-lg'
    : 'fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col-reverse items-center gap-2 w-full max-w-lg';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeBeat.id}-${targetDock}`}
        className={containerClasses}
        aria-hidden="false"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.97 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 140,
                damping: 18,
              }
        }
      >
        {/* Guide Orb Avatar with Scroll-Linked Tilt */}
        <div className="shrink-0 pointer-events-auto">
          <GuideOrb
            expression={activeBeat.avatar.expression}
            speech={activeBeat.avatar.speech}
            intensity={activeBeat.avatar.intensity}
            tiltDeg={tiltDeg}
            size={avatarSize}
            showBubble={false}
            gravityG={gravityG}
            onSkip={onSkip}
          />
        </div>

        {/* Speech Bubble */}
        <div className="pointer-events-auto w-full max-w-xs sm:max-w-md shadow-2xl">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#071329]/95 border border-amber-500/30 backdrop-blur-md shadow-2xl space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-amber-400 font-mono">
                  Ember
                </span>
                <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 capitalize">
                  {activeBeat.avatar.expression}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="text-[11px] text-slate-400 hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white/40"
                  aria-label="Minimize Ember guide companion"
                  title="Minimize Ember companion"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Minimize</span>
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
                  aria-label="Skip to next beat"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Accessible dialogue text */}
            <div
              aria-live="polite"
              className="text-slate-100 leading-relaxed font-sans"
            >
              {activeBeat.avatar.speech}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
