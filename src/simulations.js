import { frames } from './data';

export const simulations = [
  {
    id: 'combined-event',
    title: 'Combined event',
    subtitle: 'HLS + Sentinel-1 observations',
    description: 'The complete local case file, from baseline water through the maximum observed extent.',
    frames,
    source: 'NASA OPERA DSWx',
    accent: 'purple'
  },
  {
    id: 'optical-first-look',
    title: 'Optical first-look',
    subtitle: 'Cloud-aware HLS passes',
    description: 'Two optical observations that establish the early event context before radar confirmation.',
    frames: frames.filter((frame) => frame.product === 'DSWx-HLS'),
    source: 'NASA OPERA DSWx-HLS',
    accent: 'teal'
  },
  {
    id: 'radar-confirmation',
    title: 'Radar confirmation',
    subtitle: 'Sentinel-1 passes',
    description: 'Radar observations selected for dependable change detection through cloud cover.',
    frames: frames.filter((frame) => frame.product === 'DSWx-S1'),
    source: 'NASA OPERA DSWx-S1',
    accent: 'orange'
  }
];

export function getSimulation(id) {
  return simulations.find((simulation) => simulation.id === id) ?? simulations[0];
}
