import React from 'react';
import { Tooltip } from './Tooltip';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  level: ConfidenceTier | string;
  score?: number; // 0.0 to 1.0 or 0 to 100
  showScore?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  score,
  showScore = false,
  showTooltip = true,
  tooltipText,
  size = 'sm',
  className = '',
}) => {
  const normalizedLevel = (level?.toLowerCase() || 'medium') as ConfidenceTier;

  const config = {
    high: {
      label: 'High Confidence',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
      icon: CheckCircle2,
      defaultTooltip: 'High direct flight coverage with closely matching environmental conditions.',
    },
    medium: {
      label: 'Medium Confidence',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
      icon: AlertTriangle,
      defaultTooltip: 'Moderate evidence overlap with partial extrapolations or minor condition variations.',
    },
    low: {
      label: 'Low Confidence',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10',
      icon: AlertOctagon,
      defaultTooltip: 'Sparse direct flight records. Contains gravity regime mismatch or substantial extrapolation.',
    },
  }[normalizedLevel] || {
    label: 'Moderate',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: AlertTriangle,
    defaultTooltip: 'Confidence evaluation pending.',
  };

  const Icon = config.icon;

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

  const formattedScore = score !== undefined 
    ? `${Math.round(score <= 1.0 ? score * 100 : score)}%`
    : null;

  const badgeContent = (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-all duration-150 select-none ${sizeStyles[size]} ${config.badgeClass} ${className}`}
    >
      <Icon className={`${iconSizes[size]} shrink-0`} />
      <span>{config.label}</span>
      {showScore && formattedScore && (
        <span className="font-mono text-xs opacity-90 pl-1 border-l border-current/20">
          {formattedScore}
        </span>
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
          <p className="font-semibold text-white mb-0.5">{config.label}</p>
          <p className="text-[11px] text-slate-300 leading-normal">{tooltipText || config.defaultTooltip}</p>
        </div>
      }
      position="top"
    >
      {badgeContent}
    </Tooltip>
  );
};
