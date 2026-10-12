/**
 * FlameParticles.tsx – Instanced ember and soot particle system.
 *
 * Simulates micro-embers and soot particles rising from the combustion zone:
 *   - Acceleration = buoyancy * up + airflow * downstream drift
 *   - At 0g (microgravity): near-zero soot generation and isotropic slow diffusion
 *   - At 1g: convective plume with rising buoyant embers
 *   - Particle count scaled by QualityTier (high ~3000, medium ~1500, low ~400)
 *   - Respects prefers-reduced-motion (freezes motion)
 *   - Properly disposes buffers on unmount
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  buoyancy: number; // 0..1
  tiltDeg: number; // 0..25
  airflow: number; // cm/s
  sootAmount: number; // 0..1
  particleCount: number; // 400 .. 3000
  reducedMotion: boolean;
}

interface ParticleState {
  vel: Float32Array;
  life: Float32Array;
  maxLife: Float32Array;
}

/** Pure deterministic pseudo-random generator for render purity */
function pseudoRandom(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const FlameParticles: React.FC<Props> = ({
  buoyancy,
  tiltDeg,
  airflow,
  sootAmount,
  particleCount,
  reducedMotion,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  // Smooth uniform refs to prevent sudden jumps
  const physicsRef = useRef({ buoyancy, tiltDeg, airflow, sootAmount });
  useEffect(() => {
    physicsRef.current = { buoyancy, tiltDeg, airflow, sootAmount };
  }, [buoyancy, tiltDeg, airflow, sootAmount]);

  // Purely initialize buffer arrays when particleCount changes
  const { positions, colors, sizes, simState } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);

    const vel = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);
    const maxLife = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spawn near fuel base
      const r = pseudoRandom(i, 1) * 0.35;
      const angle = pseudoRandom(i, 2) * Math.PI * 2;
      pos[i3] = Math.cos(angle) * r;
      pos[i3 + 1] = -0.55 + pseudoRandom(i, 3) * 0.4;
      pos[i3 + 2] = Math.sin(angle) * r;

      vel[i3] = (pseudoRandom(i, 4) - 0.5) * 0.15;
      vel[i3 + 1] = 0.1 + pseudoRandom(i, 5) * 0.4;
      vel[i3 + 2] = (pseudoRandom(i, 6) - 0.5) * 0.15;

      life[i] = pseudoRandom(i, 7) * 2.0;
      maxLife[i] = 1.2 + pseudoRandom(i, 8) * 2.2;

      // Color: warm amber to dark ember red
      col[i3] = 1.0;
      col[i3 + 1] = 0.4 + pseudoRandom(i, 9) * 0.3;
      col[i3 + 2] = 0.05;

      sz[i] = 2.0 + pseudoRandom(i, 10) * 3.5;
    }

    return {
      positions: pos,
      colors: col,
      sizes: sz,
      simState: { vel, life, maxLife },
    };
  }, [particleCount]);

  // Simulation state ref updated outside render
  const stateRef = useRef<ParticleState>(simState);
  useEffect(() => {
    stateRef.current = simState;
  }, [simState]);

  // Clean up WebGL resources on unmount
  useEffect(() => {
    const geom = geomRef.current;
    const mat = matRef.current;
    return () => {
      geom?.dispose();
      mat?.dispose();
    };
  }, []);

  // Simulation tick in useFrame
  useFrame((_, delta) => {
    if (reducedMotion || !geomRef.current || !stateRef.current) return;

    // Cap delta to prevent large step after tab blur
    const dt = Math.min(delta, 0.05);
    const pState = stateRef.current;
    const { buoyancy: b, tiltDeg: t, airflow: af, sootAmount: soot } = physicsRef.current;

    // Active particle fraction scales with soot amount and buoyancy
    // At 0g (microgravity), almost zero soot embers are formed
    const activeFraction = Math.max(0.08, Math.min(1.0, 0.15 + soot * 0.5 + b * 0.4));
    const activeCount = Math.floor(particleCount * activeFraction);

    const posAttr = geomRef.current.attributes.position as THREE.BufferAttribute;
    const colAttr = geomRef.current.attributes.color as THREE.BufferAttribute;
    if (!posAttr || !colAttr) return;

    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;

    const windX = Math.sin((t * Math.PI) / 180) * (af * 0.08 + 0.1);
    const buoyantUp = 0.15 + b * 1.8;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (i > activeCount) {
        // Hide inactive particles by fading to black
        col[i3] = 0;
        col[i3 + 1] = 0;
        col[i3 + 2] = 0;
        continue;
      }

      pState.life[i] += dt;

      // Re-spawn expired particle
      if (pState.life[i] >= pState.maxLife[i]) {
        pState.life[i] = 0;
        pState.maxLife[i] = 1.0 + Math.random() * 2.0;

        const r = Math.random() * (0.2 + (1 - b) * 0.2);
        const theta = Math.random() * Math.PI * 2;
        pos[i3] = Math.cos(theta) * r;
        pos[i3 + 1] = -0.55 + Math.random() * 0.2;
        pos[i3 + 2] = Math.sin(theta) * r;

        pState.vel[i3] = (Math.random() - 0.5) * 0.2;
        pState.vel[i3 + 1] = 0.1 + Math.random() * 0.3;
        pState.vel[i3 + 2] = (Math.random() - 0.5) * 0.2;
      }

      // Advect velocity
      pState.vel[i3] += windX * dt * 0.8;
      pState.vel[i3 + 1] += buoyantUp * dt * 0.7;

      // Apply drag
      pState.vel[i3] *= 0.98;
      pState.vel[i3 + 1] *= 0.98;
      pState.vel[i3 + 2] *= 0.98;

      pos[i3] += pState.vel[i3] * dt;
      pos[i3 + 1] += pState.vel[i3 + 1] * dt;
      pos[i3 + 2] += pState.vel[i3 + 2] * dt;

      // Color fade based on age (bright amber -> deep red -> black)
      const ageNorm = pState.life[i] / pState.maxLife[i];
      const brightness = Math.max(0, 1.0 - ageNorm);
      col[i3] = brightness * 1.0;
      col[i3 + 1] = brightness * Math.max(0, 0.5 - ageNorm * 0.5);
      col[i3 + 2] = brightness * 0.05;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={3.2}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
