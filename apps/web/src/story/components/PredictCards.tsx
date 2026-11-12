import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Circle, Sparkles, Check } from 'lucide-react';
import type { PredictChoice } from '../types';

export interface PredictCardsProps {
  choices: PredictChoice[];
  selectedId: string | null;
  onSelect: (choice: PredictChoice) => void;
  disabled?: boolean;
  reduceMotion?: boolean;
}

export const PredictCards: React.FC<PredictCardsProps> = ({
  choices,
  selectedId,
  onSelect,
  disabled = false,
  reduceMotion = false,
}) => {
  const getIcon = (shape: string) => {
    switch (shape) {
      case 'teardrop':
        return <Flame className="w-6 h-6 text-amber-400" />;
      case 'sphere':
        return <Circle className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />;
      case 'flat':
      case 'spark':
      default:
        return <Sparkles className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mx-auto my-3 select-none">
      {choices.map((choice) => {
        const isSelected = selectedId === choice.id;

        return (
          <motion.button
            key={choice.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(choice)}
            whileHover={!reduceMotion && !disabled ? { y: -4, scale: 1.02 } : undefined}
            whileTap={!reduceMotion && !disabled ? { scale: 0.98 } : undefined}
            className={`relative p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col items-center sm:items-start gap-2 shadow-lg ${
              isSelected
                ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-cyan-950/50'
                : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500 text-slate-200'
            } ${disabled ? 'opacity-80 cursor-default' : ''}`}
            aria-pressed={isSelected}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                {getIcon(choice.shapePreview)}
              </div>
              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            {/* Label */}
            <span className="font-semibold text-sm sm:text-base leading-snug">
              {choice.label}
            </span>

            {/* Selection indicator pill */}
            <span className="text-[11px] font-mono text-slate-400">
              {isSelected ? 'Your guess' : 'Tap to choose'}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

