import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface StationSilhouetteProps {
  opacity?: number;
  reduceMotion?: boolean;
}

export const StationSilhouette: React.FC<StationSilhouetteProps> = ({
  opacity = 0.35,
  reduceMotion = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (reduceMotion || !groupRef.current) return;
    timeRef.current += delta;
    // Faint slow drift in distance
    groupRef.current.rotation.y += delta * 0.01;
    groupRef.current.position.y = Math.sin(timeRef.current * 0.5) * 0.05;
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={groupRef} position={[0, 0.4, -6]} scale={[0.7, 0.7, 0.7]}>
      {/* Central Integrated Truss Segment */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[7.0, 0.15, 0.15]} />
        <meshBasicMaterial
          color="#334155"
          transparent
          opacity={opacity * 0.8}
        />
      </mesh>

      {/* Main pressurized modules (Destiny, Harmony, Columbus, Kibo) */}
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 2.2, 16]} />
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>

      {/* Solar Array Wings (Port & Starboard) */}
      {/* Starboard Arrays */}
      <mesh position={[-2.8, 0.6, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={opacity * 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-2.8, -0.6, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={opacity * 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Port Arrays */}
      <mesh position={[2.8, 0.6, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={opacity * 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[2.8, -0.6, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={opacity * 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Distant Earth Horizon Arc */}
      <mesh position={[0, -5.5, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.0, 8.08, 64]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={opacity * 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
