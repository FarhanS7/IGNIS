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
  // Scaled avatar size: 64px on mobile, 80px on tablet, 140px on desktop (D7)
  const avatarSize = isMobile ? 64 : isTablet ? 80 : 140;

  // Resolve dock for active beat
  const targetDock: AvatarDock = resolveDock(activeBeat, isMobile);

  if (targetDock === 'hidden') {
    return null;
  }

  // Minimized Floating Chip (D7: collapses into a small chip that expands on tap)
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

  // Calculate spring coordinates on horizontal axis (animating transform x & opacity only: R4)
  const getDockPosition = () => {
    if (isMobile) {
      return { x: 0, y: 0, opacity: 1 };
    }

    if (isTablet) {
      // On tablet (768px), dock cleanly to right side with compact width to avoid overlapping text/sliders
      return {
        x: Math.max(0, windowWidth - (avatarSize + 340) - 20),
        y: 0,
        opacity: 1,
      };
    }

    switch (targetDock) {
      case 'left':
        return {
          x: 24,
          y: 0,
          opacity: 1,
        };
      case 'right':
        return {
          x: Math.max(0, windowWidth - (avatarSize + 420) - 24),
          y: 0,
          opacity: 1,
        };
      case 'center':
      default:
        return {
          x: Math.max(0, (windowWidth - (avatarSize + 420)) / 2),
          y: 0,
          opacity: 1,
        };
    }
  };

  const dockPos = getDockPosition();
  const isRightDocked = (targetDock === 'right' || isTablet) && !isMobile;

  return (
    <div
      className="fixed bottom-20 sm:bottom-24 left-0 right-0 z-30 pointer-events-none px-3 sm:px-6"
      aria-hidden="false"
    >
      <div className="relative w-full max-w-7xl mx-auto h-0 overflow-visible">
        <motion.div
          className={`absolute bottom-0 flex ${
            isMobile
              ? 'left-1/2 -translate-x-1/2 flex-col-reverse items-center gap-2 max-w-[calc(100vw-24px)]'
              : isRightDocked
              ? 'flex-row-reverse items-end gap-3 max-w-md sm:max-w-lg'
              : targetDock === 'center'
              ? 'flex-col-reverse items-center gap-3 max-w-xl'
              : 'flex-row items-end gap-3 max-w-lg'
          }`}
          style={isMobile ? undefined : { left: 0 }}
          animate={
            isMobile
              ? { opacity: 1 }
              : {
                  x: dockPos.x,
                  opacity: dockPos.opacity,
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: 'spring',
                  stiffness: 120,
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

          {/* Speech Bubble (fades in on beat enter, typewriter text) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBeat.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-xs sm:max-w-md shadow-2xl"
            >
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
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
