import { Flame, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { CoverageBadge } from '../common/CoverageBadge';
import type { BehaviorProfile, BehaviorDimension, BehaviorLevel } from '../../types/api';

interface Props {
  profile: BehaviorProfile;
}

const LEVEL_STYLES: Record<
  BehaviorLevel,
  { label: string; badgeVariant: 'flame' | 'warning' | 'plasma' | 'neutral'; dotColor: string }
> = {
  elevated: { label: 'Elevated Evidence', badgeVariant: 'flame', dotColor: 'bg-orange-500' },
  mixed: { label: 'Mixed Observations', badgeVariant: 'warning', dotColor: 'bg-amber-500' },
  limited: { label: 'Limited Evidence', badgeVariant: 'plasma', dotColor: 'bg-sky-400' },
  insufficient: { label: 'Insufficient Flight Data', badgeVariant: 'neutral', dotColor: 'bg-slate-500' },
};

const DimensionBlock: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  dim: BehaviorDimension;
}> = ({ title, icon: Icon, dim }) => {
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
            <h4 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">{title}</h4>
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

export const FireBehaviorProfileCard: React.FC<Props> = ({ profile }) => {
  return (
    <Card variant="default" padding="lg" className="border-orange-500/20 shadow-2xl shadow-orange-950/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="flame" size="xs">
                PRD v1.1 §10.4
              </Badge>
              <span className="text-xs font-mono text-slate-400">Behavior Profile Synthesis</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-orange-500" />
              <span>Fire Behavior Profile</span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CoverageBadge tier={profile.coverage} />
            <ConfidenceBadge level={profile.confidence} />
          </div>
        </div>

        <CardDescription className="pt-1">
          {profile.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Three Scientific Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DimensionBlock
            title="Flame Spread"
            icon={Flame}
            dim={profile.flame_spread}
          />
          <DimensionBlock
            title="Sustained Burning"
            icon={Activity}
            dim={profile.sustained_burning}
          />
          <DimensionBlock
            title="Extinction Limits"
            icon={ShieldCheck}
            dim={profile.extinction}
          />
        </div>

        {/* FR-FBP-001 Scientific Integrity Callout */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white">Scientific Measurement Integrity (FR-FBP-001):</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              IGNIS outputs empirical behavioral dimensions observed in verified NASA flight tests, never a generic "danger" score or binary safety clearance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
