export const DEMO_SECONDS = 30;
export const countries = [
  {
    id: 'japan',
    code: 'JPN',
    name: 'Japan',
    region: 'Honshu',
    coordinates: [138, 36.5],
    sceneIndex: 0,
    type: 'Flooding',
    date: 'October 2019',
    // Approximate reference AOI + event window for catalog search (not a measured flood perimeter).
    catalog: {
      bbox: [135, 34, 141, 38],
      temporal: ['2019-10-10T00:00:00Z', '2019-10-15T23:59:59Z'],
      asf: { platform: 'S1', processingLevel: 'GRD_HD', label: 'ASF Sentinel-1 GRD' },
      cmr: { platform: 'Sentinel-1A', provider: 'ASF', label: 'CMR Sentinel-1A granules' },
      note: 'Catalog window around Typhoon Hagibis (Oct 2019). Results are SAR metadata/browse, not reconstructed flood extents.',
    },
  },
  {
    id: 'brazil',
    code: 'BRA',
    name: 'Brazil',
    region: 'Amazon region',
    coordinates: [-63, -8],
    sceneIndex: 1,
    type: 'Fire / heat signature',
    date: 'August 2019',
    catalog: {
      bbox: [-70, -12, -50, 0],
      temporal: ['2019-08-01T00:00:00Z', '2019-08-20T23:59:59Z'],
      asf: { platform: 'S1', processingLevel: 'GRD_HD', label: 'ASF Sentinel-1 GRD' },
      cmr: { short_name: 'VNP14IMG', label: 'CMR VIIRS active-fire granules' },
      note: 'Catalog window for Aug 2019 Amazon fire-season reference. VIIRS detections are thermal anomalies, not validated fire perimeters.',
    },
  },
];
export function demoProgress(seconds) {
  return Math.max(0, Math.min(DEMO_SECONDS, seconds)) / DEMO_SECONDS;
}

/** Rolling recent window for “latest sources” catalog queries. */
export function latestTemporalWindow(days = 14) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return [start.toISOString(), end.toISOString()];
}

export function withLatestCatalog(country, days = 14) {
  const temporal = latestTemporalWindow(days);
  return {
    ...country,
    catalog: {
      ...country.catalog,
      temporal,
      note: `Latest ${days}-day ASF + Earthdata catalog window for ${country.name}. Metadata/browse only; not a measured disaster map.`,
    },
  };
}
export function parseRoute(hash) {
  const [section, country] = hash.replace(/^#\/?/, '').split('/');
  return {
    tab: ['atlas', 'compare', 'learn', 'sources'].includes(section) ? section : 'atlas',
    country: countries.some(c => c.id === country) ? country : 'japan',
  };
}
