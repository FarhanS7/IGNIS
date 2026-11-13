import React, { useState } from 'react';
import type { StoryboardSceneInfo } from './sceneStoryboard.ts';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Activity,
  Cpu,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export interface EventExplanationCardProps {
  scene: StoryboardSceneInfo;
  onExploreWhy: () => void;
  className?: string;
}

export const EventExplanationCard: React.FC<EventExplanationCardProps> = ({
  scene,
  onExploreWhy,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const categoryIcons: Record<StoryboardSceneInfo['category'], React.ReactNode> = {
    OBSERVATION: <Activity className="h-3.5 w-3.5 text-cyan-400" />,
    DETECTOR: <Cpu className="h-3.5 w-3.5 text-cyan-300" />,
    ALARM: <AlertOctagon className="h-3.5 w-3.5 text-red-400" />,
    SEQUENCER: <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />,
    OUTCOME: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  };

  const categoryColors: Record<StoryboardSceneInfo['category'], string> = {
    OBSERVATION: 'text-cyan-300 bg-cyan-950/70 border-cyan-800/60',
    DETECTOR: 'text-cyan-200 bg-cyan-950/70 border-cyan-700/60',
    ALARM: 'text-red-300 bg-red-950/80 border-red-700/80',
    SEQUENCER: 'text-amber-300 bg-amber-950/75 border-amber-700/70',
    OUTCOME: 'text-emerald-300 bg-emerald-950/80 border-emerald-700/80',
  };

  return (
    <section
      role="region"
      aria-label="Event Explanation Card"
      className={`bg-[#09111c]/92 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-200 text-left ${
        isCollapsed ? 'p-2 w-auto' : 'p-3 w-80 sm:w-96'
      } ${className}`}
    >
      {/* Header bar: Chapter number, Category badge, Collapse toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="font-mono text-[10px] uppercase font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            Scene {scene.sceneNumber}/{scene.totalScenes}
          </span>
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-medium ${
              categoryColors[scene.category]
            }`}
          >
            {categoryIcons[scene.category]}
            <span>{scene.category}</span>
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
          title={isCollapsed ? 'Expand explanation card' : 'Collapse explanation card'}
          aria-label={isCollapsed ? 'Expand explanation card' : 'Collapse explanation card'}
        >
          {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="mt-2 space-y-2 font-sans">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight leading-snug">
            {scene.title}
          </h4>

          {/* If Response Action with 3-part breakdown, render structured format */}
          {scene.responseAction ? (
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 space-y-1.5 text-[11px]">
              <div>
                <span className="text-amber-300 font-semibold font-mono uppercase text-[9px] block">
                  What Happened:
                </span>
                <span className="text-slate-200">
                  {scene.responseAction.whatHappened}
                </span>
              </div>
              <div>
                <span className="text-cyan-300 font-semibold font-mono uppercase text-[9px] block">
                  Why It Happened:
                </span>
                <span className="text-slate-300">
                  {scene.responseAction.whyItHappened}
                </span>
              </div>
              <div>
                <span className="text-emerald-300 font-semibold font-mono uppercase text-[9px] block">
                  What Changed:
                </span>
                <span className="text-slate-300">
                  {scene.responseAction.whatChanged}
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Plain Language Explanation (What happened) */}
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                {scene.plainSummary}
              </p>

              {/* Consequence / Next Action (Why it matters) */}
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed border-l-2 border-cyan-500/50 pl-2">
                {scene.consequence}
              </p>
            </>
          )}

          {/* Provenance Badge & Explore Why Action */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 font-mono">
            <span className="text-[9px] text-cyan-400/90 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40 truncate max-w-[170px] sm:max-w-none">
              {scene.provenance}
            </span>

            <button
              onClick={onExploreWhy}
              className="flex items-center gap-1 text-[11px] font-sans font-semibold text-cyan-300 hover:text-cyan-200 hover:underline shrink-0"
            >
              <HelpCircle className="h-3 w-3 text-cyan-400" />
              <span>Explore why &rarr;</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
