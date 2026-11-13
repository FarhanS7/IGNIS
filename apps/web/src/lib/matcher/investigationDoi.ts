/**
 * Canonical NASA Physical Sciences Informatics (PSI) DOI lookup for
 * microgravity solid-fuel investigations used in IGNIS.
 */
const INVESTIGATION_DOI_MAP: Record<string, string> = {
  'PSI-25': '10.60555/4qc4-de67',
  'BASS-II': '10.60555/4qc4-de67',
  'PSI-26': '10.60555/58h4-dy80',
  BASS: '10.60555/58h4-dy80',
  'PSI-98': '10.60555/0t15-1z43',
  'SAFFIRE-I': '10.60555/0t15-1z43',
  'PSI-99': '10.60555/2chp-m469',
  'SAFFIRE-II': '10.60555/2chp-m469',
  'PSI-100': '10.60555/040q-4h36',
  'SAFFIRE-III': '10.60555/040q-4h36',
};

export function getInvestigationDoi(investigationId?: string | null): string {
  const key = (investigationId || '').trim().toUpperCase();
  if (INVESTIGATION_DOI_MAP[key]) {
    return INVESTIGATION_DOI_MAP[key];
  }
  if (key.includes('BASS-II') || key.includes('25')) return INVESTIGATION_DOI_MAP['PSI-25'];
  if (key.includes('SAFFIRE-II') || key.includes('99')) return INVESTIGATION_DOI_MAP['PSI-99'];
  if (key.includes('SAFFIRE-III') || key.includes('100')) return INVESTIGATION_DOI_MAP['PSI-100'];
  return INVESTIGATION_DOI_MAP['PSI-98'];
}

