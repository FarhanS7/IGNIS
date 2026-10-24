import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AvatarExpression } from '../types';

export interface GuideOrbProps {
  expression: AvatarExpression;
  speech: string;
  intensity?: number; // 0.0 to 1.0
  className?: string;
  onSkip?: () => void;
}

export const GuideOrb: React.FC<GuideOrbProps> = ({
  expression,
  speech,
  intensity = 0.75,
  className = '',
  onSkip,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  // Typewriter effect (disabled when prefers-reduced-motion is active)
  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayedText(speech);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
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

  const handleSkipTyping = () => {
    setDisplayedText(speech);
    setIsTyping(false);
    if (onSkip) onSkip();
  };

  // Safe clamping of intensity [0.2, 1.0]
  const glowIntensity = Math.max(0.25, Math.min(1.0, intensity));
  const glowBlur = Math.round(18 * glowIntensity);
  const glowSpread = Math.round(6 * glowIntensity);

  // SVG Eyes & Mouth based on expression
  const renderFace = () => {
    switch (expression) {
      case 'surprised':
        return (
          <g className="transition-all duration-300">
            {/* Wide round eyes */}
            <circle cx="38" cy="46" r="6" fill="#071329" />
            <circle cx="62" cy="46" r="6" fill="#071329" />
            <circle cx="39.5" cy="44.5" r="2.2" fill="#ffffff" />
            <circle cx="63.5" cy="44.5" r="2.2" fill="#ffffff" />
            {/* Open round mouth */}
            <ellipse cx="50" cy="62" rx="4.5" ry="6.5" fill="#071329" />
          </g>
        );

      case 'thinking':
        return (
          <g className="transition-all duration-300">
            {/* Eyes looking up-right */}
            <ellipse cx="38" cy="44" rx="5" ry="5.5" fill="#071329" />
            <ellipse cx="62" cy="44" rx="5" ry="5.5" fill="#071329" />
            <circle cx="40" cy="42" r="2" fill="#ffffff" />
            <circle cx="64" cy="42" r="2" fill="#ffffff" />
            {/* Tilted brow nuance */}
            <path d="M 33 37 Q 38 35 44 38" stroke="#071329" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Puzzled mouth line */}
            <path d="M 45 62 Q 50 60 55 63" stroke="#071329" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'proud':
        return (
          <g className="transition-all duration-300">
            {/* Cheerful upward squint arcs */}
            <path d="M 33 48 Q 38 41 43 48" stroke="#071329" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M 57 48 Q 62 41 67 48" stroke="#071329" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            {/* Confident beaming smile */}
            <path d="M 41 58 Q 50 67 59 58" stroke="#071329" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'serious':
        return (
          <g className="transition-all duration-300">
            {/* Focused, steady eyes */}
            <ellipse cx="38" cy="46" rx="5.5" ry="4.5" fill="#071329" />
            <ellipse cx="62" cy="46" rx="5.5" ry="4.5" fill="#071329" />
            <circle cx="39" cy="45" r="1.8" fill="#ffffff" />
            <circle cx="63" cy="45" r="1.8" fill="#ffffff" />
            {/* Firm horizontal mouth */}
            <line x1="43" y1="61" x2="57" y2="61" stroke="#071329" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        );

      case 'curious':
      default:
        return (
          <g className="transition-all duration-300">
            {/* Inquisitive eyes with one slightly wider */}
            <circle cx="38" cy="46" r="5.5" fill="#071329" />
            <circle cx="62" cy="45" r="6" fill="#071329" />
            <circle cx="39.5" cy="44.5" r="2" fill="#ffffff" />
            <circle cx="63.5" cy="43.5" r="2.2" fill="#ffffff" />
            {/* Gentle inquisitive smile */}
            <path d="M 43 59 Q 50 64 57 60" stroke="#071329" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 backdrop-blur-md shadow-lg ${className}`}
      role="region"
      aria-label="Guide Avatar Ember"
    >
      {/* Ember Flame Orb Avatar */}
      <motion.div
        className="shrink-0 relative cursor-pointer"
        onClick={handleSkipTyping}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [0, -5, 0],
                scale: [1, 1.02, 1],
              }
        }
        transition={{
          repeat: Infinity,
          duration: 3.2,
          ease: 'easeInOut',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md select-none"
          style={{
            filter: `drop-shadow(0 0 ${glowBlur}px rgba(255, 122, 61, ${0.45 * glowIntensity})) drop-shadow(0 0 ${glowSpread}px rgba(121, 220, 232, ${0.35 * glowIntensity}))`,
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Outer halo gradient */}
            <radialGradient id="emberHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffaa40" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#ff7a3d" stopOpacity="0.8" />
              <stop offset="75%" stopColor="#e11d48" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#5fd0e1" stopOpacity="0.1" />
            </radialGradient>
            {/* Core body gradient */}
            <linearGradient id="emberCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="40%" stopColor="#ffaa40" />
              <stop offset="85%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Outer gentle flame crown / glow */}
          <circle cx="50" cy="50" r="46" fill="url(#emberHalo)" />

          {/* Main sphere orb */}
          <circle cx="50" cy="50" r="38" fill="url(#emberCore)" />

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

          {/* Facial features */}
          {renderFace()}
        </svg>

        {/* Small floating flame spark */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute -top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#5fd0e1]"
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.1,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>

      {/* Speech Bubble */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-amber-400 font-mono">
              Ember
            </span>
            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10">
              Orbital Fire Guide
            </span>
          </div>

          {isTyping && (
            <button
              type="button"
              onClick={handleSkipTyping}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2 transition-colors cursor-pointer"
              aria-label="Skip typing animation"
            >
              Skip
            </button>
          )}
        </div>

        {/* Text with aria-live="polite" */}
        <div
          aria-live="polite"
          className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans"
        >
          {displayedText}
          {isTyping && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};
