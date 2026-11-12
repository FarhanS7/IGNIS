import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PerfOverlay } from './visuals/PerfOverlay';
import { TrustLedgerProvider } from './context/TrustLedgerContext';

const SimulatorPage = lazy(() =>
  import('./pages/SimulatorPage').then((m) => ({ default: m.SimulatorPage }))
);
const ExperimentExplorerPage = lazy(() =>
  import('./pages/ExperimentExplorerPage').then((m) => ({ default: m.ExperimentExplorerPage }))
);
const AskIgnisPage = lazy(() =>
  import('./pages/AskIgnisPage').then((m) => ({ default: m.AskIgnisPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ResearchGapsPage = lazy(() =>
  import('./pages/ResearchGapsPage').then((m) => ({ default: m.ResearchGapsPage }))
);
const ResponseConsolePage = lazy(() =>
  import('./pages/ResponseConsolePage').then((m) => ({ default: m.ResponseConsolePage }))
);
const StoryModeV2Page = lazy(() =>
  import('./pages/StoryModeV2Page').then((m) => ({ default: m.StoryModeV2Page }))
);

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
    Loading IGNIS module...
  </div>
);

const RedirectToSimulator: React.FC = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/simulator', search: location.search }} replace />;
};

const RedirectToStories: React.FC = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/stories', search: location.search }} replace />;
};

const RedirectExploreSlug: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname.replace('/explore/', '/stories/').replace('microgravity-fire', 'why-is-fire-round-in-space');
  return <Navigate to={{ pathname, search: location.search }} replace />;
};

const RedirectStoriesV2Slug: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname.replace('/stories/v2/', '/stories/');
  return <Navigate to={{ pathname, search: location.search }} replace />;
};

const RedirectStorySlug: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname.replace('/story/', '/stories/');
  return <Navigate to={{ pathname, search: location.search }} replace />;
};

const ROUTE_TITLES: Record<string, string> = {
  '/': 'IGNIS · Microgravity Fire Safety Intelligence',
  '/simulator': 'Simulator · IGNIS',
  '/build': 'Simulator · IGNIS',
  '/evidence': 'Simulator · IGNIS',
  '/experiments': 'Flight Data & Experiments · IGNIS',
  '/stories': 'Science Stories · IGNIS',
  '/explore': 'Science Stories · IGNIS',
  '/stories/v2': 'Science Stories · IGNIS',
  '/ask': 'Ask IGNIS · Microgravity AI',
  '/gaps': 'Research Gaps & Mission Ranking · IGNIS',
  '/about': 'About & Methodology · IGNIS',
  '/response': 'Fire Response Console · IGNIS',
};

const RouteTitleSync: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (ROUTE_TITLES[path]) {
      document.title = ROUTE_TITLES[path];
    } else if (path.startsWith('/experiment/')) {
      document.title = 'Experiment Details · IGNIS';
    } else if (
      path.startsWith('/stories/') ||
      path.startsWith('/stories/v2/') ||
      path.startsWith('/story/') ||
      path.startsWith('/explore/')
    ) {
      document.title = 'Science Story · Interactive Chapter · IGNIS';
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
        <Suspense fallback={<RouteLoadingFallback />}>
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
              <Route path="/stories" element={<StoryModeV2Page />} />
              <Route path="/stories/:chapterSlug" element={<StoryModeV2Page />} />
              {/* Backward-compatible redirects */}
              <Route path="/explore" element={<RedirectToStories />} />
              <Route path="/explore/:slug" element={<RedirectExploreSlug />} />
              <Route path="/stories/v2" element={<RedirectToStories />} />
              <Route path="/stories/v2/:chapterSlug" element={<RedirectStoriesV2Slug />} />
              <Route path="/story/:chapterSlug" element={<RedirectStorySlug />} />
              {/* Ask IGNIS & About */}
              <Route path="/ask" element={<AskIgnisPage />} />
              <Route path="/gaps" element={<ResearchGapsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/response" element={<ResponseConsolePage />} />
              {/* 404 Actionable State */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
    </TrustLedgerProvider>
  );
};

export default App;

