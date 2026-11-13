import React from 'react';
import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { DetectorArmId } from './DetectorDetailModal.tsx';
import {
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Eye,
  FileCheck,
  HelpCircle,
  Layers,
  Maximize2,
  RotateCcw,
  RotateCw,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export interface DetailsMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  habitat: HabitatGraph;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectDetectorArm: (arm: DetectorArmId) => void;
  onOpenExplanation: () => void;
  onOpenProof: () => void;
  onOpenOutcome: () => void;
  onOpenLayers: () => void;
  onSwitchToInspect: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  hasManualCamera: boolean;
  onReturnToGuidedCamera: () => void;
  onReplayIntro?: () => void;
  isFireExtinguished?: boolean;
}

export const DetailsMenuDrawer: React.FC<DetailsMenuDrawerProps> = ({
  isOpen,
  onClose,
  habitat,
  selectedZoneId,
  onSelectZone,
  onSelectDetectorArm,
  onOpenExplanation,
  onOpenProof,
  onOpenOutcome,
  onOpenLayers,
  onSwitchToInspect,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  hasManualCamera,
  onReturnToGuidedCamera,
  onReplayIntro,
  isFireExtinguished = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Simulation Details and Controls Menu"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-md bg-[#070e1a] border-l border-slate-800 text-slate-100 h-full overflow-y-auto flex flex-col p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-sans font-bold text-white tracking-tight">
              Details & Controls
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Inspect compartments, detectors, camera angles, and NASA proof.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Menu Sections */}
        <div className="space-y-5 py-4 flex-1">
          {/* Section 1: Camera Controls */}
          <section className="space-y-2">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-cyan-400" />
              <span>Camera Views</span>
            </h3>
            <div className="grid grid-cols-5 gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <button
                onClick={onRotateLeft}
                aria-label="Rotate camera left"
                title="Rotate camera left"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={onRotateRight}
                aria-label="Rotate camera right"
                title="Rotate camera right"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                onClick={onZoomIn}
                aria-label="Zoom camera in"
                title="Zoom camera in"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={onZoomOut}
                aria-label="Zoom camera out"
                title="Zoom camera out"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={onResetCamera}
                aria-label="Reset camera view"
                title="Reset camera view"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            {hasManualCamera && (
              <button
                onClick={() => {
                  onReturnToGuidedCamera();
                }}
                aria-label="Return to guided camera"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-sans hover:bg-cyan-900/80 transition-colors"
              >
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Return to guided camera</span>
              </button>
            )}
          </section>

          {/* Section 2: Visual Layers */}
          <section className="space-y-2">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Scientific Visual Layers</span>
            </h3>
            <button
              onClick={() => {
                onClose();
                onOpenLayers();
              }}
              aria-label="Toggle visual layers controls"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-sans text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                <span>Smoke, airflow, sensors & thermal layers</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </section>

          {/* Section 3: Module Telemetry */}
          <section className="space-y-2">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Compartment Telemetry</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {habitat.zones.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      onClose();
                      onSelectZone(zone.id);
                    }}
                    aria-label={`Inspect compartment ${zone.name}`}
                    className={`p-2 rounded-xl border text-left text-xs font-sans transition-colors ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 text-white font-medium'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="truncate font-medium">{zone.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {zone.detectorIds.length} detectors
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Detector Comparison */}
          <section className="space-y-2">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>Detector Inspection</span>
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onClose();
                  onSelectDetectorArm('std');
                }}
                aria-label="Inspect standard baseline detector"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-sans text-slate-200 transition-colors"
              >
                <div>
                  <div className="font-medium">Standard baseline detector</div>
                  <div className="text-[10px] text-slate-500 font-sans">Single-sensor obscuration</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectDetectorArm('cal');
                }}
                aria-label="Inspect SAME-R calibrated multi-sensor detector"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 text-xs font-sans text-slate-200 transition-colors"
              >
                <div>
                  <div className="font-medium text-cyan-300">SAME-R calibrated multi-sensor</div>
                  <div className="text-[10px] text-slate-500 font-sans">Multi-sensor CO + optical correlation</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectDetectorArm('ml');
                }}
                aria-label="Inspect machine learning fusion detector"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-fuchsia-500/50 text-xs font-sans text-slate-200 transition-colors"
              >
                <div>
                  <div className="font-medium text-fuchsia-300">Machine learning fusion</div>
                  <div className="text-[10px] text-slate-500 font-sans">Trained on Earth data · Not validated in 0g</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </section>

          {/* Section 5: Explanations & Evidence */}
          <section className="space-y-2">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Science & Evidence</span>
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenExplanation();
                }}
                aria-label="Explain"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 text-xs font-sans text-cyan-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Explain the physics (Quick / Science / Engineering)</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenProof();
                }}
                aria-label="View NASA flight sensor records"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-sans text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>NASA flight sensor proof (SAME-R records)</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenOutcome();
                }}
                aria-label="Flame Extinguished — View Audit"
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-sans transition-colors ${
                  isFireExtinguished
                    ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Post-fire response audit & outcome summary</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {onReplayIntro && (
                <button
                  onClick={() => {
                    onClose();
                    onReplayIntro();
                  }}
                  aria-label="Replay educational prologue"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-sans text-slate-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Replay educational intro (Earth vs Orbit)</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Footer: Deep Engineering Console Link */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onSwitchToInspect();
            }}
            aria-label="Inspect Console"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-sans font-semibold text-white transition-colors"
          >
            <span>Inspect Console (Deep View) &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsMenuDrawer;

