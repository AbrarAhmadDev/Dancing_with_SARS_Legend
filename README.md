# Dancing with the SARs — Flood Pulse

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
- No service-role key is accepted by the frontend.

## Deployment authentication

The local repository is intentionally not storing credentials. Before pushing/deploying, authenticate GitHub for the local remote, then add the three Vercel secrets above in the repository's Actions settings. Supabase credentials belong in deployment environment variables and the schema should be applied through a reviewed migration. Never commit Earthdata, FIRMS, Supabase, or Vercel secrets.

## Data policy

Live data adapters are intentionally not enabled in this first commit. Credentials must be supplied through deployment secrets, never committed to Git.
