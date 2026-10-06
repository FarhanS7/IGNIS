import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 rounded';

  const variantClasses = {
    text: 'h-4 w-full rounded-md my-1',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl border border-slate-800/80',
  };

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={inlineStyles}
      aria-hidden="true"
      {...props}
    />
  );
};
