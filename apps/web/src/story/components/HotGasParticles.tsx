import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSeededParticles } from '../sceneState';

export interface HotGasParticlesProps {
  buoyancy: number; // 1.0 = 1g upward stream, 0.0 = 0g spherical diffuse
  tiltAngleRad?: number;
  count?: number;
  reduceMotion?: boolean;
}

export const HotGasParticles: React.FC<HotGasParticlesProps> = ({
  buoyancy,
  tiltAngleRad = 0.0,
  count = 90,
  reduceMotion = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const clockRef = useRef(0);

  // Seeded base offsets
  const basePositions = useMemo(() => {
    return generateSeededParticles(count, 7771, 1.4);
  }, [count]);

  // Dynamic particle position buffer
  const currentPositions = useMemo(() => {
    return new Float32Array(basePositions);
  }, [basePositions]);

  useFrame((_, delta) => {
    if (reduceMotion || !pointsRef.current) return;
    clockRef.current += delta;
    const t = clockRef.current;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const seedOffset = (i * 0.17) % 1.0;
      const age = (t * 0.8 + seedOffset) % 1.0; // 0 to 1 cycle

      if (buoyancy > 0.15) {
        // 1g buoyant upward convective stream
        const riseSpeed = 1.8 * buoyancy;
        // Narrow chimney draft
        const pinch = 1.0 - Math.min(1.0, age * 0.6);
        arr[idx] = basePositions[idx] * 0.3 * pinch;
        arr[idx + 1] = 0.2 + age * riseSpeed;
        arr[idx + 2] = basePositions[idx + 2] * 0.3 * pinch;
      } else if (Math.abs(tiltAngleRad) > 0.02) {
        // 0g forced ventilation: particles stream downwind
        const driftSpeed = Math.abs(tiltAngleRad) * 2.2;
        arr[idx] = basePositions[idx] * 0.35 - age * driftSpeed;
        arr[idx + 1] = basePositions[idx + 1] * 0.35 + age * 0.2;
        arr[idx + 2] = basePositions[idx + 2] * 0.35;
      } else {
        // 0g stagnant: slow suffocating spherical diffusion
        const radialSpeed = 0.35;
        const radius = 0.5 + age * radialSpeed;
        const normX = basePositions[idx];
        const normY = basePositions[idx + 1];
        const normZ = basePositions[idx + 2];
        const len = Math.sqrt(normX * normX + normY * normY + normZ * normZ) || 1.0;

        arr[idx] = (normX / len) * radius;
        arr[idx + 1] = (normY / len) * radius;
        arr[idx + 2] = (normZ / len) * radius;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={buoyancy > 0.2 ? '#f59e0b' : '#38bdf8'}
        transparent
        opacity={Math.min(0.7, 0.25 + buoyancy * 0.45)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

