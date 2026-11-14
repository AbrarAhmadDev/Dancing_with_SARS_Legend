create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  observed_at timestamptz not null,
  sensor text not null,
  product text not null,
  source_url text not null,
  maturity text,
  polarization text,
  water_extent_pct numeric,
  rainfall_index numeric,
  asset_url text,
  quality_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists observations_event_date_idx on public.observations(event_slug, observed_at);
alter table public.observations enable row level security;
create policy "public observations are readable" on public.observations for select using (true);
