import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export interface SmokeFlightRun {
  test_id: string;
  sample_material: string;
  sensor_ratio_rt_r0: number;
  net_aging_time_sec: number | null;
  inlet_velocity_cm_s: number;
  csv_row: number;
}

export interface SmokeMaterialChartProps {
  runs: SmokeFlightRun[];
  selectedTestId?: string | null;
  onSelectRun?: (run: SmokeFlightRun) => void;
  className?: string;
}

export const SmokeMaterialChart: React.FC<SmokeMaterialChartProps> = ({
  runs,
  selectedTestId,
  onSelectRun,
  className = '',
}) => {
  // Aggregate representative or distinct flight runs
  const featuredRuns = runs.slice(0, 12).map((r) => ({
    name: `${r.sample_material} (${r.test_id})`,
    material: r.sample_material,
    ratio: r.sensor_ratio_rt_r0,
    testId: r.test_id,
    row: r.csv_row,
    agingSec: r.net_aging_time_sec,
    raw: r,
  }));

  return (
    <div className={`w-full flex flex-col gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-xl select-none ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            From NASA Flight Tests
          </span>
          <h4 className="text-sm font-bold text-white mt-1">
            Smoke Sensor Resistance Ratio (Rt/R0) in Microgravity (SAME-R)
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-400">
          104 Flight Tests
        </span>
      </div>

      <div className="w-full h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={featuredRuns} margin={{ top: 10, right: 15, bottom: 25, left: -10 }}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[1.0, 1.6]}
              label={{
                value: 'Sensor Ratio (Rt/R0)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-cyan-400/80 p-2.5 rounded-lg shadow-2xl font-mono text-xs">
                      <div className="text-cyan-300 font-bold mb-1">
                        Test {d.testId} • {d.material}
                      </div>
                      <div className="text-slate-300">
                        Sensor Ratio (Rt/R0): <strong>{d.ratio.toFixed(2)}</strong>
                      </div>
                      {d.agingSec !== null && (
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Net Aging Time: {d.agingSec} s
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-1">
                        CSV Row {d.row} • NASA PSI-101 (SAME-R)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="ratio"
              radius={[6, 6, 0, 0]}
              onClick={(entry: any) => {
                if (entry && entry.raw && onSelectRun) {
                  onSelectRun(entry.raw);
                }
              }}
            >
              {featuredRuns.map((entry) => {
                const isSelected = selectedTestId === entry.testId;
                return (
                  <Cell
                    key={entry.testId}
                    fill={isSelected ? '#38bdf8' : '#0284c7'}
                    stroke={isSelected ? '#ffffff' : '#38bdf8'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer transition-all hover:opacity-80"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

