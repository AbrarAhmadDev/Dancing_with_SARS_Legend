import { brazilFrames, pakistanFireFrames, pakistanFrames, pakistanThermalFrames, pakistanVegetationFrames, pakistanWaterFrames } from './data';

export const simulations = [
  {
    id: 'indus-delta-nisar',
    title: 'Indus Delta pulse',
    subtitle: 'NISAR L-band repeat passes',
    description: 'Three real NISAR GCOV browse scenes across the 2026 monsoon window, bundled for local comparison.',
    frames: pakistanFrames,
    source: 'NASA NISAR L2 GCOV',
    accent: 'purple'
  },
  {
    id: 'pakistan-coverage-atlas',
    title: 'Pakistan coverage atlas',
    subtitle: 'Four AOIs · 2026 coverage audit',
    description: 'A judge-facing case file anchored to confirmed NISAR coverage in Pakistan; new AOIs can be added from the catalog.',
    frames: pakistanFrames,
    source: 'NASA CMR / ASF Vertex',
    accent: 'teal'
  },
  {
    id: 'indus-water-mask',
    title: 'Indus water mask',
    subtitle: 'OPERA DSWx-S1 repeat passes',
    description: 'A Pakistan water-focused case file using real Sentinel-1-derived OPERA surface-water browse previews.',
    frames: pakistanWaterFrames,
    source: 'NASA OPERA DSWx-S1',
    accent: 'teal'
  },
  {
    id: 'pakistan-vegetation-pulse',
    title: 'Green pulse across Pakistan',
    subtitle: 'MODIS NDVI seasonal context',
    description: 'Three real NASA vegetation-index scenes for reading crop, wetland, and forest seasonality without overclaiming tree loss.',
    frames: pakistanVegetationFrames,
    source: 'NASA GIBS / MODIS Terra',
    accent: 'lime'
  },
  {
    id: 'pakistan-thermal-field',
    title: 'Heat field',
    subtitle: 'MODIS daytime land-surface temperature',
    description: 'A national thermal timeline for heat-stress context around cities, irrigated corridors, and drylands.',
    frames: pakistanThermalFrames,
    source: 'NASA GIBS / MODIS Terra',
    accent: 'orange'
  },
  {
    id: 'pakistan-fire-watch',
    title: 'Thermal anomaly watch',
    subtitle: 'VIIRS 375 m screening layer',
    description: 'Two real VIIRS anomaly layers that let students inspect where thermal detections appear and why they need corroboration.',
    frames: pakistanFireFrames,
    source: 'NASA GIBS / VIIRS NOAA-20',
    accent: 'red'
  },
  {
    id: 'brazil-water-fallback',
    title: 'Historical flood fallback',
    subtitle: 'OPERA DSWx-S1 water masks',
    description: 'A labeled Sentinel-1/OPERA flood case used to demonstrate historical surface-water mapping before Pakistan NISAR scenes.',
    frames: brazilFrames,
    source: 'NASA OPERA DSWx',
    accent: 'orange'
  }
];

export function getSimulation(id) {
  return simulations.find((simulation) => simulation.id === id) ?? simulations[0];
}
