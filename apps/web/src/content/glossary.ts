/**
 * Plain-English glossary and terminology mapping for IGNIS.
 * Keeps language accessible to high-school students while maintaining
 * strict scientific honesty (PRD v3-friendly).
 */

export const OUTCOME_FRIENDLY_LABELS: Record<string, string> = {
  frames_recorded: 'flame photographed',
  extinguished: 'flame went out',
  no_ignition: 'no flame started',
};

export const OUTCOME_PAST_TENSE: Record<string, string> = {
  frames_recorded: 'a flame was photographed',
  extinguished: 'the flame went out',
  no_ignition: 'no flame started',
};

export const GLOSSARY_TERMS: Record<string, { plain: string; tooltip: string }> = {
  envelope: {
    plain: 'range NASA has tested',
    tooltip: 'The environmental conditions (oxygen, airflow, pressure) where NASA actually ran flight experiments.',
  },
  provenance: {
    plain: 'where this comes from',
    tooltip: 'The exact NASA research paper, flight data table, and row number for this fact.',
  },
  similarity: {
    plain: 'how close',
    tooltip: 'How closely this test matched your oxygen, airflow, and material settings.',
  },
  microgravity: {
    plain: 'space station freefall (0g)',
    tooltip: 'The continuous falling orbit around Earth where effective gravity is near zero.',
  },
  buoyancy: {
    plain: 'gravity-driven airflow',
    tooltip: 'On Earth, gravity pulls cold air down and pushes hot light air up. In space, this does not happen.',
  },
  assumed_pressure: {
    plain: 'standard cabin pressure (assumed)',
    tooltip: 'NASA did not measure chamber pressure during solid burns; normal cabin pressure (101.3 kPa) was assumed.',
  },
};

export function formatFriendlyOutcome(outcomeClass: string): string {
  return OUTCOME_FRIENDLY_LABELS[outcomeClass] || outcomeClass;
}

export function formatHowClose(similarity: number): string {
  const pct = Math.round(similarity * 100);
  if (pct >= 95) return 'Very close match';
  if (pct >= 85) return 'Close match';
  if (pct >= 70) return 'Moderate match';
  return 'Distant match';
}
