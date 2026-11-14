# Pakistan Surface Pulse — Product and Data Plan

## Product idea

**Pakistan Surface Pulse** is an evidence-first map for reading how water, vegetation, and built surfaces change over time. The central story is the Indus system: the same map can move from a monsoon floodplain to the Indus Delta mangroves, while the interface explains what radar can actually tell us.

The product should feel like a compact mission-control desk rather than a slideshow:

- Pakistan is the default map extent.
- Every visible change has a date, sensor, product, polarization, maturity, and source link.
- The user can jump between districts, scrub through an uneven historical timeline, and compare two dates with a synchronized map.
- A bilingual Urdu/English teaching layer turns radar interpretation into a short interactive quiz.

The strongest differentiator is **honest interpretation**: “water detected” and “radar signal changed” are shown as evidence; “deforestation” or “damage” is only used when a second dataset supports that conclusion.

## Recommended study areas

### 1. Indus Floodplain — primary story

Start with a district-level atlas covering the Indus and major tributaries:

- Sindh: Sukkur, Larkana, Dadu, Thatta, Sujawal, Badin
- Punjab: Rajanpur, Muzaffargarh, Rahim Yar Khan
- KP: Swat/Kabul River as a contrasting valley setting

The first polished scene should be a smaller, high-quality AOI around the Indus Delta or lower Sindh. It gives the judges a recognizable Pakistani place, floodplain/wetland dynamics, and a clear water-to-community story.

### 2. Indus Delta Mangroves — water + vegetation story

Use the delta as the second scene instead of calling every vegetation signal “deforestation.” The product can show:

- surface-water and inundated-vegetation masks;
- HH/HV or available NISAR covariance channels;
- radar signal change in mangrove edges;
- context from land cover and coastal boundaries.

The interpretation label should be **mangrove radar response change** until a forest-loss dataset and validation support a stronger claim.

### 3. Optional bonus scene — KP forest/landslide corridor

Add Swat, Dir, or another forested valley only after coverage and cloud-free/context data are verified. The first version should show “forest disturbance signal” and “possible slope/soil change,” not definitive illegal logging or landslide damage without corroboration.

## Data strategy

### NISAR-first current observations

- **NISAR L2 GCOV**: primary radar evidence for land-surface response, vegetation structure, inundation context, and crop/land-surface comparisons. GCOV is calibrated, terrain-corrected backscatter and is available at 10–20 m pixel spacing depending on location and acquisition mode.
- **NISAR L2 GSLC**: optional amplitude layer for advanced users and future interferometric workflows.
- **NISAR GUNW/GOFF**: future earthquake/subsidence extension; do not add until a Pakistan AOI has two compatible acquisitions and a clean validation story.
- **NISAR DSWx-NI**: preferred future water mask when the product and AOI are available.

ASF documentation describes global L-band acquisition on a regular repeat cycle, and GCOV supports inundation mapping, disturbance detection, biomass-related analysis, soil moisture, and crop delineation. NISAR GCOV cycles are 12 days, but actual usable coverage must be queried per AOI.

### Historical and emergency continuity

NISAR cannot provide a 2010/2022 historical flood archive. Use a transparent fallback layer:

- **OPERA DSWx-S1 / Sentinel-1** for near-global 30 m water masks and roughly 6–12 day radar cadence.
- **OPERA DSWx-HLS** for optical context at roughly 3-day cadence, with cloud limitations.
- **PDMA Sindh / NDMA historic extents** for official Pakistani disaster context and historical event labels.
- **ESA WorldCover or another land-cover baseline** for water, mangrove, cropland, and built-area context.
- **Global Forest Watch** only as a supplementary annual tree-cover-loss cross-check; never replace the radar evidence with it.

The UI must label each timeline item as `NISAR`, `Sentinel-1/OPERA`, `HLS optical`, or `official context`. It must not create a synthetic daily image to fill an acquisition gap.

### Coverage gate before implementation

The first data script should search Vertex/ASF for each Pakistan AOI and output a machine-readable catalog:

```json
{
  "aoi": "indus-delta",
  "country": "Pakistan",
  "results": [
    {
      "acquired": "2026-08-22T...",
      "mission": "NISAR",
      "product": "GCOV",
      "maturity": "PROVISIONAL",
      "polarizations": ["HHHH", "HVHV"],
      "track": "...",
      "download": "..."
    }
  ]
}
```

The script should also write `coverage-status.json` with `confirmed`, `partial`, or `fallback-required`. The interface can then show the truth to the user instead of pretending that Pakistan has a complete uniform NISAR timeline.

## Interaction design

### Four top-level tabs

1. **Atlas** — Pakistan map, selectable AOIs, disaster cards, timeline, and local-cache status.
2. **Compare** — synchronized before/after maps, swipe mode, opacity controls, polarization/product toggles, and a “what changed?” explanation.
3. **Change signals** — water, inundated vegetation, forest/mangrove response, crop/soil moisture cues, and the evidence grade for each signal.
4. **Radar classroom** — Urdu/English quiz, before/after questions, “what to look for,” and “do/don’t infer” feedback.

The existing cached simulations should become presets inside the Atlas tab, renamed as **case files**:

- Indus Floodplain — current NISAR/OPERA mix
- Sindh Historical Floods — official extents + Sentinel-1/OPERA
- Indus Delta Mangrove Pulse — NISAR covariance + land-cover context
- KP Forest Edge — only after coverage validation

### Atlas screen

