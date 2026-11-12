import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface DropletOrbProps {
  diameterMm: number;
  initialDiameterMm?: number;
  visible?: boolean;
  reduceMotion?: boolean;
  onTap?: () => void;
}

export const DropletOrb: React.FC<DropletOrbProps> = ({
  diameterMm,
  initialDiameterMm = 1.69,
  visible = true,
  reduceMotion = false,
  onTap,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.LineSegments>(null);
  const squashRef = useRef(1.0);

  // Conversion: 1mm ~ 0.12 scene units
  const radius = Math.max(0.04, diameterMm * 0.09);
  const initialRadius = Math.max(0.04, initialDiameterMm * 0.09);

  useFrame((_, delta) => {
    if (!reduceMotion) {
      squashRef.current += (1.0 - squashRef.current) * Math.min(1.0, delta * 12.0);
    }

    if (meshRef.current) {
      const sq = squashRef.current;
      meshRef.current.scale.set(
        radius * (2.0 - sq),
        radius * sq,
        radius * (2.0 - sq)
      );
    }

    if (ringRef.current && !reduceMotion) {
      ringRef.current.rotation.z += delta * 0.2;
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, -0.05, 0]}>
      {/* Central Fuel Droplet */}
      <mesh
        ref={meshRef}
        onPointerDown={() => {
          squashRef.current = 0.85;
          onTap?.();
        }}
      >
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Thin cyan ring indicating NASA flight test initial diameter boundary */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[initialRadius * 0.98, initialRadius * 1.02, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

