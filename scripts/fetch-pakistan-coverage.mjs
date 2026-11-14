import fs from 'node:fs/promises';
import path from 'node:path';

const start = process.env.PAKISTAN_COVERAGE_START ?? '2026-06-17T00:00:00Z';
const end = process.env.PAKISTAN_COVERAGE_END ?? '2026-10-31T23:59:59Z';
const cmr = 'https://cmr.earthdata.nasa.gov/search';
const output = path.resolve('data/catalog/pakistan-coverage.json');

const aois = [
  { id: 'indus-delta', label: 'Indus Delta', bbox: '66,23,68,25' },
  { id: 'lower-sindh', label: 'Lower Sindh floodplain', bbox: '66.5,24,68.5,26.5' },
  { id: 'kp-forest', label: 'KP forest corridor', bbox: '71,34,73,35.5' },
  { id: 'punjab-floodplain', label: 'Punjab Indus floodplain', bbox: '70,28,71.5,30.5' }
];

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

const collections = await getJson(`${cmr}/collections.json?keyword=NISAR%20L2%20GCOV&page_size=50`);
const wanted = collections.feed.entry.filter((entry) => ['NISAR_L2_GCOV_PROVISIONAL_V1', 'NISAR_L2_GCOV_V1', 'NISAR_L2_GCOV_BETA_V1'].includes(entry.short_name));
const collectionIds = Object.fromEntries(wanted.map((entry) => [entry.short_name, entry.id]));

const results = [];
for (const aoi of aois) {
  const products = {};
  for (const [maturity, conceptId] of Object.entries(collectionIds)) {
    const query = new URL(`${cmr}/granules.json`);
    query.searchParams.set('collection_concept_id', conceptId);
    query.searchParams.set('bounding_box', aoi.bbox);
    query.searchParams.set('temporal', `${start},${end}`);
    query.searchParams.set('page_size', '200');
    query.searchParams.set('sort_key', 'start_date');
    const feed = await getJson(query);
    products[maturity] = feed.feed.entry.map((item) => ({
      id: item.id,
      title: item.title,
      acquired: item.time_start,
      browse: item.links.find((link) => link.rel?.includes('browse#') && link.href?.endsWith('_LATLON.png'))?.href ?? null
    }));
  }
  const all = Object.values(products).flat().sort((a, b) => a.acquired.localeCompare(b.acquired));
  results.push({
    id: aoi.id,
    label: aoi.label,
    bbox: aoi.bbox,
    status: all.length >= 2 ? 'confirmed' : 'fallback-required',
    totalGranules: all.length,
    uniqueDates: [...new Set(all.map((item) => item.acquired.slice(0, 10)))],
    products
  });
}

const payload = {
  generatedAt: new Date().toISOString(),
  query: { start, end, mission: 'NISAR', product: 'GCOV', source: 'NASA CMR / ASF' },
  collections: collectionIds,
  aois: results
};
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${output}`);
for (const aoi of results) console.log(`${aoi.id}: ${aoi.totalGranules} granules across ${aoi.uniqueDates.length} dates (${aoi.status})`);
