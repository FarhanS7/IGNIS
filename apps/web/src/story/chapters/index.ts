import type { Chapter } from '../types.ts';
import { chapter1 } from './chapter1.ts';
import { chapter2 } from './chapter2.ts';
import { chapter3 } from './chapter3.ts';
import { chapter4 } from './chapter4.ts';

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

export const CHAPTER_REGISTRY: Chapter[] = [chapter1, chapter2, chapter3, chapter4];

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
    tags: ['FLEX (PSI-69)', 'Droplet Flames', '0g Freefall', 'Molecular Diffusion'],
  },
  {
    id: chapter2.id,
    slug: chapter2.slug,
    number: chapter2.number,
    title: chapter2.title,
    subtitle: chapter2.subtitle,
    summary: chapter2.summary,
    estimatedMinutes: chapter2.estimatedMinutes,
    status: chapter2.status,
    tags: ['BASS-II (PSI-25)', 'PMMA Solid Fuel', 'Airflow Quenching', '1–5 cm/s Breeze'],
  },
  {
    id: chapter3.id,
    slug: chapter3.slug,
    number: chapter3.number,
    title: chapter3.title,
    subtitle: chapter3.subtitle,
    summary: chapter3.summary,
    estimatedMinutes: chapter3.estimatedMinutes,
    status: chapter3.status,
    tags: ['SAME-R (PSI-101)', 'Kapton / Teflon Wire', 'Duct Detectors', 'Sub-Micron Smoke'],
  },
  {
    id: chapter4.id,
    slug: chapter4.slug,
    number: chapter4.number,
    title: chapter4.title,
    subtitle: chapter4.subtitle,
    summary: chapter4.summary,
    estimatedMinutes: chapter4.estimatedMinutes,
    status: chapter4.status,
    tags: ['Artemis Gateway', '34% O2 at 56 kPa', 'Moon 0.16g', 'Exploration Gaps'],
  },
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  if (slug === 'why-is-a-flame-round-in-space') {
    return chapter1;
  }
  return CHAPTER_REGISTRY.find((c) => c.slug === slug);
}
