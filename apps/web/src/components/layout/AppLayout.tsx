import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { GlowingCursor } from '../common/GlowingCursor';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { AskProvider } from '../../context/AskContext';
import { AskDrawer } from '../chat/AskDrawer';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AskProvider>
      <div className="min-h-screen flex flex-col bg-transparent text-white relative selection:bg-[#79dce8]/30 selection:text-white">
        {/* Fixed Cosmic Space Background matching index.html */}
        <div className="fixed-bg" aria-hidden="true" />

        {/* Ambient Canvas Cursor Particle Trail */}
        <GlowingCursor />

        {/* Floating Glass Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className={`relative z-1 ${isHome ? 'flex-1 w-full' : 'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16'}`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Global Contextual Ask IGNIS Slide-over Drawer */}
        <AskDrawer />

        {/* Footer */}
        <Footer />
      </div>
    </AskProvider>
  );
};
