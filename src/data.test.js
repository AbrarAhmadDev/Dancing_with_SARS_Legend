import { describe, expect, it } from 'vitest';
import { frames } from './data';

describe('flood demo timeline', () => {
  it('contains ordered observations with raster previews', () => {
    expect(frames.length).toBeGreaterThanOrEqual(3);
    expect(frames.map((frame) => frame.date)).toEqual([...frames].sort((a, b) => a.date.localeCompare(b.date)).map((frame) => frame.date));
    expect(frames.every((frame) => frame.image.startsWith('/data/'))).toBe(true);
    expect(frames.at(-1).label).toMatch(/Maximum/);
  });
});
