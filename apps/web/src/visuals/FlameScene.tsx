/**
 * FlameScene.tsx – Physically-motivated GPU Flame rendered via Three.js / R3F.
 *
 * Physics-inspired mappings (from deriveFlameParams):
 *   - Gravity/Buoyancy:
 *       • 0g (microgravity): near-spherical, calm, diffusive blob with blue halo.
 *       • >0g (Moon, Mars, Earth): elongates upward into a buoyant teardrop,
 *         with faster convective upward advection.
 *   - Airflow: tilts and shears the flame downstream with horizontal streaking.
 *   - Oxygen: low O2 = cool dim blue; high O2 = brilliant yellow-orange with white core.
 *   - Pressure:
 *       • Lower pressure (~56–70 kPa on Moon/Mars) increases molecular diffusion,
 *         softening and expanding the flame boundary.
 *       • Higher pressure sharpens the combustion reaction zone.
 *   - Soot: warm rim emission and rising soot/ember particles (near zero at 0g).
 *
 * Architecture & Constraints:
 *   - Single custom shader mesh + instanced ember particle layer.
 *   - Uniforms smoothly lerped over ~300-500ms in useFrame (no React re-renders).
 *   - Selective Bloom post-processing (disabled on 'low' tier).
 *   - Pauses rendering when offscreen or in background tab (useIsVisible).
 *   - Freezes rendering on prefers-reduced-motion.
 *   - Strict DPR caps (1.5 mobile, 2 desktop).
 *   - Full disposal of geometries, materials, and textures on unmount.
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { ScenarioInput } from '../types/api';
import { deriveFlameParams, type FlameParams } from './flameParams';
import { FlameParticles } from './FlameParticles';
import { DestinationBackdrop } from './DestinationBackdrop';
import { useReducedMotion } from './useReducedMotion';
import { useIsVisible } from './useIsVisible';
import { useQualityTier } from './useQualityTier';

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

  // -------------------------------------------------------------------------
  // 3D Simplex noise
  // -------------------------------------------------------------------------
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

  // 3-octave FBM for organic turbulent flame contours
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 3; ++i) {
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
    // In 0g (microgravity): pure spherical expansion (uBuoyancy = 0, uElongation = 1)
    // In >0g: vertical stretch + top teardrop tapering
    float yScaled = p.y / max(0.6, uElongation);
    float taper = 1.0 - 0.48 * uBuoyancy * clamp(p.y * 1.7, 0.0, 1.25);
    float xScaled = p.x / max(0.2, taper);

    vec2 deformedP = vec2(xScaled, yScaled);
    float baseDist = length(deformedP);

    // 3. Advection time coordinates
    float t = uReducedMotion > 0.5 ? 0.0 : uTime * uFlickerSpeed;

    // In 0g: noise moves slowly radially (quiescent diffusion)
    // In >0g: rapid upward convective plume
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

    // 6. Microgravity blue halo (quiescent diffusive blue sheath)
    float haloFactor = smoothstep(effRadius * 1.55, effRadius * 0.35, d) * (1.0 - uBuoyancy * 0.78);

    // 7. Pressure mapping: lower pressure broadens boundary softness
    float pressureNorm = clamp(uPressure / 101.3, 0.5, 1.6);
    float softnessMultiplier = 1.0 / pressureNorm;

    // Color compositing
    vec3 color = mix(uOuterColor, uCoreColor, coreFactor * 0.95);
    
    // Add cool oxygen blue halo
    vec3 blueHaloColor = vec3(0.12, 0.52, 0.95);
    color += blueHaloColor * haloFactor * 0.45;

    // Warm soot tip glow in higher gravity
    vec3 sootGlow = vec3(0.9, 0.25, 0.05) * uSootAmount * uBuoyancy * max(0.0, p.y) * 1.5;
    color += sootGlow;

    // Brightness amplification
    color *= uBrightness;

    // Alpha channel
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
}

function FlameMesh({ params, scenario, reducedMotion }: FlameMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Parse CSS colors to Three.js RGB vectors
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

  // Target values for lerping
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

  // Initial uniforms created once on mount via useState (avoids ref reads in render)
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
  }));

  // Update reducedMotion uniform when state changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uReducedMotion.value = reducedMotion ? 1.0 : 0.0;
    }
  }, [reducedMotion]);

  // Clean up WebGL resources on unmount
  useEffect(() => {
    const mat = materialRef.current;
    return () => {
      mat?.dispose();
    };
  }, []);

  // Frame tick: lerp uniforms smoothly over ~300-500ms (no React re-renders)
  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    // Cap delta for frame hiccups
    const dt = Math.min(delta, 0.05);
    const lerpT = Math.min(1.0, dt * 5.0);

    const target = targetRef.current;
    const u = mat.uniforms;

    // Advance simulation time (frozen if reduced motion)
    if (!reducedMotion) {
      u.uTime.value = state.clock.elapsedTime;
    }

    // Lerp physical scalars
    u.uBuoyancy.value += (target.buoyancy - u.uBuoyancy.value) * lerpT;
    u.uElongation.value += (target.elongation - u.uElongation.value) * lerpT;
    u.uTiltDeg.value += (target.tiltDeg - u.uTiltDeg.value) * lerpT;
    u.uRadius.value += (target.radius - u.uRadius.value) * lerpT;
    u.uSootAmount.value += (target.sootAmount - u.uSootAmount.value) * lerpT;
    u.uBrightness.value += (target.brightness - u.uBrightness.value) * lerpT;
    u.uFlickerSpeed.value += (target.flickerSpeed - u.uFlickerSpeed.value) * lerpT;
    u.uPressure.value += (target.pressure - u.uPressure.value) * lerpT;
    u.uAirflow.value += (target.airflow - u.uAirflow.value) * lerpT;

    // Lerp RGB color vectors
    u.uCoreColor.value.lerp(target.coreColor, lerpT);
    u.uOuterColor.value.lerp(target.outerColor, lerpT);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.35, 0]}>
      <planeGeometry args={[3.8, 4.4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Laboratory Sample Substrate Plate in 3D
// ---------------------------------------------------------------------------

function SubstratePlate() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      mesh?.geometry.dispose();
      (mesh?.material as THREE.Material)?.dispose();
    };
  }, []);

  return (
    <group position={[0, -0.65, 0]}>
      {/* Sample substrate slab */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2.2, 0.08, 0.4]} />
        <meshBasicMaterial color="#334155" />
      </mesh>
      {/* Fuel sample strip on top */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.6, 0.04, 0.25]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>
      {/* Spark ignition point indicator */}
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

