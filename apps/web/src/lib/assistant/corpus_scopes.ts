import type { CorpusChunk } from './bm25_retriever.ts';

export type CorpusScopeId = 'global' | 'solid' | 'acme';

export interface CorpusScopeOption {
  id: CorpusScopeId | 'earthdata';
  label: string;
  connected: boolean;
  description: string;
}

export const CORPUS_SCOPES: CorpusScopeOption[] = [
  {
    id: 'global',
    label: 'All NASA Records (930)',
    connected: true,
    description: 'Searches all 14 bundled PSI and NTRS technical reports.',
  },
  {
    id: 'solid',
    label: 'Solid Fuels (BASS & Saffire)',
    connected: true,
    description: 'Filters to BASS, BASS-II, Saffire, and exploration atmosphere reports.',
  },
  {
    id: 'acme',
    label: 'Gas & Flame Design (ACME)',
    connected: true,
    description: 'Filters to ACME & Flame Design spherical diffusion documents.',
  },
  {
    id: 'earthdata',
    label: 'NASA Earthdata FIRMS (not in bundle)',
    connected: false,
    description: 'Not connected in offline spacecraft corpus build.',
  },
];

export const DEFAULT_CORPUS_PROMPTS = [
  'How is SIBAL cloth composed and tested in Saffire-I?',
  'What happens to PMMA burning rate when forced airflow slows down in BASS-II?',
  'What cabin oxygen and pressure are used in space exploration atmospheres?',
  'Has NASA ever tested fires on the Moon or Mars?',
];

export function filterChunksByScope(
  chunks: CorpusChunk[],
  scope: CorpusScopeId = 'global'
): CorpusChunk[] {
  if (scope === 'solid') {
    return chunks.filter((c) =>
      /^(PSI-25|PSI-26|PSI-100|NTRS-2021|NTRS-2008|NTRS-2016|NTRS-2013|NTRS-2012)/i.test(c.doc_id)
    );
  }
  if (scope === 'acme') {
    return chunks.filter((c) => /^(PSI-10|PSI-23)/i.test(c.doc_id));
  }
  return chunks;
}

export function formatMatchMaterial(match: any): string {
  return (
    match?.metadata?.material_family ||
    match?.material_family ||
    match?.factors?.material?.experiment_value ||
    match?.material ||
    'Solid material'
  );
}

