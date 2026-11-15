import { afterEach, describe, expect, it, vi } from 'vitest';
import { countries } from '../atlas-model';
import { loadCountryCatalog, searchAsfCatalog, searchCmrCatalog } from './nasa-catalog';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('nasa-catalog', () => {
  it('maps ASF jsonlite results into display cards', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [{
          sceneName: 'S1A_TEST_SCENE',
          fileName: 'S1A_TEST_SCENE.zip',
          dataset: 'Sentinel-1A',
          startTime: '2019-10-12T00:00:00Z',
          stopTime: '2019-10-12T00:01:00Z',
          browse: ['https://example.test/browse.jpg'],
          downloadUrl: 'https://example.test/product.zip',
          beamMode: 'IW',
          flightDirection: 'ASCENDING',
          polarization: 'VV+VH',
          fileID: 'file-1',
        }],
      }),
    })));

    const rows = await searchAsfCatalog(countries[0]);
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe('ASF');
    expect(rows[0].title).toBe('S1A_TEST_SCENE');
    expect(rows[0].browse).toContain('browse.jpg');
  });

  it('maps CMR granule feed entries into display cards', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        feed: {
          entry: [{
            id: 'G123',
            producer_granule_id: 'VNP14IMG.A2019213.0342',
            dataset_id: 'VIIRS/NPP Active Fires',
            time_start: '2019-08-01T03:42:00.000Z',
            links: [
              { rel: 'http://esipfed.org/ns/fedsearch/1.1/browse#', href: 'https://example.test/fire.jpg' },
              { rel: 'http://esipfed.org/ns/fedsearch/1.1/data#', href: 'https://example.test/fire.nc' },
            ],
          }],
        },
      }),
    })));

    const rows = await searchCmrCatalog(countries[1]);
    expect(rows[0].source).toBe('CMR');
    expect(rows[0].title).toBe('VNP14IMG.A2019213.0342');
    expect(rows[0].browse).toContain('fire.jpg');
  });

  it('returns partial results when one catalog fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).includes('asf') || String(url).includes('search/param')) {
        return { ok: false, status: 500 };
      }
      return {
        ok: true,
        json: async () => ({ feed: { entry: [{ id: 'G1', producer_granule_id: 'ok', dataset_id: 'CMR', time_start: '2019-08-01T00:00:00Z', links: [] }] } }),
      };
    }));

    const result = await loadCountryCatalog(countries[1]);
    expect(result.cmr).toHaveLength(1);
    expect(result.asf).toHaveLength(0);
    expect(result.errors[0]).toMatch(/ASF/);
  });
});
