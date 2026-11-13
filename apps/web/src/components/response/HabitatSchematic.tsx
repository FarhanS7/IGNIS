import React from 'react';
import type { HabitatGraph, LocalizationResult, SimStepResult } from '../../lib/fire/types.ts';
import { AlertTriangle, Wind } from 'lucide-react';

interface HabitatSchematicProps {
  habitat: HabitatGraph;
  currentStepData?: SimStepResult;
  localizationResult?: LocalizationResult;
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  damperStates?: Record<string, 'OPEN' | 'CLOSING' | 'CLOSED'>;
  zonePowerStates?: Record<string, 'ON' | 'SHEDDING' | 'OFF'>;
}

export const HabitatSchematic: React.FC<HabitatSchematicProps> = ({
  habitat,
  currentStepData,
  localizationResult,
  selectedZoneId,
  onSelectZone,
  damperStates = {},
  zonePowerStates = {},
}) => {
  const isPartialG = habitat.environment === 'lunar_partial_g' || habitat.environment === 'martian_partial_g';
  const zones = habitat.zones;

  // Visual layout coordinates for 3 or 4 zone modules
  // Canvas: 800 x 360
  const zoneCoords: Record<string, { x: number; y: number; w: number; h: number }> = {
    // iss_like_module
    zone_1: { x: 40, y: 50, w: 160, h: 240 },
    zone_2: { x: 230, y: 50, w: 160, h: 240 },
    zone_3: { x: 420, y: 50, w: 160, h: 240 },
    zone_4: { x: 610, y: 50, w: 160, h: 240 },
    // uncrewed_habitat
    zone_core: { x: 80, y: 60, w: 190, h: 220 },
    zone_power: { x: 310, y: 60, w: 190, h: 220 },
    zone_docking: { x: 540, y: 60, w: 190, h: 220 },
    // lunar_habitat
    zone_hab: { x: 80, y: 60, w: 190, h: 220 },
    zone_airlock: { x: 310, y: 60, w: 190, h: 220 },
    zone_utility: { x: 540, y: 60, w: 190, h: 220 },
  };

  const getDetectorState = (detId: string) => {
    return currentStepData?.detectorOutputs?.[detId]?.state || 'NOMINAL';
  };

  const getRankedBadge = (zId: string) => {
    if (!localizationResult || localizationResult.status === 'INSUFFICIENT_EVIDENCE') return null;
    const idx = localizationResult.rankedZones.findIndex((rz) => rz.zoneId === zId);
    if (idx === -1) return null;
    return {
      rank: idx + 1,
      category: localizationResult.rankedZones[idx].category,
    };
  };

  return (
    <div className="relative w-full rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Schematic Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">
            HABITAT VENTILATION SCHEMATIC
          </h3>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
            {habitat.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Nominal
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span> Advisory
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span> Fire Alarm
          </span>
        </div>
      </div>

      {/* Partial gravity disclaimer banner */}
      {isPartialG && (
        <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-950/30 p-2.5 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">Partial-Gravity Warning:</span>{' '}
            Partial-gravity smoke transport is not validated; results are indicative only. Buoyant plume stratification and particulate settling in fractional-g differ from microgravity flight models.
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 810 320"
          className="w-full min-w-[650px] h-auto select-none font-sans"
          aria-label="Habitat schematic diagram"
        >
          <defs>
            {/* Duct flow animation pattern */}
            <linearGradient id="ductGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.15" />
            </linearGradient>
            <marker
              id="flowArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" fillOpacity="0.8" />
            </marker>
          </defs>

          {/* Draw Ventilation Duct Edges */}
          {habitat.edges.map((edge) => {
            const from = zoneCoords[edge.fromZone];
            const to = zoneCoords[edge.toZone];
            if (!from || !to) return null;

            const x1 = from.x + from.w;
            const y1 = from.y + from.h / 2;
            const x2 = to.x;
            const y2 = to.y + to.h / 2;

            const isClosingOrClosed =
              damperStates[edge.id] === 'CLOSED' || edge.damperState === 'CLOSED';

            return (
              <g key={edge.id} className="transition-all duration-300">
                {/* Duct Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isClosingOrClosed ? '#ef4444' : '#38bdf8'}
                  strokeWidth="8"
                  strokeOpacity={isClosingOrClosed ? 0.3 : 0.6}
                  strokeLinecap="round"
                />
                {!isClosingOrClosed && (
                  <line
                    x1={x1 + 10}
                    y1={y1}
                    x2={x2 - 10}
                    y2={y2}
                    stroke="#e0f2fe"
                    strokeWidth="2"
                    strokeDasharray="6 8"
                    markerEnd="url(#flowArrow)"
                    className="animate-pulse"
                  />
                )}

                {/* Damper Status Box */}
                {edge.hasIsolationDamper && (
                  <g transform={`translate(${(x1 + x2) / 2 - 14}, ${y1 - 12})`}>
                    <rect
                      width="28"
                      height="24"
                      rx="4"
                      fill={isClosingOrClosed ? '#991b1b' : '#064e3b'}
                      stroke={isClosingOrClosed ? '#f87171' : '#34d399'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="14"
                      y="16"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {isClosingOrClosed ? 'CLS' : 'OPN'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Draw Zones / Compartments */}
          {zones.map((zone) => {
            const coords = zoneCoords[zone.id] || { x: 50, y: 50, w: 160, h: 220 };
            const isSelected = selectedZoneId === zone.id;
            const currentPower = zonePowerStates[zone.id] || zone.powerState;
            const ranked = getRankedBadge(zone.id);

            // Determine worst detector state in this zone
            let worstState = 'NOMINAL';
            for (const dId of zone.detectorIds) {
              const s = getDetectorState(dId);
              if (s === 'FIRE_ALARM') worstState = 'FIRE_ALARM';
              else if (s === 'ADVISORY' && worstState !== 'FIRE_ALARM') worstState = 'ADVISORY';
            }

            return (
              <g
                key={zone.id}
                onClick={() => onSelectZone(zone.id)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Zone Outer Compartment Card */}
                <rect
                  x={coords.x}
                  y={coords.y}
                  width={coords.w}
                  height={coords.h}
                  rx="10"
                  fill={
                    isSelected
                      ? 'rgba(15, 23, 42, 0.95)'
                      : worstState === 'FIRE_ALARM'
                      ? 'rgba(69, 10, 10, 0.5)'
                      : 'rgba(15, 23, 42, 0.7)'
                  }
                  stroke={
                    isSelected
                      ? '#38bdf8'
                      : worstState === 'FIRE_ALARM'
                      ? '#f43f5e'
                      : worstState === 'ADVISORY'
                      ? '#f59e0b'
                      : '#334155'
                  }
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter={isSelected ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.3))' : undefined}
                />

                {/* Zone Header Bar */}
                <path
                  d={`M ${coords.x} ${coords.y + 10} A 10 10 0 0 1 ${coords.x + 10} ${coords.y} L ${
                    coords.x + coords.w - 10
                  } ${coords.y} A 10 10 0 0 1 ${coords.x + coords.w} ${coords.y + 10} L ${
                    coords.x + coords.w
                  } ${coords.y + 36} L ${coords.x} ${coords.y + 36} Z`}
                  fill={
                    worstState === 'FIRE_ALARM'
                      ? 'rgba(225, 29, 72, 0.3)'
                      : isSelected
                      ? 'rgba(14, 165, 233, 0.25)'
                      : 'rgba(30, 41, 59, 0.6)'
                  }
                />

                {/* Zone Title */}
                <text
                  x={coords.x + 12}
                  y={coords.y + 24}
                  fill="#f1f5f9"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {zone.name.split(' (')[0]}
                </text>

                {/* Rank Badge if localized */}
                {ranked && (
                  <g transform={`translate(${coords.x + coords.w - 42}, ${coords.y + 8})`}>
                    <rect
                      width="34"
                      height="20"
                      rx="4"
                      fill={
                        ranked.category === 'CLEAR'
                          ? '#059669'
                          : ranked.category === 'CLOSE'
                          ? '#d97706'
                          : '#64748b'
                      }
                    />
                    <text
                      x="17"
                      y="14"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      #{ranked.rank}
                    </text>
                  </g>
                )}

                {/* Volume & Power Badges */}
                <g transform={`translate(${coords.x + 12}, ${coords.y + 52})`}>
                  <text fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    VOL: {zone.volume_m3} m³
                  </text>
                  <text y="18" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    LOAD: {zone.equipmentPower_kW} kW
                  </text>
                  <text
                    y="36"
                    fill={currentPower === 'ON' ? '#34d399' : '#f87171'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    BUS: {currentPower}
                  </text>
                </g>

                {/* Detectors Grille Node */}
                {zone.detectorIds.map((dId, dIdx) => {
                  const state = getDetectorState(dId);
                  const isAlarm = state === 'FIRE_ALARM';
                  const isAdv = state === 'ADVISORY';
                  const nodeX = coords.x + coords.w / 2;
                  const nodeY = coords.y + 155 + dIdx * 35;

                  return (
                    <g key={dId} transform={`translate(${nodeX}, ${nodeY})`}>
                      {/* Pulse ring on fire alarm */}
                      {isAlarm && (
                        <circle
                          r="16"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          className="animate-ping opacity-75"
                        />
                      )}
                      <circle
                        r="11"
                        fill={isAlarm ? '#ef4444' : isAdv ? '#f59e0b' : '#10b981'}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                      />
                      <text
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {dId.replace('det_', 'D')}
                      </text>
                      <text
                        y="22"
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {state}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Click any compartment to inspect localized telemetry and duct dampers.</span>
        <span>Selected: {habitat.zones.find((z) => z.id === selectedZoneId)?.name || 'None'}</span>
      </div>
    </div>
  );
};

