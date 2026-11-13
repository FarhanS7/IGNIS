/**
 * Plain-language descriptions for flame shape based on gravity level.
 */
export function getPlainFlameShape(gravityG: number): string {
  if (gravityG === 0) return 'Round ball';
  if (gravityG <= 0.2) return 'Leaning up a little';
  return 'Stretched upward';
}

