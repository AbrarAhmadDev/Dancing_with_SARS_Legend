# Surface Stories — Flood & Fire

## Current interface (15 November 2026)

The active entrypoint is `src/studio-entry.jsx`. It presents a 30-second educational sequence: 15 seconds of blue flood expansion, then 15 seconds of orange/red fire spread. Playback can be paused, scrubbed, restarted, and inspected; Compare provides independent stages and Learn provides image-based questions.

**The terrain, spread footprints, and timing are synthetic.** They are not georeferenced maps, observed flood/fire perimeters, forecasts, or NISAR analysis. Real NASA Earth Observatory images are shown separately as historical references:

- Honshu, Japan, Typhoon Hagibis: Aqua MODIS, 13 October 2019. [NASA report](https://science.nasa.gov/earth/earth-observatory/hagibis-floods-japan-145736/).
- Brazilian Amazon, South America: fire-season reference, 11 August 2019. [NASA report](https://science.nasa.gov/earth/earth-observatory/fires-in-brazil-145464/).

Reference images are bundled under `public/data/references` and require no API key. Deterministic local rendering makes repeat playback independent of network requests. It does not cache or download a real time-series dataset.

### Geographic audit

Earlier Pakistan views have been withdrawn from the active interface. A GIBS WMS 1.3.0 request with EPSG:4326 used longitude-first coordinates despite that CRS requiring latitude-first BBOX order. National previews were also used under local labels without verified registration. The previous assets remain in the repository for audit; they must not be interpreted as spatially validated evidence. See the Sources tab for the correction.

### Verify this release

Run `npm test`, `npm run build`, `npm run validate:data`, and `npm run validate:ingestion`. The spread tests verify chapter boundaries and monotonically expanding, deterministic footprints. Browser checks cover playback, scrubbing, scene selection, comparison, and quiz feedback. These checks validate application behavior, **not scientific accuracy of a disaster reconstruction**.

To resume measured analysis, verify each asset's bounds, CRS, acquisition timestamp, sensor, nodata mask, and alignment before publishing a location. Missing observations must remain gaps rather than invented dates.

---

## Archived implementation notes

The notes below describe earlier iterations and ingestion infrastructure, not capabilities of the current active interface.

This repository contains the first safe prototype for the NASA Space Apps “Dancing with the SARs” challenge.

## Current milestone

- Interactive flood-event timeline.
- Play full demo and reset controls.
- Deterministic illustrative frames for baseline, inundation, peak, and recovery.
- `localStorage` cache for instant replay.
- Explicit demo labeling; no synthetic frame is presented as real satellite evidence.
- Supabase observation schema ready for NISAR, Sentinel-1, and OPERA DSWx-S1 ingestion.
- GitHub Actions build verification.
- Deployment workflow gated on a successful CI run; it requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` GitHub Actions secrets.
- Phase 1 catalog entry for the NASA ARIA/OPERA Brazil flood event, with validation of source and observation metadata.
- Phase 2 OPERA service metadata snapshot with the real May 8, May 11, and maximum-extent layers.
- Phase 4 Supabase observation adapter with a safe local-raster fallback when deployment variables are absent.

## Run locally

```bash
npm install
npm run dev
```

## Delivery phases

1. Science scope and study area: verify coverage and sources.
2. Data catalog: ingest STAC metadata and preserve maturity/quality flags.
3. Processing: subset to AOI and create web-ready COGs/statistics.
4. Backend: load metadata and observations into Supabase.
5. Frontend: connect real observations and map tiles.
6. Validation: compare flood extents with known events and inspect false positives.
7. Deployment: GitHub Actions gates builds before Vercel deployment.

Each phase must pass its test checklist before the next phase begins.

### Phase 1 test gate

- `npm run validate:data` passes.
- Every event has HTTPS source metadata, sensor, product, resolution, dates, and limitations.
- No imagery is treated as observed until the ingestion phase downloads and records the source asset.

### Phase 2 test gate

- `npm run fetch:opera` retrieves NASA’s public service metadata.
- `npm run validate:ingestion` confirms the expected dated layers exist.
- The source description and limitations remain stored with the snapshot.

### Phase 4 test gate

- With no Supabase variables, the app remains usable using the real local OPERA previews.
- With `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, observations are queried by event slug.

## Environment setup

1. Copy the local template if needed: `cp .env.example .env.local`.
2. In Supabase, open **Project Settings → Data API** and copy the Project URL into `VITE_SUPABASE_URL`.
3. Copy the browser-safe **anon/public** key into `VITE_SUPABASE_ANON_KEY`. Never use a Supabase service-role key in a `VITE_` variable.
4. Keep `NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD`, and `FIRMS_MAP_KEY` for server-side ingestion scripts only. They are currently optional for the static dashboard.
5. Run `npm run dev` and verify the app locally.

### GitHub Actions → Vercel secrets

For the production deployment workflow, add these as repository or `production` environment secrets in GitHub (**Settings → Secrets and variables → Actions → New repository secret**):

- `VERCEL_TOKEN`: create a Vercel access token under **Account Settings → Tokens**.
- `VERCEL_ORG_ID`: the Vercel team/owner ID.
- `VERCEL_PROJECT_ID`: the project ID from Vercel project settings.

Do not paste these tokens into chat, source files, commits, screenshots, or browser-visible `VITE_` variables. If a token is ever exposed, revoke it and create a replacement immediately.
- No service-role key is accepted by the frontend.

## Deployment authentication

The local repository is intentionally not storing credentials. Before pushing/deploying, authenticate GitHub for the local remote, then add the three Vercel secrets above in the repository's Actions settings. Supabase credentials belong in deployment environment variables and the schema should be applied through a reviewed migration. Never commit Earthdata, FIRMS, Supabase, or Vercel secrets.

## Data policy

Live data adapters are intentionally not enabled in this first commit. Credentials must be supplied through deployment secrets, never committed to Git.