- Full-width MapLibre map of Pakistan with an AOI drawer.
- Hotspot chips: `Indus floodplain`, `Indus Delta`, `Karachi urban water`, `KP forest edge`.
- Timeline that is proportional to real dates and visually marks gaps.
- A small “evidence rail” under the map: product, sensor, polarization, maturity, cloud/validity note, and source link.
- Layer opacity, context toggle, terrain/land-cover toggle, and CSV/GeoJSON export.
- Local cache indicator: “Bundled 8 scenes · 2.4 GB” or the real measured value.

### Compare screen

- Default selection: first and last valid observation for the active AOI.
- Synchronized pan/zoom for both maps.
- Swipe divider and side-by-side modes.
- Date/product cards above each map.
- A concise interpretation panel:
  - **Observed:** water mask increased/decreased between dates.
  - **Supporting evidence:** NISAR/OPERA channel, polarization, and valid pixels.
  - **Do not infer:** exact damage, crop yield, or tree loss without corroboration.

### Change Signals screen

Use four stable signal families rather than decorative “AI scores”:

- **Water:** open water and inundated vegetation classes.
- **Vegetation structure:** HH/HV change or available covariance ratios.
- **Forest/mangrove response:** radar signal change cross-checked against forest/land-cover data.
- **Soil/crop response:** moisture/roughness cue with a confidence note, not a crop-health diagnosis.

Each card should show `signal`, `evidence`, `time span`, `confidence`, and `caveat`. Confidence is a data-quality grade based on number of valid observations, product maturity, polarization availability, and agreement with a supplemental layer—not a claim that a machine has discovered ground truth.

### Radar Classroom

Quiz JSON should contain:

- English and Urdu question text;
- before/after images or map states;
- 3 answer choices;
- correct explanation;
- “do” and “don’t” inference text;
- source citation.

Example: “The blue area expanded after the monsoon pass. What is the safest conclusion?” Correct answer: “Surface-water extent is larger in the observed radar-derived mask.” Do not say that a specific number of homes was damaged unless an official damage layer supports it.

## Visual direction

Use the supplied reference project for interaction inspiration, not for copied branding or claims. The design language should be:

- dark operational workspace;
- a strong readable map as the hero;
- compact top navigation with four modes;
- a left “what to look for” rail;
- bottom time-series/evidence rail;
- one accent per signal family: blue water, green vegetation, amber soil/crop, red/orange built/alert;
- restrained motion only when the user changes date, opacity, or comparison position.

The map should always have geographic context: district/river labels, north arrow, scale, attribution, AOI outline, and a coordinate readout. The radar layer should be translucent and aligned, not a floating opaque rectangle.

## Delivery phases and tests

### Phase 0 — Pakistan coverage audit

Build `scripts/fetch-pakistan-coverage.mjs` or a Python equivalent. Query Vertex/CMR for the four candidate AOIs, date windows, products, maturity, polarization, and track/frame. Save a catalog and produce a short coverage report.

**Gate:** at least one Pakistan AOI has two or more usable NISAR observations. If not, mark the AOI fallback-required and use Sentinel-1/OPERA while preserving NISAR in a separate confirmed scene.

**Test:** catalog schema, deduplication, date sorting, AOI labels, and no unsupported “NISAR” label on fallback scenes.

### Phase 1 — Analysis-ready data package

Download only clipped AOIs. Convert to Cloud-Optimized GeoTIFF/PNG previews, JSON metadata, GeoJSON boundaries, and a provenance manifest. Generate HH/HV dB thumbnails and a normalized difference/change layer only when the pair is compatible.

**Test:** raster dimensions, CRS, nodata handling, valid-pixel percentage, date/product metadata, and checksum manifest.

### Phase 2 — Pakistan Atlas

Replace the single Brazil flood story with a Pakistan map and case-file catalog. Add district/AOI selection, timeline, cache manifest, map attribution, layer toggles, and bilingual labels.

**Test:** selecting each AOI updates all panels; timeline never invents dates; language toggle preserves state; offline bundle still opens.

### Phase 3 — Compare and Change Signals

Add synchronized dual maps, swipe mode, polarization/product controls, evidence grades, and the four signal families. Keep all values derived from the processed data and expose the formula/method in a report drawer.

**Test:** synchronized pan/zoom, first/last defaults, compare-date ordering, no-data state, and export content.

### Phase 4 — Radar Classroom

Add the Urdu/English quiz, before/after questions, explanations, do/don’t feedback, and a final “what did you learn?” summary.

**Test:** answer state, keyboard navigation, screen-reader labels, language switching, and source links.

### Phase 5 — Hackathon polish

Add a 60-second guided story mode (a guided tour, not a fake daily animation), judge-facing scientific report, README screenshots, and a “Data honesty” panel. Test on 320 px mobile width and a laptop projector resolution.

**Release gate:** CI passes, data provenance is visible, no secret appears in the bundle, no broken image, no unlabelled fallback sensor, and the production deployment is reproducible from the repository.

## Research anchors

- [ASF NISAR Vertex guide](https://nisar-docs.asf.alaska.edu/vertex/)
- [NISAR mission and repeat coverage](https://nisar-docs.asf.alaska.edu/nisar-intro/)
- [NISAR GCOV product guide](https://nisar-docs.asf.alaska.edu/gcov/)
- [NISAR product overview and current data maturity](https://nisar-docs.asf.alaska.edu/products-overview/)
- [NASA OPERA DSWx fact sheet](https://www.earthdata.nasa.gov/s3fs-public/2024-04/OPERA-DSWx_Fact_Sheet.pdf)
- [PDMA Sindh GIS maps](https://pdma.gos.pk/gis-maps/)
- [PDMA Sindh flood 2022 maps](https://pdma.gos.pk/flood-2022-maps/)
- [PDMA Sindh disaster information system](https://dmis.pdma.gos.pk/DMIS/dashboard.php)
