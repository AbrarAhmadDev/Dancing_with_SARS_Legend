import fs from 'node:fs';
const file = 'data/ingestion/brazil-flood-2024-service.json';
const item = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!item.fetchedAt || !item.serviceUrl.startsWith('https://')) throw new Error('Missing secure fetch metadata');
if (item.provider !== 'NASA ARIA/OPERA' || item.sensor !== 'Sentinel-1') throw new Error('Unexpected provider or sensor');
if (!item.layers.some((layer) => /May 8|May 11|max extent/i.test(layer.name))) throw new Error('Expected flood observation layers are missing');
console.log(`Validated ${item.layers.length} OPERA service layers`);
