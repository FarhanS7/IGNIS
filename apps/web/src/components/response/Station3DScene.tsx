import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';
import { SmokeParticleEngine } from './smokeParticles.ts';
import { computeStationCamera } from './cameraMath.ts';
import { reportRendererStats, isPerfModeEnabled } from '../../visuals/perfStore.ts';

export interface VisualLayerFlags {
  smoke: boolean;
  thermal: boolean;
  airflow: boolean;
  sensors: boolean;
}

export interface Station3DSceneProps {
  habitat: HabitatGraph;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  userAzimuthOffset?: number;
  userElevationOffset?: number;
  userZoomOffset?: number;
  layers?: VisualLayerFlags;
  isExploreMode?: boolean;
  isGuidedMode?: boolean;
}

// Perf Collector
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

// Flame Shader Material for Microgravity Spherical Diffusion Flame
const FLAME_VS = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLAME_FS = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uIntensity; // 0..1 based on HRR(t)
  uniform vec3 uCoreColor;
  uniform vec3 uOuterColor;

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    float glow = smoothstep(0.0, 1.0, uIntensity);
    vec3 color = mix(uCoreColor, uOuterColor, fresnel * 0.7);
    float alpha = (0.7 + 0.3 * fresnel) * glow;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Smoke Points Shader Material
const SMOKE_VS = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  uniform float uScale;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 24.0 * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const SMOKE_FS = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha * 0.45;
    if (a < 0.005) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

interface SceneContentsProps extends Station3DSceneProps {}

