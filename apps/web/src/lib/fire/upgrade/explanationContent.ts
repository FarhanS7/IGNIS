/**
 * Authoritative Contextual Explanation Content Registry.
 *
 * Implements the 3-level progressive explanation pattern from docs/upgrade_kit/docs/EXPLAIN_SYSTEM.md:
 * - Quick: 1-2 plain language sentences for science enthusiasts.
 * - Science: Physical transport mechanism, measurable quantities, and model limitations.
 * - Engineering: Source telemetry fields, authoritative thresholds, state transitions, and provenance.
 *
 * Epistemic constraints:
 * - Adheres strictly to repository copy guidelines and epistemic constraints.
 * - Preserves categorical uncertainty and distinguishes simulated 1D advection from flight data.
 */

import type { ExplanationTrigger, ProgressiveExplanation } from './types.ts';

export const EXPLANATION_REGISTRY: Record<ExplanationTrigger, ProgressiveExplanation> = {
  SCENARIO_START: {
    id: 'exp_start',
    trigger: 'SCENARIO_START',
    title: 'Microgravity Cabin Ventilation Nominal',
    timestamp_s: 0.0,
    quick:
      'The spacecraft life support system circulates fresh air through the module. In zero gravity, there is no natural airflow, so fans must move all cabin air.',
    science: {
      mechanism:
        'In microgravity (g ≈ 0), buoyancy-driven thermal convection vanishes. Smoke and heat do not rise; particulate transport is governed entirely by forced mechanical ventilation.',
      quantities: [
        'Airflow Velocity: ~0.15 m/s forced circulation',
        'Cabin Atmosphere: 21% O2, 79% N2 at 101.3 kPa',
        'Initial Particulate Obscuration: 0.00 % obs/m',
      ],
      limitation:
        '1D compartment-averaged advection model. Does not resolve 3D turbulence eddies or micro-recirculation zones.',
    },
    engineering: {
      sourceFields: ['sim.zones[*].airVelocity_m_s', 'sim.zones[*].obscuration_m1'],
      thresholds: ['Nominal Obscuration Baseline: < 0.02 % obs/m', 'Nominal Airflow: 0.15 m/s'],
      stateTransition: 'NOMINAL → MONITORING',
      provenance: 'Simulated 1D advection transport based on NASA ISS module ventilation parameters.',
    },
  },

  ALARM_FIRST: {
    id: 'exp_alarm',
    trigger: 'ALARM_FIRST',
    title: 'Combustion Aerosol Detected (Alarm)',
    timestamp_s: 15.0,
    quick:
      'The multi-sensor detector confirmed coincident smoke and carbon monoxide in the origin module after its 6-second persistence check, latching the fire alarm.',
    science: {
      mechanism:
        'Thermal degradation of polymer fuel releases sub-micron carbon soot and gaseous carbon monoxide (CO). Multi-sensor fusion correlates optical scattering with chemical CO over a 6.0 s persistence window.',
      quantities: [
        'CO Thresholds: 15.0 ppm / 35.0 ppm',
        'Optical Obscuration Threshold: ≥ 1.2 %/m (vs 2.5 %/m baseline)',
        'Persistence Window: 6.0 s (filters transient cabin dust)',
      ],
      limitation:
        'Optical obscuration relies on Rayleigh and Mie scattering approximations calibrated against SAME-R particle-size bounds.',
    },
    engineering: {
      sourceFields: ['step.detectorOutputs.multi_sensor', 'zone.sensors.co_ppm', 'zone.sensors.obscuration_pct_m'],
      thresholds: [
        'multi_sensor: smoke ≥ 1.2 %/m & CO/thermal coincidence over 6.0 s persistence',
        'photoelectric baseline: obscuration ≥ 2.5 %/m single-channel threshold',
      ],
      stateTransition: 'MONITORING → FIRE_ALARM',
      provenance: 'Simulated sensor output evaluated against heuristic multi-channel threshold logic.',
    },
  },

  DETECTOR_DISAGREEMENT: {
    id: 'exp_disagreement',
    trigger: 'DETECTOR_DISAGREEMENT',
    title: 'Detector Disagreement & Sensor Race',
    timestamp_s: 13.5,
    quick:
      'Single-channel optical and multi-sensor detectors trade speed for selectivity: optical thresholds trip faster on heavy soot, while multi-sensor fusion waits 6 s to filter dust and catches sub-micron wire fires that optical sensors miss.',
    science: {
      mechanism:
        'Microgravity electrical fires (Teflon/Kapton) emit sub-micron aerosols that weakly scatter optical IR light (SAME-R attenuation factor 0.257). Standard optical chambers may never alarm on them, whereas multi-sensor CO coincidence catches them while filtering zero-CO dust spikes.',
      quantities: [
        'Persistence Window: 6.0 s (~2.0–2.5 s confirmation lag on heavy soot)',
        'Sub-micron Scattering Penalty: 0.257× on Teflon/Kapton aerosols',
        'Particle Bounds: [0.035, 1.07] µm (SAME-R M1 calibration domain)',
      ],
      limitation:
        'Comparative timing depends on fuel soot vs CO yield, persistence duration, and duct transport speed.',
    },
    engineering: {
      sourceFields: ['clocks.std.time_s', 'clocks.cal.time_s', 'clocks.ml.time_s'],
      thresholds: ['Baseline hits optical threshold first on soot-rich fuels; SAME-R fusion catches sub-micron wire smolder'],
      stateTransition: 'DISAGREEMENT_ACTIVE',
      provenance: 'Empirical sensor latency curves derived from NASA SAME-R flight experiments.',
    },
  },

  LOCALIZATION_ESTABLISHED: {
    id: 'exp_localize',
    trigger: 'LOCALIZATION_ESTABLISHED',
    title: 'Source Localized to US Lab Destiny',
    timestamp_s: 14.0,
    quick:
      'By comparing which sensors alerted first along the ventilation duct, the system pinpointed the US Lab as the fire origin.',
    science: {
      mechanism:
        'Forced airflow carries combustion products sequentially past module sensors. The first module to exhibit an alarm gradient identifies the upstream ignition origin.',
      quantities: [
        'Categorical Status: CLEAR (High time separation)',
        'Rank #1: US Lab Destiny (delay: +0.0s)',
        'Rank #2: Harmony Node 2 (delay: +4.5s downstream transport)',
      ],
      limitation:
        'Localizer outputs categorical states (CLEAR, CLOSE, AMBIGUOUS, INSUFFICIENT_EVIDENCE). Does not produce continuous probability percentages.',
    },
    engineering: {
      sourceFields: ['localizationResult.status', 'localizationResult.rankedZones'],
      thresholds: ['Inter-module onset delta: Δt >= 3.0s yields CLEAR status'],
      stateTransition: 'CONFIRMING_SOURCE → SOURCE_IDENTIFIED',
      provenance: 'Derived via inter-compartment time-of-arrival gradient in localizer.ts.',
    },
  },

  POWER_CUT: {
    id: 'exp_power',
    trigger: 'POWER_CUT',
    title: 'Module Electrical Isolation',
    timestamp_s: 15.0,
    quick:
      'Non-essential electrical power was cut in the affected module to prevent electrical arcing from worsening the fire.',
    science: {
      mechanism:
        'Removing electrical energy cuts off Joule heating and prevents damaged wiring insulation from sustaining an electrical arc ignition loop.',
      quantities: [
        'Isolated Power Buses: Non-essential payloads de-energized',
        'Essential Life Support: Maintained on redundant secondary feed',
      ],
      limitation:
        'Does not extinguish an existing chemical fire; only removes electrical ignition sustaining energy.',
    },
    engineering: {
      sourceFields: ['sequencer.steps.REMOVE_POWER.status'],
      thresholds: ['Automatic trigger upon confirmed fire alarm in affected compartment'],
      stateTransition: 'CONFIRMING_SOURCE → REMOVING_POWER → POWER_REMOVED',
      provenance: 'Autonomous safety sequencer command execution per NASA ISS flight rules.',
    },
  },

  VENT_ISOLATION: {
    id: 'exp_vents',
    trigger: 'VENT_ISOLATION',
    title: 'Ventilation Dampers Closed',
    timestamp_s: 16.0,
    quick:
      'Ventilation dampers closed tightly to cut off fresh oxygen and prevent toxic smoke from spreading to other modules.',
    science: {
      mechanism:
        'Closing ventilation dampers halts inter-module advection. Without fresh airflow, the fire depletes local compartment oxidizer and smoke migration is stopped.',
      quantities: [
        'Damper Transit Time: 1.0 s mechanical closure',
        'Inter-compartment Mass Flux: 0.0 kg/s (sealed)',
        'Air Velocity in Module: 0.15 m/s → 0.00 m/s',
      ],
      limitation:
        'Damper seal integrity assumed nominal. Secondary leakage paths across hatch seals are not modeled.',
    },
    engineering: {
      sourceFields: ['sequencer.steps.ISOLATE_VENTILATION.status', 'sim.dampers[*].state'],
      thresholds: ['Damper position: 100% CLOSED confirmed by limit switch telemetry'],
      stateTransition: 'REMOVING_POWER → ISOLATING_VENTILATION → VENTILATION_ISOLATED',
      provenance: 'Authoritative responseSequencer state transition.',
    },
  },

  SUPPRESSION_ARMED: {
    id: 'exp_armed',
    trigger: 'SUPPRESSION_ARMED',
    title: 'Suppression Armed — Human Confirmation Required',
    timestamp_s: 17.0,
    quick:
      'Suppression is armed and ready. Because the module is crewed, a human astronaut must confirm before releasing water mist.',
    science: {
      mechanism:
        'Suppression agent discharge creates aerosol clouds and rapid pressure swings. Human verification ensures crew are safely masked before releasing high-pressure water mist.',
      quantities: [
        'Crewed Barrier: 1.2s continuous physical hold confirmation required',
        'Uncrewed Autonomous Timeout: 30.0s (if operating in UNCREWED mode)',
        'Agent: Fine water mist (micro-droplet evaporation)',
      ],
      limitation:
        'Simulation enforces human gate in CREWED mode; automatic release is blocked by software design.',
    },
    engineering: {
      sourceFields: ['sequencer.steps.SUPPRESSION.status', 'mode'],
      thresholds: ['Hold duration: 1200 ms continuous button hold or spacebar engagement'],
      stateTransition: 'READY_FOR_SUPPRESSION (Hold-to-confirm barrier active)',
      provenance: 'Safety interlock contract defined in AGENTS.md rule 5 and responseSequencer.ts.',
    },
  },

  SUPPRESSION_DISCHARGED: {
    id: 'exp_discharge',
    trigger: 'SUPPRESSION_DISCHARGED',
    title: 'Fine Water Mist Discharged',
    timestamp_s: 24.0,
    quick:
      'High-pressure water mist was released into the module. Tiny droplets coat the fuel and cool the flame without drowning the cabin.',
    science: {
      mechanism:
        'Water mist droplets (< 50 µm) evaporate rapidly in the flame zone. The phase change absorbs massive latent heat (2260 kJ/kg), cooling fuel below its pyrolysis temperature and displacing oxidizer.',
      quantities: [
        'Droplet Sauter Mean Diameter: < 50 µm',
        'Latent Heat of Vaporization: 2,260 kJ/kg',
        'Local O2 Displacement: ~2% reduction at flame boundary',
      ],
      limitation:
        'Droplet ballistic trajectory assumes uniform spatial distribution; droplet wall wetting is not solved.',
    },
    engineering: {
      sourceFields: ['sequencer.steps.SUPPRESSION.status', 'sim.suppressionActive'],
      thresholds: ['Discharge confirmed upon crew gate completion at t = 24.0s'],
      stateTransition: 'READY_FOR_SUPPRESSION → SUPPRESSING',
      provenance: 'Simulated water mist suppression dynamics derived from NASA flight experiments.',
    },
  },

  FIRE_EXTINGUISHED: {
    id: 'exp_extinguished',
    trigger: 'FIRE_EXTINGUISHED',
    title: 'Flame Extinguished',
    timestamp_s: 28.5,
    quick:
      'The flame has gone out. Heat and smoke generation have stopped, and temperatures are returning to normal.',
    science: {
      mechanism:
        'The combustion heat release rate dropped below the critical extinction threshold as fuel surfaces were quenched and oxygen transport was limited by vent closure.',
      quantities: [
        'Heat Release Rate: 0.0 kW (combustion ceased)',
        'Peak Module Temperature: ~38.4 °C (well within thermal structural limit of 65 °C)',
        'Extinction Interval: ~4.5 s after mist discharge',
      ],
      limitation:
        'Extinction timing derived from NASA flight experiment benchmarks. The simulator models heat/smoke decay rather than direct CFD chemical flame kinetics.',
    },
    engineering: {
      sourceFields: ['frameState.isFireExtinguished', 'sim.zones[sourceZoneId].temperature_C'],
      thresholds: ['Heat release rate = 0.0 kW AND temperature decay rate dT/dt < 0'],
      stateTransition: 'SUPPRESSING → SUPPRESSED_MONITORING',
      provenance: 'Extinction milestone derived from NASA flight test benchmarks.',
    },
  },

  POST_FIRE_SAFE: {
    id: 'exp_safe',
    trigger: 'POST_FIRE_SAFE',
    title: 'Cabin Atmosphere Safe & Post-Fire Scrubbing',
    timestamp_s: 40.0,
    quick:
      'The fire is out and the incident is contained. Environmental scrubbers are running to clean residual carbon monoxide and smoke from the cabin.',
    science: {
      mechanism:
        'Post-fire catalytic oxidizers convert residual toxic carbon monoxide (CO) to CO2, while high-efficiency particulate air (HEPA) filters capture suspended aerosol droplets.',
      quantities: [
        'Atmospheric CO Level: Declining toward safe occupational exposure threshold (< 25 ppm)',
        'Cabin Oxygen: ~20.6% (safe breathable level maintained)',
        'Hatch Status: Isolated until atmospheric clearance verified',
      ],
      limitation:
        'Scrubber cleanup rate modeled via exponential particulate filter decay function.',
    },
    engineering: {
      sourceFields: ['sequencer.steps.POST_FIRE_RECOVERY.status', 'sim.zones[*].co_ppm'],
      thresholds: ['CO < 25 ppm for > 60s before hatch opening authorization'],
      stateTransition: 'SUPPRESSED_MONITORING → POST_FIRE_RECOVERY',
      provenance: 'Authoritative post-fire recovery protocol per space station flight rules.',
    },
  },
};

