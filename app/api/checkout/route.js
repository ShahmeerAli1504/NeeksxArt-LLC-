// Online checkout. Re-prices the cart on the server (the browser's numbers are never trusted),
// charges the card (demo mode approves everything), saves the order and emails both sides.
import { NextResponse } from 'next/server';
import { quote, fmt, needsTapLink } from '@/lib/checkout';
import { chargeCard, paymentsMode } from '@/lib/payments';
import { insertOrder, updateOrder, newOrderNo, getOrderByNo, canSaveOrders } from '@/lib/shop-orders';
import { sendEmail, table, esc, siteUrl } from '@/lib/email';
import { supabaseAdmin, BUCKETS } from '@/lib/supabase/admin';
import { needsPhotos } from '@/lib/shop-photos';
import { cleanTapUrl } from '@/lib/bundles';
import { cleanConsent, consentLine } from '@/lib/consent';

const UUID_RE = /^[0-9a-f-]{36}$/i;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** sendEmail result → 'sent' | 'failed' | 'not_configured' */
const mailStatus = r => {
  const v = r.status === 'fulfilled' ? r.value : null;
  return v?.sent ? 'sent' : v?.skipped ? 'not_configured' : 'failed';
};

const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);

/**
 * b.photos = { uploadId, lines: { [productId]: [{ path, count }] } }
 * → { byLine: { [productId]: [{ path, count }] }, total } or { error }
 * Paths must sit in this checkout's upload folder and really exist in Storage.
 */
