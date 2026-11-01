import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ExperimentExplorerPage } from './pages/ExperimentExplorerPage';
import { StoryIndexPage } from './pages/StoryIndexPage';
import { StoryPlayerPage } from './pages/StoryPlayerPage';
import { AskIgnisPage } from './pages/AskIgnisPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PerfOverlay } from './visuals/PerfOverlay';

import { StoryModeV2Page } from './pages/StoryModeV2Page';
import { TrustLedgerProvider } from './context/TrustLedgerContext';

const RedirectToSimulator: React.FC = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/simulator', search: location.search }} replace />;
};

const ROUTE_TITLES: Record<string, string> = {
  '/': 'IGNIS · Microgravity Fire Safety Intelligence',
  '/simulator': 'Simulator · IGNIS',
  '/build': 'Simulator · IGNIS',
  '/evidence': 'Simulator · IGNIS',
  '/experiments': 'Flight Data & Experiments · IGNIS',
  '/explore': 'Mission Stories · IGNIS',
  '/stories/v2': 'Story Mode v2 · Interactive Science Stories · IGNIS',
  '/ask': 'Ask IGNIS · Microgravity AI',
  '/about': 'About & Methodology · IGNIS',
};

const RouteTitleSync: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (ROUTE_TITLES[path]) {
      document.title = ROUTE_TITLES[path];
    } else if (path.startsWith('/experiment/')) {
      document.title = 'Experiment Details · IGNIS';
    } else if (path.startsWith('/stories/v2/')) {
      document.title = 'Story Mode v2 · Interactive Chapter · IGNIS';
    } else if (path.startsWith('/explore/')) {
      document.title = 'Mission Story · IGNIS';
    } else {
      document.title = '404 · Trajectory Lost · IGNIS';
    }
  }, [location.pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <TrustLedgerProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
        <RouteTitleSync />
        <PerfOverlay />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            {/* Simulator route & aliases */}
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/build" element={<RedirectToSimulator />} />
            <Route path="/evidence" element={<RedirectToSimulator />} />
            {/* Flight Data & Experiments */}
            <Route path="/experiments" element={<ExperimentExplorerPage />} />
            <Route path="/explorer" element={<ExperimentExplorerPage />} />
            <Route path="/experiment/:id" element={<ExperimentExplorerPage />} />
            {/* Stories */}
            <Route path="/explore" element={<StoryIndexPage />} />
            <Route path="/explore/:slug" element={<StoryPlayerPage />} />
            <Route path="/stories/v2" element={<StoryModeV2Page />} />
            <Route path="/stories/v2/:chapterSlug" element={<StoryModeV2Page />} />
            <Route path="/story/:chapterSlug" element={<StoryModeV2Page />} />
            {/* Ask IGNIS & About */}
            <Route path="/ask" element={<AskIgnisPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* 404 Actionable State */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
    </TrustLedgerProvider>
  );
};

export default App;

