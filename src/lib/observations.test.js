import { describe, expect, it } from 'vitest';
import { loadObservations, supabase } from './observations';

describe('observation adapter', () => {
  it('uses the local real-raster fallback until Supabase variables exist', async () => {
    if (supabase) return;
    const result = await loadObservations('brazil-flood-2024');
    expect(result.source).toBe('local-fallback');
    expect(result.frames.length).toBeGreaterThan(0);
  });
});
