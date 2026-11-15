import { expect, it } from 'vitest';
import { geoContains } from 'd3-geo';
import world from './data/world.json';
import { countries, demoProgress, parseRoute } from './atlas-model';
import { scenes } from './spread-model';

it('uses a full thirty seconds for each selectable event', () => {
  expect(demoProgress(-1)).toBe(0);
  expect(demoProgress(0)).toBe(0);
  expect(demoProgress(15)).toBe(.5);
  expect(demoProgress(30)).toBe(1);
  expect(demoProgress(50)).toBe(1);
});
it('keeps region markers inside the matching real country boundary', () => {
  for (const country of countries) {
    const feature = world.features.find(f => f.properties.code === country.code);
    expect(feature.properties.name).toBe(country.name);
    expect(geoContains(feature, country.coordinates)).toBe(true);
    expect(scenes[country.sceneIndex].region).toContain(country.name === 'Brazil' ? 'Brazilian' : country.name);
  }
});
it('supports country deep links and falls back safely on unavailable routes', () => {
  expect(parseRoute('#atlas/brazil')).toEqual({ tab: 'atlas', country: 'brazil' });
  expect(parseRoute('#compare/japan')).toEqual({ tab: 'compare', country: 'japan' });
  expect(parseRoute('#atlas/pakistan')).toEqual({ tab: 'atlas', country: 'japan' });
  expect(parseRoute('#old')).toEqual({ tab: 'atlas', country: 'japan' });
});
