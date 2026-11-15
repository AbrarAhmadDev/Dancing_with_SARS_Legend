# Constraints

- Terrain, spread footprints, and timing are **synthetic** — not georeferenced observations or forecasts
- Real NASA Earth Observatory images are reference-only under `public/data/references`
- No secrets in repo memory files or commits; use `.env` from `.env.example`
- CI must pass (`npm ci`, tests, validators) before deploy workflows proceed
- Do not invent disaster extents for missing observation dates
