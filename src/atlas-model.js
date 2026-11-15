export const DEMO_SECONDS = 30;
export const countries = [
  { id: 'japan', code: 'JPN', name: 'Japan', region: 'Honshu', coordinates: [138, 36.5], sceneIndex: 0, type: 'Flooding', date: 'October 2019' },
  { id: 'brazil', code: 'BRA', name: 'Brazil', region: 'Amazon region', coordinates: [-63, -8], sceneIndex: 1, type: 'Fire / heat signature', date: 'August 2019' },
];
export function demoProgress(seconds) {
  return Math.max(0, Math.min(DEMO_SECONDS, seconds)) / DEMO_SECONDS;
}
export function parseRoute(hash) {
  const [section, country] = hash.replace(/^#\/?/, '').split('/');
  return {
    tab: ['atlas', 'compare', 'learn', 'sources'].includes(section) ? section : 'atlas',
    country: countries.some(c => c.id === country) ? country : 'japan',
  };
}
