// Print-ready PDF sheets with the customer's images already placed on the press templates.
//   /api/admin/print-sheet?order=<event_orders.id>                 → pop-up order: every photo in its slot, in order #1, #2… (order number in the margin + file name)
//   /api/admin/print-sheet?inquiry=<inquiries.id>&kind=round|magnet → the uploaded logo repeated across a full sheet
// Staff only.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, BUCKETS } from '@/lib/supabase/admin';
import { buildPrintSheet, pieceKind, SHEETS } from '@/lib/print-sheet';

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
  const orderId = q.get('order'), inquiryId = q.get('inquiry');
  let pdf, filename;

  try {
    if (orderId) {
      if (!UUID_RE.test(orderId)) return fail('Bad order id');
      const { data: o, error } = await sb.from('event_orders')
        .select('order_id, name, bundle, items, shape, photo_paths, event_name').eq('id', orderId).maybeSingle();
      if (error || !o) return fail('Order not found', 404);
      const paths = o.photo_paths || [];
      if (!paths.length) return fail('This order has no photos', 404);

      const images = await Promise.all(paths.map(p => download(sb, BUCKETS.events, p)));
      const pieces = images.map((image, i) => ({
        image, kind: pieceKind((o.items || [])[i], o.shape)
      }));
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
      return fail('Pass ?order= or ?inquiry=');
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
