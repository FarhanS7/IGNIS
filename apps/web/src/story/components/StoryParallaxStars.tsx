import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useQualityTier } from '../../visuals/useQualityTier';

export const StoryParallaxStars: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const quality = useQualityTier();
  const { scrollYProgress } = useScroll();

  // Layer 1: Distant micro-stars (slow parallax drift: 0 to -80px)
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -90]);

  // Layer 2: Closer faint starlight (moderate parallax drift: 0 to -220px)
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -220]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Parallax Star Layer 1: Slow Background Field */}
      <motion.div
        className="absolute inset-0 w-full h-[120%]"
        style={{ y: shouldReduceMotion ? 0 : layer1Y }}
      >
        <svg
          className="w-full h-full opacity-35"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Scattered distant star dots */}
          <circle cx="10%" cy="12%" r="1" fill="#ffffff" />
          <circle cx="28%" cy="8%" r="1.2" fill="#5fd0e1" />
          <circle cx="45%" cy="24%" r="0.8" fill="#ffffff" />
          <circle cx="68%" cy="15%" r="1" fill="#fff3b0" />
          <circle cx="85%" cy="28%" r="1.1" fill="#ffffff" />
          <circle cx="18%" cy="42%" r="0.8" fill="#ffffff" />
          <circle cx="36%" cy="56%" r="1" fill="#5fd0e1" />
          <circle cx="58%" cy="48%" r="1.2" fill="#ffffff" />
          <circle cx="78%" cy="62%" r="0.9" fill="#ffaa40" />
          <circle cx="92%" cy="45%" r="1" fill="#ffffff" />
          <circle cx="12%" cy="75%" r="1.1" fill="#ffffff" />
          <circle cx="32%" cy="85%" r="0.8" fill="#fff3b0" />
          <circle cx="52%" cy="78%" r="1" fill="#5fd0e1" />
          <circle cx="72%" cy="92%" r="1.2" fill="#ffffff" />
          <circle cx="88%" cy="80%" r="0.8" fill="#ffffff" />
        </svg>
      </motion.div>

      {/* Parallax Star Layer 2: Medium Midground Field (Disabled on low quality tier or reduced motion) */}
      {!shouldReduceMotion && quality.tier !== 'low' && (
        <motion.div
          className="absolute inset-0 w-full h-[140%]"
          style={{ y: layer2Y }}
        >
          <svg
            className="w-full h-full opacity-25"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Midground brighter star specks */}
            <circle cx="22%" cy="18%" r="1.6" fill="#5fd0e1" />
            <circle cx="75%" cy="22%" r="1.8" fill="#ffffff" />
            <circle cx="15%" cy="55%" r="1.5" fill="#ffaa40" />
            <circle cx="82%" cy="68%" r="1.6" fill="#ffffff" />
            <circle cx="48%" cy="88%" r="1.8" fill="#5fd0e1" />
            <circle cx="65%" cy="40%" r="1.4" fill="#fff3b0" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
