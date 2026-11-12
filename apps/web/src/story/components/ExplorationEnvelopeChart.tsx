import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export interface EnvelopeEntry {
  mission: string;
  oxygen_pct: number;
  pressure_kpa: number;
  status: 'Tested' | 'Untested Gap';
}

export interface ExplorationEnvelopeChartProps {
  entries: EnvelopeEntry[];
  selectedMission?: string | null;
  onSelectEntry?: (entry: EnvelopeEntry) => void;
  className?: string;
}

export const ExplorationEnvelopeChart: React.FC<ExplorationEnvelopeChartProps> = ({
  entries,
  selectedMission,
  onSelectEntry,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-xl select-none ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            From NASA Flight Archives & Exploration Architecture
          </span>
          <h4 className="text-sm font-bold text-white mt-1">
            Flight-Tested Envelope vs Uncharted Exploration Cabins
          </h4>
        </div>
      </div>

      <div className="w-full h-60 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entries} margin={{ top: 10, right: 15, bottom: 25, left: -10 }}>
            <XAxis
              dataKey="mission"
              stroke="#64748b"
              fontSize={10}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 110]}
              label={{
                value: 'O2 (%) / Pressure (kPa)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as EnvelopeEntry;
                  return (
                    <div className="bg-slate-950 border border-cyan-400/80 p-2.5 rounded-lg shadow-2xl font-mono text-xs">
                      <div className="text-cyan-300 font-bold mb-1">
                        {d.mission}
                      </div>
                      <div className="text-slate-300">
                        Oxygen: <strong>{d.oxygen_pct}%</strong>
                      </div>
                      <div className="text-slate-300">
                        Pressure: <strong>{d.pressure_kpa} kPa</strong>
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          d.status === 'Tested'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {d.status === 'Tested' ? 'NASA Tested Flight Data' : 'Untested Research Gap'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
            <Bar
              dataKey="oxygen_pct"
              name="Oxygen (%)"
              fill="#38bdf8"
              radius={[4, 4, 0, 0]}
              onClick={(entry: any) => {
                if (entry && entry.payload && onSelectEntry) {
                  onSelectEntry(entry.payload);
                }
              }}
            >
              {entries.map((entry) => {
                const isSelected = selectedMission === entry.mission;
                const isTested = entry.status === 'Tested';
                return (
                  <Cell
                    key={entry.mission}
                    fill={isSelected ? '#38bdf8' : isTested ? '#0284c7' : '#f43f5e'}
                    stroke={isSelected ? '#ffffff' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer transition-all hover:opacity-80"
                  />
                );
              })}
            </Bar>
            <Bar
              dataKey="pressure_kpa"
              name="Pressure (kPa)"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              onClick={(entry: any) => {
                if (entry && entry.payload && onSelectEntry) {
                  onSelectEntry(entry.payload);
                }
              }}
            >
              {entries.map((entry) => {
                const isSelected = selectedMission === entry.mission;
                return (
                  <Cell
                    key={entry.mission}
                    fill={isSelected ? '#fbbf24' : '#d97706'}
                    stroke={isSelected ? '#ffffff' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
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

