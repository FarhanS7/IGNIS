import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle,
  Settings,
  ShieldCheck,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { Chapter, StoryMode, StorySettings } from '../types';
import {
  getChapterProgress,
  saveChapterProgress,
  clearChapterProgress,
  getStorySettings,
  saveStorySettings,
  isOnboardingDismissed,
  setOnboardingDismissed,
  type ChapterProgress,
} from '../storage';
import { calculateRemainingMinutes, clampBeatIndex } from '../storyUtils';
import { BeatRenderer } from './BeatRenderer';
import { GlossaryModal } from './GlossaryModal';
import { StoryParallaxStars } from './StoryParallaxStars';
import { EmberCompanion } from '../guide/EmberCompanion';
import { StoryNavigationDock } from './StoryNavigationDock';
import { StoryChapterMapModal } from './StoryChapterMapModal';
import { StorySettingsPanel } from './StorySettingsPanel';
import { StoryOnboardingModal } from './StoryOnboardingModal';
import { StoryEvidenceLegendModal } from './StoryEvidenceLegendModal';

export interface StoryShellProps {
  chapter: Chapter;
}

export const StoryShell: React.FC<StoryShellProps> = ({ chapter }) => {
  const systemReducedMotion = useReducedMotion();
  const savedInitial = useMemo(() => getChapterProgress(chapter.slug), [chapter.slug]);

  // Mode and progress state
  const [mode, setMode] = useState<StoryMode>(() => savedInitial?.mode ?? 'full');
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#beat-')) {
      const beatId = window.location.hash.replace('#beat-', '');
      const foundIdx = chapter.beats.findIndex((b) => b.id === beatId);
      if (foundIdx !== -1) return foundIdx;
    }
    return savedInitial?.currentBeatIndex ?? 0;
  });
  const [completedBeatIds, setCompletedBeatIds] = useState<string[]>(() => savedInitial?.completedBeatIds ?? []);
  const [predictedChoiceId, setPredictedChoiceId] = useState<string | undefined>(() => savedInitial?.predictedChoiceId);
  const [checkAnswerId, setCheckAnswerId] = useState<string | undefined>(() => savedInitial?.checkAnswerId);

  // Modals & Panels state
  const [glossaryOpen, setGlossaryOpen] = useState<boolean>(false);
  const [glossaryHighlight, setGlossaryHighlight] = useState<string | undefined>(undefined);
  const [chapterMapOpen, setChapterMapOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [legendOpen, setLegendOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => !isOnboardingDismissed());

  // Copy takeaway state
  const [copiedTakeaway, setCopiedTakeaway] = useState<boolean>(false);

  // Settings state (safe storage wrapped)
  const [settings, setSettings] = useState<StorySettings>(() => getStorySettings());

  const [resumedBannerVisible, setResumedBannerVisible] = useState<boolean>(
    () => Boolean(savedInitial && savedInitial.currentBeatIndex > 0)
  );

  // Motion calculation factoring user settings override
  const shouldReduceMotion =
    settings.reduceMotionOverride === 'true'
      ? true
      : settings.reduceMotionOverride === 'false'
      ? false
      : systemReducedMotion;

  // Filter beats by active mode ('quick' or 'full')
  const activeBeats = useMemo(() => {
    return chapter.beats.filter((b) => b.modes.includes(mode));
  }, [chapter.beats, mode]);

  // Dynamic estimated time remaining (D2: computed from content length via pure helper)
  const remainingMinutes = useMemo(() => {
    return calculateRemainingMinutes(activeBeats, currentBeatIndex, mode);
  }, [activeBeats, currentBeatIndex, mode]);

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

  const handleSelectBeat = useCallback(
    (index: number) => {
      const clamped = clampBeatIndex(index, activeBeats.length);
      setCurrentBeatIndex(clamped);
      persist(clamped);
      const target = activeBeats[clamped];
      if (target) {
        const el = document.getElementById(`beat-${target.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `#beat-${target.id}`);
        }
      }
    },
    [activeBeats, persist]
  );

  const handleNextBeat = useCallback(() => {
    if (currentBeatIndex < activeBeats.length - 1) {
      handleSelectBeat(currentBeatIndex + 1);
    }
  }, [currentBeatIndex, activeBeats.length, handleSelectBeat]);

  const handlePrevBeat = useCallback(() => {
    if (currentBeatIndex > 0) {
      handleSelectBeat(currentBeatIndex - 1);
    }
  }, [currentBeatIndex, handleSelectBeat]);

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
    if (typeof window !== 'undefined' && activeBeats[0]) {
      window.history.replaceState(null, '', `#beat-${activeBeats[0].id}`);
    }
  };

  // Switch mode without losing place (D2)
  const handleModeChange = (newMode: StoryMode) => {
    const newActiveBeats = chapter.beats.filter((b) => b.modes.includes(newMode));
    const currentBeatId = activeBeats[currentBeatIndex]?.id;
    const foundIdx = newActiveBeats.findIndex((b) => b.id === currentBeatId);
    const targetIdx = foundIdx !== -1 ? foundIdx : clampBeatIndex(currentBeatIndex, newActiveBeats.length);

    setMode(newMode);
    setCurrentBeatIndex(targetIdx);
    persist(targetIdx, newMode);
  };

  const handleOpenGlossary = (term?: string) => {
    setGlossaryHighlight(term);
    setGlossaryOpen(true);
  };

  const handleCopyEndTakeaway = () => {
    try {
      navigator.clipboard.writeText(chapter.takeawayMessage);
      setCopiedTakeaway(true);
      setTimeout(() => setCopiedTakeaway(false), 2400);
    } catch {
      // Fallback
    }
  };

  // Deep linking: scroll to initial hash target on mount if present (D1)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash.startsWith('#beat-')) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, []);

  // Keyboard navigation (R9, D11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, ignore global story hotkeys
      if (glossaryOpen || chapterMapOpen || settingsOpen || legendOpen || onboardingOpen) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'j') {
        handleNextBeat();
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        handlePrevBeat();
      } else if (e.key === 'm' || e.key === 'M') {
        setChapterMapOpen(true);
      } else if (e.key === 'g' || e.key === 'G') {
        setGlossaryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    glossaryOpen,
    chapterMapOpen,
    settingsOpen,
    legendOpen,
    onboardingOpen,
    handleNextBeat,
    handlePrevBeat,
  ]);

  // Native scroll detection to update active beat smoothly with hash sync (D1, R10)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const elements = activeBeats
      .map((b) => document.getElementById(`beat-${b.id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.id.replace('beat-', '');
          const index = activeBeats.findIndex((b) => b.id === id);
          if (index !== -1 && index !== currentBeatIndex) {
            setCurrentBeatIndex(index);
            persist(index);
            window.history.replaceState(null, '', `#beat-${id}`);
          }
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0.1, 0.4, 0.7],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeBeats, currentBeatIndex, persist]);

  const progressPercentage = Math.round(
    ((currentBeatIndex + 1) / Math.max(1, activeBeats.length)) * 100
  );

  // Prediction label helper for End Screen (D10)
  const predictBeat = chapter.beats.find((b) => b.type === 'predict');
  const predictionChoice = predictBeat?.predictInteraction?.choices.find(
    (c) => c.id === predictedChoiceId
  );

  return (
    <div className="min-h-screen bg-[#040e1f] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
      {/* Skip-to-content accessible link (D11) */}
      <a
        href="#main-story-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-400 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to story content
      </a>

      {/* 2-Layer Parallax Star Layer */}
      <StoryParallaxStars />

      {/* Top Sticky Navigation & Progress Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#061226]/95 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-4">
          {/* Back & Chapter Info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/stories/v2"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 shrink-0 cursor-pointer"
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
                <span className="text-slate-400 font-mono text-[11px] ml-2 hidden md:inline">
                  (~{remainingMinutes}m remaining)
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Tour vs Full Journey Toggle with Clear Descriptions (D2) */}
            <div
              className="flex items-center rounded-lg bg-black/40 border border-white/10 p-0.5 text-xs font-mono"
              role="group"
              aria-label="Story depth mode selection"
            >
              <button
                type="button"
                onClick={() => handleModeChange('quick')}
                title="Quick tour: Core science and flame morph (~4 min)"
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${
                  mode === 'quick'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={mode === 'quick'}
              >
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="hidden xs:inline">Quick</span>
                  <span className="text-[10px] opacity-80">({chapter.estimatedMinutes.quick}m)</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('full')}
                title="Full journey: Prediction, deeper physics, flight data, and quiz (~7 min)"
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${
                  mode === 'full'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={mode === 'full'}
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="hidden xs:inline">Full</span>
                  <span className="text-[10px] opacity-80">({chapter.estimatedMinutes.full}m)</span>
                </span>
              </button>
            </div>

            {/* Evidence Legend Button (D5) */}
            <button
              type="button"
              onClick={() => setLegendOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/10 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="View evidence legend"
              title="Evidence Legend"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Legend</span>
            </button>

            {/* Glossary Button */}
            <button
              type="button"
              onClick={() => handleOpenGlossary()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Open Space Science Glossary"
              title="Space Science Glossary"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Glossary</span>
            </button>

            {/* Story Settings Button (D8) */}
            <button
              id="story-settings-button"
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Open story accessibility and companion settings"
              title="Story Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress rail with small flame marker (transform only: R4) */}
        <div
          className="relative w-full h-1.5 bg-slate-900 overflow-visible"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 origin-left transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${progressPercentage / 100})` }}
          />
          {/* Flame marker advancing with progress (transform only) */}
          <div
            className="absolute -top-1.5 transition-transform duration-300 ease-out pointer-events-none select-none text-xs"
            style={{
              transform: `translateX(calc(${Math.min(98, progressPercentage)}% - 6px))`,
            }}
            aria-hidden="true"
          >
            🔥
          </div>
        </div>
      </header>

      {/* Resume Banner notification (D2) */}
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
              <span>Start over</span>
            </button>
            <button
              type="button"
              onClick={() => setResumedBannerVisible(false)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Dismiss resume notice"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Chapter Content Container (R10: native scroll, gentle proximity snap) */}
      <main
        id="main-story-content"
        tabIndex={-1}
        className={`flex-1 w-full relative z-10 focus:outline-none ${
          shouldReduceMotion ? '' : 'snap-y snap-proximity'
        }`}
      >
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
            textSize={settings.textSize}
            showEmberCaptionsInFlow={!settings.emberEnabled}
          />
        ))}

        {/* Chapter Completion Screen (D10) */}
        <section
          className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6"
          aria-label="Chapter Completion Summary"
        >
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] text-white">
            Chapter Complete!
          </h3>

          {/* Student Prediction Summary (D10) */}
          {predictBeat && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 max-w-xl mx-auto text-left space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                Your Prediction Result
              </div>
              <div className="text-sm text-slate-200">
                {predictedChoiceId === 'unsure' ? (
                  <span className="italic text-slate-300">
                    Explored hypothesis openly without locking in a guess.
                  </span>
                ) : predictionChoice ? (
                  <span>
                    Selected: <strong>{predictionChoice.label}</strong> — {predictionChoice.feedbackTitle}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    No prediction recorded (Direct explore mode).
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Core Takeaway Card (D10) */}
          <div className="p-6 rounded-2xl bg-[#071329] border border-amber-500/30 max-w-2xl mx-auto space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Chapter Takeaway</span>
              </span>
              <button
                type="button"
                onClick={handleCopyEndTakeaway}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
                aria-label="Copy key takeaway"
              >
                {copiedTakeaway ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Takeaway</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans">
              {chapter.takeawayMessage}
            </p>
          </div>

          {/* Action Buttons: Try Simulator, Back to Chapters, Next Chapter if exists (D10) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review from Start</span>
            </button>

            <Link
              to="/simulator"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-['Space_Grotesk'] text-sm transition-all shadow-lg shadow-indigo-600/20 focus-visible:outline-2 focus-visible:outline-indigo-400"
            >
              Try the Simulator
            </Link>

            <Link
              to="/stories/v2"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Space_Grotesk'] text-sm transition-all shadow-lg shadow-cyan-500/20 focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              Back to Chapters
            </Link>

            {/* Dynamic Next Chapter Button only if one exists (D10) */}
            {chapter.nextChapterSlug ? (
              <Link
                to={`/story/${chapter.nextChapterSlug}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-['Space_Grotesk'] text-sm transition-all shadow-lg shadow-emerald-500/20 focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                Next Chapter →
              </Link>
            ) : null}
          </div>
        </section>
      </main>

      {/* Persistent Companion Ember (D7, D8) */}
      <EmberCompanion
        activeBeat={activeBeats[currentBeatIndex]}
        onSkip={handleNextBeat}
        emberEnabled={settings.emberEnabled}
        reduceMotionOverride={settings.reduceMotionOverride}
      />

      {/* Persistent Bottom Navigation Dock (D1, D2) */}
      <StoryNavigationDock
        beats={activeBeats}
        currentBeatIndex={currentBeatIndex}
        onPrev={handlePrevBeat}
        onNext={handleNextBeat}
        onSelectBeat={handleSelectBeat}
        onOpenMap={() => setChapterMapOpen(true)}
        remainingMinutes={remainingMinutes}
      />

      {/* Chapter Map Modal (D1) */}
      <StoryChapterMapModal
        isOpen={chapterMapOpen}
        onClose={() => setChapterMapOpen(false)}
        beats={activeBeats}
        currentBeatIndex={currentBeatIndex}
        completedBeatIds={completedBeatIds}
        onSelectBeat={handleSelectBeat}
      />

      {/* Settings Panel (D8) */}
      <StorySettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newPartial) => {
          setSettings((prev) => {
            const updated = { ...prev, ...newPartial };
            saveStorySettings(updated);
            return updated;
          });
        }}
        onReplayOnboarding={() => {
          setSettingsOpen(false);
          setOnboardingOpen(true);
        }}
      />

      {/* Onboarding Tour Modal (D5) */}
      <StoryOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => {
          setOnboardingOpen(false);
          setOnboardingDismissed(true);
        }}
      />

      {/* Evidence Legend Modal (D5) */}
      <StoryEvidenceLegendModal
        isOpen={legendOpen}
        onClose={() => setLegendOpen(false)}
      />

      {/* Glossary Modal (D12) */}
      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        items={chapter.glossary}
        highlightTerm={glossaryHighlight}
      />
    </div>
  );
};
