import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface StoryFlameProps {
  buoyancy: number; // 1.0 = Earth teardrop, 0.0 = Orbit sphere
  radius?: number;
  elongation?: number;
  coreColor?: string;
  outerColor?: string;
  flickerIntensity?: number;
  tiltAngleRad?: number;
  reduceMotion?: boolean;
  onTap?: () => void;
}

const flameVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flameFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uBuoyancy; // 1.0 = 1g teardrop, 0.0 = 0g sphere
  uniform vec3 uCoreColor;
  uniform vec3 uOuterColor;
  uniform float uFlicker;

  varying vec2 vUv;
  varying vec3 vPosition;

  // 2D noise helpers
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float perlinNoise(vec2 p) {
    vec2 pi = floor(p);
    vec2 pf = fract(p);
    vec2 w = pf * pf * (3.0 - 2.0 * pf);

    return mix(
      mix(dot(hash2(pi + vec2(0.0, 0.0)), pf - vec2(0.0, 0.0)),
          dot(hash2(pi + vec2(1.0, 0.0)), pf - vec2(1.0, 0.0)), w.x),
      mix(dot(hash2(pi + vec2(0.0, 1.0)), pf - vec2(0.0, 1.0)),
          dot(hash2(pi + vec2(1.0, 1.0)), pf - vec2(1.0, 1.0)), w.x),
      w.y
    );
  }

  float fbm(vec2 p) {
    float val = 0.0;
    val += 0.500 * perlinNoise(p); p *= 2.02;
    val += 0.250 * perlinNoise(p); p *= 2.03;
    val += 0.125 * perlinNoise(p);
    return val;
  }

  void main() {
    // Center coords: x in [-1, 1], y in [-1, 1]
    vec2 p = (vUv - 0.5) * 2.0;

    // Subtle low-frequency oscillation <= 2.5 Hz for safety
    float time = uTime * 3.5;
    float flicker = 1.0 + sin(time) * 0.06 * uFlicker;

    // SDF for Sphere (0g)
    float dSphere = length(p) - 0.52 * flicker;

    // SDF for Teardrop (1g):
    // Tail stretches up into a point as y increases
    vec2 pTeardrop = p;
    // Shift center slightly down so flame sits nicely on fuel droplet/wick
    pTeardrop.y -= 0.1;
    float yNorm = clamp((pTeardrop.y + 0.6) / 1.5, 0.0, 1.0);
    // Profile narrows towards top: r(y)
    float rTeardrop = 0.55 * (1.0 - yNorm * 0.75) * sqrt(max(0.05, 1.0 - abs(pTeardrop.y * 0.7)));
    float dTeardrop = length(vec2(pTeardrop.x, pTeardrop.y * 0.6)) - rTeardrop * flicker;

    // Morph between sphere and teardrop based on buoyancy
    float d = mix(dSphere, dTeardrop, uBuoyancy);

    // Apply procedural edge noise (FBM)
    vec2 noiseCoord = p * 2.5 + vec2(0.0, -time * 0.4 * uBuoyancy);
    float noise = fbm(noiseCoord) * (0.04 + 0.08 * uBuoyancy);
    d += noise;

    // Calculate intensity layers
    // Core (high temperature)
    float coreDist = d + 0.22;
    float coreMask = smoothstep(0.08, -0.05, coreDist);

    // Outer mantle
    float mantleMask = smoothstep(0.12, -0.15, d);

    // Alpha falloff
    float alpha = smoothstep(0.15, -0.05, d) * 0.88;

    // Color mixing:
    // When uBuoyancy is high (1g): golden amber mantle with pale yellow/white core
    // When uBuoyancy is 0 (0g): cool blue chemiluminescence mantle with blue-white core
    vec3 coldBlueOuter = vec3(0.05, 0.45, 0.95);
    vec3 coldBlueCore = vec3(0.40, 0.85, 1.00);

    vec3 activeOuterColor = mix(coldBlueOuter, uOuterColor, clamp(uBuoyancy * 1.3, 0.0, 1.0));
    vec3 activeCoreColor = mix(coldBlueCore, uCoreColor, clamp(uBuoyancy * 1.2, 0.0, 1.0));

    vec3 finalColor = mix(activeOuterColor, activeCoreColor, coreMask * 0.75);

    // Boost glow in core
    finalColor += vec3(0.2, 0.2, 0.1) * coreMask * uBuoyancy;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const StoryFlame: React.FC<StoryFlameProps> = ({
  buoyancy,
  radius = 1.0,
  elongation = 1.0,
  coreColor = '#fef08a',
  outerColor = '#f97316',
  flickerIntensity = 0.5,
  tiltAngleRad = 0.0,
  reduceMotion = false,
  onTap,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const clockRef = useRef(0);
  const squashRef = useRef(1.0);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uBuoyancy: { value: buoyancy },
      uCoreColor: { value: new THREE.Color(coreColor) },
      uOuterColor: { value: new THREE.Color(outerColor) },
      uFlicker: { value: flickerIntensity },
    };
  }, []);

  useFrame((_, delta) => {
    if (!reduceMotion) {
      clockRef.current += delta;
      // Spring recovery from squash
      squashRef.current += (1.0 - squashRef.current) * Math.min(1.0, delta * 10.0);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clockRef.current;
      // Damped follow for buoyancy transitions
      materialRef.current.uniforms.uBuoyancy.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uBuoyancy.value,
        buoyancy,
        0.12
      );
      materialRef.current.uniforms.uCoreColor.value.set(coreColor);
      materialRef.current.uniforms.uOuterColor.value.set(outerColor);
      materialRef.current.uniforms.uFlicker.value = flickerIntensity;
    }

    if (meshRef.current) {
      // Rotation tilt from airflow or velocity
      meshRef.current.rotation.z = -tiltAngleRad;

      // Scale with squash & stretch (8% overshoot on tap)
      const sq = squashRef.current;
      meshRef.current.scale.set(
        radius * (2.0 - sq) * 1.8,
        radius * elongation * sq * 1.8,
        1.0
      );
    }
  });

  const handlePointerDown = () => {
    // 8% squash & stretch on tap
    squashRef.current = 0.88;
    onTap?.();
  };

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[2.0, 2.0, 16, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

