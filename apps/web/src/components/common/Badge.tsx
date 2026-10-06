import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'flame' | 'plasma';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
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

  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-200 border-slate-700/80',
    neutral: 'bg-slate-900/60 text-slate-400 border-slate-800',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    flame: 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-semibold',
    plasma: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-semibold',
  };

  const dotColors = {
    default: 'bg-slate-400',
    neutral: 'bg-slate-500',
    info: 'bg-sky-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    flame: 'bg-orange-400 animate-pulse',
    plasma: 'bg-cyan-400 animate-pulse',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
