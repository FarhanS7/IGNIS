import type {
  HabitatGraph,
  LocalizationCategory,
  LocalizationResult,
  RankedZone,
  SimStepResult,
} from './types.ts';

/**
 * Habitat Smoke Source Localizer
 *
 * Infers fire origin zone from the time-of-arrival gradient of fire alarms across
 * ventilation return detectors.
 *
 * Honesty & Safety Constraints:
 * 1. Partial Gravity: Partial-gravity smoke transport (e.g. lunar 1/6 g) is not validated.
 *    Whenever habitat.environment === 'lunar_partial_g', the localizer MUST return
 *    INSUFFICIENT_EVIDENCE with an unvalidated disclaimer.
 * 2. Multi-sensor Requirement: Requires at least 2 distinct alarmed zones to establish
 *    a directional transport gradient. If < 2 zones alarmed, returns INSUFFICIENT_EVIDENCE.
 * 3. Categorical Confidence: Outputs categorical ratings (CLEAR, CLOSE, AMBIGUOUS,
 *    INSUFFICIENT_EVIDENCE). NEVER outputs percentage probabilities or risk scores.
 */
export class ZoneLocalizer {
  /**
   * Evaluates simulation time-series results to localize the fire origin zone.
   */
  localize(habitat: HabitatGraph, steps: SimStepResult[]): LocalizationResult {
    // Constraint 1: Partial gravity disclaimer and abstention
    if (habitat.environment === 'lunar_partial_g' || habitat.environment === 'martian_partial_g') {
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        rankedZones: [],
        isPartialGravityUnvalidated: true,
        disclaimer:
          'Partial-gravity smoke transport is not validated; results are indicative only. Buoyant plume stratification and particulate settling in fractional-g differ from microgravity flight models.',
      };
    }

    // Map each detectorId to its parent zone
    const detToZone: Record<string, { id: string; name: string }> = {};
    for (const zone of habitat.zones) {
      for (const detId of zone.detectorIds) {
        detToZone[detId] = { id: zone.id, name: zone.name };
      }
    }

    // Find earliest alarm timestamp for each detector
    const detectorAlarmOnsets: Record<string, number> = {};
    for (const step of steps) {
      for (const [detId, output] of Object.entries(step.detectorOutputs)) {
        if (output.state === 'FIRE_ALARM') {
          if (detectorAlarmOnsets[detId] === undefined) {
            detectorAlarmOnsets[detId] = step.timestamp_s;
          }
        }
      }
    }

    // Aggregate by zone: take earliest detector onset per zone
    const zoneOnsets: Record<string, { zoneName: string; earliestOnset_s: number; primaryDetectorId: string }> = {};
    for (const [detId, onsetTime] of Object.entries(detectorAlarmOnsets)) {
      const zoneInfo = detToZone[detId];
      if (!zoneInfo) continue;

      if (!zoneOnsets[zoneInfo.id] || onsetTime < zoneOnsets[zoneInfo.id].earliestOnset_s) {
        zoneOnsets[zoneInfo.id] = {
          zoneName: zoneInfo.name,
          earliestOnset_s: onsetTime,
          primaryDetectorId: detId,
        };
      }
    }

    const alarmedZoneIds = Object.keys(zoneOnsets);

    // Constraint 2: Insufficient alarms to determine gradient
    if (alarmedZoneIds.length === 0) {
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        rankedZones: [],
        disclaimer: 'No confirmed fire alarms triggered on any habitat detector.',
      };
    }

    if (alarmedZoneIds.length === 1) {
      const zId = alarmedZoneIds[0];
      const info = zoneOnsets[zId];
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        primaryAlarmDetectorId: info.primaryDetectorId,
        rankedZones: [
          {
            zoneId: zId,
            zoneName: info.zoneName,
            onsetDelay_s: 0.0,
            category: 'INSUFFICIENT_EVIDENCE',
            rationale: `Single detector alarm observed in this zone at t = ${info.earliestOnset_s.toFixed(1)}s. Minimum of two alarmed zones required to establish ventilation gradient.`,
          },
        ],
        disclaimer:
          'Only one zone alarmed. Multi-zone ventilation gradient cannot be established with a single sensor alarm.',
      };
    }

    // Sort zones by onset time ascending
    const sortedZones = alarmedZoneIds
      .map((zId) => ({
        zoneId: zId,
        ...zoneOnsets[zId],
      }))
      .sort((a, b) => a.earliestOnset_s - b.earliestOnset_s);

    const firstZone = sortedZones[0];
    const secondZone = sortedZones[1];
    const deltaT_s = Math.round((secondZone.earliestOnset_s - firstZone.earliestOnset_s) * 10) / 10;

    let overallStatus: LocalizationCategory;
    if (deltaT_s >= 6.0) {
      overallStatus = 'CLEAR';
    } else if (deltaT_s >= 2.0) {
      overallStatus = 'CLOSE';
    } else {
      overallStatus = 'AMBIGUOUS';
    }

    const rankedZones: RankedZone[] = sortedZones.map((z, idx) => {
      const lagFromFirst_s = Math.round((z.earliestOnset_s - firstZone.earliestOnset_s) * 10) / 10;
      let zoneCategory: LocalizationCategory;
      let rationale: string;

      if (idx === 0) {
        zoneCategory = overallStatus;
        if (overallStatus === 'CLEAR') {
          rationale = `Earliest fire alarm at t = ${z.earliestOnset_s.toFixed(1)}s with distinct ${deltaT_s.toFixed(1)}s separation prior to downstream zone "${secondZone.zoneName}". Strong indication of origin.`;
        } else if (overallStatus === 'CLOSE') {
          rationale = `Earliest fire alarm at t = ${z.earliestOnset_s.toFixed(1)}s, followed closely by "${secondZone.zoneName}" at +${deltaT_s.toFixed(1)}s. Probable origin, with fast duct transport.`;
        } else {
          rationale = `Earliest alarm at t = ${z.earliestOnset_s.toFixed(1)}s, but adjacent zone "${secondZone.zoneName}" alarmed almost simultaneously (+${deltaT_s.toFixed(1)}s < 2.0s). Ambiguous origin.`;
        }
      } else {
        zoneCategory = overallStatus === 'CLEAR' ? 'CLEAR' : 'CLOSE';
        rationale = `Downstream arrival delayed by +${lagFromFirst_s.toFixed(1)}s relative to primary zone "${firstZone.zoneName}". Consistent with ventilation advection.`;
      }

      return {
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        onsetDelay_s: lagFromFirst_s,
        category: zoneCategory,
        rationale,
      };
    });

    return {
      status: overallStatus,
      rankedZones,
      primaryAlarmDetectorId: firstZone.primaryDetectorId,
    };
  }
}

/**
 * Convenience function to localize smoke origin
 */
export function localizeSmokeSource(habitat: HabitatGraph, steps: SimStepResult[]): LocalizationResult {
  const localizer = new ZoneLocalizer();
  return localizer.localize(habitat, steps);
}

