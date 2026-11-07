-- =========================================================
-- NeeksxArt: Supabase schema
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to run again (everything is "if not exists").
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- Website inquiries (contact form, bulk orders, event quotes, Merch Studio mockups) ----------
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  source       text not null default 'contact',            -- contact | quote
  status       text not null default 'new'
               check (status in ('new', 'replied', 'won', 'archived')),
  topic        text,
  name         text not null,
  email        text not null,
  phone        text,
  business     text,
  product      text,
  quantity     text,
  deadline     text,
  ship_to      text,
  message      text not null,
  studio       jsonb,                                       -- Merch Studio build summary [[label, value], ...]
  mockup_path  text,                                        -- customer-uploads bucket
  logo_path    text                                         -- customer-uploads bucket
);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);

-- ---------- Live pop-up orders (QR → upload photos → pressed at the booth) ----------
create table if not exists public.event_orders (
  id           uuid primary key default gen_random_uuid(),
  order_id     text not null,                               -- NX-123A, shown on the guest's ticket
  token        uuid not null default gen_random_uuid(),     -- secret the guest's phone uses to check status
  event_slug   text not null,
  status       text not null default 'uploading'
               check (status in ('uploading', 'new', 'printing', 'ready', 'picked_up', 'cancelled')),
  created_at   timestamptz not null default now(),
  submitted_at timestamptz,
  event_name   text,
  bundle_id    text,
  bundle       text,
  items        text[],
  shape        text,
  price        text,
  name         text,
  phone        text,
  email        text,
  note         text,
  photo_paths  text[] not null default '{}',                -- event-photos bucket, numbered in pack order
  sheet_path   text,                                        -- overview sheet
  unique (event_slug, order_id)
);
create index if not exists event_orders_board_idx on public.event_orders (status, submitted_at);
create index if not exists event_orders_event_idx on public.event_orders (event_slug, created_at desc);

-- Row Level Security on, with no public policies: only the server (service-role key) can read/write.
alter table public.inquiries enable row level security;
alter table public.event_orders enable row level security;

-- ---------- Storage buckets ----------
-- site-media:       all website photos & videos (public, served straight to visitors)
-- customer-uploads: logos + mockups from the contact form (private)
-- event-photos:     guest photos from live pop-ups (private, uploaded with one-time signed links)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-media', 'site-media', true, 52428800, null),
  ('customer-uploads', 'customer-uploads', false, 10485760,
     array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('event-photos', 'event-photos', false, 10485760, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;
