import type { HabitatGraph, HabitatZone, VentilationEdge } from './types.ts';
import habitatData from '../../data/habitats.json' with { type: 'json' };
import { SIM_PARAMS } from './sim_params.ts';

export const HABITAT_PRESETS: HabitatGraph[] = habitatData as unknown as HabitatGraph[];

export function getHabitatPresets(): HabitatGraph[] {
  return HABITAT_PRESETS;
}

export function getHabitatById(id: string): HabitatGraph | undefined {
  return HABITAT_PRESETS.find((h) => h.id === id);
}

export function getZoneById(habitat: HabitatGraph, zoneId: string): HabitatZone | undefined {
  return habitat.zones.find((z) => z.id === zoneId);
}

export function getOutgoingEdges(habitat: HabitatGraph, zoneId: string): VentilationEdge[] {
  return habitat.edges.filter((e) => e.fromZone === zoneId);
}

export function getIncomingEdges(habitat: HabitatGraph, zoneId: string): VentilationEdge[] {
  return habitat.edges.filter((e) => e.toZone === zoneId);
}

/**
 * Calculates effective smoke travel time along a duct considering both
 * forced advection and zero-g turbulent mixing dispersion (NASA SAME qualitative finding:
 * mixing broadens the smoke front and lengthens detection onset).
 *
 * Travel time formula:
 * t_adv = length / (velocity * eta_adv)
 * t_mixing_delay = length^2 / (4 * D_mix * 100) [empirical dispersion lag]
 * total_lag = t_adv + t_mixing_delay
 */
export function calculateDuctTransportTime_s(
  edge: VentilationEdge,
  dispersionCoeff = SIM_PARAMS.dispersion_coeff_microgravity.value,
  advectionEfficiency = SIM_PARAMS.advection_efficiency.value
): number {
  const effectiveVelocity = Math.max(0.01, edge.flowVelocity_m_s * advectionEfficiency);
  const t_advection = edge.ductLength_m / effectiveVelocity;
  // Microgravity dispersion delay: in absence of buoyancy, mixing across the duct profile
  // creates a diffuse initial front, delaying arrival of detectable concentration.
  const t_mixing_delay = (edge.ductLength_m * edge.ductLength_m) / Math.max(0.01, 40.0 * dispersionCoeff);
  return t_advection + t_mixing_delay;
}

/**
 * Maps which detector sits at or immediately downstream of a zone.
 */
export function getDetectorsForZone(habitat: HabitatGraph, zoneId: string): string[] {
  const zone = getZoneById(habitat, zoneId);
  if (!zone) return [];
  return zone.detectorIds;
}
