import React from 'react';

export type BadgeVariant =
  | 'strong'
  | 'moderate'
  | 'neutral'
  // Legacy aliases mapped to the 3 semantic variants
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'flame'
  | 'plasma';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1 leading-tight',
    sm: 'text-xs px-2.5 py-1 gap-1.5 leading-normal',
    md: 'text-sm px-3 py-1.5 gap-2 leading-normal',
  };

  // Map into 3 consolidated semantic variants:
  // 1. strong: high authority / verified telemetry / elevated match (cyan)
  // 2. moderate: caution / synthesis / mixed observations / caveats (amber)
  // 3. neutral: metadata / reference tags / counts / inactive (slate)
  const semanticVariant: 'strong' | 'moderate' | 'neutral' =
    variant === 'strong' || variant === 'flame' || variant === 'plasma' || variant === 'success' || variant === 'info'
      ? 'strong'
      : variant === 'moderate' || variant === 'warning' || variant === 'danger'
      ? 'moderate'
      : 'neutral';

  const variantStyles = {
    strong: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35 font-medium shadow-sm shadow-cyan-500/10',
    moderate: 'bg-amber-500/15 text-amber-300 border-amber-500/35 font-medium shadow-sm shadow-amber-500/10',
    neutral: 'bg-slate-900/80 text-slate-300 border-slate-700/80 font-normal',
  };

  const dotColors = {
    strong: 'bg-cyan-400',
    moderate: 'bg-amber-400',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[semanticVariant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[semanticVariant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
