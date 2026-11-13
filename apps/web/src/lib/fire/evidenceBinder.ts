import { RealSolidMatcher } from '../matcher/real_solid_matcher.ts';
import type { RawEvidenceSolidRun, MaterialMap, RealSolidMatch, SolidScenarioInput } from '../matcher/types.ts';
import type { ActionEvidenceChip, FuelType, HabitatGraph, SequenceStepId } from './types.ts';
import solidRunsData from '../../data/evidence_solid.json' with { type: 'json' };
import materialMapData from '../../data/material_map.json' with { type: 'json' };

// Singleton instance of the read-only RealSolidMatcher loaded with real NASA PSI runs
const matcher = new RealSolidMatcher(
  solidRunsData as unknown as RawEvidenceSolidRun[],
  materialMapData as unknown as MaterialMap
);

/**
 * Maps Fire Response Console fuel types to recognizable material names
 * scored by RealSolidMatcher against NASA PSI microgravity flight runs.
 */
function fuelToMaterialName(fuel: FuelType): string {
  switch (fuel) {
    case 'cellulose':
      return 'Cotton'; // Maps to SIBAL / Cotton in BASS-II
    case 'silicone':
      return 'Silicone'; // Real BASS-II silicone runs
    case 'kapton':
      return 'Nomex'; // Synthetic polymer proxy within tested flight database
    case 'teflon':
      return 'Wax'; // Polymer proxy within tested flight database
    default:
      return 'Cotton';
  }
}

/**
 * Binds real NASA flight data (BASS-II / Saffire) to response sequence steps.
 *
 * Rules:
 * 1. Imported from RealSolidMatcher READ-ONLY.
 * 2. Emits validation circularity caveat for flow-cutoff matches.
 * 3. Flags gravitational and environmental envelope boundaries (e.g. fractional gravity, high O2).
 */
