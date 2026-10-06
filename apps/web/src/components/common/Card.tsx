import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'glass' | 'glow' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 relative overflow-hidden';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-[#0A0E1A]/90 border border-slate-800/90 shadow-xl shadow-black/40 backdrop-blur-md',
    interactive: 'bg-[#0A0E1A]/90 border border-slate-800/80 hover:border-slate-700/90 hover:bg-[#0F1626] hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md shadow-lg shadow-black/30',
    glass: 'bg-[#0F1626]/60 border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50',
    glow: 'bg-[#0A0E1A]/90 border border-orange-500/30 shadow-xl shadow-orange-500/10 backdrop-blur-md',
    accent: 'bg-gradient-to-b from-[#162035]/80 to-[#0A0E1A]/90 border border-cyan-500/30 shadow-xl shadow-cyan-500/10 backdrop-blur-md',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-sm text-slate-400 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4 ${className}`} {...props}>
    {children}
  </div>
);
