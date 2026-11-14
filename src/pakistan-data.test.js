import { describe, expect, it } from 'vitest';
import { pakistanFireFrames, pakistanThermalFrames, pakistanVegetationFrames, pakistanWaterFrames } from './data';

describe('Pakistan evidence library', () => {
  it('keeps every thematic timeline image-backed and multi-date', () => {
    const timelines = [pakistanWaterFrames, pakistanVegetationFrames, pakistanThermalFrames, pakistanFireFrames];
    timelines.forEach((timeline) => {
      expect(timeline.length).toBeGreaterThanOrEqual(2);
      expect(new Set(timeline.map((frame) => frame.date)).size).toBe(timeline.length);
      expect(timeline.every((frame) => frame.image.startsWith('/data/pakistan/'))).toBe(true);
      expect(timeline.every((frame) => frame.note.length > 20)).toBe(true);
    });
  });
});
