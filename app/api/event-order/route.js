// Live pop-up step 2: confirm the order and email it to the owner with every photo attached.
//   storage mode: photos are already in Supabase Storage → saved to `event_orders` (shows on /admin),
//                 then downloaded and attached to the email.
//   email mode:   Supabase isn't connected → the phone sends the cropped photos here and they go
//                 straight into the email (Gmail SMTP).
import { NextResponse } from 'next/server';
import { supabaseAdmin, BUCKETS, decodeDataUrl } from '@/lib/supabase/admin';
import { sendEmail, emailConfigured, siteUrl } from '@/lib/email';
import { orderEmail, receivedAt } from '@/lib/email-templates';
import { getPopup } from '@/lib/popup';
import { BUNDLES, cleanTapUrl } from '@/lib/bundles';
import { withTax } from '@/lib/popup-tax';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { b = {}; }
  b = b || {};
  const name = clean(b.name, 60);
  const orderId = clean(b.orderId, 20);
  if (!orderId || !name) return NextResponse.json({ ok: false, error: 'Missing order details' }, { status: 400 });

  const popup = await getPopup();
  if (!popup.live && !(await isAdmin())) return NextResponse.json({ ok: false, error: 'Live ordering is closed. It opens during NeeksxArt pop-up events.' }, { status: 403 });

  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 12).map(x => clean(x, 20));
  const pack = BUNDLES.find(x => x.id === clean(b.bundleId, 30));
  // Tap-to-Connect packs: the link to program into the NFC chips is required
  const tapUrl = pack?.tap ? cleanTapUrl(b.tapUrl) : '';
  if (pack?.tap && !tapUrl) return NextResponse.json({ ok: false, error: 'Add a valid tap link (the website or profile the keychains should open).' }, { status: 400 });
  const note = clean(b.note, 500);
  const details = {
    event_name: popup.live ? popup.name : 'Preview',
    event_slug: popup.live ? popup.slug : 'preview',
    bundle: clean(b.bundle, 80),
    bundle_id: clean(b.bundleId, 30),
    items,
    shape: clean(b.shape, 20),
    // priced here from the pack list + this pop-up's tax rate, never from the phone
    price: withTax(pack?.price, popup.taxRate)?.line || null,
    name,
    phone: clean(b.phone, 40) || null,
    email: clean(b.email, 120) || null,
    // the tap link rides in the note so it shows on the order board without a schema change
    note: (tapUrl ? `Tap link: ${tapUrl}${note ? ' | ' + note : ''}` : note) || null
  };

  const sb = supabaseAdmin();

  /* ---------------- email-only mode (no Supabase) ---------------- */
  if (!sb) {
    if (b.mode !== 'email' || !emailConfigured()) {
      if (process.env.EVENT_REQUIRE_LIVE === '1') return NextResponse.json({ ok: false, error: 'Ordering is not configured' }, { status: 500 });
      return NextResponse.json({ ok: true, demo: true });
    }
    const photos = (Array.isArray(b.photoData) ? b.photoData : []).slice(0, 12).map(decodeDataUrl);
    if (!photos.length || photos.some(p => !p)) return NextResponse.json({ ok: false, error: 'Missing photos' }, { status: 400 });
    const sheet = decodeDataUrl(b.sheetData);
    const mail = await emailOrder({ orderId, details, photos: photos.map(p => p.buffer), sheet: sheet?.buffer, boardLink: false, tapUrl });
    if (!mail.sent) return NextResponse.json({ ok: false, error: 'Could not email the order' }, { status: 502 });
    return NextResponse.json({ ok: true, emailed: true });
  }

  /* ---------------- storage mode ---------------- */
  if (!UUID_RE.test(b.reservation || '')) return NextResponse.json({ ok: false, error: 'Missing reservation' }, { status: 400 });

  const { data: order, error: findErr } = await sb.from('event_orders')
    .select('id, order_id, event_slug, token, status')
    .eq('order_id', orderId).eq('token', b.reservation).maybeSingle();
  if (findErr || !order) return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
  if (order.status !== 'uploading') return NextResponse.json({ ok: true, token: order.token }); // already confirmed (double tap)

  // only accept files inside this order's folder, and make sure they really were uploaded
  const folder = `${order.event_slug}/${order.order_id}`;
  const photoPaths = (Array.isArray(b.photos) ? b.photos : []).slice(0, 12).map(String).filter(p => p.startsWith(folder + '/'));
  const sheetPath = typeof b.sheet === 'string' && b.sheet.startsWith(folder + '/') ? b.sheet : null;
  const { data: files } = await sb.storage.from(BUCKETS.events).list(folder, { limit: 50 });
  const have = new Set((files || []).map(f => `${folder}/${f.name}`));
  if (!photoPaths.length || photoPaths.some(p => !have.has(p))) {
    return NextResponse.json({ ok: false, error: 'Photos did not finish uploading' }, { status: 400 });
  }

  const { event_slug, ...rest } = details;
  const update = {
    ...rest,
    status: 'new',
    submitted_at: new Date().toISOString(),
    photo_paths: photoPaths,
    sheet_path: sheetPath && have.has(sheetPath) ? sheetPath : null
  };
  const { error: upErr } = await sb.from('event_orders').update(update).eq('id', order.id);
  if (upErr) {
    console.error('confirm order', upErr);
    return NextResponse.json({ ok: false, error: 'Could not save the order' }, { status: 500 });
  }

  // download the print files from Storage and attach them
  if (process.env.EVENT_EMAILS !== 'off' && emailConfigured()) {
    const download = async path => {
      if (!path) return null;
      const { data, error } = await sb.storage.from(BUCKETS.events).download(path);
      if (error || !data) { console.error('download', path, error); return null; }
      return Buffer.from(await data.arrayBuffer());
    };
    const [sheet, ...photos] = await Promise.all([download(update.sheet_path), ...photoPaths.map(download)]);
    const mail = await emailOrder({ orderId, details: { ...details, event_slug: order.event_slug }, photos, sheet, boardLink: true, tapUrl });
    if (!mail.sent) console.error('order saved but the email failed', orderId);
  }

  return NextResponse.json({ ok: true, token: order.token });
}

