import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('data/events');
const files = fs.readdirSync(root).filter((file) => file.endsWith('.json'));
if (!files.length) throw new Error('No event catalog files found');

for (const file of files) {
  const event = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const required = ['slug', 'title', 'region', 'eventType', 'source', 'observations', 'quality'];
  for (const key of required) if (!event[key]) throw new Error(`${file}: missing ${key}`);
  if (event.eventType !== 'flood') throw new Error(`${file}: only flood events are allowed in Phase 1`);
  if (!event.source.serviceUrl.startsWith('https://')) throw new Error(`${file}: source URL must be HTTPS`);
  if (!event.source.resolutionMeters || !event.source.sensor || !event.source.product) throw new Error(`${file}: incomplete source metadata`);
  if (!event.observations.every((item) => !Number.isNaN(Date.parse(item.observedAt)))) throw new Error(`${file}: invalid observation date`);
}
console.log(`Validated ${files.length} flood event catalog file(s)`);