/**
 * Determine the active contextual explanation based on timeline time t and frame state
 */
export function resolveActiveExplanation(
  t: number,
  isSuppressionArmed: boolean,
  isSuppressionActive: boolean,
  isFireExtinguished: boolean,
  calAlarmTime_s: number | null,
  stdAlarmTime_s: number | null
): ProgressiveExplanation {
  if (t >= 38.0 && isFireExtinguished) {
    return EXPLANATION_REGISTRY.POST_FIRE_SAFE;
  }
  if (isFireExtinguished) {
    return EXPLANATION_REGISTRY.FIRE_EXTINGUISHED;
  }
  if (isSuppressionActive) {
    return EXPLANATION_REGISTRY.SUPPRESSION_DISCHARGED;
  }
  if (isSuppressionArmed) {
    return EXPLANATION_REGISTRY.SUPPRESSION_ARMED;
  }
  if (t >= 16.0) {
    return EXPLANATION_REGISTRY.VENT_ISOLATION;
  }
  if (t >= 14.5) {
    return EXPLANATION_REGISTRY.POWER_CUT;
  }
  if (t >= 13.8 && calAlarmTime_s !== null) {
    return EXPLANATION_REGISTRY.LOCALIZATION_ESTABLISHED;
  }
  if (calAlarmTime_s !== null && stdAlarmTime_s !== null && t >= calAlarmTime_s && t < stdAlarmTime_s) {
    return EXPLANATION_REGISTRY.DETECTOR_DISAGREEMENT;
  }
  if (calAlarmTime_s !== null && t >= calAlarmTime_s) {
    return EXPLANATION_REGISTRY.ALARM_FIRST;
  }
  return EXPLANATION_REGISTRY.SCENARIO_START;
}

/**
 * Safe local storage access for remembering user's preferred explanation depth
 */
const STORAGE_KEY = 'ignis_explanation_depth_pref';

export function getStoredExplanationDepth(): 'quick' | 'science' | 'engineering' {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'quick' || val === 'science' || val === 'engineering') {
      return val;
    }
  } catch {
    // Fall back to default if storage restricted
  }
  return 'quick';
}

export function setStoredExplanationDepth(depth: 'quick' | 'science' | 'engineering'): void {
  try {
    localStorage.setItem(STORAGE_KEY, depth);
  } catch {
    // Ignore storage errors in sandboxed environments
  }
}

