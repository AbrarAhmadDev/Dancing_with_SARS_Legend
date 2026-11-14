import fs from 'node:fs/promises';
import path from 'node:path';

const serviceUrl = 'https://gis.earthdata.nasa.gov/portal/rest/services/DISASTERS_EX2602_202405_FLOOD_BRAZIL/EX2602_opera_dswx_s1/MapServer?f=json';
const response = await fetch(serviceUrl);
if (!response.ok) throw new Error(`OPERA service returned HTTP ${response.status}`);
const service = await response.json();
if (!Array.isArray(service.layers) || service.layers.length === 0) throw new Error('OPERA service returned no layers');

const output = {
  fetchedAt: new Date().toISOString(),
  serviceUrl,
  provider: 'NASA ARIA/OPERA',
  sensor: 'Sentinel-1',
  product: 'OPERA Dynamic Surface Water Extent (DSWx-S1)',
  spatialReference: service.spatialReference ?? null,
  layers: service.layers.map(({ id, name }) => ({ id, name })),
  rawDescription: service.description ?? ''
};

const destination = path.resolve('data/ingestion/brazil-flood-2024-service.json');
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Saved OPERA metadata for ${output.layers.length} layer(s) to ${destination}`);
