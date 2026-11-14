import { describe, expect, it } from 'vitest';
import { DEMO_DURATION_MS, frameIntervalMs } from './timeline';

describe('demo timeline', () => {
  it('runs for at least thirty seconds', () => {
    expect(DEMO_DURATION_MS).toBeGreaterThanOrEqual(30000);
  });

  it('spreads the demo across observation boundaries', () => {
    expect(frameIntervalMs(5)).toBe(8000);
    expect(frameIntervalMs(1)).toBe(DEMO_DURATION_MS);
  });
});
