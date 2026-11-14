import fs from 'node:fs';

const file = 'data/catalog/pakistan-coverage.json';
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
if (catalog.query.mission !== 'NISAR') throw new Error('Coverage catalog is not NISAR');
if (!catalog.aois?.length) throw new Error('No Pakistan AOIs found');
for (const aoi of catalog.aois) {
  if (!['confirmed', 'fallback-required'].includes(aoi.status)) throw new Error(`${aoi.id}: invalid status`);
  if (!Array.isArray(aoi.uniqueDates)) throw new Error(`${aoi.id}: missing unique dates`);
  for (const list of Object.values(aoi.products)) {
    for (const item of list) {
      if (!item.id || !item.title || Number.isNaN(Date.parse(item.acquired))) throw new Error(`${aoi.id}: invalid granule`);
    }
  }
}
console.log(`Validated Pakistan coverage for ${catalog.aois.length} AOIs`);
