import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Flame,
  Check,
} from 'lucide-react';
import {
  ALL_CHAPTER_SUMMARIES,
  getChapterBySlug,
} from '../story/chapters';
import { getChapterProgress } from '../story/storage';
import { StoryShell } from '../story/components/StoryShell';

export const StoryModeV2Page: React.FC = () => {
  const { chapterSlug } = useParams<{ chapterSlug?: string }>();

  // If a specific chapter slug is in the URL, render the active Story chapter using the unified StoryShell design
  if (chapterSlug) {
    const chapter = getChapterBySlug(chapterSlug);

    if (!chapter) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-4">
          <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
            Chapter Not Found
          </h2>
          <p className="text-slate-300 text-sm">
            This story chapter is either not yet released or the link has expired.
          </p>
          <Link
            to="/stories"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold font-['Space_Grotesk'] text-sm hover:bg-cyan-400 transition-colors"
          >
            ← View All Chapters
          </Link>
        </div>
      );
    }

    return <StoryShell chapter={chapter} />;
  }

  // Otherwise, render the Chapter Select Screen
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header Banner */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Interactive Science Stories
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
          Learn how fire works in space
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed font-['Hanken_Grotesk']">
          Four short, interactive chapters explaining how combustion behaves in orbit.
          Every number, quote, and chart is grounded directly in verified NASA flight archives.
        </p>

        {/* Epistemic Grounding Note */}
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-cyan-300">Measured NASA Telemetry: </strong>
            Cites real flight investigations (FLEX droplet rack, BASS-II glovebox burns, and SAME-R smoke sensors) with verbatim quotes from published NASA technical reports.
          </div>
        </div>
      </div>

      {/* Chapter Cards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Interactive Chapters</span>
          </h2>
          <span className="text-xs font-mono text-cyan-400">
            4 of 4 Chapters Available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {ALL_CHAPTER_SUMMARIES.map((ch) => {
            const isAvailable = ch.status === 'available';
            const progress = isAvailable ? getChapterProgress(ch.slug) : null;
            const hasStarted = progress && progress.currentBeatIndex > 0;
            const isDone = progress && progress.completedBeatIds && progress.completedBeatIds.length >= 4;

            return (
              <div
                key={ch.slug}
                className={`relative p-6 sm:p-8 rounded-2xl border transition-all ${
                  isAvailable
                    ? 'bg-[#08152c] border-cyan-500/30 hover:border-cyan-400/60 shadow-xl'
                    : 'bg-white/[0.02] border-white/10 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-xs font-semibold">
                        Chapter {ch.number}
                      </span>

                      {isDone ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Done
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-cyan-400" />
                          Ready
                        </span>
                      )}

                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        About 2 min
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white">
                      {ch.title}
                    </h3>
                    <p className="text-cyan-400 text-sm font-medium font-['Hanken_Grotesk']">
                      {ch.subtitle}
                    </p>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                      {ch.summary}
                    </p>

                    {/* Topic Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ch.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Launch Action */}
                  <div className="shrink-0 flex flex-col items-start md:items-end justify-center gap-2">
                    <Link
                      to={`/stories/${ch.slug}`}
                      className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-['Space_Grotesk'] text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-102 cursor-pointer"
                    >
                      <span>
                        {isDone
                          ? 'Review Chapter'
                          : hasStarted
                          ? 'Resume Story'
                          : 'Start Chapter'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {hasStarted && !isDone && (
                      <span className="text-[11px] text-cyan-300 font-mono">
                        Saved at Beat {progress.currentBeatIndex + 1}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoryModeV2Page;
