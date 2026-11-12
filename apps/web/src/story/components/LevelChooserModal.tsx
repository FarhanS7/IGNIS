import React from 'react';
import { Sparkles, Compass, Atom, Check, X } from 'lucide-react';
import { type StoryLevel, LEVEL_CONFIGS, setStoryLevel, setLevelChosen } from '../levels';

export interface LevelChooserModalProps {
  isOpen: boolean;
  currentLevel: StoryLevel;
  onSelectLevel: (level: StoryLevel) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LevelChooserModal: React.FC<LevelChooserModalProps> = ({
  isOpen,
  currentLevel,
  onSelectLevel,
  onClose,
  canDismiss = true,
}) => {
  if (!isOpen) return null;

  const handleChoose = (level: StoryLevel) => {
    setStoryLevel(level);
    setLevelChosen(true);
    onSelectLevel(level);
    if (onClose) onClose();
  };

  const levelIcons = {
    little: Sparkles,
    explorer: Compass,
    scientist: Atom,
  };

  const levelStyles = {
    little: 'border-amber-400/50 hover:border-amber-400 bg-amber-950/25 focus-visible:ring-amber-400',
    explorer: 'border-cyan-400/50 hover:border-cyan-400 bg-cyan-950/25 focus-visible:ring-cyan-400',
    scientist: 'border-indigo-400/50 hover:border-indigo-400 bg-indigo-950/25 focus-visible:ring-indigo-400',
  };

  const badgeStyles = {
    little: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    explorer: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    scientist: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-chooser-title"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#071329] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        {canDismiss && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close level selector"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalize Your Journey</span>
          </div>
          <h2 id="level-chooser-title" className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] text-white">
            Who is exploring today?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-['Hanken_Grotesk']">
            Choose the experience tailored to you. Switch any time during any chapter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(['little', 'explorer', 'scientist'] as StoryLevel[]).map((lvl) => {
            const config = LEVEL_CONFIGS[lvl];
            const Icon = levelIcons[lvl];
            const isSelected = currentLevel === lvl;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleChoose(lvl)}
                className={`relative flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                  levelStyles[lvl]
                } ${isSelected ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'opacity-90 hover:opacity-100'}`}
                style={{ minHeight: '180px' }}
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className="p-3 rounded-xl bg-white/10 text-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${badgeStyles[lvl]}`}>
                    {config.badge}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center justify-between">
                    <span>{config.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </h3>
                  <p className="text-xs font-mono text-cyan-300">{config.tagline}</p>
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">{config.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Max {config.maxWords} words/beat</span>
                  <span className="text-cyan-400 font-semibold">Select →</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-center text-xs text-slate-400 font-mono">
          <span>All 3 levels use the same real NASA flight data. Switch freely via the top toolbar.</span>
        </div>
      </div>
    </div>
  );
};

