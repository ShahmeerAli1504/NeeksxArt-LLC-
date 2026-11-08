import 'server-only';
/*
 * Card payments.
 *   PAYMENTS_MODE=demo (default) → every card is approved, nothing is charged.
 *   PAYMENTS_MODE=square         → real charge through Square's Payments API.
 *
 * Going live with Square:
 *   1. Square Developer Dashboard → create an application → copy the Access token + Location ID
 *      (start with the Sandbox ones).
 *   2. Env vars: PAYMENTS_MODE=square, SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID,
 *      SQUARE_ENV=sandbox|production, NEXT_PUBLIC_SQUARE_APP_ID, NEXT_PUBLIC_SQUARE_LOCATION_ID
 *   3. In components/shop/Checkout.jsx, replace the demo card inputs with Square's Web Payments SDK
 *      card element and send `await card.tokenize()` → token as payment.sourceId.
 * Everything else (pricing, delivery, admin) already works the same.
 */
import { randomUUID } from 'node:crypto';

export const paymentsMode = () => (process.env.PAYMENTS_MODE === 'square' ? 'square' : 'demo');

/** → { ok, id, status, brand, last4, receiptUrl, demo } or { ok: false, error } */
export async function chargeCard({ sourceId, amountCents, orderNo, email, note, brand, last4 }) {
  if (paymentsMode() === 'demo') {
    await new Promise(r => setTimeout(r, 600)); // feel like a real round trip
    return { ok: true, demo: true, id: 'sq_demo_' + randomUUID().replace(/-/g, '').slice(0, 20), status: 'COMPLETED', brand, last4, receiptUrl: null };
  }

  const base = process.env.SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
  const res = await fetch(`${base}/v2/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2025-01-23'
    },
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      source_id: sourceId,
      amount_money: { amount: amountCents, currency: 'USD' },
      location_id: process.env.SQUARE_LOCATION_ID,
      reference_id: orderNo,
      buyer_email_address: email || undefined,
      note: note?.slice(0, 500)
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.payment) return { ok: false, error: data.errors?.[0]?.detail || 'The card was declined.' };
  const p = data.payment;
  return { ok: true, demo: false, id: p.id, status: p.status, brand: p.card_details?.card?.card_brand || brand, last4: p.card_details?.card?.last_4 || last4, receiptUrl: p.receipt_url || null };
}

/** demo refund / balance collection (real Square versions use /v2/refunds and a stored card or invoice) */
export async function demoTransaction(prefix = 'sq_demo_') {
  return prefix + randomUUID().replace(/-/g, '').slice(0, 20);
}
