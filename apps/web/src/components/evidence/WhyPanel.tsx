import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { EvidenceBadge } from '../common/EvidenceBadge';
import type { EvidenceMatch, ScenarioInput } from '../../types/api';

interface Props {
  topMatch?: EvidenceMatch;
  scenario: ScenarioInput;
  comparableCount: number;
}

export const WhyPanel: React.FC<Props> = ({
  topMatch,
  scenario,
  comparableCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!topMatch) {
    return null;
  }

  // Prepare factor data for Recharts
  const chartData = (topMatch.factor_explanations || []).map((f) => ({
    name: f.factor.replace(/_/g, ' '),
    score: Math.round((f.similarity_score ?? 0) * 100),
    weight: Math.round((f.active_weight ?? 0) * 100),
    scenarioVal: f.scenario_value ?? '—',
    expVal: f.experiment_value ?? '—',
  }));

  // Identify mismatches (< 80% similarity score)
  const mismatches = (topMatch.factor_explanations || []).filter(
    (f) => f.similarity_score !== null && f.similarity_score !== undefined && f.similarity_score < 0.8
  );

  return (
    <Card variant="default" padding="lg" className="border-sky-500/20 shadow-xl shadow-black/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="plasma" size="xs">
                EXPLAINABILITY ENGINE (PRD §10.6)
              </Badge>
              <EvidenceBadge level="A" size="xs" />
            </div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-white">
              <HelpCircle className="w-6 h-6 text-sky-400" />
              <span>Why Did These Experiments Match?</span>
            </CardTitle>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse Analysis' : 'Expand Analysis'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <CardDescription className="pt-1">
          Decomposition of physical factor correlations between your habitat scenario and top-ranked NASA flight records.
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pt-2">
          {/* Top Contributing Factor Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-white font-sans font-semibold">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Factor Similarity Scores (0–100%)</span>
              </span>
              <span>Based on normalized distance vectors</span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                    stroke="#334155"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#e2e8f0', fontSize: 11, fontFamily: 'sans-serif' }}
                    stroke="#334155"
                    width={110}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as {
                          name: string;
                          score: number;
                          weight: number;
                          scenarioVal: string | number;
                          expVal: string | number;
                        };
                        return (
                          <div className="bg-[#0A0E1A] border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs font-mono space-y-1">
                            <p className="font-bold text-white capitalize">{data.name}</p>
                            <p className="text-sky-300">Similarity: {data.score}%</p>
                            <p className="text-slate-400">Weight Contribution: {data.weight}%</p>
                            <p className="text-orange-400">Your Scenario: {String(data.scenarioVal)}</p>
                            <p className="text-emerald-400">NASA Test Value: {String(data.expVal)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score >= 90
                            ? '#10B981'
                            : entry.score >= 70
                            ? '#38BDF8'
                            : entry.score >= 50
                            ? '#F59E0B'
                            : '#EF4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Mismatches & Extrapolation Caveats */}
          {mismatches.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Identified Environmental Mismatches & Caveats</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                {mismatches.map((m, idx) => (
                  <li key={idx}>
                    <strong className="text-white capitalize">{m.factor.replace(/_/g, ' ')}:</strong>{' '}
                    Your habitat specified <span className="text-orange-300 font-mono">{String(m.scenario_value)}</span>{' '}
                    vs NASA flight test <span className="text-sky-300 font-mono">{String(m.experiment_value)}</span>{' '}
                    (Similarity: {Math.round((m.similarity_score ?? 0) * 100)}%).
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Matched Experiment Citation & Provenance Links */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-orange-400" />
                <span>Primary Benchmark: {topMatch.experiment.title}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {comparableCount} comparable runs evaluated
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {topMatch.experiment.summary ||
                'NASA Physical Sciences Informatics peer-reviewed flight test dataset investigating flame spread and extinction dynamics.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Regime:</span>
                <span className="font-mono text-white">
                  {scenario.gravity_environment || '0g microgravity'}
                </span>
              </div>

              {topMatch.experiment.source_url && (
                <a
                  href={topMatch.experiment.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                >
                  <span>Open NASA PSI Dataset DOI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