async function checkPhotos(input, lines) {
  const want = lines.filter(l => needsPhotos(l.id));
  if (!want.length) return { byLine: {}, total: 0 };
  const sb = supabaseAdmin();
  if (!sb) return { byLine: {}, total: 0 }; // local demo without Supabase: nothing to upload to

  const uploadId = String(input?.uploadId || '');
  if (!UUID_RE.test(uploadId)) return { error: 'Please add your photos before paying.' };
  const folder = `shop/${uploadId}`;
  const { data: files, error } = await sb.storage.from(BUCKETS.uploads).list(folder, { limit: 100 });
  if (error) { console.error('list checkout photos', error); return { error: 'Could not check your photos. Please try again.' }; }
  const have = new Set((files || []).map(f => `${folder}/${f.name}`));

  const byLine = {};
  let total = 0;
  for (const l of want) {
    const list = (Array.isArray(input?.lines?.[l.id]) ? input.lines[l.id] : []).slice(0, 100)
      .map(p => ({ path: String(p?.path || ''), count: parseInt(p?.count, 10) || 0 }))
      .filter(p => p.count > 0);
    if (list.some(p => !p.path.startsWith(folder + '/') || !have.has(p.path))) return { error: 'Some photos did not finish uploading. Please try again.' };
    const pieces = list.reduce((a, p) => a + p.count, 0);
    if (pieces !== l.qty) return { error: `${l.name}: add photos for all ${l.qty} pieces (${pieces} so far).` };
    byLine[l.id] = list;
    total += list.length;
  }
  return { byLine, total };
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bad = msg => NextResponse.json({ error: msg }, { status: 400 });

export async function POST(req) {
  const started = Date.now();
  let b;
  try { b = await req.json(); } catch { return bad('Bad request'); }
  // a live server that can't save orders must not take payments (it would charge and lose the order)
  if (!canSaveOrders()) {
    console.error('checkout refused: this server has no database connection (check its environment variables)');
    return NextResponse.json({ error: 'Online ordering is down for a moment, and nothing was charged. Please try again shortly or email us.' }, { status: 503 });
  }

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

  const q = quote({ items, method, zip: address.zip, state: address.state });
  if (q.errors.length) return bad(q.errors[0]);
  if (b.expectedTotal != null && Number(b.expectedTotal) !== q.total) return bad('Prices changed — please review your order and try again.');

  // every photo product needs one uploaded photo per piece (checked before the card is charged)
  const photos = await checkPhotos(b.photos, q.lines);
  if (photos.error) return bad(photos.error);

  // Tap-to-Connect lines need the link we program into their NFC chips
  const tapLinks = {};
  for (const l of q.lines.filter(l => needsTapLink(l.id))) {
    const url = cleanTapUrl(b.tapLinks?.[l.id]);
    if (!url) return bad(`Add a valid tap link for ${l.name}.`);
    tapLinks[l.id] = url;
  }
  // photo permissions (social media + children in the photos), required whenever photos are printed
  const consent = cleanConsent(b.consent);
  if (q.lines.some(l => needsPhotos(l.id)) && !consent) return bad('Please answer both photo permission questions.');

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
    // photo permissions ride with the customer: { social, minor } (no schema change)
    customer: consent ? { ...customer, consent } : customer,
    fulfillment: { method, label: q.delivery.label, address, explain: q.delivery.explain },
    // photos ride on their line: [{ path, count }] in the private customer-uploads bucket; TTC lines carry their tap link
    items: q.lines.map(l => ({
      ...l,
      ...(photos.byLine[l.id] ? { photos: photos.byLine[l.id] } : {}),
      ...(tapLinks[l.id] ? { tapUrl: tapLinks[l.id] } : {})
    })),
    tax_label: q.tax.label,
    amounts: {
      subtotal: q.subtotal, delivery: q.delivery.amount, tax: q.tax.amount, tax_rate: q.tax.rate, tax_explain: q.tax.explain,
      total: q.total, plan: q.plan, paid: q.dueNow, balance: q.balance, fees: q.fee.amount, net: q.net
    },
    payments: [{ kind: 'charge', id: charge.id, amount: q.dueNow, fee: q.fee.amount, brand: charge.brand, last4: charge.last4, status: charge.status, receipt_url: charge.receiptUrl, at: now, demo: !!charge.demo }],
    note: clean(b.note, 500)
  };

  // emails (skipped quietly if SMTP isn't configured)
  const rows = [
    ...q.lines.map(l => [`${l.qty} × ${l.name}`, fmt(l.totalCents)]),
    ['Subtotal', fmt(q.subtotal)], [q.delivery.label, q.delivery.amount ? fmt(q.delivery.amount) : 'Free'],
    [`Sales tax (${q.tax.label})`, fmt(q.tax.amount)], ['Total', fmt(q.total)], ['Paid today', `${fmt(q.dueNow)} · ${charge.brand} •••• ${charge.last4}`],
    ...(q.balance ? [['Balance due', fmt(q.balance)]] : [])
  ];
  const demoNote = charge.demo ? '<p style="color:#c9521b"><b>DEMO ORDER — no card was charged.</b></p>' : '';
  const tapHtml = Object.keys(tapLinks).length
    ? `<p><b>Tap links (program the NFC chips):</b><br>${q.lines.filter(l => tapLinks[l.id]).map(l => `${esc(l.name)}: <a href="${esc(tapLinks[l.id])}">${esc(tapLinks[l.id])}</a>`).join('<br>')}</p>` : '';
  const consentHtml = consent ? `<p><b>${esc(consentLine(consent))}</b></p>` : '';
  const ownerHtml = `${demoNote}<h2>${esc(orderNo)}</h2><p>${esc(customer.name)} · ${esc(customer.email)} ${esc(customer.phone)}</p>${table(rows)}
             <p><b>${esc(q.delivery.label)}</b>${address ? `<br>${esc(address.line1)} ${esc(address.line2)}<br>${esc(address.city)}, ${esc(address.state)} ${esc(address.zip)}` : ''}</p>
             ${tapHtml}${consentHtml}
             <p>Square fee ${fmt(q.fee.amount)} · Net ${fmt(q.net)}</p>${row.note ? `<p>Note: ${esc(row.note)}</p>` : ''}`;

  // save the order; a hiccup gets two more tries. The card is already charged at this point, so if it
  // still fails the owner gets the whole order by email (photo paths included) and nothing is lost.
  let saved, saveErr;
  for (let attempt = 1; attempt <= 3 && !saved; attempt++) {
    try { saved = await insertOrder(row); }
    catch (e) {
      saveErr = e;
      // a retry that hits "duplicate order number" means an earlier try did save (only its reply was lost)
      if (attempt > 1 && e?.code === '23505') {
        const existing = await getOrderByNo(orderNo).catch(() => null);
        if (existing) { saved = { order: existing, storage: 'supabase' }; break; }
      }
      console.error(`save shop order ${orderNo} (attempt ${attempt})`, e?.code || '', e?.message || e, e?.details || '', e?.hint || '');
      if (attempt < 3) await new Promise(r => setTimeout(r, 400 * attempt));
    }
  }
  if (!saved) {
    const why = [saveErr?.code, saveErr?.message, saveErr?.details, saveErr?.hint].filter(Boolean).join(' · ') || String(saveErr);
    const photoList = Object.values(photos.byLine).flat().map(p => `${esc(p.path)} × ${p.count}`).join('<br>');
    const rescue = await sendEmail({
      subject: `${charge.demo ? '[DEMO] ' : ''}ACTION NEEDED: online order ${orderNo} was paid but NOT saved`,
      replyTo: customer.email,
      html: `<p style="color:#b91c1c"><b>The card was charged (${esc(charge.id)}) but the order could not be saved to the dashboard.</b> Everything you need to make it is below.</p>
             <p>Database error: <code>${esc(why)}</code></p>${ownerHtml}
             ${photoList ? `<p><b>Photos</b> (Supabase → Storage → customer-uploads):<br>${photoList}</p>` : ''}`
    }).catch(e => { console.error('rescue email', orderNo, e); return null; });
    const told = !!rescue?.sent;
    console.error('checkout', orderNo, 'NOT SAVED', `rescue_email=${told ? 'sent' : 'failed'}`, why);
    return NextResponse.json({
      error: told
        ? `Your payment went through and we received your order (${orderNo}), but our system hiccupped saving it. No need to pay again: we'll email you to confirm.`
        : `Payment went through but we could not save the order. Please don't pay again; contact us with ${orderNo}.`
    }, { status: 500 });
  }

  const [ownerMail, customerMail] = await Promise.allSettled([
    sendEmail({
      subject: `${charge.demo ? '[DEMO] ' : ''}New online order ${orderNo} — ${fmt(q.dueNow)} paid`,
      replyTo: customer.email,
      html: `${ownerHtml}
             ${photos.total ? `<p><b>${photos.total} photo${photos.total === 1 ? '' : 's'} uploaded.</b> <a href="${siteUrl()}/admin/payments">Open Dashboard → Payments</a> to see them and download the print sheet.</p>` : ''}`
    }),
    sendEmail({
      to: customer.email, fromName: 'NeeksxArt',
      subject: `Your NeeksxArt order ${orderNo}`,
      html: `${demoNote}<p>Hi ${esc(customer.name.split(' ')[0])}, thanks for your order! ${photos.total ? 'We print exactly the photos you uploaded and cropped, and we' : 'We'}'ll let you know when it's on the way.</p>${table(rows)}${tapHtml}${consentHtml}`
    })
  ]);

  // record on the order whether each email actually went out (shown on Dashboard → Payments)
  const at = new Date().toISOString();
  const emails = {
    owner: { status: mailStatus(ownerMail), at },
    customer: { status: mailStatus(customerMail), to: customer.email, at }
  };
  saved.order.emails = emails;
  // own column first; if the database can't take it (column missing / API schema cache not reloaded),
  // keep it inside the fulfillment record, which every order already has
  try { await updateOrder(saved.order.id, { emails }); }
  catch (e) {
    console.error('save email status (emails column)', orderNo, e?.code || '', e?.message || e);
    try { await updateOrder(saved.order.id, { fulfillment: { ...row.fulfillment, emails } }); }
    catch (e2) { console.error('save email status (fulfillment)', orderNo, e2?.code || '', e2?.message || e2); }
  }
  console.log('checkout', orderNo, `saved=${saved.storage}`, `owner_email=${emails.owner.status}`, `customer_email=${emails.customer.status}`, `${Date.now() - started}ms`);

  return NextResponse.json({ ok: true, mode: paymentsMode(), storage: saved.storage, order: saved.order });
}
