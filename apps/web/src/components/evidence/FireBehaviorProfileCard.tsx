import React, { useState, useEffect } from 'react';
import { Flame, Activity, ShieldCheck, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { CoverageBadge } from '../common/CoverageBadge';
import { Term } from '../common/Term';
import type { BehaviorProfile, BehaviorDimension, BehaviorLevel } from '../../types/api';

interface Props {
  profile: BehaviorProfile;
  onAskAboutThis?: () => void;
}

const LEVEL_STYLES: Record<
  BehaviorLevel,
  { label: string; badgeVariant: 'strong' | 'moderate' | 'neutral'; dotColor: string }
> = {
  elevated: { label: 'Elevated Evidence', badgeVariant: 'strong', dotColor: 'bg-cyan-400' },
  mixed: { label: 'Mixed Observations', badgeVariant: 'moderate', dotColor: 'bg-amber-400' },
  limited: { label: 'Limited Evidence', badgeVariant: 'neutral', dotColor: 'bg-slate-400' },
  insufficient: { label: 'Insufficient Flight Data', badgeVariant: 'neutral', dotColor: 'bg-slate-500' },
};

const SIMPLE_SUMMARIES: Record<
  'flame_spread' | 'sustained_burning' | 'extinction',
  Record<BehaviorLevel, { titleTag: string; plainSentence: string }>
> = {
  flame_spread: {
    elevated: {
      titleTag: 'Spreads Steadily',
      plainSentence: 'Flames spread steadily across the material because moving air carries a continuous supply of oxygen to the fire.',
    },
    mixed: {
      titleTag: 'Slow Creep',
      plainSentence: 'Flames crawl slowly in some areas, but struggle to grow or spread without stronger air currents.',
    },
    limited: {
      titleTag: 'Localized Only',
      plainSentence: 'The flame stays very small right where it was ignited and does not spread across the material.',
    },
    insufficient: {
      titleTag: 'Data Sparse',
      plainSentence: 'Spaceflight test data for this specific atmosphere is limited, so flame spread speed cannot be reliably confirmed.',
    },
  },
  sustained_burning: {
    elevated: {
      titleTag: 'Self-Sustaining',
      plainSentence: 'Once ignited, the material keeps burning steadily on its own without needing an external heat source.',
    },
    mixed: {
      titleTag: 'Fragile Burn',
      plainSentence: 'Burning is fragile; the flame flickers and produces heavy soot while struggling to stay steady.',
    },
    limited: {
      titleTag: 'Weak Combustion',
      plainSentence: 'The material produces soot and struggles to generate enough heat to maintain continuous combustion.',
    },
    insufficient: {
      titleTag: 'Data Sparse',
      plainSentence: 'Available spaceflight data is too sparse to determine whether steady burning can be sustained.',
    },
  },
  extinction: {
    elevated: {
      titleTag: 'Suffocates Fast',
      plainSentence: 'If ventilation airflow stops, the flame quickly suffocates in its own carbon dioxide and goes out.',
    },
    mixed: {
      titleTag: 'Draft Vulnerable',
      plainSentence: 'Flames stay lit in gentle drafts, but are vulnerable to cooling drafts that can blow them out.',
    },
    limited: {
      titleTag: 'Resilient Flame',
      plainSentence: 'The flame resists gentle changes in airflow without easily extinguishing.',
    },
    insufficient: {
      titleTag: 'Data Sparse',
      plainSentence: 'Extinction boundaries cannot be verified without additional microgravity flight test data.',
    },
  },
};

const ExpertDimensionBlock: React.FC<{
  title: string;
  termKey: string;
  icon: React.ComponentType<{ className?: string }>;
  dim: BehaviorDimension;
}> = ({ title, termKey, icon: Icon, dim }) => {
  const style = LEVEL_STYLES[dim.level] || LEVEL_STYLES.insufficient;
  const total = dim.supporting_runs_count;
  const ratio = total > 0 ? Math.round((dim.positive_observations / total) * 100) : 0;

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Icon className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
              <Term term={termKey}>{title}</Term>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {dim.positive_observations}/{total} runs observed ({ratio}%)
            </span>
          </div>
        </div>
        <Badge variant={style.badgeVariant} size="xs" dot>
          {style.label}
        </Badge>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{dim.description}</p>

      {/* Observation ratio progress bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dim.level === 'elevated'
                ? 'bg-orange-500'
                : dim.level === 'mixed'
                ? 'bg-amber-400'
                : dim.level === 'limited'
                ? 'bg-sky-400'
                : 'bg-slate-600'
            }`}
            style={{ width: `${Math.min(100, ratio)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>{dim.positive_observations} Positive</span>
          <span>{dim.negative_observations} Negative / Quenched</span>
        </div>
      </div>
    </div>
  );
};

const SimpleDimensionBlock: React.FC<{
  title: string;
  termKey: string;
  dimensionKey: 'flame_spread' | 'sustained_burning' | 'extinction';
  icon: React.ComponentType<{ className?: string }>;
  dim: BehaviorDimension;
}> = ({ title, termKey, dimensionKey, icon: Icon, dim }) => {
  const summary = SIMPLE_SUMMARIES[dimensionKey][dim.level] || SIMPLE_SUMMARIES[dimensionKey].insufficient;
  const levelStyle = LEVEL_STYLES[dim.level] || LEVEL_STYLES.insufficient;

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2.5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Icon className="w-4 h-4 text-orange-400" />
          </div>
          <h4 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
            <Term term={termKey}>{title}</Term>
          </h4>
        </div>
        <Badge variant={levelStyle.badgeVariant} size="xs" dot>
          {summary.titleTag}
        </Badge>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed font-sans">
        {summary.plainSentence}
      </p>
    </div>
  );
};

export const FireBehaviorProfileCard: React.FC<Props> = ({ profile, onAskAboutThis }) => {
  const [mode, setMode] = useState<'simple' | 'expert'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ignis_profile_mode');
      if (saved === 'expert' || saved === 'simple') return saved;
    }
    return 'simple';
  });

  useEffect(() => {
    try {
      localStorage.setItem('ignis_profile_mode', mode);
    } catch {
      // Ignore localStorage quotas or restrictions
    }
  }, [mode]);

  return (
    <Card variant="default" padding="lg" className="border-orange-500/20 shadow-2xl shadow-orange-950/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="xs">
                PRD v1.1 §10.4
              </Badge>
              <span className="text-xs font-mono text-slate-400">Behavior Profile Synthesis</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-orange-500" />
              <span>Fire Behavior Profile</span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simple / Expert Segmented Control */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-black/60 border border-slate-700 text-xs font-mono">
              <button
                type="button"
                onClick={() => setMode('simple')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'simple'
                    ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setMode('expert')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'expert'
                    ? 'bg-slate-800 text-white font-bold shadow-md border border-slate-700/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expert
              </button>
            </div>

            {onAskAboutThis && (
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                onClick={onAskAboutThis}
                className="border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/15 text-xs"
              >
                Ask about this
              </Button>
            )}
            <Term term="coverage">
              <CoverageBadge tier={profile.coverage} />
            </Term>
            <Term term="confidence">
              <ConfidenceBadge level={profile.confidence} />
            </Term>
          </div>
        </div>

        <CardDescription className="pt-1">
          {mode === 'simple' ? (
            <span>
              Plain-language overview of how fire is predicted to behave in this habitat atmosphere, synthesized from verified NASA spaceflight observations.
            </span>
          ) : (
            profile.summary
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Three Scientific Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mode === 'simple' ? (
            <>
              <SimpleDimensionBlock
                title="Flame Spread"
                termKey="flame spread"
                dimensionKey="flame_spread"
                icon={Flame}
                dim={profile.flame_spread}
              />
              <SimpleDimensionBlock
                title="Sustained Burning"
                termKey="sustained burning"
                dimensionKey="sustained_burning"
                icon={Activity}
                dim={profile.sustained_burning}
              />
              <SimpleDimensionBlock
                title="Extinction Limits"
                termKey="extinction"
                dimensionKey="extinction"
                icon={ShieldCheck}
                dim={profile.extinction}
              />
            </>
          ) : (
            <>
              <ExpertDimensionBlock
                title="Flame Spread"
                termKey="flame spread"
                icon={Flame}
                dim={profile.flame_spread}
              />
              <ExpertDimensionBlock
                title="Sustained Burning"
                termKey="sustained burning"
                icon={Activity}
                dim={profile.sustained_burning}
              />
              <ExpertDimensionBlock
                title="Extinction Limits"
                termKey="extinction"
                icon={ShieldCheck}
                dim={profile.extinction}
              />
            </>
          )}
        </div>

        {/* Low Confidence Caveat in Simple Mode */}
        {mode === 'simple' && profile.confidence === 'low' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Because verified spaceflight test data for this specific atmosphere is sparse, actual spacecraft fire behavior may differ from predicted trends.
            </span>
          </div>
        )}

        {/* FR-FBP-001 Scientific Integrity Callout */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white">Scientific Measurement Integrity (FR-FBP-001):</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              IGNIS outputs empirical behavioral dimensions observed in verified NASA flight tests, never a generic &quot;danger&quot; score or binary safety clearance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
