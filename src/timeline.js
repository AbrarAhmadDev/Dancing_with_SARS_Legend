export const DEMO_DURATION_MS = 32000;

export function frameIntervalMs(frameCount) {
  return DEMO_DURATION_MS / Math.max(frameCount - 1, 1);
}
