import { createClient } from '@supabase/supabase-js';
import { frames as fallbackFrames } from '../data';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export async function loadObservations(eventSlug) {
  if (!supabase) return { frames: fallbackFrames, source: 'local-fallback' };
  const { data, error } = await supabase
    .from('observations')
    .select('observed_at, water_extent_pct, rainfall_index, asset_url, product, sensor')
    .eq('event_slug', eventSlug)
    .order('observed_at', { ascending: true });
  if (error) throw error;
  return { frames: data ?? [], source: 'supabase' };
}
