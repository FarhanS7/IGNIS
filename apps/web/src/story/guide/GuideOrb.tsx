import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import type { AvatarExpression } from '../types';
import { useQualityTier } from '../../visuals/useQualityTier';

export interface GuideOrbProps {
  expression: AvatarExpression;
  speech?: string;
  intensity?: number; // 0.0 to 1.0
  tiltDeg?: number; // External tilt from scroll velocity (-8..+8)
  size?: number; // Pixel diameter (e.g. 160 desktop, 72 mobile)
  showBubble?: boolean;
  className?: string;
  onSkip?: () => void;
  gravityG?: number; // Optional gravity (0g..1g) for 0g variant crossfade
}

export const GuideOrb: React.FC<GuideOrbProps> = ({
  expression,
  speech = '',
  intensity = 0.75,
  tiltDeg = 0,
  size = 140,
  showBubble = true,
  className = '',
  onSkip,
  gravityG,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const quality = useQualityTier();
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const [zeroGFailed, setZeroGFailed] = useState<boolean>(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  // Monitor document visibility to pause animation loops when backgrounded (DELIVERABLE 5)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Typewriter effect (disabled when prefers-reduced-motion is active)
  useEffect(() => {
    if (shouldReduceMotion || !speech) {
      return;
    }

    let index = 0;
    const speed = 18; // ms per character

    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(speech.slice(0, index));
      if (index >= speech.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [speech, shouldReduceMotion]);

  const effectiveText = shouldReduceMotion || !speech ? speech : displayedText;
  const effectiveIsTyping = shouldReduceMotion || !speech ? false : isTyping;

  const handleSkipTyping = useCallback(() => {
    setDisplayedText(speech);
    setIsTyping(false);
    if (onSkip) onSkip();
  }, [speech, onSkip]);

  // Safe clamping of intensity [0.2, 1.0]
  const glowIntensity = Math.max(0.25, Math.min(1.0, intensity));
  const glowBlurRadius = quality.tier === 'low' ? 8 : 18;

  // Expression-driven glow modifier
  const expressionGlowMultiplier = useMemo(() => {
    switch (expression) {
      case 'surprised':
        return 1.35; // glow flare
      case 'thinking':
      case 'serious':
        return 0.85; // glow dimmed ~15% / steady & slightly dimmer
      case 'proud':
        return 1.2;
      case 'curious':
      default:
        return 1.0;
    }
  }, [expression]);

  const baseGlowScale = 1.05 + 0.15 * glowIntensity;

  // Motion cues driven by expression (when expression-specific images are not supplied)
  const expressionMotionStyle = useMemo(() => {
    if (shouldReduceMotion) return { scale: 1, rotate: 0, y: 0 };

    switch (expression) {
      case 'surprised':
        // quick scale pop to 1.12 with spring settle + glow flare
        return {
          scale: [1, 1.12, 1.03],
          rotate: [0, -3, 0],
          y: [0, -4, 0],
          transition: { type: 'spring' as const, stiffness: 350, damping: 15 },
        };
      case 'thinking':
        // slow 4deg tilt, glow dimmed ~15%
        return {
          scale: 0.98,
          rotate: 4,
          y: -2,
          transition: { duration: 0.8, ease: 'easeInOut' as const },
        };
      case 'proud':
        // small bounce (y -10px, spring) + brief sparkle burst
        return {
          scale: [1, 1.06, 1.02],
          y: [0, -10, 0],
          rotate: [0, 2, 0],
          transition: { type: 'spring' as const, stiffness: 280, damping: 12 },
        };
      case 'serious':
        // idle motion paused/steady, glow steady and slightly dimmer
        return {
          scale: 1.0,
          rotate: 0,
          y: 0,
          transition: { duration: 0.5 },
        };
      case 'curious':
      default:
        // gentle lean toward content (3deg) + slow float
        return {
          scale: 1.01,
          rotate: -3,
          y: -3,
          transition: { duration: 0.8, ease: 'easeOut' as const },
        };
    }
  }, [expression, shouldReduceMotion]);

  // Whether idle animation loop should play (paused if serious or document hidden)
  const isIdleActive = !shouldReduceMotion && isDocumentVisible && expression !== 'serious';

  // Fallback SVG/CSS orb (DELIVERABLE 1 fallback)
  const renderSvgFallbackOrb = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md select-none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="emberFallbackHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffaa40" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#ff7a3d" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#e11d48" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5fd0e1" stopOpacity="0.1" />
          </radialGradient>
          <linearGradient id="emberFallbackCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="40%" stopColor="#ffaa40" />
            <stop offset="85%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Outer gentle flame crown / glow */}
        <circle cx="50" cy="50" r="46" fill="url(#emberFallbackHalo)" />
        {/* Main sphere orb */}
        <circle cx="50" cy="50" r="38" fill="url(#emberFallbackCore)" />
        {/* Inner chemiluminescent reflection rim */}
        <ellipse
          cx="44"
          cy="36"
          rx="18"
          ry="10"
          fill="#ffffff"
          fillOpacity="0.28"
          transform="rotate(-18 44 36)"
        />
        {/* Expression face */}
        <g>
          <circle cx="38" cy="46" r="5.5" fill="#071329" />
          <circle cx="62" cy="45" r="6" fill="#071329" />
          <circle cx="39.5" cy="44.5" r="2" fill="#ffffff" />
          <circle cx="63.5" cy="43.5" r="2.2" fill="#ffffff" />
          <path d="M 43 59 Q 50 64 57 60" stroke="#071329" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  };

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-center gap-4 ${className}`}
      role="region"
      aria-label="Ember Guide Companion"
    >
      {/* Avatar Container: Glow -> Image -> Sparkles */}
      <div
        className="relative shrink-0 flex items-center justify-center select-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Layer 1: Soft CSS Radial Glow (blurred, pulsing) */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255, 122, 61, 0.45) 0%, rgba(255, 170, 64, 0.25) 45%, rgba(95, 208, 225, 0.12) 70%, transparent 85%)',
            filter: `blur(${glowBlurRadius}px)`,
          }}
          animate={
            isIdleActive
              ? {
                  opacity: [
                    0.6 * glowIntensity * expressionGlowMultiplier,
                    1.0 * glowIntensity * expressionGlowMultiplier,
                    0.6 * glowIntensity * expressionGlowMultiplier,
                  ],
                  scale: [baseGlowScale, baseGlowScale * 1.08, baseGlowScale],
                }
              : { opacity: 0.8 * glowIntensity * expressionGlowMultiplier, scale: baseGlowScale }
          }
          transition={{
            repeat: isIdleActive ? Infinity : 0,
            duration: 4.8,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        {/* Layer 2: Ember Image (or SVG fallback) with Idle Motion & Expression Pop */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={handleSkipTyping}
          style={{ rotate: tiltDeg }}
          animate={
            isIdleActive
              ? {
                  y: [0, -6, 0],
                  scale: [1.0, 1.03, 1.0],
                  rotate: [tiltDeg - 2, tiltDeg + 2, tiltDeg - 2],
                }
              : { y: 0, scale: 1.0, rotate: tiltDeg }
          }
          transition={{
            repeat: isIdleActive ? Infinity : 0,
            duration: 5.2,
            ease: 'easeInOut',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${expression}-${gravityG !== undefined && gravityG <= 0.05 && !zeroGFailed ? '0g' : 'norm'}`}
              initial={shouldReduceMotion ? false : { opacity: 0.85, scale: 0.96 }}
              animate={{ opacity: 1, ...expressionMotionStyle }}
              exit={shouldReduceMotion ? undefined : { opacity: 0.85, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex items-center justify-center"
            >
              {!imageFailed ? (
                <img
                  src={
                    gravityG !== undefined && gravityG <= 0.05 && !zeroGFailed
                      ? '/avatar/ember-0g.png'
                      : '/avatar/ember-idle.png'
                  }
                  onError={(e) => {
                    const currentSrc = (e.currentTarget as HTMLImageElement).src;
                    if (currentSrc.includes('ember-0g.png')) {
                      setZeroGFailed(true);
                    } else {
                      setImageFailed(true);
                    }
                  }}
                  alt={`Ember, the guide, looking ${expression}`}
                  width={size}
                  height={size}
                  decoding="async"
                  className="w-full h-full object-contain drop-shadow-xl select-none pointer-events-none"
                />
              ) : (
                renderSvgFallbackOrb()
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Layer 3: Tiny drifting spark particles (Disabled on low tier or reduced motion) */}
        {!shouldReduceMotion && quality.tier !== 'low' && isDocumentVisible && (
          <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
            <motion.div
              className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#5fd0e1]"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.9, 0.3],
                scale: [0.7, 1.2, 0.7],
              }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-2 left-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffaa40]"
              animate={{
                y: [0, -8, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.6, 1.1, 0.6],
              }}
              transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut', delay: 0.6 }}
            />
          </div>
        )}
      </div>

      {/* Speech Bubble (fades in on beat enter, typewriter text) */}
      {showBubble && speech && (
        <div className="flex-1 w-full max-w-xl pointer-events-auto">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#071329]/95 border border-amber-500/25 backdrop-blur-md shadow-2xl space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-amber-400 font-mono">
                  Ember
                </span>
                <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 capitalize">
                  {expression}
                </span>
              </div>

              {effectiveIsTyping && (
                <button
                  type="button"
                  onClick={handleSkipTyping}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
                  aria-label="Skip typing animation"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Accessible dialogue text */}
            <div
              aria-live="polite"
              className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans"
            >
              {effectiveText}
              {effectiveIsTyping && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
