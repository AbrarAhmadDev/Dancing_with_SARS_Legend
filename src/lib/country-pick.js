import world from '../data/world.json';

/**
 * Inverse of globe-model latLonToPosition (Y-up sphere).
 * x = -r sinφ cosθ, y = r cosφ, z = r sinφ sinθ
 * with φ = (90-lat)°, θ = (lon+180)°
 */
export function vectorToLatLon(point, radius = 1) {
  const x = point.x / radius;
  const y = point.y / radius;
  const z = point.z / radius;
  const phi = Math.acos(Math.max(-1, Math.min(1, y)));
  const theta = Math.atan2(z, -x);
  let lat = 90 - (phi * 180) / Math.PI;
  let lon = (theta * 180) / Math.PI - 180;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  return { lat, lon };
}

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > lat !== yj > lat
      && lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon, lat, coordinates) {
  if (!coordinates?.length) return false;
  if (!pointInRing(lon, lat, coordinates[0])) return false;
  for (let h = 1; h < coordinates.length; h += 1) {
    if (pointInRing(lon, lat, coordinates[h])) return false;
  }
  return true;
}

export function findCountryAt(lat, lon) {
  for (const feature of world.features) {
    const { type, coordinates } = feature.geometry;
    let hit = false;
    if (type === 'Polygon') hit = pointInPolygon(lon, lat, coordinates);
    else if (type === 'MultiPolygon') hit = coordinates.some((poly) => pointInPolygon(lon, lat, poly));
    if (hit) {
      return {
        name: feature.properties?.name || 'Unknown',
        code: feature.properties?.code || '',
        lat,
        lon,
      };
    }
  }
  return null;
}

const countryExtraCache = new Map();

/** Optional RestCountries enrichment (public API, no key). */
export async function loadCountryExtra(code) {
  if (!code) return null;
  if (countryExtraCache.has(code)) return countryExtraCache.get(code);
  try {
    const base = import.meta.env.DEV ? '/api/restcountries' : 'https://restcountries.com';
    const response = await fetch(`${base}/v3.1/alpha/${encodeURIComponent(code)}?fields=name,capital,region,population,area`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const extra = {
      official: data?.name?.official || null,
      capital: Array.isArray(data?.capital) ? data.capital[0] : null,
      region: data?.region || null,
      population: data?.population ?? null,
      area: data?.area ?? null,
    };
    countryExtraCache.set(code, extra);
    return extra;
  } catch {
    countryExtraCache.set(code, null);
    return null;
  }
}
