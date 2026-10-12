/**
 * FlameScene.tsx – Physically-motivated GPU Flame rendered via Three.js / R3F.
 *
 * Performance Architecture (Audit & Hardening):
 *   - Step 1: Default 'medium' tier, auto-downgrade to 'low' on mobile/touch.
 *   - Step 2: Capped DPR [1, 1.25] medium, 1.0 low, 1.5 high. Auto-steps down via PerformanceMonitor.
 *   - Step 3: frameloop paused when offscreen (useIsVisible) or document.hidden.
 *   - Step 4: Single WebGL context in Compare mode (renders both flames side-by-side in one Canvas).
 *   - Step 5: Removed all backdrop-blur overlays above the motion canvas.
 *   - Step 6: Bloom disabled on low/medium; cheap CSS radial fake glow on medium.
 *   - Step 7: Shader noise reduced to 2 octaves on low/medium; GPU vertex particles.
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { ScenarioInput } from '../types/api';
import { deriveFlameParams, type FlameParams } from './flameParams';
import { FlameParticles } from './FlameParticles';
import { DestinationBackdrop } from './DestinationBackdrop';
import { useReducedMotion } from './useReducedMotion';
import { useIsVisible } from './useIsVisible';
import { useQualityTier } from './useQualityTier';
import { reportRendererStats, isPerfModeEnabled } from './perfStore';

function PerfCollector() {
  const isPerf = isPerfModeEnabled();
  const { gl } = useThree();
  useFrame(() => {
    if (isPerf) {
      reportRendererStats(gl.info, gl.getPixelRatio());
    }
  });
  return null;
}

// ---------------------------------------------------------------------------
// GLSL Shaders
// ---------------------------------------------------------------------------

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uBuoyancy;     // 0..1 (0 = microgravity, 1 = 1g)
  uniform float uElongation;   // 1.0 .. 1.8
  uniform float uTiltDeg;      // 0 .. 25 degrees
  uniform float uRadius;       // 30 .. 65
  uniform vec3 uCoreColor;     // RGB
  uniform vec3 uOuterColor;    // RGB
  uniform float uSootAmount;   // 0 .. 1
  uniform float uBrightness;   // 0.3 .. 1.0
  uniform float uFlickerSpeed; // 0.5 .. 2.0
  uniform float uPressure;     // kPa (softness / diffusion mapping)
  uniform float uAirflow;      // cm/s (downstream streak)
  uniform float uReducedMotion;// 0.0 or 1.0
  uniform float uOctaves;      // 2.0 on low/med, 3.0 on high

  // 3D Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // FBM with capped iterations (Step 7: max 2-3 iterations)
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    int maxOct = int(clamp(uOctaves, 1.0, 3.0));
    for (int i = 0; i < 3; ++i) {
      if (i >= maxOct) break;
      v += a * snoise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Coordinate system: center at (0.5, 0.28) where substrate meets flame
    vec2 p = vUv - vec2(0.5, 0.28);

    // Below substrate cutoff
    if (p.y < -0.12) {
      discard;
    }

    // 1. Airflow deflection (downstream tilt)
    float tiltRad = radians(uTiltDeg);
    float yHeight = max(0.0, p.y + 0.04);
    p.x -= yHeight * tan(tiltRad) * 1.25;

    // 2. Buoyancy & elongation deformation
    float yScaled = p.y / max(0.6, uElongation);
    float taper = 1.0 - 0.48 * uBuoyancy * clamp(p.y * 1.7, 0.0, 1.25);
    float xScaled = p.x / max(0.2, taper);

    vec2 deformedP = vec2(xScaled, yScaled);
    float baseDist = length(deformedP);

    // 3. Advection time coordinates
    float t = uReducedMotion > 0.5 ? 0.0 : uTime * uFlickerSpeed;
    float convSpeed = (0.25 + 2.6 * uBuoyancy);
    float streakX = (uAirflow * 0.035);

    vec3 noiseCoord = vec3(
      deformedP.x * 2.6 - t * streakX,
      deformedP.y * 2.4 - t * convSpeed,
      t * 0.45
    );

    float n = fbm(noiseCoord);

    // 4. Distorted flame boundary
    float effRadius = (uRadius / 45.0) * 0.40;
    float d = baseDist + n * (0.10 + 0.16 * uBuoyancy);

    // 5. Core vs Outer envelope color ramps
    float coreThreshold = effRadius * 0.52;
    float outerThreshold = effRadius * 1.12;

    float coreFactor = smoothstep(coreThreshold, 0.03, d);
    float outerFactor = smoothstep(outerThreshold, 0.06, d);

    // 6. Microgravity blue halo
    float haloFactor = smoothstep(effRadius * 1.55, effRadius * 0.35, d) * (1.0 - uBuoyancy * 0.78);

    // 7. Pressure mapping
    float pressureNorm = clamp(uPressure / 101.3, 0.5, 1.6);
    float softnessMultiplier = 1.0 / pressureNorm;

    // Color compositing
    vec3 color = mix(uOuterColor, uCoreColor, coreFactor * 0.95);
    vec3 blueHaloColor = vec3(0.12, 0.52, 0.95);
    color += blueHaloColor * haloFactor * 0.45;

    // Warm soot tip glow
    vec3 sootGlow = vec3(0.9, 0.25, 0.05) * uSootAmount * uBuoyancy * max(0.0, p.y) * 1.5;
    color += sootGlow;

    color *= uBrightness;

    float alpha = clamp((outerFactor * 0.85 + coreFactor * 0.6 + haloFactor * 0.35), 0.0, 1.0);
    alpha = pow(alpha, softnessMultiplier);

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Three.js Flame Mesh Component
// ---------------------------------------------------------------------------

interface FlameMeshProps {
  params: FlameParams;
  scenario: ScenarioInput;
  reducedMotion: boolean;
  octaves: number;
  position?: [number, number, number];
}

function FlameMesh({
  params,
  scenario,
  reducedMotion,
  octaves,
  position = [0, 0, 0],
}: FlameMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const coreColorVec = useMemo(() => {
    const c = new THREE.Color();
    try {
      c.setStyle(params.coreColor);
    } catch {
      c.setHex(0xfbbf24);
    }
    return new THREE.Vector3(c.r, c.g, c.b);
  }, [params.coreColor]);

  const outerColorVec = useMemo(() => {
    const c = new THREE.Color();
    try {
      c.setStyle(params.outerColor);
    } catch {
      c.setHex(0xf97316);
    }
    return new THREE.Vector3(c.r, c.g, c.b);
  }, [params.outerColor]);

  const targetRef = useRef({
    buoyancy: params.buoyancy,
    elongation: params.elongation,
    tiltDeg: params.tiltDeg,
    radius: params.radius,
    coreColor: coreColorVec,
    outerColor: outerColorVec,
    sootAmount: params.sootAmount,
    brightness: params.brightness,
    flickerSpeed: params.flickerSpeed,
    pressure: scenario.pressure_kpa ?? 101.3,
    airflow: scenario.airflow_cm_s ?? 5.0,
  });

  useEffect(() => {
    targetRef.current = {
      buoyancy: params.buoyancy,
      elongation: params.elongation,
      tiltDeg: params.tiltDeg,
      radius: params.radius,
      coreColor: coreColorVec,
      outerColor: outerColorVec,
      sootAmount: params.sootAmount,
      brightness: params.brightness,
      flickerSpeed: params.flickerSpeed,
      pressure: scenario.pressure_kpa ?? 101.3,
      airflow: scenario.airflow_cm_s ?? 5.0,
    };
  }, [params, scenario, coreColorVec, outerColorVec]);

  const [uniforms] = useState<{ [uniform: string]: THREE.IUniform }>(() => ({
    uTime: { value: 0 },
    uBuoyancy: { value: params.buoyancy },
    uElongation: { value: params.elongation },
    uTiltDeg: { value: params.tiltDeg },
    uRadius: { value: params.radius },
    uCoreColor: { value: coreColorVec.clone() },
    uOuterColor: { value: outerColorVec.clone() },
    uSootAmount: { value: params.sootAmount },
    uBrightness: { value: params.brightness },
    uFlickerSpeed: { value: params.flickerSpeed },
    uPressure: { value: scenario.pressure_kpa ?? 101.3 },
    uAirflow: { value: scenario.airflow_cm_s ?? 5.0 },
    uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
    uOctaves: { value: octaves },
  }));

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uReducedMotion.value = reducedMotion ? 1.0 : 0.0;
      materialRef.current.uniforms.uOctaves.value = octaves;
    }
  }, [reducedMotion, octaves]);

  useEffect(() => {
    const mat = materialRef.current;
    return () => {
      mat?.dispose();
    };
  }, []);

  // Frame tick: lerp uniforms smoothly (no React re-renders)
  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const dt = Math.min(delta, 0.05);
    const lerpT = Math.min(1.0, dt * 5.0);
    const target = targetRef.current;
    const u = mat.uniforms;

    if (!reducedMotion) {
      u.uTime.value = state.clock.elapsedTime;
    }

    u.uBuoyancy.value += (target.buoyancy - u.uBuoyancy.value) * lerpT;
    u.uElongation.value += (target.elongation - u.uElongation.value) * lerpT;
    u.uTiltDeg.value += (target.tiltDeg - u.uTiltDeg.value) * lerpT;
    u.uRadius.value += (target.radius - u.uRadius.value) * lerpT;
    u.uSootAmount.value += (target.sootAmount - u.uSootAmount.value) * lerpT;
    u.uBrightness.value += (target.brightness - u.uBrightness.value) * lerpT;
    u.uFlickerSpeed.value += (target.flickerSpeed - u.uFlickerSpeed.value) * lerpT;
    u.uPressure.value += (target.pressure - u.uPressure.value) * lerpT;
    u.uAirflow.value += (target.airflow - u.uAirflow.value) * lerpT;

    u.uCoreColor.value.lerp(target.coreColor, lerpT);
    u.uOuterColor.value.lerp(target.outerColor, lerpT);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[2.4, 2.4, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Laboratory Substrate Plate
// ---------------------------------------------------------------------------

function SubstratePlate({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera Drift Controller
// ---------------------------------------------------------------------------

function CameraController({
  reducedMotion,
  isCompare = false,
}: {
  reducedMotion: boolean;
  isCompare?: boolean;
}) {
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    const baseZ = isCompare ? 4.2 : 3.2;
    state.camera.position.x = Math.sin(t * 0.22) * 0.03;
    state.camera.position.y = 0.35 + Math.cos(t * 0.18) * 0.02;
    state.camera.position.z = baseZ;
  });

  return null;
}

// ---------------------------------------------------------------------------
// Main FlameScene Component
// ---------------------------------------------------------------------------

export interface FlameSceneProps {
  scenario: ScenarioInput;
  destination?: string;
  compact?: boolean;
  className?: string;
  compareScenario?: ScenarioInput;
  compareDestination?: string;
}

export function FlameScene({
  scenario,
  destination,
  compact = false,
  className = '',
  compareScenario,
  compareDestination,
}: FlameSceneProps) {
  const paramsA = useMemo(() => deriveFlameParams(scenario), [scenario]);
  const paramsB = useMemo(
    () => (compareScenario ? deriveFlameParams(compareScenario) : null),
    [compareScenario],
  );

  const isCompare = Boolean(compareScenario && paramsB);
  const reducedMotion = useReducedMotion();
  const quality = useQualityTier();
  const [containerRef, isVisible] = useIsVisible<HTMLDivElement>({ threshold: 0.05 });

  // Step 2: Performance regression scale from PerformanceMonitor
  const [dprScale, setDprScale] = useState<number>(1.0);

  const activeDpr = useMemo<number | [number, number]>(() => {
    if (quality.tier === 'low') return 1.0;
    const maxTarget = quality.maxDpr * dprScale;
    return [1.0, Math.max(1.0, maxTarget)];
  }, [quality.tier, quality.maxDpr, dprScale]);

  const o2A = scenario.oxygen_pct ?? 21.0;
  const airflowA = scenario.airflow_cm_s ?? 5.0;
  const pressureA = scenario.pressure_kpa ?? 101.3;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        compact ? 'h-56 sm:h-64' : 'h-72 sm:h-80'
      } bg-[#05070E] flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Destination-reactive visual backdrop with 500ms crossfade */}
      <DestinationBackdrop
        destination={destination}
        gravityEnvironment={scenario.gravity_environment}
      />

      {/* Step 6: Cheap fake glow on medium tier (CSS radial gradient instead of bloom) */}
      {quality.tier === 'medium' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 55%, rgba(255, 122, 61, 0.14) 0%, rgba(56, 189, 248, 0.07) 35%, transparent 68%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Step 5: Solid semi-transparent telemetry badges (NO backdrop-blur over active WebGL) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(10,20,40,0.88)] border border-slate-800/80 text-xs font-mono text-cyan-300 pointer-events-none shadow-xs">
        <span>{isCompare ? 'A: ' : ''}Airflow: {airflowA} cm/s →</span>
      </div>

      <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-[rgba(10,20,40,0.88)] border border-slate-800/80 text-xs font-mono text-slate-300 pointer-events-none shadow-xs">
        {isCompare ? (
          <span>B: <span className="text-orange-400 font-semibold">{compareDestination ? `${compareDestination} · ` : ''}{compareScenario?.airflow_cm_s ?? 5} cm/s</span></span>
        ) : (
          <>
            <span>Regime: </span>
            <span className="text-orange-400 font-semibold">{paramsA.regimeLabel}</span>
          </>
        )}
      </div>

      {/* Step 4: Single R3F WebGL Canvas for both Single and Compare modes */}
      <Canvas
        camera={{ position: [0, 0.35, isCompare ? 4.2 : 3.2], fov: 46 }}
        dpr={activeDpr}
        frameloop={isVisible ? (reducedMotion ? 'demand' : 'always') : 'never'}
        gl={{
          alpha: true,
          antialias: quality.tier !== 'low',
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        {/* Step 2: Drei PerformanceMonitor auto-steps down DPR if FPS drops below ~45 */}
        <PerformanceMonitor
          factor={0.5}
          onChange={({ factor }) => {
            if (factor < 0.75) {
              setDprScale(0.8);
            } else {
              setDprScale(1.0);
            }
          }}
        />

        {/* Step 12: Dev-only performance telemetry collector */}
        <PerfCollector />

        <CameraController reducedMotion={reducedMotion} isCompare={isCompare} />

        {/* Ambient & directional lighting for substrate plates */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={0.8} />

        {isCompare && paramsB && compareScenario ? (
          <>
            {/* Scenario A (Left) */}
            <FlameMesh
              params={paramsA}
              scenario={scenario}
              reducedMotion={reducedMotion}
              octaves={quality.noiseOctaves}
              position={[-0.95, 0, 0]}
            />
            <SubstratePlate position={[-0.95, 0, 0]} />
            <FlameParticles
              buoyancy={paramsA.buoyancy}
              tiltDeg={paramsA.tiltDeg}
              airflow={airflowA}
              sootAmount={paramsA.sootAmount}
              particleCount={Math.floor(quality.particleCount * 0.65)}
              reducedMotion={reducedMotion}
              offset={[-0.95, 0, 0]}
            />

            {/* Scenario B (Right) */}
            <FlameMesh
              params={paramsB}
              scenario={compareScenario}
              reducedMotion={reducedMotion}
              octaves={quality.noiseOctaves}
              position={[0.95, 0, 0]}
            />
            <SubstratePlate position={[0.95, 0, 0]} />
            <FlameParticles
              buoyancy={paramsB.buoyancy}
              tiltDeg={paramsB.tiltDeg}
              airflow={compareScenario.airflow_cm_s ?? 5.0}
              sootAmount={paramsB.sootAmount}
              particleCount={Math.floor(quality.particleCount * 0.65)}
              reducedMotion={reducedMotion}
              offset={[0.95, 0, 0]}
            />
          </>
        ) : (
          <>
            {/* Single Flame Mode */}
            <FlameMesh
              params={paramsA}
              scenario={scenario}
              reducedMotion={reducedMotion}
              octaves={quality.noiseOctaves}
            />
            <SubstratePlate />
            <FlameParticles
              buoyancy={paramsA.buoyancy}
              tiltDeg={paramsA.tiltDeg}
              airflow={airflowA}
              sootAmount={paramsA.sootAmount}
              particleCount={quality.particleCount}
              reducedMotion={reducedMotion}
            />
          </>
        )}

        {/* Step 6: Bloom enabled ONLY on 'high' tier */}
        {quality.bloomEnabled && (
          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.5}
              luminanceSmoothing={0.7}
              intensity={0.45}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* Step 5: Bottom Readout Strip with solid glass background (NO backdrop-blur) */}
      <div className="absolute bottom-2 inset-x-3 z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5 pointer-events-none bg-[rgba(10,20,40,0.88)] px-2 rounded-b shadow-xs">
        {isCompare && compareScenario ? (
          <>
            <span className="text-cyan-300">A: {scenario.gravity_environment ?? '0g'} ({o2A}% O₂)</span>
            <span className="text-orange-300">B: {compareScenario.gravity_environment ?? 'lunar'} ({compareScenario.oxygen_pct ?? 32}% O₂)</span>
          </>
        ) : (
          <>
            <span>O₂: {o2A}% ({o2A > 21 ? 'Accelerated' : 'Nominal'})</span>
            <span>P: {pressureA} kPa</span>
            <span>g: {paramsA.gravityG}g ({scenario.gravity_environment ?? '0g'})</span>
          </>
        )}
      </div>
    </div>
  );
}

export default FlameScene;
