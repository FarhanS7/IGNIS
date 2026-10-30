import React, { useState, useMemo } from 'react';
import type { RealSolidMatch, TestedEnvelopePoint, SolidEnvelopeData } from '../../lib/matcher/types';
import { AlertTriangle, Info, Crosshair, HelpCircle } from 'lucide-react';

interface PlottedPoint extends TestedEnvelopePoint {
  cx: number;
  cy: number;
  isTop5: boolean;
}

interface EvidenceEnvelopePlotProps {
  envelope: SolidEnvelopeData;
  matches: RealSolidMatch[];
  scenarioO2: number;
  scenarioFlow: number;
  scenarioMaterial?: string;
  scenarioPressure?: number | null;
  scenarioGravity?: number | null;
  onSelectRun?: (runUid: string) => void;
}

export const EvidenceEnvelopePlot: React.FC<EvidenceEnvelopePlotProps> = ({
  envelope,
  matches,
  scenarioO2,
  scenarioFlow,
  scenarioMaterial = 'PMMA',
  scenarioPressure = 101.3,
  scenarioGravity = 0.0,
  onSelectRun,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PlottedPoint | null>(null);

  // Envelope bounds
  const [minO2, maxO2] = envelope.tested_range_o2;
  const [minFlow, maxFlow] = envelope.tested_range_flow;

  // Plot display domains with safety padding
  const plotO2Min = 10.0;
  const plotO2Max = Math.max(38.0, scenarioO2 + 3.0);
  const plotFlowMin = 0.0;
  const plotFlowMax = Math.max(35.0, scenarioFlow + 5.0);

  // SVG dimensions & margins
  const width = 640;
  const height = 420;
  const margin = { top: 30, right: 30, bottom: 50, left: 55 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const scaleX = (o2: number) => {
    return margin.left + ((o2 - plotO2Min) / (plotO2Max - plotO2Min)) * innerWidth;
  };

  const scaleY = (flow: number) => {
    // Invert Y axis for standard cartesian plot
    return margin.top + innerHeight - ((flow - plotFlowMin) / (plotFlowMax - plotFlowMin)) * innerHeight;
  };

  const scenarioX = scaleX(scenarioO2);
  const scenarioY = scaleY(scenarioFlow);

  // Top 5 nearest runs
  const top5Matches = useMemo(() => matches.slice(0, 5), [matches]);
  const top5Uids = useMemo(() => new Set(top5Matches.map((m) => m.run_uid)), [top5Matches]);

  // Points mapping with coordinates
  const pointsWithCoords = useMemo(() => {
    return envelope.tested_points.map((pt) => ({
      ...pt,
      cx: scaleX(pt.oxygen_pct),
      cy: scaleY(pt.flow_cm_s),
      isTop5: top5Uids.has(pt.run_uid),
    }));
  }, [envelope.tested_points, top5Uids, plotO2Min, plotO2Max, plotFlowMin, plotFlowMax]);

  // Out of tested range calculation
  const outOfRangeMessages = useMemo(() => {
    const msgs: string[] = [];
    if (scenarioO2 < minO2) {
      msgs.push(`Oxygen (${scenarioO2}%) is ${(minO2 - scenarioO2).toFixed(1)}% below the tested microgravity envelope (min ${minO2}%)`);
    } else if (scenarioO2 > maxO2) {
      msgs.push(`Oxygen (${scenarioO2}%) is ${(scenarioO2 - maxO2).toFixed(1)}% above the tested microgravity envelope (max ${maxO2}%)`);
    }

    if (scenarioFlow < minFlow) {
      msgs.push(`Flow (${scenarioFlow} cm/s) is ${(minFlow - scenarioFlow).toFixed(1)} cm/s below the tested envelope (min ${minFlow} cm/s)`);
    } else if (scenarioFlow > maxFlow) {
      msgs.push(`Flow (${scenarioFlow} cm/s) is ${(scenarioFlow - maxFlow).toFixed(1)} cm/s above the tested envelope (max ${maxFlow} cm/s)`);
    }
    return msgs;
  }, [scenarioO2, scenarioFlow, minO2, maxO2, minFlow, maxFlow]);

  // Outcome color mapping
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'frames_recorded':
      case 'sustained':
        return '#10b981'; // Emerald
      case 'extinguished':
        return '#f59e0b'; // Amber
      case 'no_ignition':
        return '#a855f7'; // Purple
      default:
        return '#71717a'; // Zinc
    }
  };

  // Material shape rendering
  const renderShape = (pt: any) => {
    const color = getOutcomeColor(pt.outcome_class);
    const size = pt.isTop5 ? 6 : 4;
    const strokeWidth = pt.isTop5 ? 2 : 1;
    const stroke = pt.isTop5 ? '#ffffff' : 'rgba(0,0,0,0.4)';

    const fam = (pt.material_family || '').toLowerCase();

    if (fam.includes('pmma')) {
      return (
        <circle
          cx={pt.cx}
          cy={pt.cy}
          r={size}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (fam.includes('sibal')) {
      return (
        <rect
          x={pt.cx - size}
          y={pt.cy - size}
          width={size * 2}
          height={size * 2}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (fam.includes('nomex')) {
      const points = `${pt.cx},${pt.cy - size - 1} ${pt.cx - size - 1},${pt.cy + size} ${pt.cx + size + 1},${pt.cy + size}`;
      return (
        <polygon
          points={points}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (fam.includes('silicone')) {
      const points = `${pt.cx},${pt.cy - size - 1} ${pt.cx + size + 1},${pt.cy} ${pt.cx},${pt.cy + size + 1} ${pt.cx - size - 1},${pt.cy}`;
      return (
        <polygon
          points={points}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }

    return (
      <circle
        cx={pt.cx}
        cy={pt.cy}
        r={size}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  };

  // Tested envelope rectangle boundaries
  const envX1 = scaleX(minO2);
  const envX2 = scaleX(maxO2);
  const envY1 = scaleY(maxFlow);
  const envY2 = scaleY(minFlow);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-4">
      {/* Title & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            Empirical Flight Evidence Envelope (O₂ vs. Airflow)
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Plotting all {envelope.tested_points.length} usable NASA solid-fuel microgravity flight runs • Scenario: {scenarioMaterial} ({scenarioPressure != null ? `${scenarioPressure} kPa [untested]` : 'untested pressure'})
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Photographed burn</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>PI Extinction</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>No Ignition</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-3 h-3 rounded-full border-2 border-cyan-400 inline-block" />
            <span>Scenario</span>
          </div>
        </div>
      </div>

      {/* Out of range banner if applicable */}
      {outOfRangeMessages.length > 0 && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs font-mono text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-rose-200">Scenario Outside Verified Microgravity Flight Envelope</strong>
            {outOfRangeMessages.map((msg, i) => (
              <div key={i}>• {msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* SVG Scatter Plot */}
      <div className="relative w-full aspect-[16/10] bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Shaded Flight Tested Envelope Boundary */}
          <rect
            x={envX1}
            y={envY1}
            width={envX2 - envX1}
            height={envY2 - envY1}
            fill="rgba(6, 182, 212, 0.07)"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            rx="4"
          />
          <text
            x={envX1 + 8}
            y={envY1 + 16}
            fill="rgba(6, 182, 212, 0.7)"
            fontSize="10"
            fontFamily="monospace"
          >
            TESTED FLIGHT ENVELOPE (13.6% - 22.2% O₂, 0 - 28.2 cm/s)
          </text>

          {/* Lines Connecting Scenario to Top-5 Nearest Runs */}
          {pointsWithCoords
            .filter((p) => p.isTop5)
            .map((p) => (
              <line
                key={`line-${p.run_uid}`}
                x1={scenarioX}
                y1={scenarioY}
                x2={p.cx}
                y2={p.cy}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="2 3"
                opacity="0.8"
              />
            ))}

          {/* Scatter Points (132 solid runs) */}
          {pointsWithCoords.map((pt) => {
            return (
              <g
                key={pt.run_uid}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onSelectRun && onSelectRun(pt.run_uid)}
              >
                {pt.isTop5 && (
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r="10"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                )}
                {renderShape(pt)}
              </g>
            );
          })}

          {/* Scenario Marker (User's Point) */}
          <g>
            <circle
              cx={scenarioX}
              cy={scenarioY}
              r="14"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="animate-spin"
              style={{ transformOrigin: `${scenarioX}px ${scenarioY}px` }}
            />
            <circle cx={scenarioX} cy={scenarioY} r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
            <circle cx={scenarioX} cy={scenarioY} r="2" fill="#ffffff" />
            <text
              x={scenarioX + 12}
              y={scenarioY - 8}
              fill="#22d3ee"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Scenario ({scenarioO2}%, {scenarioFlow} cm/s)
            </text>
          </g>

          {/* X Axis */}
          <line
            x1={margin.left}
            y1={margin.top + innerHeight}
            x2={margin.left + innerWidth}
            y2={margin.top + innerHeight}
            stroke="#52525b"
            strokeWidth="1"
          />
          {[12, 16, 20, 24, 28, 32, 36]
            .filter((val) => val <= plotO2Max)
            .map((val) => {
              const x = scaleX(val);
              return (
                <g key={`x-tick-${val}`}>
                  <line x1={x} y1={margin.top + innerHeight} x2={x} y2={margin.top + innerHeight + 5} stroke="#71717a" />
                  <text
                    x={x}
                    y={margin.top + innerHeight + 18}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}
          <text
            x={margin.left + innerWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#d4d4d8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Ambient Oxygen Concentration (Vol. %)
          </text>

          {/* Y Axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + innerHeight}
            stroke="#52525b"
            strokeWidth="1"
          />
          {[0, 5, 10, 15, 20, 25, 30, 35]
            .filter((val) => val <= plotFlowMax)
            .map((val) => {
              const y = scaleY(val);
              return (
                <g key={`y-tick-${val}`}>
                  <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#71717a" />
                  <text
                    x={margin.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#a1a1aa"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
          <text
            transform={`rotate(-90, 15, ${margin.top + innerHeight / 2})`}
            x={15}
            y={margin.top + innerHeight / 2}
            textAnchor="middle"
            fill="#d4d4d8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Forced Oxidizer Flow Velocity (cm/s)
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 bg-black/90 border border-cyan-500/50 rounded-lg shadow-xl text-xs font-mono space-y-1 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.cx / width) * 100}%`,
              top: `${(hoveredPoint.cy / height) * 100 - 3}%`,
            }}
          >
            <div className="font-bold text-cyan-300">{hoveredPoint.run_uid}</div>
            <div className="text-zinc-300">Material: {hoveredPoint.material}</div>
            <div className="text-zinc-300">
              O₂: <strong className="text-zinc-100">{hoveredPoint.oxygen_pct}%</strong> • Flow:{' '}
              <strong className="text-zinc-100">{hoveredPoint.flow_cm_s} cm/s</strong>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getOutcomeColor(hoveredPoint.outcome_class) }}
              />
              <span className="text-zinc-200 uppercase text-[10px]">
                {hoveredPoint.outcome_class === 'frames_recorded'
                  ? 'Photographed burn'
                  : hoveredPoint.outcome_class === 'extinguished'
                  ? 'PI Extinction'
                  : hoveredPoint.outcome_class}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Epistemic Notices (Mandatory Rules) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block text-zinc-200">Pressure Notice</strong>
            No solid-fuel flight run measured pressure; this is untested.
          </div>
        </div>

        <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block text-zinc-200">Gravitational Transfer Notice</strong>
            {(scenarioGravity ?? 0) > 0.01 ? (
              <span className="text-amber-300">
                All matched runs were microgravity (~0 g); transfer to partial gravity ({scenarioGravity} g) is untested.
              </span>
            ) : (
              <span>All matched flight runs were conducted in microgravity (~0 g).</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
