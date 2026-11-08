'use server';
// Dashboard actions for online shop orders (/admin/payments).
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrder, updateOrder } from '@/lib/shop-orders';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CHECKOUT } from '@/lib/checkout';
import { demoTransaction } from '@/lib/payments';

const STATUSES = ['new', 'in_production', 'ready', 'completed', 'cancelled'];
const done = () => revalidatePath('/admin/payments');

export async function setShopStatus(formData) {
  await requireAdmin();
  const status = String(formData.get('status') || '');
  if (!STATUSES.includes(status)) return;
  await updateOrder(String(formData.get('id')), { status });
  done();
}

/** customer pays the remaining balance on a deposit order (demo: approved instantly) */
export async function collectBalance(formData) {
  await requireAdmin();
  const o = await getOrder(String(formData.get('id')));
  if (!o || o.payment_status !== 'deposit' || !(o.amounts?.balance > 0)) return;
  const amt = o.amounts.balance;
  const fee = Math.round(amt * CHECKOUT.square.pct) + CHECKOUT.square.fixedCents;
  const card = (o.payments || [])[0] || {};
  const payments = [...(o.payments || []), { kind: 'balance', id: await demoTransaction(), amount: amt, fee, brand: card.brand, last4: card.last4, at: new Date().toISOString(), demo: true }];
  const paid = o.amounts.paid + amt, fees = o.amounts.fees + fee;
  await updateOrder(o.id, { payment_status: 'paid', payments, amounts: { ...o.amounts, paid, balance: 0, fees, net: paid - fees } });
  done();
}

/** full refund of everything collected (demo). Square keeps its processing fees, so net becomes −fees. */
export async function refundOrder(formData) {
  await requireAdmin();
  const o = await getOrder(String(formData.get('id')));
  if (!o || o.payment_status === 'refunded') return;
  const amt = o.amounts.paid;
  const payments = [...(o.payments || []), { kind: 'refund', id: await demoTransaction('sq_demo_rf_'), amount: -amt, fee: 0, at: new Date().toISOString(), demo: true }];
  await updateOrder(o.id, {
    payment_status: 'refunded', status: 'cancelled', payments,
    amounts: { ...o.amounts, refunded: amt, balance: 0, net: -o.amounts.fees }
  });
  done();
}

/** wipe test orders before showing the client (only rows marked demo) */
export async function deleteDemoOrders() {
  await requireAdmin();
  const sb = supabaseAdmin();
  if (sb) await sb.from('shop_orders').delete().eq('demo', true);
  const mem = globalThis.__neeksShopOrders;
  if (mem) mem.splice(0, mem.length, ...mem.filter(o => !o.demo));
  done();
}
