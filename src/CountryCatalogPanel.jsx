import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Satellite, Database } from 'lucide-react';
import { loadCountryCatalog } from './lib/nasa-catalog';
import './catalog.css';

function ResultCard({ item }) {
  return (
    <article className="catalog-card">
      {item.browse ? <img src={item.browse} alt="" loading="lazy" /> : <div className="catalog-card-fallback" aria-hidden />}
      <div>
        <small>{item.source} · {item.start}</small>
        <strong>{item.title}</strong>
        <p>{item.dataset}</p>
        {item.detail && <p className="catalog-detail">{item.detail}</p>}
        <div className="catalog-card-links">
          <a href={item.catalogUrl} target="_blank" rel="noreferrer">Open catalog <ExternalLink size={12} /></a>
          {item.productUrl && <a href={item.productUrl} target="_blank" rel="noreferrer">Product link <ExternalLink size={12} /></a>}
        </div>
      </div>
    </article>
  );
}

export default function CountryCatalogPanel({ country }) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null });

  useEffect(() => {
    if (!country?.catalog) return undefined;
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    loadCountryCatalog(country, { signal: controller.signal, maxResults: 6, pageSize: 6, catalog: country.catalog })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: 'ready', data, error: data.errors.length ? data.errors.join(' · ') : null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', data: null, error: error.message || 'Catalog request failed' });
      });

    return () => controller.abort();
  }, [country?.id, country?.catalog?.temporal?.[0], country?.catalog?.temporal?.[1], country?.catalog?.note]);

  function reload() {
    setState((current) => ({ ...current, status: 'loading', error: null }));
    loadCountryCatalog(country, { maxResults: 6, pageSize: 6, catalog: country.catalog })
      .then((data) => setState({ status: 'ready', data, error: data.errors.length ? data.errors.join(' · ') : null }))
      .catch((error) => setState({ status: 'error', data: null, error: error.message || 'Catalog request failed' }));
  }

  const asf = state.data?.asf ?? [];
  const cmr = state.data?.cmr ?? [];

  return (
    <section className="country-catalog" aria-label={`${country.name} satellite catalog results`}>
      <div className="catalog-heading">
        <div>
          <span className="workspace-kicker">CATALOG · {country.name.toUpperCase()}</span>
          <h3>ASF and CMR results</h3>
          <p>{country.catalog.note}</p>
        </div>
        <button type="button" className="catalog-refresh" onClick={reload} disabled={state.status === 'loading'}>
          <RefreshCw size={14} /> {state.status === 'loading' ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="catalog-query">
        <span>BBOX {country.catalog.bbox.join(', ')}</span>
        <span>{country.catalog.temporal[0].slice(0, 10)} → {country.catalog.temporal[1].slice(0, 10)}</span>
        <a href="https://search.asf.alaska.edu/#/" target="_blank" rel="noreferrer">ASF Vertex</a>
        <a href="https://search.earthdata.nasa.gov/search" target="_blank" rel="noreferrer">Earthdata Search</a>
      </div>

      {state.status === 'loading' && <p className="catalog-status">Querying ASF Search API and NASA CMR…</p>}
      {state.status === 'error' && <p className="catalog-status is-error">{state.error}</p>}
      {state.status === 'ready' && state.error && <p className="catalog-status is-warn">Partial success. {state.error}</p>}

      {state.status === 'ready' && (
        <div className="catalog-columns">
          <div>
            <h4><Satellite size={15} /> {country.catalog.asf.label} <small>{asf.length}</small></h4>
            {asf.length === 0 ? <p className="catalog-empty">No ASF scenes in this window.</p> : asf.map((item) => <ResultCard key={item.id} item={item} />)}
          </div>
          <div>
            <h4><Database size={15} /> {country.catalog.cmr.label} <small>{cmr.length}</small></h4>
            {cmr.length === 0 ? <p className="catalog-empty">No CMR granules in this window.</p> : cmr.map((item) => <ResultCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      <p className="catalog-footnote">
        Search metadata is public. Downloading restricted products still requires an Earthdata Login.
        Browse images and product URLs come from the APIs; they are not invented locally.
      </p>
    </section>
  );
}
