import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { type SceneState, generateSeededParticles } from '../sceneState';
import { StoryFallback2D } from './StoryFallback2D';
import { WebGLErrorBoundary } from '../../visuals/WebGLErrorBoundary';
import { Info, CheckCircle2 } from 'lucide-react';
import type { StoryLevel } from '../levels';
import { StoryFlame } from './StoryFlame';
import { HotGasParticles } from './HotGasParticles';
import { DropletOrb } from './DropletOrb';
import { StationSilhouette } from './StationSilhouette';

export interface StoryStageProps {
  sceneState: SceneState;
  currentBeatIndex?: number;
  qualityTier?: 'high' | 'medium' | 'low';
  reduceMotion?: boolean;
  onOpenSourceDrawer?: () => void;
  className?: string;
  onSetBeat?: (beatIndex: number) => void;
  onSetProgress?: (progress: number) => void;
  onSetLevel?: (level: StoryLevel) => void;
  onTapFlame?: () => void;
}

// ---------------------------------------------------------------------------
// 3D Inner Components
// ---------------------------------------------------------------------------

function CameraController({
  sceneState,
  reduceMotion,
}: {
  sceneState: SceneState;
  reduceMotion: boolean;
}) {
  const { camera } = useThree();
  const currentTargetRef = useRef<[number, number, number]>([0, 0, 0]);

  useFrame((_, delta) => {
    const targetPose = sceneState.camera;
    if (reduceMotion) {
      camera.position.set(...targetPose.position);
      camera.lookAt(targetPose.target[0], targetPose.target[1], targetPose.target[2]);
      if ((camera as THREE.PerspectiveCamera).fov !== targetPose.fov) {
        (camera as THREE.PerspectiveCamera).fov = targetPose.fov;
        camera.updateProjectionMatrix();
      }
      return;
    }

    // Critically damped spring follow
    const t = Math.min(1.0, delta * 3.5);
    camera.position.lerp(new THREE.Vector3(...targetPose.position), t);

    currentTargetRef.current[0] += (targetPose.target[0] - currentTargetRef.current[0]) * t;
    currentTargetRef.current[1] += (targetPose.target[1] - currentTargetRef.current[1]) * t;
    currentTargetRef.current[2] += (targetPose.target[2] - currentTargetRef.current[2]) * t;

    camera.lookAt(
      currentTargetRef.current[0],
      currentTargetRef.current[1],
      currentTargetRef.current[2]
    );

    const pers = camera as THREE.PerspectiveCamera;
    if (Math.abs(pers.fov - targetPose.fov) > 0.1) {
      pers.fov += (targetPose.fov - pers.fov) * t;
      pers.updateProjectionMatrix();
    }
  });

  return null;
}

