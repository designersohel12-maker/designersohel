import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = 'eebjummyojlyxfcolixp';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Safe public client (only initialized when publishable key is present; never uses secret key)
export const supabasePublicClient = SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

export const SUPABASE_SQL_SCHEMA = `-- Supabase Schema for MD. SOHEL RANA Portfolio
-- Project ID: eebjummyojlyxfcolixp | Region: ap-south-1

create table if not exists public.best_works (
  id text primary key,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order integer not null default 1,
  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id text primary key,
  category text not null check (category in ('motion', 'social', 'print')),
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order integer not null default 1,
  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_profile (
  id text primary key default 'main',
  hero_photo_url text not null,
  updated_at timestamptz not null default now()
);

alter table public.best_works enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.site_profile enable row level security;

create policy "Public read best_works" on public.best_works
  for select using (visibility = 'public');

create policy "Public read portfolio_projects" on public.portfolio_projects
  for select using (visibility = 'public');

create policy "Public read site_profile" on public.site_profile
  for select using (true);`;
