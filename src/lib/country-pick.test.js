import { describe, expect, it } from 'vitest';
import { latLonToPosition } from '../globe-model';
import { findCountryAt, vectorToLatLon } from './country-pick';

describe('country-pick', () => {
  it('round-trips lat/lon through the globe projection', () => {
    const [x, y, z] = latLonToPosition(36.5, 138, 1);
    const back = vectorToLatLon({ x, y, z }, 1);
    expect(back.lat).toBeCloseTo(36.5, 5);
    expect(back.lon).toBeCloseTo(138, 5);
  });

  it('finds Japan near Honshu', () => {
    const hit = findCountryAt(36.5, 138);
    expect(hit?.name).toMatch(/Japan/i);
  });

  it('finds Brazil in the Amazon', () => {
    const hit = findCountryAt(-8, -55);
    expect(hit?.name).toMatch(/Brazil/i);
  });

  it('returns null over open ocean', () => {
    expect(findCountryAt(0, -30)).toBeNull();
  });
});