function Starfield3D({
  speed,
  driftZ,
  count = 350,
  reduceMotion,
}: {
  speed: number;
  driftZ: number;
  count: number;
  reduceMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Deterministically seeded star positions
  const positions = useMemo(() => {
    return generateSeededParticles(count, 9999, 14.0);
  }, [count]);

  const clockRef = useRef(0);

  useFrame((_, delta) => {
    if (reduceMotion || !pointsRef.current) return;
    clockRef.current += delta * speed;
    pointsRef.current.rotation.y = clockRef.current * 0.02;
    pointsRef.current.position.z = Math.sin(clockRef.current * 0.1) * 0.5 + driftZ;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#bae6fd"
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Main Persistent StoryStage Component
// ---------------------------------------------------------------------------

export const StoryStage: React.FC<StoryStageProps> = ({
  sceneState,
  currentBeatIndex,
  qualityTier = 'medium',
  reduceMotion = false,
  onOpenSourceDrawer,
  className = '',
  onSetBeat,
  onSetProgress,
  onSetLevel,
  onTapFlame,
}) => {
  const [webGLError] = useState(false);

  // Global deterministic test hook (?capture=1 or test harnesses)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__story = {
        setBeat: (idx: number) => onSetBeat?.(idx),
        setProgress: (p: number) => onSetProgress?.(p),
        setLevel: (lvl: StoryLevel) => onSetLevel?.(lvl),
        currentBeatIndex: currentBeatIndex ?? sceneState.beatIndex,
        sceneState,
        ready: true,
      };
    }
  }, [sceneState, currentBeatIndex, onSetBeat, onSetProgress, onSetLevel]);

  // If reduced motion is requested or WebGL failed, immediately render 2D SVG
  if (reduceMotion || webGLError) {
    return (
      <StoryFallback2D
        sceneState={sceneState}
        className={className}
        onOpenSourceDrawer={onOpenSourceDrawer}
      />
    );
  }

  const dpr = qualityTier === 'high' ? 2 : qualityTier === 'medium' ? 1.5 : 1.0;
  const starCount = qualityTier === 'high' ? 450 : qualityTier === 'medium' ? 250 : 120;
  const particleCount = qualityTier === 'low' ? 30 : qualityTier === 'medium' ? 60 : 100;
  const isOrbitAct = sceneState.flame.buoyancy < 0.2 || sceneState.droplet.visible;

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#020617] border border-cyan-500/30 shadow-2xl select-none ${className}`}
      role="region"
      aria-label="3D Orbital Combustion Stage"
    >
      {/* Screen Reader live announcement of scene transitions */}
      <div className="sr-only" aria-live="polite">
        Act {sceneState.act}: Flame elongation {sceneState.flame.elongation.toFixed(2)}, buoyancy {(sceneState.flame.buoyancy * 100).toFixed(0)}%.
      </div>

      {/* Widescreen Letterbox Bars (Slide in during coldOpen, retract during interactive acts) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 bg-black transition-all duration-700 ease-out pointer-events-none ${
          sceneState.letterboxActive ? 'h-8 sm:h-12' : 'h-0'
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-black transition-all duration-700 ease-out pointer-events-none ${
          sceneState.letterboxActive ? 'h-8 sm:h-12' : 'h-0'
        }`}
      />

      {/* Persistent Single WebGL Canvas */}
      <WebGLErrorBoundary fallback={<StoryFallback2D sceneState={sceneState} onOpenSourceDrawer={onOpenSourceDrawer} />}>
        <Canvas
          dpr={dpr}
          gl={{
            antialias: qualityTier !== 'low',
            powerPreference: 'high-performance',
            alpha: false,
          }}
          className="w-full h-full"
          onCreated={({ gl }) => {
            gl.setClearColor('#020617', 1);
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 3, 4]} intensity={1.2} />

          <CameraController sceneState={sceneState} reduceMotion={reduceMotion} />

          <Starfield3D
            speed={sceneState.starfield.speed}
            driftZ={sceneState.starfield.driftZ}
            count={starCount}
            reduceMotion={reduceMotion}
          />

          {/* Distant Space Station silhouette in orbit */}
          <StationSilhouette
            opacity={isOrbitAct ? 0.35 : 0.05}
            reduceMotion={reduceMotion}
          />

          {/* Procedural SDF Morphing Flame */}
          <StoryFlame
            buoyancy={sceneState.flame.buoyancy}
            radius={sceneState.flame.radius}
            elongation={sceneState.flame.elongation}
            coreColor={sceneState.flame.coreColor}
            outerColor={sceneState.flame.outerColor}
            flickerIntensity={sceneState.flame.flickerIntensity}
            tiltAngleRad={sceneState.flame.tiltAngleRad}
            reduceMotion={reduceMotion}
            onTap={onTapFlame}
          />

          {/* Convective Hot Gas Particles / Diffusive gas */}
          <HotGasParticles
            buoyancy={sceneState.flame.buoyancy}
            tiltAngleRad={sceneState.flame.tiltAngleRad}
            count={particleCount}
            reduceMotion={reduceMotion}
          />

          {/* Real Flight Droplet Orb */}
          <DropletOrb
            diameterMm={sceneState.droplet.diameterMm}
            initialDiameterMm={sceneState.droplet.initialDiameterMm}
            visible={sceneState.droplet.visible}
            reduceMotion={reduceMotion}
            onTap={onTapFlame}
          />

          {qualityTier === 'high' && !reduceMotion && (
            <EffectComposer>
              <Bloom
                intensity={0.65}
                luminanceThreshold={0.35}
                luminanceSmoothing={0.7}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </Canvas>
      </WebGLErrorBoundary>

      {/* Epistemic Truth & Source Badge Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${
            sceneState.truthTag === 'From NASA flight tests'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
              : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
          }`}
        >
          {sceneState.truthTag === 'From NASA flight tests' && (
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          )}
          <span>{sceneState.truthTag}</span>
        </span>

        {onOpenSourceDrawer && sceneState.truthTag === 'From NASA flight tests' && (
          <button
            type="button"
            onClick={onOpenSourceDrawer}
            className="px-2 py-0.5 rounded-md bg-black/60 hover:bg-black/90 border border-white/20 text-cyan-300 hover:text-white font-mono text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
            aria-label="Inspect primary NASA flight records"
          >
            <Info className="w-3 h-3" />
            <span>Source</span>
          </button>
        )}
      </div>

      {/* Real-time Telemetry / Illustration Subtitle pill */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col items-end gap-1 font-mono text-[11px] text-slate-300 pointer-events-none">
        {sceneState.droplet.visible && (
          <div className="px-2.5 py-1 rounded-lg bg-black/70 border border-cyan-500/40 text-cyan-300 shadow">
            Droplet: <strong>{sceneState.droplet.diameterMm.toFixed(2)} mm</strong>
          </div>
        )}
        <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
          Buoyancy: <strong>{(sceneState.flame.buoyancy * 100).toFixed(0)}%</strong>
        </div>
      </div>
    </div>
  );
};

export default StoryStage;
