export const brazilFrames = [
  { date: '2024-04-21', label: 'Baseline water', image: '/data/overlays/brazil-flood-apr21-overlay.png', texture: '/data/texture-2024-04-21.jpg', sensor: 'HLS', product: 'DSWx-HLS', note: 'Pre-event OPERA surface-water observation' },
  { date: '2024-05-06', label: 'Flood detected', image: '/data/overlays/brazil-flood-may06-overlay.png', texture: '/data/texture-2024-05-06.jpg', sensor: 'HLS', product: 'DSWx-HLS', note: 'OPERA surface-water extent on the optical pass' },
  { date: '2024-05-08', label: 'Radar confirmation', image: '/data/overlays/brazil-flood-may08-overlay.png', texture: '/data/texture-2024-05-08.jpg', sensor: 'Sentinel-1', product: 'DSWx-S1', note: 'OPERA radar surface-water extent' },
  { date: '2024-05-11', label: 'Second radar pass', image: '/data/overlays/brazil-flood-may11-overlay.png', texture: '/data/brazil-texture-may11.jpg', sensor: 'Sentinel-1', product: 'DSWx-S1', note: 'OPERA radar surface-water extent' },
  { date: '2024-05-11', label: 'Maximum observed extent', image: '/data/overlays/brazil-flood-max-overlay.png', texture: '/data/brazil-texture-may11.jpg', sensor: 'Sentinel-1', product: 'DSWx-S1', note: 'Maximum extent in the available event preview' }
];

