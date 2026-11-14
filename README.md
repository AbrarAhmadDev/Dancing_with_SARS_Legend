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

## Data policy

Live data adapters are intentionally not enabled in this first commit. Credentials must be supplied through deployment secrets, never committed to Git.
