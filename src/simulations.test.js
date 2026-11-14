import { describe, expect, it } from 'vitest';
import { getSimulation, simulations } from './simulations';

describe('local simulation catalog', () => {
  it('contains selectable cached case files', () => {
    expect(simulations.length).toBeGreaterThanOrEqual(3);
    expect(simulations.every((simulation) => simulation.frames.length > 0)).toBe(true);
  });

  it('falls back to the combined event for an unknown selection', () => {
    expect(getSimulation('missing').id).toBe('combined-event');
  });
});
