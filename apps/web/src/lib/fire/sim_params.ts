import type { SimParam } from './types.ts';
import { isValidLiteratureTag } from './verified_sources.ts';

/**
 * Fire Response Console Simulation Parameters Registry
 *
 * Rules:
 * 1. Default tag is 'illustrative'.
 * 2. Literature tags ('literature:<id>') support QUALITATIVE statements only, never exact values.
 * 3. Every parameter specifies a plausible [min, max] range used for Monte Carlo design-consistency sweeps.
 * 4. All literature tags must be registered in verified_sources.ts.
 */

export const SIM_PARAMS: Record<string, SimParam> = {
  // --- Sampling Rate ---
  sample_rate_hz: {
    value: 2.0,
    min: 1.0,
    max: 5.0,
    tag: 'illustrative',
    rationale: 'Telemetry sampling rate for cabin environmental monitoring in discrete time steps.',
  },

  // --- Smoke Generation Yields (kg smoke per kg pyrolyzed fuel) ---
  smoke_yield_cellulose: {
    value: 0.025,
    min: 0.010,
    max: 0.050,
    tag: 'illustrative',
    rationale: 'Smoldering cotton/cellulose particulate yield. Value is illustrative for simulation sweeps.',
  },
  smoke_yield_silicone: {
    value: 0.045,
    min: 0.020,
    max: 0.070,
    tag: 'illustrative',
    rationale: 'Silicone rubber thermal decomposition smoke yield. Value is illustrative for simulation sweeps.',
  },
  smoke_yield_kapton: {
    value: 0.015,
    min: 0.005,
    max: 0.030,
    tag: 'illustrative',
    rationale: 'Polyimide wire insulation smoldering yield. Value is illustrative for simulation sweeps.',
  },
  smoke_yield_teflon: {
    value: 0.010,
    min: 0.003,
    max: 0.020,
    tag: 'illustrative',
    rationale: 'Fluoropolymer pyrolysis yield. Value is illustrative for simulation sweeps.',
  },

  // --- Carbon Monoxide Yields (kg CO per kg pyrolyzed fuel) ---
  co_yield_cellulose: {
    value: 0.080,
    min: 0.030,
    max: 0.150,
    tag: 'illustrative',
    rationale: 'Carbon monoxide generation during under-ventilated cellulosic smoldering. Illustrative concept.',
  },
  co_yield_silicone: {
    value: 0.030,
    min: 0.010,
    max: 0.060,
    tag: 'illustrative',
    rationale: 'Carbon monoxide yield for silicone elastomer decomposition. Illustrative concept.',
  },
  co_yield_kapton: {
    value: 0.090,
    min: 0.040,
    max: 0.160,
    tag: 'illustrative',
    rationale: 'Carbon monoxide fraction from aromatic polyimide smoldering. Illustrative concept.',
  },
  co_yield_teflon: {
    value: 0.020,
    min: 0.005,
    max: 0.040,
    tag: 'illustrative',
    rationale: 'Carbon monoxide release from fluorinated polymer pyrolysis. Illustrative concept.',
  },

  // --- Transport & Mixing Parameters ---
  dispersion_coeff_microgravity: {
    value: 0.080,
    min: 0.030,
    max: 0.150,
    tag: 'illustrative',
    rationale: 'Microgravity turbulent mixing diffusion coefficient (m^2/s). Value is illustrative; qualitative phenomenon supported by NTRS-20130000422 (SAME-2) showing duct mixing and aging dominate transport when buoyant convection is zero.',
  },
  advection_efficiency: {
    value: 0.85,
    min: 0.65,
    max: 0.95,
    tag: 'illustrative',
    rationale: 'Effective duct conveyance efficiency along forced ventilation loops. Illustrative.',
  },
  duct_deposition_loss_per_m: {
    value: 0.005,
    min: 0.001,
    max: 0.020,
    tag: 'illustrative',
    rationale: 'Aerosol wall loss per meter of ducting. Illustrative.',
  },

  // --- Particle Sensitivity & Detector Physics ---
  photoelectric_large_particle_sensitivity: {
    value: 1.0,
    min: 0.8,
    max: 1.2,
    tag: 'illustrative',
    rationale: 'Nominal optical sensitivity multiplier for large agglomerated smoke particles (>1 um). Illustrative baseline.',
  },
  photoelectric_small_particle_penalty: {
    value: 0.257,
    min: 0.15,
    max: 0.60,
    tag: 'calibrated:m1-same-r',
    rationale: 'Photoelectric detectors exhibit reduced optical response to sub-micron smoke particles characteristic of smoldering Kapton/Teflon, as demonstrated in ISS low-gravity experiments by Meyer et al. (PMC7918997). Calibrated on 130 NASA SAME/SAME-R ISS microgravity flight runs (PSI-101/102), yielding an empirical 0.257 mean multiplier for overheated Teflon.',
  },

  // --- Detector Alarm Thresholds ---
  baseline_smoke_alarm_threshold: {
    value: 2.5,
    min: 1.5,
    max: 4.0,
    tag: 'illustrative',
    rationale: 'Single-channel baseline smoke alarm threshold (%/m obscuration). Note: an ISS spec reported colloquially as 1%/ft (~3.3%/m) must be verified in a primary NASA document before any literature tag; here tagged illustrative.',
  },
  fusion_smoke_advisory_threshold: {
    value: 1.2,
    min: 0.8,
    max: 2.0,
    tag: 'illustrative',
    rationale: 'Multi-sensor advisory obscuration threshold (%/m). Illustrative concept.',
  },
  fusion_co_advisory_threshold: {
    value: 15.0,
    min: 10.0,
    max: 25.0,
    tag: 'illustrative',
    rationale: 'Multi-sensor advisory carbon monoxide threshold (ppm). Note: Not an official SMAC limit; illustrative threshold for alarm discrimination.',
  },
  fusion_co_alarm_threshold: {
    value: 35.0,
    min: 25.0,
    max: 50.0,
    tag: 'illustrative',
    rationale: 'Multi-sensor confirmed alarm carbon monoxide threshold (ppm). Illustrative threshold.',
  },
  fusion_temp_rate_alarm: {
    value: 5.0,
    min: 2.5,
    max: 10.0,
    tag: 'illustrative',
    rationale: 'Rate-of-rise thermal detection threshold (deg C / min). Illustrative.',
  },

  // --- Persistence Window ---
  fusion_persistence_s: {
    value: 6.0,
    min: 3.0,
    max: 12.0,
    tag: 'illustrative',
    rationale: 'Duration in seconds that multi-channel alarm criteria must persist before firing to reject transient dust/aerosols. Illustrative.',
  },

  // --- Nuisance Aerosol (Dust / Cabin Cleaning) ---
  nuisance_dust_peak_obscuration: {
    value: 2.8,
    min: 1.5,
    max: 4.5,
    tag: 'illustrative',
    rationale: 'Transient optical scattering peak from non-fire cabin dust/aerosol events. Supported qualitatively by NTRS-20210022143 noting particulate false alarms in spacecraft. Number is illustrative.',
  },
  nuisance_dust_decay_halflife_s: {
    value: 8.0,
    min: 4.0,
    max: 16.0,
    tag: 'illustrative',
    rationale: 'Ventilation filtration clearing half-life for non-sustained dust events. Illustrative.',
  },

  // --- Actuator & Isolation Latencies ---
  damper_close_time_s: {
    value: 4.0,
    min: 2.0,
    max: 8.0,
    tag: 'illustrative',
    rationale: 'Motorized positive-seal isolation damper travel time. Illustrative concept.',
  },
  uncrewed_suppression_timeout_s: {
    value: 45.0,
    min: 30.0,
    max: 90.0,
    tag: 'illustrative',
    rationale: 'Timeout in uncrewed autonomous mode before discharging suppression agent into isolated volume if alarm persists. Illustrative concept.',
  },
};

/**
 * Computes the integer number of consecutive reading samples corresponding
 * to a persistence duration in seconds given the active telemetry sample rate in Hz.
 *
 * Formula: count = max(1, round(persistence_s * sample_rate_hz))
 */
export function computePersistenceSamples(persistence_s: number, sample_rate_hz: number): number {
  if (persistence_s <= 0 || sample_rate_hz <= 0) return 1;
  return Math.max(1, Math.round(persistence_s * sample_rate_hz));
}

/**
 * Validates that all literature tags in SIM_PARAMS exist in verified_sources.ts.
 * Throws an error if any unverified or invented literature tag is found.
 */
export function validateSimParamsSources(): void {
  for (const [key, param] of Object.entries(SIM_PARAMS)) {
    if (!isValidLiteratureTag(param.tag)) {
      throw new Error(
        `Invalid source tag "${param.tag}" in SIM_PARAMS[${key}]. Literature tags must reference an entry in verified_sources.ts.`
      );
    }
  }
}

