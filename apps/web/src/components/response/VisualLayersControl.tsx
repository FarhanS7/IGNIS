import React from 'react';
import { Layers, Check, X, Shield, Eye, Info } from 'lucide-react';

export interface VisualLayerPreferences {
  smoke: boolean;
  thermal: boolean;
  airflow: boolean;
  sensors: boolean;
}

export interface VisualLayersControlProps {
  layers: VisualLayerPreferences;
  onChangeLayer: (key: keyof VisualLayerPreferences, value: boolean) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  hideButton?: boolean;
}

interface LayerMetadata {
  key: keyof VisualLayerPreferences;
  label: string;
  description: string;
  truthLabel: string;
  units: string;
}

const LAYER_CONFIG: LayerMetadata[] = [
  {
    key: 'smoke',
    label: 'Smoke Obscuration',
    description: '3D particle cloud driven by compartment optical density time series',
    truthLabel: 'COMPARTMENT-AVERAGED TRANSPORT',
    units: '%/m obscuration',
  },
  {
    key: 'thermal',
    label: 'Thermal Heat Field',
    description: 'Emissive glow on compartment hull proportional to temperature rise',
    truthLabel: 'COMPARTMENT-AVERAGED VALUE',
    units: '°C temperature',
  },
  {
    key: 'airflow',
    label: 'Inter-Zone Duct Flow',
    description: 'Inter-compartment particles halting when isolation dampers seal',
    truthLabel: 'SIMULATED INTER-ZONE FLOW',
    units: 'm³/s advective flow',
  },
  {
    key: 'sensors',
    label: 'Installed Sensor Nodes',
    description: 'Hardware detector positions mounted across spacecraft bulkheads',
    truthLabel: 'SENSOR HARDWARE LOCATION',
    units: 'installed nodes',
  },
];

export const VisualLayersControl: React.FC<VisualLayersControlProps> = ({
  layers,
  onChangeLayer,
  isOpen,
  onToggleOpen,
  hideButton = false,
}) => {
  return (
    <div className="relative">
      {!hideButton && (
        <button
          onClick={onToggleOpen}
          aria-label="Toggle visual layers controls"
          aria-expanded={isOpen}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono ${
            isOpen
              ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
              : 'bg-[#09111c]/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Visual telemetry overlays & truth labels"
        >
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="hidden sm:inline font-sans text-xs font-medium">Layers</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Visual Layers and Truth Labels"
          className="absolute top-10 right-0 z-30 w-72 sm:w-80 bg-[#09111c]/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-left font-sans animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Scientific Visual Layers
              </h3>
            </div>
            <button
              onClick={onToggleOpen}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
              aria-label="Close layers menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono mt-1 mb-2.5 flex items-center gap-1">
            <Info className="h-3 w-3 text-cyan-400 shrink-0" />
            <span>Overlays carry explicit model granularity disclosures.</span>
          </div>

          <div className="space-y-2">
            {LAYER_CONFIG.map((layer) => {
              const isEnabled = layers[layer.key];

              return (
                <div
                  key={layer.key}
                  className={`p-2 rounded-lg border transition-all ${
                    isEnabled
                      ? 'bg-slate-900/90 border-cyan-500/40'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label
                      htmlFor={`layer-${layer.key}`}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200">
                          {layer.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {layer.description}
                      </p>
                    </label>

                    <button
                      id={`layer-${layer.key}`}
                      role="checkbox"
                      aria-checked={isEnabled}
                      onClick={() => onChangeLayer(layer.key, !isEnabled)}
                      className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isEnabled
                          ? 'bg-cyan-600 border-cyan-400 text-white'
                          : 'bg-slate-800 border-slate-600 text-transparent hover:border-slate-500'
                      }`}
                      aria-label={`Toggle ${layer.label}`}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </button>
                  </div>

                  {/* Truth Label and Units Badge */}
                  <div className="mt-1.5 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-cyan-400/90 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      {layer.truthLabel}
                    </span>
                    <span className="text-slate-500">{layer.units}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Shield className="h-3 w-3 text-amber-400 shrink-0" />
            <span>No uncalibrated volumetric CFD is implied.</span>
          </div>
        </div>
      )}
    </div>
  );
};

