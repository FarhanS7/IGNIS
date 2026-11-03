import type {
  FireScenario,
  FuelType,
  HabitatGraph,
  SensorReading,
  SimStepResult,
  DetectorOutput,
} from './types.ts';
import { SIM_PARAMS } from './sim_params.ts';
import { getHabitatById, getZoneById, calculateDuctTransportTime_s } from './habitat.ts';

/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Guarantees strict determinism: identical seed produces identical results.
 */
export class SeededPRNG {
  private s: number;

  constructor(seed: number) {
    this.s = Math.floor(Math.abs(seed)) || 42;
  }

  /**
   * Returns a pseudo-random float in [0, 1).
   */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a standard normal deviate with mean 0, std 1 (Box-Muller).
   */
  nextGaussian(): number {
    const u1 = Math.max(1e-12, this.next());
    const u2 = this.next();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }
}

/**
 * Retrieves smoke and CO yield factors for a given fuel type from sim_params.ts.
 */
export function getFuelYields(fuel: FuelType): {
  smokeYield: number;
  coYield: number;
  smallParticlePenalty: number;
} {
  let smokeYield = SIM_PARAMS.smoke_yield_cellulose.value;
  let coYield = SIM_PARAMS.co_yield_cellulose.value;
  let smallParticlePenalty = SIM_PARAMS.photoelectric_large_particle_sensitivity.value;

  if (fuel === 'silicone') {
    smokeYield = SIM_PARAMS.smoke_yield_silicone.value;
    coYield = SIM_PARAMS.co_yield_silicone.value;
    smallParticlePenalty = SIM_PARAMS.photoelectric_large_particle_sensitivity.value;
  } else if (fuel === 'kapton') {
    smokeYield = SIM_PARAMS.smoke_yield_kapton.value;
    coYield = SIM_PARAMS.co_yield_kapton.value;
    smallParticlePenalty = SIM_PARAMS.photoelectric_small_particle_penalty.value;
  } else if (fuel === 'teflon') {
    smokeYield = SIM_PARAMS.smoke_yield_teflon.value;
    coYield = SIM_PARAMS.co_yield_teflon.value;
    smallParticlePenalty = SIM_PARAMS.photoelectric_small_particle_penalty.value;
  }

  return { smokeYield, coYield, smallParticlePenalty };
}

/**
 * Deterministic Fire & Smoke Transport Simulator
 *
 * Models microgravity smoke advection + turbulent mixing transport along the habitat graph.
 * Grounded in qualitative findings from NASA SAME (NTRS-20130000422):
 * - In microgravity, absence of buoyant plume dynamics means smoke does not rise.
 * - Mixing across duct recirculation zones broadens smoke concentration fronts.
 * - Sub-micron particles from smoldering Kapton/Teflon yield lower optical scattering.
 *
 * NOTE: The simulator strictly models smoke emission, transport, and sensor detection.
 * It NEVER computes whether a flame extinguishes (honest constraint).
 */
export class FireSimulator {
  private scenario: FireScenario;
  private habitat: HabitatGraph;
  private prng: SeededPRNG;
  private sampleRate_hz: number;

  constructor(scenario: FireScenario, habitat?: HabitatGraph) {
    this.scenario = scenario;
    const hab = habitat || getHabitatById(scenario.habitatId);
    if (!hab) {
      throw new Error(`Habitat with id "${scenario.habitatId}" not found in presets.`);
    }
    this.habitat = hab;
    this.prng = new SeededPRNG(scenario.seed);
    this.sampleRate_hz = SIM_PARAMS.sample_rate_hz.value;
  }