export const pakistanFrames = [
  { date: '2026-06-19', label: 'Early monsoon baseline', image: '/data/pakistan/indus-delta-nisar-2026-06-19.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'NISAR', product: 'L2 GCOV', maturity: 'PROVISIONAL', layerLabel: 'NISAR GCOV backscatter preview', note: 'Indus Delta L-band radar browse image; use as a structural baseline, not a water mask.' },
  { date: '2026-08-18', label: 'Monsoon-season pass', image: '/data/pakistan/indus-delta-nisar-2026-08-18.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'NISAR', product: 'L2 GCOV', maturity: 'PROVISIONAL', layerLabel: 'NISAR GCOV backscatter preview', note: 'Repeat-pass L-band radar view during the monsoon window.' },
  { date: '2026-10-17', label: 'Late-season pass', image: '/data/pakistan/indus-delta-nisar-2026-10-17.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'NISAR', product: 'L2 GCOV', maturity: 'PROVISIONAL', layerLabel: 'NISAR GCOV backscatter preview', note: 'Repeat-pass L-band radar view after the monsoon window.' }
];

export const pakistanWaterFrames = [
  { date: '2024-08-21', label: '2024 monsoon baseline', image: '/data/pakistan/indus-delta-dswx-s1-2024-08-21.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1A', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Historical OPERA DSWx-S1 browse preview for the same Indus Delta tile.' },
  { date: '2024-08-31', label: '2024 repeat pass', image: '/data/pakistan/indus-delta-dswx-s1-2024-08-31.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1A', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'A second historical radar-derived browse preview; no daily interpolation is implied.' },
  { date: '2024-09-14', label: '2024 late-season pass', image: '/data/pakistan/indus-delta-dswx-s1-2024-09-14.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1A', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Historical late-season browse preview for the Indus Delta analysis tile.' },
  { date: '2024-10-11', label: '2024 post-monsoon pass', image: '/data/pakistan/indus-delta-dswx-s1-2024-10-11.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1A', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Historical post-monsoon browse preview before the newer 2026 scenes.' },
  { date: '2026-06-03', label: 'Early water mask', image: '/data/pakistan/indus-delta-dswx-s1-2026-06-03.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1A', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Pakistan Indus Delta surface-water browse preview from the OPERA DSWx-S1 product.' },
  { date: '2026-09-14', label: 'Late-season water mask', image: '/data/pakistan/indus-delta-dswx-s1-2026-09-14.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1D', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Repeat-pass surface-water browse preview for the same Indus Delta tile.' }
];

export const pakistanVegetationFrames = [
  { date: '2026-06-19', label: 'Pre-monsoon vegetation', image: '/data/pakistan/pakistan-ndvi-2026-06-19.png', texture: '/data/pakistan/pakistan-context-2026-06-19.jpg', sensor: 'MODIS Terra', product: 'NDVI 8-Day', maturity: 'GIBS', layerLabel: 'NASA MODIS vegetation index', note: 'Regional vegetation-index context for Pakistan; this is not a tree-loss classification.' },
  { date: '2026-08-18', label: 'Monsoon vegetation', image: '/data/pakistan/pakistan-ndvi-2026-08-18.png', texture: '/data/pakistan/pakistan-context-2026-10-17.jpg', sensor: 'MODIS Terra', product: 'NDVI 8-Day', maturity: 'GIBS', layerLabel: 'NASA MODIS vegetation index', note: 'Vegetation response during the monsoon season, shown as an index layer.' },
  { date: '2026-10-17', label: 'Post-monsoon vegetation', image: '/data/pakistan/pakistan-ndvi-2026-10-17.png', texture: '/data/pakistan/pakistan-context-2026-10-17.jpg', sensor: 'MODIS Terra', product: 'NDVI 8-Day', maturity: 'GIBS', layerLabel: 'NASA MODIS vegetation index', note: 'Late-season vegetation context; weather and crop cycles can drive the signal.' }
];

export const pakistanThermalFrames = [
  { date: '2026-06-06', label: 'Early-summer thermal field', image: '/data/pakistan/pakistan-lst-2026-06-06.png', texture: '/data/pakistan/pakistan-context-2026-06-19.jpg', sensor: 'MODIS Terra', product: 'Land Surface Temperature', maturity: 'GIBS', layerLabel: 'NASA daytime land-surface temperature', note: 'Daytime thermal context across Pakistan; cloud and no-data areas remain visible.' },
  { date: '2026-08-18', label: 'Monsoon thermal field', image: '/data/pakistan/pakistan-lst-2026-08-18.png', texture: '/data/pakistan/pakistan-context-2026-10-17.jpg', sensor: 'MODIS Terra', product: 'Land Surface Temperature', maturity: 'GIBS', layerLabel: 'NASA daytime land-surface temperature', note: 'Daytime land-surface-temperature layer for a monsoon-season comparison.' },
  { date: '2026-10-17', label: 'Post-monsoon thermal field', image: '/data/pakistan/pakistan-lst-2026-10-17.png', texture: '/data/pakistan/pakistan-context-2026-10-17.jpg', sensor: 'MODIS Terra', product: 'Land Surface Temperature', maturity: 'GIBS', layerLabel: 'NASA daytime land-surface temperature', note: 'Late-season thermal context; this is not a building-level heat attribution.' }
];

export const pakistanFireFrames = [
  { date: '2026-08-18', label: 'Thermal anomaly watch', image: '/data/pakistan/pakistan-fires-2026-08-18.png', texture: '/data/pakistan/pakistan-context-2026-10-17.jpg', sensor: 'VIIRS NOAA-20', product: 'Thermal Anomalies 375 m', maturity: 'GIBS', layerLabel: 'NASA VIIRS thermal anomaly detections', note: 'Thermal-anomaly points are a screening signal, not a confirmed fire perimeter.' },
  { date: '2026-10-17', label: 'Later anomaly watch', image: '/data/pakistan/pakistan-fires-2026-10-17.png', texture: '/data/pakistan/pakistan-context-2026-10-17.jpg', sensor: 'VIIRS NOAA-20', product: 'Thermal Anomalies 375 m', maturity: 'GIBS', layerLabel: 'NASA VIIRS thermal anomaly detections', note: 'Later thermal-anomaly screening layer for a national-scale comparison.' }
];

export const frames = pakistanFrames;
