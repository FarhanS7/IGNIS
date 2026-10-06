import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { HabitatBuilderPage } from './pages/HabitatBuilderPage';
import { EvidenceResultsPage } from './pages/EvidenceResultsPage';
import { ExperimentExplorerPage } from './pages/ExperimentExplorerPage';
import { StoryIndexPage } from './pages/StoryIndexPage';
import { StoryPlayerPage } from './pages/StoryPlayerPage';
import { AskIgnisPage } from './pages/AskIgnisPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/build" element={<HabitatBuilderPage />} />
          <Route path="/evidence" element={<EvidenceResultsPage />} />
          <Route path="/experiment/:id" element={<ExperimentExplorerPage />} />
          <Route path="/explore" element={<StoryIndexPage />} />
          <Route path="/explore/:slug" element={<StoryPlayerPage />} />
          <Route path="/ask" element={<AskIgnisPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
