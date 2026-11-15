/**
 * Public catalog search helpers for:
 * - ASF Search API (Vertex backend): https://docs.asf.alaska.edu/api/keywords/
 * - NASA CMR (Earthdata Search backend): https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html
 *
 * These calls return metadata / browse links. Full product download still needs Earthdata login.
 */

const CLIENT_ID = 'dancing-with-sars-flood-dashboard';

function asfBase() {
  return import.meta.env.DEV ? '/api/asf' : 'https://api.daac.asf.alaska.edu';
}

function cmrBase() {
  return import.meta.env.DEV ? '/api/cmr' : 'https://cmr.earthdata.nasa.gov';
}

function bboxPolygon([minLon, minLat, maxLon, maxLat]) {
  return `polygon((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
}

function formatWhen(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 19).replace('T', ' ') + 'Z';
}

export async function searchAsfCatalog(country, { signal, maxResults = 8, catalog } = {}) {
  const { bbox, temporal, asf } = catalog || country.catalog;
  const params = new URLSearchParams({
    platform: asf.platform,
    processingLevel: asf.processingLevel,
    intersectsWith: bboxPolygon(bbox),
    start: temporal[0],
    end: temporal[1],
    maxResults: String(maxResults),
    output: 'jsonlite',
  });

  const response = await fetch(`${asfBase()}/services/search/param?${params}`, { signal });
  if (!response.ok) throw new Error(`ASF search failed (${response.status})`);
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : payload.results ?? [];

  return rows.map((item, index) => ({
    id: item.fileID || item.sceneName || item.fileName || `asf-${index}`,
    source: 'ASF',
    title: item.sceneName || item.fileName || 'Sentinel-1 scene',
    dataset: item.dataset || item.platform || 'ASF SAR',
    start: formatWhen(item.startTime || item.startTimeAbsolute),
    stop: formatWhen(item.stopTime || item.stopTimeAbsolute),
    browse: Array.isArray(item.browse) ? item.browse[0] : item.browse || null,
    productUrl: item.downloadUrl || item.url || null,
    detail: [item.beamMode, item.flightDirection, item.polarization].filter(Boolean).join(' · '),
    catalogUrl: 'https://search.asf.alaska.edu/#/',
  }));
}

export async function searchCmrCatalog(country, { signal, pageSize = 8, catalog } = {}) {
  const { bbox, temporal, cmr } = catalog || country.catalog;
  const params = new URLSearchParams({
    bounding_box: bbox.join(','),
    temporal: `${temporal[0]},${temporal[1]}`,
    page_size: String(pageSize),
    sort_key: '-start_date',
  });
  if (cmr.platform) params.set('platform', cmr.platform);
  if (cmr.provider) params.set('provider', cmr.provider);
  if (cmr.short_name) params.set('short_name', cmr.short_name);

  const response = await fetch(`${cmrBase()}/search/granules.json?${params}`, {
    signal,
    headers: {
      Accept: 'application/json',
      'Client-Id': CLIENT_ID,
    },
  });
  if (!response.ok) throw new Error(`CMR search failed (${response.status})`);
  const payload = await response.json();
  const entries = payload?.feed?.entry ?? [];

  return entries.map((item, index) => {
    const links = Array.isArray(item.links) ? item.links : [];
    const browse = links.find((link) => /browse/i.test(link.rel || '') || /browse/i.test(link.title || ''))?.href
      || links.find((link) => /\.(jpg|jpeg|png|gif)$/i.test(link.href || ''))?.href
      || null;
    const data = links.find((link) => /data#/i.test(link.rel || '') || link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')?.href || null;

    return {
      id: item.id || item.producer_granule_id || `cmr-${index}`,
      source: 'CMR',
      title: item.producer_granule_id || item.title || 'CMR granule',
      dataset: item.dataset_id || item.collection_concept_id || 'Earthdata collection',
      start: formatWhen(item.time_start),
      stop: formatWhen(item.time_end),
      browse,
      productUrl: data,
      detail: item.summary || item.original_format || 'NASA CMR granule metadata',
      catalogUrl: 'https://search.earthdata.nasa.gov/search',
    };
  });
}

export async function loadCountryCatalog(country, options = {}) {
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || controller.signal;

  const catalog = options.catalog || country.catalog;
  const settled = await Promise.allSettled([
    searchAsfCatalog(country, { signal, maxResults: options.maxResults, catalog }),
    searchCmrCatalog(country, { signal, pageSize: options.pageSize, catalog }),
  ]);

  const asf = settled[0].status === 'fulfilled' ? settled[0].value : [];
  const cmr = settled[1].status === 'fulfilled' ? settled[1].value : [];
  const errors = [];
  if (settled[0].status === 'rejected') errors.push(`ASF: ${settled[0].reason?.message || 'request failed'}`);
  if (settled[1].status === 'rejected') errors.push(`CMR: ${settled[1].reason?.message || 'request failed'}`);

  return {
    asf,
    cmr,
    errors,
    fetchedAt: new Date().toISOString(),
    query: {
      bbox: catalog.bbox,
      temporal: catalog.temporal,
      asfLabel: catalog.asf.label,
      cmrLabel: catalog.cmr.label,
      note: catalog.note,
    },
  };
}
