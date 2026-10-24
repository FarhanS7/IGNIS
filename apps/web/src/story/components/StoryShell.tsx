import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import type { Chapter, StoryMode } from '../types';
import {
  getChapterProgress,
  saveChapterProgress,
  clearChapterProgress,
  type ChapterProgress,
} from '../storage';
import { BeatRenderer } from './BeatRenderer';
import { GlossaryModal } from './GlossaryModal';

export interface StoryShellProps {
  chapter: Chapter;
}

export const StoryShell: React.FC<StoryShellProps> = ({ chapter }) => {
  const savedInitial = useMemo(() => getChapterProgress(chapter.slug), [chapter.slug]);

  const [mode, setMode] = useState<StoryMode>(() => savedInitial?.mode ?? 'full');
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(() => savedInitial?.currentBeatIndex ?? 0);
  const [completedBeatIds, setCompletedBeatIds] = useState<string[]>(() => savedInitial?.completedBeatIds ?? []);
  const [predictedChoiceId, setPredictedChoiceId] = useState<string | undefined>(() => savedInitial?.predictedChoiceId);
  const [checkAnswerId, setCheckAnswerId] = useState<string | undefined>(() => savedInitial?.checkAnswerId);
  const [glossaryOpen, setGlossaryOpen] = useState<boolean>(false);
  const [glossaryHighlight, setGlossaryHighlight] = useState<string | undefined>(undefined);
  const [resumedBannerVisible, setResumedBannerVisible] = useState<boolean>(
    () => Boolean(savedInitial && savedInitial.currentBeatIndex > 0)
  );

  // Filter beats by active mode ('quick' or 'full')
  const activeBeats = useMemo(() => {
    return chapter.beats.filter((b) => b.modes.includes(mode));
  }, [chapter.beats, mode]);

  // Save progress helper
  const persist = useCallback(
    (index: number, modeToSave: StoryMode = mode) => {
      const currentBeat = activeBeats[index];
      const newCompleted = currentBeat
        ? Array.from(new Set([...completedBeatIds, currentBeat.id]))
        : completedBeatIds;

      const progress: ChapterProgress = {
        chapterSlug: chapter.slug,
        currentBeatIndex: index,
        completedBeatIds: newCompleted,
        predictedChoiceId,
        checkAnswerId,
        mode: modeToSave,
        lastUpdated: Date.now(),
      };
      saveChapterProgress(progress);
    },
    [chapter.slug, activeBeats, completedBeatIds, predictedChoiceId, checkAnswerId, mode]
  );

  const handleNextBeat = useCallback(() => {
    setCurrentBeatIndex((prev) => {
      if (prev < activeBeats.length - 1) {
        const nextIndex = prev + 1;
        persist(nextIndex);
        const nextBeat = activeBeats[nextIndex];
        const el = document.getElementById(`beat-${nextBeat.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        return nextIndex;
      }
      return prev;
    });
  }, [activeBeats, persist]);

  const handleSelectPrediction = (choiceId: string) => {
    setPredictedChoiceId(choiceId);
    persist(currentBeatIndex);
  };

  const handleSelectCheckAnswer = (choiceId: string) => {
    setCheckAnswerId(choiceId);
    persist(currentBeatIndex);
  };

  const handleRestart = () => {
    clearChapterProgress(chapter.slug);
    setCurrentBeatIndex(0);
    setCompletedBeatIds([]);
    setPredictedChoiceId(undefined);
    setCheckAnswerId(undefined);
    setResumedBannerVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeChange = (newMode: StoryMode) => {
    setMode(newMode);
    setCurrentBeatIndex(0);
    persist(0, newMode);
  };

  const handleOpenGlossary = (term?: string) => {
    setGlossaryHighlight(term);
    setGlossaryOpen(true);
  };

  // Keyboard navigation (R9: full keyboard navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (glossaryOpen) {
        if (e.key === 'Escape') setGlossaryOpen(false);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'j') {
        handleNextBeat();
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        setCurrentBeatIndex((prev) => {
          if (prev > 0) {
            const prevIndex = prev - 1;
            persist(prevIndex);
            const prevBeat = activeBeats[prevIndex];
            const el = document.getElementById(`beat-${prevBeat.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return prevIndex;
          }
          return prev;
        });
      } else if (e.key === 'g' || e.key === 'G') {
        setGlossaryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBeats, glossaryOpen, handleNextBeat, persist]);

  const progressPercentage = Math.round(
    ((currentBeatIndex + 1) / Math.max(1, activeBeats.length)) * 100
  );

  return (
    <div className="min-h-screen bg-[#040e1f] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
      {/* Top Sticky Navigation & Progress Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#061226]/95 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Back & Chapter Info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/stories/v2"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 shrink-0"
              aria-label="Back to story index"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 truncate">
                Chapter {chapter.number} • {chapter.title}
              </div>
              <div className="text-xs font-semibold text-white truncate">
                Beat {currentBeatIndex + 1} of {activeBeats.length}:{' '}
                <span className="text-slate-300 font-normal">
                  {activeBeats[currentBeatIndex]?.title || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Tour / Full Journey Toggle */}
            <div className="hidden sm:flex items-center rounded-lg bg-black/40 border border-white/10 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleModeChange('quick')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mode === 'quick'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={mode === 'quick'}
              >
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Quick ({chapter.estimatedMinutes.quick}m)
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('full')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mode === 'full'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={mode === 'full'}
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Full ({chapter.estimatedMinutes.full}m)
                </span>
              </button>
            </div>

            {/* Glossary Button */}
            <button
              type="button"
              onClick={() => handleOpenGlossary()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              aria-label="Open Space Science Glossary"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Glossary</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div
          className="w-full h-1 bg-slate-900 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* Resume Banner notification */}
      {resumedBannerVisible && (
        <div className="bg-cyan-950/80 border-b border-cyan-500/30 px-4 py-2.5 text-xs font-mono text-cyan-200 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Resumed where you left off at Beat {currentBeatIndex + 1} ({activeBeats[currentBeatIndex]?.title}).
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart Chapter</span>
            </button>
            <button
              type="button"
              onClick={() => setResumedBannerVisible(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Chapter Content Container */}
      <main className="flex-1 w-full">
        {activeBeats.map((beat, idx) => (
          <BeatRenderer
            key={beat.id}
            beat={beat}
            beatIndex={idx}
            totalBeats={activeBeats.length}
            onOpenGlossary={handleOpenGlossary}
            predictedChoiceId={predictedChoiceId}
            onSelectPrediction={handleSelectPrediction}
            checkAnswerId={checkAnswerId}
            onSelectCheckAnswer={handleSelectCheckAnswer}
            onNextBeat={handleNextBeat}
          />
        ))}

        {/* Chapter Completion Card */}
        <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold font-['Space_Grotesk'] text-white">
            Chapter Complete!
          </h3>
          <p className="text-slate-300 max-w-xl mx-auto text-base">
            You've completed Chapter {chapter.number}: <em>{chapter.title}</em>. You now understand how microgravity cancels buoyancy, why diffusion creates symmetrical spheres, and why forced ventilation governs astronaut fire safety.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review from Start</span>
            </button>
            <Link
              to="/stories/v2"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Space_Grotesk'] text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              Story Mode Chapter Index →
            </Link>
          </div>
        </div>
      </main>

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        items={chapter.glossary}
        highlightTerm={glossaryHighlight}
      />
    </div>
  );
};