export function bindActionEvidence(
  stepId: SequenceStepId,
  fuel: FuelType,
  habitat: HabitatGraph,
  scenarioInput?: SolidScenarioInput
): ActionEvidenceChip {
  const warnings: string[] = [];
  const nasaReferences: string[] = [];
  let isWithinFlightEnvelope = true;

  // Check gravity envelope
  if (habitat.environment === 'lunar_partial_g' || habitat.environment === 'martian_partial_g') {
    isWithinFlightEnvelope = false;
    warnings.push(
      "Scenario environment (fractional gravity) is outside NASA's tested range (microgravity BASS-II / Saffire only)."
    );
  }

  const matName = fuelToMaterialName(fuel);
  let matchedFlightRuns: RealSolidMatch[] = [];
  let actionTitle = '';
  let circularityCaveat = '';

  switch (stepId) {
    case 'ALARM': {
      actionTitle = 'Fire Detection & Alarm Declaration';
      nasaReferences.push(
        'NTRS-20130000422 (SAME-2 smoke particulate morphology)',
        'NTRS-20210022143 (Spacecraft fire detection research questions)'
      );
      circularityCaveat =
        'Sensor alarm thresholds are illustrative engineering thresholds. Detection times reflect physical smoke transport, not flight qualification.';
      break;
    }

    case 'REMOVE_POWER': {
      actionTitle = 'Electrical Power Removal (Cold-Soak)';
      nasaReferences.push('NTRS-20030053429 (ISS US Fire Detection & Suppression overview, pp. 1-14)');
      circularityCaveat =
        'De-energizing electrical circuits eliminates potential re-ignition sources and ohmic heating. Sources disagree on automatic vs manual isolation policy (see NASA-STD-3001 brief).';
      break;
    }

    case 'ISOLATE_VENTILATION': {
      actionTitle = 'Ventilation Loop Isolation (Flow Cutoff)';
      nasaReferences.push(
        'NTRS-20030053429 (ISS US Fire Detection & Suppression overview, pp. 1-14)',
        'NASA BASS-II microgravity solid combustion flight test archive'
      );
      circularityCaveat =
        "BASS-II circularity caveat: 25 BASS-II flight runs have flow velocity and extinction outcome parsed from operator step-down test notes (e.g. '5.0 ext'). Ventilation shutoff reduces forced convection but does not guarantee extinction across all materials or elevated oxygen levels.";

      // Query real flight matcher with zero forced convection (flow = 0 cm/s)
      const input: SolidScenarioInput = {
        material: matName,
        oxygen_pct: scenarioInput?.oxygen_pct ?? 21.0,
        flow_cm_s: 0.0, // Ventilation isolated -> 0 cm/s forced flow
        thickness_mm: scenarioInput?.thickness_mm ?? 1.0,
      };

      try {
        const matchResult = matcher.match(input, null, 4);
        matchedFlightRuns = matchResult.matches;
        if (matchResult.envelope.outside_tested_range) {
          isWithinFlightEnvelope = false;
          warnings.push('Environmental parameters fall outside tested BASS-II/Saffire flight envelope.');
        }
        for (const w of matchResult.warnings) {
          if (!warnings.includes(w)) warnings.push(w);
        }
      } catch (err) {
        warnings.push(`Flight matching query failed: ${String(err)}`);
      }
      break;
    }

    case 'INHIBIT_MAKEUP': {
      actionTitle = 'Cabin Atmosphere Makeup Inhibition';
      nasaReferences.push('NTRS-20030053429 (ISS US Fire Detection & Suppression overview, pp. 1-14)');
      circularityCaveat =
        'Halting fresh oxygen injection prevents replenishment of consumed oxidizer, accelerating flame starvation inside sealed compartments.';
      break;
    }

    case 'SUPPRESSION': {
      actionTitle = 'Fire Suppression Agent Discharge';
      nasaReferences.push(
        'NTRS-20130011664 (Fine Water Mist Extinguisher for ISS, pp. 1-7)',
        'NTRS-20030053429 (ISS Fire Suppression CO2 & Portable Breathing Apparatus)'
      );
      circularityCaveat =
        'Suppression agent effectiveness depends on total enclosure flooding and droplet residence time in microgravity. Water mist absorbs thermal load without toxic atmosphere contamination.';
      break;
    }

    case 'POST_FIRE_RECOVERY': {
      actionTitle = 'Post-Fire Atmospheric Scrubbing & Recovery';
      nasaReferences.push(
        'NTRS-20030053429 (ISS US Fire Detection & Suppression overview, pp. 1-14)',
        'NTRS-20210022143 (Post-fire combustion product cleanup & monitoring)'
      );
      circularityCaveat =
        'Post-fire recovery requires confirmation of carbon monoxide (< 15 ppm) and airborne particulate scrubbing before ventilation re-enablement.';
      break;
    }
  }

  // Check oxygen envelope
  const o2 = scenarioInput?.oxygen_pct ?? 21.0;
  if (o2 > 22.2) {
    isWithinFlightEnvelope = false;
    warnings.push(
      `Scenario oxygen (${o2.toFixed(1)}%) is above nominal spacecraft cabin limits and outside NASA's tested range (nominal flight tests capped at 21-22% O2).`
    );
  }

  return {
    stepId,
    actionTitle,
    matchedFlightRuns,
    nasaReferences,
    circularityCaveat,
    isWithinFlightEnvelope,
    warnings,
  };
}

/**
 * Returns evidence chips for all 6 response steps.
 */
export function bindAllResponseEvidence(
  fuel: FuelType,
  habitat: HabitatGraph,
  scenarioInput?: SolidScenarioInput
): Record<SequenceStepId, ActionEvidenceChip> {
  const steps: SequenceStepId[] = [
    'ALARM',
    'REMOVE_POWER',
    'ISOLATE_VENTILATION',
    'INHIBIT_MAKEUP',
    'SUPPRESSION',
    'POST_FIRE_RECOVERY',
  ];

  const result = {} as Record<SequenceStepId, ActionEvidenceChip>;
  for (const step of steps) {
    result[step] = bindActionEvidence(step, fuel, habitat, scenarioInput);
  }
  return result;
}
