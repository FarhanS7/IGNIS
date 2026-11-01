import React from 'react';
import rawRuns from '../../data/evidence_runs.json';

interface MiniEnvelopePlotProps {
  scenarioO2: number;
  scenarioFlow: number;
  radius: number;
  isOutside: boolean;
}

const USABLE_RUNS = (rawRuns as any[])
  .filter((r) => r.fuel_class === 'solid' && r.usable_for_matching === true)
  .map((r) => ({
    uid: r.run_uid,
    o2: r.oxygen_pct?.value,
    flow: r.flow_cm_s?.value,
  }))
  .filter((p) => typeof p.o2 === 'number' && typeof p.flow === 'number');

export const MiniEnvelopePlot: React.FC<MiniEnvelopePlotProps> = ({
  scenarioO2,
  scenarioFlow,
  radius,
  isOutside,
}) => {
  // Coordinate frame:
  // O2: [10, 40] -> x: [30, 250]
  // Flow: [0, 45] -> y: [150, 20] (inverted)
  const width = 270;
  const height = 180;
  const padLeft = 32;
  const padRight = 16;
  const padBottom = 28;
  const padTop = 16;

  const minO2 = 10;
  const maxO2 = 38;
  const minFlow = 0;
  const maxFlow = 45;

  const scaleX = (o2: number) =>
    padLeft + ((o2 - minO2) / (maxO2 - minO2)) * (width - padLeft - padRight);

  const scaleY = (flow: number) =>
    height - padBottom - ((flow - minFlow) / (maxFlow - minFlow)) * (height - padTop - padBottom);

  const scenarioX = scaleX(scenarioO2);
  const scenarioY = scaleY(scenarioFlow);

  // Radius conversion to pixels
  // Radius is in normalized units: dO2 = radius * 20%, dFlow = radius * 40 cm/s
  const rx = ((radius * 20) / (maxO2 - minO2)) * (width - padLeft - padRight);
  const ry = ((radius * 40) / (maxFlow - minFlow)) * (height - padTop - padBottom);

  return (
    <div className="relative bg-black/40 border border-white/10 rounded-lg p-2 flex flex-col items-center">
      <div className="text-[10px] font-mono text-white/60 mb-1 flex justify-between w-full px-1">
        <span>O₂ vs Flow Tested Envelope</span>
        {isOutside ? (
          <span className="text-amber-400 font-semibold">⚠️ Outside Tested Envelope</span>
        ) : (
          <span className="text-emerald-400">Within Tested Range</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[270px] h-[160px] overflow-visible"
        aria-label={`Envelope plot for ${scenarioO2}% O2 and ${scenarioFlow} cm/s flow`}
      >
        {/* Grid lines */}
        <line
          x1={padLeft}
          y1={height - padBottom}
          x2={width - padRight}
          y2={height - padBottom}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={height - padBottom}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* Axis ticks and labels */}
        {/* O2 axis */}
        <text x={scaleX(15)} y={height - 10} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">
          15%
        </text>
        <text x={scaleX(21)} y={height - 10} fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">
          21%
        </text>
        <text x={scaleX(30)} y={height - 10} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">
          30%
        </text>
        <text x={scaleX(34)} y={height - 10} fill="rgba(255,255,255,0.8)" fontSize="9" textAnchor="middle">
          34%
        </text>

        {/* Flow axis */}
        <text x={padLeft - 6} y={scaleY(0) + 3} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">
          0
        </text>
        <text x={padLeft - 6} y={scaleY(10) + 3} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">
          10
        </text>
        <text x={padLeft - 6} y={scaleY(20) + 3} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">
          20
        </text>
        <text x={padLeft - 6} y={scaleY(30) + 3} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">
          30
        </text>

        {/* Max tested O2 dashed line (30.7%) */}
        <line
          x1={scaleX(30.7)}
          y1={padTop}
          x2={scaleX(30.7)}
          y2={height - padBottom}
          stroke="rgba(239, 68, 68, 0.4)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
        <text
          x={scaleX(30.7) + 2}
          y={padTop + 10}
          fill="rgba(239, 68, 68, 0.7)"
          fontSize="7"
          fontFamily="monospace"
        >
          max 30.7%
        </text>

        {/* Tested flight runs (dots) */}
        {USABLE_RUNS.map((p, i) => (
          <circle
            key={p.uid || i}
            cx={scaleX(p.o2)}
            cy={scaleY(p.flow)}
            r="2"
            fill="rgba(147, 197, 253, 0.35)"
          />
        ))}

        {/* Radius circle around scenario */}
        <ellipse
          cx={scenarioX}
          cy={scenarioY}
          rx={Math.max(4, rx)}
          ry={Math.max(4, ry)}
          fill="rgba(245, 158, 11, 0.08)"
          stroke="rgba(245, 158, 11, 0.5)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Scenario marker */}
        <circle
          cx={scenarioX}
          cy={scenarioY}
          r="5"
          fill={isOutside ? '#ef4444' : '#f59e0b'}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <text
          x={scenarioX}
          y={scenarioY - 8}
          fill="#ffffff"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
        >
          Target
        </text>
      </svg>
    </div>
  );
};
