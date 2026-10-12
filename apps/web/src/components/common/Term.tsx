import React, { useState, useRef, useEffect, useId } from 'react';
import { getGlossaryEntry } from '../../data/glossary';

export interface TermProps {
  term?: string;
  children: React.ReactNode;
  className?: string;
  definitionOverride?: string;
}

export const Term: React.FC<TermProps> = ({
  term,
  children,
  className = '',
  definitionOverride,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  // Determine lookup key from prop or text child
  const lookupKey = term || (typeof children === 'string' ? children : '');
  const entry = getGlossaryEntry(lookupKey);
  const definition = definitionOverride || entry?.definition;
  const title = entry?.term || lookupKey;
  const category = entry?.category;

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle outside click/tap to close on mobile
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  if (!definition) {
    // If no glossary entry exists, render children directly
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span
        tabIndex={0}
        role="button"
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`border-b border-dotted border-cyan-400/80 hover:border-cyan-300 text-slate-100 cursor-help transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400/50 rounded-xs select-none ${className}`}
      >
        {children}
      </span>

      {/* Floating Plain-Language Definition Tooltip */}
      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[85vw] p-3 text-left rounded-xl bg-slate-950/95 border border-cyan-500/40 text-slate-200 shadow-2xl shadow-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-text"
        >
          <span className="flex items-center justify-between gap-1 pb-1 mb-1.5 border-b border-white/10">
            <span className="font-bold text-xs text-white truncate font-['Space_Grotesk',sans-serif]">
              {title}
            </span>
            {category && (
              <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded shrink-0">
                {category}
              </span>
            )}
          </span>

          <span className="block text-[11px] leading-relaxed text-slate-300 font-sans">
            {definition}
          </span>
        </span>
      )}
    </span>
  );
};

export default Term;
