import { describe, expect, it } from 'vitest';
import {
  GLOBE_DEMO_SECONDS,
  floodSeeds,
  fireSeeds,
  globeDemoProgress,
  sectorRadius,
  latLonToPosition,
  floodColor,
  fireColor,
} from './globe-model';

describe('globe-model', () => {
  it('keeps flood and fire seed sets separate', () => {
    expect(floodSeeds.length).toBeGreaterThan(3);
    expect(fireSeeds.length).toBeGreaterThan(3);
    expect(floodSeeds.some((seed) => seed.id === fireSeeds[0].id)).toBe(false);
  });

  it('maps demo seconds to 0..1 progress', () => {
    expect(globeDemoProgress(0)).toBe(0);
    expect(globeDemoProgress(GLOBE_DEMO_SECONDS / 2)).toBeCloseTo(0.5);
    expect(globeDemoProgress(GLOBE_DEMO_SECONDS)).toBe(1);
    expect(globeDemoProgress(GLOBE_DEMO_SECONDS + 5)).toBe(1);
  });

  it('grows sector radius with progress and uses yellow/orange-red colors', () => {
    expect(sectorRadius(0.2)).toBeLessThan(sectorRadius(0.9));
    expect(floodColor(0.5)).toMatch(/^rgb\(/);
    expect(fireColor(0.8)).toMatch(/^rgb\(/);
    const [x, y, z] = latLonToPosition(0, 0, 1);
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5);
  });
});
