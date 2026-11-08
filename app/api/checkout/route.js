// Online checkout. Re-prices the cart on the server (the browser's numbers are never trusted),
// charges the card (demo mode approves everything), saves the order and emails both sides.
import { NextResponse } from 'next/server';
import { quote, fmt } from '@/lib/checkout';
import { chargeCard, paymentsMode } from '@/lib/payments';
import { insertOrder, newOrderNo } from '@/lib/shop-orders';
import { sendEmail, table, esc } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bad = msg => NextResponse.json({ error: msg }, { status: 400 });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Bad request'); }

  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50).map(i => ({ id: clean(i.id, 40), qty: parseInt(i.qty, 10) || 0 })).filter(i => i.qty > 0);
  if (!items.length) return bad('Your cart is empty.');
  const method = b.method === 'delivery' ? 'delivery' : 'shipping';
  const customer = { name: clean(b.customer?.name, 120), email: clean(b.customer?.email, 160).toLowerCase(), phone: clean(b.customer?.phone, 40) };
  if (!customer.name) return bad('Please enter your name.');
  if (!EMAIL_RE.test(customer.email)) return bad('Please enter a valid email.');
  const address = {
    line1: clean(b.address?.line1), line2: clean(b.address?.line2), city: clean(b.address?.city, 80),
    state: clean(b.address?.state, 2).toUpperCase(), zip: clean(b.address?.zip, 10)
  };
  if (!address.line1 || !address.city || !address.zip) return bad('Please complete your address.');

  const q = quote({ items, method, zip: address.zip, state: address.state, plan: b.plan });
  if (q.errors.length) return bad(q.errors[0]);
  if (b.expectedTotal != null && Number(b.expectedTotal) !== q.total) return bad('Prices changed — please review your order and try again.');

  const pay = b.payment || {};
  if (!pay.sourceId) return bad('Missing card details.');
  const orderNo = newOrderNo();
  const charge = await chargeCard({
    sourceId: clean(pay.sourceId, 200), amountCents: q.dueNow, orderNo, email: customer.email,
    note: `${orderNo} · ${q.lines.map(l => `${l.qty}x ${l.name}`).join(', ')}`,
    brand: clean(pay.brand, 30), last4: clean(pay.last4, 4).replace(/\D/g, '')
  });
  if (!charge.ok) return NextResponse.json({ error: charge.error }, { status: 402 });

  const now = new Date().toISOString();
  const row = {
    order_no: orderNo,
    status: 'new',
    payment_status: q.balance > 0 ? 'deposit' : 'paid',
    demo: !!charge.demo,
    customer,
    fulfillment: { method, label: q.delivery.label, address, explain: q.delivery.explain },
    items: q.lines,
    tax_label: q.tax.label,
    amounts: {
      subtotal: q.subtotal, delivery: q.delivery.amount, tax: q.tax.amount, tax_rate: q.tax.rate, tax_explain: q.tax.explain,
      total: q.total, plan: q.plan, paid: q.dueNow, balance: q.balance, fees: q.fee.amount, net: q.net
    },
    payments: [{ kind: 'charge', id: charge.id, amount: q.dueNow, fee: q.fee.amount, brand: charge.brand, last4: charge.last4, status: charge.status, receipt_url: charge.receiptUrl, at: now, demo: !!charge.demo }],
    note: clean(b.note, 500)
  };

  let saved;
  try { saved = await insertOrder(row); }
  catch (e) {
    console.error('save shop order', e);
    return NextResponse.json({ error: 'Payment went through but we could not save the order. Please contact us with ' + orderNo }, { status: 500 });
  }

  // emails (skipped quietly if SMTP isn't configured)
  const rows = [
    ...q.lines.map(l => [`${l.qty} × ${l.name}`, fmt(l.totalCents)]),
    ['Subtotal', fmt(q.subtotal)], [q.delivery.label, q.delivery.amount ? fmt(q.delivery.amount) : 'Free'],
    [`Sales tax (${q.tax.label})`, fmt(q.tax.amount)], ['Total', fmt(q.total)], ['Paid today', `${fmt(q.dueNow)} · ${charge.brand} •••• ${charge.last4}`],
    ...(q.balance ? [['Balance due', fmt(q.balance)]] : [])
  ];
  const demoNote = charge.demo ? '<p style="color:#c9521b"><b>DEMO ORDER — no card was charged.</b></p>' : '';
  await Promise.allSettled([
    sendEmail({
      subject: `${charge.demo ? '[DEMO] ' : ''}New online order ${orderNo} — ${fmt(q.dueNow)} paid`,
      replyTo: customer.email,
      html: `${demoNote}<h2>${esc(orderNo)}</h2><p>${esc(customer.name)} · ${esc(customer.email)} ${esc(customer.phone)}</p>${table(rows)}
             <p><b>${esc(q.delivery.label)}</b>${address ? `<br>${esc(address.line1)} ${esc(address.line2)}<br>${esc(address.city)}, ${esc(address.state)} ${esc(address.zip)}` : ''}</p>
             <p>Square fee ${fmt(q.fee.amount)} · Net ${fmt(q.net)}</p>${row.note ? `<p>Note: ${esc(row.note)}</p>` : ''}`
    }),
    sendEmail({
      to: customer.email, fromName: 'NeeksxArt',
      subject: `Your NeeksxArt order ${orderNo}`,
      html: `${demoNote}<p>Hi ${esc(customer.name.split(' ')[0])}, thanks for your order! We'll email your free mockup to approve before anything is printed.</p>${table(rows)}`
    })
  ]);

  return NextResponse.json({ ok: true, mode: paymentsMode(), storage: saved.storage, order: saved.order });
}
