import 'server-only';
// "Needs attention" counts for the dashboard tabs: anything still in its first status.
import { supabaseAdmin } from '@/lib/supabase/admin';

const COUNTS = {
  orders:    sb => sb.from('event_orders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  inquiries: sb => sb.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  reviews:   sb => sb.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  payments:  sb => sb.from('shop_orders').select('id', { count: 'exact', head: true }).eq('status', 'new').neq('payment_status', 'refunded')
};

/** → { orders, inquiries, reviews, payments } (0 when a table is missing or Supabase isn't connected) */
export async function adminCounts() {
  const sb = supabaseAdmin();
  const keys = Object.keys(COUNTS);
  if (!sb) return Object.fromEntries(keys.map(k => [k, 0]));
  const res = await Promise.all(keys.map(k => COUNTS[k](sb).then(r => (r.error ? 0 : r.count || 0), () => 0)));
  return Object.fromEntries(keys.map((k, i) => [k, res[i]]));
}
