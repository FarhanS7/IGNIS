import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';

export interface MissionPatchProps {
  chapterNumber: number;
  chapterTitle: string;
  reduceMotion?: boolean;
  onTap?: () => void;
}

export const MissionPatch: React.FC<MissionPatchProps> = ({
  chapterNumber,
  chapterTitle,
  reduceMotion = false,
  onTap,
}) => {
  const [tapped, setTapped] = useState(false);

  const handleClick = () => {
    setTapped(true);
    onTap?.();
    setTimeout(() => setTapped(false), 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center my-6 select-none">
      <motion.div
        initial={
          reduceMotion
            ? { opacity: 1, scale: 1, rotate: 8 }
            : { opacity: 0, scale: 0.2, rotate: -25 }
        }
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 8, // Settles with an 8 degree rotation as specified in the Bible
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
        whileHover={!reduceMotion ? { scale: 1.06, rotate: 10 } : undefined}
        whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
        onClick={handleClick}
        className="relative w-36 h-36 rounded-full p-2.5 bg-gradient-to-br from-amber-500/20 via-slate-900 to-cyan-900/40 border-4 border-amber-400/80 shadow-2xl shadow-amber-500/30 cursor-pointer flex flex-col items-center justify-center text-center group"
        role="button"
        tabIndex={0}
        aria-label={`Mission Patch: Chapter ${chapterNumber} Completed. Tap to celebrate.`}
      >
        {/* Outer Stitched Ring */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-300/40 pointer-events-none" />

        {/* Central Emblems */}
        <Award className="w-10 h-10 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />

        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-300">
          IGNIS MISSION #{chapterNumber}
        </span>
        <span className="font-bold text-[11px] text-white leading-tight px-2 line-clamp-2">
          {chapterTitle}
        </span>

        {/* Sparkle burst on tap */}
        {tapped && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Sparkles className="w-16 h-16 text-yellow-300" />
          </motion.div>
        )}
      </motion.div>

      <span className="mt-2 text-xs font-mono text-amber-300/90 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Mission Badge Earned!</span>
      </span>
    </div>
  );
};

