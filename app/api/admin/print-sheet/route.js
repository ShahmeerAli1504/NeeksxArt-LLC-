// Print-ready PDF sheets with the customer's images already placed on the press templates.
//   /api/admin/print-sheet?shop=<shop_orders.id>[&line=<productId>] → online order: each photo × its piece count
//   /api/admin/print-sheet?order=<event_orders.id>                → pop-up order: every photo in its slot, in order #1, #2… (order number in the margin + file name)
//   /api/admin/print-sheet?inquiry=<inquiries.id>&kind=round|magnet → the uploaded logo repeated across a full sheet
// Staff only.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, BUCKETS } from '@/lib/supabase/admin';
import { buildPrintSheet, pieceKind, SHEETS } from '@/lib/print-sheet';
import { photoSpec } from '@/lib/shop-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const UUID_RE = /^[0-9a-f-]{36}$/i;
const safeName = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'sheet';
const fail = (msg, status = 400) => new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

async function download(sb, bucket, path) {
  const { data, error } = await sb.storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Could not download ${path}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function GET(req) {
  if (!(await isAdmin())) return fail('Unauthorized', 401);
  const sb = supabaseAdmin();
  if (!sb) return fail('Supabase is not connected', 503);

  const q = new URL(req.url).searchParams;
  const orderId = q.get('order'), inquiryId = q.get('inquiry'), shopId = q.get('shop');
  let pdf, filename;

  try {
    if (shopId) {
      // online order: each photo repeated as many times as the customer asked, line by line
      if (!UUID_RE.test(shopId)) return fail('Bad order id');
      const { data: o, error } = await sb.from('shop_orders').select('order_no, customer, items').eq('id', shopId).maybeSingle();
      if (error || !o) return fail('Order not found', 404);
      const only = q.get('line');
      const lines = (o.items || []).filter(l => l.photos?.length && photoSpec(l.id)?.sheet && (!only || l.id === only));
      if (!lines.length) return fail('This order has no photos on a size we have a print template for', 404);

      const pieces = [];
      for (const l of lines) {
        const kind = photoSpec(l.id).sheet;
        const images = await Promise.all(l.photos.map(p => download(sb, BUCKETS.uploads, p.path)));
        l.photos.forEach((p, i) => { for (let n = 0; n < p.count; n++) pieces.push({ image: images[i], kind, key: p.path }); });
      }
      const who = o.customer?.name || '';
      pdf = await buildPrintSheet({
        pieces, fit: 'photo', title: `${o.order_no} · ${who}`,
        label: { main: o.order_no, sub: [who, lines.map(l => `${l.qty} × ${l.name}`).join(', ')].filter(Boolean).join(' · ') }
      });
      filename = `${safeName(o.order_no)}-${safeName(who)}${only ? '-' + safeName(only) : ''}-print-sheet.pdf`;
    } else if (orderId) {
      if (!UUID_RE.test(orderId)) return fail('Bad order id');
      const { data: o, error } = await sb.from('event_orders')
        .select('order_id, name, bundle, items, shape, photo_paths, event_name').eq('id', orderId).maybeSingle();
      if (error || !o) return fail('Order not found', 404);
      const paths = o.photo_paths || [];
      if (!paths.length) return fail('This order has no photos', 404);

      // only the photos whose size has a press template (1.5" keychains don't yet)
      const slots = paths.map((p, i) => ({ p, kind: pieceKind((o.items || [])[i], o.shape) })).filter(s => s.kind);
      if (!slots.length) return fail('No print template yet for this size. Download the photos one by one.', 404);
      const images = await Promise.all(slots.map(s => download(sb, BUCKETS.events, s.p)));
      const pieces = images.map((image, i) => ({ image, kind: slots[i].kind }));
      pdf = await buildPrintSheet({
        pieces, fit: 'photo', title: `${o.order_id} · ${o.name || ''} · ${o.bundle || ''}`,
        label: { main: o.order_id, sub: [o.name, o.bundle].filter(Boolean).join(' · ') }
      });
      filename = `${safeName(o.order_id)}-${safeName(o.name)}-print-sheet.pdf`;
    } else if (inquiryId) {
      if (!UUID_RE.test(inquiryId)) return fail('Bad inquiry id');
      const kind = q.get('kind') === 'magnet' ? 'magnet' : 'round';
      const { data: r, error } = await sb.from('inquiries').select('name, business, logo_path').eq('id', inquiryId).maybeSingle();
      if (error || !r) return fail('Inquiry not found', 404);
      if (!r.logo_path) return fail('This inquiry has no logo', 404);

      const image = await download(sb, BUCKETS.uploads, r.logo_path);
      const who = r.business || r.name || '';
      const pieces = Array.from({ length: SHEETS[kind].perSheet }, () => ({ image, kind, key: 'logo' }));
      pdf = await buildPrintSheet({ pieces, fit: 'logo', title: `${who} · logo`, label: who ? { main: who } : null });
      filename = `${safeName(who)}-logo-${kind === 'magnet' ? 'magnets' : 'keychains'}.pdf`;
    } else {
      return fail('Pass ?shop=, ?order= or ?inquiry=');
    }
  } catch (e) {
    console.error('print sheet', e);
    return fail(`Could not build the sheet: ${e.message}`, 500);
  }

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store'
    }
  });
}