/** One email per order: photos shown inside the email + attached full-size as print files. */
async function emailOrder({ orderId, details: d, photos, sheet, boardLink, tapUrl }) {
  const present = photos.map((p, i) => ({ p, i })).filter(x => x.p);
  const attachments = [];
  // shown inside the email
  present.forEach(({ p }, n) => attachments.push({ filename: `photo-${n + 1}.jpg`, content: p, contentType: 'image/jpeg', cid: `photo${n + 1}` }));
  if (sheet) attachments.push({ filename: `${orderId}-overview.jpg`, content: sheet, contentType: 'image/jpeg', cid: 'overview' });
  // print files, as regular attachments
  present.forEach(({ p, i }) => attachments.push({
    filename: `${orderId}-${String(i + 1).padStart(2, '0')}-${d.items[i] || 'photo'}.jpg`, content: p, contentType: 'image/jpeg'
  }));

  const { subject, html } = orderEmail(
    { orderId, event: d.event_name, bundle: d.bundle, price: d.price, tapUrl, name: d.name, phone: d.phone, email: d.email,
      note: d.note, items: present.map(x => d.items[x.i] || 'photo'), shape: d.shape, receivedAt: receivedAt() },
    { photoCount: present.length, hasSheet: !!sheet, boardUrl: boardLink ? `${siteUrl()}/admin?event=${encodeURIComponent(d.event_slug)}` : null }
  );
  return sendEmail({ to: process.env.EVENT_TO_EMAIL || undefined, fromName: 'NeeksxArt Live', subject, html, replyTo: d.email || undefined, attachments });
}