function CameraController({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.25) * 0.04;
    state.camera.position.y = 0.35 + Math.cos(t * 0.2) * 0.02;
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
}

export function FlameScene({
  scenario,
  destination,
  compact = false,
  className = '',
}: FlameSceneProps) {
  const params = useMemo(() => deriveFlameParams(scenario), [scenario]);
  const reducedMotion = useReducedMotion();
  const quality = useQualityTier();
  const [containerRef, isVisible] = useIsVisible<HTMLDivElement>({ threshold: 0.05 });

  // Scaled particle counts based on QualityTier
  const particleCount = useMemo(() => {
    switch (quality.tier) {
      case 'high':
        return 3000;
      case 'medium':
        return 1500;
      case 'low':
      default:
        return 400;
    }
  }, [quality.tier]);

  const o2 = scenario.oxygen_pct ?? 21.0;
  const airflow = scenario.airflow_cm_s ?? 5.0;
  const pressure = scenario.pressure_kpa ?? 101.3;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${compact ? 'h-56 sm:h-64' : 'h-72 sm:h-80'} bg-[#05070E] flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Destination-reactive visual backdrop with 500ms crossfade */}
      <DestinationBackdrop
        destination={destination}
        gravityEnvironment={scenario.gravity_environment}
      />

      {/* HTML Overlay: Telemetry Readouts (Not in WebGL) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 border border-slate-800/80 text-xs font-mono text-cyan-300 pointer-events-none backdrop-blur-sm">
        <span>Airflow: {airflow} cm/s →</span>
      </div>

      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/75 border border-slate-800/80 text-xs font-mono text-slate-300 pointer-events-none backdrop-blur-sm">
        <span>Regime: </span>
        <span className="text-orange-400 font-semibold">{params.regimeLabel}</span>
      </div>

      {/* R3F WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0.35, 3.2], fov: 46 }}
        dpr={[1, Math.min(quality.maxDpr, 2)]}
        frameloop={isVisible ? (reducedMotion ? 'demand' : 'always') : 'never'}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <CameraController reducedMotion={reducedMotion} />

        {/* 3D Flame Custom Shader Mesh */}
        <FlameMesh params={params} scenario={scenario} reducedMotion={reducedMotion} />

        {/* Instanced Soot/Ember Particles */}
        <FlameParticles
          buoyancy={params.buoyancy}
          tiltDeg={params.tiltDeg}
          airflow={airflow}
          sootAmount={params.sootAmount}
          particleCount={particleCount}
          reducedMotion={reducedMotion}
        />

        {/* Laboratory Substrate Plate */}
        <SubstratePlate />

        {/* Bloom post-processing (disabled on 'low' tier) */}
        {quality.bloomEnabled && (
          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.32}
              luminanceSmoothing={0.75}
              intensity={0.85}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* HTML Overlay: Bottom Telemetry Readout */}
      <div className="absolute bottom-3 inset-x-4 z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 pointer-events-none bg-black/40 backdrop-blur-xs px-2 rounded-b">
        <span>O₂: {o2}% ({o2 > 21 ? 'Accelerated Growth' : 'Nominal Flux'})</span>
        <span>Pressure: {pressure} kPa</span>
        <span>Gravity: {params.gravityG}g ({scenario.gravity_environment ?? '0g'})</span>
      </div>
    </div>
  );
}

export default FlameScene;
