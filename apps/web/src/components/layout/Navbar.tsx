import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Compass, Info, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Habitat Builder', path: '/build', icon: Flame },
    { label: 'Explore Fire', path: '/explore', icon: Compass },
    { label: 'Ask IGNIS', path: '/ask', icon: Sparkles },
    { label: 'About & Method', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#05070E]/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-sky-400 p-[1px] shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <div className="w-full h-full bg-[#0A0E1A] rounded-[11px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-slate-200 to-orange-300 bg-clip-text text-transparent">
                IGNIS
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                v1.1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Microgravity Combustion Intelligence</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">NASA Open Science</span>
          </div>
        </div>
      </div>
    </header>
  );
};
