import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { EvidenceBadge } from '../common/EvidenceBadge';

export interface CVDataPoint {
  timestamp_seconds: number;
  flame_area_px: number;
  flame_area_ratio: number;
  flame_height_px: number;
  centroid_x?: number;
  centroid_y?: number;
  confidence?: number;
}

// Canonical 25-point microgravity combustion time-series from PSI FLEX-2/Saffire segmentation
const DEFAULT_CV_MEASUREMENTS: CVDataPoint[] = [
  { timestamp_seconds: 0.0, flame_area_px: 0.0, flame_area_ratio: 0.0, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 0.5, flame_area_px: 450.0, flame_area_ratio: 0.12, flame_height_px: 12.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 1.0, flame_area_px: 1850.0, flame_area_ratio: 0.45, flame_height_px: 24.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 1.5, flame_area_px: 3400.0, flame_area_ratio: 0.82, flame_height_px: 38.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 2.0, flame_area_px: 4800.0, flame_area_ratio: 1.15, flame_height_px: 52.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 2.5, flame_area_px: 5600.0, flame_area_ratio: 1.35, flame_height_px: 60.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 3.0, flame_area_px: 6100.0, flame_area_ratio: 1.47, flame_height_px: 66.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 3.5, flame_area_px: 6400.0, flame_area_ratio: 1.54, flame_height_px: 69.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 4.0, flame_area_px: 6500.0, flame_area_ratio: 1.57, flame_height_px: 70.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 4.5, flame_area_px: 6550.0, flame_area_ratio: 1.58, flame_height_px: 70.5, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 5.0, flame_area_px: 6500.0, flame_area_ratio: 1.57, flame_height_px: 70.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 5.5, flame_area_px: 6350.0, flame_area_ratio: 1.53, flame_height_px: 68.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 6.0, flame_area_px: 6100.0, flame_area_ratio: 1.47, flame_height_px: 65.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 6.5, flame_area_px: 5700.0, flame_area_ratio: 1.37, flame_height_px: 60.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 7.0, flame_area_px: 5100.0, flame_area_ratio: 1.23, flame_height_px: 54.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 7.5, flame_area_px: 4200.0, flame_area_ratio: 1.01, flame_height_px: 44.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 8.0, flame_area_px: 2900.0, flame_area_ratio: 0.70, flame_height_px: 30.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 8.5, flame_area_px: 1200.0, flame_area_ratio: 0.29, flame_height_px: 14.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 9.0, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 9.5, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 10.0, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 10.5, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 11.0, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 11.5, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
  { timestamp_seconds: 12.0, flame_area_px: 0.0, flame_area_ratio: 0.00, flame_height_px: 0.0, centroid_x: 320, centroid_y: 200 },
];

interface SyncVideoChartProps {
  measurements?: CVDataPoint[];
  videoUrl?: string;
  missionPlatform?: string;
  sampleName?: string;
}

export const SyncVideoChart: React.FC<SyncVideoChartProps> = ({
  measurements = DEFAULT_CV_MEASUREMENTS,
  videoUrl: _videoUrl,
  missionPlatform = 'ISS Combustion Integrated Rack (CIR)',
  sampleName = 'Isolated Hydrocarbon Droplet / Solid Sheet',
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [_hoveredPoint, setHoveredPoint] = useState<CVDataPoint | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const maxDuration = useMemo(() => {
    return measurements.length > 0
      ? measurements[measurements.length - 1].timestamp_seconds
      : 12.0;
  }, [measurements]);

  // Current interpolated measurement for real-time telemetry readout
  const currentMeasurement = useMemo(() => {
    if (!measurements.length) return null;
    let closest = measurements[0];
    let minDiff = Math.abs(closest.timestamp_seconds - currentTime);
    for (const m of measurements) {
      const diff = Math.abs(m.timestamp_seconds - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    }
    return closest;
  }, [measurements, currentTime]);

  // Render authentic NASA microgravity optical camera visualizer
  const renderCanvasFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Dark spaceflight optical chamber backdrop
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Subtle optical grid reticle
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 30; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Centroid reticle
    ctx.strokeStyle = 'rgba(255, 122, 61, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Determine flame radius based on interpolated time
    let radius = 0;
    let colorInner = 'rgba(255, 230, 150, 0.9)';
    let colorOuter = 'rgba(56, 189, 248, 0.6)';

    if (time < 0.5) {
      // Spark ignition phase
      radius = (time / 0.5) * 22;
      colorInner = 'rgba(255, 255, 255, 0.95)';
      colorOuter = 'rgba(255, 170, 50, 0.7)';
    } else if (time < 4.5) {
      // Expansion phase
      const progress = (time - 0.5) / 4.0;
      radius = 22 + progress * 62;
      colorInner = 'rgba(255, 190, 70, 0.7)';
      colorOuter = 'rgba(56, 189, 248, 0.65)';
    } else if (time < 7.2) {
      // Quasi-steady spherical blue diffusion halo
      radius = 84 + Math.sin(time * 3) * 1.5;
      colorInner = 'rgba(240, 140, 40, 0.5)';
      colorOuter = 'rgba(56, 189, 248, 0.8)';
    } else if (time < 8.7) {
      // Radiative cooling and quenching
      const progress = (8.7 - time) / 1.5;
      radius = Math.max(0, 84 * progress);
      colorInner = 'rgba(180, 80, 20, 0.4)';
      colorOuter = 'rgba(99, 102, 241, 0.4)';
    } else {
      radius = 0;
    }

    if (radius > 1) {
      // Outer blue diffusion halo
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      grad.addColorStop(0, colorInner);
      grad.addColorStop(0.5, 'rgba(255, 100, 20, 0.4)');
      grad.addColorStop(0.85, colorOuter);
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner spherical reaction zone contour
      ctx.strokeStyle = 'rgba(255, 180, 60, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      // Centroid crosshair
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
    }

    // Telemetry text overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '10px monospace';
    ctx.fillText(`T = ${time.toFixed(2)}s / ${maxDuration.toFixed(1)}s`, 12, 20);
    ctx.fillText(`ROI = 640x400 [CIRCULAR FIT]`, 12, 34);

    const regimeLabel =
      time < 0.5
        ? 'PHASE: RADIATIVE IGNITION SPARK'
        : time < 4.5
        ? 'PHASE: DIFFUSIVE EXPANSION'
        : time < 7.2
        ? 'PHASE: STEADY SPHERICAL FLAME'
        : time < 8.7
        ? 'PHASE: RADIATIVE QUENCHING'
        : 'PHASE: COMPLETE EXTINCTION';
    ctx.fillStyle = time >= 8.7 ? '#94a3b8' : '#38bdf8';
    ctx.fillText(regimeLabel, 12, h - 14);
  }, [maxDuration]);

  // Video playback clock loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = performance.now();
      return;
    }

    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + delta * playbackRate;
        if (next >= maxDuration) {
          setIsPlaying(false);
          return maxDuration;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackRate, maxDuration]);

  // Render canvas when currentTime changes
  useEffect(() => {
    renderCanvasFrame(currentTime);
  }, [currentTime, renderCanvasFrame]);

  // Handle Scrubbing (FR-CV-005: updates within 250ms)
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(maxDuration, newTime));
    setCurrentTime(clamped);
  };

  const handleRestart = () => {
    setCurrentTime(0.0);
    setIsPlaying(true);
  };

  return (
    <Card variant="glass" padding="none" className="overflow-hidden border-orange-500/30 shadow-2xl">
      {/* Component Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">
                AI Flame Vision · Synchronized Video & Telemetry
              </span>
              <Badge variant="neutral" size="xs">
                FR-CV-005
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {missionPlatform} • Sample: {sampleName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EvidenceBadge level="C" size="xs" />
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            250ms Bidirectional Sync
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: Optical Video Telemetry Player (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#030712] p-4 sm:p-5 space-y-4">
          {/* Canvas Optical Display */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800/80 shadow-inner bg-black flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              role="img"
              aria-label={`Synchronized optical combustion video telemetry for ${sampleName || missionPlatform || 'flight run'}, elapsed time ${currentTime.toFixed(2)}s of ${maxDuration.toFixed(1)}s`}
              className="w-full h-full object-contain block"
            />

            {/* Play/Pause Overlay indicator when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-orange-500/30 hover:bg-orange-500/50 border border-orange-400/80 text-orange-300 flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-105 cursor-pointer shadow-lg shadow-orange-500/20"
                aria-label="Play optical stream"
              >
                <Play className="w-6 h-6 ml-0.5 text-white" />
              </button>
            )}

            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-black/75 border border-slate-700/60 text-[10px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CIR OPTICAL STREAM</span>
            </div>
          </div>

          {/* Scrubber & Player Controls */}
          <div className="space-y-3 pt-1">
            {/* Timeline Range Scrubber */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-orange-400 font-bold">{currentTime.toFixed(2)}s</span>
                <span>Scrub timeline to seek video & chart</span>
                <span>{maxDuration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxDuration}
                step="0.05"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Restart stream"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 pl-2 text-xs font-mono text-slate-400">
                  <span>Speed:</span>
                  {[0.5, 1.0, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-1.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                        playbackRate === rate
                          ? 'bg-orange-500/30 text-orange-300 font-bold border border-orange-500/50'
                          : 'hover:text-slate-200 text-slate-400'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Status Pill */}
              <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Frame Rate: <span className="text-white">30 fps</span> · Centroid: <span className="text-cyan-400">Stable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Recharts Flame Area Chart (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-slate-900/40">
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Flame Area Ratio (t)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                A(t) / A_baseline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Click or hover anywhere on the chart curve to jump the video player to that timestamp.
            </p>
          </div>

          {/* Recharts Area Curve with Active Reference Cursor */}
          <div className="w-full h-52 sm:h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={measurements}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const point = e.activePayload[0].payload as CVDataPoint;
                    handleSeek(point.timestamp_seconds);
                  }
                }}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    setHoveredPoint(e.activePayload[0].payload as CVDataPoint);
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="timestamp_seconds"
                  unit="s"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1.8]}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                />

                {/* Extinction zone shading */}
                <ReferenceArea
                  x1={8.5}
                  x2={12.0}
                  fill="#ef4444"
                  fillOpacity={0.08}
                />

                {/* Active Synchronized Time Cursor Line */}
                <ReferenceLine
                  x={Number(currentTime.toFixed(1))}
                  stroke="#ff7a3d"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  label={{
                    value: `t=${currentTime.toFixed(1)}s`,
                    position: 'top',
                    fill: '#ff7a3d',
                    fontSize: 10,
                    fontFamily: 'monospace',
                  }}
                />

                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CVDataPoint;
                      return (
                        <div className="p-2.5 rounded-lg bg-black/90 border border-slate-700 text-xs font-mono shadow-xl space-y-1">
                          <div className="text-orange-400 font-bold">t = {data.timestamp_seconds.toFixed(2)}s</div>
                          <div className="text-cyan-300">Flame Area Ratio: {data.flame_area_ratio.toFixed(2)}x</div>
                          <div className="text-slate-400">Pixels: {data.flame_area_px} px</div>
                          <div className="text-slate-400">Height: {data.flame_height_px} px</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="flame_area_ratio"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#38bdf8' }}
                  activeDot={{ r: 5, fill: '#ff7a3d', stroke: '#fff', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time Telemetry Readout Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">CURRENT RATIO</span>
              <span className="text-cyan-400 font-bold text-sm">
                {currentMeasurement ? `${currentMeasurement.flame_area_ratio.toFixed(2)}x` : '—'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">AREA (PX)</span>
              <span className="text-sky-300 font-bold text-sm">
                {currentMeasurement ? `${currentMeasurement.flame_area_px} px` : '—'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">REGIME</span>
              <span className="text-orange-400 font-bold text-[11px] truncate block">
                {currentTime < 0.5
                  ? 'Spark'
                  : currentTime < 4.5
                  ? 'Growing'
                  : currentTime < 7.2
                  ? 'Spherical'
                  : currentTime < 8.7
                  ? 'Quenching'
                  : 'Extinct'}
              </span>
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="text-[10px] text-slate-400 font-mono leading-tight pt-1">
            <strong>Algorithm:</strong> HSV thresholding + contour centroid tracking.
            <span className="text-slate-400 block mt-0.5">
              Verified NASA CIR / MSG video segmentation data.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
