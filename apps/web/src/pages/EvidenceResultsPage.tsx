import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  ArrowLeft,
  Sliders,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { FireBehaviorProfileCard } from '../components/evidence/FireBehaviorProfileCard';
import { EvidenceMatchCard } from '../components/evidence/EvidenceMatchCard';
import { EvidenceGuidedVisualization } from '../components/evidence/EvidenceGuidedVisualization';
import { WhyPanel } from '../components/evidence/WhyPanel';
import { api } from '../lib/api';
import type { ScenarioInput, AnalysisResult } from '../types/api';

const DEFAULT_FALLBACK_SCENARIO: ScenarioInput = {
  material: 'pmma',
  objective: 'flame_spread',
  gravity_environment: 'microgravity',
  oxygen_pct: 21.0,
  pressure_kpa: 101.3,
  airflow_cm_s: 5.0,
};

export const EvidenceResultsPage: React.FC = () => {
  const location = useLocation();

  // Load scenario from router state or sessionStorage or fallback
  const initialScenario = React.useMemo<ScenarioInput>(() => {
    if (location.state?.scenario) {
      return location.state.scenario as ScenarioInput;
    }
    const saved = sessionStorage.getItem('ignis_current_scenario');
    if (saved) {
      try {
        return JSON.parse(saved) as ScenarioInput;
      } catch {
        // Fall back to default
      }
    }
    return DEFAULT_FALLBACK_SCENARIO;
  }, [location.state]);

  const [scenario] = useState<ScenarioInput>(initialScenario);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeHabitat(scenario);
      setAnalysis(data);
    } catch (err) {
      console.error('Error running habitat analysis:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the IGNIS Analysis Engine. Ensure the backend service is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [scenario]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <div className="space-y-10 py-2 sm:py-6 max-w-6xl mx-auto">
      {/* Top Navigation & Scenario Summary Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/build"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Habitat Scenario in Builder</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="flame" size="xs">
              EVIDENCE ENGINE v1.1
            </Badge>
            <span className="text-xs font-mono text-slate-400">PRD §10.4, §16.5</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
              Evidence Analysis & Profile
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Synthesized from NASA microgravity flight datasets matching your habitat atmosphere.
            </p>
          </div>

          <Link to="/build">
            <Button variant="secondary" size="sm" icon={<Sliders className="w-4 h-4" />}>
              Edit Parameters
            </Button>
          </Link>
        </div>

        {/* Current Scenario Parameter Pills */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <span className="text-slate-400 font-sans text-xs">Evaluated Scenario:</span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-orange-300">
            {scenario.gravity_environment?.replace(/_/g, ' ') || '0g microgravity'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-white">
            Material: {scenario.material}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-white">
            O₂: {scenario.oxygen_pct}%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-white">
            P: {scenario.pressure_kpa} kPa
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-white">
            Airflow: {scenario.airflow_cm_s} cm/s
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 text-sky-300">
            Objective: {scenario.objective}
          </span>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-6">
          <Card variant="default" padding="lg">
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="70%" height={16} className="mt-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Skeleton variant="card" height={130} />
              <Skeleton variant="card" height={130} />
              <Skeleton variant="card" height={130} />
            </div>
          </Card>

          <div className="space-y-4">
            <Skeleton variant="text" width="30%" height={22} />
            <Skeleton variant="card" height={180} />
            <Skeleton variant="card" height={180} />
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card variant="default" padding="lg" className="border-rose-500/30 text-center py-10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Analysis Pipeline Interrupted</h3>
            <p className="text-xs text-rose-300 max-w-lg mx-auto">{error}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={fetchAnalysis}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Retry Analysis
          </Button>
        </Card>
      )}

      {/* Main Analysis Results */}
      {!loading && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-10"
        >
          {/* Section 1: Fire Behavior Profile (FR-FBP-001) */}
          <section className="space-y-3">
            <FireBehaviorProfileCard profile={analysis.behavior_profile} />
          </section>

          {/* Section 2: Illustrative Habitat Visualization (PRD §16.6 / FR-EGV-001 - 004) */}
          <section className="space-y-3">
            <EvidenceGuidedVisualization
              scenario={scenario}
              comparableCount={analysis.eligible_count}
            />
          </section>

          {/* Section 3: Why? Decomposition Panel (PRD §10.6) */}
          {analysis.matches.length > 0 && (
            <section className="space-y-3">
              <WhyPanel
                topMatch={analysis.matches[0]}
                scenario={scenario}
                comparableCount={analysis.eligible_count}
              />
            </section>
          )}

          {/* Section 4: Gate Statistics & Filter Results */}
          <section className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Filter className="w-4 h-4 text-orange-400" />
              <span>Comparable-Evidence Gate Evaluation (Module B1):</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">Total Evaluated:</span>
                <span className="text-white font-bold">{analysis.total_evaluated}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{analysis.eligible_count} Eligible Matches</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
                <span>{analysis.excluded_count} Ineligible / Gated</span>
              </div>
            </div>
          </section>

          {/* Section 3: Ranked NASA Evidence Cards */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-400" />
                  <span>Closest NASA Flight Evidence</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by multi-dimensional scientific similarity with dynamic weight renormalization.
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                {analysis.matches.length} RUNS RANKED
              </Badge>
            </div>

            {analysis.matches.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-12 space-y-3">
                <p className="text-sm text-slate-300 font-medium">
                  No eligible NASA flight experiments matched this scenario.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The Comparable-Evidence Filter gated all candidate experiments due to fundamental physical incompatibilities (e.g. material phase or gravity transfer restrictions).
                </p>
                <div className="pt-2">
                  <Link to="/build">
                    <Button variant="primary" size="sm">
                      Adjust Habitat Parameters
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {analysis.matches.map((match, idx) => (
                  <EvidenceMatchCard key={match.run.id || idx} match={match} rank={idx + 1} />
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Cross-Exploration Actions */}
          <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F1626] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
                Deepen Your Investigation
              </h4>
              <p className="text-xs text-slate-400">
                Ask targeted combustion questions with cited sources or explore full NASA experiment campaigns.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/ask">
                <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                  Ask IGNIS AI
                </Button>
              </Link>
              <Link to="/experiments">
                <Button variant="outline" size="sm">
                  All NASA Experiments
                </Button>
              </Link>
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
};
