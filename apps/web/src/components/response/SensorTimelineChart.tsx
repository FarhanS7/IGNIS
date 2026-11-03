import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { SimStepResult } from '../../lib/fire/types.ts';
import { SIM_PARAMS } from '../../lib/fire/sim_params.ts';
import { Activity, Flame, ShieldAlert, Thermometer } from 'lucide-react';

interface SensorTimelineChartProps {
  steps: SimStepResult[];
  currentTime_s: number;
  onTimeSeek?: (t: number) => void;
  availableDetectorIds: string[];
  selectedDetectorId?: string;
}

const DETECTOR_COLORS: Record<string, string> = {
  det_1: '#38bdf8', // sky
  det_2: '#f59e0b', // amber
  det_3: '#ec4899', // pink
  det_4: '#a855f7', // purple
  det_core: '#38bdf8',
  det_power: '#f59e0b',
  det_docking: '#ec4899',
  det_hab: '#38bdf8',
  det_airlock: '#f59e0b',
  det_utility: '#ec4899',
};

export const SensorTimelineChart: React.FC<SensorTimelineChartProps> = ({
  steps,
  currentTime_s,
  onTimeSeek,
  availableDetectorIds,
  selectedDetectorId,
}) => {
  const [activeTab, setActiveTab] = useState<'obscuration' | 'co' | 'temperature'>('obscuration');

  // Format time series data for Recharts
  const chartData = steps.map((step) => {
    const row: Record<string, number> = {
      timestamp: step.timestamp_s,
    };
    for (const dId of availableDetectorIds) {
      const reading = step.detectorReadings[dId];
      if (reading) {
        if (activeTab === 'obscuration') {
          row[dId] = reading.obscuration_pct_m;
        } else if (activeTab === 'co') {
          row[dId] = reading.co_ppm;
        } else {
          row[dId] = reading.temperature_c;
        }
      }
    }
    return row;
  });

  const baselineAlarmObs = SIM_PARAMS.baseline_smoke_alarm_threshold.value;
  const advisoryObs = SIM_PARAMS.fusion_smoke_advisory_threshold.value;
  const advisoryCO = SIM_PARAMS.fusion_co_advisory_threshold.value;
  const alarmCO = SIM_PARAMS.fusion_co_alarm_threshold.value;

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md">
      {/* Chart Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">
            DETECTOR TELEMETRY TIMELINE
          </h3>
        </div>

        {/* Channel Tab Selector */}
        <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('obscuration')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'obscuration'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" /> Smoke (%/m)
          </button>
          <button
            onClick={() => setActiveTab('co')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'co'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> CO (ppm)
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'temperature'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" /> Temp (°C)
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={(e) => {
              if (e && e.activeLabel !== undefined && onTimeSeek) {
                onTimeSeek(Number(e.activeLabel));
              }
            }}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v}s`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={
                activeTab === 'obscuration'
                  ? [0, (dataMax: number) => Math.max(5.0, Math.ceil(dataMax * 1.2))]
                  : activeTab === 'co'
                  ? [0, (dataMax: number) => Math.max(60.0, Math.ceil(dataMax * 1.2))]
                  : [20, 35]
              }
              unit={activeTab === 'obscuration' ? '%/m' : activeTab === 'co' ? 'ppm' : '°C'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(value: any, name: any) => [
                `${Number(value).toFixed(2)} ${
                  activeTab === 'obscuration' ? '%/m' : activeTab === 'co' ? 'ppm' : '°C'
                }`,
                String(name),
              ]}
              labelFormatter={(label) => `Time: ${label}s`}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '6px' }}
            />

            {/* Threshold Reference Lines */}
            {activeTab === 'obscuration' && (
              <>
                <ReferenceLine
                  y={baselineAlarmObs}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Alarm Threshold (${baselineAlarmObs}%/m)`,
                    fill: '#f87171',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={advisoryObs}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: `Advisory (${advisoryObs}%/m)`,
                    fill: '#fbbf24',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
              </>
            )}

            {activeTab === 'co' && (
              <>
                <ReferenceLine
                  y={alarmCO}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `CO Alarm (${alarmCO} ppm)`,
                    fill: '#f87171',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={advisoryCO}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: `CO Advisory (${advisoryCO} ppm)`,
                    fill: '#fbbf24',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
              </>
            )}

            {/* Vertical Cursor on current scrubber time */}
            <ReferenceLine
              x={currentTime_s}
              stroke="#38bdf8"
              strokeWidth={2}
              label={{
                value: `t=${currentTime_s.toFixed(1)}s`,
                fill: '#38bdf8',
                fontSize: 10,
                position: 'top',
              }}
            />

            {/* Lines for each detector */}
            {availableDetectorIds.map((dId) => {
              const isSelected = selectedDetectorId === dId;
              const color = DETECTOR_COLORS[dId] || '#94a3b8';
              return (
                <Line
                  key={dId}
                  type="monotone"
                  dataKey={dId}
                  name={dId}
                  stroke={color}
                  strokeWidth={isSelected ? 3.0 : 1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

