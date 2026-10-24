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
import type { Beat, AvatarDock } from '../types';
import { resolveDock, velocityToTilt } from '../storyUtils';
import { GuideOrb } from './GuideOrb';

export interface EmberCompanionProps {
  activeBeat?: Beat;
  onSkip?: () => void;
  gravityG?: number;
}

export const EmberCompanion: React.FC<EmberCompanionProps> = ({
  activeBeat,
  onSkip,
  gravityG,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Viewport tracking for mobile/desktop layout
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const avatarSize = isMobile ? 72 : 160;

  // Resolve dock for active beat
  const targetDock: AvatarDock = activeBeat
    ? resolveDock(activeBeat, isMobile)
    : 'hidden';

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

  if (!activeBeat || targetDock === 'hidden') {
    return null;
  }

  // Calculate spring coordinates on horizontal axis (animating transform x & opacity only: R3)
  // On desktop:
  // left: anchored at left safe edge (32px from screen edge)
  // right: anchored at right safe edge
  // center: centered at bottom of screen
  const getDockPosition = () => {
    if (isMobile) {
      return {
        x: 0,
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
          x: Math.max(0, windowWidth - (avatarSize + 440) - 24),
          y: 0,
          opacity: 1,
        };
      case 'center':
      default:
        return {
          x: Math.max(0, (windowWidth - (avatarSize + 440)) / 2),
          y: 0,
          opacity: 1,
        };
    }
  };

  const dockPos = getDockPosition();

  // Desktop layout order: when docked right, bubble is to the left of Ember; when left, bubble is to right of Ember
  const isRightDocked = targetDock === 'right' && !isMobile;

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-30 pointer-events-none px-3 sm:px-6"
      aria-hidden="false"
    >
      <div className="relative w-full max-w-7xl mx-auto h-0 overflow-visible">
        <motion.div
          className={`absolute bottom-0 flex ${
            isMobile
              ? 'left-1/2 -translate-x-1/2 flex-col-reverse items-center gap-2 max-w-[calc(100vw-24px)]'
              : isRightDocked
              ? 'flex-row-reverse items-end gap-4 max-w-2xl'
              : targetDock === 'center'
              ? 'flex-col-reverse items-center gap-3 max-w-xl'
              : 'flex-row items-end gap-4 max-w-2xl'
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
              className="pointer-events-auto w-full max-w-sm sm:max-w-md shadow-2xl"
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

                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
                    aria-label="Skip to next dialogue or interaction"
                  >
                    Skip
                  </button>
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
