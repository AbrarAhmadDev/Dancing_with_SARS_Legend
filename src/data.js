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
  { date: '2026-06-03', label: 'Early water mask', image: '/data/pakistan/indus-delta-dswx-s1-2026-06-03.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1A', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Pakistan Indus Delta surface-water browse preview from the OPERA DSWx-S1 product.' },
  { date: '2026-09-14', label: 'Late-season water mask', image: '/data/pakistan/indus-delta-dswx-s1-2026-09-14.png', texture: '/data/pakistan/indus-delta-context-2026-10-17.jpg', sensor: 'Sentinel-1D', product: 'OPERA DSWx-S1', maturity: 'V1', layerLabel: 'OPERA surface-water browse preview', note: 'Repeat-pass surface-water browse preview for the same Indus Delta tile.' }
];

export const frames = pakistanFrames;
