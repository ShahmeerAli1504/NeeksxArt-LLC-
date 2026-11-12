-- Run once in Supabase → SQL Editor. Safe to run again.
-- Records whether each online order's emails went out (shown on Dashboard → Payments).
-- { owner: { status: sent|failed|not_configured, at }, customer: { status, to, at } }
alter table public.shop_orders add column if not exists emails jsonb;
-- make the website's API see the new column right away
notify pgrst, 'reload schema';
