-- =========================================================
-- NeeksxArt: November 2026 update
-- Run once in Supabase → SQL Editor → New query → Run. Safe to run again.
-- Adds: the live pop-up switch, customer reviews and the 4-photos-per-product manager.
-- (Online checkout orders: run supabase/shop-orders.sql too, if you haven't yet.)
-- =========================================================
create extension if not exists pgcrypto;

-- ---------- Site settings (live pop-up on/off) ----------
create table if not exists public.site_settings (
  key         text primary key,                 -- 'popup'
  value       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

-- ---------- Reviews (written on the website, or added from Yelp's "Embed review" code) ----------
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  source          text not null default 'site' check (source in ('site', 'yelp')),
  status          text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  name            text not null,
  rating          smallint check (rating between 1 and 5),
  body            text,
  product         text,
  yelp_review_id  text unique,
  yelp_url        text,
  yelp_biz_url    text
);
create index if not exists reviews_status_idx on public.reviews (status, created_at desc);

-- ---------- Product photos (exactly 4 per product, replaced from the dashboard) ----------
create table if not exists public.product_photos (
  product_id  text not null,                    -- id from lib/catalog.js, e.g. mag25
  slot        smallint not null check (slot between 1 and 4),
  path        text not null,                    -- site-media bucket, products/<id>/…
  thumb_path  text,
  updated_at  timestamptz not null default now(),
  primary key (product_id, slot)
);

-- only the server (service-role key) can read/write these
alter table public.site_settings enable row level security;
alter table public.reviews enable row level security;
alter table public.product_photos enable row level security;
