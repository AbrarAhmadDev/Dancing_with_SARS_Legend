import { describe, expect, it } from 'vitest';
import { frames } from './data';

describe('flood demo timeline', () => {
  it('contains an ordered event with a peak and recovery', () => {
    expect(frames.length).toBeGreaterThanOrEqual(4);
    expect(frames.map((frame) => frame.date)).toEqual([...frames].sort((a, b) => a.date.localeCompare(b.date)).map((frame) => frame.date));
    expect(Math.max(...frames.map((frame) => frame.area))).toBe(100);
    expect(frames.at(-1).area).toBeLessThan(frames.at(-2).area);
  });
});
