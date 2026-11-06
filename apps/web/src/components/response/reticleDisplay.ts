import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { Timeline } from '../../lib/fire/timeline/types.ts';

export function getReticleDisplay(
  localization: Timeline['localization'],
  habitat: HabitatGraph
): {
  label: string;
  isAmber: boolean;
  status: string;
} {
  const status = localization.status;
  const sourceZoneId = localization.sourceZoneId;
  const sourceZone = habitat.zones.find((z) => z.id === sourceZoneId);
  const zoneName = sourceZone
    ? sourceZone.name.replace(/\(.*\)/, '').trim().split(/\s+/)[0]
    : 'Module';

  if (status === 'CLEAR') {
    return {
      label: `Source found: ${zoneName}`,
      isAmber: false,
      status,
    };
  }

  if (status === 'CLOSE') {
    return {
      label: `Narrowing down: ${zoneName}`,
      isAmber: true,
      status,
    };
  }

  // AMBIGUOUS or INSUFFICIENT_EVIDENCE
  return {
    label: 'Narrowing down...',
    isAmber: true,
    status,
  };
}

