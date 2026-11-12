import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from 'recharts';

export interface FlightScatterRun {
  runId: string;
  testNumber: number;
  fuel: string;
  initialDiameterMm: number;
  durationSec: number;
  csvRow: number;
}

export interface FlightScatterChartProps {
  runs: FlightScatterRun[];
  selectedRunId?: string | null;
  onSelectRun?: (run: FlightScatterRun) => void;
  className?: string;
}

export const FlightScatterChart: React.FC<FlightScatterChartProps> = ({
  runs,
  selectedRunId,
  onSelectRun,
  className = '',
}) => {
  const chartData = runs.map((r) => ({
    x: r.initialDiameterMm,
    y: r.durationSec,
    runId: r.runId,
    fuel: r.fuel,
    testNumber: r.testNumber,
    raw: r,
  }));

  return (
    <div className={`w-full flex flex-col gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            From NASA Flight Tests
          </span>
          <h4 className="text-sm font-bold text-white mt-1">
            Droplet Size vs Burn Time (FLEX on ISS)
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {runs.length} Flight Tests
        </span>
      </div>

      {/* Chart container */}
      <div className="w-full h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: -10 }}>
            <XAxis
              type="number"
              dataKey="x"
              name="Initial Diameter"
              unit=" mm"
              stroke="#64748b"
              fontSize={11}
              domain={[1.0, 4.5]}
              label={{
                value: 'Initial Diameter (mm)',
                position: 'insideBottom',
                offset: -12,
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Burn Duration"
              unit=" s"
              stroke="#64748b"
              fontSize={11}
              domain={[0, 15]}
              label={{
                value: 'Burn Time (s)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />
            <ZAxis range={[50, 70]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-cyan-400/80 p-2.5 rounded-lg shadow-2xl font-mono text-xs">
                      <div className="text-cyan-300 font-bold mb-1">
                        Test #{d.testNumber} ({d.fuel})
                      </div>
                      <div className="text-slate-300">
                        Diameter: <strong>{d.x.toFixed(2)} mm</strong>
                      </div>
                      <div className="text-slate-300">
                        Duration: <strong>{d.y.toFixed(1)} s</strong>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Run ID: {d.runId}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              data={chartData}
              onClick={(entry: any) => {
                if (entry && entry.raw && onSelectRun) {
                  onSelectRun(entry.raw);
                }
              }}
            >
              {chartData.map((entry) => {
                const isSelected = selectedRunId === entry.runId;
                return (
                  <Cell
                    key={entry.runId}
                    fill={isSelected ? '#38bdf8' : '#f59e0b'}
                    stroke={isSelected ? '#ffffff' : '#b45309'}
                    strokeWidth={isSelected ? 2.5 : 1}
                    className="cursor-pointer transition-all"
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Derived One-line takeaway from the data */}
      <p className="text-xs text-slate-300 italic bg-black/40 border border-white/5 rounded-lg p-2 leading-relaxed">
        <strong>Takeaway:</strong> Larger droplets burn longer, but extinguish when soot buildup starves the flame of oxygen.
      </p>
    </div>
  );
};
