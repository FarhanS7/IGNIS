import type { Chapter } from '../types';
import { chapter1 } from './chapter1';

export interface ChapterSummary {
  id: string;
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  estimatedMinutes: {
    quick: number;
    full: number;
  };
  status: 'available' | 'coming-soon';
  tags: string[];
}

export const CHAPTER_REGISTRY: Chapter[] = [chapter1];

export const ALL_CHAPTER_SUMMARIES: ChapterSummary[] = [
  {
    id: chapter1.id,
    slug: chapter1.slug,
    number: chapter1.number,
    title: chapter1.title,
    subtitle: chapter1.subtitle,
    summary: chapter1.summary,
    estimatedMinutes: chapter1.estimatedMinutes,
    status: chapter1.status,
    tags: ['Microgravity', 'Buoyancy', 'FLEX-1/2', 'Diffusion'],
  },
  {
    id: 'chapter-02',
    slug: 'the-airflow-paradox',
    number: 2,
    title: 'The Airflow Paradox',
    subtitle: 'Why 0.05 m/s ventilation is the most dangerous breeze in space',
    summary:
      'In dead-still zero-g air, fire quickly starves itself. But introduce a tiny cabin breeze of just 5 cm/s, and flames thrive. Discover how ventilation governs life and fire aboard space stations.',
    estimatedMinutes: {
      quick: 5,
      full: 9,
    },
    status: 'coming-soon',
    tags: ['Saffire-I', 'Airflow', 'ECLSS', 'Extinction'],
  },
  {
    id: 'chapter-03',
    slug: 'cool-flames-invisible-burn',
    number: 3,
    title: 'Cool Flames: The Invisible Fire',
    subtitle: 'What happens when fire continues to burn after the light goes out',
    summary:
      'The shocking ISS discovery of low-temperature combustion: hydrocarbon fuel consuming oxygen without any visible glow or soot emission.',
    estimatedMinutes: {
      quick: 4,
      full: 8,
    },
    status: 'coming-soon',
    tags: ['FLEX-2', 'Cool Flames', 'Chemistry', 'Sensors'],
  },
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTER_REGISTRY.find((c) => c.slug === slug);
}
