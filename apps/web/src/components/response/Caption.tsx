import React from 'react';

export interface CaptionProps {
  text: string;
  className?: string;
}

export const Caption: React.FC<CaptionProps> = ({ text, className = '' }) => {
  return (
    <div
      className={`text-center font-display tracking-tight text-white font-semibold select-none transition-opacity duration-300 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-block px-4 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xl sm:text-2xl md:text-3xl text-balance">
        {text || '\u00A0'}
      </span>
    </div>
  );
};

