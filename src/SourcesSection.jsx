import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import CountryCatalogPanel from './CountryCatalogPanel';
import { countries, withLatestCatalog } from './atlas-model';
import './sources-section.css';

const LATEST_DAYS = 14;

export default function SourcesSection() {
  const [countryId, setCountryId] = useState('japan');
  const [windowMode, setWindowMode] = useState('latest');
  const base = countries.find((c) => c.id === countryId) ?? countries[0];
  const country = useMemo(
    () => (windowMode === 'latest' ? withLatestCatalog(base, LATEST_DAYS) : base),
    [base, windowMode],
  );

  return (
    <section className="sources-section content-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LIVE SOURCES</span>
          <h2>Current ASF and Earthdata scenes</h2>
          <p>
            Pull the latest public catalog metadata for Japan or Brazil. Use these granules to ground
            visualization—Atlas demos stay illustrative.
          </p>
        </div>
        <div className="cache-pill">
          <span /> Live API · metadata
        </div>
      </div>

      <div className="sources-rail">
        <article>
          <span className="rail-label">ENDPOINT 01</span>
          <h3>ASF Search</h3>
          <p>Sentinel-1 GRD scenes with footprints and browse for the selected bbox and time window.</p>
          <a href="https://search.asf.alaska.edu/#/" target="_blank" rel="noreferrer">
            asf.alaska.edu <ExternalLink size={12} />
          </a>
        </article>
        <article>
          <span className="rail-label">ENDPOINT 02</span>
          <h3>NASA CMR</h3>
          <p>Earthdata granules (Sentinel-1A, VIIRS anomalies) for the same window—real links, not invented extents.</p>
          <a href="https://search.earthdata.nasa.gov/search" target="_blank" rel="noreferrer">
            search.earthdata.nasa.gov <ExternalLink size={12} />
          </a>
        </article>
      </div>

      <div className="sources-controls" role="group" aria-label="Catalog filters">
        <div className="sources-country" role="group" aria-label="Country">
          {countries.map((item) => (
            <button
              key={item.id}
              type="button"
              className={countryId === item.id ? 'is-active' : ''}
              onClick={() => setCountryId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="sources-window" role="group" aria-label="Time window">
          <button
            type="button"
            className={windowMode === 'latest' ? 'is-active' : ''}
            onClick={() => setWindowMode('latest')}
          >
            Latest {LATEST_DAYS} days
          </button>
          <button
            type="button"
            className={windowMode === 'event' ? 'is-active' : ''}
            onClick={() => setWindowMode('event')}
          >
            Event · {base.date}
          </button>
        </div>
      </div>

      <CountryCatalogPanel key={`${country.id}-${windowMode}-${country.catalog.temporal[0]}`} country={country} />

      <div className="sources-method">
        <h3>Reading rules</h3>
        <ul>
          <li>Latest window for current coverage; Event window for the 2019 reference cases.</li>
          <li>Open catalog links and check browse before drawing flood or fire layers.</li>
          <li>Restricted product downloads still need Earthdata Login.</li>
        </ul>
      </div>
    </section>
  );
}
