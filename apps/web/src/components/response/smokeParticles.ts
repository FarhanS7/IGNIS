/**
 * Deterministic Microgravity Smoke & Duct Flow Particle Engine.
 *
 * Microgravity Physics Principles (NASA STD-3001 & SAME-R):
 * 1. Zero thermal buoyancy: Smoke does NOT rise upward (+y).
 * 2. Radial spherical dispersion from ignition origin zone.
 * 3. Advection strictly through ventilation ducts driven by duct flow velocity.
 * 4. Stagnation / containment when duct isolation dampers snap shut.
 * 5. Pure deterministic function of time `t` with seeded PRNG (mulberry32).
 */

export interface ParticleDef {
  zoneIndex: number;
  baseX: number;
  radius: number;
  angle: number;
  radialSpeed: number;
  threshold: number;
  size: number;
}

export interface DuctParticleDef {
  ductIndex: number;
  fractionalPos: number;
  radius: number;
  angle: number;
  threshold: number;
}

export interface ParticleEngineConfig {
  seed?: number;
  zoneCount?: number;
  particlesPerZone?: number;
  particlesPerDuct?: number;
  mistParticleCount?: number;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SmokeParticleEngine {
  readonly zoneCount: number;
  readonly particlesPerZone: number;
  readonly particlesPerDuct: number;
  readonly mistParticleCount: number;

  readonly zoneDefs: ParticleDef[] = [];
  readonly ductDefs: DuctParticleDef[] = [];

  readonly zonePositions: Float32Array;
  readonly zoneAlphas: Float32Array;

  readonly ductPositions: Float32Array;
  readonly ductAlphas: Float32Array;

  readonly moduleCentersX: number[];
  readonly ductCentersX: number[];

  constructor(config: ParticleEngineConfig = {}) {
    const seed = config.seed ?? 42;
    this.zoneCount = config.zoneCount ?? 4;
    this.particlesPerZone = config.particlesPerZone ?? 250;
    this.particlesPerDuct = config.particlesPerDuct ?? 40;
    this.mistParticleCount = config.mistParticleCount ?? 300;

    const prng = mulberry32(seed);

    // Module X positions along the station cutaway axis
    this.moduleCentersX = [];
    for (let i = 0; i < this.zoneCount; i++) {
      this.moduleCentersX.push((i - (this.zoneCount - 1) / 2) * 3.2);
    }

    // Duct X positions between modules
    this.ductCentersX = [];
    for (let i = 0; i < this.zoneCount - 1; i++) {
      this.ductCentersX.push((this.moduleCentersX[i] + this.moduleCentersX[i + 1]) / 2);
    }

    // Precompute zone particle archetypes
    for (let z = 0; z < this.zoneCount; z++) {
      for (let i = 0; i < this.particlesPerZone; i++) {
        this.zoneDefs.push({
          zoneIndex: z,
          baseX: (prng() - 0.5) * 2.2,
          radius: Math.sqrt(prng()) * 0.82,
          angle: prng() * Math.PI * 2,
          radialSpeed: 0.3 + prng() * 0.7,
          threshold: prng(),
          size: 0.2 + prng() * 0.3,
        });
      }
    }

    // Precompute duct particle archetypes
    for (let d = 0; d < this.zoneCount - 1; d++) {
      for (let i = 0; i < this.particlesPerDuct; i++) {
        this.ductDefs.push({
          ductIndex: d,
          fractionalPos: i / this.particlesPerDuct,
          radius: prng() * 0.08,
          angle: prng() * Math.PI * 2,
          threshold: prng(),
        });
      }
    }

    const totalZoneParticles = this.zoneDefs.length;
    this.zonePositions = new Float32Array(totalZoneParticles * 3);
    this.zoneAlphas = new Float32Array(totalZoneParticles);

    const totalDuctParticles = this.ductDefs.length;
    this.ductPositions = new Float32Array(totalDuctParticles * 3);
    this.ductAlphas = new Float32Array(totalDuctParticles);
  }

  /**
   * Evaluates particle positions and opacities as a pure deterministic function of timeline time `t`.
   */
  evaluate(
    t: number,
    zoneSmokeObscuration: number[], // obscuration %/m per zone
    areVentsIsolated: boolean,
    isSuppressionActive: boolean,
    suppressedZoneIndex: number
  ) {
    const totalZone = this.zoneDefs.length;

    for (let i = 0; i < totalZone; i++) {
      const def = this.zoneDefs[i];
      const z = def.zoneIndex;
      const smokeVal = zoneSmokeObscuration[z] ?? 0;

      // Microgravity physics: NO upward buoyancy. Particles drift in slow cylindrical dispersion.
      const ang = def.angle + 0.25 * def.radialSpeed * t;
      const r = def.radius;
      const x = this.moduleCentersX[z] + def.baseX + 0.06 * Math.sin(t * def.radialSpeed + def.angle);
      const y = -0.05 + r * Math.cos(ang);
      const zCoord = r * Math.sin(ang);

      this.zonePositions[i * 3] = x;
      this.zonePositions[i * 3 + 1] = y;
      this.zonePositions[i * 3 + 2] = zCoord;

      // Alpha scaled by smoke obscuration
      const normalizedSmoke = Math.min(1.0, smokeVal / 2.5);
      const alphaThreshold = def.threshold * 0.85;
      const alpha = normalizedSmoke > alphaThreshold
        ? Math.min(1.0, (normalizedSmoke - alphaThreshold) / 0.25)
        : 0;

      // When suppression active in this zone, fade smoke into mist
      if (isSuppressionActive && z === suppressedZoneIndex) {
        this.zoneAlphas[i] = alpha * 0.3;
      } else {
        this.zoneAlphas[i] = alpha;
      }
    }

    // Duct particles
    const totalDuct = this.ductDefs.length;
    const ductSpeed = areVentsIsolated ? 0 : 0.6; // Stagnate immediately when dampers close

    for (let i = 0; i < totalDuct; i++) {
      const def = this.ductDefs[i];
      const d = def.ductIndex;
      const avgSmoke = ((zoneSmokeObscuration[d] ?? 0) + (zoneSmokeObscuration[d + 1] ?? 0)) / 2;

      // Particle travels along duct axis (X)
      const p = (def.fractionalPos + (areVentsIsolated ? 0 : (t * ductSpeed * 0.3))) % 1.0;
      const ductCenterX = this.ductCentersX[d];
      const x = ductCenterX - 0.32 + 0.64 * p;
      const y = def.radius * Math.cos(def.angle);
      const zCoord = def.radius * Math.sin(def.angle);

      this.ductPositions[i * 3] = x;
      this.ductPositions[i * 3 + 1] = y;
      this.ductPositions[i * 3 + 2] = zCoord;

      if (areVentsIsolated) {
        this.ductAlphas[i] = 0;
      } else {
        const normalizedSmoke = Math.min(1.0, avgSmoke / 2.0);
        this.ductAlphas[i] = normalizedSmoke > def.threshold * 0.8
          ? Math.min(0.8, (normalizedSmoke - def.threshold * 0.8) / 0.2)
          : 0;
      }
    }

    return {
      zonePositions: this.zonePositions,
      zoneAlphas: this.zoneAlphas,
      ductPositions: this.ductPositions,
      ductAlphas: this.ductAlphas,
    };
  }
}

