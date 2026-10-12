/**
 * FlameParticles.tsx – High-performance GPU-displaced ember & soot particle system.
 *
 * Performance Architecture (Step 7):
 *   - Zero CPU loops per frame: positions and lifetimes calculated entirely in vertex shader
 *   - Single draw call with no buffer re-uploads (needsUpdate is never called in useFrame)
 *   - Particle counts: High = 1500, Medium = 700, Low = 200
 *   - Freezes completely under prefers-reduced-motion
 *   - Full disposal of geometries and custom ShaderMaterial on unmount
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  buoyancy: number; // 0..1
  tiltDeg: number; // 0..25
  airflow: number; // cm/s
  sootAmount: number; // 0..1
  particleCount: number; // 200 .. 1500
  reducedMotion: boolean;
  offset?: [number, number, number];
}

/** Pure deterministic pseudo-random generator for buffer initialization */
function pseudoRandom(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBuoyancy;
  uniform float uAirflow;
  uniform float uTiltDeg;
  uniform float uSootAmount;
  uniform float uReducedMotion;

  attribute vec3 aVelocity;
  attribute vec2 aTiming; // x = birthOffset, y = maxLife
  attribute float aSize;

  varying vec4 vColor;

  void main() {
    if (uReducedMotion > 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }

    float birth = aTiming.x;
    float maxLife = aTiming.y;
    float age = mod(uTime + birth, maxLife);
    float progress = age / maxLife;

    // Convective plume physics in GPU
    float tiltRad = radians(uTiltDeg);
    float windX = sin(tiltRad) * (uAirflow * 0.08 + 0.1);
    float buoyantUp = 0.15 + uBuoyancy * 1.8;

    vec3 pos = position + aVelocity * age;
    pos.x += 0.5 * windX * age * age;
    pos.y += 0.5 * buoyantUp * age * age;

    // Dynamic visibility fraction based on soot and gravity
    float activeFraction = clamp(0.12 + uSootAmount * 0.55 + uBuoyancy * 0.40, 0.05, 1.0);
    if ((birth / 6.0) > activeFraction) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = aSize * (1.0 - progress * 0.55) * (140.0 / -mvPosition.z);

    // Warm amber -> deep red -> black fading
    float brightness = max(0.0, 1.0 - progress);
    float r = brightness * 1.0;
    float g = brightness * max(0.0, 0.55 - progress * 0.55);
    float b = brightness * 0.04;
    vColor = vec4(r, g, b, brightness);
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  varying vec4 vColor;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distSq = dot(coord, coord);
    if (distSq > 0.25) {
      discard;
    }
    float alpha = smoothstep(0.25, 0.03, distSq) * vColor.a;
    gl_FragColor = vec4(vColor.rgb, alpha);
  }
`;

export const FlameParticles: React.FC<Props> = ({
  buoyancy,
  tiltDeg,
  airflow,
  sootAmount,
  particleCount,
  reducedMotion,
  offset = [0, 0, 0],
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Purely initialize static particle attributes on count change
  const { positions, velocities, timings, sizes } = useMemo(() => {
    const count = Math.max(10, particleCount);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const tim = new Float32Array(count * 2);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      // Fuel base spawning position
      const r = pseudoRandom(i, 1) * 0.32;
      const angle = pseudoRandom(i, 2) * Math.PI * 2;
      pos[i3] = Math.cos(angle) * r;
      pos[i3 + 1] = -0.52 + pseudoRandom(i, 3) * 0.35;
      pos[i3 + 2] = Math.sin(angle) * r;

      // Base initial velocity jitter
      vel[i3] = (pseudoRandom(i, 4) - 0.5) * 0.18;
      vel[i3 + 1] = 0.12 + pseudoRandom(i, 5) * 0.35;
      vel[i3 + 2] = (pseudoRandom(i, 6) - 0.5) * 0.18;

      // Timing: x = birth offset, y = maxLife
      tim[i2] = pseudoRandom(i, 7) * 5.0;
      tim[i2 + 1] = 1.2 + pseudoRandom(i, 8) * 2.2;

      // Size
      sz[i] = 2.0 + pseudoRandom(i, 9) * 3.5;
    }

    return {
      positions: pos,
      velocities: vel,
      timings: tim,
      sizes: sz,
    };
  }, [particleCount]);

  // Clean up WebGL resources on unmount
  useEffect(() => {
    const geom = geomRef.current;
    const mat = matRef.current;
    return () => {
      geom?.dispose();
      mat?.dispose();
    };
  }, []);

  // Update uniforms in useFrame: zero CPU loops, zero buffer uploads!
  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uBuoyancy.value = buoyancy;
    mat.uniforms.uTiltDeg.value = tiltDeg;
    mat.uniforms.uAirflow.value = airflow;
    mat.uniforms.uSootAmount.value = sootAmount;
    mat.uniforms.uReducedMotion.value = reducedMotion ? 1.0 : 0.0;
  });

  return (
    <group position={offset}>
      <points ref={pointsRef}>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aVelocity"
            args={[velocities, 3]}
          />
          <bufferAttribute
            attach="attributes-aTiming"
            args={[timings, 2]}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={PARTICLE_VERTEX_SHADER}
          fragmentShader={PARTICLE_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uBuoyancy: { value: buoyancy },
            uAirflow: { value: airflow },
            uTiltDeg: { value: tiltDeg },
            uSootAmount: { value: sootAmount },
            uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
          }}
        />
      </points>
    </group>
  );
};