const SceneContents: React.FC<SceneContentsProps> = ({
  habitat,
  timeline,
  frameState,
  t,
  selectedZoneId,
  onSelectZone,
  userAzimuthOffset = 0,
  userElevationOffset = 0,
  userZoomOffset = 0,
  layers = { smoke: true, thermal: false, airflow: true, sensors: true },
  isExploreMode,
  isGuidedMode,
}) => {
  const { camera } = useThree();
  const zones = habitat.zones;
  const zoneCount = zones.length;
  const originZoneId = timeline.scenario.sourceZoneId;
  const originZoneIndex = Math.max(0, zones.findIndex((z) => z.id === originZoneId));

  // Particle Engine
  const engine = useMemo(() => {
    return new SmokeParticleEngine({
      seed: 42,
      zoneCount,
      particlesPerZone: 280,
      particlesPerDuct: 45,
    });
  }, [zoneCount]);

  // Points Geometries & Materials
  const zoneGeoRef = useRef<THREE.BufferGeometry>(null);
  const ductGeoRef = useRef<THREE.BufferGeometry>(null);

  const zoneSmokeMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SMOKE_VS,
      fragmentShader: SMOKE_FS,
      uniforms: {
        uScale: { value: 20.0 },
        uColor: { value: new THREE.Color(0xaebfd3) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  const ductSmokeMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SMOKE_VS,
      fragmentShader: SMOKE_FS,
      uniforms: {
        uScale: { value: 16.0 },
        uColor: { value: new THREE.Color(0x8fa8c8) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Flame Shader Material
  const flameMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: FLAME_VS,
      fragmentShader: FLAME_FS,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uCoreColor: { value: new THREE.Color(0xd9f4ff) }, // Quiet blue-white microgravity core
        uOuterColor: { value: new THREE.Color(0x3ad7ff) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Microgravity spherical flame mesh
  const flameMeshRef = useRef<THREE.Mesh>(null);

  // Background stars
  const starsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i * 0.17) % (Math.PI * 2);
      const b = (i * 0.31) % Math.PI;
      const r = 60 + ((i * 13) % 40);
      pos[i * 3] = r * Math.sin(b) * Math.cos(a);
      pos[i * 3 + 1] = r * Math.cos(b);
      pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  // Update loop (driven deterministically by t + user camera offsets)
  useFrame(() => {
    const selectedZoneIndex = selectedZoneId
      ? zones.findIndex((z) => z.id === selectedZoneId)
      : -1;
    const selectedZoneX =
      selectedZoneIndex >= 0 ? engine.moduleCentersX[selectedZoneIndex] : undefined;

    // 1. Camera deterministic orbit & fly-to as pure function of t
    const camState = computeStationCamera(
      t,
      engine.moduleCentersX[originZoneIndex],
      timeline.clocks.cal.alarmTime_s,
      frameState.isSuppressionActive,
      userAzimuthOffset,
      userElevationOffset,
      userZoomOffset,
      frameState.isFireExtinguished,
      selectedZoneX,
      isGuidedMode !== undefined ? isGuidedMode : (isExploreMode !== undefined ? !isExploreMode : false)
    );
    camera.position.set(camState.x, camState.y, camState.z);
    camera.lookAt(camState.targetX, camState.targetY, camState.targetZ);

    // 2. Evaluate current smoke obscuration array
    const stepIdx = Math.min(
      timeline.steps.length - 1,
      Math.floor(t / timeline.dt_s)
    );
    const obscurations: number[] = zones.map((z) => {
      const series = timeline.zoneSeries[z.id];
      return series?.smokeObscuration[stepIdx] ?? 0;
    });

    // 3. Update particle engine
    const { zonePositions, zoneAlphas, ductPositions, ductAlphas } = engine.evaluate(
      t,
      obscurations,
      frameState.areVentsIsolated,
      frameState.isSuppressionActive,
      originZoneIndex
    );

    const zoneGeo = zoneGeoRef.current;
    if (zoneGeo && typeof zoneGeo.setAttribute === 'function') {
      zoneGeo.setAttribute('position', new THREE.BufferAttribute(zonePositions, 3));
      if (layers.smoke) {
        zoneGeo.setAttribute('aAlpha', new THREE.BufferAttribute(zoneAlphas, 1));
      } else {
        zoneGeo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(zoneAlphas.length), 1));
      }
      if (zoneGeo.attributes.position) zoneGeo.attributes.position.needsUpdate = true;
      if (zoneGeo.attributes.aAlpha) zoneGeo.attributes.aAlpha.needsUpdate = true;
    }

    const ductGeo = ductGeoRef.current;
    if (ductGeo && typeof ductGeo.setAttribute === 'function') {
      ductGeo.setAttribute('position', new THREE.BufferAttribute(ductPositions, 3));
      if (layers.airflow) {
        ductGeo.setAttribute('aAlpha', new THREE.BufferAttribute(ductAlphas, 1));
      } else {
        ductGeo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(ductAlphas.length), 1));
      }
      if (ductGeo.attributes.position) ductGeo.attributes.position.needsUpdate = true;
      if (ductGeo.attributes.aAlpha) ductGeo.attributes.aAlpha.needsUpdate = true;
    }

    // 4. Update flame intensity & scale (tied to simulated growth / heat release rate)
    const flameMesh = flameMeshRef.current;
    if (flameMesh) {
      if (frameState.isFireExtinguished || t <= 0.5) {
        flameMesh.visible = false;
        flameMat.uniforms.uIntensity.value = 0;
      } else {
        flameMesh.visible = true;
        // Simulated heat release rate growth ~ t^2 capped at peakHRR
        const growth = Math.min(1.0, (timeline.scenario.growthRate * t * t) / timeline.scenario.peakHRR_kW);
        // If suppression discharging, shrink flame smoothly
        const scaleMod = frameState.isSuppressionActive ? 0.35 : 1.0;
        const radius = Math.max(0.08, (0.12 + 0.28 * Math.sqrt(growth)) * scaleMod);

        flameMesh.position.set(engine.moduleCentersX[originZoneIndex] - 0.2, -0.15, 0);
        flameMesh.scale.set(radius, radius, radius); // Pure sphere: microgravity elongation = 1.0
        flameMat.uniforms.uIntensity.value = growth;
        flameMat.uniforms.uTime.value = t;
      }
    }
  });

  return (
    <group>
      {/* Background Starfield */}
      <points geometry={starsGeo}>
        <pointsMaterial color="#8fa8c8" size={0.3} transparent opacity={0.6} />
      </points>

      {/* Modules (Translucent Cutaway Cylinders + Glowing Outlines) */}
      {zones.map((zone, zIdx) => {
        const xPos = engine.moduleCentersX[zIdx];
        const isOrigin = zone.id === originZoneId;
        const isSelected = zone.id === selectedZoneId;
        const stepIdx = Math.min(timeline.steps.length - 1, Math.floor(t / timeline.dt_s));
        const series = timeline.zoneSeries[zone.id];
        const obs = series?.smokeObscuration[stepIdx] ?? 0;
        const co = series?.coPpm[stepIdx] ?? 0;
        const isAlarmed = obs >= 0.5 || co >= 15.0;

        // Categorical colors: cyan nominal, amber advisory, red alarm
        let colorHex = '#3ad7ff';
        if (isOrigin && t >= (timeline.clocks.cal.alarmTime_s ?? 999)) {
          colorHex = '#ff4258';
        } else if (isAlarmed) {
          colorHex = '#ffb53b';
        }

        const isPowered = !frameState.isPowerCut || !isOrigin;
        const labelParts = zone.name.replace(/\(.*\)/, '').trim().split(/\s+/);
        const shortLabel = labelParts.slice(0, 2).join(' ');

        return (
          <group
            key={zone.id}
            position={[xPos, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectZone?.(zone.id);
            }}
          >
            {/* Outer Translucent Hull Cylinder */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.95, 0.95, 2.5, 32, 1, true]} />
              <meshBasicMaterial
                color={isSelected ? '#ffffff' : colorHex}
                transparent
                opacity={isSelected ? 0.16 : isPowered ? 0.07 : 0.02}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Glowing Wireframe Outlines */}
            <lineSegments rotation={[0, 0, Math.PI / 2]}>
              <edgesGeometry args={[new THREE.CylinderGeometry(0.95, 0.95, 2.5, 16, 1, true)]} />
              <lineBasicMaterial
                color={isSelected ? '#ffffff' : colorHex}
                transparent
                opacity={isSelected ? 1.0 : isAlarmed ? 0.85 : 0.5}
              />
            </lineSegments>

            {/* Selected Module Highlight Ring */}
            {isSelected && (
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[1.06, 0.035, 12, 36]} />
                <meshBasicMaterial color="#3ad7ff" />
              </mesh>
            )}

            {/* Origin Module Focal Beacon in Stage 1 of Guided Mode */}
            {isOrigin && isGuidedMode && t < 5.0 && (
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[1.08, 0.04, 12, 36]} />
                <meshBasicMaterial
                  color="#ff4258"
                  transparent
                  opacity={0.5 + 0.3 * Math.sin(t * 6)}
                />
              </mesh>
            )}

            {/* Equipment Racks Inside Module */}
            <lineSegments position={[-0.7, -0.5, -0.3]}>
              <edgesGeometry args={[new THREE.BoxGeometry(0.48, 0.32, 0.26)]} />
              <lineBasicMaterial color={colorHex} transparent opacity={isPowered ? 0.4 : 0.12} />
            </lineSegments>
            <lineSegments position={[0.7, -0.5, 0.3]}>
              <edgesGeometry args={[new THREE.BoxGeometry(0.48, 0.32, 0.26)]} />
              <lineBasicMaterial color={colorHex} transparent opacity={isPowered ? 0.4 : 0.12} />
            </lineSegments>

            {/* Thermal Heat Overlay Mesh (When thermal layer is active) */}
            {layers.thermal && (() => {
              const tempC = series?.temperature_c?.[stepIdx] ?? 21.5;
              const tempDelta = Math.max(0, tempC - 21.5);
              if (tempDelta < 1.0) return null;
              const thermalIntensity = Math.min(0.55, 0.14 + 0.07 * Math.min(6, tempDelta));
              return (
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.88, 0.88, 2.35, 24, 1, true]} />
                  <meshBasicMaterial
                    color="#ff6b35"
                    transparent
                    opacity={thermalIntensity}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              );
            })()}

            {/* Wall Sensor Node (Shown when sensors layer is active) */}
            {layers.sensors && (
              <mesh position={[0, 0.98, 0]}>
                <sphereGeometry args={[0.08, 12, 8]} />
                <meshBasicMaterial color={colorHex} />
              </mesh>
            )}

            {/* Floating 2D Zone Label (max 2 words) */}
            <Html position={[0, 1.35, 0]} center pointerEvents="none">
              <div
                className={`px-2 py-0.5 rounded border text-[11px] font-sans font-semibold tracking-wider uppercase select-none whitespace-nowrap shadow-md transition-colors ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                    : 'bg-black/70 border-slate-700/80 text-slate-200'
                }`}
              >
                {shortLabel}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Inter-Module Ventilation Ducts & Isolation Dampers */}
      {engine.ductCentersX.map((dX, dIdx) => {
        const isIsolated = frameState.areVentsIsolated;
        const ductColor = isIsolated ? '#ff4258' : '#3ad7ff';

        return (
          <group key={`duct_${dIdx}`} position={[dX, 0, 0]}>
            {/* Duct Tube */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.68, 16, 1, true]} />
              <meshBasicMaterial
                color={ductColor}
                transparent
                opacity={isIsolated ? 0.4 : 0.55}
                depthWrite={false}
              />
            </mesh>

            {/* Damper Valve Ring */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.2, 0.02, 8, 24]} />
              <meshBasicMaterial color={ductColor} transparent opacity={0.9} />
            </mesh>

            {/* Damper Isolation Blade (Snaps shut when isolated) */}
            {isIsolated && (
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.18, 20]} />
                <meshBasicMaterial
                  color="#ff4258"
                  transparent
                  opacity={0.92}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* GPU Points: Zone Smoke Particles (Single Draw Call) */}
      <points material={zoneSmokeMat} frustumCulled={false}>
        <bufferGeometry ref={zoneGeoRef} />
      </points>

      {/* GPU Points: Duct Smoke Particles (Single Draw Call) */}
      <points material={ductSmokeMat} frustumCulled={false}>
        <bufferGeometry ref={ductGeoRef} />
      </points>

      {/* Microgravity Spherical Flame (Origin Zone) */}
      <mesh ref={flameMeshRef} material={flameMat}>
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>
    </group>
  );
};

export const Station3DScene: React.FC<Station3DSceneProps> = (props) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-[#03060c]">
      <Canvas
        camera={{ position: [0, 3, 13], fov: 40 }}
        dpr={[1, 2]} // Strictly capped at 2 for performance
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#03060c']} />
        <PerfCollector />
        <SceneContents {...props} />
      </Canvas>
    </div>
  );
};

export default Station3DScene;