  /**
   * Runs the simulation from t = 0 to totalTime_s.
   */
  run(totalTime_s = 120.0): SimStepResult[] {
    const dt = 1.0 / this.sampleRate_hz;
    const numSteps = Math.ceil(totalTime_s / dt) + 1;
    const results: SimStepResult[] = [];

    const { smokeYield, coYield, smallParticlePenalty } = getFuelYields(this.scenario.fuel);

    // Track rolling readings to calculate temperature rate
    const tempHistories: Record<string, number[]> = {};
    for (const z of this.habitat.zones) {
      for (const dId of z.detectorIds) {
        tempHistories[dId] = [21.5];
      }
    }

    // Precalculate duct delays from source zone to all other zones
    const zoneDelays_s: Record<string, number> = {};
    for (const z of this.habitat.zones) {
      if (z.id === this.scenario.sourceZoneId) {
        zoneDelays_s[z.id] = 0.0;
      } else {
        // Find path travel time from source zone to z
        const edge = this.habitat.edges.find(
          (e) => e.fromZone === this.scenario.sourceZoneId && e.toZone === z.id
        );
        if (edge) {
          zoneDelays_s[z.id] = calculateDuctTransportTime_s(edge);
        } else {
          // Indirect edge: approximate via 2 hops
          zoneDelays_s[z.id] = 22.0; // Illustrative multi-duct delay
        }
      }
    }

    // Nuisance event settings
    const hasNuisance = this.scenario.nuisanceType === 'dust';
    const nuisanceStart_s = 8.0;
    const nuisanceZoneId = this.habitat.zones[0]?.id || 'zone_1';

    for (let step = 0; step < numSteps; step++) {
      const t = step * dt;
      const zoneEmissions: SimStepResult['zoneEmissions'] = {};
      const detectorReadings: Record<string, SensorReading> = {};
      const detectorOutputs: Record<string, DetectorOutput> = {};

      // Calculate source heat release rate (t^2 fire growth up to peak HRR)
      const fireHRR_kW = Math.min(
        this.scenario.peakHRR_kW,
        this.scenario.growthRate * t * t
      );
      // Pyrolysis mass rate roughly HRR / 16000 kJ/kg
      const pyrolyzedMassRate_g_s = (fireHRR_kW / 16000.0) * 1000.0;
      const smokeRate_g_s = pyrolyzedMassRate_g_s * smokeYield;
      const coRate_g_s = pyrolyzedMassRate_g_s * coYield;

      zoneEmissions[this.scenario.sourceZoneId] = {
        smoke_mass_g: smokeRate_g_s * dt,
        co_mass_g: coRate_g_s * dt,
        heat_kW: fireHRR_kW,
      };

      // Nuisance dust concentration
      let nuisanceObscuration = 0.0;
      if (hasNuisance && t >= nuisanceStart_s) {
        const dtNuisance = t - nuisanceStart_s;
        const halfLife = SIM_PARAMS.nuisance_dust_decay_halflife_s.value;
        nuisanceObscuration =
          SIM_PARAMS.nuisance_dust_peak_obscuration.value * Math.pow(0.5, dtNuisance / halfLife);
      }

      // Compute readings at each zone return detector
      for (const zone of this.habitat.zones) {
        const isSource = zone.id === this.scenario.sourceZoneId;
        const delay = zoneDelays_s[zone.id] ?? 20.0;
        const effectiveTime = Math.max(0, t - delay);

        // Source concentration accumulates faster than downstream zones
        let concentrationFactor = 0.0;
        if (effectiveTime > 0) {
          const tau = isSource ? 12.0 : 25.0; // Mixing time constant (SAME qualitative dispersion)
          concentrationFactor = (1.0 - Math.exp(-effectiveTime / tau)) * (isSource ? 1.0 : 0.65);
        }

        // Base obscuration from fire smoke
        let obscuration =
          concentrationFactor * (fireHRR_kW / 2.0) * smallParticlePenalty;

        // Base CO from fire
        let coPpm = concentrationFactor * (fireHRR_kW * 4.5);

        // Temperature rise
        let tempRise = concentrationFactor * (fireHRR_kW * 0.4);

        // Add nuisance dust if applicable to this zone
        if (hasNuisance && zone.id === nuisanceZoneId) {
          obscuration += nuisanceObscuration;
          // Notice: dust releases ZERO CO (qualitative distinction per NTRS-20210022143)
        }

        // Add sensor noise (deterministic via SeededPRNG)
        const obsNoise = this.prng.nextGaussian() * 0.04;
        const coNoise = this.prng.nextGaussian() * 0.3;
        const tempNoise = this.prng.nextGaussian() * 0.08;

        const finalObs = Math.max(0.0, Math.round((obscuration + obsNoise) * 100) / 100);
        const finalCO = Math.max(0.0, Math.round((coPpm + coNoise) * 10) / 10);
        const finalTemp = Math.round((21.5 + tempRise + tempNoise) * 10) / 10;

        for (const detId of zone.detectorIds) {
          const history = tempHistories[detId];
          history.push(finalTemp);
          if (history.length > 10) history.shift();

          // Calculate temperature rate of rise in deg C / min over 3 seconds
          const dtMin = Math.max(0.01, (history.length * dt) / 60.0);
          const tempDelta = finalTemp - history[0];
          const tempRate_c_per_min = Math.max(0.0, Math.round((tempDelta / dtMin) * 10) / 10);

          const reading: SensorReading = {
            timestamp_s: Math.round(t * 100) / 100,
            obscuration_pct_m: finalObs,
            co_ppm: finalCO,
            temperature_c: finalTemp,
            tempRate_c_per_min,
          };
          detectorReadings[detId] = reading;
        }
      }

      results.push({
        timestamp_s: Math.round(t * 100) / 100,
        zoneEmissions,
        detectorReadings,
        detectorOutputs,
      });
    }

    return results;
  }
}
