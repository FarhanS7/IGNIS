import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAskIgnis } from '../../hooks/useAskIgnis';

export const FloatingAskButton: React.FC = () => {
  const { openDrawer, isDrawerOpen } = useAskIgnis();
  const location = useLocation();

  // Hide floating button on /ask page or when drawer is already open
  if (location.pathname === '/ask' || isDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 print:hidden">
      <button
        type="button"
        onClick={() => openDrawer()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-cyan-950/80 hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="Ask IGNIS floating assistant"
      >
        <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
        <span>Ask IGNIS</span>
      </button>
    </div>
  );
};

export default FloatingAskButton;
