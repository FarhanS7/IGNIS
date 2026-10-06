import React from 'react';
import { Tooltip } from './Tooltip';
import { Layers } from 'lucide-react';

export type CoverageTier = 'high' | 'medium' | 'low';

export interface CoverageBadgeProps {
  score?: number; // 0.0 to 1.0 or 0 to 100
  tier?: CoverageTier | string;
  showBar?: boolean;
  showTooltip?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const CoverageBadge: React.FC<CoverageBadgeProps> = ({
  score,
  tier,
  showBar = false,
  showTooltip = true,
  size = 'sm',
  className = '',
}) => {
  // Determine tier from score if tier not provided
  let calculatedTier: CoverageTier = 'medium';
  if (tier) {
    calculatedTier = tier.toLowerCase() as CoverageTier;
  } else if (score !== undefined) {
    const normalizedScore = score > 1.0 ? score / 100 : score;
    if (normalizedScore >= 0.7) calculatedTier = 'high';
    else if (normalizedScore >= 0.4) calculatedTier = 'medium';
    else calculatedTier = 'low';
  }

  const config = {
    high: {
      label: 'High Coverage',
      colorClasses: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      barColor: 'bg-emerald-400',
      description: 'Extensive NASA database overlap covering oxygen, pressure, gravity, and material conditions.',
    },
    medium: {
      label: 'Medium Coverage',
      colorClasses: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      barColor: 'bg-amber-400',
      description: 'Partial NASA database overlap. Some environmental parameters rely on interpolated values.',
    },
    low: {
      label: 'Low Coverage',
      colorClasses: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      barColor: 'bg-rose-400',
      description: 'Sparse experimental overlap. Data gaps identified; projections rely on extrapolated trends.',
    },
  }[calculatedTier] || {
    label: 'Coverage',
    colorClasses: 'bg-slate-800 text-slate-300 border-slate-700',
    barColor: 'bg-slate-400',
    description: 'Evidence coverage assessment.',
  };

  const percentage = score !== undefined 
    ? Math.round(score <= 1.0 ? score * 100 : score)
    : null;

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-all duration-150 select-none ${sizeStyles[size]} ${config.colorClasses} ${className}`}
    >
      <Layers className={`${iconSizes[size]} shrink-0`} />
      <span>{config.label}</span>
      {percentage !== null && (
        <span className="font-mono text-xs opacity-90 pl-1 border-l border-current/20">
          {percentage}%
        </span>
      )}
      {showBar && percentage !== null && (
        <div className="w-10 h-1.5 bg-black/40 rounded-full overflow-hidden ml-1 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      )}
    </span>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip
      content={
        <div className="max-w-xs text-left p-1">
          <p className="font-semibold text-white mb-0.5">Evidence Coverage: {percentage !== null ? `${percentage}%` : config.label}</p>
          <p className="text-[11px] text-slate-300 leading-normal">{config.description}</p>
        </div>
      }
      position="top"
    >
      {badgeContent}
    </Tooltip>
  );
};
