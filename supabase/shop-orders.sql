-- Run once in Supabase → SQL Editor (also included in schema.sql). Safe to run again.
create extension if not exists pgcrypto;

-- ---------- Online shop orders (checkout → Square; demo mode until Square is connected) ----------
create table if not exists public.shop_orders (
  id             uuid primary key default gen_random_uuid(),
  order_no       text not null unique,                       -- NXS-XXXX, shown on the receipt
  created_at     timestamptz not null default now(),
  status         text not null default 'new'
                 check (status in ('new', 'in_production', 'ready', 'completed', 'cancelled')),
  payment_status text not null default 'paid'
                 check (payment_status in ('paid', 'deposit', 'refunded')),
  demo           boolean not null default true,              -- true = test payment, no card charged
  customer       jsonb not null,                             -- { name, email, phone }
  fulfillment    jsonb not null,                             -- { method, label, address, explain[], weight_oz }
  items          jsonb not null,                             -- priced lines from lib/checkout.js
  tax_label      text,
  amounts        jsonb not null,                             -- cents: subtotal, delivery, tax, total, paid, balance, fees, net
  payments       jsonb not null default '[]',                -- [{ kind: charge|balance|refund, id, amount, fee, brand, last4, at }]
  note           text
);
create index if not exists shop_orders_created_idx on public.shop_orders (created_at desc);
alter table public.shop_orders enable row level security;
