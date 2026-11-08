import 'server-only';
// Online shop orders (table public.shop_orders — supabase/schema.sql).
// If Supabase isn't connected yet, or the table hasn't been created, orders are kept in this
// server's memory so the demo still works on `npm run dev` (they vanish when the server restarts).
import { supabaseAdmin } from '@/lib/supabase/admin';

const mem = globalThis.__neeksShopOrders || (globalThis.__neeksShopOrders = []);
let warned = false;
const missingTable = e => e && (e.code === '42P01' || e.code === 'PGRST205' || /shop_orders/.test(e.message || ''));

function db() {
  const sb = supabaseAdmin();
  return sb ? sb.from('shop_orders') : null;
}
function fallback(e) {
  if (!warned) { console.warn('shop_orders: using in-memory demo storage', e?.message || '(Supabase not connected)'); warned = true; }
  return null;
}

export async function insertOrder(row) {
  const t = db();
  if (t) {
    const { data, error } = await t.insert(row).select().single();
    if (!error) return { order: data, storage: 'supabase' };
    if (!missingTable(error)) throw error;
    fallback(error);
  } else fallback();
  const order = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row };
  mem.unshift(order);
  return { order, storage: 'memory' };
}

export async function listOrders() {
  const t = db();
  if (t) {
    const { data, error } = await t.select('*').order('created_at', { ascending: false }).limit(500);
    if (!error) return { orders: data || [], storage: 'supabase' };
    if (!missingTable(error)) throw error;
    fallback(error);
  }
  return { orders: mem, storage: 'memory' };
}

export async function getOrder(id) {
  const t = db();
  if (t) {
    const { data, error } = await t.select('*').eq('id', id).maybeSingle();
    if (!error) return data;
    if (!missingTable(error)) throw error;
  }
  return mem.find(o => o.id === id) || null;
}

export async function updateOrder(id, patch) {
  const t = db();
  if (t) {
    const { error } = await t.update(patch).eq('id', id);
    if (!error) return;
    if (!missingTable(error)) throw error;
  }
  const o = mem.find(x => x.id === id);
  if (o) Object.assign(o, patch);
}

export const newOrderNo = () => 'NXS-' + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
