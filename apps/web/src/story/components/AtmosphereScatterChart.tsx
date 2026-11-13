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

export interface BassRun {
  run_uid: string;
  source_row: number;
  oxygen_pct: number;
  flow_cm_s: number;
  material: string;
  extinguished: boolean;
  co2_pct?: number;
}

export interface AtmosphereScatterChartProps {
  runs: BassRun[];
  selectedRunUid?: string | null;
  onSelectRun?: (run: BassRun) => void;
  className?: string;
}

export const AtmosphereScatterChart: React.FC<AtmosphereScatterChartProps> = ({
  runs,
  selectedRunUid,
  onSelectRun,
  className = '',
}) => {
  const chartData = runs.map((r) => ({
    x: r.oxygen_pct,
    y: r.flow_cm_s,
    runUid: r.run_uid,
    material: r.material,
    extinguished: r.extinguished,
    row: r.source_row,
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
            Oxygen % vs Airflow Speed (BASS-II on ISS)
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
              name="Oxygen"
              unit="%"
              stroke="#64748b"
              fontSize={11}
              domain={[13.0, 23.0]}
              label={{
                value: 'Oxygen Concentration (%)',
                position: 'insideBottom',
                offset: -12,
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Forced Airflow"
              unit=" cm/s"
              stroke="#64748b"
              fontSize={11}
              domain={[0, 30]}
              label={{
                value: 'Airflow (cm/s)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />
            <ZAxis range={[50, 75]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-cyan-400/80 p-2.5 rounded-lg shadow-2xl font-mono text-xs">
                      <div className="text-cyan-300 font-bold mb-1">
                        Run {d.runUid}
                      </div>
                      <div className="text-slate-300">
                        Oxygen: <strong>{d.x.toFixed(1)}%</strong>
                      </div>
                      <div className="text-slate-300">
                        Airflow: <strong>{d.y.toFixed(2)} cm/s</strong>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5 truncate max-w-xs">
                        Fuel: {d.material}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        CSV Row {d.row} • U = 1.0066 * AirDisplay
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
                const isSelected = selectedRunUid === entry.runUid;
                // Cyan for sustained burning, amber for low-flow / extinguishing
                const fillColor = isSelected
                  ? '#38bdf8'
                  : entry.extinguished
                  ? '#f59e0b'
                  : '#10b981';

                return (
                  <Cell
                    key={entry.runUid}
                    fill={fillColor}
                    stroke={isSelected ? '#ffffff' : '#047857'}
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
        <strong>Takeaway:</strong> Lower oxygen requires faster airflow to avoid low-speed quenching extinction.
      </p>
    </div>
  );
};

