import React from 'react';
import { motion } from 'framer-motion';

export interface SelfDrawingArrowProps {
  direction: 'up' | 'down' | 'left' | 'right';
  color?: string;
  label?: string;
  duration?: number;
  delay?: number;
  reduceMotion?: boolean;
  className?: string;
}

export const SelfDrawingArrow: React.FC<SelfDrawingArrowProps> = ({
  direction,
  color = direction === 'up' ? '#f59e0b' : '#38bdf8',
  label,
  duration = direction === 'up' ? 0.3 : 0.5,
  delay = 0,
  reduceMotion = false,
  className = '',
}) => {
  const isUp = direction === 'up';
  const isRight = direction === 'right';
  const isHorizontal = isRight || direction === 'left';

  return (
    <div className={`flex flex-col items-center gap-1 select-none pointer-events-none ${className}`}>
      {/* Label chip if provided */}
      {label && (
        <motion.span
          initial={{ opacity: 0, y: isUp ? 6 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: delay + duration * 0.8 }}
          className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wide border shadow backdrop-blur-sm"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}40`,
            color: color,
          }}
        >
          {label}
        </motion.span>
      )}

      {/* Animated SVG Arrow */}
      {isHorizontal ? (
        <svg
          width="70"
          height="28"
          viewBox="0 0 70 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
          aria-hidden="true"
        >
          {isRight ? (
            <>
              <motion.path
                d="M5 14 L58 14"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration, delay, ease: 'easeOut' }}
              />
              <motion.path
                d="M52 6 L62 14 L52 22"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, delay: delay + duration, ease: 'backOut' }}
              />
            </>
          ) : (
            <>
              <motion.path
                d="M65 14 L12 14"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration, delay, ease: 'easeOut' }}
              />
              <motion.path
                d="M18 6 L8 14 L18 22"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, delay: delay + duration, ease: 'backOut' }}
              />
            </>
          )}
        </svg>
      ) : (
        <svg
          width="28"
          height="70"
          viewBox="0 0 28 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
          aria-hidden="true"
        >
          {isUp ? (
            // Upward Arrow: Line starts at bottom (y=65) and draws to top (y=10)
            <>
              <motion.path
                d="M14 65 L14 12"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration, delay, ease: 'easeOut' }}
              />
              <motion.path
                d="M6 18 L14 8 L22 18"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, delay: delay + duration, ease: 'backOut' }}
              />
            </>
          ) : (
            // Downward Arrow: Line starts at top (y=5) and draws to bottom (y=58)
            <>
              <motion.path
                d="M14 5 L14 58"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration, delay, ease: 'easeOut' }}
              />
              <motion.path
                d="M6 52 L14 62 L22 52"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, delay: delay + duration, ease: 'backOut' }}
              />
            </>
          )}
        </svg>
      )}
    </div>
  );
};

