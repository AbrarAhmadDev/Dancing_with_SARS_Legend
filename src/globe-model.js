/** Illustrative globe demo model — not observed flood/fire footprints. */

export const GLOBE_DEMO_SECONDS = 20;

/** Seed regions for illustrative flood expansion (yellow on green land). */
export const floodSeeds = [
  { id: 'east-asia', label: 'East Asia coastal belt', lat: 35, lon: 138, strength: 1 },
  { id: 'south-asia', label: 'South Asia river plains', lat: 25, lon: 78, strength: 0.95 },
  { id: 'amazon-basin', label: 'Amazon basin', lat: -3, lon: -60, strength: 0.9 },
  { id: 'west-africa', label: 'West Africa wet belt', lat: 8, lon: 0, strength: 0.85 },
  { id: 'se-asia', label: 'Southeast Asia islands', lat: 2, lon: 112, strength: 0.88 },
  { id: 'europe-central', label: 'Central Europe catchments', lat: 48, lon: 12, strength: 0.75 },
];

/** Seed regions for illustrative fire expansion (orange → red). */
export const fireSeeds = [
  { id: 'amazon-fire', label: 'Amazon fire belt', lat: -8, lon: -55, strength: 1 },
  { id: 'australia', label: 'Eastern Australia', lat: -25, lon: 145, strength: 0.95 },
  { id: 'california', label: 'Western North America', lat: 38, lon: -122, strength: 0.9 },
  { id: 'siberia', label: 'Boreal corridor', lat: 60, lon: 100, strength: 0.85 },
  { id: 'mediterranean', label: 'Mediterranean fringe', lat: 38, lon: 25, strength: 0.8 },
  { id: 'southern-africa', label: 'Southern Africa savanna', lat: -18, lon: 25, strength: 0.88 },
];

export function globeDemoProgress(seconds) {
  return Math.max(0, Math.min(GLOBE_DEMO_SECONDS, seconds)) / GLOBE_DEMO_SECONDS;
}

/** Radius of an illustrative sector on the unit sphere, grows with demo progress. */
export function sectorRadius(progress, strength = 1) {
  const eased = progress * progress * (3 - 2 * progress);
  return 0.02 + eased * 0.16 * strength;
}

export function latLonToPosition(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function floodColor(progress) {
  // Yellow ramp — readable on green land
  const t = Math.max(0, Math.min(1, progress));
  const r = Math.round(245 + 10 * t);
  const g = Math.round(210 - 30 * t);
  const b = Math.round(70 - 40 * t);
  return `rgb(${r},${g},${b})`;
}

export function fireColor(progress) {
  // Orange → red as the front ages
  const t = Math.max(0, Math.min(1, progress));
  const r = Math.round(255);
  const g = Math.round(140 - 90 * t);
  const b = Math.round(40 - 20 * t);
  return `rgb(${r},${g},${b})`;
}
