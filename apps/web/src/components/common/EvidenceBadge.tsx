import React from 'react';
import { Tooltip } from './Tooltip';
import { ShieldCheck, FileCheck2, Activity, GitFork, Sparkles } from 'lucide-react';

export type EvidenceTier = 'A' | 'B' | 'C' | 'D' | 'E';

export interface EvidenceBadgeProps {
  level: EvidenceTier | string;
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

interface TierConfig {
  code: EvidenceTier;
  title: string;
  shortLabel: string;
  description: string;
  badgeClasses: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIER_CONFIGS: Record<EvidenceTier, TierConfig> = {
  A: {
    code: 'A',
    title: 'Level A — Flight Observed',
    shortLabel: 'Flight Observed',
    description: 'Directly measured in NASA microgravity flight / drop-tower telemetry (Highest Authority).',
    badgeClasses: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
    icon: ShieldCheck,
  },
  B: {
    code: 'B',
    title: 'Level B — Peer-Reviewed Normalized',
    shortLabel: 'Peer-Reviewed Data',
    description: 'Normalized, unit-converted metadata tables with verified NASA DOI and published paper.',
    badgeClasses: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10',
    icon: FileCheck2,
  },
  C: {
    code: 'C',
    title: 'Level C — Derived Scientific Metrics',
    shortLabel: 'Derived CV / Metrics',
    description: 'Computed scientific metrics (computer-vision flame area, growth curve, centroid kinematics).',
    badgeClasses: 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10',
    icon: Activity,
  },
  D: {
    code: 'D',
    title: 'Level D — Algorithmic Match',
    shortLabel: 'Mathematical Match',
    description: 'Normalized multi-attribute vector similarity score between test habitat and NASA experiment.',
    badgeClasses: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10',
    icon: GitFork,
  },
  E: {
    code: 'E',
    title: 'Level E — Grounded Synthesis',
    shortLabel: 'Grounded AI Synthesis',
    description: 'Grounded AI synthesis strictly constrained to retrieved evidence (lowest authority tier).',
    badgeClasses: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
    icon: Sparkles,
  },
};

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  level,
  showLabel = true,
  showTooltip = true,
  size = 'sm',
  className = '',
}) => {
  // Normalize level string (e.g., 'A_OBSERVED' or 'A' -> 'A')
  const normalizedLevel = (level?.charAt(0).toUpperCase() || 'A') as EvidenceTier;
  const config = TIER_CONFIGS[normalizedLevel] || TIER_CONFIGS.A;
  const IconComponent = config.icon;

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-3.5 py-2 gap-2.5',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-all duration-150 select-none ${sizeStyles[size]} ${config.badgeClasses} ${className}`}
    >
      <IconComponent className={`${iconSizes[size]} shrink-0`} />
      <span className="font-mono">Level {config.code}</span>
      {showLabel && (
        <span className="text-slate-300/80 font-normal border-l border-current/20 pl-1.5">
          {config.shortLabel}
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
          <p className="font-semibold text-white mb-0.5">{config.title}</p>
          <p className="text-[11px] text-slate-300 leading-normal">{config.description}</p>
        </div>
      }
      position="top"
    >
      {badgeContent}
    </Tooltip>
  );
};
