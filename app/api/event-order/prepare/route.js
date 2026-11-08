// Live pop-up step 1: reserve an order number and hand back one-time upload links,
// so the guest's phone uploads photos straight to Supabase Storage (no 4.5 MB request limit).
import { NextResponse } from 'next/server';
import { supabaseAdmin, BUCKETS } from '@/lib/supabase/admin';
import { POPUP } from '@/lib/bundles';
import { emailConfigured } from '@/lib/email';
import { getPopup } from '@/lib/popup';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const makeOrderId = () => {
  const n = Math.floor(100 + Math.random() * 900);
  const l = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
  return `${POPUP.orderPrefix}-${n}${l}`;
};
const ID_RE = new RegExp(`^${POPUP.orderPrefix}-\\d{3}[A-Z]$`);

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { b = {}; }
  const count = Math.round(Number(b?.count));
  if (!(count >= 1 && count <= 12)) return NextResponse.json({ ok: false, error: 'Bad photo count' }, { status: 400 });
  // only while a pop-up is live (staff can still run a preview order)
  const popup = await getPopup();
  if (!popup.live && !(await isAdmin())) return NextResponse.json({ ok: false, error: 'Live ordering is closed. It opens during NeeksxArt pop-up events.' }, { status: 403 });
  const eventSlug = popup.live ? popup.slug : 'preview';
  let orderId = ID_RE.test(b?.orderId || '') ? b.orderId : makeOrderId();

  const sb = supabaseAdmin();
  if (!sb) {
    // No Supabase yet: photos go straight into the owner's email instead of Storage
    if (emailConfigured()) return NextResponse.json({ ok: true, mode: 'email', orderId, reservation: null });
    if (process.env.EVENT_REQUIRE_LIVE === '1') return NextResponse.json({ ok: false, error: 'Ordering is not configured' }, { status: 500 });
    return NextResponse.json({ ok: true, mode: 'demo', demo: true, orderId, reservation: null }); // demo mode for showing the flow
  }

  // reserve a number that's unique for this event
  let row = null;
  for (let i = 0; i < 6 && !row; i++) {
    const { data, error } = await sb.from('event_orders')
      .insert({ order_id: orderId, event_slug: eventSlug, status: 'uploading' })
      .select('order_id, token').single();
    if (!error) row = data;
    else if (error.code === '23505') orderId = makeOrderId();
    else { console.error('reserve order', error); break; }
  }
  if (!row) return NextResponse.json({ ok: false, error: 'Could not start the order' }, { status: 500 });

  const folder = `${eventSlug}/${row.order_id}`;
  const sign = async path => {
    const { data, error } = await sb.storage.from(BUCKETS.events).createSignedUploadUrl(path, { upsert: true });
    if (error) throw error;
    return { path: data.path || path, token: data.token };
  };
  try {
    const uploads = await Promise.all(Array.from({ length: count }, (_, i) => sign(`${folder}/${String(i + 1).padStart(2, '0')}.jpg`)));
    const sheet = await sign(`${folder}/overview.jpg`);
    return NextResponse.json({ ok: true, mode: 'storage', orderId: row.order_id, reservation: row.token, bucket: BUCKETS.events, uploads, sheet });
  } catch (e) {
    console.error('signed upload urls', e);
    return NextResponse.json({ ok: false, error: 'Storage is not ready' }, { status: 500 });
  }
}
